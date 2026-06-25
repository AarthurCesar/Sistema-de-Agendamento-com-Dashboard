import { query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

const VALID_STATUS = ['pending', 'confirmed', 'completed', 'cancelled'];

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

    res.status(201).json(result.rows[0]);
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
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}
