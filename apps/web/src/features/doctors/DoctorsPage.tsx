import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorsApi, queuesApi } from '../../services/api.service';
import { socketService } from '../../services/socket.service';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MapPin, Clock, Users, ChevronRight, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; dot: string }> = {
  AVAILABLE: { color: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Available', dot: 'bg-emerald-500' },
  BUSY: { color: 'text-amber-700', bg: 'bg-amber-50', label: 'In Consultation', dot: 'bg-amber-500' },
  ON_LEAVE: { color: 'text-slate-500', bg: 'bg-slate-100', label: 'On Leave', dot: 'bg-slate-400' },
};

export function DoctorsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsApi.list(),
    refetchInterval: 30000,
  });

  // Live real-time updates
  useEffect(() => {
    const unsub = socketService.on('doctor.status.updated', (data: any) => {
      queryClient.setQueryData(['doctors'], (old: any[]) =>
        old?.map(d => d.id === data.doctorId
          ? { ...d, availabilityStatus: data.status }
          : d
        )
      );
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [queryClient]);

  const filtered = doctors.filter((d: any) => {
    const name = d.user?.name?.toLowerCase() || '';
    const spec = d.specialization?.toLowerCase() || '';
    const dept = d.department?.name?.toLowerCase() || '';
    const matchSearch = !search || name.includes(search.toLowerCase()) || spec.includes(search.toLowerCase()) || dept.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || d.availabilityStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="clinical-header-gradient p-8 rounded-[20px] border border-slate-100 shadow-sm"
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Doctor Directory</h1>
        <p className="text-slate-500">Live availability updates — no refresh needed.</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-white focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 outline-none transition-all text-sm"
            placeholder="Search by name, specialization, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          {['ALL', 'AVAILABLE', 'BUSY', 'ON_LEAVE'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                statusFilter === s
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No doctors found</p>
          <p className="text-sm">Try adjusting your search or filter</p>
        </div>
      ) : (
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
        >
          <AnimatePresence>
            {filtered.map((doctor: any) => {
              const cfg = STATUS_CONFIG[doctor.availabilityStatus] || STATUS_CONFIG.ON_LEAVE;
              const queue = doctor.queues?.[0];
              return (
                <motion.div
                  key={doctor.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="clinical-card cursor-pointer group"
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow">
                      {doctor.user?.name?.[0] || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                        {doctor.user?.name || 'Dr. Unknown'}
                      </h3>
                      <p className="text-sm text-slate-500 truncate">{doctor.specialization}</p>
                      <p className="text-xs text-slate-400 truncate">{doctor.department?.name}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-sky-500 transition-colors shrink-0 mt-1" />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${doctor.availabilityStatus === 'AVAILABLE' ? 'animate-pulse' : ''}`} />
                      {cfg.label}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {queue && (
                        <>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {queue.waitingCount}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ~{queue.waitingCount * queue.averageConsultationTime}m</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      className="flex-1 text-xs py-1.5 bg-sky-50 text-sky-700 rounded-lg font-medium hover:bg-sky-100 transition-colors flex items-center justify-center gap-1"
                      onClick={e => { e.stopPropagation(); navigate(`/doctors/${doctor.id}`); }}
                    >
                      View Profile
                    </button>
                    <button
                      className="flex-1 text-xs py-1.5 bg-slate-50 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
                      onClick={e => { e.stopPropagation(); navigate(`/navigate?to=${doctor.roomId || ''}`); }}
                    >
                      <MapPin className="h-3 w-3" /> Navigate
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
