import { query } from '../config/db.js';

// GET /api/dashboard/summary
// Cartões de visão geral: faturamento do mês, total de agendamentos e taxa de cancelamento.
export async function getSummary(_req, res, next) {
  try {
    const result = await query(`
      SELECT
        COUNT(*)                                              AS total_appointments,
        COUNT(*) FILTER (WHERE a.status = 'cancelled')        AS cancelled,
        COUNT(*) FILTER (WHERE a.status = 'completed')        AS completed,
        COUNT(*) FILTER (WHERE a.status = 'pending')          AS pending,
        COALESCE(SUM(s.price) FILTER (
          WHERE a.status = 'completed'
            AND date_trunc('month', a.scheduled_at) = date_trunc('month', now())
        ), 0)                                                 AS revenue_current_month
      FROM appointments a
      JOIN services s ON s.id = a.service_id
    `);

    const row = result.rows[0];
    const total = Number(row.total_appointments);
    const cancelled = Number(row.cancelled);

    res.json({
      totalAppointments: total,
      completed: Number(row.completed),
      pending: Number(row.pending),
      cancelled,
      cancellationRate: total > 0 ? Number((cancelled / total).toFixed(4)) : 0,
      revenueCurrentMonth: Number(row.revenue_current_month),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/revenue?months=6
// Faturamento por mês (concluídos) para o gráfico de linha/barra.
export async function getRevenueByMonth(req, res, next) {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months, 10) || 6, 1), 24);

    const result = await query(
      `
      SELECT
        to_char(date_trunc('month', a.scheduled_at), 'YYYY-MM') AS month,
        COALESCE(SUM(s.price), 0)                               AS revenue,
        COUNT(*)                                                AS appointments
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      WHERE a.status = 'completed'
        AND a.scheduled_at >= date_trunc('month', now()) - ($1::int - 1) * interval '1 month'
      GROUP BY 1
      ORDER BY 1
      `,
      [months],
    );

    res.json(
      result.rows.map((r) => ({
        month: r.month,
        revenue: Number(r.revenue),
        appointments: Number(r.appointments),
      })),
    );
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/top-services?limit=5
// Serviços mais procurados (ranking) para o gráfico de barras.
export async function getTopServices(req, res, next) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 5, 1), 20);

    const result = await query(
      `
      SELECT s.name,
             COUNT(a.id)               AS total,
             COALESCE(SUM(s.price) FILTER (WHERE a.status = 'completed'), 0) AS revenue
      FROM services s
      LEFT JOIN appointments a ON a.service_id = s.id
      GROUP BY s.id, s.name
      ORDER BY total DESC, s.name
      LIMIT $1
      `,
      [limit],
    );

    res.json(
      result.rows.map((r) => ({
        name: r.name,
        total: Number(r.total),
        revenue: Number(r.revenue),
      })),
    );
  } catch (err) {
    next(err);
  }
}
