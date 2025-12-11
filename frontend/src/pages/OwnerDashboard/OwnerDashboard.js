import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProductService from '../../services/product.service';
import ReservationService from '../../services/reservation.service';
import ProductCard from '../../components/ProductCard/ProductCard';
import './OwnerDashboard.css';

/**
 * Dashboard do Proprietário
 * 
 * Exibe:
 * - Lista de produtos publicados
 * - Estatísticas (visualizações, reservas)
 * - Reservas pendentes
 * - Ganhos
 */
const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Carrega dados do dashboard
   */
  const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar produtos do usuário usando filtro userId
        const productsResponse = await ProductService.getProducts({ 
          userId: user.id 
        });
        const productsData = productsResponse.data?.products || productsResponse.data || productsResponse;
        const myProducts = Array.isArray(productsData) ? productsData : [];

        // Buscar reservas como proprietário (usando type conforme backend)
        const reservationsResponse = await ReservationService.getReservations({ 
          type: 'as_owner' 
        });
        // O backend retorna { message, data: [...] } ou array direto
        const reservationsData = reservationsResponse.data || reservationsResponse;
        const allReservations = Array.isArray(reservationsData) ? reservationsData : [];

        // Filtrar reservas pendentes
        const pendingReservations = allReservations.filter(r => r.status === 'pending');

        // Calcular estatísticas
        const totalProducts = myProducts.length;
        const activeProducts = myProducts.filter(p => p.availability !== false).length;
        const totalReservations = allReservations.length;
        const confirmedReservations = allReservations.filter(r => r.status === 'confirmed').length;

        // Calcular ganhos
        const calculateEarnings = (reservationsList) => {
          let total = 0;
          let thisMonth = 0;
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();

          reservationsList.forEach(reservation => {
            if (reservation.status === 'confirmed' || reservation.status === 'completed') {
              // Ganho do proprietário = preço total - taxa de serviço
              // Taxa de serviço é geralmente 15%, então o proprietário recebe 85%
              const ownerEarning = reservation.totalPrice * 0.85;
              total += ownerEarning;

              // Verificar se é deste mês
              const reservationDate = new Date(reservation.createdAt || reservation.startDate);
              if (reservationDate.getMonth() === currentMonth && 
                  reservationDate.getFullYear() === currentYear) {
                thisMonth += ownerEarning;
              }
            }
          });

          return { total, thisMonth };
        };

        const earnings = calculateEarnings(allReservations);

        setProducts(myProducts);
        setReservations(allReservations);
        setStatistics({
          totalProducts,
          activeProducts,
          totalReservations,
          pendingReservations: pendingReservations.length,
          confirmedReservations,
          totalEarnings: earnings.total,
          thisMonthEarnings: earnings.thisMonth
        });
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError(err.message || 'Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user]);

  /**
   * Formata preço
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price || 0);
  };

  /**
   * Formata data
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  /**
   * Mapeia produtos para formato do ProductCard
   */
  const mapProductForCard = (product) => ({
    id: product.id,
    name: product.title || product.name,
    price: parseFloat(product.price) || 0,
    image: (product.images && product.images.length > 0) 
      ? product.images[0] 
      : 'https://via.placeholder.com/300x200?text=Sem+Imagem',
    distance: product.address || 'Localização não informada',
    rating: parseFloat(product.averageRating) || 0,
    verified: false
  });

  if (loading) {
    return (
      <div className="OwnerDashboard OwnerDashboard-loading">
        <div className="container">
          <div className="OwnerDashboard-loading-spinner"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="OwnerDashboard OwnerDashboard-error">
        <div className="container">
          <div className="OwnerDashboard-error-message">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>{error}</p>
            <button 
              className="OwnerDashboard-button-primary"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="OwnerDashboard">
      <div className="container">
        {/* Header */}
        <div className="OwnerDashboard-header">
          <div>
            <h1 className="OwnerDashboard-title">Meu Dashboard</h1>
            <p className="OwnerDashboard-subtitle">
              Gerencie seus produtos e acompanhe suas reservas
            </p>
          </div>
          <button
            className="OwnerDashboard-button-primary"
            onClick={() => navigate('/publicar')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Publicar Novo Produto
          </button>
        </div>

        {/* Estatísticas */}
        <div className="OwnerDashboard-stats">
          <div className="OwnerDashboard-stat-card">
            <div className="OwnerDashboard-stat-icon OwnerDashboard-stat-icon-products">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </div>
            <div className="OwnerDashboard-stat-content">
              <div className="OwnerDashboard-stat-value">{statistics.totalProducts}</div>
              <div className="OwnerDashboard-stat-label">Produtos Publicados</div>
              <div className="OwnerDashboard-stat-sublabel">
                {statistics.activeProducts} ativos
              </div>
            </div>
          </div>

          <div className="OwnerDashboard-stat-card">
            <div className="OwnerDashboard-stat-icon OwnerDashboard-stat-icon-reservations">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div className="OwnerDashboard-stat-content">
              <div className="OwnerDashboard-stat-value">{statistics.totalReservations}</div>
              <div className="OwnerDashboard-stat-label">Total de Reservas</div>
              <div className="OwnerDashboard-stat-sublabel">
                {statistics.pendingReservations} pendentes
              </div>
            </div>
          </div>

          <div className="OwnerDashboard-stat-card">
            <div className="OwnerDashboard-stat-icon OwnerDashboard-stat-icon-earnings">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="OwnerDashboard-stat-content">
              <div className="OwnerDashboard-stat-value">{formatPrice(statistics.totalEarnings)}</div>
              <div className="OwnerDashboard-stat-label">Ganhos Totais</div>
              <div className="OwnerDashboard-stat-sublabel">
                {formatPrice(statistics.thisMonthEarnings)} este mês
              </div>
            </div>
          </div>
        </div>

        {/* Reservas Pendentes */}
        {reservations.filter(r => r.status === 'pending').length > 0 && (
          <section className="OwnerDashboard-section">
            <div className="OwnerDashboard-section-header">
              <h2 className="OwnerDashboard-section-title">Reservas Pendentes</h2>
              <span className="OwnerDashboard-badge">
                {reservations.filter(r => r.status === 'pending').length}
              </span>
            </div>
            <div className="OwnerDashboard-reservations">
              {reservations
                .filter(r => r.status === 'pending')
                .slice(0, 5)
                .map((reservation) => (
                  <div key={reservation.id} className="OwnerDashboard-reservation-card">
                    <div className="OwnerDashboard-reservation-info">
                      <h4 className="OwnerDashboard-reservation-product">
                        {reservation.product?.title || 'Produto'}
                      </h4>
                      <div className="OwnerDashboard-reservation-details">
                        <span>
                          {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                        </span>
                        <span className="OwnerDashboard-reservation-price">
                          {formatPrice(reservation.totalPrice)}
                        </span>
                      </div>
                      {reservation.renter && (
                        <div className="OwnerDashboard-reservation-user">
                          Locatário: {reservation.renter.name || reservation.renter.email}
                        </div>
                      )}
                    </div>
                    <div className="OwnerDashboard-reservation-actions">
                      <button
                        className="OwnerDashboard-button-small OwnerDashboard-button-primary"
                        onClick={async () => {
                          try {
                            await ReservationService.updateReservationStatus(reservation.id, 'confirmed');
                            window.location.reload();
                          } catch (err) {
                            alert('Erro ao confirmar reserva: ' + err.message);
                          }
                        }}
                      >
                        Confirmar
                      </button>
                      <button
                        className="OwnerDashboard-button-small OwnerDashboard-button-secondary"
                        onClick={async () => {
                          try {
                            await ReservationService.updateReservationStatus(reservation.id, 'cancelled');
                            window.location.reload();
                          } catch (err) {
                            alert('Erro ao cancelar reserva: ' + err.message);
                          }
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Produtos Publicados */}
        <section className="OwnerDashboard-section">
          <div className="OwnerDashboard-section-header">
            <h2 className="OwnerDashboard-section-title">Meus Produtos</h2>
            <button
              className="OwnerDashboard-button-link"
              onClick={() => navigate('/publicar')}
            >
              + Adicionar novo
            </button>
          </div>

          {products.length > 0 ? (
            <div className="OwnerDashboard-products-grid">
              {products.map((product) => (
                <div key={product.id} className="OwnerDashboard-product-item">
                  <ProductCard product={mapProductForCard(product)} />
                  <div className="OwnerDashboard-product-actions">
                    <button
                      className="OwnerDashboard-button-small OwnerDashboard-button-primary"
                      onClick={() => navigate(`/produto/${product.id}/editar`)}
                    >
                      Editar
                    </button>
                    <button
                      className={`OwnerDashboard-button-small ${
                        product.availability
                          ? 'OwnerDashboard-button-warning'
                          : 'OwnerDashboard-button-success'
                      }`}
                      onClick={async () => {
                        try {
                          await ProductService.updateProduct(product.id, {
                            availability: !product.availability,
                          });
                          loadDashboardData(); // Recarregar dados
                        } catch (err) {
                          alert('Erro ao atualizar produto: ' + err.message);
                        }
                      }}
                    >
                      {product.availability ? 'Pausar' : 'Ativar'}
                    </button>
                    <button
                      className="OwnerDashboard-button-small OwnerDashboard-button-danger"
                      onClick={async () => {
                        if (
                          window.confirm(
                            'Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita.'
                          )
                        ) {
                          try {
                            await ProductService.deleteProduct(product.id);
                            loadDashboardData(); // Recarregar dados
                          } catch (err) {
                            alert('Erro ao deletar produto: ' + err.message);
                          }
                        }
                      }}
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="OwnerDashboard-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
              <p>Você ainda não publicou nenhum produto.</p>
              <button
                className="OwnerDashboard-button-primary"
                onClick={() => navigate('/publicar')}
              >
                Publicar Primeiro Produto
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default OwnerDashboard;

