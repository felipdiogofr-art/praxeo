import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import './LoginForm.css';

/**
 * Componente de formulário de login
 * 
 * Permite que o usuário faça login na aplicação usando email e senha.
 * Utiliza React Hook Form para validação e integra com AuthContext.
 * 
 * @param {Function} onSuccess - Callback chamado quando o login é bem-sucedido
 * @param {Function} onSwitchToRegister - Callback para alternar para o formulário de registro
 */
const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const { login, loading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  /**
   * Validação de email usando regex
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || 'Email inválido';
  };

  /**
   * Handler de submissão do formulário
   */
  const onSubmit = async (data) => {
    try {
      clearError();
      await login(data.email, data.password);
      
      // Se houver callback de sucesso, chamá-lo
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Erro já é tratado pelo AuthContext
      console.error('Erro no login:', err);
    }
  };

  return (
    <form className="LoginForm" onSubmit={handleSubmit(onSubmit)}>
      <div className="LoginForm-header">
        <h2 className="LoginForm-title">Entrar</h2>
        <p className="LoginForm-subtitle">
          Acesse sua conta para continuar
        </p>
      </div>

      {/* Mensagem de erro global */}
      {error && (
        <div className="LoginForm-error" role="alert">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Campo de Email */}
      <div className="LoginForm-field">
        <label htmlFor="email" className="LoginForm-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={`LoginForm-input ${errors.email ? 'LoginForm-input-error' : ''}`}
          placeholder="seu@email.com"
          {...register('email', {
            required: 'Email é obrigatório',
            validate: validateEmail,
          })}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" className="LoginForm-field-error" role="alert">
            {errors.email.message}
          </span>
        )}
      </div>

      {/* Campo de Senha */}
      <div className="LoginForm-field">
        <label htmlFor="password" className="LoginForm-label">
          Senha
        </label>
        <div className="LoginForm-password-wrapper">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className={`LoginForm-input ${errors.password ? 'LoginForm-input-error' : ''}`}
            placeholder="Digite sua senha"
            {...register('password', {
              required: 'Senha é obrigatória',
              minLength: {
                value: 6,
                message: 'Senha deve ter no mínimo 6 caracteres',
              },
            })}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            className="LoginForm-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <span id="password-error" className="LoginForm-field-error" role="alert">
            {errors.password.message}
          </span>
        )}
      </div>

      {/* Link para recuperação de senha (futuro) */}
      <div className="LoginForm-footer">
        <button
          type="button"
          className="LoginForm-link"
          onClick={() => {
            // TODO: Implementar recuperação de senha
            console.log('Recuperar senha');
          }}
        >
          Esqueceu sua senha?
        </button>
      </div>

      {/* Botão de submit */}
      <button
        type="submit"
        className="LoginForm-submit"
        disabled={loading}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      {/* Link para cadastro */}
      <div className="LoginForm-switch">
        <span>Não tem uma conta?</span>
        <button
          type="button"
          className="LoginForm-link LoginForm-link-primary"
          onClick={onSwitchToRegister}
        >
          Cadastre-se
        </button>
      </div>
    </form>
  );
};

export default LoginForm;

