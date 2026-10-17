import React, { useState } from 'react';
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
        {/* TV Header Bar - Deep Indigo with white text */}
        <div className="bg-[#3E36B0] text-white p-6 rounded-2xl md:rounded-3xl shadow-[0_8px_30px_rgba(62,54,176,0.25)] flex flex-col md:flex-row justify-between items-center gap-4 border border-[#A6DEF7]/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#F62088] rounded-2xl animate-pulse shadow-md">
              <Radio className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#A6DEF7] text-[#3E36B0] text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  PUBLIC DISPLAY BOARD • WAITING HALL A
                </span>
                <span className="bg-[#1B8B8E] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  LIVE SYNC
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
                {isHi ? 'एम्स / जीएमईआरएस अस्पताल - लाइव टोकन डिस्प्ले' : 'GMERS Hospital - Live Public Queue Display'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={speakQueueStatus}
              className="flex items-center gap-2 bg-[#002BFF] hover:bg-[#0022CC] text-white px-5 py-2.5 rounded-2xl font-bold transition-all shadow-md active:scale-95"
            >
              <Volume2 className="h-5 w-5" />
              <span>{isHi ? 'घोषणा सुनें' : 'Audio Announce'}</span>
            </button>
            <button
              onClick={() => setRoleView('patient')}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-2xl text-sm font-semibold border border-white/20 transition-colors"
            >
              {isHi ? 'मरीज दृश्य पर लौटें' : 'Exit Display View'}
            </button>
          </div>
        </div>

        {/* Big Screen Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* OPD Big Screen */}
          <div className="bg-white border-2 border-[#A6DEF7] rounded-3xl p-6 shadow-[0_8px_24px_rgba(62,54,176,0.08)] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#3E36B0] text-white px-4 py-1 text-xs font-bold tracking-wider uppercase rounded-bl-2xl">
              ROOM 104
            </div>
            <p className="text-[#3E36B0] font-bold text-sm tracking-wide uppercase">General Medicine OPD</p>
            <div className="mt-4 mb-2 text-center py-6 bg-[#F8FAFC] rounded-2xl border border-[#A6DEF7]/40">
              <span className="text-xs text-[#4B5563] uppercase tracking-widest block font-bold mb-1">NOW SERVING</span>
              <span className="text-6xl font-bold text-[#111111] tracking-tight font-mono">
                OPD-{departments.opd.nowServing}
              </span>
              <div className="mt-2">
                <span className="bg-[#1B8B8E] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Active Consultation
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-center">
              <div className="bg-[#F0F9FD] p-3 rounded-2xl border border-[#A6DEF7]/50">
                <span className="text-xs text-[#4B5563] block font-normal">Waiting</span>
                <span className="text-2xl font-bold text-[#111111]">{departments.opd.waitingCount}</span>
              </div>
              <div className="bg-[#F0F9FD] p-3 rounded-2xl border border-[#A6DEF7]/50">
                <span className="text-xs text-[#4B5563] block font-normal">Est. Time</span>
                <span className="text-2xl font-bold text-[#111111]">
                  ~{departments.opd.waitingCount * 3 + departments.opd.delayMinutes}m
                </span>
              </div>
            </div>
          </div>

          {/* Pathology Lab Big Screen */}
          <div className="bg-white border-2 border-[#A6DEF7] rounded-3xl p-6 shadow-[0_8px_24px_rgba(62,54,176,0.08)] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#3E36B0] text-white px-4 py-1 text-xs font-bold tracking-wider uppercase rounded-bl-2xl">
              LAB HALL A
            </div>
            <p className="text-[#3E36B0] font-bold text-sm tracking-wide uppercase">Pathology / Blood Lab</p>
            <div className="mt-4 mb-2 text-center py-6 bg-[#F8FAFC] rounded-2xl border border-[#A6DEF7]/40">
              <span className="text-xs text-[#4B5563] uppercase tracking-widest block font-bold mb-1">NOW SERVING</span>
              <span className="text-6xl font-bold text-[#111111] tracking-tight font-mono">
                LAB-{departments.lab.nowServing}
              </span>
              <div className="mt-2">
                <span className="bg-[#1B8B8E] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Collecting Samples
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-center">
              <div className="bg-[#F0F9FD] p-3 rounded-2xl border border-[#A6DEF7]/50">
                <span className="text-xs text-[#4B5563] block font-normal">Waiting</span>
                <span className="text-2xl font-bold text-[#111111]">{departments.lab.waitingCount}</span>
              </div>
              <div className="bg-[#F0F9FD] p-3 rounded-2xl border border-[#A6DEF7]/50">
                <span className="text-xs text-[#4B5563] block font-normal">Est. Time</span>
                <span className="text-2xl font-bold text-[#111111]">
                  ~{departments.lab.waitingCount * 3 + departments.lab.delayMinutes}m
                </span>
              </div>
            </div>
          </div>

          {/* Pharmacy Big Screen */}
          <div className="bg-white border-2 border-[#A6DEF7] rounded-3xl p-6 shadow-[0_8px_24px_rgba(62,54,176,0.08)] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#3E36B0] text-white px-4 py-1 text-xs font-bold tracking-wider uppercase rounded-bl-2xl">
              COUNTER 1 & 2
            </div>
            <p className="text-[#3E36B0] font-bold text-sm tracking-wide uppercase">Pharmacy Dispensing</p>
            <div className="mt-4 mb-2 text-center py-6 bg-[#F8FAFC] rounded-2xl border border-[#A6DEF7]/40">
              <span className="text-xs text-[#4B5563] uppercase tracking-widest block font-bold mb-1">NOW SERVING</span>
              <span className="text-6xl font-bold text-[#111111] tracking-tight font-mono">
                PH-{departments.pharmacy.nowServing}
              </span>
              <div className="mt-2">
                <span className="bg-[#1B8B8E] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Dispensing Drugs
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-center">
              <div className="bg-[#F0F9FD] p-3 rounded-2xl border border-[#A6DEF7]/50">
                <span className="text-xs text-[#4B5563] block font-normal">Waiting</span>
                <span className="text-2xl font-bold text-[#111111]">{departments.pharmacy.waitingCount}</span>
              </div>
              <div className="bg-[#F0F9FD] p-3 rounded-2xl border border-[#A6DEF7]/50">
                <span className="text-xs text-[#4B5563] block font-normal">Est. Time</span>
                <span className="text-2xl font-bold text-[#111111]">
                  ~{Math.round(departments.pharmacy.waitingCount * 1.25) + departments.pharmacy.delayMinutes}m
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Notice Banner - Vivid Magenta with white bold text */}
        <div className="p-5 bg-[#F62088] text-white rounded-2xl md:rounded-3xl flex items-center justify-between shadow-[0_8px_30px_rgba(246,32,136,0.3)] border-2 border-[#F62088]">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-white shrink-0 animate-bounce" />
            <div>
              <p className="font-bold text-white text-base md:text-lg">
                {isHi
                  ? 'आपातकालीन कैजुअल्टी सूचना: आपातकालीन मरीज कतार छोड़ें।'
                  : 'EMERGENCY CASUALTY NOTICE: Emergency cases bypass the queue.'}
              </p>
              <p className="text-sm font-medium text-white/90">
                {isHi
                  ? 'सीधे कैजुअल्टी रूम 1 (भूतल, रेड कॉरिडोर) में संपर्क करें। कतार टोकन आवश्यक नहीं है।'
                  : 'Proceed directly to Casualty Room 1 (Ground Floor, Red Corridor). No queue token required.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/emergency')}
            className="bg-white text-[#F62088] hover:bg-slate-100 px-5 py-2.5 rounded-2xl font-bold text-sm tracking-wide shrink-0 transition-all shadow-md active:scale-95"
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
      {/* ─── Top Hackathon Context Banner - Deep Indigo #3E36B0 with white text ─── */}
      <div className="bg-[#3E36B0] text-white px-6 py-3.5 rounded-2xl shadow-[0_4px_16px_rgba(62,54,176,0.2)] border border-[#A6DEF7]/30 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs font-medium">
          <span className="bg-[#A6DEF7] text-[#3E36B0] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[11px]">
            CYBER SAMVAD 2026
          </span>
          <span className="text-white/90">
            Problem Statement 3: <strong className="text-white font-bold">Smart Government Hospital Queue Management</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/90">
          <span className="flex items-center gap-1.5 text-white font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A6DEF7] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A6DEF7]"></span>
            </span>
            Real-time OPD Sync
          </span>
          <span className="hidden sm:inline text-white/40">•</span>
          <span className="hidden sm:inline font-medium">GMERS Medical College & Hospital</span>
        </div>
      </div>

      {/* ─── Multi-Level Token Management Callout ─── */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#A6DEF7]/70 shadow-[0_4px_20px_-2px_rgba(62,54,176,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#A6DEF7]/25 text-[#3E36B0] rounded-2xl shrink-0 border border-[#A6DEF7]/50">
            <Sparkles className="w-5 h-5 text-[#3E36B0]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#3E36B0] text-white px-2.5 py-0.5 rounded-full">
                Multi-Level System
              </span>
              <span className="text-xs font-semibold text-[#1B8B8E]">LV1 → LV2 → LV3/LV4 → LV5</span>
            </div>
            <div className="text-sm font-bold text-[#111111] mt-1">
              5-Stage Hospital Token Workflow & Patient Journey Traceability Active
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/multi-queue')}
          className="px-5 py-2.5 bg-[#3E36B0] hover:bg-[#302991] text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 active:scale-95"
        >
          <span>Open Queue System</span> <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ─── Requirement 2: Top Banner / Hero with Token Tracker & Audio ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 md:p-8 rounded-3xl border border-[#A6DEF7]/60 shadow-[0_4px_24px_-2px_rgba(62,54,176,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] relative overflow-hidden"
      >
        {/* Soft Sky Blue (#A6DEF7) accent highlights */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#A6DEF7]/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left Text & Pitch */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#A6DEF7]/20 text-[#3E36B0] px-3 py-1 rounded-full text-xs font-bold mb-3 border border-[#A6DEF7]/60">
              <Sparkles className="h-3.5 w-3.5 text-[#3E36B0]" />
              <span>{isHi ? 'डिजिटल ओपीडी कतार प्रबंधन' : 'Smart Digital OPD Queue Platform'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111111] leading-tight">
              {t('title')}
            </h1>
            <p className="text-[#4B5563] text-sm md:text-base font-normal mt-2 leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          {/* Right: Audio Guidance Button - Electric Blue (#002BFF) with Sky Blue (#A6DEF7) badge highlights */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={speakQueueStatus}
              className={`flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-white transition-all shadow-[0_4px_18px_rgba(0,43,255,0.35)] ${
                isAnnouncing
                  ? 'bg-[#002BFF] ring-4 ring-[#A6DEF7] animate-pulse'
                  : 'bg-[#002BFF] hover:bg-[#0022CC]'
              }`}
            >
              <Volume2 className={`h-5 w-5 text-white ${isAnnouncing ? 'animate-bounce' : ''}`} />
              <div className="text-left">
                <span className="block text-sm leading-none font-bold text-white">
                  🔊 {t('listenAudio')}
                </span>
                <span className="inline-block mt-1 text-[11px] bg-[#A6DEF7] text-[#002BFF] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {isHi ? 'ऑडियो घोषणा (हिंदी / अंग्रेज़ी)' : 'Voice Audio Guidance'}
                </span>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Token Tracker Input & Get New Token Row */}
        <div className="mt-7 pt-6 border-t border-slate-100">
          <form
            onSubmit={handleTrackSubmit}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#3E36B0]" />
              <input
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder={isHi ? 'टोकन नंबर दर्ज करें (उदा. OPD-104)' : 'Enter Token Number (e.g. OPD-104)'}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#A6DEF7] rounded-2xl text-[#111111] font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3E36B0] focus:border-transparent shadow-xs text-base tracking-wide uppercase transition-all"
              />
            </div>

            {/* Main Action Button 1: Track Status - Deep Indigo (#3E36B0) with white text */}
            <button
              type="submit"
              className="bg-[#3E36B0] hover:bg-[#302991] text-white font-bold px-7 py-3.5 rounded-2xl transition-all shadow-md active:scale-95 shrink-0"
            >
              {t('trackStatus')}
            </button>

            {/* Main Action Button 2: Get New Token - Deep Teal (#1B8B8E) pill/button */}
            <button
              type="button"
              onClick={() => handleGetNewToken(selectedDeptId)}
              className="bg-[#1B8B8E] hover:bg-[#146B6E] text-white font-bold px-5 py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
            >
              <PlusCircle className="h-5 w-5" />
              <span>{t('getNewToken')}</span>
            </button>
          </form>

          {/* Quick chip suggestions */}
          <div className="flex items-center gap-2 mt-3.5 text-xs text-[#4B5563] flex-wrap">
            <span className="font-semibold text-[#111111]">{t('quickSelect')}</span>
            {['OPD-101', 'OPD-104', 'OPD-108', 'LAB-24', 'PH-65'].map((tVal) => (
              <button
                key={tVal}
                type="button"
                onClick={() => {
                  setInputToken(tVal);
                  trackToken(tVal);
                }}
                className={`px-3 py-1 rounded-xl font-mono font-bold transition-all border ${
                  userToken === tVal
                    ? 'bg-[#3E36B0] text-white border-[#3E36B0] shadow-xs'
                    : 'bg-white hover:bg-[#F0F9FD] text-[#111111] border-[#A6DEF7]/60'
                }`}
              >
                {tVal}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ─── Requirement 3: 4 Department Cards ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#111111]">
              {isHi ? 'विभागवार कतार स्थिति' : 'Live Department Queue Status'}
            </h2>
            <p className="text-xs md:text-sm text-[#4B5563] font-normal">
              {isHi ? 'किसी भी विभाग पर क्लिक करके उसका लाइव टोकन ट्रैक करें' : 'Click any department to switch active live tracking'}
            </p>
          </div>
          <span className="text-xs bg-[#F0F9FD] text-[#3E36B0] font-bold px-3 py-1 rounded-full border border-[#A6DEF7]/60">
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
                ? 'bg-white ring-2 ring-[#3E36B0] shadow-[0_8px_24px_rgba(62,54,176,0.12)] border-[#3E36B0]'
                : 'bg-white hover:border-[#3E36B0]/50 shadow-[0_4px_20px_-2px_rgba(62,54,176,0.06)] border-[#A6DEF7]/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-[#A6DEF7]/20 text-[#3E36B0] rounded-2xl border border-[#A6DEF7]/40">
                <Stethoscope className="h-6 w-6" />
              </div>
              {/* Active Serving Tokens & Completed Status: Deep Teal (#1B8B8E) pill tags */}
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#1B8B8E] text-white px-2.5 py-1 rounded-full shadow-xs">
                ACTIVE
              </span>
            </div>

            <h3 className="font-bold text-lg text-[#111111] mt-4">
              {isHi ? departments.opd.name.hi : departments.opd.name.en}
            </h3>
            <p className="text-xs text-[#4B5563] font-normal mt-0.5">
              {isHi ? departments.opd.room.hi : departments.opd.room.en}
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#4B5563] font-normal">{isHi ? 'अभी बुलाया गया:' : 'Now Serving:'}</span>
                <span className="text-xl font-bold text-[#111111] font-mono">OPD-{departments.opd.nowServing}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#4B5563] font-normal">{isHi ? 'प्रतीक्षारत:' : 'Waiting:'}</span>
                <span className="text-sm font-bold text-[#111111] font-mono">{departments.opd.waitingCount} patients</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#4B5563] font-normal">{isHi ? 'अनुमानित प्रतीक्षा:' : 'Est. Wait:'}</span>
                <span className="text-sm font-bold text-[#111111]">
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
                ? 'bg-white ring-2 ring-[#3E36B0] shadow-[0_8px_24px_rgba(62,54,176,0.12)] border-[#3E36B0]'
                : 'bg-white hover:border-[#3E36B0]/50 shadow-[0_4px_20px_-2px_rgba(62,54,176,0.06)] border-[#A6DEF7]/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-[#A6DEF7]/20 text-[#3E36B0] rounded-2xl border border-[#A6DEF7]/40">
                <FlaskConical className="h-6 w-6" />
              </div>
              {/* Deep Teal (#1B8B8E) pill tags */}
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#1B8B8E] text-white px-2.5 py-1 rounded-full shadow-xs">
                COLLECTING
              </span>
            </div>

            <h3 className="font-bold text-lg text-[#111111] mt-4">
              {isHi ? departments.lab.name.hi : departments.lab.name.en}
            </h3>
            <p className="text-xs text-[#4B5563] font-normal mt-0.5">
              {isHi ? departments.lab.room.hi : departments.lab.room.en}
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#4B5563] font-normal">{isHi ? 'अभी बुलाया गया:' : 'Now Serving:'}</span>
                <span className="text-xl font-bold text-[#111111] font-mono">LAB-{departments.lab.nowServing}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#4B5563] font-normal">{isHi ? 'प्रतीक्षारत:' : 'Waiting:'}</span>
                <span className="text-sm font-bold text-[#111111] font-mono">{departments.lab.waitingCount} patients</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#4B5563] font-normal">{isHi ? 'अनुमानित प्रतीक्षा:' : 'Est. Wait:'}</span>
                <span className="text-sm font-bold text-[#111111]">
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
                ? 'bg-white ring-2 ring-[#3E36B0] shadow-[0_8px_24px_rgba(62,54,176,0.12)] border-[#3E36B0]'
                : 'bg-white hover:border-[#3E36B0]/50 shadow-[0_4px_20px_-2px_rgba(62,54,176,0.06)] border-[#A6DEF7]/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-[#A6DEF7]/20 text-[#3E36B0] rounded-2xl border border-[#A6DEF7]/40">
                <Pill className="h-6 w-6" />
              </div>
              {/* Deep Teal (#1B8B8E) pill tags */}
              <span className="text-[11px] font-bold uppercase tracking-wider bg-[#1B8B8E] text-white px-2.5 py-1 rounded-full shadow-xs">
                DISPENSING
              </span>
            </div>

            <h3 className="font-bold text-lg text-[#111111] mt-4">
              {isHi ? departments.pharmacy.name.hi : departments.pharmacy.name.en}
            </h3>
            <p className="text-xs text-[#4B5563] font-normal mt-0.5">
              {isHi ? departments.pharmacy.room.hi : departments.pharmacy.room.en}
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#4B5563] font-normal">{isHi ? 'अभी बुलाया गया:' : 'Now Serving:'}</span>
                <span className="text-xl font-bold text-[#111111] font-mono">PH-{departments.pharmacy.nowServing}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#4B5563] font-normal">{isHi ? 'प्रतीक्षारत:' : 'Waiting:'}</span>
                <span className="text-sm font-bold text-[#111111] font-mono">{departments.pharmacy.waitingCount} patients</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-[#4B5563] font-normal">{isHi ? 'अनुमानित प्रतीक्षा:' : 'Est. Wait:'}</span>
                <span className="text-sm font-bold text-[#111111]">
                  {Math.round(departments.pharmacy.waitingCount * 1.25) + departments.pharmacy.delayMinutes} mins
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Emergency Casualty Bypass Notice - Vivid Magenta (#F62088) with white bold text */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => navigate('/emergency')}
            className="cursor-pointer rounded-2xl p-6 bg-[#F62088] text-white shadow-[0_8px_24px_rgba(246,32,136,0.35)] relative overflow-hidden group hover:bg-[#D81473] transition-all flex flex-col justify-between border-2 border-[#F62088]"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="p-3 bg-white/20 text-white rounded-2xl shadow-xs backdrop-blur-xs">
                  <ShieldAlert className="h-6 w-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-[#F62088] px-2.5 py-0.5 rounded-full shadow-xs">
                  ZERO WAIT
                </span>
              </div>

              <h3 className="font-bold text-lg text-white mt-4 leading-snug">
                {isHi ? 'इमरजेंसी कैजुअल्टी बाईपास' : 'Emergency Casualty Bypass Notice'}
              </h3>
              
              <div className="p-3.5 bg-white/15 border border-white/30 rounded-2xl mt-3 backdrop-blur-xs">
                <p className="text-xs font-bold text-white leading-relaxed">
                  {isHi
                    ? 'आपातकालीन मरीज कतार छोड़ें। सीधे कैजुअल्टी रूम 1 में संपर्क करें।'
                    : 'Emergency cases bypass the queue. Proceed directly to Casualty Room 1.'}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/25 flex items-center justify-between text-xs font-bold text-white group-hover:underline">
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
          <div className="bg-white border border-[#A6DEF7]/60 rounded-3xl p-6 md:p-8 shadow-[0_4px_24px_-2px_rgba(62,54,176,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)]">
            {/* Header / Active Department Switcher */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#A6DEF7]/20 text-[#3E36B0] rounded-xl border border-[#A6DEF7]/40">
                    <Timer className="h-4 w-4 text-[#3E36B0]" />
                  </span>
                  <h3 className="font-bold text-xl text-[#111111]">
                    {isHi ? 'लाइव टोकन स्थिति व कतार प्रगति' : 'Live Token Tracker & Queue Position'}
                  </h3>
                </div>
                <p className="text-xs text-[#4B5563] font-normal mt-1">
                  {isHi ? 'सक्रिय विभाग:' : 'Active Department:'}{' '}
                  <strong className="text-[#111111] font-bold">
                    {isHi ? currentDept.name.hi : currentDept.name.en} ({currentDept.room.en})
                  </strong>
                </p>
              </div>

              {/* Department Tabs */}
              <div className="flex items-center bg-[#F1F5F9] p-1 rounded-2xl border border-slate-200 text-xs font-semibold shadow-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDept('opd')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all duration-150 ${
                    selectedDeptId === 'opd'
                      ? 'bg-[#3E36B0] text-white shadow-xs font-bold'
                      : 'text-[#111111] hover:bg-white/70'
                  }`}
                >
                  OPD
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDept('lab')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all duration-150 ${
                    selectedDeptId === 'lab'
                      ? 'bg-[#3E36B0] text-white shadow-xs font-bold'
                      : 'text-[#111111] hover:bg-white/70'
                  }`}
                >
                  LAB
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDept('pharmacy')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all duration-150 ${
                    selectedDeptId === 'pharmacy'
                      ? 'bg-[#3E36B0] text-white shadow-xs font-bold'
                      : 'text-[#111111] hover:bg-white/70'
                  }`}
                >
                  PHARMACY
                </button>
              </div>
            </div>

            {/* Delay Notice Banner if Doctor has a delay - Vivid Magenta (#F62088) with white bold text */}
            {currentDept.delayMinutes > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-5 p-4 bg-[#F62088] text-white rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-white shrink-0" />
                  <span>
                    {isHi
                      ? `⚠️ डॉक्टर परामर्श विलंब: +${currentDept.delayMinutes} मिनट जुड़े (जटिल केस समीक्षा)`
                      : `⚠️ Doctor Consultation Delay: +${currentDept.delayMinutes} mins added (Critical case review)`}
                  </span>
                </div>
                <span className="text-[11px] bg-white text-[#F62088] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  {isHi ? 'समय समायोजित' : 'Recalculated'}
                </span>
              </motion.div>
            )}

            {/* 4 Essential Metrics of the Live Token Card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {/* Metric 1: Your Token Number - Deep Indigo (#3E36B0) with white text */}
              <div className="bg-[#3E36B0] text-white p-5 rounded-2xl shadow-[0_4px_16px_rgba(62,54,176,0.2)] relative overflow-hidden border border-[#A6DEF7]/40">
                <span className="text-[10px] uppercase tracking-wider text-[#A6DEF7] font-bold block mb-1">
                  {isHi ? 'आपका टोकन' : 'YOUR TOKEN'}
                </span>
                <span className="text-3xl font-bold font-mono tracking-tight text-white block">
                  {userToken}
                </span>
                <span className="inline-block mt-2 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                  {isBeingServed ? '🔔 YOUR TURN' : isPast ? 'COMPLETED' : 'IN QUEUE'}
                </span>
              </div>

              {/* Metric 2: Current Serving Token - Deep Teal (#1B8B8E) pill tags & high contrast #111111 number */}
              <div className="bg-white border border-[#A6DEF7] p-5 rounded-2xl shadow-xs">
                <span className="text-[10px] uppercase tracking-wider text-[#1B8B8E] font-bold block mb-1">
                  {isHi ? 'वर्तमान में सेवा' : 'CURRENT SERVING'}
                </span>
                <span className="text-3xl font-bold font-mono tracking-tight text-[#111111] block">
                  {currentDept.prefix}-{currentDept.nowServing}
                </span>
                <span className="inline-flex items-center gap-1 mt-2 bg-[#1B8B8E] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
                  In Consultation
                </span>
              </div>

              {/* Metric 3: Tokens Ahead of You */}
              <div className="bg-white border border-[#A6DEF7] p-5 rounded-2xl shadow-xs">
                <span className="text-[10px] uppercase tracking-wider text-[#4B5563] font-bold block mb-1">
                  {isHi ? 'आपके आगे मरीज' : 'TOKENS AHEAD'}
                </span>
                <span className="text-3xl font-bold font-mono tracking-tight text-[#111111] block">
                  {tokensAhead}
                </span>
                <span className="inline-block mt-2 text-[#4B5563] text-[10px] font-normal">
                  {tokensAhead === 0 ? 'You are next!' : `${tokensAhead} patients waiting`}
                </span>
              </div>

              {/* Metric 4: Dynamic Estimated Wait Time */}
              <div className="bg-white border border-[#A6DEF7] p-5 rounded-2xl shadow-xs">
                <span className="text-[10px] uppercase tracking-wider text-[#4B5563] font-bold block mb-1">
                  {isHi ? 'अनुमानित प्रतीक्षा' : 'EST. WAIT TIME'}
                </span>
                <span className="text-3xl font-bold font-mono tracking-tight text-[#111111] block">
                  ~{dynamicWaitTime} <span className="text-sm font-normal">min</span>
                </span>
                <span className="inline-block mt-2 text-[#4B5563] text-[10px] font-normal">
                  {currentDept.delayMinutes > 0 ? `Includes +${currentDept.delayMinutes}m delay` : 'On schedule'}
                </span>
              </div>
            </div>

            {/* Turn Announcement Banner when your token is called! - Deep Teal (#1B8B8E) */}
            {isBeingServed && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="mt-6 p-4 bg-[#1B8B8E] text-white rounded-2xl shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-7 w-7 text-white shrink-0 animate-bounce" />
                  <div>
                    <h4 className="font-bold text-base">
                      {isHi ? '🎉 आपकी बारी आ गई है!' : '🎉 IT IS YOUR TURN!'}
                    </h4>
                    <p className="text-xs font-normal text-white/90">
                      {isHi
                        ? `टोकन ${userToken}: कृपया तुरंत ${currentDept.room.hi} में डॉक्टर के पास जाएं।`
                        : `Token ${userToken}: Please enter ${currentDept.room.en} now.`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/navigate')}
                  className="bg-white text-[#1B8B8E] font-bold px-4 py-2 rounded-xl text-xs shadow-md shrink-0 hover:bg-slate-100 transition-colors"
                >
                  {isHi ? 'कमरा खोजें' : 'Guide Me'}
                </button>
              </motion.div>
            )}

            {/* ─── Horizontal Visual Progress Bar (Requirement 4) ─── */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                  <span>Queue Sequence & Progress</span>
                  <span className="text-xs font-normal text-[#4B5563]">
                    ({currentDept.prefix}-{currentDept.nowServing} → {userToken})
                  </span>
                </h4>
                <span className="text-xs font-bold text-[#3E36B0]">
                  {tokensAhead === 0 ? 'Now Serving You' : `${tokensAhead} step${tokensAhead > 1 ? 's' : ''} away`}
                </span>
              </div>

              {/* Progress Tracker Graphic */}
              <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#A6DEF7]/50 overflow-x-auto">
                <div className="flex items-center justify-between min-w-[500px] relative">
                  {/* Connecting Line */}
                  <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1.5 bg-slate-200 z-0 rounded-full"></div>
                  
                  {/* Active Highlight Line */}
                  <div
                    className="absolute top-1/2 left-6 -translate-y-1/2 h-1.5 bg-gradient-to-r from-[#1B8B8E] via-[#A6DEF7] to-[#3E36B0] z-0 transition-all duration-500 rounded-full"
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
                              ? 'bg-[#1B8B8E] text-white ring-4 ring-[#A6DEF7] animate-pulse'
                              : step.isUser
                              ? 'bg-[#3E36B0] text-white ring-4 ring-[#A6DEF7]/60'
                              : step.isCompleted
                              ? 'bg-[#1B8B8E]/20 text-[#1B8B8E] border-2 border-[#1B8B8E]'
                              : 'bg-white text-[#111111] border-2 border-[#A6DEF7]'
                          }`}
                        >
                          {step.isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-[#1B8B8E]" />
                          ) : (
                            step.tokenStr.split('-')[1]
                          )}
                        </div>

                        <span
                          className={`mt-2 text-[11px] font-mono font-bold ${
                            step.isUser ? 'text-[#3E36B0]' : step.isCurrent ? 'text-[#1B8B8E]' : 'text-[#111111]'
                          }`}
                        >
                          {step.tokenStr}
                        </span>

                        <span className="text-[10px] font-normal text-[#4B5563]">
                          {step.isCurrent ? 'Serving' : step.isUser ? 'YOUR TOKEN' : `Wait #${idx}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Wayfinding CTA */}
              <div className="mt-5 flex items-center justify-between bg-[#F0F9FD] p-4 rounded-2xl border border-[#A6DEF7]/60">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#3E36B0] shrink-0" />
                  <p className="text-xs text-[#111111] font-normal">
                    Need directions to <strong className="font-bold">{currentDept.room.en}</strong>? Follow turn-by-turn indoor navigation map.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/navigate')}
                  className="text-xs font-bold text-[#3E36B0] hover:text-[#302991] flex items-center gap-1 shrink-0"
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
          <div className="bg-white border border-[#A6DEF7]/60 rounded-3xl p-6 shadow-[0_4px_24px_-2px_rgba(62,54,176,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] relative overflow-hidden">
            {/* Simulator Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-[#A6DEF7]/20 text-[#3E36B0] rounded-2xl border border-[#A6DEF7]/50">
                  <UserCheck className="h-5 w-5 text-[#3E36B0]" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-[#111111] leading-tight">
                    {isHi ? 'स्टाफ काउंटर सिमुलेटर' : 'Staff Counter Simulator'}
                  </h3>
                  <p className="text-[11px] text-[#4B5563] font-normal">
                    Dr. Rajesh Patel • Counter 3
                  </p>
                </div>
              </div>
              <span className="bg-[#1B8B8E] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">
                STAFF LIVE
              </span>
            </div>

            <p className="text-xs text-[#4B5563] font-normal mt-3 leading-relaxed">
              {isHi
                ? 'नीचे दिए गए बटनों पर क्लिक करके डॉक्टर परामर्श को आगे बढ़ाएं। लाइव टोकन कार्ड स्वतः अपडेट होगा।'
                : 'Operate the clinic counter simulator below. Clicking buttons reactively updates the Live Token Card and recalculates wait times.'}
            </p>

            {/* Simulator Interactive Buttons - Primary actions in Deep Indigo (#3E36B0) */}
            <div className="grid grid-cols-1 gap-3 mt-5">
              {/* Button 1: [ Call Next ] - Deep Indigo (#3E36B0) */}
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
                className="w-full bg-[#3E36B0] hover:bg-[#302991] text-white font-bold p-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2.5 transition-colors text-sm"
              >
                <Volume2 className="h-4 w-4" />
                <span>[ Call Next ]</span>
              </motion.button>

              {/* Button 2: [ Mark Done ] - Deep Teal (#1B8B8E) */}
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
                className="w-full bg-[#1B8B8E] hover:bg-[#146B6E] text-white font-bold p-3 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>[ Mark Done ]</span>
              </motion.button>

              {/* Button 3: [ No-Show ] - Deep Charcoal (#111111) */}
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
                className="w-full bg-[#111111] hover:bg-black text-white font-bold p-3 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>[ No-Show ]</span>
              </motion.button>

              {/* Button 4: [ Doctor Delayed (+5 mins) ] - Vivid Magenta (#F62088) with white bold text */}
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
                className="w-full bg-[#F62088] hover:bg-[#D81473] text-white font-bold p-3 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Clock className="h-4 w-4 text-white" />
                <span>[ Doctor Delayed (+5 mins) ]</span>
              </motion.button>
            </div>

            {/* Live Counter Event Log */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                  Counter Activity Log
                </span>
                <button
                  onClick={() => {
                    resetToDefault();
                    toast.success('Simulation reset to initial values');
                  }}
                  className="text-[11px] text-[#3E36B0] hover:text-[#302991] flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                {logs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-2xl bg-[#F8FAFC] border border-[#A6DEF7]/40 flex items-start gap-2"
                  >
                    <span className="font-mono text-[10px] text-[#4B5563] mt-0.5 shrink-0 font-medium">
                      {log.time}
                    </span>
                    <span className="text-[#111111] leading-tight font-medium">
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-white border border-[#A6DEF7]/60 rounded-3xl p-5 text-xs text-[#4B5563] shadow-[0_4px_20px_-2px_rgba(62,54,176,0.06)]">
            <h4 className="font-bold text-[#3E36B0] text-sm mb-1">Cyber Samvad 2026 Innovation</h4>
            <p className="leading-relaxed font-normal">
              This simulator demonstrates dynamic queue balancing, automated turn-by-turn SMS/voice notifications, and emergency casualty bypass protocol.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Digital Token Receipt Modal (When user clicks "+ Get New Token") ─── */}
      <AnimatePresence>
        {showTokenReceipt && (
          <div className="fixed inset-0 bg-[#111111]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-[#A6DEF7] text-center"
            >
              <div className="w-14 h-14 bg-[#1B8B8E]/15 text-[#1B8B8E] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#1B8B8E]/30">
                <CheckCircle2 className="h-8 w-8 text-[#1B8B8E]" />
              </div>

              <span className="text-xs font-bold text-[#1B8B8E] uppercase tracking-widest block mb-1">
                DIGITAL QUEUE PASS ISSUED
              </span>
              <h3 className="text-3xl font-bold font-mono text-[#111111]">
                {issuedTokenInfo}
              </h3>
              <p className="text-xs text-[#4B5563] font-normal mt-1">
                GMERS Medical College • {currentDept.name.en}
              </p>

              <div className="bg-[#F8FAFC] border border-[#A6DEF7]/60 rounded-2xl p-4 my-5 text-left text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-[#4B5563] font-normal">Room:</span>
                  <span className="font-bold text-[#111111]">{currentDept.room.en}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4B5563] font-normal">Now Serving:</span>
                  <span className="font-bold text-[#1B8B8E]">{currentDept.prefix}-{currentDept.nowServing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4B5563] font-normal">Patients Ahead:</span>
                  <span className="font-bold text-[#111111]">{tokensAhead} patients</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4B5563] font-normal">Estimated Wait:</span>
                  <span className="font-bold text-[#111111]">~{dynamicWaitTime} mins</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowTokenReceipt(false);
                    speakQueueStatus();
                  }}
                  className="flex-1 bg-[#002BFF] hover:bg-[#0022CC] text-white font-bold py-3 rounded-2xl text-xs transition-colors shadow-sm"
                >
                  🔊 Hear Status
                </button>
                <button
                  onClick={() => setShowTokenReceipt(false)}
                  className="flex-1 bg-[#3E36B0] hover:bg-[#302991] text-white font-bold py-3 rounded-2xl text-xs transition-colors shadow-sm"
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

export default Dashboard;
