const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * Rotas de Avaliações (Reviews)
 * 
 * Todas as rotas de criação, atualização e deleção requerem autenticação.
 * A rota de listagem de avaliações de um produto é pública.
 */

// POST /api/reviews - Criar nova avaliação (autenticado)
router.post('/', authenticate, ReviewController.createReview);

// GET /api/reviews/product/:productId - Listar avaliações de um produto (público)
router.get('/product/:productId', ReviewController.getProductReviews);

// GET /api/reviews/:id - Buscar avaliação por ID (público)
router.get('/:id', ReviewController.getReviewById);

// PUT /api/reviews/:id - Atualizar avaliação (autenticado, apenas o dono)
router.put('/:id', authenticate, ReviewController.updateReview);

// DELETE /api/reviews/:id - Deletar avaliação (autenticado, apenas o dono)
router.delete('/:id', authenticate, ReviewController.deleteReview);

module.exports = router;

