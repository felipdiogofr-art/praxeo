# 📊 Scripts de Banco de Dados - Praxeo.tech

Este diretório contém os scripts SQL para criação e configuração do banco de dados.

## 📁 Arquivos

### `schema.sql`
Script SQL completo para criar todas as tabelas, relacionamentos, índices e triggers do banco de dados.

## 🚀 Como Usar

### Opção 1: Via psql (Recomendado)

```bash
# Conectar ao banco e executar o script
psql -U postgres -d praxeo_db_local -f schema.sql
```

### Opção 2: Via pgAdmin ou DBeaver

1. Abra o arquivo `schema.sql` no editor
2. Conecte-se ao banco `praxeo_db_local`
3. Execute todo o script

### Opção 3: Via Node.js (usando o script create-tables.js)

```bash
cd backend
npm run db:create-tables
```

## 📋 O que o Schema Cria

### 1. Extensões
- **PostGIS**: Extensão para suporte a geolocalização

### 2. Tipos ENUM
- `user_role`: 'owner' ou 'renter'
- `product_condition`: 'new', 'like_new', 'good', 'fair', 'poor'
- `reservation_status`: 'pending', 'confirmed', 'active', 'completed', 'cancelled'

### 3. Tabelas

#### `users`
- Armazena informações dos usuários (proprietários e locatários)
- Campos: id, name, email, password, phone, role, created_at, updated_at

#### `products`
- Armazena equipamentos médicos disponíveis para aluguel
- Campos: id, user_id, title, description, category, price, condition, location (PostGIS), address, cep, images, availability, created_at, updated_at

#### `reservations`
- Armazena reservas de equipamentos
- Campos: id, product_id, user_id, start_date, end_date, total_price, status, created_at, updated_at

#### `reviews`
- Armazena avaliações de produtos pelos usuários
- Campos: id, product_id, user_id, reservation_id, rating, comment, created_at, updated_at

### 4. Relacionamentos (Foreign Keys)
- `products.user_id` → `users.id` (CASCADE)
- `reservations.product_id` → `products.id` (CASCADE)
- `reservations.user_id` → `users.id` (CASCADE)
- `reviews.product_id` → `products.id` (CASCADE)
- `reviews.user_id` → `users.id` (CASCADE)
- `reviews.reservation_id` → `reservations.id` (SET NULL)

### 5. Índices

#### Índices B-Tree
- `users`: email, role
- `products`: user_id, category, availability
- `reservations`: product_id, user_id, status, (start_date, end_date)
- `reviews`: product_id, user_id, reservation_id, rating

#### Índices Espaciais (GIST)
- `products.location`: Índice espacial para buscas por geolocalização

#### Índices Únicos
- `reviews(user_id, product_id)`: Garante que um usuário só pode avaliar um produto uma vez

### 6. Triggers
- Atualização automática do campo `updated_at` em todas as tabelas

## ⚠️ Importante

1. **PostGIS**: Certifique-se de que o PostGIS está instalado antes de executar o script
2. **Backup**: Sempre faça backup antes de executar em produção
3. **Permissões**: O usuário do banco precisa ter permissões para criar extensões, tabelas e índices

## 🔍 Verificações Pós-Execução

Após executar o script, verifique:

```sql
-- Verificar tabelas criadas
\dt

-- Verificar índices
\di

-- Verificar extensões
SELECT * FROM pg_extension WHERE extname = 'postgis';

-- Verificar foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

## 🐛 Troubleshooting

### Erro: "extension postgis does not exist"
**Solução**: Instale o PostGIS no PostgreSQL primeiro.

### Erro: "permission denied to create extension"
**Solução**: Execute como superusuário (postgres) ou conceda permissões.

### Erro: "relation already exists"
**Solução**: O script usa `CREATE TABLE IF NOT EXISTS`, mas se houver conflitos, você pode precisar dropar as tabelas primeiro.

---

**Última atualização**: 2025-01-06

