import React from 'react';
import './ReviewCard.css';

/**
 * Componente de Card de Avaliação
 * 
 * Exibe uma avaliação individual de um produto.
 * Compatível com dados da API (user.name, createdAt) e dados mock (userName, date).
 * 
 * @param {Object} props
 * @param {Object} props.review - Dados da avaliação
 * @param {number} props.review.rating - Nota de 1 a 5
 * @param {string} props.review.comment - Comentário da avaliação
 * @param {string} props.review.createdAt - Data de criação (formato ISO)
 * @param {Object} props.review.user - Dados do usuário (da API)
 * @param {string} props.review.user.name - Nome do usuário
 * @param {string} [props.review.userName] - Nome do usuário (dados mock - compatibilidade)
 * @param {string} [props.review.date] - Data (dados mock - compatibilidade)
 * @param {boolean} [props.review.verified] - Se a reserva foi verificada (dados mock)
 */
const ReviewCard = ({ review }) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString('pt-BR', { month: 'long' });
      const year = date.getFullYear();
      return `${day} de ${month} de ${year}`;
    } catch {
      return dateString;
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <span
          key={index}
          className={`ReviewCard-star ${
            starValue <= rating
              ? 'ReviewCard-star-full'
              : starValue - 0.5 <= rating
              ? 'ReviewCard-star-half'
              : 'ReviewCard-star-empty'
          }`}
        >
          ★
        </span>
      );
    });
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Compatibilidade: usar user.name (API) ou userName (mock)
  const userName = review.user?.name || review.userName || 'Usuário';
  // Compatibilidade: usar createdAt (API) ou date (mock)
  const reviewDate = review.createdAt || review.date;
  // Verificado se tiver reservationId (indica que veio de uma reserva)
  const isVerified = review.verified !== undefined 
    ? review.verified 
    : !!review.reservationId;

  return (
    <article className="ReviewCard">
      <div className="ReviewCard-header">
        <div className="ReviewCard-avatar">
          {getInitials(userName)}
        </div>
        <div className="ReviewCard-user-info">
          <div className="ReviewCard-user-name">
            {userName}
            {isVerified && (
              <span className="ReviewCard-verified" title="Aluguel verificado">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </span>
            )}
          </div>
          <div className="ReviewCard-rating">
            {renderStars(review.rating)}
            <span className="ReviewCard-rating-value">{review.rating}</span>
          </div>
          {reviewDate && (
            <time className="ReviewCard-date" dateTime={reviewDate}>
              {formatDate(reviewDate)}
            </time>
          )}
        </div>
      </div>
      {review.comment && (
        <div className="ReviewCard-content">
          <p className="ReviewCard-text">{review.comment}</p>
        </div>
      )}
    </article>
  );
};

export default ReviewCard;

