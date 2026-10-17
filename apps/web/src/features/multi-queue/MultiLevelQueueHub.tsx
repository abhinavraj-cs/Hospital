import React, { useState, useEffect } from 'react';
import { 
  Search, UserPlus, Stethoscope, Pill, FlaskConical, FileCheck, 
  Clock, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, 
  Layers, ShieldAlert, Sparkles, Activity, FileText, ChevronRight,
  Printer, ArrowUpRight, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { multiQueueApi, doctorsApi } from '../../services/api.service';

type TabType = 'tracker' | 'lv1_register' | 'lv2_doctor' | 'lv3_pharmacy' | 'lv4_lab' | 'lv5_report' | 'overview';

export const MultiLevelQueueHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('tracker');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tokenSearch, setTokenSearch] = useState('PAT-101');
  const [trackedEncounter, setTrackedEncounter] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Doctors list for registration & consultation
  const [doctors, setDoctors] = useState<any[]>([]);

  // Stage Queue states
  const [doctorQueue, setDoctorQueue] = useState<any>(null);
  const [pharmacyQueue, setPharmacyQueue] = useState<any>(null);
  const [labQueue, setLabQueue] = useState<any>(null);
  const [reportQueue, setReportQueue] = useState<any>(null);
  const [allEncounters, setAllEncounters] = useState<any[]>([]);

  // LV1 Form State
  const [regForm, setRegForm] = useState({
    patientName: '',
    phone: '',
    age: '',
    gender: 'Male',
    symptoms: '',
    doctorId: '',
    isEmergency: false,
  });
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<any>(null);

  // LV2 Consultation Modal / Form State
  const [selectedConsultEncounter, setSelectedConsultEncounter] = useState<any>(null);
  const [consultForm, setConsultForm] = useState({
    diagnosis: '',
    notes: '',
    prescribeMedications: [
      { name: 'Paracetamol 650mg', dosage: '1 tab', frequency: 'Three times daily', duration: '3 days' },
    ],
    orderLabTests: [
      { testName: 'Complete Blood Count (CBC)', category: 'Hematology', sampleType: 'Blood' },
    ],
    dischargeImmediately: false,
  });
  const [consultSubmitting, setConsultSubmitting] = useState(false);

  // LV5 Report Verification Modal State
  const [selectedReportToVerify, setSelectedReportToVerify] = useState<any>(null);
  const [verifyForm, setVerifyForm] = useState({
    summary: 'Normal physiological range, no significant abnormality detected.',
    results: '{"WBC": "6,800 /mcL (Normal: 4,000-11,000)", "Hemoglobin": "14.2 g/dL (Normal: 13.5-17.5)", "Platelets": "240,000 /mcL (Normal: 150,000-450,000)"}',
    verifiedBy: 'Dr. S. K. Pathak, MD (Pathology)',
  });
  const [verifySubmitting, setVerifySubmitting] = useState(false);

  // Initial load
  useEffect(() => {
    loadOverviewAndDoctors();
    loadAllQueues();
  }, []);

  const loadOverviewAndDoctors = async () => {
    try {
      const [sRes, dRes] = await Promise.all([
        multiQueueApi.getOverviewStats(),
        doctorsApi.list(),
      ]);
      setStats(sRes);
      setDoctors(dRes || []);
      if (dRes && dRes.length > 0 && !regForm.doctorId) {
        setRegForm((prev) => ({ ...prev, doctorId: dRes[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to load stats or doctors:', err);
    }
  };

  const loadAllQueues = async () => {
    setLoading(true);
    try {
      const [docQ, phQ, labQ, repQ, encs] = await Promise.all([
        multiQueueApi.getStageQueue('LV2_DOCTOR'),
        multiQueueApi.getStageQueue('LV3_PHARMACY'),
        multiQueueApi.getStageQueue('LV4_LAB_TEST'),
        multiQueueApi.getStageQueue('LV5_LAB_REPORT'),
        multiQueueApi.getEncounters(),
      ]);
      setDoctorQueue(docQ);
      setPharmacyQueue(phQ);
      setLabQueue(labQ);
      setReportQueue(repQ);
      setAllEncounters(encs || []);

      // If we don't have a tracked encounter yet, track the first one
      if (!trackedEncounter && encs && encs.length > 0) {
        setTrackedEncounter(encs[0]);
        setTokenSearch(encs[0].encounterNumber || (encs[0].tokens?.[0]?.tokenCode ?? 'PAT-101'));
      }
    } catch (err: any) {
      console.error('Error fetching queues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenSearch.trim()) return;

    setTrackingLoading(true);
    try {
      const res = await multiQueueApi.trackToken(tokenSearch.trim());
      setTrackedEncounter(res);
      toast.success(`Found Journey for ${res.encounterNumber || tokenSearch}`);
    } catch (err: any) {
      toast.error(err?.message || 'Token not found. Please check token ID (e.g. PAT-101, DOC-201)');
    } finally {
      setTrackingLoading(false);
    }
  };

  // LV1: Register Patient
  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.patientName || !regForm.doctorId) {
      toast.error('Please enter patient name and select a doctor');
      return;
    }
    setRegSubmitting(true);
    try {
      const res = await multiQueueApi.registerPatient({
        patientName: regForm.patientName,
        phone: regForm.phone || undefined,
        age: regForm.age ? parseInt(regForm.age) : undefined,
        gender: regForm.gender,
        symptoms: regForm.symptoms || undefined,
        doctorId: regForm.doctorId,
        isEmergency: regForm.isEmergency,
      });

      setNewlyCreatedToken(res);
      toast.success(`Token Generated: ${res.tokens?.[0]?.tokenCode || 'PAT-101'} -> Queued for Doctor (${res.tokens?.[1]?.tokenCode || 'DOC-201'})`);
      setRegForm({
        patientName: '',
        phone: '',
        age: '',
        gender: 'Male',
        symptoms: '',
        doctorId: doctors[0]?.id || '',
        isEmergency: false,
      });
      loadOverviewAndDoctors();
      loadAllQueues();
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed');
    } finally {
      setRegSubmitting(false);
    }
  };

  // LV2: Complete Doctor Consultation
  const handleDoctorConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultEncounter) return;
    if (!consultForm.diagnosis) {
      toast.error('Please provide a medical diagnosis');
      return;
    }

    setConsultSubmitting(true);
    try {
      const res = await multiQueueApi.processDoctorConsultation(selectedConsultEncounter.id, {
        diagnosis: consultForm.diagnosis,
        notes: consultForm.notes,
        prescribeMedications: consultForm.prescribeMedications.filter(m => m.name.trim()),
        orderLabTests: consultForm.orderLabTests.filter(t => t.testName.trim()),
        dischargeImmediately: consultForm.dischargeImmediately,
      });

      toast.success(`Consultation completed for ${selectedConsultEncounter.patient?.user?.name || 'Patient'}! Next Stage: ${res.currentLevel}`);
      setSelectedConsultEncounter(null);
      loadAllQueues();
      loadOverviewAndDoctors();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit consultation');
    } finally {
      setConsultSubmitting(false);
    }
  };

  // LV3: Dispense Pharmacy
  const handleDispensePharmacy = async (prescriptionId: string) => {
    try {
      await multiQueueApi.dispensePharmacy(prescriptionId, {
        instructions: 'Dispensed with standard label instructions. Advised to take after food.',
      });
      toast.success('Medicines marked as Dispensed to Patient!');
      loadAllQueues();
      loadOverviewAndDoctors();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dispense');
    }
  };

  // LV4: Collect Lab Sample
  const handleCollectSample = async (requestId: string) => {
    try {
      await multiQueueApi.collectLabSample(requestId);
      toast.success('Lab specimen collected and registered!');
      loadAllQueues();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to collect sample');
    }
  };

  // LV4: Complete Lab Test (spawns LV5 report)
  const handleCompleteLabTest = async (requestId: string) => {
    try {
      const res = await multiQueueApi.completeLabTest(requestId);
      toast.success('Test completed! LV5 Lab Report token generated and sent to pathologist.');
      loadAllQueues();
      loadOverviewAndDoctors();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to complete test');
    }
  };

  // LV5: Verify Report
  const handleVerifyReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportToVerify) return;

    setVerifySubmitting(true);
    try {
      await multiQueueApi.verifyLabReport(selectedReportToVerify.id, {
        summary: verifyForm.summary,
        results: verifyForm.results,
        verifiedBy: verifyForm.verifiedBy,
      });
      toast.success('Lab report verified and delivered to patient journey!');
      setSelectedReportToVerify(null);
      loadAllQueues();
      loadOverviewAndDoctors();
    } catch (err: any) {
      toast.error(err?.message || 'Verification failed');
    } finally {
      setVerifySubmitting(false);
    }
  };

  // Update token status (e.g. Call patient, in-progress)
  const handleUpdateStatus = async (tokenId: string, status: string) => {
    try {
      await multiQueueApi.updateTokenStatus(tokenId, { status });
      toast.success(`Token status changed to ${status}`);
      loadAllQueues();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update token status');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner - Deep Indigo #3E36B0 with Sky Blue #A6DEF7 accents */}
      <div className="relative overflow-hidden rounded-3xl bg-[#3E36B0] text-white p-6 md:p-8 shadow-[0_8px_30px_rgba(62,54,176,0.25)] border border-[#A6DEF7]/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-[#A6DEF7]/15 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A6DEF7]/20 text-white text-xs font-bold mb-3 border border-[#A6DEF7]/40">
              <Sparkles className="w-3.5 h-3.5 text-[#A6DEF7]" />
              Multi-Level Patient Queue & Hospital Workflow
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Hospital Multi-Level Token Management System
            </h1>
            <p className="text-white/80 text-sm md:text-base font-normal mt-1 max-w-2xl">
              End-to-end traceability across 5 operational levels: Patient Registration (LV1), Doctor OPD (LV2), Pharmacy Dispensing (LV3), Laboratory Diagnostics (LV4), and Report Verification (LV5).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { loadOverviewAndDoctors(); loadAllQueues(); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-semibold transition backdrop-blur-md text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Queues
            </button>
            <button
              onClick={() => setActiveTab('lv1_register')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1B8B8E] hover:bg-[#146B6E] text-white font-bold text-sm shadow-md transition active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              + Issue Token
            </button>
          </div>
        </div>

        {/* 5 Levels Pipeline Overview Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/15">
          {[
            { level: 'LV1', name: 'Patient Reg.', prefix: '101..', count: stats?.levels?.LV1_PATIENT?.total || 0, color: 'bg-white/10 text-white border-white/20', icon: UserPlus },
            { level: 'LV2', name: 'Doctor OPD', prefix: '201..', count: stats?.levels?.LV2_DOCTOR?.waiting || 0, color: 'bg-[#A6DEF7]/20 text-white border-[#A6DEF7]/40', icon: Stethoscope },
            { level: 'LV3', name: 'Pharmacy', prefix: '301..', count: stats?.levels?.LV3_PHARMACY?.waiting || 0, color: 'bg-white/10 text-white border-white/20', icon: Pill },
            { level: 'LV4', name: 'Lab Test', prefix: '401..', count: stats?.levels?.LV4_LAB_TEST?.waiting || 0, color: 'bg-[#A6DEF7]/20 text-white border-[#A6DEF7]/40', icon: FlaskConical },
            { level: 'LV5', name: 'Lab Report', prefix: '501..', count: stats?.levels?.LV5_LAB_REPORT?.waiting || 0, color: 'bg-[#F62088]/30 text-white border-[#F62088]/40', icon: FileCheck },
          ].map((item, idx) => (
            <div key={idx} className={`p-3 rounded-2xl border ${item.color} backdrop-blur-xs flex items-center justify-between`}>
              <div>
                <span className="text-[10px] font-bold tracking-wider opacity-90 uppercase">{item.level}</span>
                <div className="font-bold text-sm text-white">{item.name}</div>
                <div className="text-[11px] opacity-75 font-mono">Tokens: {item.prefix}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white font-mono">{item.count}</div>
                <span className="text-[10px] uppercase opacity-75 font-bold">Queued</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs - Deep Indigo #3E36B0 active state */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#A6DEF7]/40">
        {[
          { id: 'tracker', label: '🧭 Central Token Tracker & Timeline', count: null },
          { id: 'lv1_register', label: '🎫 LV1: Registration (PAT-10X)', count: null },
          { id: 'lv2_doctor', label: '🩺 LV2: Doctor OPD Queue (DOC-20X)', count: doctorQueue?.waitingCount },
          { id: 'lv3_pharmacy', label: '💊 LV3: Pharmacy Dispensing (PH-30X)', count: pharmacyQueue?.waitingCount },
          { id: 'lv4_lab', label: '🧪 LV4: Lab Test Queue (LAB-40X)', count: labQueue?.waitingCount },
          { id: 'lv5_report', label: '📄 LV5: Lab Reports (REP-50X)', count: reportQueue?.waitingCount },
          { id: 'overview', label: '📊 All Active Encounters', count: allEncounters.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#3E36B0] text-white shadow-md shadow-[#3E36B0]/25'
                : 'bg-white text-[#111111] hover:bg-[#F0F9FD] border border-[#A6DEF7]/60'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-white text-[#3E36B0]' : 'bg-[#1B8B8E] text-white'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 1: CENTRAL TRACKER & PATIENT JOURNEY TIMELINE
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          {/* Search Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Central Token & Journey Tracker</h2>
            <p className="text-slate-600 text-sm mb-4">
              Enter any Department Token ID (e.g. <span className="font-mono font-semibold text-sky-600">PAT-101</span>, <span className="font-mono font-semibold text-sky-600">DOC-201</span>, <span className="font-mono font-semibold text-sky-600">PH-301</span>, <span className="font-mono font-semibold text-sky-600">LAB-401</span>, <span className="font-mono font-semibold text-sky-600">REP-501</span>) or Encounter ID (<span className="font-mono font-semibold text-slate-700">ENC-2026-1001</span>) to see the full multi-level journey.
            </p>

            <form onSubmit={handleTrackSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={tokenSearch}
                  onChange={(e) => setTokenSearch(e.target.value)}
                  placeholder="Enter Token (e.g. PAT-101 or DOC-201)"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-base uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={trackingLoading}
                className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                {trackingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Track Journey
              </button>
            </form>
          </div>

          {/* Tracked Encounter Display */}
          {trackedEncounter ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30">
                      {trackedEncounter.encounterNumber}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      trackedEncounter.priority === 'EMERGENCY' ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-700 text-slate-200'
                    }`}>
                      {trackedEncounter.priority}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Current: {trackedEncounter.currentLevel}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black mt-2">
                    {trackedEncounter.patient?.user?.name || 'Patient'}
                  </h3>
                  <p className="text-slate-300 text-xs mt-1">
                    Phone: {trackedEncounter.patient?.user?.phone || 'N/A'} • Assigned Doctor: {trackedEncounter.doctor?.user?.name} ({trackedEncounter.doctor?.specialization})
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Chief Complaint</div>
                  <div className="text-sm font-semibold text-sky-200 max-w-xs truncate">
                    {trackedEncounter.chiefComplaint || 'Routine Consultation'}
                  </div>
                  {trackedEncounter.diagnosis && (
                    <div className="mt-1 text-xs text-emerald-300">
                      Diagnosis: <span className="font-bold">{trackedEncounter.diagnosis}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 5-Level Stepper / Journey Pipeline */}
              <div className="p-6 md:p-8">
                <h4 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-600" />
                  Multi-Level Hospital Journey Timeline
                </h4>

                <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pl-6">
                  {/* LV1: Patient Registration */}
                  {(() => {
                    const t1 = trackedEncounter.tokens?.find((t: any) => t.level === 'LV1_PATIENT');
                    return (
                      <div className="relative group">
                        <div className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                          t1?.status === 'COMPLETED' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-slate-200 text-slate-700 border-white'
                        }`}>
                          1
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">LV1 — Patient Registration</span>
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {t1?.tokenCode || 'PAT-101'}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              COMPLETED
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            Registered at reception & assigned to {trackedEncounter.doctor?.user?.name}.
                          </p>
                          <div className="text-[11px] text-slate-400 mt-2">
                            Token: #{t1?.tokenNumber || 101} • Time: {new Date(t1?.completedAt || trackedEncounter.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* LV2: Doctor Consultation */}
                  {(() => {
                    const t2 = trackedEncounter.tokens?.find((t: any) => t.level === 'LV2_DOCTOR');
                    const isCompleted = t2?.status === 'COMPLETED';
                    const isActive = t2?.status === 'IN_PROGRESS' || t2?.status === 'CALLED';
                    return (
                      <div className="relative group">
                        <div className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                          isCompleted ? 'bg-emerald-500 text-white border-emerald-600' :
                          isActive ? 'bg-blue-600 text-white border-blue-400 animate-pulse' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          2
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">LV2 — Doctor OPD Consultation</span>
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                {t2?.tokenCode || 'DOC-201'}
                              </span>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                              isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                              isActive ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {t2?.status || 'WAITING'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            Assigned to {trackedEncounter.doctor?.user?.name} ({trackedEncounter.doctor?.department?.name || 'OPD'}).
                          </p>
                          {trackedEncounter.diagnosis && (
                            <div className="mt-2 p-2.5 rounded-xl bg-blue-50/80 border border-blue-100 text-xs text-blue-950 font-medium">
                              <strong>Clinical Diagnosis:</strong> {trackedEncounter.diagnosis}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* LV3: Pharmacy Dispensing (Conditional) */}
                  {(() => {
                    const t3 = trackedEncounter.tokens?.find((t: any) => t.level === 'LV3_PHARMACY');
                    const prescription = trackedEncounter.prescriptions?.[0];
                    if (!t3 && !prescription) return null;

                    const isDispensed = prescription?.status === 'DISPENSED' || t3?.status === 'COMPLETED';
                    return (
                      <div className="relative group">
                        <div className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                          isDispensed ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-amber-500 text-white border-amber-400 animate-pulse'
                        }`}>
                          3
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">LV3 — Pharmacy Dispensing</span>
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                {t3?.tokenCode || 'PH-301'}
                              </span>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                              isDispensed ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {isDispensed ? 'DISPENSED' : 'WAITING AT PHARMACY'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            Prescription order generated from doctor consultation.
                          </p>

                          {prescription && (
                            <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                              <span className="font-bold text-amber-900">Prescribed Medicines:</span>
                              <div className="mt-1 font-mono text-[11px] text-slate-700 whitespace-pre-wrap">
                                {prescription.medicines}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* LV4: Laboratory Test (Conditional) */}
                  {(() => {
                    const t4 = trackedEncounter.tokens?.find((t: any) => t.level === 'LV4_LAB_TEST');
                    const labReqs = trackedEncounter.labRequests || [];
                    if (!t4 && labReqs.length === 0) return null;

                    const allDone = labReqs.length > 0 && labReqs.every((r: any) => r.status === 'COMPLETED');
                    return (
                      <div className="relative group">
                        <div className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                          allDone ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-purple-600 text-white border-purple-400'
                        }`}>
                          4
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">LV4 — Laboratory Diagnostics</span>
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                                {t4?.tokenCode || 'LAB-401'}
                              </span>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                              allDone ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {allDone ? 'TESTS PROCESSED' : 'IN LAB QUEUE'}
                            </span>
                          </div>

                          <div className="mt-2 space-y-1">
                            {labReqs.map((req: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white border border-slate-200">
                                <div>
                                  <span className="font-semibold text-slate-800">{req.testName}</span>
                                  <span className="text-slate-400 text-[10px] ml-2">({req.sampleType} - {req.testCategory})</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {req.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* LV5: Lab Report Generation & Verification */}
                  {(() => {
                    const t5 = trackedEncounter.tokens?.find((t: any) => t.level === 'LV5_LAB_REPORT');
                    const rep = trackedEncounter.labRequests?.find((lr: any) => lr.report)?.report;
                    if (!t5 && !rep) return null;

                    const isDelivered = rep?.status === 'DELIVERED' || t5?.status === 'COMPLETED';
                    return (
                      <div className="relative group">
                        <div className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 ${
                          isDelivered ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-rose-500 text-white border-rose-400 animate-pulse'
                        }`}>
                          5
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">LV5 — Lab Report & Pathologist Verification</span>
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                                {t5?.tokenCode || rep?.reportTokenCode || 'REP-501'}
                              </span>
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                              isDelivered ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {isDelivered ? 'VERIFIED & DELIVERED' : 'AWAITING PATHOLOGIST SIGN-OFF'}
                            </span>
                          </div>

                          {rep && (
                            <div className="mt-2 p-3 rounded-xl bg-white border border-rose-100 text-xs space-y-1">
                              <div><strong>Summary:</strong> {rep.summary}</div>
                              {rep.verifiedBy && <div><strong>Verified By:</strong> {rep.verifiedBy}</div>}
                              {rep.results && (
                                <div className="mt-2 p-2 bg-slate-50 rounded font-mono text-[11px] text-slate-700">
                                  {rep.results}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
              No encounter selected. Use the search bar above or click on an encounter from the list.
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 2: LV1 REGISTRATION & TOKEN GENERATION
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'lv1_register' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">LEVEL 1</span>
              <h2 className="text-xl font-bold text-slate-900">Patient Registration & Token Dispatch</h2>
            </div>
            <p className="text-slate-600 text-sm mb-6">
              Registers the patient, issues a primary <span className="font-mono font-semibold">PAT-10X</span> token, and assigns them to the chosen doctor queue (<span className="font-mono font-semibold">DOC-20X</span>).
            </p>

            <form onSubmit={handleRegisterPatient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={regForm.patientName}
                    onChange={(e) => setRegForm({ ...regForm, patientName: e.target.value })}
                    placeholder="e.g. Sunita Devi"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={regForm.age}
                    onChange={(e) => setRegForm({ ...regForm, age: e.target.value })}
                    placeholder="e.g. 38"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={regForm.gender}
                    onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Doctor OPD *</label>
                <select
                  required
                  value={regForm.doctorId}
                  onChange={(e) => setRegForm({ ...regForm, doctorId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm bg-white"
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.user?.name} — {doc.department?.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Complaint / Symptoms</label>
                <textarea
                  rows={2}
                  value={regForm.symptoms}
                  onChange={(e) => setRegForm({ ...regForm, symptoms: e.target.value })}
                  placeholder="e.g. Severe headache, fever for 3 days"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-200">
                <input
                  type="checkbox"
                  id="emergency"
                  checked={regForm.isEmergency}
                  onChange={(e) => setRegForm({ ...regForm, isEmergency: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
                <label htmlFor="emergency" className="text-xs font-bold text-rose-900 cursor-pointer">
                  🚨 Emergency Priority / Casualty (Bypass regular queue)
                </label>
              </div>

              <button
                type="submit"
                disabled={regSubmitting}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                {regSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                Generate Multi-Level Tokens (PAT-10X & DOC-20X)
              </button>
            </form>
          </div>

          {/* Newly Generated Token Slip */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-slate-700 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-bold tracking-wider text-sky-400 uppercase">Hospital Token Receipt</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>

              {newlyCreatedToken ? (
                <div className="mt-6 space-y-4">
                  <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs text-slate-400 uppercase">Your Patient Token (LV1)</span>
                    <div className="text-4xl font-black text-emerald-400 tracking-wider font-mono my-1">
                      {newlyCreatedToken.tokens?.[0]?.tokenCode || 'PAT-101'}
                    </div>
                    <div className="text-xs text-slate-300">
                      Encounter: {newlyCreatedToken.encounterNumber}
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
                    <span className="text-xs text-slate-400 uppercase">Assigned Doctor Token (LV2)</span>
                    <div className="text-3xl font-black text-sky-400 tracking-wider font-mono my-1">
                      {newlyCreatedToken.tokens?.[1]?.tokenCode || 'DOC-201'}
                    </div>
                    <div className="text-xs text-slate-300">
                      {newlyCreatedToken.doctor?.user?.name}
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 pt-2">
                    <div><strong>Patient:</strong> {newlyCreatedToken.patient?.user?.name}</div>
                    <div><strong>Priority:</strong> {newlyCreatedToken.priority}</div>
                    <div><strong>Department:</strong> {newlyCreatedToken.doctor?.department?.name}</div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 text-sm">
                  Register a patient on the left to instantly generate physical/digital token slips.
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 pt-4 border-t border-white/10 mt-6 text-center">
              ArogyaMitra Government Hospital Digital Queue System
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 3: LV2 DOCTOR OPD QUEUE & CONSULTATION
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'lv2_doctor' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                LEVEL 2
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Doctor OPD Queue & Consultation Desk</h2>
            </div>
            <div className="text-sm font-semibold text-slate-600">
              Total in Queue: <span className="text-sky-600 font-bold">{doctorQueue?.waitingCount || 0} waiting</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctorQueue?.tokens?.map((t: any) => {
              const enc = t.encounter;
              const isWaiting = t.status === 'WAITING';
              const isInProgress = t.status === 'IN_PROGRESS' || t.status === 'CALLED';

              return (
                <div key={t.id} className={`p-5 rounded-3xl border transition shadow-xs ${
                  isInProgress ? 'bg-sky-50/80 border-sky-300 ring-2 ring-sky-400/20' : 'bg-white border-slate-200 hover:shadow-md'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-extrabold px-3 py-1 rounded-xl bg-blue-100 text-blue-800">
                      {t.tokenCode}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isInProgress ? 'bg-sky-500 text-white animate-pulse' :
                      t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-bold text-slate-900 text-lg">{enc?.patient?.user?.name || 'Patient'}</h4>
                    <p className="text-xs text-slate-500">Phone: {enc?.patient?.user?.phone || 'N/A'}</p>
                    <div className="mt-2 text-xs bg-slate-100 p-2 rounded-xl text-slate-700">
                      <strong>Complaint:</strong> {enc?.chiefComplaint || 'Consultation'}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      Doctor: {enc?.doctor?.user?.name?.split(' ')[1] || 'Doctor'}
                    </div>

                    <div className="flex items-center gap-2">
                      {isWaiting && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, 'CALLED')}
                          className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition"
                        >
                          Call Patient
                        </button>
                      )}
                      {isInProgress && (
                        <button
                          onClick={() => {
                            setSelectedConsultEncounter(enc);
                            setConsultForm({
                              diagnosis: enc.diagnosis || 'Acute Upper Respiratory Tract Infection',
                              notes: 'Follow complete course of medication. Return if fever persists.',
                              prescribeMedications: [
                                { name: 'Amoxicillin 500mg', dosage: '1 tab', frequency: 'Twice daily', duration: '5 days' },
                                { name: 'Paracetamol 650mg', dosage: '1 tab', frequency: 'As needed (SOS)', duration: '3 days' },
                              ],
                              orderLabTests: [
                                { testName: 'Complete Blood Count (CBC)', category: 'Hematology', sampleType: 'Blood' },
                              ],
                              dischargeImmediately: false,
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                        >
                          🩺 Consult & Route
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {(!doctorQueue?.tokens || doctorQueue.tokens.length === 0) && (
              <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                No patients currently waiting in Doctor OPD queue. Issue a new token from the Registration tab.
              </div>
            )}
          </div>

          {/* Consultation & Routing Modal */}
          {selectedConsultEncounter && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl border border-slate-200 animate-scaleIn">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                  <div>
                    <span className="text-xs font-bold text-sky-600 uppercase">Consultation Desk</span>
                    <h3 className="text-xl font-black text-slate-900">
                      {selectedConsultEncounter.patient?.user?.name} ({selectedConsultEncounter.encounterNumber})
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedConsultEncounter(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleDoctorConsultation} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Diagnosis *</label>
                    <input
                      type="text"
                      required
                      value={consultForm.diagnosis}
                      onChange={(e) => setConsultForm({ ...consultForm, diagnosis: e.target.value })}
                      placeholder="e.g. Acute Bronchitis"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Advice / Clinical Notes</label>
                    <textarea
                      rows={2}
                      value={consultForm.notes}
                      onChange={(e) => setConsultForm({ ...consultForm, notes: e.target.value })}
                      placeholder="Special instructions or precautions..."
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </div>

                  {/* Section A: Pharmacy Routing */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Pill className="w-4 h-4 text-amber-600" />
                        1. Prescribe Medication (Routes to LV3 Pharmacy Token)
                      </span>
                      <button
                        type="button"
                        onClick={() => setConsultForm({
                          ...consultForm,
                          prescribeMedications: [
                            ...consultForm.prescribeMedications,
                            { name: '', dosage: '1 tab', frequency: 'Twice daily', duration: '5 days' },
                          ],
                        })}
                        className="text-xs font-bold text-amber-700 hover:text-amber-900 underline"
                      >
                        + Add Medicine
                      </button>
                    </div>

                    {consultForm.prescribeMedications.map((med, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2">
                        <input
                          type="text"
                          placeholder="Medicine Name (e.g. Paracetamol)"
                          value={med.name}
                          onChange={(e) => {
                            const copy = [...consultForm.prescribeMedications];
                            copy[idx].name = e.target.value;
                            setConsultForm({ ...consultForm, prescribeMedications: copy });
                          }}
                          className="col-span-6 px-3 py-1.5 rounded-lg border border-amber-300 text-xs bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={med.dosage}
                          onChange={(e) => {
                            const copy = [...consultForm.prescribeMedications];
                            copy[idx].dosage = e.target.value;
                            setConsultForm({ ...consultForm, prescribeMedications: copy });
                          }}
                          className="col-span-3 px-3 py-1.5 rounded-lg border border-amber-300 text-xs bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Frequency"
                          value={med.frequency}
                          onChange={(e) => {
                            const copy = [...consultForm.prescribeMedications];
                            copy[idx].frequency = e.target.value;
                            setConsultForm({ ...consultForm, prescribeMedications: copy });
                          }}
                          className="col-span-3 px-3 py-1.5 rounded-lg border border-amber-300 text-xs bg-white"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Section B: Lab Diagnostics Routing */}
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <FlaskConical className="w-4 h-4 text-purple-600" />
                        2. Order Laboratory Tests (Routes to LV4 Lab Queue)
                      </span>
                      <button
                        type="button"
                        onClick={() => setConsultForm({
                          ...consultForm,
                          orderLabTests: [
                            ...consultForm.orderLabTests,
                            { testName: 'Serum Creatinine', category: 'Biochemistry', sampleType: 'Blood' },
                          ],
                        })}
                        className="text-xs font-bold text-purple-700 hover:text-purple-900 underline"
                      >
                        + Add Test
                      </button>
                    </div>

                    {consultForm.orderLabTests.map((t, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Test Name (e.g. CBC or X-Ray)"
                          value={t.testName}
                          onChange={(e) => {
                            const copy = [...consultForm.orderLabTests];
                            copy[idx].testName = e.target.value;
                            setConsultForm({ ...consultForm, orderLabTests: copy });
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-purple-300 text-xs bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Sample (e.g. Blood)"
                          value={t.sampleType}
                          onChange={(e) => {
                            const copy = [...consultForm.orderLabTests];
                            copy[idx].sampleType = e.target.value;
                            setConsultForm({ ...consultForm, orderLabTests: copy });
                          }}
                          className="w-28 px-3 py-1.5 rounded-lg border border-purple-300 text-xs bg-white"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setConsultForm({ ...consultForm, dischargeImmediately: true, prescribeMedications: [], orderLabTests: [] })}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Immediate Discharge (No Meds/Labs)
                    </button>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedConsultEncounter(null)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={consultSubmitting}
                        className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md flex items-center gap-2"
                      >
                        {consultSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Submit Consultation & Generate Next Stage Tokens
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 4: LV3 PHARMACY DISPENSING
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'lv3_pharmacy' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
                LEVEL 3
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Pharmacy Medicine Dispensing Counter</h2>
            </div>
            <div className="text-sm font-semibold text-slate-600">
              Active Dispense Queue: <span className="text-amber-600 font-bold">{pharmacyQueue?.waitingCount || 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pharmacyQueue?.tokens?.map((t: any) => {
              const enc = t.encounter;
              const presc = enc?.prescriptions?.[0];
              const isDispensed = presc?.status === 'DISPENSED' || t.status === 'COMPLETED';

              return (
                <div key={t.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-extrabold px-3 py-1 rounded-xl bg-amber-100 text-amber-900">
                      {t.tokenCode}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isDispensed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}>
                      {isDispensed ? 'DISPENSED' : 'READY TO DISPENSE'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-bold text-slate-900 text-lg">{enc?.patient?.user?.name || 'Patient'}</h4>
                    <p className="text-xs text-slate-500">Encounter: {enc?.encounterNumber}</p>
                    
                    {presc && (
                      <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap">
                        {presc.medicines}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Dr. {enc?.doctor?.user?.name?.split(' ')[1]}</span>
                    {!isDispensed ? (
                      <button
                        onClick={() => presc && handleDispensePharmacy(presc.id)}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                      >
                        <Pill className="w-3.5 h-3.5" />
                        Mark Dispensed
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {(!pharmacyQueue?.tokens || pharmacyQueue.tokens.length === 0) && (
              <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                No active prescriptions in Pharmacy dispensing queue.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 5: LV4 LAB TEST QUEUE
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'lv4_lab' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
                LEVEL 4
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Laboratory Specimen & Testing Queue</h2>
            </div>
            <div className="text-sm font-semibold text-slate-600">
              Pending Lab Tests: <span className="text-purple-600 font-bold">{labQueue?.waitingCount || 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {labQueue?.tokens?.map((t: any) => {
              const enc = t.encounter;
              const reqs = enc?.labRequests || [];

              return (
                <div key={t.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-extrabold px-3 py-1 rounded-xl bg-purple-100 text-purple-900">
                      {t.tokenCode}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                      {t.status}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-bold text-slate-900 text-lg">{enc?.patient?.user?.name || 'Patient'}</h4>
                    <p className="text-xs text-slate-500">Encounter: {enc?.encounterNumber}</p>
                    
                    <div className="mt-3 space-y-2">
                      {reqs.map((req: any) => (
                        <div key={req.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{req.testName}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Sample: {req.sampleType} • Cat: {req.testCategory}
                          </div>

                          <div className="mt-2 flex gap-2">
                            {req.status === 'PENDING' && (
                              <button
                                onClick={() => handleCollectSample(req.id)}
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold"
                              >
                                Collect Sample
                              </button>
                            )}
                            {req.status === 'SAMPLE_COLLECTED' && (
                              <button
                                onClick={() => handleCompleteLabTest(req.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                              >
                                <FlaskConical className="w-3 h-3" />
                                Complete Test &rarr; Generate LV5 Token
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {(!labQueue?.tokens || labQueue.tokens.length === 0) && (
              <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                No active tests in Laboratory processing queue.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 6: LV5 LAB REPORT VERIFICATION & DELIVERY
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'lv5_report' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">
                LEVEL 5
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Pathology Lab Report Verification Desk</h2>
            </div>
            <div className="text-sm font-semibold text-slate-600">
              Pending Pathologist Review: <span className="text-rose-600 font-bold">{reportQueue?.waitingCount || 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportQueue?.tokens?.map((t: any) => {
              const enc = t.encounter;
              const rep = enc?.labRequests?.find((lr: any) => lr.report)?.report;
              const isDelivered = rep?.status === 'DELIVERED' || t.status === 'COMPLETED';

              return (
                <div key={t.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-extrabold px-3 py-1 rounded-xl bg-rose-100 text-rose-900">
                      {t.tokenCode}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isDelivered ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'
                    }`}>
                      {isDelivered ? 'VERIFIED & DELIVERED' : 'PENDING PATHOLOGIST'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-bold text-slate-900 text-lg">{enc?.patient?.user?.name || 'Patient'}</h4>
                    <p className="text-xs text-slate-500">Encounter: {enc?.encounterNumber}</p>
                    
                    {rep && (
                      <div className="mt-3 p-3 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs">
                        <strong>Draft Summary:</strong> {rep.summary}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Level 5 Final Stage</span>
                    {!isDelivered && rep ? (
                      <button
                        onClick={() => setSelectedReportToVerify(rep)}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Verify & Deliver
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Signed & Delivered
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {(!reportQueue?.tokens || reportQueue.tokens.length === 0) && (
              <div className="col-span-full p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                No reports waiting for pathologist verification.
              </div>
            )}
          </div>

          {/* Pathologist Verification Modal */}
          {selectedReportToVerify && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Verify & Deliver Lab Report ({selectedReportToVerify.reportTokenCode})
                  </h3>
                  <button onClick={() => setSelectedReportToVerify(null)} className="text-slate-400">✕</button>
                </div>

                <form onSubmit={handleVerifyReport} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pathologist Summary & Clinical Notes</label>
                    <input
                      type="text"
                      required
                      value={verifyForm.summary}
                      onChange={(e) => setVerifyForm({ ...verifyForm, summary: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Structured Lab Findings / Values</label>
                    <textarea
                      rows={4}
                      value={verifyForm.results}
                      onChange={(e) => setVerifyForm({ ...verifyForm, results: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Signing Pathologist</label>
                    <input
                      type="text"
                      value={verifyForm.verifiedBy}
                      onChange={(e) => setVerifyForm({ ...verifyForm, verifiedBy: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSelectedReportToVerify(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={verifySubmitting}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
                    >
                      {verifySubmitting ? 'Verifying...' : 'Sign, Deliver & Complete Workflow'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          TAB 7: OVERVIEW / ALL HOSPITAL ENCOUNTERS
      ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">All Hospital Encounters & Token Tracking</h2>
              <p className="text-slate-500 text-xs mt-0.5">Real-time status of all patient journeys</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800">
              Total Encounters: {allEncounters.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Encounter</th>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Doctor</th>
                  <th className="px-6 py-3">Active Tokens</th>
                  <th className="px-6 py-3">Current Stage</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {allEncounters.map((enc) => (
                  <tr key={enc.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-mono font-bold text-sky-700">
                      {enc.encounterNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{enc.patient?.user?.name}</div>
                      <div className="text-slate-400 text-[11px]">{enc.patient?.user?.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-800">{enc.doctor?.user?.name}</div>
                      <div className="text-slate-400 text-[11px]">{enc.doctor?.department?.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {enc.tokens?.map((t: any) => (
                          <span
                            key={t.id}
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                              t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                              t.status === 'IN_PROGRESS' || t.status === 'CALLED' ? 'bg-sky-100 text-sky-800' :
                              'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.tokenCode}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full text-[11px]">
                        {enc.currentLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        enc.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {enc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setTrackedEncounter(enc);
                          setTokenSearch(enc.encounterNumber);
                          setActiveTab('tracker');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 ml-auto"
                      >
                        Timeline <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
