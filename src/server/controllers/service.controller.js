import { query } from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

// GET /api/services
export async function listServices(_req, res, next) {
  try {
    const result = await query(
      'SELECT id, name, duration_minutes, price FROM services ORDER BY name',
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/services  (admin)
export async function createService(req, res, next) {
  try {
    const { name, duration_minutes, price } = req.body;

    if (!name || !duration_minutes || price == null) {
      throw createError(400, 'Nome, duração e preço são obrigatórios');
    }

    const result = await query(
      `INSERT INTO services (name, duration_minutes, price)
       VALUES ($1, $2, $3)
       RETURNING id, name, duration_minutes, price`,
      [name, duration_minutes, price],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/services/:id  (admin)
export async function deleteService(req, res, next) {
  try {
    const result = await query('DELETE FROM services WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) throw createError(404, 'Serviço não encontrado');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
