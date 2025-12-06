import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '../../contexts/AuthContext';
import './AuthModal.css';

/**
 * Componente Modal de Autenticação
 * 
 * Modal que exibe formulários de login e registro com abas.
 * Integra com AuthContext e fecha automaticamente após login/registro bem-sucedido.
 * 
 * @param {boolean} isOpen - Controla se o modal está aberto
 * @param {Function} onClose - Callback chamado quando o modal é fechado
 * @param {string} initialTab - Aba inicial ('login' ou 'register')
 */
const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  /**
   * Atualizar aba quando initialTab mudar
   */
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  /**
   * Fechar modal quando usuário se autenticar
   */
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  /**
   * Fechar modal ao pressionar ESC
   */
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Não renderizar se não estiver aberto
  if (!isOpen) return null;

  /**
   * Handler para fechar modal ao clicar no overlay
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Handler de sucesso após login/registro
   */
  const handleSuccess = () => {
    // O modal será fechado automaticamente pelo useEffect quando isAuthenticated mudar
  };

  return (
    <div
      className="AuthModal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="AuthModal-container">
        {/* Botão de fechar */}
        <button
          className="AuthModal-close"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Abas */}
        <div className="AuthModal-tabs" role="tablist">
          <button
            className={`AuthModal-tab ${activeTab === 'login' ? 'AuthModal-tab-active' : ''}`}
            onClick={() => setActiveTab('login')}
            role="tab"
            aria-selected={activeTab === 'login'}
            aria-controls="auth-panel-login"
            id="auth-tab-login"
          >
            Entrar
          </button>
          <button
            className={`AuthModal-tab ${activeTab === 'register' ? 'AuthModal-tab-active' : ''}`}
            onClick={() => setActiveTab('register')}
            role="tab"
            aria-selected={activeTab === 'register'}
            aria-controls="auth-panel-register"
            id="auth-tab-register"
          >
            Cadastrar
          </button>
        </div>

        {/* Conteúdo dos formulários */}
        <div className="AuthModal-content">
          {activeTab === 'login' ? (
            <div
              id="auth-panel-login"
              role="tabpanel"
              aria-labelledby="auth-tab-login"
            >
              <LoginForm
                onSuccess={handleSuccess}
                onSwitchToRegister={() => setActiveTab('register')}
              />
            </div>
          ) : (
            <div
              id="auth-panel-register"
              role="tabpanel"
              aria-labelledby="auth-tab-register"
            >
              <RegisterForm
                onSuccess={handleSuccess}
                onSwitchToLogin={() => setActiveTab('login')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

