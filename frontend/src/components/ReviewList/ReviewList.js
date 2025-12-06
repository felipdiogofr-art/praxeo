import React, { useState } from 'react';
import ReviewCard from '../ReviewCard/ReviewCard';
import './ReviewList.css';

const ReviewList = ({ reviews, itemsPerPage = 5 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (reviews.length === 0) {
    return (
      <div className="ReviewList-empty">
        <p>Este produto ainda não possui avaliações.</p>
        <p>Seja o primeiro a avaliar!</p>
      </div>
    );
  }

  return (
    <div className="ReviewList">
      <div className="ReviewList-header">
        <h2 className="ReviewList-title">
          Avaliações ({reviews.length})
        </h2>
      </div>

      <div className="ReviewList-content">
        {currentReviews.map((review, index) => (
          <ReviewCard key={review.id || index} review={review} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="ReviewList-pagination">
          <button
            className="ReviewList-pagination-button"
            onClick={handlePrevious}
            disabled={currentPage === 1}
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
            disabled={currentPage === totalPages}
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

