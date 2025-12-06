import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as authLogin, register as authRegister, logout as authLogout, getCurrentUser } from '../services/auth.service';
import { getUser as getCachedUser, isAuthenticated as checkIsAuthenticated } from '../services/api';

/**
 * Context de Autenticação
 * 
 * Gerencia o estado global de autenticação da aplicação, incluindo:
 * - Estado do usuário logado
 * - Funções de login, registro e logout
 * - Verificação automática de autenticação ao carregar a aplicação
 * 
 * @module contexts/AuthContext
 */

// Criar o contexto
const AuthContext = createContext(null);

/**
 * Provider do AuthContext
 * 
 * Envolve a aplicação e fornece o estado de autenticação para todos os componentes filhos.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos
 */
export const AuthProvider = ({ children }) => {
  // Estado do usuário
  const [user, setUser] = useState(null);
  
  // Estado de loading (verificando autenticação ou fazendo login/registro)
  const [loading, setLoading] = useState(true);
  
  // Estado de erro
  const [error, setError] = useState(null);

  /**
   * Verifica se o usuário está autenticado ao carregar a aplicação
   * Tenta recuperar dados do localStorage primeiro, depois busca do servidor
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar se há token no localStorage
        if (checkIsAuthenticated()) {
          // Tentar obter dados do usuário (primeiro do cache, depois do servidor)
          const userData = await getCurrentUser(false);
          if (userData) {
            setUser(userData);
          } else {
            // Se não conseguir obter dados, limpar estado
            setUser(null);
          }
        } else {
          // Se não houver token, verificar se há dados em cache (pode estar desatualizado)
          const cachedUser = getCachedUser();
          if (cachedUser) {
            setUser(cachedUser);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        setError(err.message || 'Erro ao verificar autenticação');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Realiza login do usuário
   * 
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário e token
   * @throws {Error} Erro caso as credenciais sejam inválidas
   */
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authLogin(email, password);
      setUser(result.user);

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao realizar login. Verifique suas credenciais.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Registra um novo usuário
   * 
   * @param {Object} userData - Dados do usuário para cadastro
   * @param {string} userData.name - Nome completo
   * @param {string} userData.email - Email
   * @param {string} userData.password - Senha
   * @param {string} [userData.phone] - Telefone (opcional)
   * @param {string} userData.role - Role ('owner' ou 'renter')
   * @returns {Promise<Object>} Dados do usuário e token
   * @throws {Error} Erro caso os dados sejam inválidos
   */
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authRegister(userData);
      setUser(result.user);

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao realizar cadastro. Verifique os dados informados.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Realiza logout do usuário
   * Remove token e dados do usuário, e limpa o estado
   */
  const logout = useCallback(() => {
    try {
      authLogout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Erro ao realizar logout:', err);
      // Mesmo com erro, limpar o estado local
      setUser(null);
      setError(null);
    }
  }, []);

  /**
   * Atualiza os dados do usuário no estado
   * Útil quando o usuário atualiza seu perfil
   * 
   * @param {Object} userData - Novos dados do usuário
   */
  const updateUser = useCallback((userData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...userData,
    }));
  }, []);

  /**
   * Força atualização dos dados do usuário do servidor
   * 
   * @returns {Promise<Object|null>} Dados atualizados do usuário ou null
   */
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = await getCurrentUser(true);
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }

      return userData;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao atualizar dados do usuário';
      setError(errorMessage);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpa o erro do estado
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Valor do contexto
  const value = {
    // Estado
    user,
    loading,
    error,
    isAuthenticated: !!user,

    // Funções
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de autenticação
 * 
 * @returns {Object} Contexto de autenticação com estado e funções
 * @throws {Error} Se usado fora do AuthProvider
 * 
 * @example
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *   
 *   if (isAuthenticated) {
 *     return <div>Olá, {user.name}!</div>;
 *   }
 *   
 *   return <button onClick={() => login('email@example.com', 'senha')}>Login</button>;
 * }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

export default AuthContext;

