import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { getProductById } from '../../services/product.service';
import { createReservation } from '../../services/reservation.service';
import './Checkout.css';

/**
 * Página de Checkout
 * 
 * Exibe resumo da reserva e permite preencher dados de entrega
 * para confirmar a reserva de um produto.
 */
const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [reservationData, setReservationData] = useState(null);
  const [reservationSummary, setReservationSummary] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  // Obter dados da reserva do state ou localStorage
  useEffect(() => {
    // Tentar obter do state da navegação
    const stateData = location.state;
    
    if (stateData && stateData.productId && stateData.startDate && stateData.endDate) {
      setReservationData(stateData);
      loadProduct(stateData.productId);
      calculateSummary(stateData);
    } else {
      // Tentar obter do localStorage como fallback
      const savedData = localStorage.getItem('checkoutData');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setReservationData(parsed);
          loadProduct(parsed.productId);
          calculateSummary(parsed);
        } catch (e) {
          setError('Dados de reserva inválidos. Por favor, selecione as datas novamente.');
          setLoading(false);
        }
      } else {
        setError('Nenhuma reserva encontrada. Por favor, selecione um produto e as datas.');
        setLoading(false);
      }
    }
  }, [location]);

  // Verificar autenticação
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Salvar dados no localStorage antes de redirecionar
      if (reservationData) {
        localStorage.setItem('checkoutData', JSON.stringify(reservationData));
      }
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
    }
  }, [isAuthenticated, loading, navigate, location, reservationData]);

  /**
   * Carrega os dados do produto
   */
  const loadProduct = async (productId) => {
    try {
      setLoading(true);
      const response = await getProductById(productId);
      const productData = response.data;
      setProduct(productData);
      setError(null);
      
      // Calcular resumo após carregar produto
      if (reservationData) {
        calculateSummaryWithProduct(reservationData, productData);
      }
    } catch (err) {
      console.error('Erro ao carregar produto:', err);
      setError('Erro ao carregar informações do produto. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula o resumo financeiro da reserva
   */
  const calculateSummary = (data) => {
    // Se o produto ainda não foi carregado, usar preço dos dados se disponível
    const productPrice = product?.price || data.price || 0;
    if (productPrice === 0) return;

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const rentalPrice = productPrice * days;
    const serviceFee = rentalPrice * 0.15; // 15% de taxa de serviço
    const deposit = productPrice * 2; // Caução de 2 dias
    const total = rentalPrice + serviceFee + deposit;

    setReservationSummary({
      days,
      rentalPrice,
      serviceFee,
      deposit,
      total,
      startDate: data.startDate,
      endDate: data.endDate
    });
  };

  /**
   * Calcula o resumo financeiro com produto já carregado
   */
  const calculateSummaryWithProduct = (data, productData) => {
    const productPrice = productData?.price || 0;
    if (productPrice === 0) return;

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const rentalPrice = productPrice * days;
    const serviceFee = rentalPrice * 0.15; // 15% de taxa de serviço
    const deposit = productPrice * 2; // Caução de 2 dias
    const total = rentalPrice + serviceFee + deposit;

    setReservationSummary({
      days,
      rentalPrice,
      serviceFee,
      deposit,
      total,
      startDate: data.startDate,
      endDate: data.endDate
    });
  };

  /**
   * Formata preço para exibição
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  /**
   * Formata data para exibição
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  /**
   * Submete o formulário e cria a reserva
   */
  const onSubmit = async (formData) => {
    if (!reservationData || !product) {
      setError('Dados de reserva incompletos. Por favor, tente novamente.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const reservationPayload = {
        productId: reservationData.productId,
        startDate: reservationData.startDate,
        endDate: reservationData.endDate,
        deliveryAddress: formData.deliveryAddress,
        deliveryCep: formData.deliveryCep,
        deliveryCity: formData.deliveryCity,
        deliveryState: formData.deliveryState,
        deliveryPhone: formData.deliveryPhone,
        notes: formData.notes
      };

      const response = await createReservation(reservationPayload);
      
      // Limpar dados do localStorage
      localStorage.removeItem('checkoutData');
      
      // Redirecionar para página de confirmação
      navigate('/reserva/confirmacao', {
        state: {
          reservation: response.data,
          product: product
        },
        replace: true
      });
    } catch (err) {
      console.error('Erro ao criar reserva:', err);
      
      let errorMessage = 'Erro ao processar a reserva. Por favor, tente novamente.';
      
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || err.response.data?.error;
        
        if (status === 400) {
          errorMessage = message || 'Dados inválidos. Verifique as informações e tente novamente.';
        } else if (status === 401) {
          errorMessage = 'Você precisa estar logado para fazer uma reserva.';
          navigate('/login', { state: { from: location.pathname } });
        } else if (status === 404) {
          errorMessage = 'Produto não encontrado ou não está mais disponível.';
        } else if (status === 409) {
          errorMessage = message || 'O produto não está disponível para o período selecionado.';
        } else {
          errorMessage = message || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="Checkout">
        <div className="container">
          <div className="Checkout-loading">
            <div className="Checkout-spinner"></div>
            <p>Carregando informações da reserva...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !product) {
    return (
      <div className="Checkout">
        <div className="container">
          <div className="Checkout-error">
            <h2>Erro ao carregar reserva</h2>
            <p>{error}</p>
            <button 
              className="Checkout-button-secondary"
              onClick={() => navigate(-1)}
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !reservationSummary) {
    return null;
  }

  return (
    <div className="Checkout">
      <div className="container">
        <div className="Checkout-header">
          <h1>Finalizar Reserva</h1>
          <p className="Checkout-subtitle">Revise os detalhes e complete sua reserva</p>
        </div>

        <div className="Checkout-content">
          <div className="Checkout-main">
            {/* Resumo do Produto */}
            <section className="Checkout-section">
              <h2 className="Checkout-section-title">Produto Reservado</h2>
              <div className="Checkout-product">
                {product.images && product.images.length > 0 && (
                  <img 
                    src={product.images[0]} 
                    alt={product.title}
                    className="Checkout-product-image"
                  />
                )}
                <div className="Checkout-product-info">
                  <h3>{product.title}</h3>
                  {product.category && (
                    <span className="Checkout-product-category">{product.category}</span>
                  )}
                  <div className="Checkout-product-price">
                    {formatPrice(product.price)} <span>/dia</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Formulário de Entrega */}
            <section className="Checkout-section">
              <h2 className="Checkout-section-title">Dados de Entrega</h2>
              
              {error && (
                <div className="Checkout-error-message">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="Checkout-form">
                <div className="Checkout-form-row">
                  <div className="Checkout-form-group">
                    <label htmlFor="deliveryCep">CEP *</label>
                    <input
                      type="text"
                      id="deliveryCep"
                      {...register('deliveryCep', {
                        required: 'CEP é obrigatório',
                        pattern: {
                          value: /^\d{5}-?\d{3}$/,
                          message: 'CEP inválido'
                        }
                      })}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {errors.deliveryCep && (
                      <span className="Checkout-form-error">{errors.deliveryCep.message}</span>
                    )}
                  </div>

                  <div className="Checkout-form-group Checkout-form-group-full">
                    <label htmlFor="deliveryAddress">Endereço Completo *</label>
                    <input
                      type="text"
                      id="deliveryAddress"
                      {...register('deliveryAddress', {
                        required: 'Endereço é obrigatório',
                        minLength: {
                          value: 10,
                          message: 'Endereço deve ter pelo menos 10 caracteres'
                        }
                      })}
                      placeholder="Rua, número, complemento"
                    />
                    {errors.deliveryAddress && (
                      <span className="Checkout-form-error">{errors.deliveryAddress.message}</span>
                    )}
                  </div>
                </div>

                <div className="Checkout-form-row">
                  <div className="Checkout-form-group">
                    <label htmlFor="deliveryCity">Cidade *</label>
                    <input
                      type="text"
                      id="deliveryCity"
                      {...register('deliveryCity', {
                        required: 'Cidade é obrigatória'
                      })}
                      placeholder="São Paulo"
                    />
                    {errors.deliveryCity && (
                      <span className="Checkout-form-error">{errors.deliveryCity.message}</span>
                    )}
                  </div>

                  <div className="Checkout-form-group">
                    <label htmlFor="deliveryState">Estado *</label>
                    <input
                      type="text"
                      id="deliveryState"
                      {...register('deliveryState', {
                        required: 'Estado é obrigatório',
                        maxLength: {
                          value: 2,
                          message: 'Digite apenas a sigla do estado (ex: SP)'
                        }
                      })}
                      placeholder="SP"
                      maxLength={2}
                      style={{ textTransform: 'uppercase' }}
                    />
                    {errors.deliveryState && (
                      <span className="Checkout-form-error">{errors.deliveryState.message}</span>
                    )}
                  </div>
                </div>

                <div className="Checkout-form-group">
                  <label htmlFor="deliveryPhone">Telefone para Contato *</label>
                  <input
                    type="tel"
                    id="deliveryPhone"
                    {...register('deliveryPhone', {
                      required: 'Telefone é obrigatório',
                      pattern: {
                        value: /^[\d\s\(\)\-]+$/,
                        message: 'Telefone inválido'
                      }
                    })}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.deliveryPhone && (
                    <span className="Checkout-form-error">{errors.deliveryPhone.message}</span>
                  )}
                </div>

                <div className="Checkout-form-group">
                  <label htmlFor="notes">Observações (opcional)</label>
                  <textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Instruções especiais de entrega, horário preferencial, etc."
                    rows={4}
                  />
                </div>

                <div className="Checkout-form-actions">
                  <button
                    type="button"
                    className="Checkout-button-secondary"
                    onClick={() => navigate(-1)}
                    disabled={submitting}
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="Checkout-button-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Processando...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Resumo da Reserva */}
          <aside className="Checkout-sidebar">
            <div className="Checkout-summary">
              <h2 className="Checkout-summary-title">Resumo da Reserva</h2>
              
              <div className="Checkout-summary-dates">
                <div className="Checkout-summary-date-item">
                  <span className="Checkout-summary-date-label">Check-in</span>
                  <span className="Checkout-summary-date-value">
                    {formatDate(reservationSummary.startDate)}
                  </span>
                </div>
                <div className="Checkout-summary-date-item">
                  <span className="Checkout-summary-date-label">Check-out</span>
                  <span className="Checkout-summary-date-value">
                    {formatDate(reservationSummary.endDate)}
                  </span>
                </div>
                <div className="Checkout-summary-date-item">
                  <span className="Checkout-summary-date-label">Período</span>
                  <span className="Checkout-summary-date-value">
                    {reservationSummary.days} {reservationSummary.days === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
              </div>

              <div className="Checkout-summary-breakdown">
                <div className="Checkout-summary-row">
                  <span>Aluguel ({reservationSummary.days} {reservationSummary.days === 1 ? 'dia' : 'dias'})</span>
                  <span>{formatPrice(reservationSummary.rentalPrice)}</span>
                </div>
                <div className="Checkout-summary-row">
                  <span>
                    Taxa de serviço
                    <span className="Checkout-tooltip" title="Taxa de 15% para manutenção da plataforma">
                      ℹ️
                    </span>
                  </span>
                  <span>{formatPrice(reservationSummary.serviceFee)}</span>
                </div>
                <div className="Checkout-summary-row">
                  <span>
                    Caução
                    <span className="Checkout-tooltip" title="Valor bloqueado e devolvido após a devolução do equipamento em bom estado">
                      ℹ️
                    </span>
                  </span>
                  <span>{formatPrice(reservationSummary.deposit)}</span>
                </div>
                <div className="Checkout-summary-total">
                  <span>Total</span>
                  <span>{formatPrice(reservationSummary.total)}</span>
                </div>
              </div>

              <div className="Checkout-summary-note">
                <p>
                  <strong>Importante:</strong> A caução será bloqueada em seu cartão e devolvida 
                  após a devolução do equipamento em bom estado.
                </p>
                <p>
                  O pagamento será processado após a confirmação do proprietário.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

