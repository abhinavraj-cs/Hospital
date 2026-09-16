import { createBrowserRouter, RouterProvider, Outlet, Navigate, NavLink } from 'react-router';
import { Toaster } from 'sonner';
import { useAuthStore } from '../features/auth/authStore';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { socketService } from '../services/socket.service';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Pages
import { Dashboard } from '../features/dashboard/Dashboard';
import { SearchPage } from '../features/search/SearchPage';
import { NavigationMap } from '../features/navigation/NavigationMap';
import { Login } from '../features/auth/Login';
import { EmergencyPage } from '../features/emergency/EmergencyPage';
import { ScanPage } from '../features/qr/ScanPage';
import { DoctorsPage } from '../features/doctors/DoctorsPage';
import { DoctorDetailPage } from '../features/doctors/DoctorDetailPage';
import { DoctorDashboard } from '../features/doctors/DoctorDashboard';
import { QueueStatusPage } from '../features/queues/QueueStatusPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { AdminDashboard } from '../features/admin/AdminDashboard';
import { PatientDashboard } from '../features/patient/PatientDashboard';

// ─── Root Layout ─────────────────────────────────────────────────────────────
const RootLayout = () => {
  const { isAuthenticated, user, tokens } = useAuthStore();
  const { t } = useTranslation();

  // Connect Socket.IO on auth state change
  useEffect(() => {
    socketService.connect(tokens?.accessToken);
    return () => { socketService.disconnect(); };
  }, [isAuthenticated, tokens?.accessToken]);

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-sky-600' : 'text-slate-600 hover:text-sky-600'}`;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans antialiased flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4 mx-auto justify-between max-w-7xl">
          <a className="flex items-center space-x-2 shrink-0" href="/">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-sm">
              <span className="font-bold text-white text-xl leading-none">C</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">CityCare</span>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={navCls}>Home</NavLink>
            <NavLink to="/doctors" className={navCls}>Doctors</NavLink>
            <NavLink to="/navigate" className={navCls}>Map</NavLink>
            <NavLink to="/search" className={navCls}>Search</NavLink>
            <NavLink to="/emergency" className={navCls}>Emergency</NavLink>
            {isAuthenticated && user?.role === 'DOCTOR' && (
              <NavLink to="/doctor" className={navCls}>Dashboard</NavLink>
            )}
            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <NavLink to="/admin" className={navCls}>Admin</NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <NavLink
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700"
              >
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">
                  {user?.name?.[0] || '?'}
                </div>
                {user?.name?.split(' ')[0]}
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 rounded-full text-white text-sm font-medium transition-all shadow-sm"
              >
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto relative z-10">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t z-40 flex">
        {[
          { to: '/', label: 'Home', icon: '🏠' },
          { to: '/doctors', label: 'Doctors', icon: '👨‍⚕️' },
          { to: '/navigate', label: 'Map', icon: '🗺️' },
          { to: '/scan', label: 'Scan', icon: '📷' },
          { to: '/emergency', label: 'SOS', icon: '🚨' },
        ].map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${isActive ? 'text-sky-600' : 'text-slate-500'}`
          }>
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Toaster position="top-right" richColors />
    </div>
  );
};

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'login', element: <Login /> },
      { path: 'navigate', element: <NavigationMap /> },
      { path: 'emergency', element: <EmergencyPage /> },
      { path: 'scan', element: <ScanPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'doctors', element: <DoctorsPage /> },
      { path: 'doctors/:id', element: <DoctorDetailPage /> },
      { path: 'queue/:id', element: <QueueStatusPage /> },
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
      {
        path: 'doctor',
        element: <ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>,
      },
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
