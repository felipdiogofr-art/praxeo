const ReservationService = require('../services/reservation.service');

/**
 * Controller de Reservas
 * Gerencia requisições HTTP relacionadas a reservas
 */
class ReservationController {
  /**
   * POST /api/reservations
   * Cria uma nova reserva (requer autenticação)
   */
  static async createReservation(req, res) {
    try {
      const reservation = await ReservationService.createReservation(
        req.body,
        req.userId
      );

      return res.status(201).json({
        message: 'Reserva criada com sucesso',
        data: reservation
      });
    } catch (error) {
      console.error('Erro ao criar reserva:', error);

      if (error.message.includes('obrigatório') ||
          error.message.includes('não encontrado') ||
          error.message.includes('disponível') ||
          error.message.includes('passado') ||
          error.message.includes('posterior')) {
        return res.status(400).json({
          error: 'Erro de validação',
          message: error.message
        });
      }

      if (error.message.includes('próprio produto')) {
        return res.status(403).json({
          error: 'Ação não permitida',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Erro ao criar reserva',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }

  /**
   * GET /api/reservations
   * Lista reservas do usuário (requer autenticação)
   */
  static async getReservations(req, res) {
    try {
      const type = req.query.type || 'all'; // 'all', 'as_renter', 'as_owner'

      const reservations = await ReservationService.getUserReservations(
        req.userId,
        type
      );

      return res.status(200).json({
        message: 'Reservas listadas com sucesso',
        data: reservations
      });
    } catch (error) {
      console.error('Erro ao listar reservas:', error);

      return res.status(500).json({
        error: 'Erro ao listar reservas',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }

  /**
   * GET /api/reservations/:id
   * Busca uma reserva por ID
   */
  static async getReservationById(req, res) {
    try {
      const { id } = req.params;

      const reservation = await ReservationService.getReservationById(id);

      // Verificar se o usuário tem permissão para ver esta reserva
      const isRenter = reservation.userId === req.userId;
      const isOwner = reservation.product && reservation.product.userId === req.userId;

      if (!isRenter && !isOwner && !req.user) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem permissão para visualizar esta reserva'
        });
      }

      return res.status(200).json({
        message: 'Reserva encontrada',
        data: reservation
      });
    } catch (error) {
      console.error('Erro ao buscar reserva:', error);

      if (error.message === 'Reserva não encontrada') {
        return res.status(404).json({
          error: 'Reserva não encontrada',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Erro ao buscar reserva',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }

  /**
   * PUT /api/reservations/:id/status
   * Atualiza o status de uma reserva (requer autenticação)
   */
  static async updateReservationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          error: 'Status é obrigatório',
          message: 'Forneça o novo status da reserva'
        });
      }

      const reservation = await ReservationService.updateReservationStatus(
        id,
        status,
        req.userId
      );

      return res.status(200).json({
        message: 'Status da reserva atualizado com sucesso',
        data: reservation
      });
    } catch (error) {
      console.error('Erro ao atualizar status da reserva:', error);

      if (error.message === 'Reserva não encontrada') {
        return res.status(404).json({
          error: 'Reserva não encontrada',
          message: error.message
        });
      }

      if (error.message.includes('permissão') || 
          error.message.includes('cancelar') ||
          error.message.includes('Status inválido')) {
        return res.status(400).json({
          error: 'Erro de validação',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Erro ao atualizar status da reserva',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }
}

module.exports = ReservationController;

