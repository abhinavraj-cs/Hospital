import { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  Volume2, 
  PlusCircle, 
  Search, 
  Clock, 
  AlertTriangle, 
  Users, 
  Tv, 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert, 
  RefreshCw, 
  MapPin, 
  ChevronRight,
  UserCheck,
  Radio,
  Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueueTrackerStore, DepartmentQueue } from '../queues/queueTrackerStore';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';

export function Dashboard() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const {
    roleView,
    setRoleView,
    language,
    setLanguage,
    selectedDeptId,
    setSelectedDept,
    userToken,
    departments,
    logs,
    isAnnouncing,
    trackToken,
    generateNewToken,
    callNextToken,
    markConsultationDone,
    markNoShow,
    addDoctorDelay,
    speakQueueStatus,
    resetToDefault,
  } = useQueueTrackerStore();

  const [inputToken, setInputToken] = useState(userToken);
  const [showTokenReceipt, setShowTokenReceipt] = useState(false);
  const [issuedTokenInfo, setIssuedTokenInfo] = useState<string | null>(null);

  const isHi = language === 'hi';
  const currentDept: DepartmentQueue = departments[selectedDeptId] || departments.opd;

  // Calculate dynamics for the tracked user token
  const tokenParts = userToken.split('-');
  const tokenPrefix = tokenParts[0] || 'OPD';
  const tokenNumber = parseInt(tokenParts[1] || '104', 10);

  const servingNumber = currentDept.nowServing;
  const tokensAhead = Math.max(0, tokenNumber - servingNumber);
  const isBeingServed = servingNumber === tokenNumber;
  const isPast = servingNumber > tokenNumber;

  // Wait time calculation: tokensAhead * avgTime + delayMinutes
  const dynamicWaitTime = isBeingServed
    ? 0
    : isPast
    ? 0
    : Math.max(2, Math.round(tokensAhead * currentDept.avgTimePerPatient + currentDept.delayMinutes));

  // Build the horizontal progress steps (e.g. serving -> serving+1 -> serving+2 -> userToken)
  const progressSteps = [];
  const startStep = Math.max(1, servingNumber);
  const targetStep = Math.max(startStep, tokenNumber);

  for (let num = startStep; num <= targetStep; num++) {
    progressSteps.push({
      num,
      tokenStr: `${currentDept.prefix}-${num}`,
      isCurrent: num === servingNumber,
      isUser: num === tokenNumber,
      isCompleted: num < servingNumber,
    });
  }

  // Handle Token Search/Track
  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) {
      toast.error(isHi ? 'कृपया टोकन नंबर दर्ज करें' : 'Please enter a token number');
      return;
    }
    const success = trackToken(inputToken);
    if (success) {
      toast.success(
        isHi
          ? `टोकन ${inputToken.toUpperCase()} ट्रैक किया जा रहा है`
          : `Tracking token ${inputToken.toUpperCase()}`
      );
    }
  };

  // Handle Get New Token
  const handleGetNewToken = (deptId: string = 'opd') => {
    const newToken = generateNewToken(deptId);
    setInputToken(newToken);
    setIssuedTokenInfo(newToken);
    setShowTokenReceipt(true);
    toast.success(
      isHi
        ? `नया टोकन जारी: ${newToken}`
        : `New Token Issued: ${newToken}`
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC DISPLAY VIEW (Kiosk / Waiting Hall TV Mode)
  // ─────────────────────────────────────────────────────────────────────────────
  if (roleView === 'display') {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-300">
        {/* TV Header Bar */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600 rounded-xl animate-pulse">
              <Radio className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-sky-500/20 text-sky-300 text-xs px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider border border-sky-400/30">
                  PUBLIC DISPLAY BOARD • WAITING HALL A
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-mono">
                  LIVE SYNC
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white mt-1">
                {isHi ? 'एम्स / जीएमईआरएस अस्पताल - लाइव टोकन डिस्प्ले' : 'GMERS Hospital - Live Public Queue Display'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={speakQueueStatus}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              <Volume2 className="h-5 w-5" />
              <span>{isHi ? 'घोषणा सुनें' : 'Audio Announce'}</span>
            </button>
            <button
              onClick={() => setRoleView('patient')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-700"
            >
              {isHi ? 'मरीज दृश्य पर लौटें' : 'Exit Display View'}
            </button>
          </div>
        </div>

        {/* Big Screen Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* OPD Big Screen */}
          <div className="bg-slate-900 border-2 border-sky-500/50 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-sky-500 text-slate-950 px-4 py-1 text-xs font-black tracking-wider uppercase rounded-bl-xl">
              ROOM 104
            </div>
            <p className="text-sky-400 font-bold text-sm tracking-wide uppercase">General Medicine OPD</p>
            <div className="mt-4 mb-2 text-center py-6 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-widest block font-bold mb-1">NOW SERVING</span>
              <span className="text-6xl font-black text-emerald-400 tracking-tight font-mono animate-pulse">
                OPD-{departments.opd.nowServing}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-center">
              <div className="bg-slate-800/80 p-3 rounded-lg">
                <span className="text-xs text-slate-400 block">Waiting</span>
                <span className="text-2xl font-bold text-amber-400">{departments.opd.waitingCount}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-lg">
                <span className="text-xs text-slate-400 block">Est. Time</span>
                <span className="text-2xl font-bold text-sky-400">
                  ~{departments.opd.waitingCount * 3 + departments.opd.delayMinutes}m
                </span>
              </div>
            </div>
          </div>

          {/* Pathology Lab Big Screen */}
          <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 text-xs font-black tracking-wider uppercase rounded-bl-xl">
              LAB HALL A
            </div>
            <p className="text-indigo-400 font-bold text-sm tracking-wide uppercase">Pathology / Blood Lab</p>
            <div className="mt-4 mb-2 text-center py-6 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-widest block font-bold mb-1">NOW SERVING</span>
              <span className="text-6xl font-black text-indigo-400 tracking-tight font-mono">
                LAB-{departments.lab.nowServing}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-center">
              <div className="bg-slate-800/80 p-3 rounded-lg">
                <span className="text-xs text-slate-400 block">Waiting</span>
                <span className="text-2xl font-bold text-amber-400">{departments.lab.waitingCount}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-lg">
                <span className="text-xs text-slate-400 block">Est. Time</span>
                <span className="text-2xl font-bold text-sky-400">
                  ~{departments.lab.waitingCount * 3 + departments.lab.delayMinutes}m
                </span>
              </div>
            </div>
          </div>

          {/* Pharmacy Big Screen */}
          <div className="bg-slate-900 border-2 border-teal-500/50 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-teal-500 text-slate-950 px-4 py-1 text-xs font-black tracking-wider uppercase rounded-bl-xl">
              COUNTER 1 & 2
            </div>
            <p className="text-teal-400 font-bold text-sm tracking-wide uppercase">Pharmacy Dispensing</p>
            <div className="mt-4 mb-2 text-center py-6 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 uppercase tracking-widest block font-bold mb-1">NOW SERVING</span>
              <span className="text-6xl font-black text-teal-400 tracking-tight font-mono">
                PH-{departments.pharmacy.nowServing}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-center">
              <div className="bg-slate-800/80 p-3 rounded-lg">
                <span className="text-xs text-slate-400 block">Waiting</span>
                <span className="text-2xl font-bold text-amber-400">{departments.pharmacy.waitingCount}</span>
              </div>
              <div className="bg-slate-800/80 p-3 rounded-lg">
                <span className="text-xs text-slate-400 block">Est. Time</span>
                <span className="text-2xl font-bold text-sky-400">
                  ~{Math.round(departments.pharmacy.waitingCount * 1.25) + departments.pharmacy.delayMinutes}m
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Notice Banner */}
        <div className="p-4 bg-red-950/90 border-2 border-red-500 text-red-200 rounded-2xl flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-red-400 shrink-0 animate-bounce" />
            <div>
              <p className="font-black text-red-100 text-base">
                {isHi
                  ? 'आपातकालीन कैजुअल्टी सूचना: आपातकालीन मरीज कतार छोड़ें।'
                  : 'EMERGENCY CASUALTY NOTICE: Emergency cases bypass the queue.'}
              </p>
              <p className="text-sm text-red-300">
                {isHi
                  ? 'सीधे कैजुअल्टी रूम 1 (भूतल, रेड कॉरिडोर) में संपर्क करें। कतार टोकन आवश्यक नहीं है।'
                  : 'Proceed directly to Casualty Room 1 (Ground Floor, Red Corridor). No queue token required.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/emergency')}
            className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl font-bold text-sm tracking-wide shrink-0 transition-colors shadow-lg"
          >
            {isHi ? 'इमरजेंसी मैप' : 'Emergency Route'}
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN REFACTORED HOMEPAGE (Patient & Staff View)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-12">
      {/* ─── Top Hackathon Context Banner ─── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-3 rounded-2xl shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs font-medium">
          <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[11px]">
            CYBER SAMVAD 2026
          </span>
          <span className="text-indigo-200">
            Problem Statement 3: <strong className="text-white">Smart Government Hospital Queue Management</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Real-time OPD Sync
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline">GMERS Medical College & Hospital</span>
        </div>
      </div>

      {/* ─── Multi-Level Token Management Callout ─── */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Multi-Level System
              </span>
              <span className="text-xs text-sky-100">LV1 → LV2 → LV3/LV4 → LV5</span>
            </div>
            <div className="text-sm font-bold mt-0.5">
              5-Stage Hospital Token Workflow & Patient Journey Traceability Active
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/multi-queue')}
          className="px-4 py-2 bg-white text-sky-900 hover:bg-sky-50 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 shrink-0"
        >
          Open Queue System <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ─── Requirement 2: Top Banner / Hero with Token Tracker & Audio ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white via-sky-50/40 to-indigo-50/30 p-6 md:p-8 rounded-3xl border border-sky-100/80 shadow-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left Text & Pitch */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-sky-100/80 text-sky-800 px-3 py-1 rounded-full text-xs font-bold mb-3 border border-sky-200">
              <Sparkles className="h-3.5 w-3.5 text-sky-600" />
              <span>{isHi ? 'डिजिटल ओपीडी कतार प्रबंधन' : 'Smart Digital OPD Queue Platform'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {t('title')}
            </h1>
            <p className="text-slate-600 text-base mt-2 leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          {/* Right: Audio Announcement Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={speakQueueStatus}
              className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-white shadow-lg transition-all ${
                isAnnouncing
                  ? 'bg-amber-600 ring-4 ring-amber-300 animate-pulse'
                  : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700'
              }`}
            >
              <Volume2 className={`h-5 w-5 ${isAnnouncing ? 'animate-bounce' : ''}`} />
              <div className="text-left">
                <span className="block text-sm leading-none font-bold">
                  🔊 {t('listenAudio')}
                </span>
                <span className="text-[11px] text-sky-100/90 font-medium">
                  {isHi ? 'ऑडियो घोषणा (हिंदी / अंग्रेज़ी)' : 'Voice Audio Guidance'}
                </span>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Token Tracker Input & Get New Token Row */}
        <div className="mt-7 pt-6 border-t border-slate-200/70">
          <form
            onSubmit={handleTrackSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder={isHi ? 'टोकन नंबर दर्ज करें (उदा. OPD-104)' : 'Enter Token Number (e.g. OPD-104)'}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent shadow-xs text-base tracking-wide uppercase"
              />
            </div>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-7 py-3.5 rounded-2xl transition-all shadow-md active:scale-95 shrink-0"
            >
              {t('trackStatus')}
            </button>

            <button
              type="button"
              onClick={() => handleGetNewToken(selectedDeptId)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
            >
              <PlusCircle className="h-5 w-5" />
              <span>{t('getNewToken')}</span>
            </button>
          </form>

          {/* Quick chip suggestions */}
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-700">{t('quickSelect')}</span>
            {['OPD-101', 'OPD-104', 'OPD-108', 'LAB-24', 'PH-65'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setInputToken(t);
                  trackToken(t);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono transition-colors border ${
                  userToken === t
                    ? 'bg-sky-600 text-white border-sky-600 font-bold'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── Requirement 3: 4 Department Cards ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isHi ? 'विभागवार कतार स्थिति' : 'Live Department Queue Status'}
            </h2>
            <p className="text-sm text-slate-500">
              {isHi ? 'किसी भी विभाग पर क्लिक करके उसका लाइव टोकन ट्रैक करें' : 'Click any department to switch active live tracking'}
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 font-medium px-3 py-1 rounded-full border border-slate-200">
            {isHi ? 'ऑटो-अपडेट सक्रिय' : 'Auto-sync: Active'}
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: General Medicine OPD */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => setSelectedDept('opd')}
            className={`cursor-pointer rounded-2xl p-6 transition-all border ${
              selectedDeptId === 'opd'
                ? 'bg-white ring-2 ring-sky-500 shadow-lg border-sky-200'
                : 'bg-white hover:border-sky-300 shadow-xs border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                <Stethoscope className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <h3 className="font-bold text-lg text-slate-900 mt-4">
              {isHi ? departments.opd.name.hi : departments.opd.name.en}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHi ? departments.opd.room.hi : departments.opd.room.en}
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">{isHi ? 'अभी बुलाया गया:' : 'Now Serving:'}</span>
                <span className="text-xl font-black text-sky-600 font-mono">OPD-{departments.opd.nowServing}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">{isHi ? 'प्रतीक्षारत:' : 'Waiting:'}</span>
                <span className="text-sm font-bold text-amber-600 font-mono">{departments.opd.waitingCount} patients</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">{isHi ? 'अनुमानित प्रतीक्षा:' : 'Est. Wait:'}</span>
                <span className="text-sm font-bold text-slate-700">
                  {departments.opd.waitingCount * 3 + departments.opd.delayMinutes} mins
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Pathology / Blood Lab */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => setSelectedDept('lab')}
            className={`cursor-pointer rounded-2xl p-6 transition-all border ${
              selectedDeptId === 'lab'
                ? 'bg-white ring-2 ring-indigo-500 shadow-lg border-indigo-200'
                : 'bg-white hover:border-indigo-300 shadow-xs border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FlaskConical className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                COLLECTING
              </span>
            </div>

            <h3 className="font-bold text-lg text-slate-900 mt-4">
              {isHi ? departments.lab.name.hi : departments.lab.name.en}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHi ? departments.lab.room.hi : departments.lab.room.en}
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">{isHi ? 'अभी बुलाया गया:' : 'Now Serving:'}</span>
                <span className="text-xl font-black text-indigo-600 font-mono">LAB-{departments.lab.nowServing}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">{isHi ? 'प्रतीक्षारत:' : 'Waiting:'}</span>
                <span className="text-sm font-bold text-amber-600 font-mono">{departments.lab.waitingCount} patients</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">{isHi ? 'अनुमानित प्रतीक्षा:' : 'Est. Wait:'}</span>
                <span className="text-sm font-bold text-slate-700">
                  {departments.lab.waitingCount * 3 + departments.lab.delayMinutes} mins
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Pharmacy Dispensing */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => setSelectedDept('pharmacy')}
            className={`cursor-pointer rounded-2xl p-6 transition-all border ${
              selectedDeptId === 'pharmacy'
                ? 'bg-white ring-2 ring-teal-500 shadow-lg border-teal-200'
                : 'bg-white hover:border-teal-300 shadow-xs border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                <Pill className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-200">
                DISPENSING
              </span>
            </div>

            <h3 className="font-bold text-lg text-slate-900 mt-4">
              {isHi ? departments.pharmacy.name.hi : departments.pharmacy.name.en}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isHi ? departments.pharmacy.room.hi : departments.pharmacy.room.en}
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">{isHi ? 'अभी बुलाया गया:' : 'Now Serving:'}</span>
                <span className="text-xl font-black text-teal-600 font-mono">PH-{departments.pharmacy.nowServing}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">{isHi ? 'प्रतीक्षारत:' : 'Waiting:'}</span>
                <span className="text-sm font-bold text-amber-600 font-mono">{departments.pharmacy.waitingCount} patients</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-medium">{isHi ? 'अनुमानित प्रतीक्षा:' : 'Est. Wait:'}</span>
                <span className="text-sm font-bold text-slate-700">
                  {Math.round(departments.pharmacy.waitingCount * 1.25) + departments.pharmacy.delayMinutes} mins
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Emergency Casualty Bypass Notice (Red Border) */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => navigate('/emergency')}
            className="cursor-pointer rounded-2xl p-6 bg-red-50/70 border-2 border-red-500 shadow-md relative overflow-hidden group hover:bg-red-100/70 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-red-600 text-white rounded-xl shadow-xs">
                  <ShieldAlert className="h-6 w-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                  ZERO WAIT
                </span>
              </div>

              <h3 className="font-extrabold text-lg text-red-900 mt-4 leading-snug">
                {isHi ? 'इमरजेंसी कैजुअल्टी बाईपास' : 'Emergency Casualty Bypass Notice'}
              </h3>
              
              <div className="p-3 bg-white/90 border border-red-200 rounded-xl mt-3">
                <p className="text-xs font-bold text-red-700 leading-relaxed">
                  {isHi
                    ? 'आपातकालीन मरीज कतार छोड़ें। सीधे कैजुअल्टी रूम 1 में संपर्क करें।'
                    : 'Emergency cases bypass the queue. Proceed directly to Casualty Room 1.'}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-red-200 flex items-center justify-between text-xs font-bold text-red-700 group-hover:text-red-900">
              <span>{isHi ? 'तुरंत रूट देखें' : 'Instant Emergency Route'}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Center Section (Live Token Card) & Right Sidebar (Staff Counter Simulator) ─── */}
      <div className="grid gap-7 lg:grid-cols-12">
        {/* ─── Requirement 4: Center Main Section - Live Token Card (Col-8) ─── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            {/* Header / Active Department Switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                    <Timer className="h-4 w-4" />
                  </span>
                  <h3 className="font-extrabold text-xl text-slate-900">
                    {isHi ? 'लाइव टोकन स्थिति व कतार प्रगति' : 'Live Token Tracker & Queue Position'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isHi ? 'सक्रिय विभाग:' : 'Active Department:'}{' '}
                  <strong className="text-slate-800">
                    {isHi ? currentDept.name.hi : currentDept.name.en} ({currentDept.room.en})
                  </strong>
                </p>
              </div>

              {/* Department Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSelectedDept('opd')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedDeptId === 'opd' ? 'bg-white text-sky-700 shadow-xs font-bold' : 'text-slate-600'
                  }`}
                >
                  OPD
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDept('lab')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedDeptId === 'lab' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600'
                  }`}
                >
                  LAB
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDept('pharmacy')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedDeptId === 'pharmacy' ? 'bg-white text-teal-700 shadow-xs font-bold' : 'text-slate-600'
                  }`}
                >
                  PHARMACY
                </button>
              </div>
            </div>

            {/* Delay Notice Banner if Doctor has a delay */}
            {currentDept.delayMinutes > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-5 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-amber-900 text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    {isHi
                      ? `⚠️ डॉक्टर परामर्श विलंब: +${currentDept.delayMinutes} मिनट जुड़े (जटिल केस समीक्षा)`
                      : `⚠️ Doctor Consultation Delay: +${currentDept.delayMinutes} mins added (Critical case review)`}
                  </span>
                </div>
                <span className="text-[11px] bg-amber-200/60 px-2 py-0.5 rounded-md font-bold">
                  {isHi ? 'समय समायोजित' : 'Recalculated'}
                </span>
              </motion.div>
            )}

            {/* 4 Essential Metrics of the Live Token Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {/* Metric 1: Your Token Number */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
                <span className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold block mb-1">
                  {isHi ? 'आपका टोकन' : 'YOUR TOKEN'}
                </span>
                <span className="text-3xl font-black font-mono tracking-tight text-white block">
                  {userToken}
                </span>
                <span className="inline-block mt-2 bg-indigo-500/30 text-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  {isBeingServed ? '🔔 YOUR TURN' : isPast ? 'COMPLETED' : 'IN QUEUE'}
                </span>
              </div>

              {/* Metric 2: Current Serving Token */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl shadow-xs">
                <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-bold block mb-1">
                  {isHi ? 'वर्तमान में सेवा' : 'CURRENT SERVING'}
                </span>
                <span className="text-3xl font-black font-mono tracking-tight text-emerald-800 block">
                  {currentDept.prefix}-{currentDept.nowServing}
                </span>
                <span className="inline-flex items-center gap-1 mt-2 text-emerald-700 text-[10px] font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  In Consultation
                </span>
              </div>

              {/* Metric 3: Tokens Ahead of You */}
              <div className="bg-sky-50/70 border border-sky-200 p-5 rounded-2xl shadow-xs">
                <span className="text-[10px] uppercase tracking-wider text-sky-700 font-bold block mb-1">
                  {isHi ? 'आपके आगे मरीज' : 'TOKENS AHEAD'}
                </span>
                <span className="text-3xl font-black font-mono tracking-tight text-sky-900 block">
                  {tokensAhead}
                </span>
                <span className="inline-block mt-2 text-sky-600 text-[10px] font-medium">
                  {tokensAhead === 0 ? 'You are next!' : `${tokensAhead} patients waiting`}
                </span>
              </div>

              {/* Metric 4: Dynamic Estimated Wait Time */}
              <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl shadow-xs">
                <span className="text-[10px] uppercase tracking-wider text-amber-700 font-bold block mb-1">
                  {isHi ? 'अनुमानित प्रतीक्षा' : 'EST. WAIT TIME'}
                </span>
                <span className="text-3xl font-black font-mono tracking-tight text-amber-900 block">
                  ~{dynamicWaitTime} <span className="text-sm font-sans font-bold">min</span>
                </span>
                <span className="inline-block mt-2 text-amber-700 text-[10px] font-medium">
                  {currentDept.delayMinutes > 0 ? `Includes +${currentDept.delayMinutes}m delay` : 'On schedule'}
                </span>
              </div>
            </div>

            {/* Turn Announcement Banner when your token is called! */}
            {isBeingServed && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="mt-6 p-4 bg-emerald-500 text-white rounded-2xl shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-7 w-7 text-white shrink-0 animate-bounce" />
                  <div>
                    <h4 className="font-extrabold text-base">
                      {isHi ? '🎉 आपकी बारी आ गई है!' : '🎉 IT IS YOUR TURN!'}
                    </h4>
                    <p className="text-xs text-emerald-100">
                      {isHi
                        ? `टोकन ${userToken}: कृपया तुरंत ${currentDept.room.hi} में डॉक्टर के पास जाएं।`
                        : `Token ${userToken}: Please enter ${currentDept.room.en} now.`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/navigate')}
                  className="bg-white text-emerald-800 font-bold px-4 py-2 rounded-xl text-xs shadow-md shrink-0 hover:bg-emerald-50 transition-colors"
                >
                  {isHi ? 'कमरा खोजें' : 'Guide Me'}
                </button>
              </motion.div>
            )}

            {/* ─── Horizontal Visual Progress Bar (Requirement 4) ─── */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Queue Sequence & Progress</span>
                  <span className="text-xs font-normal text-slate-500">
                    ({currentDept.prefix}-{currentDept.nowServing} → {userToken})
                  </span>
                </h4>
                <span className="text-xs font-semibold text-sky-700">
                  {tokensAhead === 0 ? 'Now Serving You' : `${tokensAhead} step${tokensAhead > 1 ? 's' : ''} away`}
                </span>
              </div>

              {/* Progress Tracker Graphic */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 overflow-x-auto">
                <div className="flex items-center justify-between min-w-[500px] relative">
                  {/* Connecting Line */}
                  <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 z-0"></div>
                  
                  {/* Active Highlight Line */}
                  <div
                    className="absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 z-0 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(10, (1 - tokensAhead / Math.max(tokensAhead + 1, 4)) * 100))}%`,
                    }}
                  ></div>

                  {/* Render sequential nodes */}
                  {progressSteps.slice(0, 6).map((step, idx) => {
                    return (
                      <div key={step.tokenStr} className="relative z-10 flex flex-col items-center">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                            step.isCurrent
                              ? 'bg-emerald-500 text-white ring-4 ring-emerald-200 animate-pulse'
                              : step.isUser
                              ? 'bg-gradient-to-br from-indigo-600 to-sky-600 text-white ring-4 ring-sky-200'
                              : step.isCompleted
                              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-400'
                              : 'bg-white text-slate-600 border-2 border-slate-300'
                          }`}
                        >
                          {step.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            step.tokenStr.split('-')[1]
                          )}
                        </div>

                        <span
                          className={`mt-2 text-[11px] font-mono font-bold ${
                            step.isUser ? 'text-indigo-600' : step.isCurrent ? 'text-emerald-600' : 'text-slate-600'
                          }`}
                        >
                          {step.tokenStr}
                        </span>

                        <span className="text-[10px] font-medium text-slate-400">
                          {step.isCurrent ? 'Serving' : step.isUser ? 'YOUR TOKEN' : `Wait #${idx}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Wayfinding CTA */}
              <div className="mt-5 flex items-center justify-between bg-sky-50/60 p-4 rounded-xl border border-sky-100">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-sky-600 shrink-0" />
                  <p className="text-xs text-slate-700">
                    Need directions to <strong>{currentDept.room.en}</strong>? Follow turn-by-turn indoor navigation map.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/navigate')}
                  className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1 shrink-0"
                >
                  <span>Open Map</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Requirement 5: Right Sidebar - Staff Counter Simulator (Col-4) ─── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border-2 border-slate-900/10 rounded-3xl p-6 shadow-md relative overflow-hidden">
            {/* Simulator Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <UserCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    {isHi ? 'स्टाफ काउंटर सिमुलेटर' : 'Staff Counter Simulator'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Dr. Rajesh Patel • Counter 3
                  </p>
                </div>
              </div>
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-wide">
                STAFF LIVE
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-3 leading-relaxed">
              {isHi
                ? 'नीचे दिए गए बटनों पर क्लिक करके डॉक्टर परामर्श को आगे बढ़ाएं। लाइव टोकन कार्ड स्वतः अपडेट होगा।'
                : 'Operate the clinic counter simulator below. Clicking buttons reactively updates the Live Token Card and recalculates wait times.'}
            </p>

            {/* Simulator Interactive Buttons (Requirement 5) */}
            <div className="grid grid-cols-1 gap-3 mt-5">
              {/* Button 1: [ Call Next ] */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  callNextToken();
                  toast.success(
                    isHi
                      ? `टोकन ${currentDept.prefix}-${currentDept.nowServing + 1} को काउंटर पर बुलाया गया`
                      : `Token ${currentDept.prefix}-${currentDept.nowServing + 1} called to counter`
                  );
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2.5 transition-colors text-sm"
              >
                <Volume2 className="h-4 w-4" />
                <span>[ Call Next ]</span>
              </motion.button>

              {/* Button 2: [ Mark Done ] */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  markConsultationDone();
                  toast.info(
                    isHi
                      ? 'परामर्श पूर्ण दर्ज किया गया। काउंटर तैयार।'
                      : 'Consultation marked completed. Counter ready.'
                  );
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold p-3 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>[ Mark Done ]</span>
              </motion.button>

              {/* Button 3: [ No-Show ] */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  markNoShow();
                  toast.warning(
                    isHi
                      ? 'मरीज अनुपस्थित (No-Show)। अगला टोकन स्वतः बुलाया गया।'
                      : 'Patient marked No-Show. Next token called.'
                  );
                }}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold p-3 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>[ No-Show ]</span>
              </motion.button>

              {/* Button 4: [ Doctor Delayed (+5 mins) ] */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  addDoctorDelay(5);
                  toast.warning(
                    isHi
                      ? 'डॉक्टर विलंब: +5 मिनट प्रतीक्षा समय जोड़ा गया'
                      : 'Doctor Delayed: +5 mins added to estimated wait'
                  );
                }}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold p-3 rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Clock className="h-4 w-4 text-rose-600" />
                <span>[ Doctor Delayed (+5 mins) ]</span>
              </motion.button>
            </div>

            {/* Live Counter Event Log */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Counter Activity Log
                </span>
                <button
                  onClick={() => {
                    resetToDefault();
                    toast.success('Simulation reset to initial values');
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {logs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2"
                  >
                    <span className="font-mono text-[10px] text-slate-400 mt-0.5 shrink-0">
                      {log.time}
                    </span>
                    <span className="text-slate-700 leading-tight">
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-5 text-xs text-slate-600">
            <h4 className="font-bold text-sky-900 mb-1">Cyber Samvad 2026 Innovation</h4>
            <p className="leading-relaxed">
              This simulator demonstrates dynamic queue balancing, automated turn-by-turn SMS/voice notifications, and emergency casualty bypass protocol.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Digital Token Receipt Modal (When user clicks "+ Get New Token") ─── */}
      <AnimatePresence>
        {showTokenReceipt && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border text-center"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                DIGITAL QUEUE PASS ISSUED
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                {issuedTokenInfo}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                GMERS Medical College • {currentDept.name.en}
              </p>

              <div className="bg-slate-50 border rounded-2xl p-4 my-5 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Room:</span>
                  <span className="font-bold text-slate-900">{currentDept.room.en}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Now Serving:</span>
                  <span className="font-bold text-emerald-600">{currentDept.prefix}-{currentDept.nowServing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patients Ahead:</span>
                  <span className="font-bold text-amber-600">{tokensAhead} patients</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Wait:</span>
                  <span className="font-bold text-slate-900">~{dynamicWaitTime} mins</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowTokenReceipt(false);
                    speakQueueStatus();
                  }}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl text-xs transition-colors"
                >
                  🔊 Hear Status
                </button>
                <button
                  onClick={() => setShowTokenReceipt(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
