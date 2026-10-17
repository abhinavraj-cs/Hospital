import React from 'react';
import { NavLink } from 'react-router';
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore } from '@/features/auth/authStore';
import { useQueueTrackerStore } from '@/features/queues/queueTrackerStore';

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

export function Navbar() {
  const { isAuthenticated, user } = useAuthStore();
  const { roleView, setRoleView, language, setLanguage } = useQueueTrackerStore();
  const { lang, setLang, t } = useLanguage();

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-sky-600'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center px-4 mx-auto justify-between max-w-7xl">
        {/* Brand Logo */}
        <a
          className="flex items-center space-x-2 shrink-0"
          href={isAuthenticated && user ? getRoleDashboardPath(user.role) : '/'}
        >
          <img
            src="/logo-white.png"
            alt="ArogyaMitra Logo"
            className="w-10 h-10 rounded-lg object-cover shadow-sm"
          />
          <span className="font-bold text-xl tracking-tight text-slate-900">
            ArogyaMitra
          </span>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated && user ? (
            <>
              {user.role === 'PATIENT' && (
                <NavLink to="/patient" className={navCls}>
                  My Dashboard
                </NavLink>
              )}
              {user.role === 'DOCTOR' && (
                <NavLink to="/doctor" className={navCls}>
                  My Dashboard
                </NavLink>
              )}
              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                <NavLink to="/admin" className={navCls}>
                  Admin Panel
                </NavLink>
              )}
            </>
          ) : (
            <NavLink to="/" end className={navCls}>
              {t('home')}
            </NavLink>
          )}

          <NavLink to="/multi-queue" className={navCls}>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t('queueSystem')}
            </span>
          </NavLink>

          <NavLink to="/doctors" className={navCls}>
            Doctors
          </NavLink>
          <NavLink to="/navigate" className={navCls}>
            Map
          </NavLink>
          <NavLink to="/search" className={navCls}>
            Search
          </NavLink>
          <NavLink to="/emergency" className={navCls}>
            {t('emergency')}
          </NavLink>
        </nav>

        {/* Action Controls: Language & Role Views */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
          {/* Language Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden text-sm font-medium">
            <button
              type="button"
              onClick={() => {
                setLang('en');
                setLanguage('en');
              }}
              className={`px-3 py-1 transition-colors ${
                lang === 'en'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => {
                setLang('hi');
                setLanguage('hi');
              }}
              className={`px-3 py-1 transition-colors ${
                lang === 'hi'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Role Toggle: [Patient View] | [Staff View] | [Public Display] */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-medium shadow-inner">
            <button
              type="button"
              onClick={() => setRoleView('patient')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                roleView === 'patient'
                  ? 'bg-white text-sky-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👤</span>
              <span className="hidden sm:inline">{t('patientView')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleView('staff')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                roleView === 'staff'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👨‍⚕️</span>
              <span className="hidden sm:inline">{t('staffView')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleView('display')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                roleView === 'display'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📺</span>
              <span className="hidden sm:inline">{t('publicDisplay')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
