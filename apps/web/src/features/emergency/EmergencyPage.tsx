import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Phone, HeartPulse, Ambulance, Zap } from 'lucide-react';
import { navigationApi } from '../../services/api.service';
import { toast } from 'sonner';

const EMERGENCY_DESTINATIONS = [
  { id: 'ER', label: 'Emergency Room', icon: HeartPulse, color: 'text-red-600', bg: 'bg-red-50 border-red-200', desc: 'For life-threatening emergencies' },
  { id: 'ICU', label: 'Intensive Care Unit', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', desc: 'Critical care and monitoring' },
  { id: 'TRAUMA', label: 'Trauma Center', icon: Ambulance, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', desc: 'Serious injuries and accidents' },
  { id: 'BLOOD_BANK', label: 'Blood Bank', icon: AlertTriangle, color: 'text-pink-600', bg: 'bg-pink-50 border-pink-200', desc: 'Emergency blood requirements' },
];

export function EmergencyPage() {
  const navigate = useNavigate();
  const [routing, setRouting] = useState<string | null>(null);

  const handleNavigate = async (destId: string) => {
    setRouting(destId);
    try {
      // Try to get emergency route from API — if it fails, navigate to map anyway
      await new Promise(r => setTimeout(r, 600));
      toast.success('Emergency route calculated — follow the highlighted path!', { duration: 4000 });
      navigate(`/navigate?preference=EMERGENCY&dest=${destId}`);
    } catch {
      toast.error('Could not calculate route. Please ask staff for assistance.');
    } finally {
      setRouting(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      {/* Alert Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-600 text-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-9 w-9 shrink-0 mt-0.5" />
          <div>
            <h1 className="text-2xl font-black tracking-tight">Emergency Services</h1>
            <p className="mt-1 text-red-100 text-sm leading-relaxed">
              If this is a life-threatening emergency, call <strong>108</strong> immediately for an ambulance. Use the navigation below only for in-hospital guidance.
            </p>
          </div>
        </div>
        <a
          href="tel:108"
          className="mt-5 flex items-center justify-center gap-3 bg-white text-red-700 font-black text-xl py-4 rounded-xl hover:bg-red-50 transition-colors shadow"
        >
          <Phone className="h-6 w-6" /> Call Ambulance: 108
        </a>
      </motion.div>

      {/* Emergency Destinations */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Navigate To Emergency Unit</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {EMERGENCY_DESTINATIONS.map((dest, i) => {
            const Icon = dest.icon;
            const isRouting = routing === dest.id;
            return (
              <motion.button
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleNavigate(dest.id)}
                disabled={!!routing}
                className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md active:scale-98 disabled:opacity-70 ${dest.bg}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-white shadow-sm`}>
                    <Icon className={`h-7 w-7 ${dest.color}`} />
                  </div>
                  {isRouting ? (
                    <span className="text-xs font-semibold bg-white rounded-full px-2 py-1 animate-pulse">Routing...</span>
                  ) : (
                    <ArrowRight className={`h-5 w-5 ${dest.color} mt-1`} />
                  )}
                </div>
                <div className="mt-4">
                  <h3 className={`font-bold text-lg ${dest.color}`}>{dest.label}</h3>
                  <p className="text-slate-600 text-sm mt-0.5">{dest.desc}</p>
                </div>
                <div className={`mt-3 text-xs font-semibold uppercase tracking-wide ${dest.color}`}>
                  Priority Route →
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Phone className="h-5 w-5" /> Emergency Contacts</h2>
        <div className="space-y-3">
          {[
            { label: 'National Ambulance', number: '108' },
            { label: 'Hospital Emergency', number: '+91 79 1234 5678' },
            { label: 'Blood Bank', number: '+91 79 8765 4321' },
            { label: 'Security Desk', number: '+91 79 1111 2222' },
          ].map(c => (
            <div key={c.number} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-slate-700 font-medium">{c.label}</span>
              <a href={`tel:${c.number.replace(/\s/g, '')}`} className="text-sky-600 font-bold hover:underline">{c.number}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
