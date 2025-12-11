import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import './AvailabilityCalendar.css';

const AvailabilityCalendar = ({ 
  unavailableDates = [], 
  onDateRangeSelect,
  minDate = new Date(),
  maxDate = null 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Converte array de strings/datas para objetos Date
  const unavailableDatesSet = unavailableDates.map(date => 
    typeof date === 'string' ? startOfDay(new Date(date)) : startOfDay(date)
  );

  // Verifica se uma data está indisponível
  const isUnavailable = (date) => {
    return unavailableDatesSet.some(unavailable => isSameDay(date, unavailable));
  };

  // Verifica se uma data está selecionada
  const isSelected = (date) => {
    if (!startDate) return false;
    if (!endDate) return isSameDay(date, startDate);
    return (
      (isSameDay(date, startDate) || isSameDay(date, endDate)) ||
      (date >= startDate && date <= endDate)
    );
  };

  // Verifica se uma data está no intervalo de seleção
  const isInRange = (date) => {
    if (!startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  // Verifica se uma data pode ser selecionada
  const isSelectable = (date) => {
    const today = startOfDay(new Date());
    const dateToCheck = startOfDay(date);
    
    // Não pode selecionar datas passadas
    if (isBefore(dateToCheck, today)) return false;
    
    // Não pode selecionar datas além do máximo
    if (maxDate && dateToCheck > startOfDay(maxDate)) return false;
    
    // Não pode selecionar datas indisponíveis
    if (isUnavailable(dateToCheck)) return false;
    
    return true;
  };

  // Manipula o clique em uma data
  const handleDateClick = (date) => {
    if (!isSelectable(date)) return;

    const dateToSelect = startOfDay(date);

    if (!startDate || (startDate && endDate)) {
      // Inicia nova seleção
      setStartDate(dateToSelect);
      setEndDate(null);
      setIsSelecting(true);
    } else if (startDate && !endDate) {
      // Completa a seleção
      if (dateToSelect < startDate) {
        // Se clicou em data anterior, inverte
        setEndDate(startDate);
        setStartDate(dateToSelect);
      } else {
        setEndDate(dateToSelect);
      }
      setIsSelecting(false);
      
      // Valida se todas as datas no intervalo estão disponíveis
      const allAvailable = eachDayOfInterval({
        start: startDate < dateToSelect ? startDate : dateToSelect,
        end: startDate < dateToSelect ? dateToSelect : startDate
      }).every(day => isSelectable(day));

      if (allAvailable && onDateRangeSelect) {
        const finalStart = startDate < dateToSelect ? startDate : dateToSelect;
        const finalEnd = startDate < dateToSelect ? dateToSelect : startDate;
        onDateRangeSelect({ startDate: finalStart, endDate: finalEnd });
      } else if (!allAvailable) {
        // Se houver datas indisponíveis no intervalo, reseta
        setStartDate(null);
        setEndDate(null);
      }
    }
  };

  // Navegação do calendário
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Gera os dias do mês
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Dias da semana
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Adiciona dias vazios no início para alinhar com o primeiro dia do mês
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  return (
    <div className="AvailabilityCalendar">
      <div className="AvailabilityCalendar-header">
        <button 
          className="AvailabilityCalendar-nav"
          onClick={goToPreviousMonth}
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <h3 className="AvailabilityCalendar-month">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <button 
          className="AvailabilityCalendar-nav"
          onClick={goToNextMonth}
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      <div className="AvailabilityCalendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="AvailabilityCalendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="AvailabilityCalendar-grid">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="AvailabilityCalendar-day AvailabilityCalendar-day-empty" />
        ))}
        {daysInMonth.map(day => {
          const selectable = isSelectable(day);
          const selected = isSelected(day);
          const inRange = isInRange(day);
          const unavailable = isUnavailable(day);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              className={`AvailabilityCalendar-day ${
                !selectable ? 'AvailabilityCalendar-day-disabled' : ''
              } ${
                unavailable ? 'AvailabilityCalendar-day-unavailable' : ''
              } ${
                selected ? 'AvailabilityCalendar-day-selected' : ''
              } ${
                inRange ? 'AvailabilityCalendar-day-in-range' : ''
              } ${
                isToday ? 'AvailabilityCalendar-day-today' : ''
              }`}
              onClick={() => handleDateClick(day)}
              disabled={!selectable}
              aria-label={format(day, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {startDate && (
        <div className="AvailabilityCalendar-selection">
          <span className="AvailabilityCalendar-selection-label">Período selecionado:</span>
          <span className="AvailabilityCalendar-selection-dates">
            {format(startDate, 'dd/MM/yyyy', { locale: ptBR })}
            {endDate && ` - ${format(endDate, 'dd/MM/yyyy', { locale: ptBR })}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;

