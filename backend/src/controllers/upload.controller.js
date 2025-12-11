const UploadService = require('../services/upload.service');
const { isCloudinaryConfigured } = require('../config/cloudinary.config');

/**
 * Controller de Upload
 * Gerencia requisições de upload de imagens
 * Suporta Cloudinary (nuvem) ou armazenamento local
 */
class UploadController {
  /**
   * Upload de múltiplas imagens
   * POST /api/upload
   * 
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static async uploadImages(req, res) {
    try {
      // Verificar se há arquivos
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'Nenhuma imagem enviada',
          message: 'Por favor, selecione pelo menos uma imagem para upload'
        });
      }

      let images;

      if (isCloudinaryConfigured) {
        // Upload para Cloudinary
        const files = req.files.map(file => ({
          buffer: file.buffer,
          originalname: file.originalname
        }));
        
        const cloudinaryResults = await UploadService.uploadMultipleToCloudinary(files);
        
        images = cloudinaryResults.map((result, index) => ({
          url: result.url,
          publicId: result.publicId,
          filename: result.publicId, // Para compatibilidade
          originalName: req.files[index].originalname,
          size: result.bytes,
          mimetype: req.files[index].mimetype,
          width: result.width,
          height: result.height,
          format: result.format
        }));
      } else {
        // Upload local
        const filenames = req.files.map(file => file.filename);
        const urls = UploadService.getImageUrls(filenames);
        
        images = urls.map((url, index) => ({
          url,
          filename: filenames[index],
          originalName: req.files[index].originalname,
          size: req.files[index].size,
          mimetype: req.files[index].mimetype
        }));
      }

      res.status(200).json({
        success: true,
        message: `${req.files.length} imagem(ns) enviada(s) com sucesso`,
        images,
        count: req.files.length
      });
    } catch (error) {
      console.error('Erro no upload de imagens:', error);
      
      res.status(500).json({
        error: 'Erro ao fazer upload das imagens',
        message: error.message || 'Ocorreu um erro interno ao processar o upload'
      });
    }
  }

  /**
   * Upload de uma única imagem
   * POST /api/upload/single
   * 
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static async uploadSingleImage(req, res) {
    try {
      // Verificar se há arquivo
      if (!req.file) {
        return res.status(400).json({
          error: 'Nenhuma imagem enviada',
          message: 'Por favor, selecione uma imagem para upload'
        });
      }

      let image;

      if (isCloudinaryConfigured) {
        // Upload para Cloudinary
        const result = await UploadService.uploadToCloudinary(
          req.file.buffer,
          req.file.originalname
        );
        
        image = {
          url: result.url,
          publicId: result.publicId,
          filename: result.publicId, // Para compatibilidade
          originalName: req.file.originalname,
          size: result.bytes,
          mimetype: req.file.mimetype,
          width: result.width,
          height: result.height,
          format: result.format
        };
      } else {
        // Upload local
        const url = UploadService.getImageUrl(req.file.filename);
        
        image = {
          url,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        };
      }

      res.status(200).json({
        success: true,
        message: 'Imagem enviada com sucesso',
        image
      });
    } catch (error) {
      console.error('Erro no upload de imagem:', error);
      
      res.status(500).json({
        error: 'Erro ao fazer upload da imagem',
        message: error.message || 'Ocorreu um erro interno ao processar o upload'
      });
    }
  }

  /**
   * Deletar uma imagem
   * DELETE /api/upload/:identifier
   * 
   * @param {Object} req - Requisição Express
   * @param {Object} res - Resposta Express
   */
  static async deleteImage(req, res) {
    try {
      const { filename } = req.params; // Pode ser filename (local) ou publicId (Cloudinary)

      if (!filename) {
        return res.status(400).json({
          error: 'Identificador não fornecido',
          message: 'Por favor, forneça o identificador da imagem a ser deletada'
        });
      }

      const deleted = await UploadService.deleteImage(filename);

      if (deleted) {
        res.status(200).json({
          success: true,
          message: 'Imagem deletada com sucesso'
        });
      } else {
        res.status(404).json({
          error: 'Imagem não encontrada',
          message: 'A imagem especificada não foi encontrada'
        });
      }
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      
      res.status(500).json({
        error: 'Erro ao deletar imagem',
        message: error.message || 'Ocorreu um erro interno ao deletar a imagem'
      });
    }
  }
}

module.exports = UploadController;

