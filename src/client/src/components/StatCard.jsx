export default function StatCard({ label, value, accent = 'indigo' }) {
  const accents = {
    indigo: 'text-indigo-600',
    green: 'text-emerald-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accents[accent]}`}>{value}</p>
    </div>
  );
}
