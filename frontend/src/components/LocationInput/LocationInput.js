import React, { useState, useEffect } from 'react';
import { useLocation } from '../../contexts/LocationContext';
import './LocationInput.css';

/**
 * Componente de Input de Localização
 * 
 * Permite que o usuário defina sua localização através de:
 * - Input de CEP com validação e auto-preenchimento via ViaCEP
 * - Botão para usar GPS
 * 
 * Integra com LocationContext para gerenciar o estado global de localização.
 * 
 * @param {Function} [onLocationChange] - Callback chamado quando a localização é alterada
 * @param {Object} [initialValue] - Valor inicial do CEP
 * @param {boolean} [showGPSButton=true] - Exibir botão de GPS
 * @param {string} [placeholder] - Placeholder do input
 */
const LocationInput = ({ 
  onLocationChange, 
  initialValue = '', 
  showGPSButton = true,
  placeholder = 'Digite o CEP (ex: 01310-100)'
}) => {
  const { 
    location, 
    setLocationByCEP, 
    setLocationByGPS, 
    loading, 
    error, 
    clearError 
  } = useLocation();

  const [cep, setCep] = useState(initialValue || (location?.cep || ''));
  const [localError, setLocalError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Sincroniza o CEP com a localização do contexto quando ela muda externamente
   */
  useEffect(() => {
    if (location?.cep && location.cep !== cep) {
      setCep(location.cep);
    }
  }, [location?.cep]);

  /**
   * Limpa erros quando o CEP muda
   */
  useEffect(() => {
    if (localError) {
      setLocalError(null);
    }
    if (error) {
      clearError();
    }
  }, [cep]);

  /**
   * Formata CEP enquanto o usuário digita (adiciona hífen)
   * 
   * @param {string} value - Valor do input
   * @returns {string} CEP formatado
   */
  const formatCEP = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 8 dígitos
    const limited = numbers.slice(0, 8);
    
    // Adiciona hífen após 5 dígitos
    if (limited.length > 5) {
      return `${limited.slice(0, 5)}-${limited.slice(5)}`;
    }
    
    return limited;
  };

  /**
   * Valida formato do CEP
   * 
   * @param {string} cepValue - CEP a ser validado
   * @returns {boolean} true se válido
   */
  const validateCEPFormat = (cepValue) => {
    const cleanCEP = cepValue.replace(/\D/g, '');
    return cleanCEP.length === 8;
  };

  /**
   * Handler de mudança no input de CEP
   */
  const handleCEPChange = (e) => {
    const value = e.target.value;
    const formatted = formatCEP(value);
    setCep(formatted);
    setLocalError(null);
    clearError();
  };

  /**
   * Handler de busca por CEP
   * Dispara quando o usuário termina de digitar (blur) ou pressiona Enter
   */
  const handleCEPSearch = async () => {
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (!cleanCEP) {
      return;
    }

    if (!validateCEPFormat(cep)) {
      setLocalError('CEP deve ter 8 dígitos');
      return;
    }

    try {
      setIsValidating(true);
      setLocalError(null);
      clearError();

      const locationData = await setLocationByCEP(cleanCEP);
      
      // Atualizar CEP formatado
      setCep(locationData.cep || formatCEP(cleanCEP));
      
      // Chamar callback se fornecido
      if (onLocationChange) {
        onLocationChange(locationData);
      }
    } catch (err) {
      setLocalError(err.message || 'Erro ao buscar CEP. Verifique se o CEP está correto.');
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Handler de tecla pressionada no input
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCEPSearch();
    }
  };

  /**
   * Handler para usar GPS
   */
  const handleUseGPS = async () => {
    try {
      setLocalError(null);
      clearError();

      const locationData = await setLocationByGPS();
      
      // Se o CEP estiver disponível na localização GPS, atualizar o input
      if (locationData.cep) {
        setCep(locationData.cep);
      }
      
      // Chamar callback se fornecido
      if (onLocationChange) {
        onLocationChange(locationData);
      }
    } catch (err) {
      setLocalError(err.message || 'Erro ao obter localização GPS');
    }
  };

  /**
   * Exibe endereço formatado se disponível
   */
  const displayAddress = () => {
    if (location?.address) {
      return location.address;
    }
    if (location?.city && location?.state) {
      return `${location.city}, ${location.state}`;
    }
    if (location?.lat && location?.lng) {
      return `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`;
    }
    return null;
  };

  const isLoading = loading || isValidating;
  const displayError = localError || error;

  return (
    <div className="LocationInput">
      <div className="LocationInput-field">
        <label htmlFor="location-cep" className="LocationInput-label">
          Localização
        </label>
        
        <div className="LocationInput-input-wrapper">
          <div className="LocationInput-input-container">
            <input
              id="location-cep"
              type="text"
              className={`LocationInput-input ${displayError ? 'LocationInput-input-error' : ''}`}
              placeholder={placeholder}
              value={cep}
              onChange={handleCEPChange}
              onBlur={handleCEPSearch}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              maxLength={9} // 8 dígitos + 1 hífen
              aria-invalid={displayError ? 'true' : 'false'}
              aria-describedby={displayError ? 'location-error' : displayAddress() ? 'location-address' : undefined}
            />
            
            {isLoading && (
              <div className="LocationInput-loading" aria-label="Buscando localização">
                <svg
                  className="LocationInput-spinner"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </div>

          {showGPSButton && (
            <button
              type="button"
              className="LocationInput-gps-button"
              onClick={handleUseGPS}
              disabled={isLoading}
              aria-label="Usar localização GPS"
              title="Usar minha localização atual"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </button>
          )}
        </div>

        {/* Mensagem de erro */}
        {displayError && (
          <span id="location-error" className="LocationInput-error" role="alert">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {displayError}
          </span>
        )}

        {/* Endereço encontrado */}
        {!displayError && displayAddress() && (
          <span id="location-address" className="LocationInput-address">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {displayAddress()}
          </span>
        )}
      </div>
    </div>
  );
};

export default LocationInput;



