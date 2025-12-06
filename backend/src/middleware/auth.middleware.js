const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware de Autenticação JWT
 * 
 * Este módulo fornece middlewares para proteger rotas e validar tokens JWT.
 * 
 * @module middleware/auth
 * 
 * @example
 * // Proteger uma rota específica
 * router.get('/protected', authenticate, controller.method);
 * 
 * @example
 * // Autenticação opcional (rota funciona com ou sem token)
 * router.get('/public', optionalAuthenticate, controller.method);
 * 
 * @example
 * // Verificar role específica
 * router.post('/admin', authenticate, requireRole('owner'), controller.method);
 */

/**
 * Middleware para validar token JWT e autenticar usuário
 * 
 * Valida o token JWT fornecido no header Authorization (formato: "Bearer <token>"),
 * verifica se o token é válido e não expirou, busca o usuário no banco de dados
 * e adiciona os dados do usuário à requisição (req.user e req.userId).
 * 
 * Se o token for inválido ou o usuário não existir, retorna erro 401.
 * 
 * @function authenticate
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 * @param {Function} next - Função next do Express
 * @returns {void}
 * 
 * @example
 * // Uso em rotas
 * router.post('/products', authenticate, ProductController.create);
 */
const authenticate = async (req, res, next) => {
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de autenticação não fornecido',
        message: 'Por favor, forneça um token JWT válido no header Authorization'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    if (!token) {
      return res.status(401).json({
        error: 'Token de autenticação inválido',
        message: 'O token não pode estar vazio'
      });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_in_production');

    // Buscar usuário no banco de dados
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        message: 'O token é válido, mas o usuário não existe mais'
      });
    }

    // Adicionar dados do usuário à requisição
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'O token fornecido não é válido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        message: 'O token de autenticação expirou. Faça login novamente'
      });
    }

    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      error: 'Erro ao autenticar usuário',
      message: 'Ocorreu um erro interno ao processar a autenticação'
    });
  }
};

/**
 * Middleware opcional: autentica se houver token, mas não bloqueia se não houver
 * Útil para rotas que funcionam tanto para usuários autenticados quanto não autenticados
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_in_production');
        const user = await User.findByPk(decoded.userId);
        
        if (user) {
          req.user = user;
          req.userId = user.id;
        }
      } catch (error) {
        // Se o token for inválido, apenas ignora e continua sem autenticação
        // Não retorna erro, pois a autenticação é opcional
      }
    }
    
    next();
  } catch (error) {
    // Em caso de erro, continua sem autenticação
    next();
  }
};

/**
 * Middleware para verificar se o usuário tem uma role específica
 * Deve ser usado após o middleware authenticate
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Não autenticado',
        message: 'É necessário estar autenticado para acessar este recurso'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: `Esta ação requer uma das seguintes roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireRole
};

