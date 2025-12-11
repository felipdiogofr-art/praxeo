import api from './api';

/**
 * Serviço de Avaliações (Reviews)
 * 
 * Este módulo fornece funções para gerenciar avaliações de produtos,
 * incluindo criação, listagem e consulta de detalhes.
 * 
 * @module services/review
 */

/**
 * Cria uma nova avaliação
 * 
 * Requer autenticação (usuário deve estar logado).
 * Um usuário só pode avaliar um produto uma vez.
 * 
 * @param {Object} reviewData - Dados da avaliação
 * @param {string} reviewData.productId - ID do produto a ser avaliado
 * @param {number} reviewData.rating - Nota de 1 a 5
 * @param {string} [reviewData.comment] - Comentário da avaliação (opcional)
 * @param {string} [reviewData.reservationId] - ID da reserva relacionada (opcional)
 * @returns {Promise<Object>} Objeto contendo os dados da avaliação criada
 * @throws {Error} Erro caso os dados sejam inválidos, o usuário não esteja autenticado ou já tenha avaliado o produto
 * 
 * @example
 * try {
 *   const review = await ReviewService.createReview({
 *     productId: 'uuid-do-produto',
 *     rating: 5,
 *     comment: 'Excelente produto!',
 *     reservationId: 'uuid-da-reserva'
 *   });
 *   console.log('Avaliação criada:', review);
 * } catch (error) {
 *   if (error.status === 409) {
 *     console.error('Você já avaliou este produto');
 *   }
 * }
 */
export const createReview = async (reviewData) => {
  try {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lista todas as avaliações de um produto
 * 
 * Rota pública. Não requer autenticação.
 * 
 * @param {string} productId - ID do produto
 * @param {Object} [options={}] - Opções de paginação
 * @param {number} [options.page=1] - Número da página
 * @param {number} [options.limit=10] - Limite de itens por página
 * @returns {Promise<Object>} Objeto contendo array de avaliações, rating médio e metadados de paginação
 * @throws {Error} Erro caso o produto não seja encontrado ou ocorra falha na requisição
 * 
 * @example
 * try {
 *   const result = await ReviewService.getProductReviews('uuid-do-produto', {
 *     page: 1,
 *     limit: 10
 *   });
 *   console.log('Avaliações:', result.data.reviews);
 *   console.log('Rating médio:', result.data.averageRating);
 * } catch (error) {
 *   console.error('Erro ao buscar avaliações:', error.message);
 * }
 */
export const getProductReviews = async (productId, options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    const response = await api.get(`/reviews/product/${productId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtém detalhes de uma avaliação específica
 * 
 * Rota pública. Não requer autenticação.
 * 
 * @param {string} id - ID da avaliação
 * @returns {Promise<Object>} Objeto contendo os dados completos da avaliação
 * @throws {Error} Erro caso a avaliação não seja encontrada ou ocorra falha na requisição
 * 
 * @example
 * try {
 *   const review = await ReviewService.getReviewById('uuid-da-avaliacao');
 *   console.log('Detalhes da avaliação:', review);
 * } catch (error) {
 *   if (error.status === 404) {
 *     console.error('Avaliação não encontrada');
 *   }
 * }
 */
export const getReviewById = async (id) => {
  try {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Atualiza uma avaliação existente
 * 
 * Requer autenticação. Apenas o autor da avaliação pode atualizá-la.
 * 
 * @param {string} id - ID da avaliação a ser atualizada
 * @param {Object} reviewData - Dados da avaliação a serem atualizados
 * @param {number} [reviewData.rating] - Nova nota (1 a 5)
 * @param {string} [reviewData.comment] - Novo comentário
 * @returns {Promise<Object>} Objeto contendo os dados atualizados da avaliação
 * @throws {Error} Erro caso a avaliação não seja encontrada, o usuário não tenha permissão ou ocorra falha na requisição
 * 
 * @example
 * try {
 *   const updatedReview = await ReviewService.updateReview('uuid-da-avaliacao', {
 *     rating: 4,
 *     comment: 'Comentário atualizado'
 *   });
 *   console.log('Avaliação atualizada:', updatedReview);
 * } catch (error) {
 *   if (error.status === 403) {
 *     console.error('Você não tem permissão para atualizar esta avaliação');
 *   }
 * }
 */
export const updateReview = async (id, reviewData) => {
  try {
    const response = await api.put(`/reviews/${id}`, reviewData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Deleta uma avaliação
 * 
 * Requer autenticação. Apenas o autor da avaliação pode deletá-la.
 * 
 * @param {string} id - ID da avaliação a ser deletada
 * @returns {Promise<void>}
 * @throws {Error} Erro caso a avaliação não seja encontrada, o usuário não tenha permissão ou ocorra falha na requisição
 * 
 * @example
 * try {
 *   await ReviewService.deleteReview('uuid-da-avaliacao');
 *   console.log('Avaliação deletada com sucesso');
 * } catch (error) {
 *   if (error.status === 403) {
 *     console.error('Você não tem permissão para deletar esta avaliação');
 *   }
 * }
 */
export const deleteReview = async (id) => {
  try {
    await api.delete(`/reviews/${id}`);
  } catch (error) {
    throw error;
  }
};

// Exportar objeto com todas as funções para facilitar uso
const ReviewService = {
  createReview,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
};

export default ReviewService;

