# 🎯 Plano para Projeto Ficar Funcional - Praxeo.tech

## 📊 Análise do Estado Atual

### ✅ O que já está implementado:
- **Frontend**: Estrutura React completa com componentes básicos (Header, Footer, ProductCard, etc.)
- **Backend**: Servidor Express básico rodando na porta 3001
- **Estrutura de Pastas**: Organização adequada em backend e frontend
- **Dependências**: Todas instaladas e funcionando

### ❌ O que falta para ficar funcional:
- **Backend**: API REST completa (rotas, controllers, models, serviços)
- **Banco de Dados**: Configuração PostgreSQL com PostGIS
- **Autenticação**: Sistema de login/cadastro
- **Integração Frontend-Backend**: Conexão entre React e API
- **Funcionalidades Core**: Busca, reserva, checkout

---

## 🗺️ Roadmap de Implementação (Priorizado)

### **FASE 1: Fundação do Backend** ⚡ (Prioridade CRÍTICA)
**Objetivo**: Criar a infraestrutura básica da API para suportar o frontend

#### 1.1 Configuração do Banco de Dados
- [X] **Criar arquivo de configuração do Sequelize**
  - Arquivo: `backend/src/config/database.js`
  - Configurar conexão PostgreSQL
  - Suporte a variáveis de ambiente (.env)
  
- [X] **Criar arquivo .env de exemplo**
  - Arquivo: `backend/.env.example`
  - Variáveis: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, PORT

- [ ] **Scripts de migração do banco**
  - Criar estrutura de tabelas básicas
  [X] Ativar extensão PostGIS no PostgreSQL

#### 1.2 Modelos de Dados (Sequelize)
- [X] **Model User** (`backend/src/models/User.js`)
  - Campos: id, name, email, password (hash), phone, role (owner/renter), createdAt, updatedAt
  - Métodos: hashPassword, comparePassword
  
- [X] **Model Product** (`backend/src/models/Product.js`)
  - Campos: id, userId, title, description, category, price, condition, location (PostGIS Point), address, cep, images, availability, createdAt, updatedAt
  - Relacionamento: belongsTo User
  
- [X] **Model Reservation** (`backend/src/models/Reservation.js`)
  - Campos: id, productId, userId, startDate, endDate, totalPrice, status, createdAt, updatedAt
  - Relacionamentos: belongsTo Product, belongsTo User
  
- [X] **Model Review** (`backend/src/models/Review.js`)
  - Campos: id, productId, userId, reservationId, rating, comment, createdAt, updatedAt
  - Relacionamentos: belongsTo Product, belongsTo User, belongsTo Reservation

#### 1.3 Rotas e Controllers Base
- [X] **Rotas de Autenticação** (`backend/src/routes/auth.routes.js`)
  - POST `/api/auth/register` - Cadastro
  - POST `/api/auth/login` - Login
  - GET `/api/auth/me` - Dados do usuário logado
  
- [X] **Rotas de Produtos** (`backend/src/routes/product.routes.js`)
  - GET `/api/products` - Listar produtos (com filtros de geolocalização)
  - GET `/api/products/:id` - Detalhes do produto
  - POST `/api/products` - Criar produto (autenticado)
  - PUT `/api/products/:id` - Atualizar produto (autenticado)
  - DELETE `/api/products/:id` - Deletar produto (autenticado)
  
- [X] **Rotas de Reservas** (`backend/src/routes/reservation.routes.js`)
  - POST `/api/reservations` - Criar reserva (autenticado)
  - GET `/api/reservations` - Listar reservas do usuário (autenticado)
  - GET `/api/reservations/:id` - Detalhes da reserva
  - PUT `/api/reservations/:id/status` - Atualizar status da reserva

#### 1.4 Middleware de Autenticação
- [X] **JWT Middleware** (`backend/src/middleware/auth.middleware.js`)
  - Validar token JWT
  - Extrair dados do usuário do token
  - Proteger rotas que requerem autenticação
  - Middleware opcional para rotas públicas com autenticação opcional
  - Middleware de verificação de roles (requireRole)

#### 1.5 Serviços
- [X] **AuthService** (`backend/src/services/auth.service.js`)
  - Lógica de registro e login
  - Geração de tokens JWT
  - Busca de usuário autenticado
  
- [X] **ProductService** (`backend/src/services/product.service.js`)
  - Busca por geolocalização (PostGIS)
  - Filtros e ordenação
  - Cálculo de distância
  - CRUD completo de produtos
  - Cálculo de rating médio
  
- [X] **ReservationService** (`backend/src/services/reservation.service.js`)
  - Validação de disponibilidade
  - Cálculo de preços
  - Gestão de status
  - Listagem de reservas (como locatário ou proprietário)

**Tempo Estimado**:
**Dependências**: PostgreSQL instalado e configurado

---

### **FASE 2: Integração Frontend-Backend** 🔗 (Prioridade ALTA)
**Objetivo**: Conectar o React ao backend e implementar fluxos básicos

#### 2.1 Configuração do Axios
- [X] **API Client** (`frontend/src/services/api.js`)
  - Configuração base do Axios
  - Interceptors para adicionar token JWT
  - Tratamento de erros global
  - Base URL configurável (dev/prod)
  - Funções auxiliares para gerenciamento de token e autenticação

#### 2.2 Serviços Frontend
- [ ] **AuthService** (`frontend/src/services/auth.service.js`)
  - login(), register(), logout(), getCurrentUser()
  - Armazenamento de token no localStorage
  
- [ ] **ProductService** (`frontend/src/services/product.service.js`)
  - getProducts(filters), getProductById(id), createProduct(data), updateProduct(id, data)
  
- [ ] **ReservationService** (`frontend/src/services/reservation.service.js`)
  - createReservation(data), getReservations(), getReservationById(id)

#### 2.3 Context API
- [ ] **AuthContext** (`frontend/src/contexts/AuthContext.js`)
  - Estado global de autenticação
  - Funções: login, logout, register
  - Provider para toda aplicação
  
- [ ] **LocationContext** (`frontend/src/contexts/LocationContext.js`)
  - Gerenciar localização do usuário (GPS ou CEP)
  - Hook useLocation()

#### 2.4 Atualizar Componentes Existentes
- [ ] **Home.js** - Buscar produtos reais da API
- [ ] **Search.js** - Integrar busca com filtros de geolocalização
- [ ] **ProductDetail.js** - Carregar dados reais do produto
- [ ] **ProductCard.js** - Exibir dados reais

**Tempo Estimado**: 2-3 dias
**Dependências**: FASE 1 completa

---

### **FASE 3: Autenticação e Autorização** 🔐 (Prioridade ALTA)
**Objetivo**: Sistema completo de login/cadastro funcional

#### 3.1 Componentes de Autenticação
- [ ] **LoginForm** (`frontend/src/components/Auth/LoginForm.js`)
  - Formulário de login
  - Validação com React Hook Form
  - Integração com AuthService
  
- [ ] **RegisterForm** (`frontend/src/components/Auth/RegisterForm.js`)
  - Formulário de cadastro
  - Validação de senha forte
  - Seleção de role (proprietário/locatário)
  
- [ ] **AuthModal** (`frontend/src/components/Auth/AuthModal.js`)
  - Modal com abas Login/Register
  - Integração com Header

#### 3.2 Proteção de Rotas
- [ ] **PrivateRoute** (`frontend/src/components/PrivateRoute.js`)
  - Componente para proteger rotas que requerem autenticação
  - Redirecionar para login se não autenticado

#### 3.3 Atualizar Header
- [ ] Mostrar nome do usuário quando logado
- [ ] Botão de logout
- [ ] Link para dashboard do proprietário (se role = owner)

**Tempo Estimado**: 1-2 dias
**Dependências**: FASE 2 completa

---

### **FASE 4: Funcionalidades Core - Busca e Geolocalização** 📍 (Prioridade ALTA)
**Objetivo**: Busca funcional com filtros de localização

#### 4.1 Componente de Busca
- [ ] **LocationInput** (`frontend/src/components/LocationInput/LocationInput.js`)
  - Input de CEP com validação
  - Integração com API de CEP (ViaCEP)
  - Auto-preenchimento de endereço
  - Opção de usar GPS
  
- [ ] **SearchFilters** (`frontend/src/components/SearchFilters/SearchFilters.js`)
  - Filtros: categoria, preço, distância, avaliação
  - Integração com ProductService

#### 4.2 Melhorar Página de Busca
- [ ] Integrar LocationInput
- [ ] Exibir resultados com distância calculada
- [ ] Ordenação: distância, preço, avaliação
- [ ] Loading states e tratamento de erros

#### 4.3 Backend - Endpoint de Busca
- [ ] Melhorar GET `/api/products`
  - Query params: lat, lng, radius, category, minPrice, maxPrice
  - Retornar distância calculada
  - Ordenação por distância

**Tempo Estimado**: 2-3 dias
**Dependências**: FASE 2 completa

---

### **FASE 5: Sistema de Reservas** 📅 (Prioridade MÉDIA)
**Objetivo**: Usuários podem reservar equipamentos

#### 5.1 Componentes de Reserva
- [ ] **AvailabilityCalendar** (`frontend/src/components/Reservation/AvailabilityCalendar.js`)
  - Calendário interativo
  - Marcar datas disponíveis/indisponíveis
  - Seleção de período (data início/fim)
  
- [ ] **ReservationBox** (`frontend/src/components/Reservation/ReservationBox.js`)
  - Exibir no ProductDetail
  - Cálculo de preço total
  - Exibir taxa de serviço e caução
  - Botão "Reservar Agora"

#### 5.2 Página de Checkout
- [ ] **CheckoutPage** (`frontend/src/pages/Checkout/Checkout.js`)
  - Resumo da reserva
  - Formulário de dados de entrega
  - Integração futura com gateway de pagamento
  - Confirmação de reserva

#### 5.3 Backend - Lógica de Reservas
- [ ] Validar disponibilidade de datas
- [ ] Calcular preço total (dias × preço diário)
- [ ] Calcular taxa de serviço
- [ ] Criar registro de reserva
- [ ] Atualizar disponibilidade do produto

**Tempo Estimado**: 3-4 dias
**Dependências**: FASE 3 completa

---

### **FASE 6: Painel do Proprietário** 👤 (Prioridade MÉDIA)
**Objetivo**: Proprietários podem gerenciar seus produtos

#### 6.1 Onboarding de Publicação
- [ ] **PublishProductWizard** (`frontend/src/components/PublishProduct/PublishProductWizard.js`)
  - Passo 1: Categoria e informações básicas
  - Passo 2: Preço e localização
  - Passo 3: Imagens e descrição
  - Passo 4: Preview e publicação

#### 6.2 Dashboard do Proprietário
- [ ] **OwnerDashboard** (`frontend/src/pages/OwnerDashboard/OwnerDashboard.js`)
  - Lista de produtos publicados
  - Estatísticas (visualizações, reservas)
  - Reservas pendentes
  - Ganhos

#### 6.3 Gestão de Produtos
- [ ] Editar produto
- [ ] Pausar/Ativar produto
- [ ] Deletar produto
- [ ] Gerenciar disponibilidade (calendário)

**Tempo Estimado**: 3-4 dias
**Dependências**: FASE 3 e FASE 5 completas

---

### **FASE 7: Sistema de Avaliações** ⭐ (Prioridade BAIXA)
**Objetivo**: Usuários podem avaliar produtos e proprietários

#### 7.1 Componentes
- [ ] **ReviewForm** (`frontend/src/components/Review/ReviewForm.js`)
  - Formulário de avaliação (após reserva concluída)
  - Rating com estrelas
  - Campo de comentário
  
- [ ] Melhorar **ReviewCard** e **ReviewList**
  - Carregar avaliações reais da API
  - Paginação

#### 7.2 Backend
- [ ] Endpoint POST `/api/reviews`
- [ ] Validar que usuário fez reserva antes de avaliar
- [ ] Calcular rating médio do produto

**Tempo Estimado**: 1-2 dias
**Dependências**: FASE 5 completa

---

### **FASE 8: Upload de Imagens** 📸 (Prioridade MÉDIA)
**Objetivo**: Proprietários podem fazer upload de fotos

#### 8.1 Backend
- [ ] Configurar Multer para upload
- [ ] Endpoint POST `/api/upload`
- [ ] Armazenar imagens (local ou cloud storage)
- [ ] Retornar URLs das imagens

#### 8.2 Frontend
- [ ] **ImageUploader** (`frontend/src/components/ImageUploader/ImageUploader.js`)
  - Drag and drop
  - Preview de imagens
  - Upload múltiplo
  - Validação de tipo e tamanho

**Tempo Estimado**: 2 dias
**Dependências**: FASE 6 completa

---

## 📋 Checklist de Implementação Rápida (MVP Mínimo)

Para ter um MVP funcional o mais rápido possível, foque nesta ordem:

### Semana 1: Backend Funcional
- [ ] Dia 1-2: Configurar banco de dados e criar models
- [ ] Dia 3-4: Implementar rotas de autenticação e produtos
- [ ] Dia 5: Testar endpoints com Postman/Insomnia

### Semana 2: Integração e Autenticação
- [ ] Dia 1-2: Configurar Axios e serviços no frontend
- [ ] Dia 3-4: Implementar login/cadastro
- [ ] Dia 5: Testar fluxo completo de autenticação

### Semana 3: Funcionalidades Core
- [ ] Dia 1-2: Busca com geolocalização
- [ ] Dia 3-4: Sistema de reservas básico
- [ ] Dia 5: Testes e correções

### Semana 4: Refinamento
- [ ] Dia 1-2: Painel do proprietário básico
- [ ] Dia 3-4: Upload de imagens
- [ ] Dia 5: Testes finais e deploy

---

## 🔧 Configurações Necessárias

### Variáveis de Ambiente (.env)
```env
# Backend
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=praxeo_db
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=seu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Frontend (se necessário)
REACT_APP_API_URL=http://localhost:3001/api
```

### Dependências Adicionais (se necessário)
```bash
# Backend
npm install sequelize-cli --save-dev  # Para migrations
npm install pg-hstore  # Já instalado

# Frontend
npm install react-router-dom  # Já instalado
npm install axios  # Já instalado
```

---

## 🎯 Critérios de Sucesso

O projeto será considerado "funcional" quando:

1. ✅ Usuário pode se cadastrar e fazer login
2. ✅ Proprietário pode publicar um produto com imagens
3. ✅ Locatário pode buscar produtos por localização
4. ✅ Locatário pode ver detalhes do produto
5. ✅ Locatário pode fazer uma reserva
6. ✅ Proprietário pode ver suas reservas
7. ✅ Sistema calcula distância corretamente
8. ✅ Imagens são exibidas corretamente

---

## 📚 Recursos e Referências

### Documentação
- [Sequelize Docs](https://sequelize.org/docs/v6/)
- [PostGIS Docs](https://postgis.net/documentation/)
- [Express.js Docs](https://expressjs.com/)
- [React Router Docs](https://reactrouter.com/)

### APIs Úteis
- [ViaCEP](https://viacep.com.br/) - Busca de CEP
- [Google Maps API](https://developers.google.com/maps) - Geocodificação (futuro)

---

## 🚨 Pontos de Atenção

1. **Segurança**:
   - Sempre validar dados no backend
   - Nunca confiar apenas na validação do frontend
   - Usar HTTPS em produção
   - Sanitizar inputs para prevenir SQL Injection

2. **Performance**:
   - Implementar paginação nas listagens
   - Usar índices no banco de dados
   - Cache de consultas frequentes (futuro)

3. **UX**:
   - Loading states em todas as requisições
   - Mensagens de erro claras
   - Feedback visual em todas as ações

---

**Última Atualização**: 2025-12-06
**Status**: Em Planejamento
**Próxima Revisão**: Após conclusão da FASE 1

