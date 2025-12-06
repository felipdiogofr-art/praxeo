const { sequelize } = require('../config/database');

// Importar todos os modelos
const User = require('./User');
const Product = require('./Product');
const Reservation = require('./Reservation');
const Review = require('./Review');

// Objeto com todos os modelos
const models = {
  User,
  Product,
  Reservation,
  Review,
  sequelize
};

// Configurar relacionamentos
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;

