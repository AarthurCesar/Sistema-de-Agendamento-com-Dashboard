import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import AppointmentsPage from './pages/AppointmentsPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';

// Protege rotas que exigem autenticação (e opcionalmente papéis específicos).
function RequireAuth({ roles, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="grid h-screen place-items-center text-slate-500">Carregando...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

// Redireciona para a tela inicial conforme o papel.
function HomeRedirect() {
  const { user } = useAuth();
  const target = user?.role === 'client' ? '/agendar' : '/dashboard';
  return <Navigate to={target} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route
          path="/dashboard"
          element={
            <RequireAuth roles={['admin', 'professional']}>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/agendar"
          element={
            <RequireAuth roles={['client']}>
              <BookingPage />
            </RequireAuth>
          }
        />
        <Route path="/agendamentos" element={<AppointmentsPage />} />
        <Route
          path="/servicos"
          element={
            <RequireAuth roles={['admin']}>
              <ServicesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/notificacoes"
          element={
            <RequireAuth roles={['admin']}>
              <NotificationsPage />
            </RequireAuth>
          }
        />
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
