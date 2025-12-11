const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { isCloudinaryConfigured } = require('./cloudinary.config');

/**
 * Configuração do Multer para upload de imagens
 * 
 * Se Cloudinary estiver configurado, usa memory storage (buffer na memória)
 * Caso contrário, usa disk storage (armazenamento local)
 * Valida tipo de arquivo (apenas imagens) e tamanho máximo (5MB)
 */

let storage;

if (isCloudinaryConfigured) {
  // Usar memory storage para Cloudinary (arquivo fica em buffer na memória)
  storage = multer.memoryStorage();
} else {
  // Usar disk storage para armazenamento local
  const uploadDir = path.join(__dirname, '../../uploads/images');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Gerar nome único: timestamp + hash aleatório + extensão original
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `image-${uniqueSuffix}${ext}`);
    }
  });
}

// Filtro de validação de arquivo
const fileFilter = (req, file, cb) => {
  // Tipos MIME permitidos
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas imagens (JPEG, PNG, WEBP, GIF) são aceitas.'), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB em bytes
    files: 10 // Máximo de 10 arquivos por upload
  }
});

/**
 * Middleware para upload de múltiplas imagens
 * Campo: 'images' (pode ser ajustado conforme necessário)
 */
const uploadImages = upload.array('images', 10);

/**
 * Middleware para upload de uma única imagem
 * Campo: 'image'
 */
const uploadSingleImage = upload.single('image');

// Exportar uploadDir apenas se não estiver usando Cloudinary
const uploadDir = isCloudinaryConfigured 
  ? null 
  : path.join(__dirname, '../../uploads/images');

module.exports = {
  uploadImages,
  uploadSingleImage,
  uploadDir,
  isCloudinaryConfigured
};

