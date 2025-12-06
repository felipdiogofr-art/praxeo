const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O nome é obrigatório'
      },
      len: {
        args: [2, 100],
        msg: 'O nome deve ter entre 2 e 100 caracteres'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'unique_email',
      msg: 'Este email já está cadastrado'
    },
    validate: {
      isEmail: {
        msg: 'Email inválido'
      },
      notEmpty: {
        msg: 'O email é obrigatório'
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'A senha é obrigatória'
      },
      len: {
        args: [6, 255],
        msg: 'A senha deve ter no mínimo 6 caracteres'
      }
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [10, 20],
        msg: 'O telefone deve ter entre 10 e 20 caracteres'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('owner', 'renter'),
    allowNull: false,
    defaultValue: 'renter',
    validate: {
      isIn: {
        args: [['owner', 'renter']],
        msg: 'O papel deve ser "owner" ou "renter"'
      }
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    // Hash da senha antes de criar o usuário
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    // Hash da senha antes de atualizar (apenas se a senha foi alterada)
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Método de instância: hashPassword
User.prototype.hashPassword = async function(password) {
  return await bcrypt.hash(password, 10);
};

// Método de instância: comparePassword
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para retornar dados do usuário sem a senha
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;

