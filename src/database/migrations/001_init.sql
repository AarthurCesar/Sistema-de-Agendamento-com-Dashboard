-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Usuários: clientes, profissionais e administradores
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'client'
                CHECK (role IN ('client', 'professional', 'admin')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Serviços oferecidos
CREATE TABLE IF NOT EXISTS services (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(120)  NOT NULL,
  duration_minutes INTEGER       NOT NULL CHECK (duration_minutes > 0),
  price            NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES users(id) ON DELETE SET NULL,
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para consultas do dashboard e listagens
CREATE INDEX IF NOT EXISTS idx_appointments_client       ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional  ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at  ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status        ON appointments(status);
