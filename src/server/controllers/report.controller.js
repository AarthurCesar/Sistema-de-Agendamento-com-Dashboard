import { query } from '../config/db.js';

const TZ = process.env.APP_TIMEZONE || 'America/Sao_Paulo';

// Escapa um valor para CSV (aspas duplas quando há ; , aspas ou quebra de linha).
function csvCell(value) {
  const s = value == null ? '' : String(value);
  if (/[";\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// Monta o CSV a partir de cabeçalhos e linhas, com BOM para o Excel ler acentos.
function toCsv(headers, rows) {
  const lines = [headers.join(';')];
  for (const row of rows) {
    lines.push(row.map(csvCell).join(';'));
  }
  return '﻿' + lines.join('\r\n');
}

function sendCsv(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

const STATUS_LABEL = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

// GET /api/reports/appointments.csv
// Relatório completo de agendamentos.
export async function appointmentsReport(_req, res, next) {
  try {
    const result = await query(`
      SELECT
        to_char(a.scheduled_at AT TIME ZONE $1, 'DD/MM/YYYY HH24:MI') AS data_hora,
        s.name AS servico,
        c.name AS cliente,
        COALESCE(p.name, '-') AS profissional,
        s.price AS valor,
        a.status
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      JOIN users c ON c.id = a.client_id
      LEFT JOIN users p ON p.id = a.professional_id
      ORDER BY a.scheduled_at DESC
    `, [TZ]);

    const headers = ['Data/Hora', 'Serviço', 'Cliente', 'Profissional', 'Valor (R$)', 'Status'];
    const rows = result.rows.map((r) => [
      r.data_hora,
      r.servico,
      r.cliente,
      r.profissional,
      Number(r.valor).toFixed(2).replace('.', ','),
      STATUS_LABEL[r.status] ?? r.status,
    ]);

    sendCsv(res, 'agendamentos.csv', toCsv(headers, rows));
  } catch (err) {
    next(err);
  }
}

// GET /api/reports/revenue.csv
// Faturamento por mês (agendamentos concluídos).
export async function revenueReport(_req, res, next) {
  try {
    const result = await query(`
      SELECT
        to_char(date_trunc('month', a.scheduled_at AT TIME ZONE $1), 'MM/YYYY') AS mes,
        COUNT(*) AS concluidos,
        COALESCE(SUM(s.price), 0) AS faturamento
      FROM appointments a
      JOIN services s ON s.id = a.service_id
      WHERE a.status = 'completed'
      GROUP BY 1, date_trunc('month', a.scheduled_at AT TIME ZONE $1)
      ORDER BY date_trunc('month', a.scheduled_at AT TIME ZONE $1)
    `, [TZ]);

    const headers = ['Mês', 'Agendamentos Concluídos', 'Faturamento (R$)'];
    const rows = result.rows.map((r) => [
      r.mes,
      r.concluidos,
      Number(r.faturamento).toFixed(2).replace('.', ','),
    ]);

    sendCsv(res, 'faturamento.csv', toCsv(headers, rows));
  } catch (err) {
    next(err);
  }
}
