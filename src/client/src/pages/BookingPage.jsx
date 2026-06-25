import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const brl = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function BookingPage() {
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);

  const [serviceId, setServiceId] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  const [feedback, setFeedback] = useState(null); // { type, message }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [s, p] = await Promise.all([
          api('/services'),
          api('/users/professionals'),
        ]);
        setServices(s);
        setProfessionals(p);
      } catch (err) {
        setFeedback({ type: 'error', message: err.message });
      }
    }
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    try {
      await api('/appointments', {
        method: 'POST',
        body: {
          service_id: serviceId,
          professional_id: professionalId || null,
          // datetime-local não tem timezone; converte para ISO.
          scheduled_at: new Date(scheduledAt).toISOString(),
        },
      });
      setFeedback({ type: 'success', message: 'Agendamento criado com sucesso! 🎉' });
      setServiceId('');
      setProfessionalId('');
      setScheduledAt('');
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-xl font-bold text-slate-800">🗓️ Novo Agendamento</h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
        {feedback && (
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Serviço</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Selecione um serviço</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {brl(Number(s.price))} ({s.duration_minutes} min)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Profissional <span className="text-slate-400">(opcional)</span>
          </label>
          <select
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Sem preferência</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Data e hora</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? 'Agendando...' : 'Confirmar agendamento'}
        </button>
      </form>
    </div>
  );
}
