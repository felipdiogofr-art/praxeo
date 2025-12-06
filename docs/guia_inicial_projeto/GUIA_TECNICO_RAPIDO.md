# ⚡ Guia Técnico Rápido - Praxeo.tech

## 🚀 Início Rápido para Desenvolvedores

### Pré-requisitos
```bash
# Verificar instalações
node --version    # >= 16.0.0
npm --version     # >= 6.0.0
psql --version    # PostgreSQL instalado
```

### 1. Configurar Banco de Dados

```bash
# Criar banco de dados
createdb praxeo_db

# Conectar ao PostgreSQL
psql -U postgres -d praxeo_db

# Ativar PostGIS (dentro do psql)
CREATE EXTENSION IF NOT EXISTS postgis;
\q
```

### 2. Configurar Backend

```bash
cd backend

# Criar arquivo .env
cp .env.example .env  # Se existir, ou criar manualmente

# Editar .env com suas configurações
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=praxeo_db
# DB_USER=postgres
# DB_PASSWORD=sua_senha
# JWT_SECRET=seu_secret_super_seguro
# PORT=3001

# Instalar dependências (se necessário)
npm install

# Iniciar servidor
npm run dev
```

### 3. Configurar Frontend

```bash
cd frontend

# Criar arquivo .env (opcional)
# REACT_APP_API_URL=http://localhost:3001/api

# Instalar dependências (se necessário)
npm install

# Iniciar servidor
npm start
```

## 📁 Estrutura de Arquivos a Criar

### Backend - Ordem de Criação Recomendada

#### 1. Configuração do Banco
```javascript
// backend/src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

module.exports = sequelize;
```

#### 2. Model User
```javascript
// backend/src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('owner', 'renter'), defaultValue: 'renter' },
  phone: DataTypes.STRING,
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }
});

User.prototype.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;
```

#### 3. Model Product
```javascript
// backend/src/models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { DataTypes: PostGIS } = require('sequelize');

const Product = sequelize.define('Product', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  category: DataTypes.STRING,
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  condition: DataTypes.ENUM('new', 'used_good', 'used_fair'),
  location: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: false,
  },
  address: DataTypes.STRING,
  cep: DataTypes.STRING,
  images: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  availability: { type: DataTypes.JSONB, defaultValue: {} },
}, {
  indexes: [
    {
      fields: ['location'],
      using: 'GIST',
    }
  ]
});

module.exports = Product;
```

#### 4. Rotas de Autenticação
```javascript
// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
```

#### 5. Atualizar index.js
```javascript
// backend/src/index.js
// ... código existente ...

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');

// Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// ... resto do código ...
```

### Frontend - Ordem de Criação Recomendada

#### 1. Configuração do Axios
```javascript
// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### 2. AuthService
```javascript
// frontend/src/services/auth.service.js
import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },
};
```

#### 3. AuthContext
```javascript
// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      // Buscar dados do usuário
      // setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 🔧 Comandos Úteis

### Backend
```bash
# Desenvolvimento com auto-reload
npm run dev

# Produção
npm start

# Criar migration (se usar Sequelize CLI)
npx sequelize-cli migration:generate --name create-users

# Executar migrations
npx sequelize-cli db:migrate
```

### Frontend
```bash
# Desenvolvimento
npm start

# Build para produção
npm run build

# Testes
npm test
```

## 🧪 Testar Endpoints

### Com cURL
```bash
# Health check
curl http://localhost:3001/health

# Registrar usuário
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","password":"123456"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'
```

### Com Postman/Insomnia
1. Criar collection "Praxeo API"
2. Adicionar variável de ambiente `base_url = http://localhost:3001/api`
3. Criar requests para cada endpoint

## 🐛 Troubleshooting Comum

### Erro: "Cannot connect to database"
- Verificar se PostgreSQL está rodando
- Verificar credenciais no .env
- Testar conexão: `psql -U postgres -d praxeo_db`

### Erro: "PostGIS extension not found"
```sql
-- Conectar ao banco e executar:
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Erro: "CORS policy"
- Verificar se CORS está configurado no backend
- Verificar origem permitida

### Erro: "JWT malformed"
- Verificar se token está sendo enviado corretamente
- Verificar JWT_SECRET no .env

## 📚 Próximos Passos

1. ✅ Configurar banco de dados
2. ✅ Criar models básicos
3. ✅ Implementar autenticação
4. ✅ Conectar frontend ao backend
5. ✅ Implementar busca com geolocalização

---

**Dica**: Sempre teste cada componente isoladamente antes de integrar!

