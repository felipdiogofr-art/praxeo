# 🔧 Troubleshooting - Criação de Produtos

## Problemas Comuns e Soluções

### ❌ "Não consigo criar produtos"

#### 1. **Verificar Autenticação**
- ✅ Certifique-se de estar logado
- ✅ Verifique se o token JWT está sendo enviado
- ✅ Abra o console do navegador (F12) e verifique se há erros de autenticação

#### 2. **Verificar Backend**
- ✅ O backend está rodando? (`npm start` na pasta `backend`)
- ✅ Verifique se há erros no console do backend
- ✅ Teste o endpoint manualmente:
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "title": "Teste",
    "category": "cadeira-rodas",
    "price": 50.00,
    "condition": "good",
    "description": "Teste de produto"
  }'
```

#### 3. **Verificar Campos Obrigatórios**
Campos **obrigatórios**:
- ✅ `title` - Título do produto (3-200 caracteres)
- ✅ `category` - Categoria
- ✅ `price` - Preço (deve ser > 0)

Campos **opcionais** mas recomendados:
- 📸 `images` - Array de URLs de imagens (pode ser vazio)
- 📍 `location` - Objeto com `{ lat, lng }` (opcional)
- 📝 `description` - Descrição (opcional, mas recomendado)

#### 4. **Problemas com Upload de Imagens**
Se o upload de imagens falhar:
- ✅ O produto pode ser criado SEM imagens
- ✅ As imagens são opcionais
- ✅ Você pode adicionar imagens depois editando o produto
- ⚠️ Se o Cloudinary não estiver configurado, o upload pode falhar

#### 5. **Verificar Formato de Localização**
O backend espera:
```javascript
{
  location: {
    lat: -23.5505,
    lng: -46.6333
  }
}
```

**NÃO** envie `lat` e `lng` como campos separados no nível raiz.

#### 6. **Console do Navegador**
Abra o console (F12) e verifique:
- ❌ Erros de rede (CORS, conexão recusada)
- ❌ Erros 401 (não autenticado)
- ❌ Erros 403 (sem permissão)
- ❌ Erros 400 (validação - veja a mensagem de erro)
- ❌ Erros 500 (erro do servidor - veja logs do backend)

#### 7. **Teste Manual via Postman/Insomnia**
Teste criar um produto diretamente na API:

```http
POST http://localhost:3001/api/products
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "title": "Cadeira de Rodas Teste",
  "category": "cadeira-rodas",
  "price": 50.00,
  "condition": "good",
  "description": "Cadeira de rodas em bom estado",
  "images": [],
  "availability": true
}
```

## Checklist de Debug

- [ ] Backend está rodando?
- [ ] Estou autenticado no frontend?
- [ ] Token JWT está presente no localStorage?
- [ ] Console do navegador mostra algum erro?
- [ ] Console do backend mostra algum erro?
- [ ] Preenchi todos os campos obrigatórios?
- [ ] O preço é maior que zero?
- [ ] A categoria está selecionada?
- [ ] O título tem pelo menos 3 caracteres?

## Criar Produto SEM Imagens (para teste)

Se o upload de imagens estiver com problemas, você pode:
1. Preencher todos os campos do wizard
2. **Pular o upload de imagens** (não é obrigatório)
3. Publicar o produto
4. Adicionar imagens depois editando o produto

## Logs Úteis

No frontend (console do navegador):
```javascript
// Verificar se está autenticado
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));

// Verificar dados do formulário antes de enviar
// (adicionar console.log no PublishProductWizard antes do submit)
```

No backend:
- Erros aparecem no console onde o servidor está rodando
- Procure por: "Erro ao criar produto", "ValidationError", etc.

## Próximos Passos

Se ainda não funcionar:
1. Capture a mensagem de erro exata do console
2. Verifique os logs do backend
3. Teste a API diretamente (Postman/Insomnia)
4. Verifique se o banco de dados está funcionando

