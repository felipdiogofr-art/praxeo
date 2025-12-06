const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reservation = sequelize.define('Reservation', {
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
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'A data de início é obrigatória'
      },
      isDate: {
        msg: 'A data de início deve ser uma data válida'
      }
    },
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'A data de término é obrigatória'
      },
      isDate: {
        msg: 'A data de término deve ser uma data válida'
      }
    },
    field: 'end_date'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: {
        msg: 'O preço total deve ser um número decimal'
      },
      min: {
        args: [0.01],
        msg: 'O preço total deve ser maior que zero'
      }
    },
    field: 'total_price'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'confirmed', 'active', 'completed', 'cancelled']],
        msg: 'O status deve ser: pending, confirmed, active, completed ou cancelled'
      }
    }
  }
}, {
  tableName: 'reservations',
  timestamps: true,
  underscored: true,
  hooks: {
    // Validação de que a data de término é posterior à data de início
    beforeValidate: (reservation) => {
      if (reservation.startDate && reservation.endDate) {
        if (new Date(reservation.endDate) <= new Date(reservation.startDate)) {
          throw new Error('A data de término deve ser posterior à data de início');
        }
      }
    }
  },
  indexes: [
    {
      name: 'idx_reservations_product_id',
      fields: ['product_id']
    },
    {
      name: 'idx_reservations_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_reservations_status',
      fields: ['status']
    },
    {
      name: 'idx_reservations_dates',
      fields: ['start_date', 'end_date']
    }
  ]
});

// Relacionamentos
Reservation.associate = function(models) {
  Reservation.belongsTo(models.Product, {
    foreignKey: 'productId',
    as: 'product'
  });
  
  Reservation.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'renter'
  });
  
  Reservation.hasMany(models.Review, {
    foreignKey: 'reservationId',
    as: 'reviews'
  });
};

module.exports = Reservation;

