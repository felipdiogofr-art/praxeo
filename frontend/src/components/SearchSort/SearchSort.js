import React from 'react';
import './SearchSort.css';

/**
 * Componente de Ordenação de Resultados
 * 
 * Permite ordenar produtos por:
 * - Distância (quando há localização)
 * - Preço (crescente/decrescente)
 * - Avaliação (maior para menor)
 * - Mais recentes
 * 
 * @param {Object} props
 * @param {string} props.sortBy - Campo de ordenação atual
 * @param {string} props.order - Ordem atual ('asc' ou 'desc')
 * @param {Function} props.onSortChange - Callback chamado quando a ordenação muda
 * @param {boolean} [props.hasLocation=false] - Se há localização disponível para ordenar por distância
 */
const SearchSort = ({ 
  sortBy = 'createdAt', 
  order = 'desc',
  onSortChange,
  hasLocation = false
}) => {
  const sortOptions = [
    { value: 'createdAt', label: 'Mais recentes', order: 'desc' },
    { value: 'price', label: 'Menor preço', order: 'asc' },
    { value: 'price', label: 'Maior preço', order: 'desc' },
    { value: 'rating', label: 'Melhor avaliação', order: 'desc' },
  ];

  // Adicionar opção de distância se houver localização
  if (hasLocation) {
    sortOptions.unshift({ value: 'distance', label: 'Mais próximos', order: 'asc' });
  }

  /**
   * Handler para mudança na ordenação
   */
  const handleSortChange = (e) => {
    const selectedValue = e.target.value;
    
    // Formato: "campo:ordem" (ex: "price:asc")
    const [field, sortOrder] = selectedValue.split(':');
    
    if (onSortChange) {
      onSortChange(field, sortOrder);
    }
  };

  /**
   * Obter valor atual do select
   */
  const getCurrentValue = () => {
    return `${sortBy}:${order}`;
  };

  return (
    <div className="SearchSort">
      <label htmlFor="search-sort" className="SearchSort-label">
        Ordenar por:
      </label>
      <select
        id="search-sort"
        className="SearchSort-select"
        value={getCurrentValue()}
        onChange={handleSortChange}
      >
        {sortOptions.map((option, index) => {
          const optionValue = `${option.value}:${option.order}`;
          const isSelected = sortBy === option.value && order === option.order;
          
          return (
            <option 
              key={`${option.value}-${option.order}-${index}`} 
              value={optionValue}
            >
              {option.label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SearchSort;

