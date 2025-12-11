import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { createReview } from '../../services/review.service';
import './ReviewForm.css';

/**
 * Componente de Formulário de Avaliação
 * 
 * Permite que usuários avaliem produtos após uma reserva concluída.
 * Inclui seleção de rating com estrelas e campo de comentário.
 * 
 * @param {Object} props
 * @param {string} props.productId - ID do produto a ser avaliado
 * @param {string} [props.reservationId] - ID da reserva relacionada (opcional)
 * @param {Function} props.onSuccess - Callback chamado quando a avaliação é criada com sucesso
 * @param {Function} props.onCancel - Callback chamado quando o usuário cancela
 */
const ReviewForm = ({ productId, reservationId, onSuccess, onCancel }) => {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const comment = watch('comment', '');

  /**
   * Renderiza as estrelas de rating
   */
  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoverRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          className={`ReviewForm-star ${isActive ? 'ReviewForm-star-active' : ''}`}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          aria-label={`Avaliar com ${starValue} ${starValue === 1 ? 'estrela' : 'estrelas'}`}
        >
          ★
        </button>
      );
    });
  };

  /**
   * Submete o formulário e cria a avaliação
   */
  const onSubmit = async (formData) => {
    if (!isAuthenticated) {
      setError('Você precisa estar logado para avaliar um produto.');
      return;
    }

    if (rating === 0) {
      setError('Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const reviewData = {
        productId,
        rating,
        comment: formData.comment || null,
        ...(reservationId && { reservationId })
      };

      await createReview(reviewData);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Erro ao criar avaliação:', err);
      
      let errorMessage = 'Erro ao processar a avaliação. Por favor, tente novamente.';
      
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || err.response.data?.error;
        
        if (status === 400) {
          errorMessage = message || 'Dados inválidos. Verifique as informações e tente novamente.';
        } else if (status === 401) {
          errorMessage = 'Você precisa estar logado para avaliar um produto.';
        } else if (status === 409) {
          errorMessage = 'Você já avaliou este produto.';
        } else if (status === 404) {
          errorMessage = 'Produto não encontrado.';
        } else {
          errorMessage = message || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ReviewForm">
      <div className="ReviewForm-header">
        <h3 className="ReviewForm-title">Avaliar Produto</h3>
        {onCancel && (
          <button
            type="button"
            className="ReviewForm-close"
            onClick={onCancel}
            aria-label="Fechar formulário"
          >
            ×
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="ReviewForm-form">
        {error && (
          <div className="ReviewForm-error">
            {error}
          </div>
        )}

        <div className="ReviewForm-rating-section">
          <label className="ReviewForm-label">
            Sua avaliação <span className="ReviewForm-required">*</span>
          </label>
          <div className="ReviewForm-stars">
            {renderStars()}
            {rating > 0 && (
              <span className="ReviewForm-rating-text">
                {rating === 1 ? 'Péssimo' : 
                 rating === 2 ? 'Ruim' : 
                 rating === 3 ? 'Regular' : 
                 rating === 4 ? 'Bom' : 'Excelente'}
              </span>
            )}
          </div>
          {rating === 0 && (
            <span className="ReviewForm-hint">Clique nas estrelas para avaliar</span>
          )}
        </div>

        <div className="ReviewForm-comment-section">
          <label htmlFor="comment" className="ReviewForm-label">
            Comentário (opcional)
          </label>
          <textarea
            id="comment"
            {...register('comment', {
              maxLength: {
                value: 1000,
                message: 'O comentário deve ter no máximo 1000 caracteres'
              }
            })}
            placeholder="Compartilhe sua experiência com este produto..."
            rows={5}
            className="ReviewForm-textarea"
          />
          <div className="ReviewForm-char-count">
            {comment.length}/1000 caracteres
          </div>
          {errors.comment && (
            <span className="ReviewForm-field-error">{errors.comment.message}</span>
          )}
        </div>

        <div className="ReviewForm-actions">
          {onCancel && (
            <button
              type="button"
              className="ReviewForm-button-secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="ReviewForm-button-primary"
            disabled={submitting || rating === 0}
          >
            {submitting ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;

