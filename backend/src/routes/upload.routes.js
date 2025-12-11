const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadImages, uploadSingleImage } = require('../config/multer.config');

/**
 * Rotas de Upload
 * Base: /api/upload
 * 
 * Todas as rotas requerem autenticação
 */

// POST /api/upload - Upload de múltiplas imagens
router.post('/', authenticate, uploadImages, UploadController.uploadImages);

// POST /api/upload/single - Upload de uma única imagem
router.post('/single', authenticate, uploadSingleImage, UploadController.uploadSingleImage);

// DELETE /api/upload/:filename - Deletar uma imagem
router.delete('/:filename', authenticate, UploadController.deleteImage);

module.exports = router;

