import { useEffect, useState } from 'react';
import { api, downloadFile } from '../api/client.js';
import StatCard from '../components/StatCard.jsx';
import RevenueChart from '../components/RevenueChart.jsx';
import TopServicesChart from '../components/TopServicesChart.jsx';

const brl = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const pct = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 }).format(v);

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [s, r, t] = await Promise.all([
          api('/dashboard/summary'),
          api('/dashboard/revenue?months=6'),
          api('/dashboard/top-services?limit=5'),
        ]);
        setSummary(s);
        setRevenue(r);
        setTopServices(t);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  async function handleExport(path, filename) {
    try {
      await downloadFile(path, filename);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Barra de ações: exportações */}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={() => handleExport('/reports/appointments.csv', 'agendamentos.csv')}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          ⬇️ Agendamentos (CSV)
        </button>
        <button
          onClick={() => handleExport('/reports/revenue.csv', 'faturamento.csv')}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          ⬇️ Faturamento (CSV)
        </button>
      </div>

      {/* Cartões de resumo */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Faturamento do mês"
          value={summary ? brl(summary.revenueCurrentMonth) : '—'}
          accent="green"
        />
        <StatCard label="Total de agendamentos" value={summary?.totalAppointments ?? '—'} />
        <StatCard label="Pendentes" value={summary?.pending ?? '—'} accent="amber" />
        <StatCard
          label="Taxa de cancelamento"
          value={summary ? pct(summary.cancellationRate) : '—'}
          accent="red"
        />
      </section>

      {/* Gráficos */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={revenue} />
        <TopServicesChart data={topServices} />
      </section>
    </div>
  );
}
