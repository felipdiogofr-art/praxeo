import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente de Rota Privada
 * 
 * Protege rotas que requerem autenticação. Se o usuário não estiver autenticado,
 * redireciona para a página inicial e abre o modal de login.
 * 
 * Também suporta verificação de roles (owner/renter) para rotas que requerem
 * permissões específicas.
 * 
 * @param {React.ReactNode} children - Componente filho a ser renderizado se autenticado
 * @param {string|string[]} [requiredRole] - Role(s) necessária(s) para acessar a rota (opcional)
 * @param {string} [redirectTo] - Rota para redirecionar se não autenticado (padrão: '/')
 * 
 * @example
 * // Rota que requer apenas autenticação
 * <Route path="/perfil" element={
 *   <PrivateRoute>
 *     <ProfilePage />
 *   </PrivateRoute>
 * } />
 * 
 * @example
 * // Rota que requer role específica
 * <Route path="/dashboard" element={
 *   <PrivateRoute requiredRole="owner">
 *     <OwnerDashboard />
 *   </PrivateRoute>
 * } />
 * 
 * @example
 * // Rota que aceita múltiplas roles
 * <Route path="/admin" element={
 *   <PrivateRoute requiredRole={['owner', 'admin']}>
 *     <AdminPanel />
 *   </PrivateRoute>
 * } />
 */
const PrivateRoute = ({ children, requiredRole = null, redirectTo = '/' }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #4CAF50',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#666', fontSize: '0.9rem' }}>Carregando...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para home
  // e armazenar a rota desejada para redirecionar após login
  if (!isAuthenticated) {
    // Armazenar a rota desejada no sessionStorage para redirecionar após login
    sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // Se houver verificação de role
  if (requiredRole) {
    const userRole = user?.role;
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Verificar se o usuário tem a role necessária
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Usuário não tem permissão - redirecionar para home com mensagem
      return (
        <Navigate 
          to={redirectTo} 
          replace 
          state={{ 
            from: location,
            error: 'Você não tem permissão para acessar esta página'
          }} 
        />
      );
    }
  }

  // Usuário autenticado e com permissão - renderizar componente filho
  return children;
};

export default PrivateRoute;

