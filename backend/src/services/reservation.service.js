const { Reservation, Product, User, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Serviço de Reservas
 * Gerencia lógica de negócio relacionada a reservas
 */
class ReservationService {
  /**
   * Valida disponibilidade de um produto para um período
   * @param {string} productId - ID do produto
   * @param {Date} startDate - Data de início
   * @param {Date} endDate - Data de término
   * @param {string} excludeReservationId - ID de reserva a excluir da verificação (para atualizações)
   * @returns {boolean} - true se disponível, false caso contrário
   */
  static async checkAvailability(productId, startDate, endDate, excludeReservationId = null) {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    if (!product.availability) {
      return false;
    }

    // Verificar conflitos com reservas existentes
    const where = {
      productId,
      status: {
        [Op.in]: ['pending', 'confirmed', 'active']
      },
      [Op.or]: [
        // Reserva começa durante o período solicitado
        {
          startDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        // Reserva termina durante o período solicitado
        {
          endDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        // Reserva engloba completamente o período solicitado
        {
          [Op.and]: [
            { startDate: { [Op.lte]: startDate } },
            { endDate: { [Op.gte]: endDate } }
          ]
        }
      ]
    };

    // Excluir reserva atual se estiver atualizando
    if (excludeReservationId) {
      where.id = { [Op.ne]: excludeReservationId };
    }

    const conflictingReservation = await Reservation.findOne({ where });

    return !conflictingReservation;
  }

  /**
   * Calcula o preço total de uma reserva
   * @param {string} productId - ID do produto
   * @param {Date} startDate - Data de início
   * @param {Date} endDate - Data de término
   * @returns {number} - Preço total
   */
  static async calculateTotalPrice(productId, startDate, endDate) {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Calcular número de dias
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      throw new Error('O período de reserva deve ser de pelo menos 1 dia');
    }

    // Calcular preço total (dias × preço diário)
    const totalPrice = parseFloat(product.price) * diffDays;

    return totalPrice;
  }

  /**
   * Cria uma nova reserva
   * @param {Object} reservationData - Dados da reserva
   * @param {string} userId - ID do usuário que está fazendo a reserva
   * @returns {Object} - Reserva criada
   */
  static async createReservation(reservationData, userId) {
    const { productId, startDate, endDate } = reservationData;

    // Validações básicas
    if (!productId || !startDate || !endDate) {
      throw new Error('ProductId, data de início e data de término são obrigatórios');
    }

    // Verificar se o produto existe
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Verificar se o usuário não é o proprietário do produto
    if (product.userId === userId) {
      throw new Error('Você não pode reservar seu próprio produto');
    }

    // Validar datas
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      throw new Error('A data de início não pode ser no passado');
    }

    if (end <= start) {
      throw new Error('A data de término deve ser posterior à data de início');
    }

    // Verificar disponibilidade
    const isAvailable = await this.checkAvailability(productId, startDate, endDate);
    if (!isAvailable) {
      throw new Error('O produto não está disponível para o período selecionado');
    }

    // Calcular preço total
    const totalPrice = await this.calculateTotalPrice(productId, startDate, endDate);

    // Criar reserva
    const reservation = await Reservation.create({
      productId,
      userId,
      startDate,
      endDate,
      totalPrice,
      status: 'pending'
    });

    // Buscar reserva completa com relacionamentos
    return await this.getReservationById(reservation.id);
  }

  /**
   * Lista reservas do usuário
   * @param {string} userId - ID do usuário
   * @param {string} type - Tipo de listagem: 'all', 'as_renter', 'as_owner'
   * @returns {Array} - Lista de reservas
   */
  static async getUserReservations(userId, type = 'all') {
    const where = {};

    if (type === 'as_renter') {
      where.userId = userId;
    } else if (type === 'as_owner') {
      // Buscar reservas de produtos do usuário
      const userProducts = await Product.findAll({
        where: { userId },
        attributes: ['id']
      });
      const productIds = userProducts.map(p => p.id);
      where.productId = { [Op.in]: productIds };
    } else {
      // Buscar todas as reservas relacionadas ao usuário (como locatário ou proprietário)
      const userProducts = await Product.findAll({
        where: { userId },
        attributes: ['id']
      });
      const productIds = userProducts.map(p => p.id);
      where[Op.or] = [
        { userId },
        { productId: { [Op.in]: productIds } }
      ];
    }

    const reservations = await Reservation.findAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        },
        {
          model: User,
          as: 'renter',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return reservations.map(r => r.toJSON());
  }

  /**
   * Busca uma reserva por ID
   * @param {string} reservationId - ID da reserva
   * @returns {Object} - Dados da reserva
   */
  static async getReservationById(reservationId) {
    const reservation = await Reservation.findByPk(reservationId, {
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: User,
              as: 'owner',
              attributes: ['id', 'name', 'email', 'phone']
            }
          ]
        },
        {
          model: User,
          as: 'renter',
          attributes: ['id', 'name', 'email', 'phone']
        }
      ]
    });

    if (!reservation) {
      throw new Error('Reserva não encontrada');
    }

    return reservation.toJSON();
  }

  /**
   * Atualiza o status de uma reserva
   * @param {string} reservationId - ID da reserva
   * @param {string} status - Novo status
   * @param {string} userId - ID do usuário (para verificar permissão)
   * @returns {Object} - Reserva atualizada
   */
  static async updateReservationStatus(reservationId, status, userId) {
    const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Status inválido. Deve ser um dos: ${validStatuses.join(', ')}`);
    }

    const reservation = await Reservation.findByPk(reservationId, {
      include: [
        {
          model: Product,
          as: 'product'
        }
      ]
    });

    if (!reservation) {
      throw new Error('Reserva não encontrada');
    }

    // Verificar permissão: usuário deve ser o locatário ou o proprietário do produto
    const isRenter = reservation.userId === userId;
    const isOwner = reservation.product.userId === userId;

    if (!isRenter && !isOwner) {
      throw new Error('Você não tem permissão para atualizar esta reserva');
    }

    // Regras de negócio para mudança de status
    const currentStatus = reservation.status;

    // Locatário pode cancelar apenas se estiver pendente ou confirmada
    if (status === 'cancelled' && isRenter && !isOwner) {
      if (!['pending', 'confirmed'].includes(currentStatus)) {
        throw new Error('Você só pode cancelar reservas pendentes ou confirmadas');
      }
    }

    // Proprietário pode confirmar, ativar ou completar
    if (isOwner && ['confirmed', 'active', 'completed'].includes(status)) {
      // Validações adicionais podem ser adicionadas aqui
    }

    await reservation.update({ status });

    return await this.getReservationById(reservationId);
  }
}

module.exports = ReservationService;

