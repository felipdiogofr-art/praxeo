require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const app = express();

// Configuração de porta
const PORT = process.env.PORT || 3001;

// Middlewares de segurança e performance
// Configurar Helmet para permitir requisições do frontend
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// Configuração do CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware de logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware para parsing de JSON e URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static('uploads'));

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Servidor está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API Praxeo Backend',
    version: '1.0.0',
      endpoints: {
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      reservations: '/api/reservations',
      reviews: '/api/reviews',
      ...(uploadRoutes && { upload: '/api/upload' })
    }
  });
});

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const reservationRoutes = require('./routes/reservation.routes');
const reviewRoutes = require('./routes/review.routes');

// Importar rotas de upload condicionalmente (só se cloudinary estiver disponível)
let uploadRoutes;
try {
  uploadRoutes = require('./routes/upload.routes');
} catch (error) {
  console.warn('⚠️  Rotas de upload não disponíveis:', error.message);
  console.warn('💡 Execute "npm install" para instalar as dependências do Cloudinary');
  uploadRoutes = null;
}

// Registrar rotas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);

// Registrar rotas de upload apenas se estiverem disponíveis
if (uploadRoutes) {
  app.use('/api/upload', uploadRoutes);
} else {
  // Criar rota placeholder informando que o upload não está disponível
  app.use('/api/upload', (req, res) => {
    res.status(503).json({
      error: 'Serviço de upload não disponível',
      message: 'Cloudinary não está configurado. Execute "npm install" para instalar as dependências.'
    });
  });
}

// Middleware de tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;

