import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Context de Localização
 * 
 * Gerencia a localização do usuário na aplicação, permitindo:
 * - Obter localização via GPS
 * - Definir localização via CEP
 * - Armazenar localização no localStorage para persistência
 * 
 * @module contexts/LocationContext
 */

// Criar o contexto
const LocationContext = createContext(null);

/**
 * Chave para armazenar localização no localStorage
 */
const LOCATION_STORAGE_KEY = 'praxeo_user_location';

/**
 * Função auxiliar para validar CEP
 * Remove caracteres não numéricos e valida formato
 * 
 * @param {string} cep - CEP a ser validado
 * @returns {string|null} CEP formatado ou null se inválido
 */
const validateCEP = (cep) => {
  if (!cep) return null;
  
  // Remover caracteres não numéricos
  const cleanCEP = cep.replace(/\D/g, '');
  
  // Validar se tem 8 dígitos
  if (cleanCEP.length !== 8) return null;
  
  return cleanCEP;
};

/**
 * Função auxiliar para buscar endereço via CEP usando ViaCEP
 * 
 * @param {string} cep - CEP a ser buscado
 * @returns {Promise<Object>} Dados do endereço
 */
const fetchAddressByCEP = async (cep) => {
  const cleanCEP = validateCEP(cep);
  if (!cleanCEP) {
    throw new Error('CEP inválido');
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return {
      cep: data.cep,
      address: `${data.logradouro || ''} ${data.bairro || ''} ${data.localidade || ''} ${data.uf || ''}`.trim(),
      city: data.localidade || '',
      state: data.uf || '',
      neighborhood: data.bairro || '',
      street: data.logradouro || '',
    };
  } catch (error) {
    throw new Error(`Erro ao buscar CEP: ${error.message}`);
  }
};

/**
 * Função auxiliar para obter coordenadas via geocodificação
 * Usa a API do Nominatim (OpenStreetMap) como fallback
 * 
 * @param {string} address - Endereço para geocodificar
 * @returns {Promise<Object>} Coordenadas { lat, lng }
 */
const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Praxeo.tech',
        },
      }
    );
    const data = await response.json();

    if (data.length === 0) {
      throw new Error('Endereço não encontrado');
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (error) {
    throw new Error(`Erro ao geocodificar endereço: ${error.message}`);
  }
};

/**
 * Provider do LocationContext
 * 
 * Envolve a aplicação e fornece o estado de localização para todos os componentes filhos.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos
 */
export const LocationProvider = ({ children }) => {
  // Estado da localização
  const [location, setLocation] = useState(null);
  
  // Estado de loading
  const [loading, setLoading] = useState(false);
  
  // Estado de erro
  const [error, setError] = useState(null);

  /**
   * Carrega localização salva do localStorage ao montar o componente
   */
  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (savedLocation) {
        const parsedLocation = JSON.parse(savedLocation);
        setLocation(parsedLocation);
      }
    } catch (err) {
      console.error('Erro ao carregar localização do localStorage:', err);
    }
  }, []);

  /**
   * Salva localização no localStorage
   * 
   * @param {Object} loc - Objeto de localização
   */
  const saveLocation = useCallback((loc) => {
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
    } catch (err) {
      console.error('Erro ao salvar localização no localStorage:', err);
    }
  }, []);

  /**
   * Remove localização do localStorage
   */
  const removeLocation = useCallback(() => {
    try {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    } catch (err) {
      console.error('Erro ao remover localização do localStorage:', err);
    }
  }, []);

  /**
   * Obtém localização via GPS
   * 
   * @param {Object} [options] - Opções do Geolocation API
   * @param {number} [options.timeout=10000] - Timeout em milissegundos
   * @param {number} [options.maximumAge=600000] - Idade máxima do cache em milissegundos (10 minutos)
   * @returns {Promise<Object>} Objeto com lat, lng e source: 'gps'
   */
  const setLocationByGPS = useCallback(async (options = {}) => {
    const {
      timeout = 10000,
      maximumAge = 600000, // 10 minutos
      enableHighAccuracy = true,
    } = options;

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error('Geolocalização não é suportada pelo navegador');
        setError(error.message);
        reject(error);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            const locationData = {
              lat: latitude,
              lng: longitude,
              source: 'gps',
              timestamp: Date.now(),
            };

            setLocation(locationData);
            saveLocation(locationData);
            setLoading(false);
            resolve(locationData);
          } catch (err) {
            setError(err.message || 'Erro ao processar localização GPS');
            setLoading(false);
            reject(err);
          }
        },
        (err) => {
          let errorMessage = 'Erro ao obter localização GPS';
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada. Por favor, permita o acesso à localização nas configurações do navegador.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível. Verifique se o GPS está ativado.';
              break;
            case err.TIMEOUT:
              errorMessage = 'Tempo esgotado ao obter localização. Tente novamente.';
              break;
            default:
              errorMessage = err.message || errorMessage;
          }

          setError(errorMessage);
          setLoading(false);
          reject(new Error(errorMessage));
        },
        {
          timeout,
          maximumAge,
          enableHighAccuracy,
        }
      );
    });
  }, [saveLocation]);

  /**
   * Define localização via CEP
   * Busca o endereço e tenta obter coordenadas via geocodificação
   * 
   * @param {string} cep - CEP a ser buscado
   * @returns {Promise<Object>} Objeto com lat, lng, cep, address e source: 'cep'
   */
  const setLocationByCEP = useCallback(async (cep) => {
    try {
      setLoading(true);
      setError(null);

      // Validar e buscar endereço
      const addressData = await fetchAddressByCEP(cep);

      // Tentar obter coordenadas via geocodificação
      let coordinates = null;
      try {
        const fullAddress = `${addressData.street}, ${addressData.neighborhood}, ${addressData.city}, ${addressData.state}, Brasil`;
        coordinates = await geocodeAddress(fullAddress);
      } catch (geoError) {
        console.warn('Não foi possível obter coordenadas do endereço:', geoError);
        // Continuar mesmo sem coordenadas
      }

      const locationData = {
        cep: addressData.cep,
        address: addressData.address,
        city: addressData.city,
        state: addressData.state,
        neighborhood: addressData.neighborhood,
        street: addressData.street,
        source: 'cep',
        timestamp: Date.now(),
        ...(coordinates && { lat: coordinates.lat, lng: coordinates.lng }),
      };

      setLocation(locationData);
      saveLocation(locationData);
      setLoading(false);
      return locationData;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao buscar localização por CEP';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, [saveLocation]);

  /**
   * Define localização manualmente (coordenadas e/ou endereço)
   * 
   * @param {Object} locationData - Dados da localização
   * @param {number} [locationData.lat] - Latitude
   * @param {number} [locationData.lng] - Longitude
   * @param {string} [locationData.cep] - CEP
   * @param {string} [locationData.address] - Endereço completo
   * @param {string} [locationData.city] - Cidade
   * @param {string} [locationData.state] - Estado
   */
  const setLocationManually = useCallback((locationData) => {
    try {
      const fullLocationData = {
        ...locationData,
        source: 'manual',
        timestamp: Date.now(),
      };

      setLocation(fullLocationData);
      saveLocation(fullLocationData);
      setError(null);
    } catch (err) {
      const errorMessage = err.message || 'Erro ao definir localização';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [saveLocation]);

  /**
   * Limpa a localização atual
   */
  const clearLocation = useCallback(() => {
    setLocation(null);
    removeLocation();
    setError(null);
  }, [removeLocation]);

  /**
   * Limpa o erro do estado
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Valor do contexto
  const value = {
    // Estado
    location,
    loading,
    error,
    hasLocation: !!location,
    hasCoordinates: !!(location?.lat && location?.lng),

    // Funções
    setLocationByGPS,
    setLocationByCEP,
    setLocationManually,
    clearLocation,
    clearError,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de localização
 * 
 * @returns {Object} Contexto de localização com estado e funções
 * @throws {Error} Se usado fora do LocationProvider
 * 
 * @example
 * function MyComponent() {
 *   const { location, setLocationByGPS, setLocationByCEP } = useLocation();
 *   
 *   return (
 *     <div>
 *       <button onClick={() => setLocationByGPS()}>Usar GPS</button>
 *       <button onClick={() => setLocationByCEP('01310-100')}>Buscar por CEP</button>
 *       {location && <p>Localização: {location.address || `${location.lat}, ${location.lng}`}</p>}
 *     </div>
 *   );
 * }
 */
export const useLocation = () => {
  const context = useContext(LocationContext);
  
  if (!context) {
    throw new Error('useLocation deve ser usado dentro de um LocationProvider');
  }
  
  return context;
};

export default LocationContext;

