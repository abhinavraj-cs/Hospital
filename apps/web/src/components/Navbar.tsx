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
  const { roleView, setRoleView, setLanguage } = useQueueTrackerStore();
  const { lang, setLang, t } = useLanguage();

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold transition-colors duration-150 ${
      isActive
        ? 'text-[#3E36B0] font-bold border-b-2 border-[#3E36B0] pb-1'
        : 'text-[#4B5563] hover:text-[#3E36B0]'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#A6DEF7]/50 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="container flex h-16 items-center px-4 mx-auto justify-between max-w-7xl">
        {/* Brand Logo */}
        <a
          className="flex items-center space-x-2.5 shrink-0 group"
          href={isAuthenticated && user ? getRoleDashboardPath(user.role) : '/'}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#3E36B0] flex items-center justify-center shadow-md shadow-[#3E36B0]/20 p-1.5 transition-transform group-hover:scale-105">
            <img
              src="/logo-white.png"
              alt="ArogyaMitra Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-[#111111] block leading-none">
              ArogyaMitra
            </span>
            <span className="text-[10px] font-semibold text-[#3E36B0] uppercase tracking-wider block mt-0.5">
              Smart Hospital Queue
            </span>
          </div>
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
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B8B8E] animate-pulse"></span>
              <span>{t('queueSystem')}</span>
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
          <NavLink to="/emergency" className={({ isActive }) => 
            `text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              isActive
                ? 'bg-[#DC2626] text-white shadow-xs'
                : 'bg-red-50 text-[#DC2626] hover:bg-red-100 border border-red-200/80'
            }`
          }>
            <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse inline-block"></span>
            <span>{t('emergency')}</span>
          </NavLink>
        </nav>

        {/* Action Controls: Language & Role Views */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Language Toggle: Active fills with #3E36B0, inactive with #F1F5F9 */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-2xl border border-slate-200 text-xs font-semibold shadow-xs">
            <button
              type="button"
              onClick={() => {
                setLang('en');
                setLanguage('en');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all duration-150 ${
                lang === 'en'
                  ? 'bg-[#3E36B0] text-white font-bold shadow-xs'
                  : 'text-[#111111] hover:bg-white/70'
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
              className={`px-3 py-1.5 rounded-xl transition-all duration-150 ${
                lang === 'hi'
                  ? 'bg-[#3E36B0] text-white font-bold shadow-xs'
                  : 'text-[#111111] hover:bg-white/70'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Role Toggle: [Patient View] | [Staff View] | [Public Display] */}
          <div className="flex items-center bg-[#F1F5F9] p-1 rounded-2xl border border-slate-200 text-xs font-semibold shadow-xs">
            <button
              type="button"
              onClick={() => setRoleView('patient')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 ${
                roleView === 'patient'
                  ? 'bg-[#3E36B0] text-white shadow-xs font-bold'
                  : 'text-[#111111] hover:bg-white/70'
              }`}
            >
              <span>👤</span>
              <span className="hidden sm:inline">{t('patientView')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleView('staff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 ${
                roleView === 'staff'
                  ? 'bg-[#1B8B8E] text-white shadow-xs font-bold'
                  : 'text-[#111111] hover:bg-white/70'
              }`}
            >
              <span>👨‍⚕️</span>
              <span className="hidden sm:inline">{t('staffView')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleView('display')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 ${
                roleView === 'display'
                  ? 'bg-[#002BFF] text-white shadow-xs font-bold'
                  : 'text-[#111111] hover:bg-white/70'
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
