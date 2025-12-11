# 🎨 Plano de Implementação - Frontend Praxeo.tech

**Data de Criação**: 2025-12-06  
**Última Atualização**: 2025-12-06  
**Status**: Em Planejamento

---

## 📊 Análise do Estado Atual do Frontend

### ✅ **O que já está implementado e funcionando:**

#### 1. **Infraestrutura Base**
- ✅ **Configuração do Axios** (`services/api.js`)
  - Interceptors para JWT
  - Tratamento de erros global
  - Funções auxiliares de autenticação

- ✅ **Context API**
  - `AuthContext` - Gerenciamento de autenticação
  - `LocationContext` - Gerenciamento de localização (GPS/CEP)

- ✅ **Rotas e Navegação** (`App.js`)
  - Rotas públicas: `/`, `/busca`, `/produto/:id`
  - Rotas protegidas: `/checkout`, `/dashboard`, `/publicar`
  - `PrivateRoute` com verificação de roles

#### 2. **Componentes de Autenticação**
- ✅ **LoginForm** - Formulário de login completo
- ✅ **RegisterForm** - Cadastro com validação
- ✅ **AuthModal** - Modal com abas Login/Register
- ✅ **Header** - Integração com autenticação, menu do usuário

#### 3. **Serviços Frontend (API Integration)**
- ✅ **AuthService** - Login, registro, logout, getCurrentUser
- ✅ **ProductService** - CRUD completo de produtos
- ✅ **ReservationService** - Criação e listagem de reservas
- ✅ **ReviewService** - Criação e listagem de avaliações
- ✅ **UploadService** - Upload de imagens (preparado)

#### 4. **Páginas Implementadas**
- ✅ **Home** - Página inicial (estática, sem produtos reais)
- ✅ **Search** - ✅ **Integrada com API** - Busca com filtros e geolocalização
- ✅ **ProductDetail** - ⚠️ **Parcialmente integrada** - Carrega produto da API mas usa mock como fallback
- ✅ **Checkout** - Integrada com API
- ✅ **Confirmation** - Página de confirmação
- ✅ **OwnerDashboard** - ✅ **Integrada com API** - Dashboard completo
- ✅ **PublishProductPage** - Integrada com API

#### 5. **Componentes de UI**
- ✅ **ProductCard** - Exibe dados de produtos
- ✅ **SearchFilters** - Filtros de busca integrados
- ✅ **LocationInput** - Input de CEP/GPS integrado
- ✅ **ReservationBox** - Cálculo de preços e reserva
- ✅ **AvailabilityCalendar** - Calendário de disponibilidade
- ✅ **ReviewForm** - Formulário de avaliação
- ✅ **ReviewList/ReviewCard** - Listagem de avaliações

---

### ⚠️ **O que está parcialmente implementado:**

#### 1. **Home.js**
- ❌ Não exibe produtos reais da API
- ❌ Não tem seção de produtos em destaque
- ❌ Não tem categorias populares
- ✅ Tem estrutura básica e seção "Como Funciona"

#### 2. **ProductDetail.js**
- ✅ Tenta carregar da API
- ⚠️ Usa mock data como fallback (pode mascarar problemas)
- ❌ Não carrega datas indisponíveis do backend
- ❌ Não exibe avaliações reais da API
- ❌ Falta tratamento melhor de erros

#### 3. **Upload de Imagens**
- ✅ Componente `ImageUploader` existe
- ⚠️ Backend pode não estar totalmente configurado
- ❌ Integração pode precisar de ajustes

#### 4. **EditProductPage**
- ✅ Existe e está integrada com API
- ⚠️ Precisar verificar se está totalmente funcional
- ❌ Rota pode não estar no App.js

---

### ❌ **O que falta implementar:**

#### 1. **Páginas Faltantes**
- ❌ **Página de Minhas Reservas** (`/minhas-reservas`)
  - Lista reservas do usuário como locatário
  - Lista reservas recebidas como proprietário
  - Filtros por status
  - Ações: cancelar, confirmar, avaliar

- ❌ **Página de Perfil do Usuário** (`/perfil`)
  - Editar dados pessoais
  - Alterar senha
  - Histórico de reservas

- ❌ **Página de Editar Produto** (`/produto/:id/editar`)
  - Rota já existe mas precisa ser adicionada ao App.js
  - Integração com backend

#### 2. **Funcionalidades Faltantes**
- ❌ **Estimativa de Preço de Reserva** (endpoint `/api/reservations/estimate`)
  - Integrar no `ReservationBox` para mostrar preço antes de criar
  - Atualizar `ReservationService` com novo método

- ❌ **Carregar Datas Indisponíveis no ProductDetail**
  - Criar endpoint no backend ou método no frontend
  - Atualizar `AvailabilityCalendar` com datas reais

- ❌ **Paginação nas Listagens**
  - Products em Search
  - Reservas no Dashboard
  - Reviews no ProductDetail

- ❌ **Toast/Notificações**
  - Sistema de feedback visual para ações do usuário
  - Mensagens de sucesso/erro

#### 3. **Melhorias de UX**
- ❌ **Loading States Globais**
  - Skeleton loaders consistentes
  - Indicadores de loading mais visuais

- ❌ **Tratamento de Erros Melhorado**
  - Mensagens de erro mais claras
  - Fallbacks visuais quando API falha
  - Retry automático para erros de rede

- ❌ **Otimizações de Performance**
  - Lazy loading de componentes
  - Memoização de componentes pesados
  - Debounce em buscas

---

## 🎯 Plano de Implementação Detalhado

### **FASE 1: Completar Integrações Pendentes** ⚡ (Prioridade CRÍTICA)

**Objetivo**: Garantir que todas as páginas existentes estejam totalmente integradas com a API

#### 1.1 Completar Home.js
**Tempo estimado**: 2-3 horas ✅ **CONCLUÍDO**

**Tarefas**:
- [X] Buscar produtos em destaque da API (ex: últimos produtos, mais avaliados)
- [X] Adicionar seção de produtos recomendados baseado em localização
- [X] Implementar skeleton loader durante carregamento
- [X] Adicionar tratamento de erros
- [X] Adicionar botão "Ver todos os produtos"

**Arquivos a modificar**:
- `frontend/src/pages/Home/Home.js`
- `frontend/src/pages/Home/Home.css` (se necessário)

**Exemplo de código**:
```javascript
// Buscar produtos em destaque
useEffect(() => {
  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getProducts({
        limit: 6,
        sortBy: 'rating',
        order: 'desc'
      });
      setFeaturedProducts(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Não foi possível carregar os produtos');
    } finally {
      setLoading(false);
    }
  };
  fetchFeaturedProducts();
}, []);
```

#### 1.2 Melhorar ProductDetail.js
**Tempo estimado**: 

**Tarefas**:
- [ ] Remover fallback para mock data (ou tornar opcional apenas para desenvolvimento)
- [ ] Implementar carregamento de datas indisponíveis
- [ ] Integrar ReviewList com API real
- [ ] Melhorar tratamento de erros (página 404, erro de carregamento)
- [ ] Adicionar skeleton loader

**Endpoint necessário no backend** (ou método no frontend):
```javascript
// Criar método em ReservationService
export const getUnavailableDates = async (productId) => {
  // Buscar reservas ativas do produto
  // Retornar array de datas indisponíveis
};
```

**Arquivos a modificar**:
- `frontend/src/pages/ProductDetail/ProductDetail.js`
- `frontend/src/services/reservation.service.js` (novo método)

#### 1.3 Adicionar Rota de Edição de Produto
**Tempo estimado**:

**Tarefas**:
- [ ] Adicionar rota `/produto/:id/editar` no `App.js`
- [ ] Verificar se `EditProductPage` está funcional
- [ ] Adicionar link de edição no `OwnerDashboard`

**Arquivos a modificar**:
- `frontend/src/App.js`
- `frontend/src/pages/OwnerDashboard/OwnerDashboard.js` (adicionar botão)

---

### **FASE 2: Implementar Páginas Faltantes** 📄 (Prioridade ALTA)

#### 2.1 Página de Minhas Reservas
**Tempo estimado**:

**Funcionalidades**:
- [ ] Listar reservas do usuário como locatário
- [ ] Listar reservas recebidas como proprietário
- [ ] Filtros: status, data, tipo (feitas/recebidas)
- [ ] Ações por reserva:
  - Cancelar (se locatário e status permitir)
  - Confirmar/Aceitar (se proprietário)
  - Ver detalhes
  - Avaliar (após conclusão)
- [ ] Paginação
- [ ] Empty states
- [ ] Loading states

**Arquivos a criar**:
- `frontend/src/pages/MyReservations/MyReservations.js`
- `frontend/src/pages/MyReservations/MyReservations.css`

**Estrutura do componente**:
```javascript
const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('all'); // all, as_renter, as_owner
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Buscar reservas usando ReservationService.getReservations({ type: filter })
  // Renderizar lista com cards de reserva
  // Implementar ações
};
```

**Arquivos a modificar**:
- `frontend/src/App.js` (adicionar rota)
- `frontend/src/components/Header/Header.js` (adicionar link no menu)

#### 2.2 Página de Perfil do Usuário
**Tempo estimado**: 3-4 horas

**Funcionalidades**:
- [ ] Exibir dados do usuário atual
- [ ] Editar informações pessoais (nome, email, telefone)
- [ ] Alterar senha
- [ ] Histórico resumido de reservas
- [ ] Estatísticas pessoais (se aplicável)

**Arquivos a criar**:
- `frontend/src/pages/Profile/Profile.js`
- `frontend/src/pages/Profile/Profile.css`

**Endpoint necessário no backend**:
- PUT `/api/auth/profile` - Atualizar perfil
- PUT `/api/auth/password` - Alterar senha

**Arquivos a modificar**:
- `frontend/src/services/auth.service.js` (adicionar métodos)
- `frontend/src/App.js` (adicionar rota)
- `frontend/src/components/Header/Header.js` (adicionar link)

---

### **FASE 3: Melhorias de Funcionalidades** 🔧 (Prioridade MÉDIA)

#### 3.1 Integrar Estimativa de Preço
**Tempo estimado**: 2 horas

**Tarefas**:
- [ ] Adicionar método `estimateReservationPrice` em `ReservationService`
- [ ] Atualizar `ReservationBox` para usar estimativa
- [ ] Mostrar preço atualizado quando datas mudarem
- [ ] Exibir breakdown de preços (aluguel + taxa de serviço)

**Código a adicionar em `reservation.service.js`**:
```javascript
export const estimateReservationPrice = async (productId, startDate, endDate) => {
  try {
    const response = await api.get('/reservations/estimate', {
      params: { productId, startDate, endDate }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

**Arquivos a modificar**:
- `frontend/src/services/reservation.service.js`
- `frontend/src/components/Reservation/ReservationBox.js`

#### 3.2 Sistema de Notificações/Toast
**Tempo estimado**: 3-4 horas

**Tarefas**:
- [ ] Criar componente `Toast` ou `Notification`
- [ ] Criar contexto `NotificationContext`
- [ ] Integrar em todas as ações (sucesso/erro)
- [ ] Adicionar estilos e animações

**Arquivos a criar**:
- `frontend/src/components/Toast/Toast.js`
- `frontend/src/components/Toast/Toast.css`
- `frontend/src/contexts/NotificationContext.js`

**Exemplo de uso**:
```javascript
const { showNotification } = useNotification();

// Após criar reserva
showNotification('Reserva criada com sucesso!', 'success');

// Em caso de erro
showNotification('Erro ao criar reserva', 'error');
```

#### 3.3 Paginação nas Listagens
**Tempo estimado**: 3-4 horas

**Tarefas**:
- [ ] Criar componente `Pagination`
- [ ] Implementar paginação em Search (produtos)
- [ ] Implementar paginação em OwnerDashboard (reservas)
- [ ] Implementar paginação em ReviewList
- [ ] Adicionar controles de página (anterior/próxima, página específica)

**Arquivos a criar**:
- `frontend/src/components/Pagination/Pagination.js`
- `frontend/src/components/Pagination/Pagination.css`

**Arquivos a modificar**:
- `frontend/src/pages/Search/Search.js`
- `frontend/src/pages/OwnerDashboard/OwnerDashboard.js`
- `frontend/src/components/ReviewList/ReviewList.js`

---

### **FASE 4: Melhorias de UX e Performance** 🚀 (Prioridade MÉDIA-BAIXA)

#### 4.1 Loading States Melhorados
**Tempo estimado**: 2-3 horas

**Tarefas**:
- [ ] Criar componente `SkeletonLoader` reutilizável
- [ ] Substituir loaders simples por skeletons
- [ ] Adicionar skeleton em ProductCard
- [ ] Adicionar skeleton em listagens

**Arquivos a criar**:
- `frontend/src/components/Skeleton/SkeletonLoader.js`
- `frontend/src/components/Skeleton/SkeletonCard.js`
- `frontend/src/components/Skeleton/Skeleton.css`

#### 4.2 Tratamento de Erros Melhorado
**Tempo estimado**: 3-4 horas

**Tarefas**:
- [ ] Criar componente `ErrorBoundary`
- [ ] Criar páginas de erro (404, 500, Offline)
- [ ] Implementar retry automático para erros de rede
- [ ] Melhorar mensagens de erro (mais amigáveis)

**Arquivos a criar**:
- `frontend/src/components/ErrorBoundary/ErrorBoundary.js`
- `frontend/src/pages/Error/404.js`
- `frontend/src/pages/Error/500.js`
- `frontend/src/pages/Error/Offline.js`

#### 4.3 Otimizações de Performance
**Tempo estimado**: 2-3 horas

**Tarefas**:
- [ ] Implementar lazy loading de rotas
- [ ] Memoizar componentes pesados (ProductCard, etc.)
- [ ] Adicionar debounce em buscas
- [ ] Otimizar imagens (lazy loading, placeholders)

**Código para lazy loading**:
```javascript
// App.js
const Home = lazy(() => import('./pages/Home/Home'));
const Search = lazy(() => import('./pages/Search/Search'));

// Usar Suspense
<Suspense fallback={<Loading />}>
  <Routes>...</Routes>
</Suspense>
```

---

### **FASE 5: Upload de Imagens** 📸 (Prioridade MÉDIA)

#### 5.1 Completar Integração de Upload
**Tempo estimado**: 2-3 horas

**Tarefas**:
- [ ] Verificar se backend está configurado
- [ ] Testar componente `ImageUploader`
- [ ] Integrar em `PublishProductWizard`
- [ ] Adicionar preview de imagens
- [ ] Validação de tipo e tamanho de arquivo

**Arquivos a modificar**:
- `frontend/src/components/ImageUploader/ImageUploader.js`
- `frontend/src/components/PublishProduct/PublishProductWizard.js`
- `frontend/src/services/upload.service.js`

---

## 📋 Checklist de Implementação por Prioridade

### 🔴 **CRÍTICO - Fazer Primeiro**
- [ ] Completar Home.js com produtos reais
- [ ] Melhorar ProductDetail.js (remover mocks, datas indisponíveis)
- [ ] Adicionar rota de edição de produto

### 🟠 **ALTO - Fazer Em Seguida**
- [ ] Criar página de Minhas Reservas
- [ ] Criar página de Perfil
- [ ] Integrar estimativa de preço no ReservationBox

### 🟡 **MÉDIO - Fazer Depois**
- [ ] Sistema de notificações/toast
- [ ] Paginação nas listagens
- [ ] Loading states melhorados (skeletons)
- [ ] Completar upload de imagens

### 🟢 **BAIXO - Melhorias Futuras**
- [ ] Tratamento de erros melhorado
- [ ] Otimizações de performance
- [ ] PWA (Progressive Web App)
- [ ] Testes automatizados

---

## 🛠️ Tecnologias e Padrões a Usar

### **Bibliotecas Recomendadas** (se necessário):
- **React Query** ou **SWR** - Para cache e gerenciamento de estado servidor
- **React Hook Form** - Já está sendo usado, continuar
- **react-hot-toast** ou **react-toastify** - Para notificações (opcional)
- **react-loading-skeleton** - Para skeleton loaders (opcional)

### **Padrões de Código**:
- Manter consistência com código existente
- Usar hooks customizados quando apropriado
- Componentes funcionais com hooks
- CSS modules ou styled-components (verificar padrão atual)

### **Estrutura de Arquivos**:
```
frontend/src/
  ├── components/
  │   ├── [ComponentName]/
  │   │   ├── [ComponentName].js
  │   │   └── [ComponentName].css
  ├── pages/
  │   ├── [PageName]/
  │   │   ├── [PageName].js
  │   │   └── [PageName].css
  ├── services/
  ├── contexts/
  └── hooks/ (criar se necessário)
```

---

## 🧪 Testes e Validação

### **Checklist de Testes por Funcionalidade**:

#### Home
- [ ] Produtos são carregados corretamente
- [ ] Loading state aparece durante carregamento
- [ ] Erro é exibido se API falhar
- [ ] Produtos são clicáveis e redirecionam

#### ProductDetail
- [ ] Produto é carregado pelo ID
- [ ] Datas indisponíveis são exibidas no calendário
- [ ] Avaliações são carregadas
- [ ] Reserva pode ser criada
- [ ] 404 aparece se produto não existir

#### Minhas Reservas
- [ ] Lista reservas como locatário
- [ ] Lista reservas como proprietário
- [ ] Filtros funcionam
- [ ] Ações (cancelar, confirmar) funcionam
- [ ] Paginação funciona

---

## 📝 Notas Importantes

1. **Sempre testar integração com backend** antes de marcar como completo
2. **Manter tratamento de erros consistente** em todas as requisições
3. **Loading states são essenciais** - nunca deixar usuário sem feedback
4. **Mobile-first** - garantir responsividade em todos os componentes
5. **Acessibilidade** - manter padrões básicos de acessibilidade

---

## 🎯 Métricas de Sucesso

O frontend será considerado "completo" quando:
- ✅ Todas as páginas estão totalmente integradas com a API
- ✅ Não há mais dados mock sendo usados em produção
- ✅ Todas as ações têm feedback visual (loading, success, error)
- ✅ Sistema de paginação funciona em todas as listagens
- ✅ Upload de imagens está funcional
- ✅ Tratamento de erros está consistente em toda aplicação

---

**Próximos Passos**: Começar pela FASE 1 (Integrações Pendentes)

