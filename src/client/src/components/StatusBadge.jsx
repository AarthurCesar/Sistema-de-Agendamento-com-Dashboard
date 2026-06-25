const STYLES = {
  pending: { label: 'Pendente', cls: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmado', cls: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Concluído', cls: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelado', cls: 'bg-red-100 text-red-700' },
};

export default function StatusBadge({ status }) {
  const s = STYLES[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>
  );
}
