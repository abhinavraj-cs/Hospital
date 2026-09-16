import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, doctorsApi, departmentsApi } from '../../services/api.service';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Stethoscope, Building2, BarChart3, ClipboardList,
  Edit2, Save, X, CheckCircle, AlertCircle, Search
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border p-6 shadow-sm"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="text-3xl font-black text-slate-900">{value ?? '—'}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </motion.div>
  );
}

// ─── Edit Doctor Modal ──────────────────────────────────────────────────────
function EditDoctorModal({ doctor, departments, onClose, onSave }: any) {
  const [form, setForm] = useState({
    specialization: doctor.specialization || '',
    consultationStart: doctor.consultationStart || '09:00',
    consultationEnd: doctor.consultationEnd || '17:00',
    departmentId: doctor.departmentId || '',
    availabilityStatus: doctor.availabilityStatus || 'AVAILABLE',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-slate-900">Edit Doctor — {doctor.user?.name}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              value={form.specialization}
              onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              value={form.departmentId}
              onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
            >
              {departments?.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
              <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                value={form.consultationStart}
                onChange={e => setForm(f => ({ ...f, consultationStart: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
              <input type="time" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                value={form.consultationEnd}
                onChange={e => setForm(f => ({ ...f, consultationEnd: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
              value={form.availabilityStatus}
              onChange={e => setForm(f => ({ ...f, availabilityStatus: e.target.value }))}
            >
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">Cancel</button>
          <button
            onClick={() => onSave(doctor.id, form)}
            className="flex-1 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────
function OverviewTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
    refetchInterval: 30000,
  });

  const statCards = [
    { label: 'Total Doctors', value: stats?.totalDoctors, icon: Stethoscope, color: 'bg-sky-500' },
    { label: 'Available Now', value: stats?.availableDoctors, icon: CheckCircle, color: 'bg-emerald-500' },
    { label: 'Total Patients', value: stats?.totalPatients, icon: Users, color: 'bg-indigo-500' },
    { label: 'Departments', value: stats?.totalDepartments, icon: Building2, color: 'bg-amber-500' },
    { label: 'Active Queues', value: stats?.activeQueues, icon: ClipboardList, color: 'bg-rose-500' },
    { label: 'Waiting Patients', value: stats?.waitingPatients, icon: AlertCircle, color: 'bg-orange-500' },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {isLoading
        ? [...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse h-32" />)
        : statCards.map(card => <StatCard key={card.label} {...card} />)
      }
    </div>
  );
}

// ─── Doctors Tab ───────────────────────────────────────────────────────────
function DoctorsTab() {
  const queryClient = useQueryClient();
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [search, setSearch] = useState('');

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsApi.list(),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => adminApi.updateDoctor(id, data),
    onSuccess: () => {
      toast.success('Doctor updated successfully');
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      setEditingDoctor(null);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update'),
  });

  const filtered = doctors.filter((d: any) => {
    const q = search.toLowerCase();
    return !q || d.user?.name?.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q) || d.department?.name?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            placeholder="Search doctors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl border p-4 h-16" />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                {['Doctor', 'Specialization', 'Department', 'Schedule', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((doctor: any) => (
                <tr key={doctor.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {doctor.user?.name?.[0] || 'D'}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{doctor.user?.name}</div>
                        <div className="text-xs text-slate-400">{doctor.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{doctor.specialization}</td>
                  <td className="py-3 px-4 text-slate-600">{doctor.department?.name}</td>
                  <td className="py-3 px-4 text-slate-600 text-xs">{doctor.consultationStart} – {doctor.consultationEnd}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doctor.availabilityStatus === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' :
                      doctor.availabilityStatus === 'BUSY' ? 'bg-amber-50 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {doctor.availabilityStatus?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setEditingDoctor(doctor)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">No doctors found</div>
          )}
        </div>
      )}

      {editingDoctor && (
        <EditDoctorModal
          doctor={editingDoctor}
          departments={departments}
          onClose={() => setEditingDoctor(null)}
          onSave={(id: string, data: any) => updateMutation.mutate({ id, data })}
        />
      )}
    </div>
  );
}

// ─── Queue Overview Tab ─────────────────────────────────────────────────────
function QueuesTab() {
  const { data: queues = [], isLoading } = useQuery({
    queryKey: ['admin-queue-overview'],
    queryFn: adminApi.getQueueOverview,
    refetchInterval: 15000,
  });

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border p-6 h-32" />)}
        </div>
      ) : queues.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No active queues right now</p>
        </div>
      ) : (
        queues.map((queue: any) => (
          <div key={queue.id} className="bg-white rounded-2xl border p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900">{queue.doctor?.user?.name}</h3>
                <p className="text-sm text-slate-500">{queue.doctor?.department?.name}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-sky-600">#{queue.currentNumber}</div>
                <div className="text-xs text-slate-500">Current Token</div>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-slate-600 mb-4">
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {queue.waitingCount ?? queue.entries?.length ?? 0} waiting</span>
              <span>Avg {queue.averageConsultationTime}m/patient</span>
            </div>
            {queue.entries?.length > 0 && (
              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Waiting Patients</p>
                {queue.entries.map((entry: any) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
                        #{entry.tokenNumber}
                      </span>
                      <span className="text-slate-700">{entry.patient?.user?.name || 'Patient'}</span>
                    </div>
                    <span className="text-xs text-slate-400">{entry.patient?.user?.phone || ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ─── Users Tab ─────────────────────────────────────────────────────────────
function UsersTab() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  });
  const [search, setSearch] = useState('');

  const filtered = users.filter((u: any) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-50 text-purple-700',
    ADMIN: 'bg-indigo-50 text-indigo-700',
    DOCTOR: 'bg-sky-50 text-sky-700',
    STAFF: 'bg-amber-50 text-amber-700',
    PATIENT: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="h-14 bg-white rounded-xl border" />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                {['Name', 'Email', 'Role', 'Phone', 'Joined'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-slate-500 font-semibold text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">{user.name}</td>
                  <td className="py-3 px-4 text-slate-500">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[user.role] || 'bg-slate-100 text-slate-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{user.phone || '—'}</td>
                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-slate-400 text-sm">No users found</div>}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Dashboard ───────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'queues', label: 'Live Queues', icon: ClipboardList },
  { id: 'users', label: 'Users', icon: Users },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="clinical-header-gradient p-8 rounded-[20px] border border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Admin Control Panel</h1>
            <p className="text-slate-500 text-sm">Manage doctors, queues, and users — live data from Neon DB</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-0 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'doctors' && <DoctorsTab />}
          {activeTab === 'queues' && <QueuesTab />}
          {activeTab === 'users' && <UsersTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
