-- Script para ativar PostGIS após instalação
-- Execute este script após instalar PostGIS via Stack Builder

-- Conectar ao banco de dados (execute manualmente: \c praxeo_db)
-- Ou crie o banco se ainda não existe:
-- CREATE DATABASE praxeo_db;

-- Criar extensão PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verificar versão instalada
SELECT PostGIS_version() AS versao_postgis;

-- Testar funcionalidade básica
SELECT 
  ST_MakePoint(-46.6333, -23.5505) AS ponto_sao_paulo,
  'PostGIS funcionando!' AS status;

-- Se tudo funcionar, você verá:
-- ✅ versao_postgis: "3.6.1" (ou similar)
-- ✅ ponto_sao_paulo: um objeto geométrico
-- ✅ status: "PostGIS funcionando!"


