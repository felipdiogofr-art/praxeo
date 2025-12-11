const { Reservation, Product, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Taxa de serviço padrão (15%) - pode ser configurada via variável de ambiente
const DEFAULT_SERVICE_FEE_RATE = parseFloat(process.env.SERVICE_FEE_RATE || '0.15');

/**
 * Serviço de Reservas
 * Gerencia lógica de negócio relacionada a reservas
 */
class ReservationService {
  /**
   * Calcula a taxa de serviço com base no valor base
   * @param {number} basePrice - Preço base (dias × preço diário)
   * @returns {number} - Valor da taxa de serviço
   */
  static calculateServiceFee(basePrice) {
    if (basePrice < 0) {
      throw new Error('O preço base não pode ser negativo');
    }
    return parseFloat((basePrice * DEFAULT_SERVICE_FEE_RATE).toFixed(2));
  }

  /**
   * Valida disponibilidade de um produto para um período
   * @param {string} productId - ID do produto
   * @param {Date|string} startDate - Data de início
   * @param {Date|string} endDate - Data de término
   * @param {string} excludeReservationId - ID de reserva a excluir da verificação (para atualizações)
   * @returns {boolean} - true se disponível, false caso contrário
   */
  static async checkAvailability(productId, startDate, endDate, excludeReservationId = null) {
    // Normalizar datas para DATEONLY (sem hora)
    const start = typeof startDate === 'string' ? startDate : startDate.toISOString().split('T')[0];
    const end = typeof endDate === 'string' ? endDate : endDate.toISOString().split('T')[0];

    // Validações de data
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    
    if (isNaN(startDateObj.getTime())) {
      throw new Error('Data de início inválida');
    }
    
    if (isNaN(endDateObj.getTime())) {
      throw new Error('Data de término inválida');
    }

    if (endDateObj <= startDateObj) {
      throw new Error('A data de término deve ser posterior à data de início');
    }

    // Verificar se o produto existe e está disponível
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    if (!product.availability) {
      return false;
    }

    // Verificar conflitos com reservas existentes (status que ocupam o produto)
    const where = {
      productId,
      status: {
        [Op.in]: ['pending', 'confirmed', 'active']
      },
      [Op.or]: [
        // Reserva começa durante o período solicitado
        {
          startDate: {
            [Op.between]: [start, end]
          }
        },
        // Reserva termina durante o período solicitado
        {
          endDate: {
            [Op.between]: [start, end]
          }
        },
        // Reserva engloba completamente o período solicitado
        {
          [Op.and]: [
            { startDate: { [Op.lte]: start } },
            { endDate: { [Op.gte]: end } }
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
   * Calcula o preço total de uma reserva incluindo taxa de serviço
   * Suporta aluguel diário e mensal (quando período >= 30 dias e preço mensal disponível)
   * @param {string} productId - ID do produto
   * @param {Date|string} startDate - Data de início
   * @param {Date|string} endDate - Data de término
   * @returns {Object} - Objeto com subtotal, taxa de serviço e preço total
   */
  static async calculateTotalPrice(productId, startDate, endDate) {
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Normalizar datas
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    // Calcular número de dias (inclusivo: inclui dia inicial e final)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      throw new Error('O período de reserva deve ser de pelo menos 1 dia');
    }

    const dailyPrice = parseFloat(product.price);
    const monthlyPrice = product.monthlyPrice ? parseFloat(product.monthlyPrice) : null;
    const DAYS_IN_MONTH = 30; // Considerar mês como 30 dias para cálculo
    
    let rentalPrice;
    let pricingType = 'daily'; // 'daily' ou 'monthly'
    let months = 0;
    let remainingDays = 0;

    // Verificar se deve usar preço mensal (período >= 30 dias e preço mensal disponível)
    if (diffDays >= DAYS_IN_MONTH && monthlyPrice) {
      // Calcular quantos meses completos e dias restantes
      months = Math.floor(diffDays / DAYS_IN_MONTH);
      remainingDays = diffDays % DAYS_IN_MONTH;
      
      // Calcular preço: meses completos × preço mensal + dias restantes × preço diário
      const monthlyTotal = months * monthlyPrice;
      const dailyTotal = remainingDays * dailyPrice;
      rentalPrice = monthlyTotal + dailyTotal;
      pricingType = 'monthly';
    } else {
      // Usar preço diário padrão
      rentalPrice = dailyPrice * diffDays;
    }
    
    // Calcular taxa de serviço
    const serviceFee = this.calculateServiceFee(rentalPrice);
    
    // Calcular preço total (preço de aluguel + taxa de serviço)
    const totalPrice = parseFloat((rentalPrice + serviceFee).toFixed(2));

    return {
      days: diffDays,
      months: pricingType === 'monthly' ? months : 0,
      remainingDays: pricingType === 'monthly' ? remainingDays : 0,
      pricingType,
      dailyPrice,
      monthlyPrice: monthlyPrice || null,
      rentalPrice: parseFloat(rentalPrice.toFixed(2)),
      serviceFee,
      serviceFeeRate: DEFAULT_SERVICE_FEE_RATE,
      totalPrice
    };
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

    // Calcular preço total (inclui taxa de serviço)
    const priceCalculation = await this.calculateTotalPrice(productId, startDate, endDate);

    // Criar reserva usando transação para garantir consistência
    const reservation = await sequelize.transaction(async (t) => {
      // Verificar disponibilidade novamente dentro da transação (double-check)
      const isStillAvailable = await this.checkAvailability(productId, startDate, endDate);
      if (!isStillAvailable) {
        throw new Error('O produto não está mais disponível para o período selecionado');
      }

      // Criar reserva
      const newReservation = await Reservation.create({
        productId,
        userId,
        startDate,
        endDate,
        totalPrice: priceCalculation.totalPrice,
        status: 'pending'
      }, { transaction: t });

      // A disponibilidade do produto é gerenciada dinamicamente através das reservas
      // Não precisamos atualizar o campo 'availability' do produto, pois a disponibilidade
      // é verificada através das reservas existentes no método checkAvailability.
      // O campo 'availability' no produto é usado para pausar/ativar o produto globalmente
      // pelo proprietário (ex: produto em manutenção)

      return newReservation;
    });

    // Buscar reserva completa com relacionamentos e adicionar detalhes de preço
    const reservationDetails = await this.getReservationById(reservation.id);
    
    // Adicionar detalhes de cálculo de preço para transparência
    reservationDetails.priceBreakdown = {
      days: priceCalculation.days,
      dailyPrice: priceCalculation.dailyPrice,
      rentalPrice: priceCalculation.rentalPrice,
      serviceFee: priceCalculation.serviceFee,
      serviceFeeRate: priceCalculation.serviceFeeRate,
      totalPrice: priceCalculation.totalPrice
    };

    return reservationDetails;
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
   * @returns {Object} - Dados da reserva com breakdown de preços
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

    const reservationData = reservation.toJSON();
    
    // Calcular breakdown de preços retroativamente se não estiver incluído
    if (!reservationData.priceBreakdown) {
      try {
        const priceCalc = await this.calculateTotalPrice(
          reservationData.productId,
          reservationData.startDate,
          reservationData.endDate
        );
        reservationData.priceBreakdown = {
          days: priceCalc.days,
          dailyPrice: priceCalc.dailyPrice,
          rentalPrice: priceCalc.rentalPrice,
          serviceFee: priceCalc.serviceFee,
          serviceFeeRate: priceCalc.serviceFeeRate,
          totalPrice: priceCalc.totalPrice
        };
      } catch (error) {
        // Se houver erro no cálculo, usar dados da reserva
        console.warn('Erro ao calcular breakdown de preços:', error);
      }
    }

    return reservationData;
  }

  /**
   * Calcula o preço estimado de uma reserva sem criá-la
   * Útil para exibir valores no frontend antes de confirmar a reserva
   * @param {string} productId - ID do produto
   * @param {Date|string} startDate - Data de início
   * @param {Date|string} endDate - Data de término
   * @returns {Object} - Detalhes do cálculo de preço e disponibilidade
   */
  static async estimateReservationPrice(productId, startDate, endDate) {
    // Verificar se o produto existe
    const product = await Product.findByPk(productId);
    
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Verificar disponibilidade
    const isAvailable = await this.checkAvailability(productId, startDate, endDate);

    // Calcular preços
    const priceCalculation = await this.calculateTotalPrice(productId, startDate, endDate);

    return {
      available: isAvailable,
      product: {
        id: product.id,
        title: product.title,
        price: parseFloat(product.price)
      },
      ...priceCalculation
    };
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

