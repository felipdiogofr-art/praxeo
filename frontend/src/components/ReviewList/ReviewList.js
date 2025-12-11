import React, { useState, useEffect } from 'react';
import ReviewCard from '../ReviewCard/ReviewCard';
import { getProductReviews } from '../../services/review.service';
import './ReviewList.css';

/**
 * Componente de Lista de Avaliações
 * 
 * Exibe lista de avaliações de um produto com paginação.
 * Pode receber reviews via props (modo mock) ou carregar da API automaticamente.
 * 
 * @param {Object} props
 * @param {string} props.productId - ID do produto (obrigatório para carregar da API)
 * @param {Array} [props.reviews] - Array de avaliações (modo mock - opcional)
 * @param {number} [props.itemsPerPage=10] - Itens por página
 * @param {boolean} [props.autoLoad=true] - Se deve carregar automaticamente da API quando productId for fornecido
 */
const ReviewList = ({ 
  productId, 
  reviews: propReviews, 
  itemsPerPage = 10,
  autoLoad = true 
}) => {
  const [reviews, setReviews] = useState(propReviews || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(null);

  // Carregar avaliações da API se productId for fornecido e autoLoad for true
  useEffect(() => {
    if (productId && autoLoad && !propReviews) {
      loadReviews(1);
    } else if (propReviews) {
      // Modo mock: usar reviews fornecidas via props
      setReviews(propReviews);
      setTotalReviews(propReviews.length);
      setTotalPages(Math.ceil(propReviews.length / itemsPerPage));
    }
  }, [productId, autoLoad, propReviews, itemsPerPage]);

  /**
   * Carrega avaliações da API
   */
  const loadReviews = async (page = 1) => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await getProductReviews(productId, {
        page,
        limit: itemsPerPage
      });

      setReviews(response.data.reviews || []);
      setTotalReviews(response.data.totalReviews || 0);
      setTotalPages(response.data.totalPages || 1);
      setAverageRating(response.data.averageRating);
      setCurrentPage(page);
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
      setError('Erro ao carregar avaliações. Por favor, tente novamente.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    const newPage = Math.max(1, currentPage - 1);
    if (productId && autoLoad && !propReviews) {
      loadReviews(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const handleNext = () => {
    const newPage = Math.min(totalPages, currentPage + 1);
    if (productId && autoLoad && !propReviews) {
      loadReviews(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  // Calcular reviews da página atual (modo mock)
  const getCurrentReviews = () => {
    if (productId && autoLoad && !propReviews) {
      return reviews; // Já vem paginado da API
    }
    
    // Modo mock: paginar localmente
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return reviews.slice(startIndex, endIndex);
  };

  const currentReviews = getCurrentReviews();

  // Loading state
  if (loading && reviews.length === 0) {
    return (
      <div className="ReviewList">
        <div className="ReviewList-loading">
          <p>Carregando avaliações...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && reviews.length === 0) {
    return (
      <div className="ReviewList">
        <div className="ReviewList-error">
          <p>{error}</p>
          <button 
            className="ReviewList-retry-button"
            onClick={() => loadReviews(1)}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <div className="ReviewList">
        <div className="ReviewList-empty">
          <p>Este produto ainda não possui avaliações.</p>
          <p>Seja o primeiro a avaliar!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ReviewList">
      <div className="ReviewList-header">
        <h2 className="ReviewList-title">
          Avaliações {totalReviews > 0 && `(${totalReviews})`}
        </h2>
        {averageRating !== null && (
          <div className="ReviewList-average-rating">
            <span className="ReviewList-average-label">Média:</span>
            <span className="ReviewList-average-value">★ {averageRating}</span>
          </div>
        )}
      </div>

      {error && reviews.length > 0 && (
        <div className="ReviewList-error-message">
          {error}
        </div>
      )}

      <div className="ReviewList-content">
        {currentReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="ReviewList-pagination">
          <button
            className="ReviewList-pagination-button"
            onClick={handlePrevious}
            disabled={currentPage === 1 || loading}
            aria-label="Página anterior"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="ReviewList-pagination-info">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="ReviewList-pagination-button"
            onClick={handleNext}
            disabled={currentPage === totalPages || loading}
            aria-label="Próxima página"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
