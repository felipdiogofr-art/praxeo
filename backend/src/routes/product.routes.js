const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * Rotas de Produtos
 * Base: /api/products
 */

// GET /api/products - Listar produtos (com filtros de geolocalização)
router.get('/', ProductController.getProducts);

// GET /api/products/:id - Detalhes do produto
router.get('/:id', ProductController.getProductById);

// POST /api/products - Criar produto (autenticado)
router.post('/', authenticate, ProductController.createProduct);

// PUT /api/products/:id - Atualizar produto (autenticado)
router.put('/:id', authenticate, ProductController.updateProduct);

// DELETE /api/products/:id - Deletar produto (autenticado)
router.delete('/:id', authenticate, ProductController.deleteProduct);

module.exports = router;

