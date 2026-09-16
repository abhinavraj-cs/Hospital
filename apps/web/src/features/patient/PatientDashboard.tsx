import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorsApi } from '../../services/api.service';
import { useAuthStore } from '../auth/authStore';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Users, ArrowRight, Stethoscope, QrCode } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'text-emerald-600 bg-emerald-50',
  BUSY: 'text-amber-600 bg-amber-50',
  ON_LEAVE: 'text-slate-500 bg-slate-100',
};

export function PatientDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsApi.list(),
    refetchInterval: 30000,
  });

  const available = doctors.filter((d: any) => d.availabilityStatus === 'AVAILABLE');
  const filtered = doctors.filter((d: any) => {
    const q = search.toLowerCase();
    return !q ||
      d.user?.name?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.department?.name?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-16 md:pb-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="clinical-header-gradient rounded-[20px] border p-6 shadow-sm"
      >
        <h1 className="text-2xl font-black text-slate-900">
          Hello, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Find a doctor and join a queue instantly.</p>

        {/* Quick actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => navigate('/navigate')}
            className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            <MapPin className="h-4 w-4" /> Find My Way
          </button>
          <button
            onClick={() => navigate('/scan')}
            className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors"
          >
            <QrCode className="h-4 w-4" /> Scan QR
          </button>
        </div>
      </motion.div>

      {/* Live Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-emerald-700">{available.length}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">Doctors Available</div>
        </div>
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-sky-700">{doctors.length}</div>
          <div className="text-xs text-sky-600 mt-1 font-medium">Total Doctors</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          placeholder="Search doctor, specialty, department..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Doctor List */}
      <div className="space-y-3">
        <h2 className="font-bold text-slate-800">
          {search ? `Results for "${search}"` : 'All Doctors'}
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-4 animate-pulse h-24" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No doctors found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((doctor: any, i: number) => {
              const queue = doctor.queues?.[0];
              return (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl border shadow-sm p-4 cursor-pointer hover:border-sky-200 hover:shadow-md transition-all"
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {doctor.user?.name?.[0] || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight">{doctor.user?.name}</h3>
                          <p className="text-sm text-slate-500">{doctor.specialization}</p>
                          <p className="text-xs text-slate-400">{doctor.department?.name}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-300 shrink-0 mt-1" />
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${STATUS_COLORS[doctor.availabilityStatus] || STATUS_COLORS.ON_LEAVE}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${doctor.availabilityStatus === 'AVAILABLE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          {doctor.availabilityStatus?.replace('_', ' ')}
                        </span>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {queue && (
                            <>
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {queue.waitingCount}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ~{queue.waitingCount * (queue.averageConsultationTime || 15)}m</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
