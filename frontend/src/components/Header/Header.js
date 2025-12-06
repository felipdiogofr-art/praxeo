import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../Auth/AuthModal';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar se há redirecionamento pendente após login
  useEffect(() => {
    const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
    const locationState = location.state;
    
    // Se houver redirecionamento pendente e usuário não está autenticado, abrir modal
    if (redirectAfterLogin && !isAuthenticated) {
      setIsAuthModalOpen(true);
      setAuthModalTab('login');
    }
    
    // Se houver erro de permissão no state, mostrar mensagem (opcional)
    if (locationState?.error) {
      // Poderia mostrar um toast/notificação aqui
      console.warn(locationState.error);
    }
  }, [location, isAuthenticated]);

  // Limpar redirectAfterLogin quando usuário se autenticar
  useEffect(() => {
    if (isAuthenticated) {
      const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
      if (redirectAfterLogin) {
        sessionStorage.removeItem('redirectAfterLogin');
        // Redirecionar para a rota desejada após login
        navigate(redirectAfterLogin, { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || searchLocation.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(searchLocation)}`);
    }
  };

  const handleOpenAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    // Limpar redirectAfterLogin se modal for fechado sem login
    if (!isAuthenticated) {
      sessionStorage.removeItem('redirectAfterLogin');
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handlePublishClick = () => {
    if (isAuthenticated) {
      // TODO: Navegar para página de publicação quando implementada
      navigate('/publicar');
    } else {
      handleOpenAuthModal('register');
    }
  };

  return (
    <>
      <header className="Header">
        <div className="container">
          <div className="Header-content">
            <Link to="/" className="Header-logo">
              <span className="Header-logo-text">Praxeo</span>
            </Link>

            <form className="Header-search" onSubmit={handleSearch}>
              <div className="Header-search-input-group">
                <input
                  type="text"
                  className="Header-search-input"
                  placeholder="O que você precisa?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="Header-search-divider" />
                <input
                  type="text"
                  className="Header-search-input Header-search-location"
                  placeholder="CEP ou Localização"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
                <button type="submit" className="Header-search-button" aria-label="Buscar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </div>
            </form>

            <nav className="Header-nav">
              <Link to="/como-funciona" className="Header-nav-link">Como Funciona</Link>
              <Link to="/ajuda" className="Header-nav-link">Ajuda</Link>
              
              {isAuthenticated ? (
                <>
                  <button
                    className="Header-button Header-button-primary"
                    onClick={handlePublishClick}
                  >
                    Alugar Meu Item
                  </button>
                  <div className="Header-user-menu">
                    <button
                      className="Header-user-button"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      aria-label="Menu do usuário"
                    >
                      <div className="Header-user-avatar">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="Header-user-name">{user?.name?.split(' ')[0] || 'Usuário'}</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={showUserMenu ? 'Header-user-arrow-open' : ''}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {showUserMenu && (
                      <div className="Header-user-dropdown">
                        {user?.role === 'owner' && (
                          <Link
                            to="/dashboard"
                            className="Header-user-dropdown-item"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <line x1="3" y1="9" x2="21" y2="9" />
                              <line x1="9" y1="21" x2="9" y2="9" />
                            </svg>
                            Meu Dashboard
                          </Link>
                        )}
                        <Link
                          to="/perfil"
                          className="Header-user-dropdown-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          Meu Perfil
                        </Link>
                        <Link
                          to="/reservas"
                          className="Header-user-dropdown-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          Minhas Reservas
                        </Link>
                        <div className="Header-user-dropdown-divider" />
                        <button
                          className="Header-user-dropdown-item Header-user-dropdown-item-danger"
                          onClick={handleLogout}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          Sair
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    className="Header-button Header-button-secondary"
                    onClick={() => handleOpenAuthModal('login')}
                  >
                    Entrar
                  </button>
                  <button
                    className="Header-button Header-button-primary"
                    onClick={() => handleOpenAuthModal('register')}
                  >
                    Alugar Meu Item
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        initialTab={authModalTab}
      />
    </>
  );
};

export default Header;


