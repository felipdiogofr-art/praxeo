-- Migration: Adicionar campo monthly_price à tabela products
-- Data: 2024
-- Descrição: Adiciona suporte a aluguel mensal além do aluguel diário

-- Verificar se a coluna já existe antes de adicionar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'monthly_price'
    ) THEN
        -- Adicionar coluna monthly_price (opcional, pode ser NULL)
        ALTER TABLE products 
        ADD COLUMN monthly_price DECIMAL(10, 2) NULL;
    END IF;
END $$;

-- Verificar se a constraint já existe antes de adicionar
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_monthly_price_positive'
        AND table_name = 'products'
    ) THEN
        -- Adicionar constraint para garantir que monthly_price seja positivo se não for NULL
        ALTER TABLE products
        ADD CONSTRAINT products_monthly_price_positive 
        CHECK (monthly_price IS NULL OR monthly_price > 0);
    END IF;
END $$;

-- Adicionar comentário na coluna
COMMENT ON COLUMN products.monthly_price IS 'Preço mensal de aluguel (R$) - opcional, usado para períodos >= 30 dias. Deve ser menor que 30 × preço diário para oferecer desconto.';

-- Criar índice para buscas por preço mensal (opcional, mas pode ser útil)
CREATE INDEX IF NOT EXISTS idx_products_monthly_price 
ON products(monthly_price) 
WHERE monthly_price IS NOT NULL;

