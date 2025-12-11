import React, { useState, useRef, useCallback } from 'react';
import api from '../../services/api';
import './ImageUploader.css';

const ImageUploader = ({
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB em bytes
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  onUploadSuccess,
  onUploadError,
  initialImages = [],
  multiple = true
}) => {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Validação de arquivo
  const validateFile = (file) => {
    const errors = [];

    // Validar tipo
    if (!acceptedTypes.includes(file.type)) {
      errors.push(`${file.name}: Tipo de arquivo não permitido. Apenas imagens (JPEG, PNG, WEBP, GIF) são aceitas.`);
      return { valid: false, errors };
    }

    // Validar tamanho
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      errors.push(`${file.name}: Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  };

  // Processar arquivos selecionados
  const processFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const newErrors = [];
    const validFiles = [];

    // Verificar limite de arquivos
    const totalFiles = images.length + fileArray.length;
    if (totalFiles > maxFiles) {
      newErrors.push(`Você pode enviar no máximo ${maxFiles} imagens. Você já tem ${images.length} e está tentando adicionar ${fileArray.length}.`);
      setErrors(newErrors);
      return;
    }

    // Validar cada arquivo
    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        newErrors.push(...validation.errors);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    if (validFiles.length > 0) {
      // Criar previews das imagens
      const newImages = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        uploading: false,
        uploaded: false,
        url: null,
        error: null
      }));

      setImages(prev => [...prev, ...newImages]);
      setErrors([]);
    }
  }, [images, maxFiles, maxSize, acceptedTypes]);

  // Manipular seleção de arquivos
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manipular drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // Fazer upload de uma imagem
  const uploadImage = async (imageIndex) => {
    const image = images[imageIndex];
    if (!image || image.uploaded || image.uploading) {
      return;
    }

    setImages(prev => prev.map((img, idx) => 
      idx === imageIndex ? { ...img, uploading: true, error: null } : img
    ));

    try {
      const formData = new FormData();
      formData.append('images', image.file);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.images && response.data.images.length > 0) {
        const uploadedImage = response.data.images[0];
        
        setImages(prev => prev.map((img, idx) => 
          idx === imageIndex 
            ? { 
                ...img, 
                uploading: false, 
                uploaded: true, 
                url: uploadedImage.url,
                filename: uploadedImage.filename
              } 
            : img
        ));

        // Chamar callback de sucesso
        if (onUploadSuccess) {
          onUploadSuccess(uploadedImage, imageIndex);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao fazer upload da imagem';
      
      setImages(prev => prev.map((img, idx) => 
        idx === imageIndex 
          ? { ...img, uploading: false, error: errorMessage } 
          : img
      ));

      if (onUploadError) {
        onUploadError(error, imageIndex);
      }
    }
  };

  // Fazer upload de todas as imagens
  const uploadAll = async () => {
    const imagesToUpload = images.filter(img => !img.uploaded && !img.uploading);
    
    if (imagesToUpload.length === 0) {
      return;
    }

    setUploading(true);
    setErrors([]);

    try {
      const formData = new FormData();
      imagesToUpload.forEach(img => {
        formData.append('images', img.file);
      });

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.images) {
        const uploadedImages = response.data.images;
        
        setImages(prev => {
          let uploadedIndex = 0;
          return prev.map(img => {
            if (img.uploaded || img.uploading) {
              return img;
            }
            const uploaded = uploadedImages[uploadedIndex++];
            return {
              ...img,
              uploading: false,
              uploaded: true,
              url: uploaded.url,
              filename: uploaded.filename
            };
          });
        });

        if (onUploadSuccess) {
          onUploadSuccess(uploadedImages);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao fazer upload das imagens';
      setErrors([errorMessage]);
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
    }
  };

  // Remover imagem
  const removeImage = (index) => {
    setImages(prev => {
      const newImages = prev.filter((_, idx) => idx !== index);
      // Liberar URL do objeto se existir
      if (prev[index].preview && prev[index].preview.startsWith('blob:')) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return newImages;
    });
  };

  // Limpar todas as imagens
  const clearAll = () => {
    images.forEach(img => {
      if (img.preview && img.preview.startsWith('blob:')) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setImages([]);
    setErrors([]);
  };

  // Obter URLs das imagens enviadas
  const getUploadedUrls = () => {
    return images
      .filter(img => img.uploaded && img.url)
      .map(img => img.url);
  };

  return (
    <div className="ImageUploader">
      <div
        className={`ImageUploader-dropzone ${dragActive ? 'ImageUploader-dropzone-active' : ''} ${uploading ? 'ImageUploader-dropzone-disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={handleFileSelect}
          className="ImageUploader-input"
          disabled={uploading}
        />
        <div className="ImageUploader-dropzone-content">
          <svg 
            className="ImageUploader-icon" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="ImageUploader-text">
            {dragActive 
              ? 'Solte as imagens aqui' 
              : 'Arraste imagens aqui ou clique para selecionar'}
          </p>
          <p className="ImageUploader-hint">
            {multiple ? `Até ${maxFiles} imagens` : '1 imagem'} • Máximo {(maxSize / (1024 * 1024)).toFixed(2)}MB cada
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="ImageUploader-errors" role="alert">
          {errors.map((error, index) => (
            <div key={index} className="ImageUploader-error">
              {error}
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="ImageUploader-preview">
          <div className="ImageUploader-preview-header">
            <span className="ImageUploader-preview-count">
              {images.length} {images.length === 1 ? 'imagem' : 'imagens'}
            </span>
            <div className="ImageUploader-actions">
              {images.some(img => !img.uploaded && !img.uploading) && (
                <button
                  className="ImageUploader-button ImageUploader-button-primary"
                  onClick={uploadAll}
                  disabled={uploading}
                >
                  {uploading ? 'Enviando...' : 'Enviar Todas'}
                </button>
              )}
              <button
                className="ImageUploader-button ImageUploader-button-secondary"
                onClick={clearAll}
                disabled={uploading}
              >
                Limpar Todas
              </button>
            </div>
          </div>
          <div className="ImageUploader-grid">
            {images.map((image, index) => (
              <div key={index} className="ImageUploader-item">
                <div className="ImageUploader-item-preview">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="ImageUploader-item-image"
                  />
                  {image.uploading && (
                    <div className="ImageUploader-item-overlay">
                      <div className="ImageUploader-spinner"></div>
                      <span>Enviando...</span>
                    </div>
                  )}
                  {image.uploaded && (
                    <div className="ImageUploader-item-badge ImageUploader-item-badge-success">
                      ✓ Enviada
                    </div>
                  )}
                  {image.error && (
                    <div className="ImageUploader-item-badge ImageUploader-item-badge-error">
                      ✕ Erro
                    </div>
                  )}
                </div>
                <div className="ImageUploader-item-info">
                  <p className="ImageUploader-item-name" title={image.name}>
                    {image.name}
                  </p>
                  <p className="ImageUploader-item-size">
                    {(image.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {image.error && (
                    <p className="ImageUploader-item-error">{image.error}</p>
                  )}
                </div>
                <div className="ImageUploader-item-actions">
                  {!image.uploaded && !image.uploading && (
                    <button
                      className="ImageUploader-item-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        uploadImage(index);
                      }}
                      title="Enviar esta imagem"
                    >
                      ↑
                    </button>
                  )}
                  <button
                    className="ImageUploader-item-button ImageUploader-item-button-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    title="Remover"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Expor método para obter URLs (útil para componentes pais)
ImageUploader.getUploadedUrls = (images) => {
  return images
    .filter(img => img.uploaded && img.url)
    .map(img => img.url);
};

export default ImageUploader;

