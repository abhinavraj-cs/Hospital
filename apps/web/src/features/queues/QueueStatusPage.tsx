import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queuesApi } from '../../services/api.service';
import { useAuthStore } from '../auth/authStore';
import { socketService } from '../../services/socket.service';
import { motion } from 'framer-motion';
import { Users, Clock, Hash, CheckCircle, RefreshCw } from 'lucide-react';

export function QueueStatusPage() {
  const { id: doctorId } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: queue, isLoading: queueLoading, refetch } = useQuery({
    queryKey: ['queue', doctorId],
    queryFn: () => queuesApi.getDoctorQueue(doctorId!),
    enabled: !!doctorId,
    refetchInterval: 20000,
  });

  const { data: position, isLoading: posLoading } = useQuery({
    queryKey: ['queue-position', doctorId, user?.id],
    queryFn: () => queuesApi.getPosition(doctorId!, user!.id),
    enabled: !!doctorId && !!user?.id,
    refetchInterval: 20000,
  });

  // Real-time updates
  useEffect(() => {
    const unsub = socketService.on('queue.updated', (data: any) => {
      if (data.doctorId === doctorId) {
        queryClient.invalidateQueries({ queryKey: ['queue', doctorId] });
        queryClient.invalidateQueries({ queryKey: ['queue-position', doctorId] });
      }
    });

    const unsubCalled = socketService.on('queue.patient.called', (data: any) => {
      if (data.doctorId === doctorId && data.patientId === user?.id) {
        // Show toast notification
        queryClient.invalidateQueries({ queryKey: ['queue', doctorId] });
      }
    });

    return () => {
      if (typeof unsub === 'function') unsub();
      if (typeof unsubCalled === 'function') unsubCalled();
    };
  }, [doctorId, user?.id, queryClient]);

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-10">
      <h1 className="text-2xl font-bold text-slate-900">Queue Status</h1>

      {/* Current Token Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border shadow-sm p-8 text-center"
      >
        <p className="text-sm text-slate-500 uppercase tracking-wider mb-4">Now Serving</p>
        <div className="text-8xl font-black text-sky-600 tabular-nums leading-none">
          {queueLoading ? '—' : `#${queue?.currentNumber ?? 0}`}
        </div>
        <div className="mt-6 flex justify-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{queue?.waitingCount ?? 0}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Users className="h-3 w-3" /> Waiting</div>
          </div>
          <div className="w-px bg-slate-100" />
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              ~{((queue?.waitingCount ?? 0) * (queue?.averageConsultationTime ?? 15))}m
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Clock className="h-3 w-3" /> Est. Wait</div>
          </div>
        </div>
      </motion.div>

      {/* Patient's Position */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border p-6 ${
            position ? 'bg-sky-50 border-sky-200' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <h2 className="font-semibold text-slate-700 flex items-center gap-2 mb-4">
            <Hash className="h-4 w-4" /> Your Position
          </h2>
          {posLoading ? (
            <div className="animate-pulse h-16 bg-white rounded-xl" />
          ) : position ? (
            <div className="flex gap-6 items-center">
              <div className="text-center">
                <div className="text-5xl font-black text-sky-700">#{position.tokenNumber}</div>
                <div className="text-xs text-sky-600 mt-1">Your Token</div>
              </div>
              <div className="flex-1 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Position in queue</span>
                  <span className="font-bold">{position.position} of {position.totalWaiting}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated wait</span>
                  <span className="font-bold">{position.estimatedWaitMinutes} min</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-sky-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, 100 - (position.position / Math.max(1, position.totalWaiting)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">You are not currently in this queue.</p>
          )}
        </motion.div>
      )}

      {/* Refresh Button */}
      <button
        onClick={() => refetch()}
        className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
      >
        <RefreshCw className="h-4 w-4" /> Refresh Status
      </button>

      {/* Completed notice */}
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
        <CheckCircle className="h-5 w-5 shrink-0" />
        <span>You will be notified in real-time when your token is called.</span>
      </div>
    </div>
  );
}
