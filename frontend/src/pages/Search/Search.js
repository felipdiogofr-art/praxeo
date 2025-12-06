import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Search.css';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';

  // Mock data - será substituído por dados reais da API
  const mockProducts = [
    {
      id: 1,
      name: 'Cadeira de Rodas Standard',
      price: 45.00,
      image: 'https://via.placeholder.com/300x200?text=Cadeira+de+Rodas',
      distance: '2.5 km',
      rating: 4.8,
      verified: true,
    },
    {
      id: 2,
      name: 'Cama Hospitalar Elétrica',
      price: 120.00,
      image: 'https://via.placeholder.com/300x200?text=Cama+Hospitalar',
      distance: '5.1 km',
      rating: 4.9,
      verified: true,
    },
    {
      id: 3,
      name: 'Andador com Rodas',
      price: 35.00,
      image: 'https://via.placeholder.com/300x200?text=Andador',
      distance: '1.8 km',
      rating: 4.6,
      verified: false,
    },
  ];

  return (
    <div className="Search">
      <div className="container">
        <div className="Search-header">
          <h1 className="Search-title">
            {query || location
              ? `Resultados para "${query || location}"`
              : 'Buscar Equipamentos'}
          </h1>
          {query || location ? (
            <p className="Search-results-count">
              {mockProducts.length} {mockProducts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>
          ) : null}
        </div>

        <div className="Search-content">
          <aside className="Search-filters">
            <h2 className="Search-filters-title">Filtros</h2>
            <div className="Search-filter-group">
              <label className="Search-filter-label">Categoria</label>
              <select className="Search-filter-select">
                <option value="">Todas</option>
                <option value="cadeira-rodas">Cadeiras de Rodas</option>
                <option value="cama-hospitalar">Camas Hospitalares</option>
                <option value="andador">Andadores</option>
                <option value="muleta">Muletas</option>
              </select>
            </div>
            <div className="Search-filter-group">
              <label className="Search-filter-label">Preço por dia</label>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                className="Search-filter-range"
              />
            </div>
            <div className="Search-filter-group">
              <label className="Search-filter-label">Distância máxima</label>
              <select className="Search-filter-select">
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20">20 km</option>
                <option value="50">50 km</option>
              </select>
            </div>
          </aside>

          <div className="Search-results">
            {mockProducts.length > 0 ? (
              <div className="Search-grid">
                {mockProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="Search-empty">
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


