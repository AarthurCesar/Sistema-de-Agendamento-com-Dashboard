import { query } from '../../config/db.js';
import { mockProvider } from './mock.js';
import { twilioProvider } from './twilio.js';
import { metaProvider } from './meta.js';
import { messages } from './messages.js';

const PROVIDERS = {
  mock: mockProvider,
  twilio: twilioProvider,
  meta: metaProvider,
};

function getProvider() {
  const name = process.env.WHATSAPP_PROVIDER || 'mock';
  return { name, send: PROVIDERS[name] || mockProvider };
}

// Envia uma mensagem de WhatsApp e registra o resultado na tabela notifications.
// NUNCA lança erro: falhas de notificação não devem quebrar o fluxo principal.
export async function sendWhatsApp({ userId = null, appointmentId = null, to, message }) {
  const { name, send } = getProvider();
  let status = 'sent';
  let error = null;

  try {
    if (!to) throw new Error('Destinatário (telefone) ausente');
    await send({ to, message });
  } catch (err) {
    status = 'failed';
    error = err.message;
  }

  try {
    await query(
      `INSERT INTO notifications
         (user_id, appointment_id, channel, recipient, message, status, provider, error)
       VALUES ($1, $2, 'whatsapp', $3, $4, $5, $6, $7)`,
      [userId, appointmentId, to || null, message, status, name, error],
    );
  } catch (e) {
    console.error('Falha ao registrar notificação:', e);
  }

  return { status, error };
}

// Carrega os dados do agendamento e dispara a notificação do tipo informado.
export async function notifyAppointment(appointmentId, type) {
  const { rows } = await query(
    `SELECT a.client_id, a.scheduled_at, u.name, u.phone, s.name AS service
     FROM appointments a
     JOIN users u ON u.id = a.client_id
     JOIN services s ON s.id = a.service_id
     WHERE a.id = $1`,
    [appointmentId],
  );

  const r = rows[0];
  if (!r || !messages[type]) return;

  const message = messages[type]({ name: r.name, service: r.service, when: r.scheduled_at });
  await sendWhatsApp({
    userId: r.client_id,
    appointmentId,
    to: r.phone,
    message,
  });
}
