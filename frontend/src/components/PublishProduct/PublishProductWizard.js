import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useLocation } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import LocationInput from '../LocationInput/LocationInput';
import ImageUploader from '../ImageUploader/ImageUploader';
import ProductService from '../../services/product.service';
import './PublishProductWizard.css';

/**
 * Wizard de Publicação de Produto
 * 
 * Componente multi-passo para publicação de produtos com:
 * - Passo 1: Categoria e informações básicas
 * - Passo 2: Preço e localização
 * - Passo 3: Imagens e descrição
 * - Passo 4: Preview e publicação
 * 
 * @param {Function} [onSuccess] - Callback chamado quando o produto é publicado com sucesso
 * @param {Function} [onCancel] - Callback chamado quando o usuário cancela
 */
const PublishProductWizard = ({ onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location } = useLocation();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  const totalSteps = 4;

  // Observar valores do formulário
  const watchedValues = watch();

  // Categorias disponíveis
  const categories = [
    { value: 'cadeira-rodas', label: 'Cadeiras de Rodas' },
    { value: 'cama-hospitalar', label: 'Camas Hospitalares' },
    { value: 'andador', label: 'Andadores' },
    { value: 'muleta', label: 'Muletas' },
    { value: 'oxigenoterapia', label: 'Oxigenoterapia' },
    { value: 'maca', label: 'Macas' },
    { value: 'monitoramento', label: 'Equipamentos de Monitoramento' },
    { value: 'reabilitacao', label: 'Equipamentos de Reabilitação' },
    { value: 'outros', label: 'Outros' }
  ];

  // Condições disponíveis
  const conditions = [
    { value: 'new', label: 'Novo' },
    { value: 'like_new', label: 'Seminovo' },
    { value: 'good', label: 'Bom estado' },
    { value: 'fair', label: 'Estado regular' },
    { value: 'poor', label: 'Estado ruim' }
  ];

  /**
   * Valida se o passo atual pode ser avançado
   */
  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return watchedValues.title && watchedValues.category && watchedValues.condition;
      case 2:
        // Localização é opcional, mas recomendada
        return watchedValues.price && watchedValues.price > 0;
      case 3:
        return watchedValues.description;
      case 4:
        return true; // Sempre pode publicar no último passo
      default:
        return false;
    }
  };

  /**
   * Handler para próximo passo
   */
  const handleNext = () => {
    if (canProceedToNextStep() && currentStep < totalSteps) {
      setError(null);
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Handler para passo anterior
   */
  const handlePrevious = () => {
    if (currentStep > 1) {
      setError(null);
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Handler para quando imagens são enviadas com sucesso
   */
  const handleImageUploadSuccess = (uploadedImages, imageIndex) => {
    // uploadedImages pode ser um array ou um objeto único
    let newUrls = [];
    
    if (Array.isArray(uploadedImages)) {
      // Array de imagens (upload múltiplo)
      newUrls = uploadedImages.map(img => {
        // Se for string, retornar diretamente
        if (typeof img === 'string') {
          return img.trim();
        }
        // Se for objeto, extrair a propriedade 'url'
        if (img && typeof img === 'object' && img.url) {
          return img.url.trim();
        }
        return null;
      }).filter(url => url && url.length > 0);
    } else if (uploadedImages) {
      // Objeto único (upload individual)
      if (typeof uploadedImages === 'string') {
        newUrls = [uploadedImages.trim()];
      } else if (uploadedImages && typeof uploadedImages === 'object' && uploadedImages.url) {
        newUrls = [uploadedImages.url.trim()];
      }
    }
    
    // Log para debug
    if (process.env.NODE_ENV === 'development') {
      console.log('📸 Imagens recebidas no callback:', {
        uploadedImages,
        extractedUrls: newUrls,
        currentImageUrls: imageUrls
      });
    }
    
    // Adicionar apenas URLs que ainda não existem
    const uniqueNewUrls = newUrls.filter(url => url && !imageUrls.includes(url));
    if (uniqueNewUrls.length > 0) {
      const updatedUrls = [...imageUrls, ...uniqueNewUrls];
      setImageUrls(updatedUrls);
      setValue('images', updatedUrls);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ URLs atualizadas:', updatedUrls);
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Nenhuma URL nova foi adicionada. URLs recebidas:', newUrls);
    }
  };

  /**
   * Handler para remover imagem
   */
  const handleRemoveImage = (index) => {
    const newImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImages);
    setValue('images', newImages);
  };

  /**
   * Handler para publicação do produto
   */
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Preparar dados para envio
      const productData = {
        title: data.title,
        description: data.description || '',
        category: data.category,
        price: parseFloat(data.price),
        monthlyPrice: data.monthlyPrice ? parseFloat(data.monthlyPrice) : null,
        condition: data.condition,
        // Enviar location como objeto com lat e lng se disponível
        ...(location?.lat && location?.lng && {
          location: {
            lat: location.lat,
            lng: location.lng
          }
        }),
        address: location?.address || '',
        cep: location?.cep || '',
        images: imageUrls.length > 0 ? imageUrls : [], // Array vazio se não houver imagens
        availability: true
      };

      // Log dos dados antes de enviar (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 Dados do produto a serem enviados:', {
          ...productData,
          imagesCount: productData.images?.length || 0,
          images: productData.images
        });
        console.log('📸 Estado imageUrls:', imageUrls);
      }

      // Criar produto
      const response = await ProductService.createProduct(productData);
      const product = response.data || response;

      // Sucesso
      if (onSuccess) {
        onSuccess(product);
      } else {
        // Redirecionar para a página do produto criado
        navigate(`/produto/${product.id}`);
      }
    } catch (err) {
      console.error('Erro ao publicar produto:', err);
      
      // Melhorar mensagens de erro
      let errorMessage = 'Erro ao publicar produto. Tente novamente.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      // Mensagens específicas para erros comuns
      if (errorMessage.includes('obrigatório')) {
        errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      } else if (errorMessage.includes('autenticado') || errorMessage.includes('401')) {
        errorMessage = 'Você precisa estar logado para publicar produtos. Por favor, faça login.';
      } else if (errorMessage.includes('permissão') || errorMessage.includes('403')) {
        errorMessage = 'Você não tem permissão para realizar esta ação.';
      } else if (errorMessage.includes('network') || err.response?.status === 0) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão e se o backend está rodando.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renderiza o conteúdo do passo atual
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  /**
   * Passo 1: Categoria e informações básicas
   */
  const renderStep1 = () => (
    <div className="PublishProductWizard-step">
      <h3 className="PublishProductWizard-step-title">Informações Básicas</h3>
      <p className="PublishProductWizard-step-description">
        Comece definindo o título, categoria e condição do seu equipamento.
      </p>

      <div className="PublishProductWizard-form">
        {/* Título */}
        <div className="PublishProductWizard-field">
          <label htmlFor="title" className="PublishProductWizard-label">
            Título do Produto <span className="PublishProductWizard-required">*</span>
          </label>
          <input
            id="title"
            type="text"
            className={`PublishProductWizard-input ${errors.title ? 'PublishProductWizard-input-error' : ''}`}
            placeholder="Ex: Cadeira de Rodas Standard"
            {...register('title', {
              required: 'Título é obrigatório',
              minLength: { value: 3, message: 'Título deve ter no mínimo 3 caracteres' },
              maxLength: { value: 200, message: 'Título deve ter no máximo 200 caracteres' }
            })}
          />
          {errors.title && (
            <span className="PublishProductWizard-error">{errors.title.message}</span>
          )}
        </div>

        {/* Categoria */}
        <div className="PublishProductWizard-field">
          <label htmlFor="category" className="PublishProductWizard-label">
            Categoria <span className="PublishProductWizard-required">*</span>
          </label>
          <select
            id="category"
            className={`PublishProductWizard-select ${errors.category ? 'PublishProductWizard-input-error' : ''}`}
            {...register('category', { required: 'Categoria é obrigatória' })}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className="PublishProductWizard-error">{errors.category.message}</span>
          )}
        </div>

        {/* Condição */}
        <div className="PublishProductWizard-field">
          <label htmlFor="condition" className="PublishProductWizard-label">
            Condição do Equipamento <span className="PublishProductWizard-required">*</span>
          </label>
          <select
            id="condition"
            className={`PublishProductWizard-select ${errors.condition ? 'PublishProductWizard-input-error' : ''}`}
            {...register('condition', { required: 'Condição é obrigatória' })}
          >
            <option value="">Selecione a condição</option>
            {conditions.map((cond) => (
              <option key={cond.value} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>
          {errors.condition && (
            <span className="PublishProductWizard-error">{errors.condition.message}</span>
          )}
        </div>
      </div>
    </div>
  );

  /**
   * Passo 2: Preço e localização
   */
  const renderStep2 = () => (
    <div className="PublishProductWizard-step">
      <h3 className="PublishProductWizard-step-title">Preço e Localização</h3>
      <p className="PublishProductWizard-step-description">
        Defina o preço diário de aluguel e a localização do equipamento.
      </p>

      <div className="PublishProductWizard-form">
        {/* Preço */}
        <div className="PublishProductWizard-field">
          <label htmlFor="price" className="PublishProductWizard-label">
            Preço por dia (R$) <span className="PublishProductWizard-required">*</span>
          </label>
          <div className="PublishProductWizard-price-wrapper">
            <span className="PublishProductWizard-currency">R$</span>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              className={`PublishProductWizard-input PublishProductWizard-price-input ${errors.price ? 'PublishProductWizard-input-error' : ''}`}
              placeholder="0.00"
              {...register('price', {
                required: 'Preço é obrigatório',
                min: { value: 0.01, message: 'Preço deve ser maior que zero' }
              })}
            />
          </div>
          {errors.price && (
            <span className="PublishProductWizard-error">{errors.price.message}</span>
          )}
          <p className="PublishProductWizard-hint">
            Este é o valor que será cobrado por dia de aluguel do equipamento.
          </p>
        </div>

        {/* Preço Mensal (Opcional) */}
        <div className="PublishProductWizard-field">
          <label htmlFor="monthlyPrice" className="PublishProductWizard-label">
            Preço por mês (R$) <span className="PublishProductWizard-optional">(Opcional)</span>
          </label>
          <div className="PublishProductWizard-price-wrapper">
            <span className="PublishProductWizard-currency">R$</span>
            <input
              id="monthlyPrice"
              type="number"
              step="0.01"
              min="0.01"
              className={`PublishProductWizard-input PublishProductWizard-price-input ${errors.monthlyPrice ? 'PublishProductWizard-input-error' : ''}`}
              placeholder="0.00"
              {...register('monthlyPrice', {
                min: { value: 0.01, message: 'Preço mensal deve ser maior que zero' },
                validate: (value) => {
                  if (value && watchedValues.price) {
                    const dailyTotal = parseFloat(watchedValues.price) * 30;
                    if (parseFloat(value) >= dailyTotal) {
                      return 'Preço mensal deve ser menor que 30 dias do preço diário para oferecer desconto';
                    }
                  }
                  return true;
                }
              })}
            />
          </div>
          {errors.monthlyPrice && (
            <span className="PublishProductWizard-error">{errors.monthlyPrice.message}</span>
          )}
          <p className="PublishProductWizard-hint">
            💡 Ofereça um desconto para aluguéis mensais (30+ dias). Se não informado, será calculado automaticamente como 30 × preço diário.
          </p>
        </div>

        {/* Localização */}
        <div className="PublishProductWizard-field">
          <label className="PublishProductWizard-label">
            Localização <span className="PublishProductWizard-required">*</span>
          </label>
          <LocationInput 
            placeholder="Digite o CEP (ex: 01310-100)"
            showGPSButton={true}
          />
          {!location?.lat && !location?.lng && (
            <p className="PublishProductWizard-hint">
              ⚠️ Localização é recomendada para que os clientes possam encontrá-lo. Você pode publicar sem localização, mas o produto não aparecerá em buscas por proximidade.
            </p>
          )}
          {location?.address && (
            <p className="PublishProductWizard-success">
              ✓ Localização definida: {location.address}
            </p>
          )}
          {location?.lat && location?.lng && !location?.address && (
            <p className="PublishProductWizard-success">
              ✓ Coordenadas definidas: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  /**
   * Passo 3: Imagens e descrição
   */
  const renderStep3 = () => {
    return (
      <div className="PublishProductWizard-step">
        <h3 className="PublishProductWizard-step-title">Imagens e Descrição</h3>
        <p className="PublishProductWizard-step-description">
          Adicione imagens e uma descrição detalhada do seu equipamento.
        </p>

        <div className="PublishProductWizard-form">
          {/* Imagens */}
          <div className="PublishProductWizard-field">
            <label className="PublishProductWizard-label">
              Imagens do Produto
            </label>
            <ImageUploader
              maxFiles={10}
              maxSize={5 * 1024 * 1024} // 5MB
              onUploadSuccess={handleImageUploadSuccess}
              onUploadError={(error) => {
                console.error('Erro ao fazer upload:', error);
                setError('Erro ao fazer upload das imagens. Tente novamente.');
              }}
              initialImages={imageUrls.map(url => ({
                preview: url,
                uploaded: true,
                url: url
              }))}
            />
            
            {/* Preview das imagens já adicionadas */}
            {imageUrls.length > 0 && (
              <div className="PublishProductWizard-images-preview">
                <p className="PublishProductWizard-hint" style={{ marginTop: '1rem' }}>
                  {imageUrls.length} {imageUrls.length === 1 ? 'imagem adicionada' : 'imagens adicionadas'}
                </p>
                <div className="PublishProductWizard-images-grid">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="PublishProductWizard-image-item">
                      <img src={url} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="PublishProductWizard-remove-image"
                        onClick={() => handleRemoveImage(index)}
                        aria-label="Remover imagem"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="PublishProductWizard-field">
            <label htmlFor="description" className="PublishProductWizard-label">
              Descrição <span className="PublishProductWizard-required">*</span>
            </label>
            <textarea
              id="description"
              rows={6}
              className={`PublishProductWizard-textarea ${errors.description ? 'PublishProductWizard-input-error' : ''}`}
              placeholder="Descreva o equipamento, suas características, condições de uso, etc."
              {...register('description', {
                required: 'Descrição é obrigatória',
                minLength: { value: 10, message: 'Descrição deve ter no mínimo 10 caracteres' }
              })}
            />
            {errors.description && (
              <span className="PublishProductWizard-error">{errors.description.message}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Passo 4: Preview e publicação
   */
  const renderStep4 = () => {
    const formatPrice = (price) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price || 0);
    };

    const getCategoryLabel = (value) => {
      return categories.find(c => c.value === value)?.label || value;
    };

    const getConditionLabel = (value) => {
      return conditions.find(c => c.value === value)?.label || value;
    };

    return (
      <div className="PublishProductWizard-step">
        <h3 className="PublishProductWizard-step-title">Preview e Publicação</h3>
        <p className="PublishProductWizard-step-description">
          Revise todas as informações antes de publicar seu produto.
        </p>

        <div className="PublishProductWizard-preview">
          <div className="PublishProductWizard-preview-card">
            {/* Imagem */}
            {imageUrls.length > 0 ? (
              <div className="PublishProductWizard-preview-image">
                <img src={imageUrls[0]} alt={watchedValues.title} />
              </div>
            ) : (
              <div className="PublishProductWizard-preview-image-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p>Sem imagem</p>
              </div>
            )}

            {/* Informações */}
            <div className="PublishProductWizard-preview-content">
              <h4 className="PublishProductWizard-preview-title">{watchedValues.title || 'Sem título'}</h4>
              
              <div className="PublishProductWizard-preview-info">
                <div className="PublishProductWizard-preview-info-item">
                  <strong>Categoria:</strong> {getCategoryLabel(watchedValues.category)}
                </div>
                <div className="PublishProductWizard-preview-info-item">
                  <strong>Condição:</strong> {getConditionLabel(watchedValues.condition)}
                </div>
                <div className="PublishProductWizard-preview-info-item">
                  <strong>Preço:</strong> {formatPrice(watchedValues.price)} / dia
                </div>
                {location?.address && (
                  <div className="PublishProductWizard-preview-info-item">
                    <strong>Localização:</strong> {location.address}
                  </div>
                )}
              </div>

              {watchedValues.description && (
                <div className="PublishProductWizard-preview-description">
                  <strong>Descrição:</strong>
                  <p>{watchedValues.description}</p>
                </div>
              )}

              {imageUrls.length > 1 && (
                <div className="PublishProductWizard-preview-images-count">
                  {imageUrls.length} {imageUrls.length === 1 ? 'imagem' : 'imagens'} adicionadas
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="PublishProductWizard">
      {/* Progress indicator */}
      <div className="PublishProductWizard-progress">
        {[...Array(totalSteps)].map((_, index) => (
          <div
            key={index}
            className={`PublishProductWizard-progress-step ${
              index + 1 < currentStep
                ? 'PublishProductWizard-progress-step-completed'
                : index + 1 === currentStep
                ? 'PublishProductWizard-progress-step-active'
                : ''
            }`}
          >
            <div className="PublishProductWizard-progress-step-number">{index + 1}</div>
            <div className="PublishProductWizard-progress-step-label">
              {index === 0 && 'Básico'}
              {index === 1 && 'Preço'}
              {index === 2 && 'Detalhes'}
              {index === 3 && 'Preview'}
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      <form onSubmit={handleSubmit(onSubmit)} className="PublishProductWizard-form-wrapper">
        {error && (
          <div className="PublishProductWizard-error-message" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {renderStepContent()}

        {/* Navigation buttons */}
        <div className="PublishProductWizard-actions">
          <div className="PublishProductWizard-actions-left">
            {onCancel && (
              <button
                type="button"
                className="PublishProductWizard-button PublishProductWizard-button-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </button>
            )}
            {currentStep > 1 && (
              <button
                type="button"
                className="PublishProductWizard-button PublishProductWizard-button-secondary"
                onClick={handlePrevious}
                disabled={loading}
              >
                Voltar
              </button>
            )}
          </div>

          <div className="PublishProductWizard-actions-right">
            {currentStep < totalSteps ? (
              <button
                type="button"
                className="PublishProductWizard-button PublishProductWizard-button-primary"
                onClick={handleNext}
                disabled={!canProceedToNextStep() || loading}
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                className="PublishProductWizard-button PublishProductWizard-button-primary"
                disabled={loading || !canProceedToNextStep()}
              >
                {loading ? 'Publicando...' : 'Publicar Produto'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PublishProductWizard;

