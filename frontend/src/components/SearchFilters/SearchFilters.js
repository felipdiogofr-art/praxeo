import React, { useState, useEffect } from 'react';
import './SearchFilters.css';

/**
 * Componente de Filtros de Busca
 * 
 * Permite filtrar produtos por:
 * - Categoria
 * - Preço (mínimo e máximo)
 * - Distância máxima
 * - Avaliação mínima
 * 
 * @param {Object} props
 * @param {Object} props.filters - Filtros atuais
 * @param {Function} props.onFiltersChange - Callback chamado quando os filtros mudam
 * @param {boolean} [props.showLocation=false] - Exibir campo de localização
 */
const SearchFilters = ({ 
  filters = {}, 
  onFiltersChange,
  showLocation = false 
}) => {
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || '',
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
    maxDistance: filters.radius || '10',
    minRating: filters.minRating || '',
    ...filters
  });

  // Sincronizar com filtros externos quando mudarem
  useEffect(() => {
    setLocalFilters(prev => ({
      ...prev,
      ...filters
    }));
  }, [filters]);

  /**
   * Categorias disponíveis de equipamentos médicos
   */
  const categories = [
    { value: '', label: 'Todas as categorias' },
    { value: 'cadeira-rodas', label: 'Cadeiras de Rodas' },
    { value: 'cama-hospitalar', label: 'Camas Hospitalares' },
    { value: 'andador', label: 'Andadores' },
    { value: 'muleta', label: 'Muletas' },
    { value: 'oxigenoterapia', label: 'Oxigenoterapia' },
    { value: 'maca', label: 'Macas' },
    { value: 'monitoramento', label: 'Equipamentos de Monitoramento' },
    { value: 'reabilitacao', label: 'Equipamentos de Reabilitação' },
    { value: 'outros', label: 'Outros' }
  ];

  /**
   * Opções de distância máxima (em km)
   */
  const distanceOptions = [
    { value: '5', label: '5 km' },
    { value: '10', label: '10 km' },
    { value: '20', label: '20 km' },
    { value: '50', label: '50 km' },
    { value: '100', label: '100 km' },
    { value: '', label: 'Sem limite' }
  ];

  /**
   * Opções de avaliação mínima
   */
  const ratingOptions = [
    { value: '', label: 'Qualquer avaliação' },
    { value: '4.5', label: '4.5 estrelas ou mais' },
    { value: '4.0', label: '4.0 estrelas ou mais' },
    { value: '3.5', label: '3.5 estrelas ou mais' },
    { value: '3.0', label: '3.0 estrelas ou mais' }
  ];

  /**
   * Handler para mudança nos filtros
   */
  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...localFilters,
      [key]: value
    };

    // Limpar campos relacionados quando necessário
    if (key === 'category' && value === '') {
      // Manter vazio
    }
    if (key === 'minPrice' && value === '') {
      newFilters.minPrice = '';
    }
    if (key === 'maxPrice' && value === '') {
      newFilters.maxPrice = '';
    }

    setLocalFilters(newFilters);

    // Chamar callback com filtros formatados
    if (onFiltersChange) {
      const formattedFilters = formatFiltersForAPI(newFilters);
      onFiltersChange(formattedFilters);
    }
  };

  /**
   * Formata os filtros para o formato esperado pela API
   */
  const formatFiltersForAPI = (filters) => {
    const formatted = {};

    if (filters.category) {
      formatted.category = filters.category;
    }

    if (filters.minPrice) {
      formatted.minPrice = parseFloat(filters.minPrice);
    }

    if (filters.maxPrice) {
      formatted.maxPrice = parseFloat(filters.maxPrice);
    }

    if (filters.maxDistance) {
      formatted.radius = parseFloat(filters.maxDistance);
    }

    if (filters.minRating) {
      formatted.minRating = parseFloat(filters.minRating);
    }

    return formatted;
  };

  /**
   * Limpa todos os filtros
   */
  const handleClearFilters = () => {
    const clearedFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      maxDistance: '10',
      minRating: ''
    };
    
    setLocalFilters(clearedFilters);
    
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  /**
   * Verifica se há filtros ativos
   */
  const hasActiveFilters = () => {
    return !!(
      localFilters.category ||
      localFilters.minPrice ||
      localFilters.maxPrice ||
      (localFilters.maxDistance && localFilters.maxDistance !== '10') ||
      localFilters.minRating
    );
  };

  return (
    <div className="SearchFilters">
      <div className="SearchFilters-header">
        <h3 className="SearchFilters-title">Filtros</h3>
        {hasActiveFilters() && (
          <button
            type="button"
            className="SearchFilters-clear"
            onClick={handleClearFilters}
            aria-label="Limpar todos os filtros"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="SearchFilters-content">
        {/* Filtro de Categoria */}
        <div className="SearchFilters-group">
          <label htmlFor="filter-category" className="SearchFilters-label">
            Categoria
          </label>
          <select
            id="filter-category"
            className="SearchFilters-select"
            value={localFilters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Preço */}
        <div className="SearchFilters-group">
          <label className="SearchFilters-label">
            Preço por dia (R$)
          </label>
          <div className="SearchFilters-price-range">
            <div className="SearchFilters-price-input-wrapper">
              <label htmlFor="filter-min-price" className="SearchFilters-price-label">
                Mínimo
              </label>
              <input
                id="filter-min-price"
                type="number"
                className="SearchFilters-price-input"
                placeholder="0"
                min="0"
                step="0.01"
                value={localFilters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>
            <span className="SearchFilters-price-separator">-</span>
            <div className="SearchFilters-price-input-wrapper">
              <label htmlFor="filter-max-price" className="SearchFilters-price-label">
                Máximo
              </label>
              <input
                id="filter-max-price"
                type="number"
                className="SearchFilters-price-input"
                placeholder="500"
                min="0"
                step="0.01"
                value={localFilters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filtro de Distância */}
        <div className="SearchFilters-group">
          <label htmlFor="filter-distance" className="SearchFilters-label">
            Distância máxima
          </label>
          <select
            id="filter-distance"
            className="SearchFilters-select"
            value={localFilters.maxDistance}
            onChange={(e) => handleFilterChange('maxDistance', e.target.value)}
          >
            {distanceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Avaliação */}
        <div className="SearchFilters-group">
          <label htmlFor="filter-rating" className="SearchFilters-label">
            Avaliação mínima
          </label>
          <select
            id="filter-rating"
            className="SearchFilters-select"
            value={localFilters.minRating}
            onChange={(e) => handleFilterChange('minRating', e.target.value)}
          >
            {ratingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;

