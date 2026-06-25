import { query } from '../config/db.js';

// GET /api/users/professionals
// Lista os profissionais disponíveis para o cliente escolher ao agendar.
export async function listProfessionals(_req, res, next) {
  try {
    const result = await query(
      `SELECT id, name FROM users WHERE role = 'professional' ORDER BY name`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}
