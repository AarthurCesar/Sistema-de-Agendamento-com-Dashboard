import { query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';
import { notifyAppointment } from '../services/notifications/index.js';

const VALID_STATUS = ['pending', 'confirmed', 'completed', 'cancelled'];

// Configuração de horário de funcionamento (slots de 1h).
const TZ = process.env.APP_TIMEZONE || 'America/Sao_Paulo';
const OPEN_HOUR = 9; // 09:00
const CLOSE_HOUR = 18; // último slot às 17:00

// GET /api/appointments/availability?professionalId=&date=YYYY-MM-DD
// Retorna os horários do dia marcando quais estão ocupados para o profissional.
export async function getAvailability(req, res, next) {
  try {
    const { professionalId, date } = req.query;
    if (!date) throw createError(400, 'Parâmetro "date" (YYYY-MM-DD) é obrigatório');

    let occupied = new Set();
    if (professionalId) {
      const result = await query(
        `SELECT to_char(scheduled_at AT TIME ZONE $1, 'HH24:MI') AS time
         FROM appointments
         WHERE professional_id = $2
           AND (scheduled_at AT TIME ZONE $1)::date = $3::date
           AND status <> 'cancelled'`,
        [TZ, professionalId, date],
      );
      occupied = new Set(result.rows.map((r) => r.time));
    }

    const slots = [];
    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
      const time = `${String(h).padStart(2, '0')}:00`;
      slots.push({ time, available: !occupied.has(time) });
    }

    res.json({ date, slots });
  } catch (err) {
    next(err);
  }
}

// GET /api/appointments
// Admin/profissional veem todos; cliente vê apenas os seus.
export async function listAppointments(req, res, next) {
  try {
    const { role, id } = req.user;

    const base = `
      SELECT a.id, a.scheduled_at, a.status,
             s.name AS service_name, s.price,
             c.name AS client_name,
             p.name AS professional_name
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      JOIN users c ON c.id = a.client_id
      LEFT JOIN users p ON p.id = a.professional_id
    `;

    let result;
    if (role === 'client') {
      result = await query(`${base} WHERE a.client_id = $1 ORDER BY a.scheduled_at DESC`, [id]);
    } else if (role === 'professional') {
      result = await query(`${base} WHERE a.professional_id = $1 ORDER BY a.scheduled_at DESC`, [id]);
    } else {
      result = await query(`${base} ORDER BY a.scheduled_at DESC`);
    }

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/appointments
export async function createAppointment(req, res, next) {
  try {
    const { service_id, professional_id, scheduled_at } = req.body;
    const client_id = req.user.id;

    if (!service_id || !scheduled_at) {
      throw createError(400, 'Serviço e horário são obrigatórios');
    }

    // Impede conflito: mesmo profissional no mesmo horário (não cancelado).
    if (professional_id) {
      const conflict = await query(
        `SELECT id FROM appointments
         WHERE professional_id = $1 AND scheduled_at = $2 AND status <> 'cancelled'`,
        [professional_id, scheduled_at],
      );
      if (conflict.rowCount > 0) {
        throw createError(409, 'Horário já preenchido para este profissional');
      }
    }

    const result = await query(
      `INSERT INTO appointments (client_id, professional_id, service_id, scheduled_at, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING id, client_id, professional_id, service_id, scheduled_at, status`,
      [client_id, professional_id || null, service_id, scheduled_at],
    );

    const appointment = result.rows[0];

    // Notifica o cliente (fire-and-forget: não bloqueia nem quebra a resposta).
    notifyAppointment(appointment.id, 'created').catch(console.error);

    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/appointments/:id/status
export async function updateAppointmentStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!VALID_STATUS.includes(status)) {
      throw createError(400, `Status inválido. Use: ${VALID_STATUS.join(', ')}`);
    }

    const result = await query(
      `UPDATE appointments SET status = $1 WHERE id = $2
       RETURNING id, status, scheduled_at`,
      [status, req.params.id],
    );

    if (result.rowCount === 0) throw createError(404, 'Agendamento não encontrado');

    // Notifica o cliente quando confirmado ou cancelado.
    if (status === 'confirmed' || status === 'cancelled') {
      notifyAppointment(req.params.id, status).catch(console.error);
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}
