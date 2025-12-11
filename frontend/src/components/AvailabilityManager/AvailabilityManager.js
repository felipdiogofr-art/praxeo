import React, { useState, useEffect } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth, isSameDay, startOfDay } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import ReservationService from '../../services/reservation.service';
import './AvailabilityManager.css';

/**
 * Componente para gerenciar disponibilidade de um produto
 * Mostra um calendário com as reservas confirmadas e ativas
 */
const AvailabilityManager = ({ productId }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Carregar reservas do produto
  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar todas as reservas do usuário como proprietário
        const response = await ReservationService.getReservations({ type: 'as_owner' });
        const allReservations = response.data || response;

        // Filtrar reservas deste produto e apenas confirmadas/ativas
        const productReservations = Array.isArray(allReservations)
          ? allReservations.filter(
              r => r.productId === productId &&
              (r.status === 'confirmed' || r.status === 'active' || r.status === 'pending')
            )
          : [];

        setReservations(productReservations);
      } catch (err) {
        console.error('Erro ao carregar reservas:', err);
        setError('Erro ao carregar reservas do produto');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadReservations();
    }
  }, [productId]);

  // Obter todas as datas ocupadas das reservas
  const getOccupiedDates = () => {
    const occupiedDates = new Set();
    
    reservations.forEach(reservation => {
      if (reservation.startDate && reservation.endDate) {
        const start = startOfDay(new Date(reservation.startDate));
        const end = startOfDay(new Date(reservation.endDate));
        
        const datesInRange = eachDayOfInterval({ start, end });
        datesInRange.forEach(date => {
          occupiedDates.add(format(date, 'yyyy-MM-dd'));
        });
      }
    });

    return Array.from(occupiedDates);
  };

  const occupiedDates = getOccupiedDates();

  // Verificar se uma data está ocupada
  const isDateOccupied = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return occupiedDates.includes(dateStr);
  };

  // Obter informações da reserva para uma data
  const getReservationForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reservations.find(r => {
      if (!r.startDate || !r.endDate) return false;
      const start = startOfDay(new Date(r.startDate));
      const end = startOfDay(new Date(r.endDate));
      const checkDate = startOfDay(date);
      return checkDate >= start && checkDate <= end;
    });
  };

  // Navegar meses
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Obter dias do mês
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Dias da semana
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Ajustar início do mês para começar na segunda-feira
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  if (loading) {
    return <div className="AvailabilityManager-loading">Carregando disponibilidade...</div>;
  }

  if (error) {
    return <div className="AvailabilityManager-error">{error}</div>;
  }

  return (
    <div className="AvailabilityManager">
      <div className="AvailabilityManager-header">
        <button
          type="button"
          className="AvailabilityManager-nav-button"
          onClick={prevMonth}
        >
          ‹
        </button>
        <h3 className="AvailabilityManager-month-title">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <button
          type="button"
          className="AvailabilityManager-nav-button"
          onClick={nextMonth}
        >
          ›
        </button>
      </div>

      <div className="AvailabilityManager-calendar">
        <div className="AvailabilityManager-weekdays">
          {weekDays.map(day => (
            <div key={day} className="AvailabilityManager-weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="AvailabilityManager-days">
          {/* Dias vazios do início do mês */}
          {emptyDays.map(day => (
            <div key={`empty-${day}`} className="AvailabilityManager-day AvailabilityManager-day-empty" />
          ))}

          {/* Dias do mês */}
          {daysInMonth.map(day => {
            const occupied = isDateOccupied(day);
            const reservation = occupied ? getReservationForDate(day) : null;
            const isToday = isSameDay(day, new Date());
            const isPast = day < startOfDay(new Date());

            let statusClass = 'AvailabilityManager-day';
            if (isPast) {
              statusClass += ' AvailabilityManager-day-past';
            } else if (occupied) {
              statusClass += ' AvailabilityManager-day-occupied';
            }
            if (isToday) {
              statusClass += ' AvailabilityManager-day-today';
            }

            return (
              <div
                key={format(day, 'yyyy-MM-dd')}
                className={statusClass}
                title={
                  occupied && reservation
                    ? `Reservado (${reservation.status}): ${format(new Date(reservation.startDate), 'dd/MM')} - ${format(new Date(reservation.endDate), 'dd/MM')}`
                    : isPast
                    ? 'Data passada'
                    : 'Disponível'
                }
              >
                <span className="AvailabilityManager-day-number">
                  {format(day, 'd')}
                </span>
                {occupied && (
                  <span className="AvailabilityManager-day-indicator" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="AvailabilityManager-legend">
        <div className="AvailabilityManager-legend-item">
          <div className="AvailabilityManager-legend-color AvailabilityManager-legend-available" />
          <span>Disponível</span>
        </div>
        <div className="AvailabilityManager-legend-item">
          <div className="AvailabilityManager-legend-color AvailabilityManager-legend-occupied" />
          <span>Reservado</span>
        </div>
        <div className="AvailabilityManager-legend-item">
          <div className="AvailabilityManager-legend-color AvailabilityManager-legend-past" />
          <span>Passado</span>
        </div>
      </div>

      {reservations.length > 0 && (
        <div className="AvailabilityManager-reservations">
          <h4>Próximas Reservas</h4>
          <ul className="AvailabilityManager-reservations-list">
            {reservations
              .filter(r => new Date(r.endDate) >= new Date())
              .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
              .slice(0, 5)
              .map(reservation => (
                <li key={reservation.id} className="AvailabilityManager-reservation-item">
                  <span className="AvailabilityManager-reservation-dates">
                    {format(new Date(reservation.startDate), 'dd/MM')} -{' '}
                    {format(new Date(reservation.endDate), 'dd/MM')}
                  </span>
                  <span className={`AvailabilityManager-reservation-status AvailabilityManager-reservation-status-${reservation.status}`}>
                    {reservation.status === 'pending' && 'Pendente'}
                    {reservation.status === 'confirmed' && 'Confirmada'}
                    {reservation.status === 'active' && 'Ativa'}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager;

