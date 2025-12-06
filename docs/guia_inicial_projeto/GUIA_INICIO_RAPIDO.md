# 🚀 Guia de Início Rápido - Praxeo

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:
- **Node.js** (versão 16 ou superior)
- **npm** (vem junto com o Node.js)

Para verificar se estão instalados, execute no terminal:
```bash
node --version
npm --version
```

## 🔧 Passo a Passo

### 1. Instalar Dependências

Na primeira vez, você precisa instalar todas as dependências do projeto:

```bash
npm install
```

Este comando irá:
- Ler o arquivo `package.json`
- Baixar e instalar todas as dependências listadas
- Criar a pasta `node_modules` com todas as bibliotecas necessárias

⏱️ **Tempo estimado**: 2-5 minutos (dependendo da sua conexão)

### 2. Iniciar o Servidor de Desenvolvimento

Após instalar as dependências, inicie o servidor:

```bash
npm start
```

Este comando irá:
- Compilar o projeto React
- Iniciar um servidor de desenvolvimento local
- Abrir automaticamente o navegador em `http://localhost:3000`

✅ **Sucesso!** Você verá a aplicação rodando no navegador.

### 3. Parar o Servidor

Para parar o servidor, pressione `Ctrl + C` no terminal.

## 📝 Comandos Úteis

### Desenvolvimento
```bash
npm start          # Inicia o servidor de desenvolvimento
```

### Build para Produção
```bash
npm run build      # Cria uma versão otimizada para produção
```

### Testes
```bash
npm test           # Executa os testes (quando implementados)
```

## 🐛 Solução de Problemas

### Erro: "npm não é reconhecido"
**Solução**: Instale o Node.js de [nodejs.org](https://nodejs.org/)

### Erro: "Porta 3000 já está em uso"
**Solução**: 
- Feche outras aplicações usando a porta 3000, ou
- O React perguntará se você quer usar outra porta (pressione Y)

### Erro: "Module not found"
**Solução**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Dependências não instalam
**Solução**: 
```bash
npm cache clean --force
npm install
```

## 📂 Estrutura Após Instalação

Após `npm install`, você terá:
```
Praxeo/
├── node_modules/     ← Bibliotecas instaladas (não commitar no git)
├── public/           ← Arquivos públicos
├── src/              ← Código fonte React
├── package.json      ← Configurações e dependências
└── package-lock.json ← Versões exatas das dependências
```

## 🎯 Próximos Passos

Após o projeto estar rodando:
1. ✅ Explore a página inicial
2. ✅ Teste a busca de produtos
3. ✅ Veja os detalhes de um produto
4. ✅ Confira as avaliações

---

**Dica**: Mantenha o terminal aberto enquanto desenvolve. Qualquer alteração no código será refletida automaticamente no navegador (Hot Reload).

