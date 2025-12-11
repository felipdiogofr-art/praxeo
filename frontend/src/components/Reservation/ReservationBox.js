import React, { useState } from 'react';
import { differenceInDays, format } from 'date-fns';
import AvailabilityCalendar from './AvailabilityCalendar';
import ReservationService from '../../services/reservation.service';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ReservationBox.css';

const ReservationBox = ({ 
  product, 
  unavailableDates = [],
  onReservationSuccess 
}) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [selectedDates, setSelectedDates] = useState(null);
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState(null);

  // Constantes de cálculo
  const SERVICE_FEE_RATE = 0.15; // 15% de taxa de serviço
  const DEPOSIT_MULTIPLIER = 2; // Caução = 2x o preço diário

  // Calcula os valores da reserva
  const calculateReservationCosts = (startDate, endDate) => {
    if (!startDate || !endDate || !product?.price) {
      return null;
    }

    const days = differenceInDays(endDate, startDate) + 1;
    const dailyPrice = parseFloat(product.price);
    const monthlyPrice = product.monthlyPrice ? parseFloat(product.monthlyPrice) : null;
    const DAYS_IN_MONTH = 30;
    
    let rentalTotal;
    let pricingType = 'daily';
    let months = 0;
    let remainingDays = 0;

    // Verificar se deve usar preço mensal (período >= 30 dias e preço mensal disponível)
    if (days >= DAYS_IN_MONTH && monthlyPrice) {
      months = Math.floor(days / DAYS_IN_MONTH);
      remainingDays = days % DAYS_IN_MONTH;
      const monthlyTotal = months * monthlyPrice;
      const dailyTotal = remainingDays * dailyPrice;
      rentalTotal = monthlyTotal + dailyTotal;
      pricingType = 'monthly';
    } else {
      rentalTotal = dailyPrice * days;
    }
    
    const serviceFee = rentalTotal * SERVICE_FEE_RATE;
    const deposit = dailyPrice * DEPOSIT_MULTIPLIER;
    const total = rentalTotal + serviceFee + deposit;

    return {
      days,
      months,
      remainingDays,
      pricingType,
      rentalTotal,
      serviceFee,
      deposit,
      total,
    };
  };

  // Manipula a seleção de datas do calendário
  const handleDateRangeSelect = ({ startDate, endDate }) => {
    setSelectedDates({ startDate, endDate });
    setError(null);
  };

  // Formata preço para exibição
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  // Manipula o clique no botão de reservar
  const handleReserve = async () => {
    // Verificar autenticação
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    // Verificar se há datas selecionadas
    if (!selectedDates) {
      setError('Por favor, selecione as datas da reserva');
      return;
    }

    // Verificar se o usuário não é o dono do produto
    if (user?.id === product?.ownerId || user?.id === product?.userId) {
      setError('Você não pode reservar seu próprio produto');
      return;
    }

    try {
      setIsReserving(true);
      setError(null);

      const reservationData = {
        productId: product.id,
        startDate: format(selectedDates.startDate, 'yyyy-MM-dd'),
        endDate: format(selectedDates.endDate, 'yyyy-MM-dd'),
      };

      const reservation = await ReservationService.createReservation(reservationData);

      // Limpar seleção
      setSelectedDates(null);

      // Chamar callback de sucesso se fornecido
      if (onReservationSuccess) {
        onReservationSuccess(reservation);
      } else {
        // Redirecionar para página de reservas ou mostrar mensagem
        navigate('/reservas');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao criar reserva. Tente novamente.';
      setError(errorMessage);
      console.error('Erro ao criar reserva:', err);
    } finally {
      setIsReserving(false);
    }
  };

  const costs = selectedDates 
    ? calculateReservationCosts(selectedDates.startDate, selectedDates.endDate)
    : null;

  return (
    <div className="ReservationBox">
      <div className="ReservationBox-price">
        <span className="ReservationBox-price-value">
          {formatPrice(product?.price || 0)}
        </span>
        <span className="ReservationBox-price-period">/dia</span>
      </div>

      <div className="ReservationBox-calendar">
        <AvailabilityCalendar
          unavailableDates={unavailableDates}
          onDateRangeSelect={handleDateRangeSelect}
          minDate={new Date()}
        />
      </div>

      {costs && (
        <div className="ReservationBox-summary">
          <div className="ReservationBox-summary-row">
            <span>
              {costs.pricingType === 'monthly' ? (
                <>
                  Aluguel ({costs.months} {costs.months === 1 ? 'mês' : 'meses'}
                  {costs.remainingDays > 0 && ` + ${costs.remainingDays} ${costs.remainingDays === 1 ? 'dia' : 'dias'}`})
                </>
              ) : (
                <>Aluguel ({costs.days} {costs.days === 1 ? 'dia' : 'dias'})</>
              )}
            </span>
            <span>{formatPrice(costs.rentalTotal)}</span>
          </div>
          <div className="ReservationBox-summary-row">
            <span>Taxa de serviço</span>
            <span>{formatPrice(costs.serviceFee)}</span>
          </div>
          <div className="ReservationBox-summary-row">
            <span>
              Caução
              <span 
                className="ReservationBox-tooltip" 
                title="Valor bloqueado e devolvido após a devolução do equipamento"
              >
                ℹ️
              </span>
            </span>
            <span>{formatPrice(costs.deposit)}</span>
          </div>
          <div className="ReservationBox-summary-total">
            <span>Total</span>
            <span>{formatPrice(costs.total)}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="ReservationBox-error" role="alert">
          {error}
        </div>
      )}

      <button
        className="ReservationBox-button"
        onClick={handleReserve}
        disabled={!selectedDates || isReserving}
      >
        {isReserving ? 'Processando...' : 'Reservar Agora'}
      </button>

      {!isAuthenticated && (
        <p className="ReservationBox-login-hint">
          Você precisa estar logado para fazer uma reserva
        </p>
      )}
    </div>
  );
};

export default ReservationBox;

