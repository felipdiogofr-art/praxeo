const AuthService = require('../services/auth.service');

/**
 * Controller de Autenticação
 * Gerencia requisições HTTP relacionadas a autenticação
 */
class AuthController {
  /**
   * POST /api/auth/register
   * Registra um novo usuário
   */
  static async register(req, res) {
    try {
      const { name, email, password, phone, role } = req.body;

      const result = await AuthService.register({
        name,
        email,
        password,
        phone,
        role
      });

      return res.status(201).json({
        message: 'Usuário registrado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);

      // Erros de validação
      if (error.message.includes('obrigatório') || 
          error.message.includes('já está cadastrado') ||
          error.message.includes('inválido')) {
        return res.status(400).json({
          error: 'Erro de validação',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Erro ao registrar usuário',
        message: process.env.NODE_ENV === 'production' 
          ? 'Ocorreu um erro ao processar o registro'
          : error.message
      });
    }
  }

  /**
   * POST /api/auth/login
   * Autentica um usuário
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Dados incompletos',
          message: 'Email e senha são obrigatórios'
        });
      }

      const result = await AuthService.login(email, password);

      return res.status(200).json({
        message: 'Login realizado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);

      // Erro de credenciais inválidas
      if (error.message.includes('Email ou senha')) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Erro ao fazer login',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar o login'
          : error.message
      });
    }
  }

  /**
   * GET /api/auth/me
   * Retorna dados do usuário autenticado
   * Requer autenticação (middleware authenticate)
   */
  static async getCurrentUser(req, res) {
    try {
      const user = await AuthService.getCurrentUser(req.userId);

      return res.status(200).json({
        message: 'Dados do usuário recuperados com sucesso',
        data: user
      });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);

      return res.status(500).json({
        error: 'Erro ao buscar dados do usuário',
        message: process.env.NODE_ENV === 'production'
          ? 'Ocorreu um erro ao processar a requisição'
          : error.message
      });
    }
  }
}

module.exports = AuthController;

