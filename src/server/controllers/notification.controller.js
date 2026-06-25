import { query } from '../config/db.js';

// GET /api/notifications
// Lista as notificações enviadas (mais recentes primeiro). Restrito a admin.
export async function listNotifications(_req, res, next) {
  try {
    const result = await query(`
      SELECT n.id, n.recipient, n.message, n.status, n.provider, n.error,
             n.created_at, u.name AS user_name
      FROM notifications n
      LEFT JOIN users u ON u.id = n.user_id
      ORDER BY n.created_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}
