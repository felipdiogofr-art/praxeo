import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Confirmation.css';

/**
 * Página de Confirmação de Reserva
 * 
 * Exibida após a confirmação bem-sucedida de uma reserva.
 */
const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { reservation, product } = location.state || {};

  // Redirecionar se não houver dados (useEffect deve ser chamado antes de qualquer return)
  React.useEffect(() => {
    if (!reservation || !product) {
      navigate('/');
    }
  }, [navigate, reservation, product]);

  // Se não houver dados, retornar null após o hook
  if (!reservation || !product) {
    return null;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="Confirmation">
      <div className="container">
        <div className="Confirmation-content">
          <div className="Confirmation-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          
          <h1 className="Confirmation-title">Reserva Confirmada!</h1>
          <p className="Confirmation-message">
            Sua reserva foi criada com sucesso. O proprietário será notificado e entrará em contato em breve.
          </p>

          <div className="Confirmation-details">
            <div className="Confirmation-detail-card">
              <h3>Detalhes da Reserva</h3>
              <div className="Confirmation-detail-item">
                <span className="Confirmation-detail-label">Produto:</span>
                <span className="Confirmation-detail-value">{product.title}</span>
              </div>
              <div className="Confirmation-detail-item">
                <span className="Confirmation-detail-label">Período:</span>
                <span className="Confirmation-detail-value">
                  {formatDate(reservation.startDate)} até {formatDate(reservation.endDate)}
                </span>
              </div>
              <div className="Confirmation-detail-item">
                <span className="Confirmation-detail-label">Total:</span>
                <span className="Confirmation-detail-value Confirmation-total">
                  {formatPrice(reservation.totalPrice)}
                </span>
              </div>
              <div className="Confirmation-detail-item">
                <span className="Confirmation-detail-label">Status:</span>
                <span className="Confirmation-detail-value Confirmation-status">
                  {reservation.status === 'pending' ? 'Pendente de Confirmação' : 'Confirmada'}
                </span>
              </div>
            </div>
          </div>

          <div className="Confirmation-actions">
            <button 
              className="Confirmation-button-primary"
              onClick={() => navigate('/reservas')}
            >
              Ver Minhas Reservas
            </button>
            <button 
              className="Confirmation-button-secondary"
              onClick={() => navigate('/')}
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;

