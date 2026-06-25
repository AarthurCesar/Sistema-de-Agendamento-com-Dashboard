import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Itens de navegação com os papéis que podem vê-los.
const NAV = [
  { to: '/dashboard', label: '📊 Dashboard', roles: ['admin', 'professional'] },
  { to: '/agendar', label: '🗓️ Agendar', roles: ['client'] },
  { to: '/agendamentos', label: '📋 Agendamentos', roles: ['admin', 'professional', 'client'] },
  { to: '/servicos', label: '✂️ Serviços', roles: ['admin'] },
  { to: '/notificacoes', label: '📱 Notificações', roles: ['admin'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const links = NAV.filter((item) => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <nav className="flex gap-1">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {user?.name} <span className="text-slate-400">({user?.role})</span>
            </span>
            <button
              onClick={logout}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  );
}
