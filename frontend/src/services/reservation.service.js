import api from './api';

/**
 * Serviço de Reservas
 * 
 * Este módulo fornece funções para gerenciar reservas,
 * incluindo criação, listagem e consulta de detalhes.
 * 
 * @module services/reservation
 */

/**
 * Cria uma nova reserva
 * 
 * Requer autenticação (usuário deve estar logado).
 * 
 * @param {Object} reservationData - Dados da reserva
 * @param {string|number} reservationData.productId - ID do produto a ser reservado
 * @param {string} reservationData.startDate - Data de início da reserva (ISO 8601 ou formato aceito pelo backend)
 * @param {string} reservationData.endDate - Data de término da reserva (ISO 8601 ou formato aceito pelo backend)
 * @param {string} [reservationData.deliveryAddress] - Endereço de entrega (opcional)
 * @param {string} [reservationData.notes] - Observações da reserva (opcional)
 * @returns {Promise<Object>} Objeto contendo os dados da reserva criada
 * @throws {Error} Erro caso os dados sejam inválidos, o produto não esteja disponível, o usuário não esteja autenticado ou ocorra falha na requisição
 * 
 * @example
 * try {
 *   const reservation = await ReservationService.createReservation({
 *     productId: 1,
 *     startDate: '2024-01-15',
 *     endDate: '2024-01-20',
 *     deliveryAddress: 'Rua Exemplo, 123 - São Paulo, SP',
 *     notes: 'Favor entregar no horário comercial'
 *   });
 *   console.log('Reserva criada:', reservation);
 * } catch (error) {
 *   if (error.status === 400) {
 *     console.error('Produto não disponível nas datas selecionadas');
 *   }
 * }
 */
export const createReservation = async (reservationData) => {
  try {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lista todas as reservas do usuário logado
 * 
 * Requer autenticação. Retorna reservas onde o usuário é locatário (fez a reserva)
 * ou proprietário (é dono do produto reservado).
 * 
 * @param {Object} [filters={}] - Filtros opcionais para buscar reservas
 * @param {string} [filters.status] - Filtrar por status ('pending', 'confirmed', 'completed', 'cancelled')
 * @param {string} [filters.role] - Filtrar por papel do usuário ('renter' para reservas feitas, 'owner' para reservas recebidas)
 * @param {string} [filters.startDate] - Filtrar reservas a partir desta data
 * @param {string} [filters.endDate] - Filtrar reservas até esta data
 * @param {number} [filters.page] - Número da página para paginação
 * @param {number} [filters.limit] - Limite de itens por página
 * @returns {Promise<Object>} Objeto contendo array de reservas e metadados (total, page, limit)
 * @throws {Error} Erro caso o usuário não esteja autenticado ou ocorra falha na requisição
 * 
 * @example
 * // Buscar todas as reservas
 * const reservations = await ReservationService.getReservations();
 * 
 * @example
 * // Buscar apenas reservas pendentes
 * const reservations = await ReservationService.getReservations({
 *   status: 'pending'
 * });
 * 
 * @example
 * // Buscar reservas como proprietário
 * const myProductsReservations = await ReservationService.getReservations({
 *   role: 'owner'
 * });
 */
export const getReservations = async (filters = {}) => {
  try {
    // Construir query string com os filtros
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const url = queryString ? `/reservations?${queryString}` : '/reservations';

    const response = await api.get(url);
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém detalhes de uma reserva específica
 * 
 * A autenticação é opcional. Se autenticado, verifica se o usuário tem permissão
 * para ver a reserva (se é o locatário ou o proprietário do produto).
 * 
 * @param {string|number} id - ID da reserva
 * @returns {Promise<Object>} Objeto contendo os dados completos da reserva
 * @throws {Error} Erro caso a reserva não seja encontrada, o usuário não tenha permissão ou ocorra falha na requisição
 * 
 * @example
 * try {
 *   const reservation = await ReservationService.getReservationById(1);
 *   console.log('Detalhes da reserva:', reservation);
 * } catch (error) {
 *   if (error.status === 404) {
 *     console.error('Reserva não encontrada');
 *   } else if (error.status === 403) {
 *     console.error('Você não tem permissão para ver esta reserva');
 *   }
 * }
 */
export const getReservationById = async (id) => {
  try {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Atualiza o status de uma reserva
 * 
 * Requer autenticação. Apenas o proprietário do produto pode atualizar o status.
 * 
 * @param {string|number} id - ID da reserva
 * @param {string} status - Novo status ('pending', 'confirmed', 'completed', 'cancelled')
 * @returns {Promise<Object>} Objeto contendo os dados atualizados da reserva
 * @throws {Error} Erro caso a reserva não seja encontrada, o usuário não tenha permissão ou ocorra falha na requisição
 * 
 * @example
 * try {
 *   const updatedReservation = await ReservationService.updateReservationStatus(1, 'confirmed');
 *   console.log('Status atualizado:', updatedReservation);
 * } catch (error) {
 *   console.error('Erro ao atualizar status:', error.message);
 * }
 */
export const updateReservationStatus = async (id, status) => {
  try {
    const response = await api.put(`/reservations/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Exportar objeto com todas as funções para facilitar uso
const ReservationService = {
  createReservation,
  getReservations,
  getReservationById,
  updateReservationStatus,
};

export default ReservationService;
