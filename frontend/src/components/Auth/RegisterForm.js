import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import './RegisterForm.css';

/**
 * Componente de formulário de registro
 * 
 * Permite que novos usuários se cadastrem na aplicação.
 * Inclui validação de senha forte e seleção de role (proprietário/locatário).
 * Utiliza React Hook Form para validação e integra com AuthContext.
 * 
 * @param {Function} onSuccess - Callback chamado quando o registro é bem-sucedido
 * @param {Function} onSwitchToLogin - Callback para alternar para o formulário de login
 */
const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const { register: registerUser, loading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Observar o valor da senha para validação de confirmação
  const password = watch('password');
  // Observar o valor do role para aplicar estilos condicionais
  const selectedRole = watch('role');

  /**
   * Validação de email usando regex
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) || 'Email inválido';
  };

  /**
   * Validação de senha forte
   * Deve ter pelo menos 8 caracteres, uma letra maiúscula, uma minúscula e um número
   */
  const validatePassword = (password) => {
    if (!password) return 'Senha é obrigatória';
    
    if (password.length < 8) {
      return 'Senha deve ter no mínimo 8 caracteres';
    }
    
    if (!/[A-Z]/.test(password)) {
      return 'Senha deve conter pelo menos uma letra maiúscula';
    }
    
    if (!/[a-z]/.test(password)) {
      return 'Senha deve conter pelo menos uma letra minúscula';
    }
    
    if (!/[0-9]/.test(password)) {
      return 'Senha deve conter pelo menos um número';
    }
    
    return true;
  };

  /**
   * Validação de confirmação de senha
   */
  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) return 'Confirmação de senha é obrigatória';
    if (confirmPassword !== password) return 'As senhas não coincidem';
    return true;
  };

  /**
   * Validação de telefone (opcional, mas se preenchido deve ser válido)
   */
  const validatePhone = (phone) => {
    if (!phone) return true; // Telefone é opcional
    
    // Remove caracteres não numéricos
    const phoneDigits = phone.replace(/\D/g, '');
    
    // Deve ter 10 ou 11 dígitos (com ou sem DDD)
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      return 'Telefone inválido. Use o formato (XX) XXXXX-XXXX';
    }
    
    return true;
  };

  /**
   * Handler de submissão do formulário
   */
  const onSubmit = async (data) => {
    try {
      clearError();
      
      // Preparar dados para envio (remover confirmPassword)
      const { confirmPassword, ...userData } = data;
      
      // Formatar telefone (remover caracteres não numéricos)
      if (userData.phone) {
        userData.phone = userData.phone.replace(/\D/g, '');
      }
      
      await registerUser(userData);
      
      // Se houver callback de sucesso, chamá-lo
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Erro já é tratado pelo AuthContext
      console.error('Erro no registro:', err);
    }
  };

  return (
    <form className="RegisterForm" onSubmit={handleSubmit(onSubmit)}>
      <div className="RegisterForm-header">
        <h2 className="RegisterForm-title">Criar Conta</h2>
        <p className="RegisterForm-subtitle">
          Cadastre-se para começar a alugar ou alugar seus equipamentos
        </p>
      </div>

      {/* Mensagem de erro global */}
      {error && (
        <div className="RegisterForm-error" role="alert">
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

      {/* Campo de Nome */}
      <div className="RegisterForm-field">
        <label htmlFor="name" className="RegisterForm-label">
          Nome Completo <span className="RegisterForm-required">*</span>
        </label>
        <input
          id="name"
          type="text"
          className={`RegisterForm-input ${errors.name ? 'RegisterForm-input-error' : ''}`}
          placeholder="João Silva"
          {...register('name', {
            required: 'Nome é obrigatório',
            minLength: {
              value: 3,
              message: 'Nome deve ter no mínimo 3 caracteres',
            },
          })}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <span id="name-error" className="RegisterForm-field-error" role="alert">
            {errors.name.message}
          </span>
        )}
      </div>

      {/* Campo de Email */}
      <div className="RegisterForm-field">
        <label htmlFor="email" className="RegisterForm-label">
          Email <span className="RegisterForm-required">*</span>
        </label>
        <input
          id="email"
          type="email"
          className={`RegisterForm-input ${errors.email ? 'RegisterForm-input-error' : ''}`}
          placeholder="seu@email.com"
          {...register('email', {
            required: 'Email é obrigatório',
            validate: validateEmail,
          })}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" className="RegisterForm-field-error" role="alert">
            {errors.email.message}
          </span>
        )}
      </div>

      {/* Campo de Telefone */}
      <div className="RegisterForm-field">
        <label htmlFor="phone" className="RegisterForm-label">
          Telefone
        </label>
        <input
          id="phone"
          type="tel"
          className={`RegisterForm-input ${errors.phone ? 'RegisterForm-input-error' : ''}`}
          placeholder="(11) 99999-9999"
          {...register('phone', {
            validate: validatePhone,
          })}
          aria-invalid={errors.phone ? 'true' : 'false'}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && (
          <span id="phone-error" className="RegisterForm-field-error" role="alert">
            {errors.phone.message}
          </span>
        )}
      </div>

      {/* Campo de Role (Proprietário/Locatário) */}
      <div className="RegisterForm-field">
        <label className="RegisterForm-label">
          Você é <span className="RegisterForm-required">*</span>
        </label>
        <div className="RegisterForm-role-group">
          <label className={`RegisterForm-role-option ${selectedRole === 'renter' ? 'RegisterForm-role-option-selected' : ''}`}>
            <input
              type="radio"
              value="renter"
              {...register('role', {
                required: 'Selecione uma opção',
              })}
              className="RegisterForm-role-input"
            />
            <div className="RegisterForm-role-content">
              <span className="RegisterForm-role-title">Locatário</span>
              <span className="RegisterForm-role-description">
                Quero alugar equipamentos
              </span>
            </div>
          </label>
          <label className={`RegisterForm-role-option ${selectedRole === 'owner' ? 'RegisterForm-role-option-selected' : ''}`}>
            <input
              type="radio"
              value="owner"
              {...register('role', {
                required: 'Selecione uma opção',
              })}
              className="RegisterForm-role-input"
            />
            <div className="RegisterForm-role-content">
              <span className="RegisterForm-role-title">Proprietário</span>
              <span className="RegisterForm-role-description">
                Quero alugar meus equipamentos
              </span>
            </div>
          </label>
        </div>
        {errors.role && (
          <span className="RegisterForm-field-error" role="alert">
            {errors.role.message}
          </span>
        )}
      </div>

      {/* Campo de Senha */}
      <div className="RegisterForm-field">
        <label htmlFor="password" className="RegisterForm-label">
          Senha <span className="RegisterForm-required">*</span>
        </label>
        <div className="RegisterForm-password-wrapper">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className={`RegisterForm-input ${errors.password ? 'RegisterForm-input-error' : ''}`}
            placeholder="Digite sua senha"
            {...register('password', {
              required: 'Senha é obrigatória',
              validate: validatePassword,
            })}
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            className="RegisterForm-password-toggle"
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
          <span id="password-error" className="RegisterForm-field-error" role="alert">
            {errors.password.message}
          </span>
        )}
        <div className="RegisterForm-password-hint">
          <span>Senha deve ter no mínimo 8 caracteres, incluindo:</span>
          <ul>
            <li>Uma letra maiúscula</li>
            <li>Uma letra minúscula</li>
            <li>Um número</li>
          </ul>
        </div>
      </div>

      {/* Campo de Confirmação de Senha */}
      <div className="RegisterForm-field">
        <label htmlFor="confirmPassword" className="RegisterForm-label">
          Confirmar Senha <span className="RegisterForm-required">*</span>
        </label>
        <div className="RegisterForm-password-wrapper">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            className={`RegisterForm-input ${errors.confirmPassword ? 'RegisterForm-input-error' : ''}`}
            placeholder="Digite sua senha novamente"
            {...register('confirmPassword', {
              required: 'Confirmação de senha é obrigatória',
              validate: validateConfirmPassword,
            })}
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          />
          <button
            type="button"
            className="RegisterForm-password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showConfirmPassword ? (
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
        {errors.confirmPassword && (
          <span id="confirmPassword-error" className="RegisterForm-field-error" role="alert">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      {/* Botão de submit */}
      <button
        type="submit"
        className="RegisterForm-submit"
        disabled={loading}
      >
        {loading ? 'Criando conta...' : 'Criar Conta'}
      </button>

      {/* Link para login */}
      <div className="RegisterForm-switch">
        <span>Já tem uma conta?</span>
        <button
          type="button"
          className="RegisterForm-link RegisterForm-link-primary"
          onClick={onSwitchToLogin}
        >
          Entrar
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;

