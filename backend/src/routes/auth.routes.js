const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * Rotas de Autenticação
 * Base: /api/auth
 */

// POST /api/auth/register - Cadastro de novo usuário
router.post('/register', AuthController.register);

// POST /api/auth/login - Login de usuário
router.post('/login', AuthController.login);

// GET /api/auth/me - Dados do usuário logado (requer autenticação)
router.get('/me', authenticate, AuthController.getCurrentUser);

module.exports = router;

