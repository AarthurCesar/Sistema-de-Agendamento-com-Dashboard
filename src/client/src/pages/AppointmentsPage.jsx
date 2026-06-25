import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const brl = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtDate = (iso) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const isStaff = user?.role === 'admin' || user?.role === 'professional';

  async function load() {
    try {
      const data = await api('/appointments');
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(id, status) {
    try {
      await api(`/appointments/${id}/status`, { method: 'PATCH', body: { status } });
      // Atualiza localmente sem refazer a busca inteira.
      setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch (err) {
      setError(err.message);
    }
  }

  // Ações disponíveis conforme status e papel.
  function actionsFor(a) {
    const btns = [];
    if (isStaff && a.status === 'pending') {
      btns.push(['Confirmar', 'confirmed', 'text-blue-600']);
    }
    if (isStaff && a.status === 'confirmed') {
      btns.push(['Concluir', 'completed', 'text-emerald-600']);
    }
    if (a.status !== 'cancelled' && a.status !== 'completed') {
      btns.push(['Cancelar', 'cancelled', 'text-red-600']);
    }
    return btns;
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-800">📋 Agendamentos</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Data/Hora</th>
              <th className="px-4 py-3 font-medium">Serviço</th>
              {isStaff && <th className="px-4 py-3 font-medium">Cliente</th>}
              <th className="px-4 py-3 font-medium">Profissional</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Nenhum agendamento encontrado.
                </td>
              </tr>
            )}
            {items.map((a) => (
              <tr key={a.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">{fmtDate(a.scheduled_at)}</td>
                <td className="px-4 py-3">{a.service_name}</td>
                {isStaff && <td className="px-4 py-3">{a.client_name}</td>}
                <td className="px-4 py-3 text-slate-500">{a.professional_name || '—'}</td>
                <td className="px-4 py-3">{brl(Number(a.price))}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    {actionsFor(a).map(([label, status, cls]) => (
                      <button
                        key={status}
                        onClick={() => changeStatus(a.id, status)}
                        className={`font-medium hover:underline ${cls}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
