# ✅ Após Instalar PostGIS - Próximos Passos

## 🎉 Parabéns!

Você instalou o **PostGIS 3.6.1 Bundle para PostgreSQL 17**. Agora vamos configurar o banco de dados.

## 📋 Passo a Passo

### 1. Verificar se o PostGIS foi instalado corretamente

Abra o terminal e execute:

```bash
psql -U postgres
```

Depois execute:

```sql
-- Verificar se PostGIS está disponível
SELECT PostGIS_version();
```

**Resultado esperado**: Deve retornar algo como `"3.6.1"` ou `"3.6"`

Se funcionar, o PostGIS está instalado! ✅

### 2. Criar o banco de dados (se ainda não criou)

```sql
CREATE DATABASE praxeo_db_local;
```

### 3. Ativar PostGIS no banco de dados

```sql
-- Conectar ao banco criado
\c praxeo_db

-- Criar a extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verificar novamente
SELECT PostGIS_version();
```

**Resultado esperado**: Deve retornar a versão do PostGIS novamente.

### 4. Testar funcionalidades básicas

```sql
-- Testar criação de um ponto geográfico
SELECT ST_MakePoint(-46.6333, -23.5505) AS sao_paulo;

-- Testar cálculo de distância (deve retornar um número)
SELECT ST_Distance(
  ST_MakePoint(-46.6333, -23.5505),  -- São Paulo
  ST_MakePoint(-43.1729, -22.9068)   -- Rio de Janeiro
) AS distancia_km;
```

Se todos os comandos funcionarem sem erro, está tudo configurado! 🎉

## 🚀 Próximos Passos

Agora você pode:

1. **Iniciar o servidor backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. O servidor deve iniciar **sem avisos sobre PostGIS** e você verá:
   ```
   ✅ PostGIS extension initialized (version: 3.6.1)
   ```

3. **Continuar com o desenvolvimento**:
   - Implementar autenticação (Fase 1.2)
   - Criar modelos de dados com campos geográficos
   - Implementar busca por geolocalização

## 🐛 Troubleshooting

### Erro: "extension postgis does not exist"
- Verifique se o PostGIS foi instalado completamente pelo Stack Builder
- Reinicie o PostgreSQL se necessário
- Verifique se instalou a versão correta (PostgreSQL 17)

### Erro: "permission denied"
- Execute o psql como administrador
- Ou verifique as permissões do usuário postgres

### PostGIS não aparece no SELECT
- Certifique-se de estar conectado ao banco correto (`\c praxeo_db`)
- Verifique se executou `CREATE EXTENSION postgis;` no banco correto

## ✅ Checklist Final

- [X] PostGIS instalado via Stack Builder
- [X] `SELECT PostGIS_version();` retorna versão
- [X] Banco `praxeo_db` criado
- [X] Extensão PostGIS criada no banco
- [X] Testes básicos funcionando
- [ ] Servidor backend inicia sem avisos de PostGIS

---

**Dica**: Anote a versão do PostGIS retornada para referência futura!


