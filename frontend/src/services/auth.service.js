import api from './api';
import { setToken, setUser, removeToken, getUser } from './api';

/**
 * Serviço de Autenticação
 * 
 * Este módulo fornece funções para gerenciar autenticação de usuários,
 * incluindo login, registro, logout e obtenção de dados do usuário atual.
 * 
 * @module services/auth
 */

/**
 * Realiza login do usuário
 * 
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Objeto contendo token, user e mensagem de sucesso
 * @throws {Error} Erro caso as credenciais sejam inválidas ou ocorra erro na requisição
 * 
 * @example
 * try {
 *   const result = await AuthService.login('user@example.com', 'senha123');
 *   console.log('Login realizado com sucesso:', result.user);
 * } catch (error) {
 *   console.error('Erro no login:', error.message);
 * }
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const { token, user } = response.data;

    // Armazenar token e dados do usuário no localStorage
    setToken(token);
    setUser(user);

    return {
      token,
      user,
      message: 'Login realizado com sucesso',
    };
  } catch (error) {
    // Re-lançar o erro para que o componente possa tratá-lo
    throw error;
  }
};

/**
 * Registra um novo usuário
 * 
 * @param {Object} userData - Dados do usuário para cadastro
 * @param {string} userData.name - Nome completo do usuário
 * @param {string} userData.email - Email do usuário
 * @param {string} userData.password - Senha do usuário
 * @param {string} [userData.phone] - Telefone do usuário (opcional)
 * @param {string} userData.role - Role do usuário ('owner' ou 'renter')
 * @returns {Promise<Object>} Objeto contendo token, user e mensagem de sucesso
 * @throws {Error} Erro caso os dados sejam inválidos ou o email já esteja em uso
 * 
 * @example
 * try {
 *   const result = await AuthService.register({
 *     name: 'João Silva',
 *     email: 'joao@example.com',
 *     password: 'senha123',
 *     phone: '11999999999',
 *     role: 'renter'
 *   });
 *   console.log('Cadastro realizado com sucesso:', result.user);
 * } catch (error) {
 *   console.error('Erro no cadastro:', error.message);
 * }
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);

    const { token, user } = response.data;

    // Armazenar token e dados do usuário no localStorage
    setToken(token);
    setUser(user);

    return {
      token,
      user,
      message: 'Cadastro realizado com sucesso',
    };
  } catch (error) {
    // Re-lançar o erro para que o componente possa tratá-lo
    throw error;
  }
};

/**
 * Realiza logout do usuário
 * 
 * Remove o token e os dados do usuário do localStorage
 * e redireciona para a página inicial.
 * 
 * @returns {void}
 * 
 * @example
 * AuthService.logout();
 */
export const logout = () => {
  // Remover token e dados do usuário do localStorage
  removeToken();
  setUser(null);
  
  // Redirecionar para a página inicial
  window.location.href = '/';
};

/**
 * Obtém os dados do usuário atual (logado)
 * 
 * Primeiro tenta buscar do localStorage. Se não encontrar ou quiser dados atualizados,
 * faz uma requisição ao servidor para obter os dados mais recentes.
 * 
 * @param {boolean} forceRefresh - Se true, força busca no servidor mesmo se houver dados no localStorage
 * @returns {Promise<Object|null>} Dados do usuário ou null se não estiver autenticado
 * @throws {Error} Erro caso o token seja inválido ou ocorra erro na requisição
 * 
 * @example
 * // Obter dados do localStorage
 * const user = await AuthService.getCurrentUser();
 * 
 * // Forçar atualização dos dados do servidor
 * const user = await AuthService.getCurrentUser(true);
 */
export const getCurrentUser = async (forceRefresh = false) => {
  // Se não forçar refresh, tentar obter do localStorage primeiro
  if (!forceRefresh) {
    const cachedUser = getUser();
    if (cachedUser) {
      return cachedUser;
    }
  }

  try {
    // Buscar dados atualizados do servidor
    const response = await api.get('/auth/me');
    const user = response.data.user || response.data;

    // Atualizar dados no localStorage
    setUser(user);

    return user;
  } catch (error) {
    // Se houver erro (ex: token inválido), limpar dados e retornar null
    if (error.status === 401) {
      removeToken();
      setUser(null);
      return null;
    }
    
    // Re-lançar outros erros
    throw error;
  }
};

// Exportar objeto com todas as funções para facilitar uso
const AuthService = {
  login,
  register,
  logout,
  getCurrentUser,
};

export default AuthService;
