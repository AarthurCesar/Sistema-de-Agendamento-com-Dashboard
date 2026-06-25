import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Calendar from '../components/Calendar.jsx';

const brl = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

// Formata uma Date para 'YYYY-MM-DD' em horário local (sem deslocar p/ UTC).
const toYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function BookingPage() {
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);

  const [serviceId, setServiceId] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Carrega serviços e profissionais uma vez.
  useEffect(() => {
    async function load() {
      try {
        const [s, p] = await Promise.all([api('/services'), api('/users/professionals')]);
        setServices(s);
        setProfessionals(p);
      } catch (err) {
        setFeedback({ type: 'error', message: err.message });
      }
    }
    load();
  }, []);

  // Busca disponibilidade sempre que muda o dia ou o profissional.
  useEffect(() => {
    if (!selectedDate) return;
    setSelectedTime('');
    setLoadingSlots(true);
    const params = new URLSearchParams({ date: toYMD(selectedDate) });
    if (professionalId) params.set('professionalId', professionalId);

    api(`/appointments/availability?${params}`)
      .then((data) => setSlots(data.slots))
      .catch((err) => setFeedback({ type: 'error', message: err.message }))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, professionalId]);

  // Para o dia de hoje, desabilita horários que já passaram.
  function isPastSlot(time) {
    if (!selectedDate) return false;
    const now = new Date();
    const isToday = toYMD(selectedDate) === toYMD(now);
    if (!isToday) return false;
    const [h] = time.split(':').map(Number);
    return h <= now.getHours();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    if (!serviceId || !selectedDate || !selectedTime) {
      setFeedback({ type: 'error', message: 'Selecione serviço, dia e horário.' });
      return;
    }

    setSubmitting(true);
    try {
      const [h, m] = selectedTime.split(':').map(Number);
      const dt = new Date(selectedDate);
      dt.setHours(h, m, 0, 0);

      await api('/appointments', {
        method: 'POST',
        body: {
          service_id: serviceId,
          professional_id: professionalId || null,
          scheduled_at: dt.toISOString(),
        },
      });

      setFeedback({ type: 'success', message: 'Agendamento criado com sucesso! 🎉' });
      setSelectedTime('');
      // Recarrega slots para refletir o horário recém-ocupado.
      setSelectedDate(new Date(selectedDate));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-xl font-bold text-slate-800">🗓️ Novo Agendamento</h1>

      {feedback && (
        <div
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
        {/* Serviço e profissional */}
        <div className="grid gap-4 sm:grid-cols-2">
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
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendário + horários */}
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Escolha o dia</label>
            <Calendar value={selectedDate} onChange={setSelectedDate} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Horário</label>
            {!selectedDate ? (
              <p className="text-sm text-slate-400">Selecione um dia para ver os horários.</p>
            ) : loadingSlots ? (
              <p className="text-sm text-slate-400">Carregando horários...</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => {
                  const disabled = !slot.available || isPastSlot(slot.time);
                  const selected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`rounded-lg border py-2 text-sm transition ${
                        selected
                          ? 'border-indigo-600 bg-indigo-600 font-semibold text-white'
                          : disabled
                            ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through'
                            : 'border-slate-300 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Agendando...' : 'Confirmar agendamento'}
        </button>
      </form>
    </div>
  );
}
