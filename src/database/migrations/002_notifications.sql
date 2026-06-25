-- Telefone do usuário (destino das notificações de WhatsApp)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Registro de notificações enviadas (auditoria e visualização)
CREATE TABLE IF NOT EXISTS notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  channel        VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
  recipient      VARCHAR(30),
  message        TEXT        NOT NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('sent', 'failed', 'pending')),
  provider       VARCHAR(20),
  error          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
