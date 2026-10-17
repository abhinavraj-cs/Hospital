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
    `text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 ${
      isActive
        ? 'text-[#3E36B0] font-bold border-b-2 border-[#3E36B0] pb-0.5'
        : 'text-[#4B5563] hover:text-[#3E36B0]'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#A6DEF7]/50 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Main Nav Container: h-16 flex items-center justify-between gap-2 overflow-hidden flex-nowrap */}
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-2 overflow-hidden flex-nowrap">
        {/* Brand Logo - shrink-0 with ample right margin to cleanly separate from 'होम' */}
        <a
          className="flex items-center space-x-2.5 shrink-0 mr-4 md:mr-6 group select-none"
          href={isAuthenticated && user ? getRoleDashboardPath(user.role) : '/'}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#3E36B0] flex items-center justify-center shadow-md shadow-[#3E36B0]/20 p-1.5 transition-transform group-hover:scale-105 shrink-0">
            <img
              src="/logo-white.png"
              alt="ArogyaMitra Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="shrink-0">
            <span className="font-extrabold text-xl tracking-tight text-[#111111] block leading-none whitespace-nowrap">
              ArogyaMitra
            </span>
            <span className="text-[10px] font-semibold text-[#3E36B0] uppercase tracking-wider block mt-0.5 whitespace-nowrap">
              Smart Hospital Queue
            </span>
          </div>
        </a>

        {/* Navigation Links - Hidden on small mobile, visible on desktop with whitespace-nowrap */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 overflow-hidden flex-nowrap shrink">
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
            <span className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B8B8E] animate-pulse shrink-0"></span>
              <span className="whitespace-nowrap">{t('queueSystem')}</span>
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
          <NavLink
            to="/emergency"
            className={({ isActive }) =>
              `text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#DC2626] text-white shadow-xs'
                  : 'bg-red-50 text-[#DC2626] hover:bg-red-100 border border-red-200/80'
              }`
            }
          >
            <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse inline-block shrink-0"></span>
            <span className="whitespace-nowrap">{t('emergency')}</span>
          </NavLink>
        </nav>

        {/* Action Controls: Language Toggle & Role Views in a single horizontal flex-nowrap row with shrink-0 */}
        <div className="flex items-center gap-2 shrink-0 flex-nowrap justify-end">
          {/* Language Toggle: Active fills with #3E36B0, inactive with #F1F5F9; tight padding px-2.5 py-1 text-xs */}
          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-xl border border-slate-200 text-xs font-semibold shadow-xs shrink-0 flex-nowrap">
            <button
              type="button"
              onClick={() => {
                setLang('en');
                setLanguage('en');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all duration-150 ${
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
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all duration-150 ${
                lang === 'hi'
                  ? 'bg-[#3E36B0] text-white font-bold shadow-xs'
                  : 'text-[#111111] hover:bg-white/70'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Role Toggle: [Patient View] | [Staff View] | [Public Display] in a single horizontal row with tight padding px-2.5 py-1 text-xs */}
          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-xl border border-slate-200 text-xs font-semibold shadow-xs shrink-0 flex-nowrap">
            <button
              type="button"
              onClick={() => setRoleView('patient')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all duration-150 ${
                roleView === 'patient'
                  ? 'bg-[#3E36B0] text-white shadow-xs font-bold'
                  : 'text-[#111111] hover:bg-white/70'
              }`}
            >
              <span className="shrink-0">👤</span>
              <span className="whitespace-nowrap hidden sm:inline">{t('patientView')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleView('staff')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all duration-150 ${
                roleView === 'staff'
                  ? 'bg-[#1B8B8E] text-white shadow-xs font-bold'
                  : 'text-[#111111] hover:bg-white/70'
              }`}
            >
              <span className="shrink-0">👨‍⚕️</span>
              <span className="whitespace-nowrap hidden sm:inline">{t('staffView')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleView('display')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all duration-150 ${
                roleView === 'display'
                  ? 'bg-[#002BFF] text-white shadow-xs font-bold'
                  : 'text-[#111111] hover:bg-white/70'
              }`}
            >
              <span className="shrink-0">📺</span>
              <span className="whitespace-nowrap hidden sm:inline">{t('publicDisplay')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
