const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured, isCloudinaryAvailable, uploadOptions, deleteOptions } = require('../config/cloudinary.config');
const { uploadDir } = require('../config/multer.config');

// Importar streamifier condicionalmente (usado apenas com Cloudinary)
let streamifier = null;
try {
  streamifier = require('streamifier');
} catch (error) {
  // streamifier não disponível - Cloudinary não pode ser usado
}

/**
 * Serviço de Upload
 * Gerencia operações relacionadas ao upload de imagens
 * Suporta Cloudinary (nuvem) ou armazenamento local
 */
class UploadService {
  /**
   * Faz upload de uma imagem para o Cloudinary
   * @param {Buffer} fileBuffer - Buffer do arquivo
   * @param {string} originalName - Nome original do arquivo
   * @returns {Promise<Object>} Resultado do upload com URL e informações
   */
  static async uploadToCloudinary(fileBuffer, originalName) {
    if (!isCloudinaryAvailable || !isCloudinaryConfigured || !cloudinary || !streamifier) {
      throw new Error('Cloudinary não está disponível. Use armazenamento local.');
    }

    return new Promise((resolve, reject) => {
      // Gerar nome único para o arquivo
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const publicId = `image-${uniqueSuffix}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          ...uploadOptions,
          public_id: publicId, // Cloudinary não precisa da extensão no public_id
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes,
            });
          }
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  /**
   * Faz upload de múltiplas imagens para o Cloudinary
   * @param {Array<Object>} files - Array de objetos com buffer e nome original
   * @returns {Promise<Array<Object>>} Array de resultados do upload
   */
  static async uploadMultipleToCloudinary(files) {
    const uploadPromises = files.map(file => 
      this.uploadToCloudinary(file.buffer, file.originalname)
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Gera URL pública para uma imagem
   * @param {string} filename - Nome do arquivo (local) ou publicId (Cloudinary)
   * @param {string} url - URL completa (se já for Cloudinary)
   * @returns {string} URL pública da imagem
   */
  static getImageUrl(filename, url = null) {
    // Se já tiver URL (Cloudinary), retornar diretamente
    if (url) {
      return url;
    }

    if (isCloudinaryAvailable && isCloudinaryConfigured && cloudinary) {
      // Se for Cloudinary, o filename é o publicId
      return cloudinary.url(filename, {
        secure: true,
        fetch_format: 'auto',
        quality: 'auto',
      });
    } else {
      // Armazenamento local
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
      return `${baseUrl}/uploads/images/${filename}`;
    }
  }

  /**
   * Gera URLs para múltiplas imagens
   * @param {Array<string>} filenames - Array de nomes de arquivos
   * @returns {Array<string>} Array de URLs públicas
   */
  static getImageUrls(filenames) {
    if (!Array.isArray(filenames)) {
      return [];
    }
    return filenames.map(filename => this.getImageUrl(filename));
  }

  /**
   * Deleta uma imagem do servidor
   * @param {string} identifier - Nome do arquivo (local) ou publicId (Cloudinary)
   * @returns {Promise<boolean>} true se deletado com sucesso
   */
  static async deleteImage(identifier) {
    try {
      if (isCloudinaryAvailable && isCloudinaryConfigured && cloudinary) {
        // Deletar do Cloudinary usando publicId
        const result = await cloudinary.uploader.destroy(identifier, deleteOptions);
        return result.result === 'ok';
      } else {
        // Deletar do armazenamento local
        if (!uploadDir) {
          return false;
        }
        const filePath = path.join(uploadDir, identifier);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  }

  /**
   * Deleta múltiplas imagens
   * @param {Array<string>} identifiers - Array de nomes de arquivos (local) ou publicIds (Cloudinary)
   * @returns {Promise<number>} Número de arquivos deletados com sucesso
   */
  static async deleteImages(identifiers) {
    if (!Array.isArray(identifiers)) {
      return 0;
    }

    if (isCloudinaryAvailable && isCloudinaryConfigured && cloudinary) {
      // Deletar múltiplas imagens do Cloudinary de uma vez (mais eficiente)
      try {
        const result = await cloudinary.api.delete_resources(identifiers, deleteOptions);
        return result.deleted ? Object.keys(result.deleted).length : 0;
      } catch (error) {
        console.error('Erro ao deletar múltiplas imagens do Cloudinary:', error);
        return 0;
      }
    } else {
      // Deletar uma por uma do armazenamento local
      let deletedCount = 0;
      for (const identifier of identifiers) {
        const deleted = await this.deleteImage(identifier);
        if (deleted) {
          deletedCount++;
        }
      }
      return deletedCount;
    }
  }

  /**
   * Valida se um arquivo é uma imagem válida
   * @param {string} filename - Nome do arquivo
   * @returns {boolean} true se for uma imagem válida
   */
  static isValidImage(filename) {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(filename).toLowerCase();
    return allowedExtensions.includes(ext);
  }
}

module.exports = UploadService;

