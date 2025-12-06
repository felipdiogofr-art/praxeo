# 🏥 Praxeo - Marketplace de Equipamentos Médicos

Marketplace P2P para aluguel de equipamentos médicos-hospitalares. Conecta proprietários de equipamentos com locatários na mesma região, oferecendo uma solução rápida, segura e flexível.

## 🎯 Características Principais

- **Busca por Geolocalização**: Encontre equipamentos próximos usando CEP ou localização
- **Sistema de Reserva**: Calendário interativo para seleção de datas
- **Sistema de Confiança**: Avaliações e verificação de proprietários
- **Checkout Seguro**: Processamento de pagamento e gestão de caução
- **Interface Moderna**: Design responsivo e acessível

## 🛠️ Stack Tecnológica

### Frontend
- **React** 18.2.0 (sem Vite, usando Create React App)
- **React Router DOM** 6.20.0 (roteamento)
- **Axios** 1.6.2 (requisições HTTP)
- **React Hook Form** 7.48.2 (formulários)
- **Date-fns** 2.30.0 (manipulação de datas)

### Backend (Planejado)
- **Node.js** com Express
- **PostgreSQL** com PostGIS (geolocalização)
- **Redis** (cache)

### Hospedagem (Planejado)
- **Frontend**: Vercel
- **Backend**: Render

## 📁 Estrutura do Projeto

```
praxeo-marketplace/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── HeroSection/
│   │   ├── Layout/
│   │   └── ProductCard/
│   ├── pages/
│   │   ├── Home/
│   │   ├── Search/
│   │   └── ProductDetail/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd praxeo-marketplace
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

4. Abra [http://localhost:3000](http://localhost:3000) no navegador

### Build para Produção

```bash
npm run build
```

Isso criará uma pasta `build` com os arquivos otimizados para produção.

## 📋 Funcionalidades Implementadas

### ✅ Fase 1 - Estrutura Base
- [x] Configuração do projeto React
- [x] Estrutura de pastas organizada
- [x] Sistema de design (cores, tipografia, espaçamentos)

### ✅ Fase 2 - Componentes Estruturais
- [x] Layout (wrapper principal)
- [x] Header (navegação e busca)
- [x] Footer (links legais e suporte)
- [x] HeroSection (banner principal)

### ✅ Fase 3 - Páginas e Componentes de Exibição
- [x] Página Home
- [x] Página de Busca
- [x] Página de Detalhes do Produto
- [x] ProductCard (card de produto)

### ⏳ Próximas Fases
- [ ] Componentes transacionais (Calendário, Reserva, Checkout)
- [ ] Autenticação (Login/Cadastro)
- [ ] Integração com API
- [ ] Sistema de avaliações
- [ ] Dashboard do proprietário

## 🎨 Design System

### Cores
- **Verde Primário**: `#4CAF50` (saúde, confiança)
- **Azul Primário**: `#2196F3` (tecnologia, modernidade)
- **Cinzas**: Escala completa para textos e backgrounds

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Tamanhos**: Escala modular baseada em rem

### Componentes
Todos os componentes seguem o padrão de design estabelecido, com foco em:
- Acessibilidade (ARIA labels, contraste adequado)
- Responsividade (mobile-first)
- Performance (lazy loading, code splitting)

## 📝 Scripts Disponíveis

- `npm start`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria build de produção
- `npm test`: Executa os testes
- `npm run eject`: Remove a abstração do Create React App (irreversível)

## 🔒 Segurança

- Validação de dados no frontend e backend
- Autenticação segura (a implementar)
- Proteção contra XSS e SQL Injection
- Sistema de caução para proteção do proprietário

## 📈 Próximos Passos

1. Implementar componentes transacionais
2. Configurar integração com API
3. Implementar autenticação
4. Adicionar testes unitários e de integração
5. Configurar CI/CD
6. Deploy em produção

## 🤝 Contribuindo

Este é um projeto em desenvolvimento. Contribuições são bem-vindas!

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ para facilitar o acesso a equipamentos médicos**


