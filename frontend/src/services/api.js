import axios from 'axios';

/**
 * Configuração base da URL da API
 * Em desenvolvimento: http://localhost:3001/api
 * Em produção: usar variável de ambiente REACT_APP_API_URL
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Instância do Axios configurada para a API
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de requisição
 * Adiciona o token JWT automaticamente em todas as requisições
 */
api.interceptors.request.use(
  (config) => {
    // Buscar token do localStorage
    const token = localStorage.getItem('token');
    
    // Se houver token, adicionar ao header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Em caso de erro na configuração da requisição
    return Promise.reject(error);
  }
);

/**
 * Interceptor de resposta
 * Trata erros globalmente e gerencia tokens expirados
 */
api.interceptors.response.use(
  (response) => {
    // Se a resposta for bem-sucedida, apenas retornar
    return response;
  },
  (error) => {
    // Tratamento de erros
    if (error.response) {
      // A requisição foi feita e o servidor respondeu com um status de erro
      const { status, data } = error.response;
      
      // Token expirado ou inválido (401)
      if (status === 401) {
        // Remover token inválido do localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirecionar para login apenas se não estiver já na página de login
        if (window.location.pathname !== '/login' && window.location.pathname !== '/cadastro') {
          // Usar window.location para garantir redirecionamento completo
          window.location.href = '/login?expired=true';
        }
      }
      
      // Erro 403 - Acesso negado
      if (status === 403) {
        console.error('Acesso negado:', data.message || 'Você não tem permissão para realizar esta ação');
      }
      
      // Erro 404 - Recurso não encontrado
      if (status === 404) {
        console.error('Recurso não encontrado:', data.message || 'O recurso solicitado não foi encontrado');
      }
      
      // Erro 500 - Erro interno do servidor
      if (status >= 500) {
        console.error('Erro do servidor:', data.message || 'Ocorreu um erro no servidor. Tente novamente mais tarde.');
      }
      
      // Retornar erro formatado
      return Promise.reject({
        status,
        message: data.message || data.error || 'Ocorreu um erro ao processar a requisição',
        data: data.data || null,
        errors: data.errors || null,
      });
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta do servidor
      const errorMessage = process.env.NODE_ENV === 'development'
        ? `Não foi possível conectar ao servidor em ${API_BASE_URL}. Verifique se o backend está rodando na porta correta.`
        : 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
      
      console.error('Erro de conexão:', errorMessage);
      console.error('URL tentada:', error.config?.url || 'N/A');
      console.error('Base URL:', API_BASE_URL);
      
      return Promise.reject({
        status: 0,
        message: errorMessage,
        networkError: true,
      });
    } else {
      // Algo aconteceu ao configurar a requisição
      console.error('Erro na requisição:', error.message);
      
      return Promise.reject({
        status: 0,
        message: error.message || 'Ocorreu um erro ao processar a requisição',
      });
    }
  }
);

/**
 * Função auxiliar para obter o token do localStorage
 * @returns {string|null} Token JWT ou null
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Função auxiliar para definir o token no localStorage
 * @param {string} token - Token JWT
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

/**
 * Função auxiliar para remover o token do localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Função auxiliar para verificar se o usuário está autenticado
 * @returns {boolean} true se houver token, false caso contrário
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Função auxiliar para obter dados do usuário do localStorage
 * @returns {Object|null} Dados do usuário ou null
 */
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Erro ao parsear dados do usuário:', error);
      return null;
    }
  }
  return null;
};

/**
 * Função auxiliar para definir dados do usuário no localStorage
 * @param {Object} user - Dados do usuário
 */
export const setUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

/**
 * Função auxiliar para fazer logout
 * Remove token e dados do usuário do localStorage
 */
export const logout = () => {
  removeToken();
  setUser(null);
  window.location.href = '/';
};

export default api;

