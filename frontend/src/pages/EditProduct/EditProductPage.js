import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import ProductService from '../../services/product.service';
import LocationInput from '../../components/LocationInput/LocationInput';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import './EditProductPage.css';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { location: userLocation, setLocationManually } = useLocation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const watchedValues = watch();

  // Categorias disponíveis
  const categories = [
    { value: 'cadeira-rodas', label: 'Cadeiras de Rodas' },
    { value: 'cama-hospitalar', label: 'Camas Hospitalares' },
    { value: 'andador', label: 'Andadores' },
    { value: 'muleta', label: 'Muletas' },
    { value: 'concentrador-oxigenio', label: 'Concentradores de Oxigênio' },
    { value: 'aparelho-pressao', label: 'Aparelhos de Pressão' },
    { value: 'nebulizador', label: 'Nebulizadores' },
    { value: 'monitor-glicemia', label: 'Monitores de Glicemia' },
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

  // Carregar produto
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ProductService.getProductById(id);
        const productData = response.data || response;

        // Verificar se o usuário é o proprietário
        if (productData.userId !== user?.id && productData.owner?.id !== user?.id) {
          setError('Você não tem permissão para editar este produto');
          return;
        }

        setProduct(productData);

        // Preencher formulário com dados do produto
        setValue('title', productData.title);
        setValue('category', productData.category);
        setValue('condition', productData.condition);
        setValue('price', productData.price);
        setValue('monthlyPrice', productData.monthlyPrice || '');
        setValue('description', productData.description);
        const productImages = productData.images || [];
        setValue('images', productImages);
        setImageUrls(productImages); // Inicializar estado de imagens
        setValue('availability', productData.availability);

        // Preencher localização se disponível
        if (productData.location?.coordinates) {
          const [lng, lat] = productData.location.coordinates;
          setValue('location.lat', lat);
          setValue('location.lng', lng);
          setValue('location.address', productData.address || '');
          setValue('location.cep', productData.cep || '');
          
          // Atualizar contexto de localização
          if (lat && lng) {
            setLocationManually({
              lat,
              lng,
              address: productData.address,
              cep: productData.cep,
            });
          }
        }
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError(err.message || 'Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      loadProduct();
    }
  }, [id, user, setValue, setLocationManually]);

  const handleLocationChange = (newLocation) => {
    setLocationManually(newLocation);
    setValue('location.lat', newLocation.lat);
    setValue('location.lng', newLocation.lng);
    setValue('location.address', newLocation.address);
    setValue('location.cep', newLocation.cep);
  };

  /**
   * Handler para quando imagens são enviadas com sucesso via upload
   */
  const handleImageUploadSuccess = (uploadedImages, imageIndex) => {
    let newUrls = [];
    
    if (Array.isArray(uploadedImages)) {
      // Array de imagens (upload múltiplo)
      newUrls = uploadedImages.map(img => {
        if (typeof img === 'string') {
          return img.trim();
        }
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
    
    // Adicionar apenas URLs que ainda não existem
    const uniqueNewUrls = newUrls.filter(url => url && !imageUrls.includes(url));
    if (uniqueNewUrls.length > 0) {
      const updatedUrls = [...imageUrls, ...uniqueNewUrls];
      setImageUrls(updatedUrls);
      setValue('images', updatedUrls);
    }
  };

  /**
   * Handler para adicionar imagem por URL manualmente
   */
  const handleAddImageByUrl = () => {
    const imageUrl = prompt('Digite a URL da imagem:');
    if (imageUrl && imageUrl.trim()) {
      const trimmedUrl = imageUrl.trim();
      if (!imageUrls.includes(trimmedUrl)) {
        const updatedUrls = [...imageUrls, trimmedUrl];
        setImageUrls(updatedUrls);
        setValue('images', updatedUrls);
      } else {
        alert('Esta imagem já foi adicionada.');
      }
    }
  };

  /**
   * Handler para remover imagem
   */
  const handleRemoveImage = (indexToRemove) => {
    const updatedUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(updatedUrls);
    setValue('images', updatedUrls);
  };

  /**
   * Handlers para drag-and-drop de imagens
   */
  const handleDragStart = (e, index) => {
    // Prevenir drag se o clique foi no botão de remover
    if (e.target.closest('.EditProductPage-remove-image-button')) {
      e.preventDefault();
      return;
    }
    
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    
    // Criar uma imagem fantasma personalizada
    const dragImage = e.currentTarget.cloneNode(true);
    dragImage.style.width = '150px';
    dragImage.style.opacity = '0.8';
    document.body.appendChild(dragImage);
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    e.dataTransfer.setDragImage(dragImage, 75, 75);
    
    // Remover a imagem fantasma após um pequeno delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragEnd = (e) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reordenar array de imagens
    const newImageUrls = [...imageUrls];
    const draggedItem = newImageUrls[draggedIndex];
    
    // Remover item da posição original
    newImageUrls.splice(draggedIndex, 1);
    
    // Inserir item na nova posição
    newImageUrls.splice(dropIndex, 0, draggedItem);
    
    // Atualizar estado
    setImageUrls(newImageUrls);
    setValue('images', newImageUrls);
    
    // Limpar estados de drag
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setError(null);

      const updateData = {
        title: data.title,
        category: data.category,
        condition: data.condition,
        price: parseFloat(data.price),
        monthlyPrice: data.monthlyPrice ? parseFloat(data.monthlyPrice) : null,
        description: data.description,
        images: imageUrls.length > 0 ? imageUrls : (data.images || []),
        availability: data.availability !== undefined ? data.availability : true,
      };

      // Adicionar localização se fornecida
      if (data.location?.lat && data.location?.lng) {
        updateData.location = {
          lat: parseFloat(data.location.lat),
          lng: parseFloat(data.location.lng),
        };
        if (data.location.address) updateData.address = data.location.address;
        if (data.location.cep) updateData.cep = data.location.cep;
      }

      await ProductService.updateProduct(id, updateData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      setError(err.message || 'Erro ao atualizar produto. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="EditProductPage-loading">
        <div className="spinner">Carregando...</div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="EditProductPage-error">
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</button>
      </div>
    );
  }

  return (
    <div className="EditProductPage">
      <div className="container">
        <h1 className="EditProductPage-title">Editar Produto</h1>

        {error && (
          <div className="EditProductPage-alert EditProductPage-alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="EditProductPage-form">
          {/* Informações Básicas */}
          <div className="EditProductPage-section">
            <h2 className="EditProductPage-section-title">Informações Básicas</h2>

            <div className="EditProductPage-field">
              <label htmlFor="title" className="EditProductPage-label">
                Título do Anúncio <span className="EditProductPage-required">*</span>
              </label>
              <input
                id="title"
                type="text"
                className={`EditProductPage-input ${errors.title ? 'EditProductPage-input-error' : ''}`}
                placeholder="Ex: Cadeira de Rodas Motorizada"
                {...register('title', {
                  required: 'O título é obrigatório',
                  minLength: { value: 3, message: 'Mínimo de 3 caracteres' },
                  maxLength: { value: 200, message: 'Máximo de 200 caracteres' },
                })}
              />
              {errors.title && (
                <span className="EditProductPage-error-message">{errors.title.message}</span>
              )}
            </div>

            <div className="EditProductPage-field">
              <label htmlFor="category" className="EditProductPage-label">
                Categoria <span className="EditProductPage-required">*</span>
              </label>
              <select
                id="category"
                className={`EditProductPage-select ${errors.category ? 'EditProductPage-input-error' : ''}`}
                {...register('category', {
                  required: 'A categoria é obrigatória',
                })}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="EditProductPage-error-message">{errors.category.message}</span>
              )}
            </div>

            <div className="EditProductPage-field">
              <label htmlFor="condition" className="EditProductPage-label">
                Condição do Equipamento <span className="EditProductPage-required">*</span>
              </label>
              <select
                id="condition"
                className={`EditProductPage-select ${errors.condition ? 'EditProductPage-input-error' : ''}`}
                {...register('condition', {
                  required: 'A condição é obrigatória',
                })}
              >
                {conditions.map(cond => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <span className="EditProductPage-error-message">{errors.condition.message}</span>
              )}
            </div>
          </div>

          {/* Preço e Localização */}
          <div className="EditProductPage-section">
            <h2 className="EditProductPage-section-title">Preço e Localização</h2>

            <div className="EditProductPage-field">
              <label htmlFor="price" className="EditProductPage-label">
                Preço por Dia (R$) <span className="EditProductPage-required">*</span>
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                className={`EditProductPage-input ${errors.price ? 'EditProductPage-input-error' : ''}`}
                placeholder="Ex: 50.00"
                {...register('price', {
                  required: 'O preço é obrigatório',
                  min: { value: 0.01, message: 'O preço deve ser maior que R$ 0,00' },
                  valueAsNumber: true,
                })}
              />
              {errors.price && (
                <span className="EditProductPage-error-message">{errors.price.message}</span>
              )}
            </div>

            <div className="EditProductPage-field">
              <label htmlFor="monthlyPrice" className="EditProductPage-label">
                Preço por mês (R$) <span className="EditProductPage-optional">(Opcional)</span>
              </label>
              <div className="EditProductPage-price-wrapper">
                <span className="EditProductPage-currency">R$</span>
                <input
                  id="monthlyPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`EditProductPage-input EditProductPage-price-input ${errors.monthlyPrice ? 'EditProductPage-input-error' : ''}`}
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
                <span className="EditProductPage-error-message">{errors.monthlyPrice.message}</span>
              )}
              <p className="EditProductPage-hint">
                💡 Ofereça um desconto para aluguéis mensais (30+ dias). Se não informado, será calculado automaticamente como 30 × preço diário.
              </p>
            </div>

            <div className="EditProductPage-field">
              <label className="EditProductPage-label">
                Localização do Equipamento <span className="EditProductPage-required">*</span>
              </label>
              <LocationInput
                placeholder="Digite o CEP ou use o GPS"
                showGPSButton={true}
                initialValue={watchedValues.location?.cep || product?.cep}
                onLocationChange={handleLocationChange}
              />
              {errors.location && (
                <span className="EditProductPage-error-message">
                  A localização é obrigatória
                </span>
              )}
            </div>
          </div>

          {/* Imagens e Descrição */}
          <div className="EditProductPage-section">
            <h2 className="EditProductPage-section-title">Imagens e Descrição</h2>

            <div className="EditProductPage-field">
              <label className="EditProductPage-label">Imagens do Produto</label>
              
              {/* Componente de Upload de Imagens */}
              <div className="EditProductPage-image-upload-section">
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
              </div>

              {/* Botão alternativo para adicionar por URL */}
              <div className="EditProductPage-image-upload-actions">
                <button
                  type="button"
                  className="EditProductPage-add-image-button"
                  onClick={handleAddImageByUrl}
                >
                  + Adicionar Imagem por URL
                </button>
              </div>

              {/* Preview das imagens atuais */}
              {imageUrls.length > 0 && (
                <div className="EditProductPage-image-previews">
                  <p className="EditProductPage-hint" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                    {imageUrls.length} {imageUrls.length === 1 ? 'imagem adicionada' : 'imagens adicionadas'}
                    {imageUrls.length > 1 && (
                      <span className="EditProductPage-drag-hint">
                        {' '}• Arraste para reorganizar
                      </span>
                    )}
                  </p>
                  <div className="EditProductPage-image-grid">
                    {imageUrls.map((imageUrl, index) => (
                      <div
                        key={index}
                        className={`EditProductPage-image-preview ${
                          draggedIndex === index ? 'EditProductPage-image-dragging' : ''
                        } ${
                          dragOverIndex === index ? 'EditProductPage-image-drag-over' : ''
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <div className="EditProductPage-image-drag-handle" title="Arraste para reorganizar">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 5h2v2H9V5zm0 4h2v2H9V9zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-12h2v2h-2V5zm0 4h2v2h-2V9zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                          </svg>
                        </div>
                        <img src={imageUrl} alt={`Preview ${index + 1}`} draggable={false} />
                        <div className="EditProductPage-image-number">{index + 1}</div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onDragStart={(e) => e.stopPropagation()}
                          className="EditProductPage-remove-image-button"
                          title="Remover imagem"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="EditProductPage-field">
              <label htmlFor="description" className="EditProductPage-label">
                Descrição do Produto <span className="EditProductPage-required">*</span>
              </label>
              <textarea
                id="description"
                className={`EditProductPage-textarea ${errors.description ? 'EditProductPage-input-error' : ''}`}
                placeholder="Descreva seu equipamento em detalhes..."
                rows="5"
                {...register('description', {
                  required: 'A descrição é obrigatória',
                  minLength: { value: 10, message: 'Mínimo de 10 caracteres' },
                })}
              />
              {errors.description && (
                <span className="EditProductPage-error-message">{errors.description.message}</span>
              )}
            </div>
          </div>

          {/* Disponibilidade */}
          <div className="EditProductPage-section">
            <h2 className="EditProductPage-section-title">Disponibilidade</h2>

            <div className="EditProductPage-field">
              <label className="EditProductPage-label-checkbox">
                <input
                  type="checkbox"
                  {...register('availability')}
                  defaultChecked={product?.availability !== false}
                />
                <span>Produto disponível para aluguel</span>
              </label>
              <p className="EditProductPage-hint">
                Desmarque para pausar temporariamente as reservas deste produto
              </p>
            </div>

            {product && (
              <div className="EditProductPage-availability-calendar">
                <h3 className="EditProductPage-subsection-title">Calendário de Reservas</h3>
                <p className="EditProductPage-hint">
                  O gerenciamento de disponibilidade será implementado em breve.
                </p>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="EditProductPage-actions">
            <button
              type="button"
              className="EditProductPage-button EditProductPage-button-secondary"
              onClick={() => navigate('/dashboard')}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="EditProductPage-button EditProductPage-button-primary"
              disabled={submitting}
            >
              {submitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;

