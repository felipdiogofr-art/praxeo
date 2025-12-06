const Review = require('../models/Review');
const Product = require('../models/Product');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

/**
 * Controller de Avaliações (Reviews)
 * Gerencia requisições HTTP relacionadas a avaliações de produtos
 */
class ReviewController {
  /**
   * POST /api/reviews
   * Cria uma nova avaliação (requer autenticação)
   */
  static async createReview(req, res) {
    try {
      const { productId, reservationId, rating, comment } = req.body;
      const userId = req.userId;

      // Validações básicas
      if (!productId || !rating) {
        return res.status(400).json({
          error: 'Dados incompletos',
          message: 'productId e rating são obrigatórios'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          error: 'Validação',
          message: 'Rating deve ser um número entre 1 e 5'
        });
      }

      // Verificar se o produto existe
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          error: 'Produto não encontrado',
          message: 'O produto especificado não existe'
        });
      }

      // Verificar se já existe uma avaliação deste usuário para este produto
      const existingReview = await Review.findOne({
        where: {
          userId,
          productId
        }
      });

      if (existingReview) {
        return res.status(400).json({
          error: 'Avaliação já existe',
          message: 'Você já avaliou este produto. Cada usuário pode avaliar um produto apenas uma vez.'
        });
      }

      // Se reservationId foi fornecido, verificar se a reserva existe e pertence ao usuário
      if (reservationId) {
        const reservation = await Reservation.findOne({
          where: {
            id: reservationId,
            userId,
            productId
          }
        });

        if (!reservation) {
          return res.status(404).json({
            error: 'Reserva não encontrada',
            message: 'A reserva especificada não existe ou não pertence a você'
          });
        }
      }

      // Criar a avaliação
      const review = await Review.create({
        productId,
        userId,
        reservationId: reservationId || null,
        rating,
        comment: comment || null
      });

      // Buscar a avaliação com relacionamentos
      const reviewWithRelations = await Review.findByPk(review.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'title']
          }
        ]
      });

      return res.status(201).json({
        message: 'Avaliação criada com sucesso',
        data: reviewWithRelations
      });
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);

      if (error.message.includes('obrigatório') || error.message.includes('inválido')) {
        return res.status(400).json({
          error: 'Erro de validação',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Erro ao criar avaliação',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }

  /**
   * GET /api/reviews/product/:productId
   * Lista todas as avaliações de um produto
   */
  static async getProductReviews(req, res) {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Verificar se o produto existe
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          error: 'Produto não encontrado',
          message: 'O produto especificado não existe'
        });
      }

      // Buscar avaliações
      const { count, rows: reviews } = await Review.findAndCountAll({
        where: { productId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      // Calcular rating médio
      const ratings = reviews.map(r => r.rating);
      const averageRating = ratings.length > 0
        ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
        : null;

      return res.status(200).json({
        message: 'Avaliações listadas com sucesso',
        data: {
          reviews,
          averageRating: averageRating ? parseFloat(averageRating) : null,
          totalReviews: count,
          currentPage: page,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Erro ao listar avaliações:', error);

      return res.status(500).json({
        error: 'Erro ao listar avaliações',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }

  /**
   * GET /api/reviews/:id
   * Busca uma avaliação por ID
   */
  static async getReviewById(req, res) {
    try {
      const { id } = req.params;

      const review = await Review.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'title']
          },
          {
            model: Reservation,
            as: 'reservation',
            attributes: ['id', 'startDate', 'endDate']
          }
        ]
      });

      if (!review) {
        return res.status(404).json({
          error: 'Avaliação não encontrada',
          message: 'A avaliação especificada não existe'
        });
      }

      return res.status(200).json({
        message: 'Avaliação encontrada',
        data: review
      });
    } catch (error) {
      console.error('Erro ao buscar avaliação:', error);

      return res.status(500).json({
        error: 'Erro ao buscar avaliação',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }

  /**
   * PUT /api/reviews/:id
   * Atualiza uma avaliação (requer autenticação e propriedade)
   */
  static async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const userId = req.userId;

      const review = await Review.findByPk(id);

      if (!review) {
        return res.status(404).json({
          error: 'Avaliação não encontrada',
          message: 'A avaliação especificada não existe'
        });
      }

      // Verificar se o usuário é o dono da avaliação
      if (review.userId !== userId) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem permissão para atualizar esta avaliação'
        });
      }

      // Atualizar apenas os campos fornecidos
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(400).json({
            error: 'Validação',
            message: 'Rating deve ser um número entre 1 e 5'
          });
        }
        review.rating = rating;
      }

      if (comment !== undefined) {
        if (comment && comment.length > 1000) {
          return res.status(400).json({
            error: 'Validação',
            message: 'O comentário deve ter no máximo 1000 caracteres'
          });
        }
        review.comment = comment;
      }

      await review.save();

      // Buscar avaliação atualizada com relacionamentos
      const updatedReview = await Review.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'title']
          }
        ]
      });

      return res.status(200).json({
        message: 'Avaliação atualizada com sucesso',
        data: updatedReview
      });
    } catch (error) {
      console.error('Erro ao atualizar avaliação:', error);

      return res.status(500).json({
        error: 'Erro ao atualizar avaliação',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }

  /**
   * DELETE /api/reviews/:id
   * Deleta uma avaliação (requer autenticação e propriedade)
   */
  static async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const review = await Review.findByPk(id);

      if (!review) {
        return res.status(404).json({
          error: 'Avaliação não encontrada',
          message: 'A avaliação especificada não existe'
        });
      }

      // Verificar se o usuário é o dono da avaliação
      if (review.userId !== userId) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Você não tem permissão para deletar esta avaliação'
        });
      }

      await review.destroy();

      return res.status(200).json({
        message: 'Avaliação deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);

      return res.status(500).json({
        error: 'Erro ao deletar avaliação',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }
}

module.exports = ReviewController;

