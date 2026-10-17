import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorsApi, queuesApi } from '../../services/api.service';
import { useAuthStore } from '../auth/authStore';
import { socketService } from '../../services/socket.service';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users, ArrowLeft, Stethoscope, Calendar, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: 'Available Now', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  BUSY: { label: 'In Consultation', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ON_LEAVE: { label: 'Not Available', color: 'text-slate-500 bg-slate-50 border-slate-200' },
};

export function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const { data: doctor, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => doctorsApi.get(id!),
    enabled: !!id,
  });

  // Live status updates
  useEffect(() => {
    const unsub = socketService.on('doctor.status.updated', (data: any) => {
      if (data.doctorId === id) {
        queryClient.setQueryData(['doctor', id], (old: any) =>
          old ? { ...old, availabilityStatus: data.status } : old
        );
      }
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [id, queryClient]);

  const joinQueueMutation = useMutation({
    mutationFn: () => queuesApi.join(id!, user?.id || ''),
    onSuccess: (entry) => {
      const receipt = entry?.receipt ?? {
        receiptId: `RCPT-${Date.now()}`,
        tokenNumber: entry?.tokenNumber,
        doctorName: doctor?.user?.name,
        departmentName: doctor?.department?.name,
        roomNumber: doctor?.room?.roomNumber || 'N/A',
        estimatedWaitMinutes: queue?.waitingCount ? queue.waitingCount * (queue.averageConsultationTime || 15) : 0,
      };

      localStorage.setItem('queue-receipt', JSON.stringify({ ...receipt, doctorId: id }));
      toast.success(`Joined queue! Your token: #${entry.tokenNumber}`);
      navigate(`/queue/${id}`);
      queryClient.invalidateQueries({ queryKey: ['doctor', id] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return (
    <div className="max-w-4xl mx-auto animate-pulse space-y-6 p-4">
      <div className="h-6 bg-slate-100 rounded w-1/4" />
      <div className="bg-white rounded-2xl p-8 border h-64" />
    </div>
  );

  if (!doctor) return (
    <div className="text-center py-20 text-slate-400">Doctor not found</div>
  );

  const statusCfg = STATUS_LABELS[doctor.availabilityStatus] || STATUS_LABELS.ON_LEAVE;
  const queue = doctor.queues?.[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Doctors
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border shadow-sm overflow-hidden"
      >
        {/* Hero */}
        <div className="bg-gradient-to-br from-sky-50 to-indigo-50 p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-4xl shadow-lg shrink-0">
            {doctor.user?.name?.[0] || 'D'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{doctor.user?.name}</h1>
            <p className="text-sky-600 font-medium mt-0.5">{doctor.specialization}</p>
            <p className="text-slate-500 text-sm mt-1">{doctor.department?.name} · Room {doctor.room?.roomNumber || '—'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${statusCfg.color}`}>
                <span className={`w-2 h-2 rounded-full ${doctor.availabilityStatus === 'AVAILABLE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {statusCfg.label}
              </span>
              <span className="px-3 py-1.5 rounded-full text-sm bg-slate-100 text-slate-700">
                Emp ID: {doctor.employeeId}
              </span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Schedule</h2>
            <div className="flex items-center gap-3 text-slate-700">
              <Clock className="h-5 w-5 text-sky-500" />
              <span>{doctor.consultationStart} – {doctor.consultationEnd}</span>
            </div>
            {doctor.room && (
              <div className="flex items-center gap-3 text-slate-700">
                <MapPin className="h-5 w-5 text-sky-500" />
                <span>{doctor.room.name}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-slate-700">
              <Stethoscope className="h-5 w-5 text-sky-500" />
              <span>{doctor.department?.name}</span>
            </div>
          </div>

          {queue && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Queue Status</h2>
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Current Token</span>
                  <span className="font-bold text-slate-900">#{queue.currentNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Waiting</span>
                  <span className="font-bold text-slate-900">{queue.waitingCount} patients</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Est. Wait</span>
                  <span className="font-bold text-slate-900">~{queue.waitingCount * queue.averageConsultationTime} min</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex flex-wrap gap-3">
          {isAuthenticated && user?.role === 'PATIENT' && doctor.availabilityStatus === 'AVAILABLE' && (
            <button
              onClick={() => joinQueueMutation.mutate()}
              disabled={joinQueueMutation.isPending}
              className="flex-1 min-w-[140px] bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              {joinQueueMutation.isPending ? 'Joining...' : 'Join Queue'}
            </button>
          )}
          <button
            onClick={() => navigate(`/navigate?to=${doctor.roomId || ''}`)}
            className="flex-1 min-w-[140px] border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <MapPin className="h-4 w-4" /> Navigate Here
          </button>
          {doctor.user?.phone && (
            <a
              href={`tel:${doctor.user.phone}`}
              className="flex-1 min-w-[140px] border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <PhoneCall className="h-4 w-4" /> Call
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
}
