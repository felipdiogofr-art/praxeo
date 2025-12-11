import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../../components/HeroSection/HeroSection';
import ProductCard from '../../components/ProductCard/ProductCard';
import ProductService from '../../services/product.service';
import { useLocation } from '../../contexts/LocationContext';
import './Home.css';

const Home = () => {
  const { location: userLocation, hasCoordinates } = useLocation();
  
  // Estados para produtos
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [errorFeatured, setErrorFeatured] = useState(null);
  const [errorRecommended, setErrorRecommended] = useState(null);

  /**
   * Mapeia produtos da API para o formato esperado pelo ProductCard
   */
  const mapProducts = (productsData) => {
    if (!Array.isArray(productsData)) return [];

    return productsData.map(product => {
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
        image: (product.images && product.images.length > 0) 
          ? product.images[0] 
          : 'https://via.placeholder.com/300x200?text=Sem+Imagem',
        distance: distanceFormatted,
        rating: parseFloat(product.averageRating) || 0,
        verified: product.owner?.verified || false,
        _original: product
      };
    });
  };

  /**
   * Busca produtos em destaque (mais avaliados)
   */
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoadingFeatured(true);
        setErrorFeatured(null);

        const response = await ProductService.getProducts({
          limit: 6,
          sortBy: 'rating',
          order: 'desc',
          availability: true
        });

        // Extrair produtos da resposta
        const responseData = response.data || response;
        const productsData = responseData.products || responseData.data || responseData;
        
        const mapped = mapProducts(Array.isArray(productsData) ? productsData : []);
        setFeaturedProducts(mapped);
      } catch (error) {
        console.error('Erro ao carregar produtos em destaque:', error);
        setErrorFeatured('Não foi possível carregar os produtos em destaque');
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  /**
   * Busca produtos recomendados baseado na localização do usuário
   */
  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      // Só busca se o usuário tiver localização definida
      if (!hasCoordinates || !userLocation?.lat || !userLocation?.lng) {
        setRecommendedProducts([]);
        return;
      }

      try {
        setLoadingRecommended(true);
        setErrorRecommended(null);

        const response = await ProductService.getProducts({
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 20, // 20km de raio
          limit: 6,
          sortBy: 'distance',
          order: 'asc',
          availability: true
        });

        // Extrair produtos da resposta
        const responseData = response.data || response;
        const productsData = responseData.products || responseData.data || responseData;
        
        const mapped = mapProducts(Array.isArray(productsData) ? productsData : []);
        setRecommendedProducts(mapped);
      } catch (error) {
        console.error('Erro ao carregar produtos recomendados:', error);
        setErrorRecommended('Não foi possível carregar os produtos recomendados');
      } finally {
        setLoadingRecommended(false);
      }
    };

    fetchRecommendedProducts();
  }, [userLocation, hasCoordinates]);

  /**
   * Componente de Skeleton Loader para ProductCard
   */
  const ProductCardSkeleton = () => (
    <div className="Home-product-skeleton">
      <div className="Home-product-skeleton-image"></div>
      <div className="Home-product-skeleton-content">
        <div className="Home-product-skeleton-title"></div>
        <div className="Home-product-skeleton-info">
          <div className="Home-product-skeleton-location"></div>
          <div className="Home-product-skeleton-rating"></div>
        </div>
        <div className="Home-product-skeleton-price"></div>
      </div>
    </div>
  );

  /**
   * Renderiza grid de produtos com skeleton loader durante carregamento
   */
  const renderProductGrid = (products, loading, error, emptyMessage) => {
    if (loading) {
      return (
        <div className="Home-products-grid">
          {[...Array(6)].map((_, index) => (
            <ProductCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="Home-error">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="Home-error-button"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    if (!products || products.length === 0) {
      return (
        <div className="Home-empty">
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="Home-products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="Home">
      <HeroSection />
      
      <div className="container">
        {/* Seção de Produtos Recomendados (baseado em localização) */}
        {hasCoordinates && (
          <section className="Home-section">
            <div className="Home-section-header">
              <h2 className="Home-section-title">Recomendados para Você</h2>
              <p className="Home-section-subtitle">
                Produtos próximos à sua localização
              </p>
            </div>
            {loadingRecommended || recommendedProducts.length > 0 || errorRecommended ? (
              renderProductGrid(
                recommendedProducts,
                loadingRecommended,
                errorRecommended,
                'Não há produtos recomendados disponíveis no momento'
              )
            ) : null}
          </section>
        )}

        {/* Seção de Produtos em Destaque */}
        <section className="Home-section">
          <div className="Home-section-header">
            <h2 className="Home-section-title">Produtos em Destaque</h2>
            <p className="Home-section-subtitle">
              Os mais bem avaliados da plataforma
            </p>
          </div>
          {renderProductGrid(
            featuredProducts,
            loadingFeatured,
            errorFeatured,
            'Não há produtos em destaque no momento'
          )}
          
          {featuredProducts.length > 0 && (
            <div className="Home-section-footer">
              <Link to="/busca" className="Home-button">
                Ver todos os produtos
              </Link>
            </div>
          )}
        </section>

        {/* Seção Como Funciona */}
        <section className="Home-section">
          <h2 className="Home-section-title">Como Funciona</h2>
          <div className="Home-steps">
            <div className="Home-step">
              <div className="Home-step-number">1</div>
              <h3 className="Home-step-title">Busque</h3>
              <p className="Home-step-description">
                Encontre o equipamento que você precisa na sua região usando nossa busca por localização.
              </p>
            </div>
            <div className="Home-step">
              <div className="Home-step-number">2</div>
              <h3 className="Home-step-title">Reserve</h3>
              <p className="Home-step-description">
                Selecione as datas desejadas e faça sua reserva de forma rápida e segura.
              </p>
            </div>
            <div className="Home-step">
              <div className="Home-step-number">3</div>
              <h3 className="Home-step-title">Receba</h3>
              <p className="Home-step-description">
                Combine a entrega ou retirada com o proprietário e aproveite seu equipamento.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;


