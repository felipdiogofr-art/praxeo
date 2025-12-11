# Configuração do Cloudinary

Este documento explica como configurar o Cloudinary para hospedar imagens na nuvem.

## Por que usar Cloudinary?

- **CDN Global**: Imagens servidas rapidamente de qualquer lugar do mundo
- **Otimização Automática**: Compressão e conversão automática de formatos
- **Transformações**: Redimensionamento, crop, filtros, etc.
- **Escalabilidade**: Sem limites de armazenamento
- **Backup Automático**: Imagens seguras na nuvem

## Configuração

### 1. Criar conta no Cloudinary

1. Acesse [https://cloudinary.com](https://cloudinary.com)
2. Crie uma conta gratuita (plano free disponível)
3. Acesse o Dashboard

### 2. Obter credenciais

No Dashboard do Cloudinary, você encontrará:
- **Cloud Name**: Nome da sua conta
- **API Key**: Chave de API
- **API Secret**: Segredo da API

### 3. Configurar variáveis de ambiente

Adicione as seguintes variáveis ao arquivo `.env` do backend:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
CLOUDINARY_FOLDER=praxeo/products
```

### 4. Instalar dependências

As dependências já estão no `package.json`. Execute:

```bash
cd backend
npm install
```

### 5. Reiniciar o servidor

Após configurar as variáveis de ambiente, reinicie o servidor:

```bash
npm run dev
```

## Como funciona

### Modo Automático

O sistema detecta automaticamente se o Cloudinary está configurado:

- **Com Cloudinary**: Imagens são enviadas para a nuvem e URLs do CDN são retornadas
- **Sem Cloudinary**: Imagens são armazenadas localmente na pasta `uploads/images`

### Upload

Quando você faz upload de uma imagem:

1. O arquivo é validado (tipo e tamanho)
2. Se Cloudinary estiver configurado:
   - Arquivo é enviado para o Cloudinary
   - URL do CDN é retornada
3. Se Cloudinary não estiver configurado:
   - Arquivo é salvo localmente
   - URL local é retornada

### Exemplo de resposta

**Com Cloudinary:**
```json
{
  "success": true,
  "images": [{
    "url": "https://res.cloudinary.com/seu-cloud/image/upload/v1234567890/praxeo/products/image-1234567890-123456789.jpg",
    "publicId": "praxeo/products/image-1234567890-123456789",
    "width": 1920,
    "height": 1080,
    "format": "jpg",
    "bytes": 245678
  }]
}
```

**Sem Cloudinary (local):**
```json
{
  "success": true,
  "images": [{
    "url": "http://localhost:3001/uploads/images/image-1234567890-123456789.jpg",
    "filename": "image-1234567890-123456789.jpg"
  }]
}
```

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Nome da sua conta Cloudinary | Sim (para usar Cloudinary) |
| `CLOUDINARY_API_KEY` | Chave de API do Cloudinary | Sim (para usar Cloudinary) |
| `CLOUDINARY_API_SECRET` | Segredo da API do Cloudinary | Sim (para usar Cloudinary) |
| `CLOUDINARY_FOLDER` | Pasta onde as imagens serão armazenadas | Não (padrão: `praxeo/products`) |

## Recursos do Cloudinary

### Otimização Automática

O Cloudinary otimiza automaticamente as imagens:
- **Qualidade**: Ajuste automático para melhor qualidade/tamanho
- **Formato**: Conversão automática para WebP quando suportado
- **Compressão**: Redução inteligente do tamanho do arquivo

### Transformações

Você pode aplicar transformações nas URLs:

```javascript
// Exemplo: Redimensionar imagem para 800x600
const url = cloudinary.url(publicId, {
  width: 800,
  height: 600,
  crop: 'fill'
});
```

## Migração de Local para Cloudinary

Se você já tem imagens armazenadas localmente e quer migrar para Cloudinary:

1. Configure o Cloudinary
2. As novas imagens serão enviadas para a nuvem
3. Imagens antigas continuarão funcionando localmente
4. (Opcional) Crie um script de migração para enviar imagens antigas

## Troubleshooting

### Erro: "Cloudinary não configurado"

- Verifique se as variáveis de ambiente estão configuradas
- Reinicie o servidor após adicionar as variáveis
- Verifique se não há espaços extras nas variáveis

### Erro: "Invalid API credentials"

- Verifique se as credenciais estão corretas
- Certifique-se de copiar os valores completos (sem espaços)

### Imagens não aparecem

- Verifique se a URL está acessível
- No Cloudinary, verifique se a imagem foi enviada com sucesso
- Verifique os logs do servidor para erros

## Limites do Plano Gratuito

O plano gratuito do Cloudinary oferece:
- 25 GB de armazenamento
- 25 GB de largura de banda por mês
- Transformações ilimitadas
- CDN global

Para projetos maiores, considere um plano pago.

