import React from 'react';
import { useParams } from 'react-router-dom';
import ReviewList from '../../components/ReviewList/ReviewList';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();

  // Mock data - será substituído por dados reais da API
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
  };

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="ProductDetail">
      <div className="container">
        <div className="ProductDetail-content">
          <div className="ProductDetail-main">
            <div className="ProductDetail-gallery">
              <div className="ProductDetail-main-image">
                <img
                  src={mockProduct.images[0]}
                  alt={mockProduct.name}
                  className="ProductDetail-image"
                />
              </div>
              <div className="ProductDetail-thumbnails">
                {mockProduct.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${mockProduct.name} - ${index + 1}`}
                    className="ProductDetail-thumbnail"
                  />
                ))}
              </div>
            </div>

            <div className="ProductDetail-info">
              <h1 className="ProductDetail-title">{mockProduct.name}</h1>
              <div className="ProductDetail-meta">
                <div className="ProductDetail-location">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{mockProduct.location} • {mockProduct.distance}</span>
                </div>
                <div className="ProductDetail-rating">
                  <span className="ProductDetail-rating-value">★ {mockProduct.rating}</span>
                  <span className="ProductDetail-reviews-count">
                    ({mockProduct.reviewsCount} avaliações)
                  </span>
                </div>
              </div>

              <div className="ProductDetail-description">
                <h2 className="ProductDetail-section-title">Descrição</h2>
                <p>{mockProduct.description}</p>
              </div>

              <div className="ProductDetail-specifications">
                <h2 className="ProductDetail-section-title">Especificações</h2>
                <dl className="ProductDetail-spec-list">
                  {Object.entries(mockProduct.specifications).map(([key, value]) => (
                    <div key={key} className="ProductDetail-spec-item">
                      <dt className="ProductDetail-spec-label">
                        {key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </dt>
                      <dd className="ProductDetail-spec-value">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="ProductDetail-owner">
                <h2 className="ProductDetail-section-title">Proprietário</h2>
                <div className="ProductDetail-owner-info">
                  <div className="ProductDetail-owner-avatar">
                    {mockProduct.owner.name.charAt(0)}
                  </div>
                  <div className="ProductDetail-owner-details">
                    <div className="ProductDetail-owner-name">
                      {mockProduct.owner.name}
                      {mockProduct.owner.verified && (
                        <span className="ProductDetail-owner-verified" title="Verificado">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="ProductDetail-owner-rating">
                      ★ {mockProduct.owner.rating}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="ProductDetail-sidebar">
            <div className="ProductDetail-reservation-box">
              <div className="ProductDetail-price">
                <span className="ProductDetail-price-value">
                  {formatPrice(mockProduct.price)}
                </span>
                <span className="ProductDetail-price-period">/dia</span>
              </div>
              <div className="ProductDetail-reservation-form">
                <label className="ProductDetail-form-label">Selecione as datas</label>
                <div className="ProductDetail-date-inputs">
                  <input
                    type="date"
                    className="ProductDetail-date-input"
                    placeholder="Data de início"
                  />
                  <input
                    type="date"
                    className="ProductDetail-date-input"
                    placeholder="Data de término"
                  />
                </div>
                <div className="ProductDetail-reservation-summary">
                  <div className="ProductDetail-summary-row">
                    <span>Aluguel (3 dias)</span>
                    <span>{formatPrice(mockProduct.price * 3)}</span>
                  </div>
                  <div className="ProductDetail-summary-row">
                    <span>Taxa de serviço</span>
                    <span>{formatPrice(mockProduct.price * 3 * 0.15)}</span>
                  </div>
                  <div className="ProductDetail-summary-row">
                    <span>
                      Caução
                      <span className="ProductDetail-tooltip" title="Valor bloqueado e devolvido após a devolução do equipamento">
                        ℹ️
                      </span>
                    </span>
                    <span>{formatPrice(mockProduct.price * 2)}</span>
                  </div>
                  <div className="ProductDetail-summary-total">
                    <span>Total</span>
                    <span>{formatPrice(mockProduct.price * 3 * 1.15 + mockProduct.price * 2)}</span>
                  </div>
                </div>
                <button className="ProductDetail-reserve-button">
                  Reservar Agora
                </button>
              </div>
            </div>
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


