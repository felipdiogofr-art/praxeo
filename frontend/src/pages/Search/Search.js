import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocation } from '../../contexts/LocationContext';
import LocationInput from '../../components/LocationInput/LocationInput';
import SearchFilters from '../../components/SearchFilters/SearchFilters';
import SearchSort from '../../components/SearchSort/SearchSort';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductService from '../../services/product.service';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const locationParam = searchParams.get('location') || '';
  const { location, setLocationByCEP } = useLocation();

  // Estado para produtos e filtros
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Se houver um CEP nos parâmetros da URL, tenta definir a localização
  useEffect(() => {
    if (locationParam && !location?.cep) {
      const cepFromParam = locationParam.replace(/\D/g, '');
      if (cepFromParam.length === 8) {
        setLocationByCEP(cepFromParam).catch(() => {
          // Ignora erros silenciosamente se o CEP não for válido
        });
      }
    }
  }, [locationParam, location, setLocationByCEP]);

  /**
   * Busca produtos na API com os filtros aplicados
   */
  const fetchProducts = useCallback(async (appliedFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Preparar filtros para a API
      const apiFilters = {
        ...appliedFilters,
      };

      // Adicionar termo de busca se houver
      if (query) {
        apiFilters.search = query;
      }

      // Adicionar coordenadas se houver localização
      if (location?.lat && location?.lng) {
        apiFilters.lat = location.lat;
        apiFilters.lng = location.lng;
      }

      // Adicionar raio se não especificado mas houver localização
      if (!apiFilters.radius && location?.lat && location?.lng) {
        apiFilters.radius = appliedFilters.maxDistance || 10;
      }

      // Adicionar ordenação
      apiFilters.sortBy = sortBy;
      apiFilters.order = sortOrder;

      // Buscar produtos
      const response = await ProductService.getProducts(apiFilters);
      
      // A resposta pode ter diferentes formatos dependendo do backend
      const responseData = response.data || response;
      const productsData = responseData.products || responseData.data || responseData;
      const total = responseData.pagination?.total || responseData.total || (Array.isArray(productsData) ? productsData.length : 0);

      // Mapear produtos da API para o formato esperado pelo ProductCard
      let mappedProducts = Array.isArray(productsData) ? productsData.map(product => {
        // Calcular distância formatada
        let distanceFormatted = 'N/A';
        if (product.distance !== null && product.distance !== undefined) {
          const distanceKm = parseFloat(product.distance);
          if (!isNaN(distanceKm)) {
            if (distanceKm < 1) {
              distanceFormatted = `${Math.round(distanceKm * 1000)} m`;
            } else {
              distanceFormatted = `${distanceKm.toFixed(1)} km`;
            }
          }
        }

        return {
          id: product.id,
          name: product.title || product.name,
          price: parseFloat(product.price) || 0,
          image: (product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/300x200?text=Sem+Imagem',
          distance: distanceFormatted,
          distanceValue: product.distance ? parseFloat(product.distance) : null, // Para ordenação
          rating: parseFloat(product.averageRating) || 0,
          verified: product.owner?.verified || false,
          // Manter dados originais para referência
          _original: product
        };
      }) : [];

      // Aplicar filtro de avaliação mínima no frontend (já que o backend ainda não suporta)
      if (appliedFilters.minRating) {
        const minRating = parseFloat(appliedFilters.minRating);
        mappedProducts = mappedProducts.filter(product => product.rating >= minRating);
      }

      // Ordenar produtos localmente se necessário (caso o backend não tenha ordenado)
      const sortedProducts = sortProductsLocally(mappedProducts, sortBy, sortOrder);
      
      setProducts(sortedProducts);
      setTotalResults(total);
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      
      // Tratamento de erros mais específico
      let errorMessage = 'Erro ao buscar produtos. Tente novamente.';
      
      if (err.networkError) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      } else if (err.status === 404) {
        errorMessage = 'Recurso não encontrado.';
      } else if (err.status === 500) {
        errorMessage = 'Erro no servidor. Por favor, tente novamente mais tarde.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setProducts([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [query, location, sortBy, sortOrder]);

  /**
   * Ordena produtos localmente (fallback se backend não ordenar)
   */
  const sortProductsLocally = (productsList, sortField, order) => {
    const sorted = [...productsList];
    
    sorted.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'distance':
          // Usar distanceValue se disponível, senão tentar parsear da string
          if (a.distanceValue !== null && b.distanceValue !== null) {
            aValue = a.distanceValue;
            bValue = b.distanceValue;
          } else {
            // Fallback: tentar parsear da string formatada
            aValue = a.distanceValue !== null ? a.distanceValue : 
                    (a.distance && a.distance !== 'N/A' ? 
                      parseFloat(a.distance.replace(' km', '').replace(' m', '') / 1000) : 999999);
            bValue = b.distanceValue !== null ? b.distanceValue : 
                    (b.distance && b.distance !== 'N/A' ? 
                      parseFloat(b.distance.replace(' km', '').replace(' m', '') / 1000) : 999999);
          }
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'createdAt':
        default:
          // Se houver dados originais, usar createdAt deles
          const aDate = a._original?.createdAt ? new Date(a._original.createdAt) : new Date(0);
          const bDate = b._original?.createdAt ? new Date(b._original.createdAt) : new Date(0);
          aValue = aDate.getTime();
          bValue = bDate.getTime();
          break;
      }
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  };

  /**
   * Handler para mudança nos filtros
   */
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    fetchProducts(newFilters);
  };

  /**
   * Handler para mudança na ordenação
   */
  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  /**
   * Buscar produtos quando a localização, query ou ordenação mudarem
   */
  useEffect(() => {
    fetchProducts(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lng, query, sortBy, sortOrder]);

  return (
    <div className="Search">
      <div className="container">
        <div className="Search-header">
          <h1 className="Search-title">
            {query || location?.address || location?.city
              ? `Resultados para "${query || location?.address || location?.city}"`
              : 'Buscar Equipamentos'}
          </h1>
        </div>

        <div className="Search-content">
          <aside className="Search-filters">
            {/* Localização */}
            <div className="Search-filter-group">
              <LocationInput 
                placeholder="Digite o CEP (ex: 01310-100)"
                showGPSButton={true}
                onLocationChange={() => {
                  // Recarregar produtos quando a localização mudar
                  fetchProducts(filters);
                }}
              />
            </div>

            {/* Filtros de busca */}
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </aside>

          <div className="Search-results">
            {/* Loading state */}
            {loading && (
              <>
                <div className="Search-loading" style={{ display: 'none' }}>
                  <div className="Search-loading-spinner"></div>
                  <p>Buscando produtos...</p>
                </div>
                {/* Skeleton loader */}
                <div className="Search-skeleton">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="Search-skeleton-item">
                      <div className="Search-skeleton-image"></div>
                      <div className="Search-skeleton-content">
                        <div className="Search-skeleton-line"></div>
                        <div className="Search-skeleton-line"></div>
                        <div className="Search-skeleton-line"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="Search-error">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>{error}</p>
                <p>Por favor, verifique sua conexão e tente novamente.</p>
              </div>
            )}

            {/* Results */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="Search-results-header">
                  <p className="Search-results-count">
                    {totalResults} {totalResults === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                  </p>
                  <SearchSort
                    sortBy={sortBy}
                    order={sortOrder}
                    onSortChange={handleSortChange}
                    hasLocation={!!(location?.lat && location?.lng)}
                  />
                </div>
                <div className="Search-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}

            {/* Empty state */}
            {!loading && !error && products.length === 0 && (
              <div className="Search-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <p>Nenhum resultado encontrado.</p>
                <p>Tente ajustar os filtros ou buscar por outros termos.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;


