import { createBrowserRouter, RouterProvider, Outlet, Navigate, NavLink } from 'react-router';
import { Toaster } from 'sonner';
import { useAuthStore } from '../features/auth/authStore';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { socketService } from '../services/socket.service';
import { useEffect } from 'react';

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

// ─── Role Dashboard Path Helper ───────────────────────────────────────────────
function getRoleDashboardPath(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/admin';
    case 'DOCTOR':
      return '/doctor';
    case 'STAFF':
      return '/staff';
    case 'PATIENT':
    default:
      return '/patient';
  }
}

// ─── Root Layout ─────────────────────────────────────────────────────────────
const RootLayout = () => {
  const { isAuthenticated, user, tokens, _hasHydrated } = useAuthStore();

  // Connect Socket.IO on auth state change
  useEffect(() => {
    if (tokens?.accessToken) {
      socketService.connect(tokens.accessToken);
    }
    return () => { socketService.disconnect(); };
  }, [tokens?.accessToken]);

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-sky-600' : 'text-slate-600 hover:text-sky-600'}`;

  // Show loading while hydrating
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans antialiased flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4 mx-auto justify-between max-w-7xl">
          <a className="flex items-center space-x-2 shrink-0" href={isAuthenticated && user ? getRoleDashboardPath(user.role) : '/'}>
            <img src="/logo-white.png" alt="ArogyaMitra Logo" className="w-10 h-10 rounded-lg object-cover shadow-sm" />
            <span className="font-bold text-xl tracking-tight text-slate-900">ArogyaMitra</span>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {/* Role-specific Dashboard Link */}
            {isAuthenticated && user ? (
              <>
                {user.role === 'PATIENT' && (
                  <NavLink to="/patient" className={navCls}>My Dashboard</NavLink>
                )}
                {user.role === 'DOCTOR' && (
                  <NavLink to="/doctor" className={navCls}>My Dashboard</NavLink>
                )}
                {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                  <NavLink to="/admin" className={navCls}>Admin Panel</NavLink>
                )}
              </>
            ) : (
              <NavLink to="/" end className={navCls}>Home</NavLink>
            )}
            <NavLink to="/doctors" className={navCls}>Doctors</NavLink>
            <NavLink to="/navigate" className={navCls}>Map</NavLink>
            <NavLink to="/search" className={navCls}>Search</NavLink>
            <NavLink to="/emergency" className={navCls}>Emergency</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <NavLink
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium text-slate-700"
              >
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">
                  {user.name?.[0] || '?'}
                </div>
                {user.name?.split(' ')[0]}
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
        {/* Role-specific dashboard for mobile */}
        {isAuthenticated && user ? (
          <>
            {user.role === 'PATIENT' && (
              <NavLink to="/patient" className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${isActive ? 'text-sky-600' : 'text-slate-500'}`
              }>
                <span className="text-xl">🏠</span>
                Home
              </NavLink>
            )}
            {user.role === 'DOCTOR' && (
              <NavLink to="/doctor" className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${isActive ? 'text-sky-600' : 'text-slate-500'}`
              }>
                <span className="text-xl">👨‍⚕️</span>
                Dashboard
              </NavLink>
            )}
            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
              <NavLink to="/admin" className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${isActive ? 'text-sky-600' : 'text-slate-500'}`
              }>
                <span className="text-xl">⚙️</span>
                Admin
              </NavLink>
            )}
          </>
        ) : (
          <NavLink to="/" end className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${isActive ? 'text-sky-600' : 'text-slate-500'}`
          }>
            <span className="text-xl">🏠</span>
            Home
          </NavLink>
        )}
        {[
          { to: '/doctors', label: 'Doctors', icon: '👨‍⚕️' },
          { to: '/navigate', label: 'Map', icon: '🗺️' },
          { to: '/scan', label: 'Scan', icon: '📷' },
          { to: '/emergency', label: 'SOS', icon: '🚨' },
        ].map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) =>
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
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  
  // Show loading while hydrating from localStorage
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }
  
  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Authenticated but user data not yet loaded - show loading
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }
  
  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard if they try to access wrong role's page
    const redirectPath = getRoleDashboardPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
};

// ─── Home Redirect Component ──────────────────────────────────────────────────
const HomeRedirect = () => {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  
  // Show loading while hydrating
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }
  
  // If logged in with user data, redirect to role-specific dashboard
  if (isAuthenticated && user) {
    const dashboardPath = getRoleDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }
  
  // If not logged in, show the general dashboard (landing page)
  return <Dashboard />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Home route - redirects based on role or shows landing page
      { index: true, element: <HomeRedirect /> },
      
      // Public routes
      { path: 'login', element: <Login /> },
      { path: 'navigate', element: <NavigationMap /> },
      { path: 'emergency', element: <EmergencyPage /> },
      { path: 'scan', element: <ScanPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'doctors', element: <DoctorsPage /> },
      { path: 'doctors/:id', element: <DoctorDetailPage /> },
      { path: 'queue/:id', element: <QueueStatusPage /> },
      
      // Protected profile route (any authenticated user)
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
      
      // Patient Dashboard (PATIENT role only)
      {
        path: 'patient',
        element: <ProtectedRoute allowedRoles={['PATIENT']}><PatientDashboard /></ProtectedRoute>,
      },
      
      // Doctor Dashboard (DOCTOR role only)
      {
        path: 'doctor',
        element: <ProtectedRoute allowedRoles={['DOCTOR']}><DoctorDashboard /></ProtectedRoute>,
      },
      
      // Admin Dashboard (ADMIN and SUPER_ADMIN roles)
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>,
      },
      
      // Staff Dashboard (STAFF role - placeholder for now)
      {
        path: 'staff',
        element: <ProtectedRoute allowedRoles={['STAFF']}><PatientDashboard /></ProtectedRoute>,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
