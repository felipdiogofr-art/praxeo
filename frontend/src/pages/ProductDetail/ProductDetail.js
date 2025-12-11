import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewList from '../../components/ReviewList/ReviewList';
import ReservationBox from '../../components/Reservation/ReservationBox';
import ProductService from '../../services/product.service';
import ReservationService from '../../services/reservation.service';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data - será substituído por dados reais da API quando disponível
  const mockProduct = {
    id: parseInt(id),
    name: 'Cadeira de Rodas Standard',
    description: 'Cadeira de rodas confortável e resistente, ideal para uso diário. Possui rodas traseiras grandes para melhor mobilidade e freios de mão em ambos os lados.',
    price: 45.00,
    images: [
      'https://via.placeholder.com/800x600?text=Cadeira+de+Rodas+1',
      'https://via.placeholder.com/800x600?text=Cadeira+de+Rodas+2',
      'https://via.placeholder.com/800x600?text=Cadeira+de+Rodas+3',
    ],
    specifications: {
      peso: '15 kg',
      'peso-suportado': '120 kg',
      dimensoes: '100 x 60 x 90 cm',
      material: 'Alumínio',
    },
    owner: {
      name: 'João Silva',
      verified: true,
      rating: 4.8,
    },
    location: 'São Paulo, SP',
    distance: '2.5 km',
    rating: 4.8,
    reviewsCount: 24,
    ownerId: 'mock-owner-id', // Para validação no ReservationBox
  };

  // Carregar produto e datas indisponíveis
  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Tentar carregar produto da API
        try {
          const productData = await ProductService.getProductById(id);
          setProduct(productData);
        } catch (apiError) {
          // Se a API não estiver disponível, usar mock data
          console.warn('API não disponível, usando dados mock:', apiError);
          setProduct(mockProduct);
        }

        // Carregar datas indisponíveis (reservas existentes)
        // Nota: Esta funcionalidade pode precisar de um endpoint específico no backend
        // Por enquanto, tentamos buscar todas as reservas e filtrar
        try {
          // TODO: Implementar endpoint específico para buscar datas indisponíveis de um produto
          // Por enquanto, deixamos vazio - o backend validará na criação da reserva
          setUnavailableDates([]);
        } catch (reservationError) {
          // Se não conseguir carregar reservas, continuar sem datas indisponíveis
          console.warn('Não foi possível carregar datas indisponíveis:', reservationError);
          setUnavailableDates([]);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do produto:', err);
        setError('Erro ao carregar informações do produto');
        setProduct(mockProduct); // Fallback para mock
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [id]);

  // Usar produto carregado ou mock como fallback
  const displayProduct = product || mockProduct;

  // Mock reviews - será substituído por dados reais da API
  const mockReviews = [
    {
      id: 1,
      userName: 'Maria Santos',
      rating: 5,
      date: '2024-01-15',
      comment: 'Excelente cadeira de rodas! Muito confortável e em perfeito estado. O proprietário foi muito atencioso e pontual na entrega. Recomendo!',
      verified: true,
    },
    {
      id: 2,
      userName: 'Pedro Oliveira',
      rating: 4,
      date: '2024-01-10',
      comment: 'Boa qualidade e preço justo. A cadeira estava limpa e funcionando perfeitamente. O processo de aluguel foi muito simples.',
      verified: true,
    },
    {
      id: 3,
      userName: 'Ana Costa',
      rating: 5,
      date: '2024-01-05',
      comment: 'Super recomendo! A cadeira é muito resistente e o atendimento foi impecável. Vou alugar novamente quando precisar.',
      verified: true,
    },
    {
      id: 4,
      userName: 'Carlos Mendes',
      rating: 4,
      date: '2023-12-28',
      comment: 'Ótima experiência. A cadeira atendeu perfeitamente às nossas necessidades. O proprietário foi muito prestativo.',
      verified: true,
    },
    {
      id: 5,
      userName: 'Juliana Ferreira',
      rating: 5,
      date: '2023-12-20',
      comment: 'Perfeito! A cadeira estava em excelente estado e o processo foi muito rápido. Muito satisfeita com o serviço.',
      verified: true,
    },
  ];

  // Manipula sucesso na reserva
  const handleReservationSuccess = (reservation) => {
    // Redirecionar para página de reservas ou mostrar mensagem de sucesso
    navigate('/reservas', { 
      state: { 
        message: 'Reserva criada com sucesso!',
        reservation 
      } 
    });
  };

  if (loading) {
    return (
      <div className="ProductDetail">
        <div className="container">
          <div className="ProductDetail-loading">
            <p>Carregando informações do produto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !displayProduct) {
    return (
      <div className="ProductDetail">
        <div className="container">
          <div className="ProductDetail-error">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ProductDetail">
      <div className="container">
        <div className="ProductDetail-content">
          <div className="ProductDetail-main">
            <div className="ProductDetail-gallery">
              <div className="ProductDetail-main-image">
                <img
                  src={displayProduct.images?.[0] || displayProduct.image || 'https://via.placeholder.com/800x600?text=Produto'}
                  alt={displayProduct.name || displayProduct.title}
                  className="ProductDetail-image"
                />
              </div>
              {displayProduct.images && displayProduct.images.length > 1 && (
                <div className="ProductDetail-thumbnails">
                  {displayProduct.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${displayProduct.name || displayProduct.title} - ${index + 1}`}
                      className="ProductDetail-thumbnail"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="ProductDetail-info">
              <h1 className="ProductDetail-title">
                {displayProduct.name || displayProduct.title}
              </h1>
              <div className="ProductDetail-meta">
                <div className="ProductDetail-location">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>
                    {displayProduct.location || displayProduct.address} 
                    {displayProduct.distance && ` • ${displayProduct.distance}`}
                  </span>
                </div>
                {(displayProduct.rating || displayProduct.reviewsCount) && (
                  <div className="ProductDetail-rating">
                    {displayProduct.rating && (
                      <span className="ProductDetail-rating-value">★ {displayProduct.rating}</span>
                    )}
                    {displayProduct.reviewsCount && (
                      <span className="ProductDetail-reviews-count">
                        ({displayProduct.reviewsCount} avaliações)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="ProductDetail-description">
                <h2 className="ProductDetail-section-title">Descrição</h2>
                <p>{displayProduct.description}</p>
              </div>

              {displayProduct.specifications && (
                <div className="ProductDetail-specifications">
                  <h2 className="ProductDetail-section-title">Especificações</h2>
                  <dl className="ProductDetail-spec-list">
                    {Object.entries(displayProduct.specifications).map(([key, value]) => (
                      <div key={key} className="ProductDetail-spec-item">
                        <dt className="ProductDetail-spec-label">
                          {key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </dt>
                        <dd className="ProductDetail-spec-value">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {(displayProduct.owner || displayProduct.user) && (
                <div className="ProductDetail-owner">
                  <h2 className="ProductDetail-section-title">Proprietário</h2>
                  <div className="ProductDetail-owner-info">
                    <div className="ProductDetail-owner-avatar">
                      {(displayProduct.owner?.name || displayProduct.user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="ProductDetail-owner-details">
                      <div className="ProductDetail-owner-name">
                        {displayProduct.owner?.name || displayProduct.user?.name}
                        {(displayProduct.owner?.verified || displayProduct.user?.verified) && (
                          <span className="ProductDetail-owner-verified" title="Verificado">
                            ✓
                          </span>
                        )}
                      </div>
                      {(displayProduct.owner?.rating || displayProduct.user?.rating) && (
                        <div className="ProductDetail-owner-rating">
                          ★ {displayProduct.owner?.rating || displayProduct.user?.rating}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="ProductDetail-sidebar">
            <ReservationBox
              product={{
                id: displayProduct.id,
                price: displayProduct.price,
                ownerId: displayProduct.ownerId || displayProduct.userId || displayProduct.owner?.id || displayProduct.user?.id,
              }}
              unavailableDates={unavailableDates}
              onReservationSuccess={handleReservationSuccess}
            />
          </aside>
        </div>

        <div className="ProductDetail-reviews">
          <ReviewList reviews={mockReviews} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;


