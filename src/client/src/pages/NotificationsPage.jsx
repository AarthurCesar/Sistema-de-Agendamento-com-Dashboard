import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const fmtDate = (iso) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/notifications')
      .then(setItems)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-800">📱 Notificações (WhatsApp)</h1>
      <p className="mb-6 text-sm text-slate-500">
        Registro das mensagens enviadas aos clientes ao criar, confirmar ou cancelar agendamentos.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Quando</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Mensagem</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Nenhuma notificação enviada ainda.
                </td>
              </tr>
            )}
            {items.map((n) => (
              <tr key={n.id} className="border-b border-slate-50 align-top last:border-0">
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {fmtDate(n.created_at)}
                </td>
                <td className="px-4 py-3">{n.user_name || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{n.recipient || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{n.message}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      n.status === 'sent'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {n.status === 'sent' ? 'Enviada' : 'Falhou'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Provider atual definido em <code>WHATSAPP_PROVIDER</code> (.env). No modo <code>mock</code>,
        as mensagens são apenas registradas (veja o console do servidor).
      </p>
    </div>
  );
}
