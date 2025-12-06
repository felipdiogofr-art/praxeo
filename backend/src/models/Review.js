const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    field: 'product_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    field: 'user_id'
  },
  reservationId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'reservations',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    field: 'reservation_id',
    comment: 'Referência à reserva que originou a avaliação'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'A avaliação deve ser no mínimo 1'
      },
      max: {
        args: [5],
        msg: 'A avaliação deve ser no máximo 5'
      },
      isInt: {
        msg: 'A avaliação deve ser um número inteiro'
      }
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'O comentário deve ter no máximo 1000 caracteres'
      }
    }
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'idx_reviews_product_id',
      fields: ['product_id']
    },
    {
      name: 'idx_reviews_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_reviews_reservation_id',
      fields: ['reservation_id']
    },
    {
      name: 'idx_reviews_rating',
      fields: ['rating']
    },
    // Índice composto para evitar avaliações duplicadas
    {
      name: 'idx_reviews_unique_user_product',
      fields: ['user_id', 'product_id'],
      unique: true,
      comment: 'Garante que um usuário só pode avaliar um produto uma vez'
    }
  ]
});

// Relacionamentos
Review.associate = function(models) {
  Review.belongsTo(models.Product, {
    foreignKey: 'productId',
    as: 'product'
  });
  
  Review.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  Review.belongsTo(models.Reservation, {
    foreignKey: 'reservationId',
    as: 'reservation'
  });
};

module.exports = Review;

