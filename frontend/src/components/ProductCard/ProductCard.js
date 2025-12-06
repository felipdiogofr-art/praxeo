import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="ProductCard-rating">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="ProductCard-star ProductCard-star-full">★</span>
        ))}
        {hasHalfStar && (
          <span className="ProductCard-star ProductCard-star-half">★</span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={i} className="ProductCard-star ProductCard-star-empty">★</span>
        ))}
        <span className="ProductCard-rating-value">{rating}</span>
      </div>
    );
  };

  return (
    <Link to={`/produto/${product.id}`} className="ProductCard">
      <div className="ProductCard-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="ProductCard-image"
          loading="lazy"
        />
        {product.verified && (
          <div className="ProductCard-badge" title="Proprietário verificado">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        )}
      </div>
      <div className="ProductCard-content">
        <h3 className="ProductCard-title">{product.name}</h3>
        <div className="ProductCard-info">
          <div className="ProductCard-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{product.distance}</span>
          </div>
          {renderStars(product.rating)}
        </div>
        <div className="ProductCard-price">
          <span className="ProductCard-price-value">{formatPrice(product.price)}</span>
          <span className="ProductCard-price-period">/dia</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;


