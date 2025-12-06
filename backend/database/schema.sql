-- ============================================================================
-- Script SQL para Criação do Banco de Dados - Praxeo.tech
-- ============================================================================
-- Este script cria todas as tabelas, relacionamentos, índices e extensões
-- necessárias para o funcionamento do marketplace de equipamentos médicos.
--
-- Pré-requisitos:
-- 1. PostgreSQL instalado
-- 2. PostGIS instalado
-- 3. Banco de dados criado (ex: praxeo_db_local)
--
-- Uso:
--   psql -U postgres -d praxeo_db_local -f schema.sql
-- ============================================================================

-- ============================================================================
-- 1. ATIVAR EXTENSÕES
-- ============================================================================

-- Ativar PostGIS para suporte a geolocalização
CREATE EXTENSION IF NOT EXISTS postgis;

-- Verificar versão do PostGIS (opcional, apenas para confirmação)
-- SELECT PostGIS_version();

-- ============================================================================
-- 2. CRIAR TIPOS ENUM
-- ============================================================================

-- Tipo para role do usuário
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'renter');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipo para condição do produto
DO $$ BEGIN
    CREATE TYPE product_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'poor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipo para status da reserva
DO $$ BEGIN
    CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 3. CRIAR TABELAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabela: users
-- Descrição: Armazena informações dos usuários (proprietários e locatários)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'renter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT users_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
    CONSTRAINT users_password_length CHECK (char_length(password) >= 6),
    CONSTRAINT users_phone_length CHECK (phone IS NULL OR (char_length(phone) >= 10 AND char_length(phone) <= 20))
);

-- Comentários na tabela users
COMMENT ON TABLE users IS 'Tabela de usuários do sistema (proprietários e locatários)';
COMMENT ON COLUMN users.id IS 'Identificador único do usuário (UUID)';
COMMENT ON COLUMN users.name IS 'Nome completo do usuário (2-100 caracteres)';
COMMENT ON COLUMN users.email IS 'Email do usuário (único, usado para login)';
COMMENT ON COLUMN users.password IS 'Senha criptografada (hash bcrypt)';
COMMENT ON COLUMN users.phone IS 'Telefone de contato (opcional)';
COMMENT ON COLUMN users.role IS 'Papel do usuário: owner (proprietário) ou renter (locatário)';
COMMENT ON COLUMN users.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN users.updated_at IS 'Data da última atualização';

-- ----------------------------------------------------------------------------
-- Tabela: products
-- Descrição: Armazena informações dos equipamentos médicos disponíveis
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    condition product_condition NOT NULL DEFAULT 'good',
    location GEOMETRY(POINT, 4326),
    address VARCHAR(255),
    cep VARCHAR(10),
    images TEXT[] DEFAULT '{}',
    availability BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_products_user FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT products_title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
    CONSTRAINT products_price_positive CHECK (price > 0),
    CONSTRAINT products_cep_length CHECK (cep IS NULL OR (char_length(cep) >= 8 AND char_length(cep) <= 10))
);

-- Comentários na tabela products
COMMENT ON TABLE products IS 'Tabela de equipamentos médicos disponíveis para aluguel';
COMMENT ON COLUMN products.id IS 'Identificador único do produto (UUID)';
COMMENT ON COLUMN products.user_id IS 'ID do proprietário do produto';
COMMENT ON COLUMN products.title IS 'Título/nome do equipamento (3-200 caracteres)';
COMMENT ON COLUMN products.description IS 'Descrição detalhada do equipamento';
COMMENT ON COLUMN products.category IS 'Categoria do equipamento (ex: Mobilidade, Respiratório)';
COMMENT ON COLUMN products.price IS 'Preço diário de aluguel (R$)';
COMMENT ON COLUMN products.condition IS 'Condição do equipamento: new, like_new, good, fair, poor';
COMMENT ON COLUMN products.location IS 'Coordenadas geográficas (PostGIS Point) - longitude, latitude';
COMMENT ON COLUMN products.address IS 'Endereço completo do equipamento';
COMMENT ON COLUMN products.cep IS 'CEP do endereço';
COMMENT ON COLUMN products.images IS 'Array de URLs das imagens do produto';
COMMENT ON COLUMN products.availability IS 'Indica se o produto está disponível para aluguel';

-- ----------------------------------------------------------------------------
-- Tabela: reservations
-- Descrição: Armazena informações das reservas de equipamentos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    user_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status reservation_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_reservations_product FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT reservations_dates_valid CHECK (end_date > start_date),
    CONSTRAINT reservations_total_price_positive CHECK (total_price > 0)
);

-- Comentários na tabela reservations
COMMENT ON TABLE reservations IS 'Tabela de reservas de equipamentos médicos';
COMMENT ON COLUMN reservations.id IS 'Identificador único da reserva (UUID)';
COMMENT ON COLUMN reservations.product_id IS 'ID do produto reservado';
COMMENT ON COLUMN reservations.user_id IS 'ID do locatário (usuário que fez a reserva)';
COMMENT ON COLUMN reservations.start_date IS 'Data de início do aluguel';
COMMENT ON COLUMN reservations.end_date IS 'Data de término do aluguel';
COMMENT ON COLUMN reservations.total_price IS 'Preço total do aluguel (dias × preço diário)';
COMMENT ON COLUMN reservations.status IS 'Status da reserva: pending, confirmed, active, completed, cancelled';

-- ----------------------------------------------------------------------------
-- Tabela: reviews
-- Descrição: Armazena avaliações de produtos pelos usuários
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    user_id UUID NOT NULL,
    reservation_id UUID,
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) 
        REFERENCES products(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_reservation FOREIGN KEY (reservation_id) 
        REFERENCES reservations(id) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT reviews_rating_range CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT reviews_comment_length CHECK (comment IS NULL OR char_length(comment) <= 1000),
    CONSTRAINT reviews_unique_user_product UNIQUE (user_id, product_id)
);

-- Comentários na tabela reviews
COMMENT ON TABLE reviews IS 'Tabela de avaliações de produtos pelos usuários';
COMMENT ON COLUMN reviews.id IS 'Identificador único da avaliação (UUID)';
COMMENT ON COLUMN reviews.product_id IS 'ID do produto avaliado';
COMMENT ON COLUMN reviews.user_id IS 'ID do usuário que fez a avaliação';
COMMENT ON COLUMN reviews.reservation_id IS 'ID da reserva que originou a avaliação (opcional)';
COMMENT ON COLUMN reviews.rating IS 'Nota da avaliação (1 a 5 estrelas)';
COMMENT ON COLUMN reviews.comment IS 'Comentário da avaliação (máximo 1000 caracteres)';
COMMENT ON CONSTRAINT reviews_unique_user_product ON reviews IS 'Garante que um usuário só pode avaliar um produto uma vez';

-- ============================================================================
-- 4. CRIAR ÍNDICES
-- ============================================================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability);
-- Índice espacial GIST para busca por geolocalização
CREATE INDEX IF NOT EXISTS idx_products_location ON products USING GIST(location);

-- Índices para reservations
CREATE INDEX IF NOT EXISTS idx_reservations_product_id ON reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(start_date, end_date);

-- Índices para reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reservation_id ON reviews(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ============================================================================
-- 5. CRIAR FUNÇÕES E TRIGGERS
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at 
    BEFORE UPDATE ON reservations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. VERIFICAÇÕES FINAIS
-- ============================================================================

-- Verificar se PostGIS está ativo
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'postgis'
    ) THEN
        RAISE EXCEPTION 'PostGIS não está ativo. Execute: CREATE EXTENSION postgis;';
    END IF;
END $$;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Script executado com sucesso!';
    RAISE NOTICE '✅ Tabelas criadas: users, products, reservations, reviews';
    RAISE NOTICE '✅ Índices criados';
    RAISE NOTICE '✅ Triggers configurados';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '1. Verificar se todas as tabelas foram criadas: \dt';
    RAISE NOTICE '2. Verificar índices: \di';
    RAISE NOTICE '3. Testar inserção de dados';
END $$;

