import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../auth/authStore';
import { motion } from 'framer-motion';
import { User, Globe, LogOut, ChevronRight, Bell, Shield } from 'lucide-react';
import { voiceService } from '../../services/voice.service';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
];

export function ProfilePage() {
  const { i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  const handleLanguageChange = (code: string) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    voiceService.setLanguage(code);
    localStorage.setItem('preferred_language', code);
    toast.success(`Language changed to ${LANGUAGES.find(l => l.code === code)?.label}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-10">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl border p-8 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg">
          {user?.name?.[0] || <User className="h-8 w-8" />}
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-4">{user?.name || 'Guest'}</h1>
        <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
        {user?.role && (
          <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs font-semibold text-slate-700 border shadow-sm">
            <Shield className="h-3 w-3" /> {user.role.replace('_', ' ')}
          </span>
        )}
      </motion.div>

      {/* Language Settings */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-sky-500" /> Language / भाषा / ભાષા
        </h2>
        <div className="space-y-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                selectedLang === lang.code
                  ? 'border-sky-500 bg-sky-50'
                  : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium text-slate-800">{lang.label}</span>
              </div>
              {selectedLang === lang.code && (
                <span className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center">
                  <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-2xl border divide-y">
        {[
          { icon: Bell, label: 'Notifications', action: () => toast.info('Coming soon') },
          { icon: Shield, label: 'Privacy & Security', action: () => toast.info('Coming soon') },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-slate-400" />
                <span className="text-slate-700 font-medium">{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </button>
          );
        })}
      </div>

      {/* Logout */}
      {user && (
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" /> Sign Out
        </button>
      )}
    </div>
  );
}
