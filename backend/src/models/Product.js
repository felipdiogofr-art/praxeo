const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O título é obrigatório'
      },
      len: {
        args: [3, 200],
        msg: 'O título deve ter entre 3 e 200 caracteres'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'A categoria é obrigatória'
      }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'O preço deve ser um número decimal'
      },
      min: {
        args: [0.01],
        msg: 'O preço deve ser maior que zero'
      }
    }
  },
  condition: {
    type: DataTypes.ENUM('new', 'like_new', 'good', 'fair', 'poor'),
    allowNull: false,
    defaultValue: 'good',
    validate: {
      isIn: {
        args: [['new', 'like_new', 'good', 'fair', 'poor']],
        msg: 'A condição deve ser: new, like_new, good, fair ou poor'
      }
    }
  },
  location: {
    type: DataTypes.GEOMETRY('POINT', 4326),
    allowNull: true,
    comment: 'Coordenadas geográficas (longitude, latitude) usando PostGIS'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  cep: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      len: {
        args: [8, 10],
        msg: 'O CEP deve ter 8 dígitos (com ou sem hífen)'
      }
    }
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    comment: 'Array de URLs das imagens do produto'
  },
  availability: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica se o produto está disponível para aluguel'
  }
}, {
  tableName: 'products',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'idx_products_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_products_category',
      fields: ['category']
    },
    {
      name: 'idx_products_location',
      fields: ['location'],
      using: 'GIST',
      comment: 'Índice espacial para busca por geolocalização'
    },
    {
      name: 'idx_products_availability',
      fields: ['availability']
    }
  ]
});

// Relacionamento: Product pertence a User
Product.associate = function(models) {
  Product.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'owner'
  });
  
  Product.hasMany(models.Reservation, {
    foreignKey: 'productId',
    as: 'reservations'
  });
  
  Product.hasMany(models.Review, {
    foreignKey: 'productId',
    as: 'reviews'
  });
};

module.exports = Product;

