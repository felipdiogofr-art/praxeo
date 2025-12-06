const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ValidationError } = require('sequelize');

/**
 * Serviço de Autenticação
 * Gerencia lógica de registro, login e geração de tokens
 */
class AuthService {
  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário (name, email, password, phone, role)
   * @returns {Object} - Usuário criado e token JWT
   */
  static async register(userData) {
    const { name, email, password, phone, role = 'renter' } = userData;

    // Validações básicas
    if (!name || !email || !password) {
      throw new Error('Nome, email e senha são obrigatórios');
    }

    // Verificar se o email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Este email já está cadastrado');
    }

    try {
      // Criar usuário (a senha será hasheada automaticamente pelo hook do modelo)
      const user = await User.create({
        name,
        email,
        password,
        phone,
        role
      });

      // Gerar token JWT
      const token = this.generateToken(user);

      return {
        user: user.toJSON(), // Remove a senha
        token
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(error.errors.map(e => e.message).join(', '));
      }
      throw error;
    }
  }

  /**
   * Autentica um usuário e retorna token
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Object} - Usuário e token JWT
   */
  static async login(email, password) {
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    // Buscar usuário por email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Email ou senha incorretos');
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('Email ou senha incorretos');
    }

    // Gerar token JWT
    const token = this.generateToken(user);

    return {
      user: user.toJSON(), // Remove a senha
      token
    };
  }

  /**
   * Gera um token JWT para o usuário
   * @param {User} user - Instância do modelo User
   * @returns {string} - Token JWT
   */
  static generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const secret = process.env.JWT_SECRET || 'fallback_secret_change_in_production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Busca dados do usuário autenticado
   * @param {string} userId - ID do usuário
   * @returns {Object} - Dados do usuário
   */
  static async getCurrentUser(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user.toJSON();
  }
}

module.exports = AuthService;

