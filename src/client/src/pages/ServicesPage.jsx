import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const brl = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setServices(await api('/services'));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const created = await api('/services', {
        method: 'POST',
        body: {
          name,
          duration_minutes: Number(duration),
          price: Number(price),
        },
      });
      setServices((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setDuration('');
      setPrice('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir este serviço?')) return;
    try {
      await api(`/services/${id}`, { method: 'DELETE' });
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-slate-800">✂️ Serviços</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Formulário de novo serviço */}
      <form
        onSubmit={handleCreate}
        className="mb-6 grid grid-cols-1 gap-3 rounded-2xl bg-white p-5 shadow-sm sm:grid-cols-4"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Nome do serviço"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:col-span-2"
        />
        <input
          type="number"
          min="1"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
          placeholder="Duração (min)"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          placeholder="Preço (R$)"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60 sm:col-span-4"
        >
          {saving ? 'Salvando...' : '+ Adicionar serviço'}
        </button>
      </form>

      {/* Lista de serviços */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Serviço</th>
              <th className="px-4 py-3 font-medium">Duração</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Nenhum serviço cadastrado.
                </td>
              </tr>
            )}
            {services.map((s) => (
              <tr key={s.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-medium text-slate-700">{s.name}</td>
                <td className="px-4 py-3 text-slate-500">{s.duration_minutes} min</td>
                <td className="px-4 py-3">{brl(Number(s.price))}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="font-medium text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
