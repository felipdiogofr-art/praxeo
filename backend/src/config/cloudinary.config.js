require('dotenv').config();

/**
 * Configuração do Cloudinary
 * 
 * Configura o Cloudinary para upload e gerenciamento de imagens na nuvem.
 * As credenciais devem estar nas variáveis de ambiente.
 */

let cloudinary = null;
let isCloudinaryAvailable = false;
let isCloudinaryConfigured = false;

// Tentar importar cloudinary (pode não estar instalado)
try {
  cloudinary = require('cloudinary').v2;
  isCloudinaryAvailable = true;

  // Verificar se Cloudinary está configurado
  isCloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

  if (isCloudinaryConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true, // Usar HTTPS
    });

    console.log('✅ Cloudinary configurado com sucesso');
  } else {
    console.warn('⚠️  Cloudinary não configurado. Usando armazenamento local.');
    console.warn('   Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET no .env');
  }
} catch (error) {
  console.warn('⚠️  Cloudinary não disponível:', error.message);
  console.warn('   Execute "npm install" para instalar as dependências do Cloudinary');
}

/**
 * Opções de upload para Cloudinary
 */
const uploadOptions = {
  folder: process.env.CLOUDINARY_FOLDER || 'praxeo/products', // Pasta no Cloudinary
  resource_type: 'image',
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  transformation: [
    {
      quality: 'auto:good', // Otimização automática de qualidade
      fetch_format: 'auto', // Formato automático (WebP quando suportado)
    }
  ],
  overwrite: false, // Não sobrescrever arquivos existentes
  invalidate: true, // Invalidar cache do CDN
};

/**
 * Opções para deletar imagens
 */
const deleteOptions = {
  resource_type: 'image',
  invalidate: true, // Invalidar cache do CDN
};

module.exports = {
  cloudinary,
  isCloudinaryAvailable,
  isCloudinaryConfigured,
  uploadOptions,
  deleteOptions,
};

