const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

function getAuthHeaders(): HeadersInit {
  const raw = localStorage.getItem('auth-storage');
  if (!raw) return { 'Content-Type': 'application/json' };
  try {
    const store = JSON.parse(raw);
    const token = store?.state?.tokens?.accessToken;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err?.error?.message || err?.message || 'Request failed');
  }

  const data = await res.json();
  // Unwrap {success, data} envelope if present
  return data?.data !== undefined ? data.data : data;
}

// ─── Doctors ────────────────────────────────────────────────────────────────
export const doctorsApi = {
  list: (params?: { departmentId?: string; status?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/doctors${q ? `?${q}` : ''}`);
  },
  get: (id: string) => request<any>(`/doctors/${id}`),
  updateStatus: (id: string, status: string) =>
    request<any>(`/doctors/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ─── Queues ─────────────────────────────────────────────────────────────────
export const queuesApi = {
  getDoctorQueue: (doctorId: string) => request<any>(`/queues/doctor/${doctorId}`),
  getDepartmentQueues: (deptId: string) => request<any[]>(`/queues/${deptId}`),
  join: (doctorId: string, patientId: string) =>
    request<any>(`/queues/${doctorId}/join`, {
      method: 'POST',
      body: JSON.stringify({ patientId }),
    }),
  callNext: (doctorId: string) =>
    request<any>(`/queues/${doctorId}/next`, { method: 'POST' }),
  complete: (doctorId: string, entryId: string) =>
    request<any>(`/queues/${doctorId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ entryId }),
    }),
  getPosition: (doctorId: string, patientId: string) =>
    request<any>(`/queues/${doctorId}/position/${patientId}`),
};

// ─── Navigation ──────────────────────────────────────────────────────────────
export const navigationApi = {
  getRoute: (from: string, to: string, preference = 'SHORTEST') =>
    request<any>(`/navigation/route?from=${from}&to=${to}&preference=${preference}`),
  getNodes: (floorId?: string) =>
    request<any[]>(`/navigation/nodes${floorId ? `?floorId=${floorId}` : ''}`),
  getEdges: (floorId?: string) =>
    request<any[]>(`/navigation/edges${floorId ? `?floorId=${floorId}` : ''}`),
};

// ─── QR ──────────────────────────────────────────────────────────────────────
export const qrApi = {
  scan: (code: string) =>
    request<any>('/qr/scan', { method: 'POST', body: JSON.stringify({ code }) }),
  list: () => request<any[]>('/qr/locations'),
  generate: (id: string) => `${API_URL}/api/qr/generate/${id}`,
};

// ─── Hospitals ───────────────────────────────────────────────────────────────
export const hospitalsApi = {
  list: () => request<any[]>('/hospitals'),
  get: (id: string) => request<any>(`/hospitals/${id}`),
};

// ─── Departments ─────────────────────────────────────────────────────────────
export const departmentsApi = {
  list: (hospitalId?: string) =>
    request<any[]>(`/departments${hospitalId ? `?hospitalId=${hospitalId}` : ''}`),
  search: (q: string) => request<any[]>(`/departments/search?q=${encodeURIComponent(q)}`),
  get: (id: string) => request<any>(`/departments/${id}`),
};

// ─── Rooms ───────────────────────────────────────────────────────────────────
export const roomsApi = {
  list: (floorId?: string) =>
    request<any[]>(`/rooms${floorId ? `?floorId=${floorId}` : ''}`),
  get: (id: string) => request<any>(`/rooms/${id}`),
};

// ─── Emergency ───────────────────────────────────────────────────────────────
export const emergencyApi = {
  getDestinations: (hospitalId?: string) =>
    request<any[]>(`/emergency/destinations${hospitalId ? `?hospitalId=${hospitalId}` : ''}`),
  getRoute: (from: string, destination: string) =>
    request<any>(`/emergency/route?from=${from}&destination=${destination}`),
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  refresh: (refreshToken: string) =>
    request<any>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => request<any>('/admin/stats'),
  getUsers: () => request<any[]>('/admin/users'),
  getQueueOverview: () => request<any[]>('/admin/queue-overview'),
  updateDoctor: (id: string, data: Record<string, any>) =>
    request<any>(`/doctors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// ─── Multi-Level Queue & Token System (LV1 -> LV5) ───────────────────────────
export const multiQueueApi = {
  getOverviewStats: () => request<any>('/multi-queue/stats'),
  getEncounters: () => request<any[]>('/multi-queue/encounters'),
  getEncounterById: (id: string) => request<any>(`/multi-queue/encounter/${id}`),
  trackToken: (code: string) => request<any>(`/multi-queue/track/${encodeURIComponent(code)}`),
  getStageQueue: (stage: string) => request<any>(`/multi-queue/stage/${stage}`),
  registerPatient: (data: {
    patientName: string;
    phone?: string;
    age?: number;
    gender?: string;
    symptoms?: string;
    doctorId: string;
    isEmergency?: boolean;
    existingPatientId?: string;
  }) => request<any>('/multi-queue/register', { method: 'POST', body: JSON.stringify(data) }),
  updateTokenStatus: (tokenId: string, data: { status: string; notes?: string }) =>
    request<any>(`/multi-queue/token/${tokenId}/status`, { method: 'POST', body: JSON.stringify(data) }),
  processDoctorConsultation: (encounterId: string, data: {
    diagnosis: string;
    notes?: string;
    prescribeMedications?: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
    orderLabTests?: Array<{ testName: string; category?: string; sampleType?: string }>;
    dischargeImmediately?: boolean;
  }) => request<any>(`/multi-queue/consultation/${encounterId}`, { method: 'POST', body: JSON.stringify(data) }),
  dispensePharmacy: (prescriptionId: string, data?: { instructions?: string }) =>
    request<any>(`/multi-queue/pharmacy/dispense/${prescriptionId}`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),
  collectLabSample: (requestId: string) =>
    request<any>(`/multi-queue/lab/collect-sample/${requestId}`, { method: 'POST' }),
  completeLabTest: (requestId: string) =>
    request<any>(`/multi-queue/lab/complete-test/${requestId}`, { method: 'POST' }),
  verifyLabReport: (reportId: string, data: { summary: string; results: string; verifiedBy?: string }) =>
    request<any>(`/multi-queue/lab/verify-report/${reportId}`, { method: 'POST', body: JSON.stringify(data) }),
};

