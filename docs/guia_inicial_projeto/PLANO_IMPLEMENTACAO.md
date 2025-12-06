# 📋 Plano de Implementação - Marketplace Praxeo

## 🎯 Visão Geral
Marketplace P2P para aluguel de equipamentos médicos-hospitalares com foco em geolocalização, confiança e experiência do usuário.

### Pilares da Marca Praxeo.tech
- **Acessibilidade**: Tornar equipamentos médicos acessíveis a todos
- **Praticidade**: Experiência simples, rápida e guiada (app-like)
- **Urgência**: Busca focada em localização para entrega rápida
- **Conexão**: Apoio mútuo através da comunidade Syncuria
- **Transparência**: Informações claras sobre condições, preços e avaliações

## 🏗️ Fase 1: Estrutura Base e Configuração (Atual)

### 1.1 Setup Inicial
- [X] Criar estrutura de pastas do projeto React
- [X] Configurar package.json com dependências essenciais
- [ ] Configurar scripts de build e desenvolvimento
- [ ] Estrutura de pastas organizada por funcionalidade

### 1.2 Dependências Principais
- **React** (v18+)
- **React Router DOM** (roteamento)
- **Axios** (requisições HTTP)
- **React Hook Form** (formulários)
- **Date-fns** (manipulação de datas)
- **CSS Modules** ou **Styled Components** (estilização)
- **React Geolocated** ou **navigator.geolocation** (geolocalização)
- **React Dropzone** (upload de imagens com drag and drop)

## 🎨 Fase 2: Componentes Estruturais

### 2.1 Layout Base
- **Layout**: Wrapper principal com Header e Footer
- **Header**: Navegação, busca, ações de login
- **Footer**: Links legais, suporte, redes sociais
- **HeroSection**: Banner principal com busca por localização
- **CTA Anunciar**: Botão "Anunciar Equipamento" ou "+ Oferecer Ajuda" (barra inferior estilo app ou canto superior direito web)

### 2.2 Navegação e Roteamento
- Configurar React Router
- Páginas: Home, Busca, Detalhes do Produto, Checkout, Dashboard, Onboarding Anunciante, Painel Anunciante

## 📦 Fase 3: Componentes de Exibição (Catálogo)

### 3.1 Geolocalização e Onboarding de Busca
- **LocationRequest**: Tela inicial solicitando permissão de GPS ou entrada manual de CEP/Endereço
- **LocationContext**: Context para gerenciar localização do usuário
- **CEPInput**: Campo de CEP com auto-preenchimento de endereço
- Lógica: Sem localização definida, não exibir resultados (garantir relevância e urgência)

### 3.2 Busca Unificada
- **UnifiedSearchBar**: Barra de busca única que detecta tipo (Equipamento ou Profissional)
- **SearchResultsTabs**: Abas de alternância "EQUIPAMENTOS" e "PROFISSIONAIS"
- **SearchFilters**: Filtros por categoria, preço, distância, avaliação
- Lógica de classificação:
  - Equipamentos: Tipo → Distância → Avaliação
  - Profissionais: Especialidade → Distância → Selo de Verificação

### 3.3 Listagem de Equipamentos
- **ProductCard**: Card de item com imagem, preço, distância, avaliação
- **ProductGrid**: Grid responsivo de produtos
- **ProductPreview**: Preview do card para revisão antes de publicar (usado no onboarding)

### 3.4 Listagem de Profissionais
- **ProfessionalCard**: Card de profissional com foto, especialidade, valor hora/visita, selo de verificação
- **ProfessionalGrid**: Grid responsivo de profissionais

### 3.5 Detalhes
- **ProductDetail**: Página completa com galeria, descrição, especificações
- **ProfessionalDetail**: Página completa com perfil, especialidades, avaliações
- **ReviewCard**: Card de avaliação individual
- **ReviewList**: Lista de avaliações com paginação

## 🔄 Fase 4: Onboarding do Anunciante (Painel do Parceiro)

### 4.1 Fluxo de Publicação de Equipamento (3 Passos)

#### Passo 1: Identificação do Item
- **CategorySelect**: Dropdown com categorias (Mobilidade, Respiratório, Cama Hospitalar, etc.)
- **ProductNameInput**: Campo de texto para nome/título do equipamento
- **ImageUploader**: Componente drag and drop para upload de múltiplas imagens com preview de miniaturas
- **ConditionSelector**: Botões de seleção (Novo, Pouco Usado, Usado com Marcas)

#### Passo 2: Detalhes do Aluguel e Localização
- **PriceInput**: Campo de número formatado como moeda (R$ por dia)
- **AvailabilityCalendar**: Calendário interativo para bloquear dias/períodos indisponíveis
- **LocationInput**: Campo de CEP com auto-preenchimento de endereço completo
- **DescriptionTextarea**: Campo de texto com limite de caracteres e contador

#### Passo 3: Confirmação e Publicação
- **ProductPreview**: Preview exato do ProductCard como aparecerá na busca
- **PublishButton**: CTA "Publicar e Disponibilizar" com cor da marca
- **SuccessMessage**: Mensagem de sucesso após publicação

### 4.2 Painel do Anunciante
- **MyAdsPage**: Página listando todos os ProductCards criados pelo usuário
- **AdActions**: Botões rápidos para Editar, Pausar/Desativar, Ver Pedidos Pendentes
- **EarningsPage**: Página de ganhos/extrato com visualização de:
  - Total alugado
  - Taxas da plataforma
  - Pagamentos futuros

## 🔄 Fase 5: Componentes Transacionais

### 5.1 Reserva
- **AvailabilityCalendar**: Calendário com datas disponíveis/indisponíveis
- **ReservationBox**: Box de reserva com cálculo de valores
- **DateRangePicker**: Seletor de período de aluguel

### 5.2 Autenticação
- **AuthModal**: Modal de login/cadastro
- **AuthForm**: Formulários de login e registro
- **SocialLogin**: Integração com Google OAuth

### 5.3 Checkout e Contratação
- **CheckoutForm**: Formulário de finalização (para equipamentos)
- **ServiceBookingForm**: Formulário de agendamento (para profissionais)
- **PaymentForm**: Integração com gateway de pagamento
- **OrderSummary**: Resumo do pedido/reserva
- **ChatButton**: Botão "Enviar Mensagem" para chat seguro com profissionais

## 🔧 Fase 6: Lógica e Integração

### 6.1 Serviços e API
- **api.js**: Configuração base do Axios
- **productService.js**: Serviços de produtos (CRUD, busca por geolocalização)
- **professionalService.js**: Serviços de profissionais (CRUD, busca por geolocalização)
- **authService.js**: Serviços de autenticação
- **reservationService.js**: Serviços de reserva de equipamentos
- **bookingService.js**: Serviços de agendamento de profissionais
- **locationService.js**: Serviços de geolocalização e cálculo de distância
- **cepService.js**: Integração com API de CEP para auto-preenchimento

### 6.2 Context e Estado Global
- **AuthContext**: Gerenciamento de autenticação
- **LocationContext**: Gerenciamento de localização do usuário (GPS/CEP)
- **SearchContext**: Estado de busca unificada e filtros (Equipamentos/Profissionais)
- **CartContext**: Gerenciamento de reservas temporárias
- **AdvertiserContext**: Estado do painel do anunciante (anúncios, ganhos)

### 6.3 Hooks Customizados
- **useGeolocation**: Hook para geolocalização (GPS e fallback manual)
- **useSearch**: Hook para busca unificada e filtros
- **useAuth**: Hook para autenticação
- **useCEP**: Hook para busca e validação de CEP
- **useDistance**: Hook para cálculo de distância entre coordenadas

## 🎨 Fase 7: Estilização e UX

### 7.1 Design System
- Paleta de cores (Verde, Azul claro - tema saúde)
- Tipografia
- Componentes de UI reutilizáveis (Botões, Inputs, Modals)
- Estilo app-like: experiência simples, rápida e guiada

### 7.2 Responsividade
- Mobile-first approach
- Breakpoints definidos
- Testes em diferentes dispositivos
- Barra de navegação inferior (estilo app) para mobile

### 7.3 Acessibilidade
- ARIA labels
- Navegação por teclado
- Contraste adequado
- Feedback visual claro em todas as ações

## 🚀 Fase 8: Otimizações e Performance

### 8.1 Code Splitting
- Lazy loading de rotas
- Lazy loading de componentes pesados
- Lazy loading do painel do anunciante

### 8.2 Otimização de Imagens
- Lazy loading de imagens
- Placeholders e skeleton screens
- Compressão de imagens no upload

### 8.3 Cache e Estado
- Implementar cache de requisições de geolocalização
- Cache de resultados de busca
- Otimizar re-renders desnecessários

## 📝 Próximos Passos Imediatos

1. ✅ Criar estrutura base do projeto
2. ⏳ Implementar Layout, Header e Footer com CTA "Anunciar Equipamento"
3. ⏳ Criar LocationRequest (onboarding de geolocalização)
4. ⏳ Implementar busca unificada com abas Equipamentos/Profissionais
5. ⏳ Criar ProductCard básico
6. ⏳ Implementar fluxo de onboarding do anunciante (3 passos)
7. ⏳ Configurar roteamento básico

---

**Nota**: Este plano é iterativo e será atualizado conforme o desenvolvimento avança.


