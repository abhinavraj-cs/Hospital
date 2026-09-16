import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorsApi, queuesApi } from '../../services/api.service';
import { useAuthStore } from '../auth/authStore';
import { motion } from 'framer-motion';
import { Users, SkipForward, CheckCheck, PhoneCall, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { socketService } from '../../services/socket.service';

export function DoctorDashboard() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Find doctor record for logged-in user
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsApi.list(),
    enabled: !!user,
  });

  const myDoctor = doctors.find((d: any) => d.user?.email === user?.email);
  const doctorId = myDoctor?.id;

  const { data: queue, isLoading } = useQuery({
    queryKey: ['queue', doctorId],
    queryFn: () => queuesApi.getDoctorQueue(doctorId!),
    enabled: !!doctorId,
    refetchInterval: 15000,
  });

  useEffect(() => {
    const unsub = socketService.on('queue.updated', (data: any) => {
      if (data.doctorId === doctorId) {
        queryClient.invalidateQueries({ queryKey: ['queue', doctorId] });
      }
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [doctorId, queryClient]);

  const callNextMutation = useMutation({
    mutationFn: () => queuesApi.callNext(doctorId!),
    onSuccess: (entry) => {
      toast.success(`Called Token #${entry.tokenNumber}`);
      queryClient.invalidateQueries({ queryKey: ['queue', doctorId] });
    },
    onError: (err: any) => toast.error(err.message || 'Queue is empty'),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => doctorsApi.updateStatus(doctorId!, status),
    onSuccess: (_, status) => {
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const currentStatus = myDoctor?.availabilityStatus;

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="clinical-header-gradient p-8 rounded-[20px] border border-slate-100"
      >
        <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
        <p className="text-slate-500">Welcome, Dr. {user?.name?.split(' ').pop()}</p>
      </motion.div>

      {/* Status Control */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="font-semibold text-slate-700 mb-4">My Availability</h2>
        <div className="flex flex-wrap gap-3">
          {['AVAILABLE', 'BUSY', 'ON_LEAVE'].map(s => (
            <button
              key={s}
              onClick={() => statusMutation.mutate(s)}
              disabled={statusMutation.isPending || currentStatus === s}
              className={`px-4 py-2 rounded-xl font-medium text-sm border-2 transition-all ${
                currentStatus === s
                  ? s === 'AVAILABLE' ? 'bg-emerald-500 text-white border-emerald-500'
                    : s === 'BUSY' ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-slate-400 text-white border-slate-400'
                  : 'border-slate-200 text-slate-600 hover:border-sky-300'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Management */}
      {doctorId && (
        <div className="bg-white rounded-2xl border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2"><Users className="h-5 w-5" /> Queue Management</h2>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${queue?.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {queue?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {isLoading ? (
            <div className="animate-pulse h-24 bg-slate-100 rounded-xl" />
          ) : (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-sky-50 rounded-xl p-4">
                <div className="text-3xl font-black text-sky-700">#{queue?.currentNumber ?? 0}</div>
                <div className="text-xs text-sky-600 mt-1">Current Token</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="text-3xl font-black text-amber-700">{queue?.waitingCount ?? 0}</div>
                <div className="text-xs text-amber-600 mt-1 flex items-center justify-center gap-1"><Users className="h-3 w-3" /> Waiting</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-3xl font-black text-slate-700">{queue?.averageConsultationTime ?? 15}m</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1"><Clock className="h-3 w-3" /> Avg. Time</div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => callNextMutation.mutate()}
              disabled={callNextMutation.isPending || !queue?.waitingCount || !queue?.isActive}
              className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              <PhoneCall className="h-5 w-5" />
              {callNextMutation.isPending ? 'Calling...' : 'Call Next Patient'}
            </button>
            {queue?.waitingCount === 0 && (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <AlertCircle className="h-4 w-4" /> Queue empty
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
