require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configuração do banco de dados
const sequelize = new Sequelize(
  process.env.DB_NAME || 'praxeo_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      // Suporte para PostGIS
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

// Função para testar a conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
    
    // Verificar se PostGIS está ativo
    const [results] = await sequelize.query("SELECT PostGIS_version() AS version");
    if (results && results[0] && results[0].version) {
      console.log(`✅ PostGIS ativo - Versão: ${results[0].version}`);
    } else {
      console.warn('⚠️  PostGIS não encontrado. Certifique-se de que a extensão está instalada.');
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection
};

