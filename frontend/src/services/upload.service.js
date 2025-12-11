import api from './api';

/**
 * Serviço de Upload
 * 
 * Este módulo fornece funções para gerenciar upload de imagens,
 * incluindo upload único, múltiplo e exclusão de imagens.
 * 
 * @module services/upload
 */

/**
 * Faz upload de múltiplas imagens
 * 
 * Requer autenticação (usuário deve estar logado).
 * 
 * @param {FileList|File[]} files - Arquivos de imagem para upload
 * @returns {Promise<Object>} Objeto contendo URLs e informações das imagens enviadas
 * @throws {Error} Erro caso os arquivos sejam inválidos, o usuário não esteja autenticado ou ocorra falha na requisição
 * 
 * @example
 * try {
 *   const input = document.querySelector('input[type="file"]');
 *   const result = await UploadService.uploadImages(input.files);
 *   console.log('Imagens enviadas:', result.images);
 * } catch (error) {
 *   console.error('Erro ao fazer upload:', error.message);
 * }
 */
export const uploadImages = async (files) => {
  try {
    const formData = new FormData();
    
    // Converter FileList para Array se necessário
    const fileArray = Array.from(files);
    
    fileArray.forEach(file => {
      formData.append('images', file);
    });

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Faz upload de uma única imagem
 * 
 * Requer autenticação (usuário deve estar logado).
 * 
 * @param {File} file - Arquivo de imagem para upload
 * @returns {Promise<Object>} Objeto contendo URL e informações da imagem enviada
 * @throws {Error} Erro caso o arquivo seja inválido, o usuário não esteja autenticado ou ocorra falha na requisição
 * 
 * @example
 * try {
 *   const input = document.querySelector('input[type="file"]');
 *   const result = await UploadService.uploadSingleImage(input.files[0]);
 *   console.log('Imagem enviada:', result.image.url);
 * } catch (error) {
 *   console.error('Erro ao fazer upload:', error.message);
 * }
 */
export const uploadSingleImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Deleta uma imagem do servidor
 * 
 * Requer autenticação (usuário deve estar logado).
 * 
 * @param {string} filename - Nome do arquivo a ser deletado
 * @returns {Promise<Object>} Objeto contendo mensagem de sucesso
 * @throws {Error} Erro caso o arquivo não seja encontrado, o usuário não esteja autenticado ou ocorra falha na requisição
 * 
 * @example
 * try {
 *   await UploadService.deleteImage('image-1234567890-123456789.jpg');
 *   console.log('Imagem deletada com sucesso');
 * } catch (error) {
 *   console.error('Erro ao deletar imagem:', error.message);
 * }
 */
export const deleteImage = async (filename) => {
  try {
    const response = await api.delete(`/upload/${filename}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Exportar objeto com todas as funções para facilitar uso
const UploadService = {
  uploadImages,
  uploadSingleImage,
  deleteImage,
};

export default UploadService;

