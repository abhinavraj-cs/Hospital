import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import i18n from '../../i18n';

export type RoleViewMode = 'patient' | 'staff' | 'display';
export type LanguageCode = 'en' | 'hi';

export interface DepartmentQueue {
  id: string;
  name: { en: string; hi: string };
  code: string;
  room: { en: string; hi: string };
  doctor: { en: string; hi: string };
  nowServing: number;
  prefix: string;
  waitingCount: number;
  avgTimePerPatient: number; // in minutes
  delayMinutes: number;
  statusBadge: { en: string; hi: string };
  isBypassEmergency?: boolean;
}

export interface QueueLogEntry {
  id: string;
  time: string;
  message: string;
  type: 'call' | 'done' | 'noshow' | 'delay' | 'new';
}

export interface HeldToken {
  id: string;
  tokenCode: string; // e.g. "OPD-101"
  deptId: string;    // e.g. "opd"
  heldAt: string;    // timestamp e.g. "12:15 PM"
  reason: string;    // "Unresponsive at Counter (Stepped Away)"
  priorityTag: 'ELEVATED' | 'HIGH';
  originalServingNum: number;
}

interface QueueTrackerState {
  roleView: RoleViewMode;
  language: LanguageCode;
  selectedDeptId: string;
  userToken: string; // e.g. "OPD-104"
  departments: Record<string, DepartmentQueue>;
  heldTokens: HeldToken[];
  reclaimedTokens: Record<string, { reclaimSlot: number; priority: string; originalNum: number }>;
  logs: QueueLogEntry[];
  isAnnouncing: boolean;
  lastAnnouncement: string;

  // Actions
  setRoleView: (mode: RoleViewMode) => void;
  setLanguage: (lang: LanguageCode) => void;
  setSelectedDept: (deptId: string) => void;
  setUserToken: (token: string) => void;
  trackToken: (tokenInput: string) => boolean;
  generateNewToken: (deptId?: string) => string;
  callNextToken: () => void;
  markConsultationDone: () => void;
  markNoShow: () => void;
  handlePutOnHold: (tokenId?: string) => void;
  handleReclaimQueue: (tokenId: string) => void;
  addDoctorDelay: (minutes?: number) => void;
  speakQueueStatus: () => void;
  resetToDefault: () => void;
}

// Chime generator using Web Audio API
export function playHospitalDingDong() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Chime 1: High tone (G5 - 784Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Chime 2: Low tone (C5 - 523.25Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(523.25, now + 0.3);
    gain2.gain.setValueAtTime(0.2, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.3);
    osc2.stop(now + 0.9);
  } catch (err) {
    console.warn('Audio chime could not play', err);
  }
}

const initialDepartments: Record<string, DepartmentQueue> = {
  opd: {
    id: 'opd',
    name: { en: 'General Medicine OPD', hi: 'सामान्य चिकित्सा ओपीडी' },
    code: 'OPD',
    room: { en: 'Room 104, Ground Floor', hi: 'कमरा 104, भूतल' },
    doctor: { en: 'Dr. Rajesh Patel (MD)', hi: 'डॉ. राजेश पटेल (एमडी)' },
    nowServing: 101,
    prefix: 'OPD',
    waitingCount: 8,
    avgTimePerPatient: 3, // 8 * 3 + 1 = 25 mins
    delayMinutes: 0,
    statusBadge: { en: 'Counter 3 Active', hi: 'काउंटर 3 चालू' },
  },
  lab: {
    id: 'lab',
    name: { en: 'Pathology / Blood Lab', hi: 'पैथोलॉजी / रक्त परीक्षण' },
    code: 'LAB',
    room: { en: 'Lab Hall A, Ground Floor', hi: 'लैब हॉल ए, भूतल' },
    doctor: { en: 'Dr. Neha Sharma (Pathologist)', hi: 'डॉ. नेहा शर्मा' },
    nowServing: 24,
    prefix: 'LAB',
    waitingCount: 3,
    avgTimePerPatient: 3, // ~10 mins
    delayMinutes: 0,
    statusBadge: { en: 'Sample Collection Active', hi: 'सैंपल संग्रह सक्रिय' },
  },
  pharmacy: {
    id: 'pharmacy',
    name: { en: 'Pharmacy Dispensing', hi: 'दवा वितरण केंद्र' },
    code: 'PH',
    room: { en: 'Counter 1 & 2, Near Exit', hi: 'काउंटर 1 व 2, निकास के पास' },
    doctor: { en: 'Senior Pharmacist Verma', hi: 'वरिष्ठ फार्मासिस्ट वर्मा' },
    nowServing: 65,
    prefix: 'PH',
    waitingCount: 12,
    avgTimePerPatient: 1.25, // ~15 mins
    delayMinutes: 0,
    statusBadge: { en: 'Windows 1 & 2 Open', hi: 'खिड़की 1 व 2 खुली' },
  },
  emergency: {
    id: 'emergency',
    name: { en: 'Emergency Casualty Bypass', hi: 'आपातकालीन कैजुअल्टी बाईपास' },
    code: 'EMG',
    room: { en: 'Casualty Room 1', hi: 'कैजुअल्टी रूम 1' },
    doctor: { en: 'Emergency Triage Team (24x7)', hi: 'इमरजेंसी ट्राइएज टीम (24x7)' },
    nowServing: 0,
    prefix: 'EMG',
    waitingCount: 0,
    avgTimePerPatient: 0,
    delayMinutes: 0,
    statusBadge: { en: 'Direct Bypass - No Waiting', hi: 'सीधा प्रवेश - शून्य प्रतीक्षा' },
    isBypassEmergency: true,
  },
};

export const useQueueTrackerStore = create<QueueTrackerState>()(
  persist(
    (set, get) => ({
      roleView: 'patient',
      language: 'en',
      selectedDeptId: 'opd',
      userToken: 'OPD-104',
      departments: initialDepartments,
      heldTokens: [
        {
          id: 'held-demo-1',
          tokenCode: 'OPD-100',
          deptId: 'opd',
          heldAt: '12:08 PM',
          reason: 'Unresponsive at Counter (Stepped Away)',
          priorityTag: 'ELEVATED',
          originalServingNum: 100,
        },
      ],
      reclaimedTokens: {},
      isAnnouncing: false,
      lastAnnouncement: '',
      logs: [
        {
          id: 'log-init-1',
          time: '12:00 PM',
          message: 'General Medicine Counter 3 started serving OPD-101',
          type: 'call',
        },
        {
          id: 'log-init-2',
          time: '12:04 PM',
          message: 'Pathology Lab called sample token LAB-24',
          type: 'call',
        },
      ],

      setRoleView: (mode) => set({ roleView: mode }),

      setLanguage: (lang) => {
        set({ language: lang });
        try {
          i18n.changeLanguage(lang);
        } catch {}
      },

      setSelectedDept: (deptId) => set({ selectedDeptId: deptId }),

      setUserToken: (token) => set({ userToken: token.toUpperCase().trim() }),

      trackToken: (tokenInput) => {
        const clean = tokenInput.trim().toUpperCase();
        if (!clean) return false;

        const parts = clean.split('-');
        let deptId = 'opd';
        if (parts[0] === 'LAB') deptId = 'lab';
        else if (parts[0] === 'PH') deptId = 'pharmacy';
        else if (parts[0] === 'EMG') deptId = 'emergency';

        set((state) => ({
          userToken: clean,
          selectedDeptId: deptId,
          logs: [
            {
              id: 'log-' + Date.now(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: `Patient tracking token ${clean}`,
              type: 'new',
            },
            ...state.logs.slice(0, 19),
          ],
        }));
        return true;
      },

      generateNewToken: (deptId = 'opd') => {
        const state = get();
        const dept = state.departments[deptId] || state.departments.opd;
        const nextNum = dept.nowServing + dept.waitingCount + 1;
        const newToken = `${dept.prefix}-${nextNum}`;

        set((s) => {
          const currentDept = s.departments[deptId];
          return {
            userToken: newToken,
            selectedDeptId: deptId,
            departments: {
              ...s.departments,
              [deptId]: {
                ...currentDept,
                waitingCount: currentDept.waitingCount + 1,
              },
            },
            logs: [
              {
                id: 'log-' + Date.now(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                message: `New digital token issued: ${newToken} (${dept.name.en})`,
                type: 'new',
              },
              ...s.logs.slice(0, 19),
            ],
          };
        });

        playHospitalDingDong();
        return newToken;
      },

      callNextToken: () => {
        const { selectedDeptId, departments } = get();
        const dept = departments[selectedDeptId] || departments.opd;
        const nextServing = dept.nowServing + 1;
        const newWaiting = Math.max(0, dept.waitingCount - 1);
        const calledToken = `${dept.prefix}-${nextServing}`;

        set((s) => ({
          departments: {
            ...s.departments,
            [selectedDeptId]: {
              ...s.departments[selectedDeptId],
              nowServing: nextServing,
              waitingCount: newWaiting,
            },
          },
          logs: [
            {
              id: 'log-' + Date.now(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: `Counter called next: ${calledToken} to ${dept.room.en}`,
              type: 'call',
            },
            ...s.logs.slice(0, 19),
          ],
        }));

        playHospitalDingDong();

        // Optional auto-announcement if voice is available
        const state = get();
        if ('speechSynthesis' in window) {
          const text =
            state.language === 'hi'
              ? `टोकन ${dept.prefix} ${nextServing}, ${dept.room.hi} में उपस्थित हों।`
              : `Token ${dept.prefix} ${nextServing}, please proceed to ${dept.room.en}.`;
          
          setTimeout(() => {
            try {
              window.speechSynthesis.cancel();
              const utt = new SpeechSynthesisUtterance(text);
              utt.lang = state.language === 'hi' ? 'hi-IN' : 'en-US';
              utt.rate = 0.95;
              window.speechSynthesis.speak(utt);
            } catch {}
          }, 400);
        }
      },

      markConsultationDone: () => {
        const { selectedDeptId, departments } = get();
        const dept = departments[selectedDeptId] || departments.opd;
        const currentToken = `${dept.prefix}-${dept.nowServing}`;

        set((s) => ({
          logs: [
            {
              id: 'log-' + Date.now(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: `Consultation completed for ${currentToken}. Counter available.`,
              type: 'done',
            },
            ...s.logs.slice(0, 19),
          ],
        }));
      },

      markNoShow: () => {
        const { selectedDeptId, departments } = get();
        const dept = departments[selectedDeptId] || departments.opd;
        const skippedToken = `${dept.prefix}-${dept.nowServing}`;

        // Advance to next token immediately
        const nextServing = dept.nowServing + 1;
        const newWaiting = Math.max(0, dept.waitingCount - 1);
        const nextToken = `${dept.prefix}-${nextServing}`;

        set((s) => ({
          departments: {
            ...s.departments,
            [selectedDeptId]: {
              ...s.departments[selectedDeptId],
              nowServing: nextServing,
              waitingCount: newWaiting,
            },
          },
          logs: [
            {
              id: 'log-' + Date.now(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: `Patient ${skippedToken} marked NO-SHOW. Calling next ${nextToken}`,
              type: 'noshow',
            },
            ...s.logs.slice(0, 19),
          ],
        }));

        playHospitalDingDong();
      },

      handlePutOnHold: (tokenId?: string) => {
        const state = get();
        const { selectedDeptId, departments } = state;
        const dept = departments[selectedDeptId] || departments.opd;

        const targetToken = tokenId || `${dept.prefix}-${dept.nowServing}`;
        const parts = targetToken.split('-');
        const targetNum = parseInt(parts[1] || String(dept.nowServing), 10);

        // Advance to next token automatically
        const nextServing = dept.nowServing + 1;
        const newWaiting = Math.max(0, dept.waitingCount - 1);
        const nextToken = `${dept.prefix}-${nextServing}`;

        const newHeldEntry: HeldToken = {
          id: 'held-' + Date.now(),
          tokenCode: targetToken,
          deptId: selectedDeptId,
          heldAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reason: 'Unresponsive at Counter (Stepped Away)',
          priorityTag: 'ELEVATED',
          originalServingNum: targetNum,
        };

        const isHi = state.language === 'hi';
        const holdMsgEn = `Token ${targetToken} put ON HOLD (unresponsive). Calling next patient ${nextToken}.`;
        const holdMsgHi = `टोकन ${targetToken} को होल्ड पर रखा गया है। अगले मरीज ${nextToken} को बुलाया जा रहा है।`;

        set((s) => ({
          heldTokens: [newHeldEntry, ...s.heldTokens.filter((h) => h.tokenCode !== targetToken)],
          departments: {
            ...s.departments,
            [selectedDeptId]: {
              ...s.departments[selectedDeptId],
              nowServing: nextServing,
              waitingCount: newWaiting,
            },
          },
          logs: [
            {
              id: 'log-' + Date.now(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: holdMsgEn,
              type: 'delay',
            },
            ...s.logs.slice(0, 19),
          ],
        }));

        playHospitalDingDong();

        // Bilingual Audio Announcement
        if ('speechSynthesis' in window) {
          const announcement = isHi ? holdMsgHi : holdMsgEn;
          setTimeout(() => {
            try {
              window.speechSynthesis.cancel();
              const utt = new SpeechSynthesisUtterance(announcement);
              utt.lang = isHi ? 'hi-IN' : 'en-US';
              utt.rate = 0.95;
              window.speechSynthesis.speak(utt);
            } catch {}
          }, 400);
        }
      },

      handleReclaimQueue: (tokenId: string) => {
        const cleanToken = tokenId.trim().toUpperCase();
        const state = get();
        const { selectedDeptId, departments, heldTokens } = state;
        const dept = departments[selectedDeptId] || departments.opd;

        const held = heldTokens.find((h) => h.tokenCode === cleanToken);
        const originalNum = held?.originalServingNum || parseInt(cleanToken.split('-')[1] || '100', 10);

        // Reclaim rule: re-insert 2 slots behind currently serving patient
        const reclaimSlot = dept.nowServing + 2;

        const isHi = state.language === 'hi';
        const reclaimMsgEn = `Token ${cleanToken} returned to counter. Re-admitted at slot ${dept.prefix}-${reclaimSlot} with ELEVATED priority.`;
        const reclaimMsgHi = `टोकन ${cleanToken} काउंटर पर वापस आ गए हैं। उन्हें उच्च प्राथमिकता के साथ स्लॉट ${dept.prefix}-${reclaimSlot} पर पुनः कतार में जोड़ा गया है।`;

        set((s) => ({
          heldTokens: s.heldTokens.filter((h) => h.tokenCode !== cleanToken),
          reclaimedTokens: {
            ...s.reclaimedTokens,
            [cleanToken]: {
              reclaimSlot,
              priority: 'ELEVATED',
              originalNum,
            },
          },
          departments: {
            ...s.departments,
            [selectedDeptId]: {
              ...s.departments[selectedDeptId],
              waitingCount: s.departments[selectedDeptId].waitingCount + 1,
            },
          },
          logs: [
            {
              id: 'log-' + Date.now(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: reclaimMsgEn,
              type: 'new',
            },
            ...s.logs.slice(0, 19),
          ],
        }));

        playHospitalDingDong();

        // Bilingual Audio Announcement
        if ('speechSynthesis' in window) {
          const announcement = isHi ? reclaimMsgHi : reclaimMsgEn;
          setTimeout(() => {
            try {
              window.speechSynthesis.cancel();
              const utt = new SpeechSynthesisUtterance(announcement);
              utt.lang = isHi ? 'hi-IN' : 'en-US';
              utt.rate = 0.95;
              window.speechSynthesis.speak(utt);
            } catch {}
          }, 400);
        }
      },

      addDoctorDelay: (minutes = 5) => {
        const { selectedDeptId, departments } = get();
        const dept = departments[selectedDeptId] || departments.opd;

        set((s) => ({
          departments: {
            ...s.departments,
            [selectedDeptId]: {
              ...s.departments[selectedDeptId],
              delayMinutes: (s.departments[selectedDeptId]?.delayMinutes || 0) + minutes,
            },
          },
          logs: [
            {
              id: 'log-' + Date.now(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: `Doctor delayed by +${minutes} mins (Critical case review)`,
              type: 'delay',
            },
            ...s.logs.slice(0, 19),
          ],
        }));
      },

      speakQueueStatus: () => {
        const state = get();
        const dept = state.departments[state.selectedDeptId] || state.departments.opd;
        
        // Parse token numbers
        const userTokenParts = state.userToken.split('-');
        const userNum = parseInt(userTokenParts[1] || '104', 10);
        const currentServing = dept.nowServing;
        const tokensAhead = Math.max(0, userNum - currentServing);
        const estWait = tokensAhead * dept.avgTimePerPatient + (dept.delayMinutes || 0);

        playHospitalDingDong();

        set({ isAnnouncing: true });

        const isHi = state.language === 'hi';
        const isUserHeld = state.heldTokens.some((h) => h.tokenCode === state.userToken);
        const reclaimedData = state.reclaimedTokens[state.userToken];
        let announcement = '';

        if (isUserHeld) {
          announcement = isHi
            ? `कृपया ध्यान दें। आपका टोकन ${state.userToken} अनुपस्थित होने के कारण होल्ड पर रखा गया है। कतार में पुनः सम्मिलित होने के लिए 'मैं काउंटर पर वापस आ गया हूँ' बटन दबाएं।`
            : `Attention please. Your token ${state.userToken} is currently on hold. Please click 'I am Back at the Counter' to rejoin the queue.`;
        } else if (reclaimedData) {
          const reclaimAhead = Math.max(0, reclaimedData.reclaimSlot - currentServing);
          const reclaimWait = reclaimAhead * dept.avgTimePerPatient + (dept.delayMinutes || 0);
          announcement = isHi
            ? `कृपया ध्यान दें। आपका टोकन ${state.userToken} उच्च प्राथमिकता के साथ स्लॉट ${dept.prefix} ${reclaimedData.reclaimSlot} पर पुनः कतार में जोड़ा गया है। आपकी बारी आने में लगभग ${reclaimWait} मिनट शेष हैं।`
            : `Attention please. Your token ${state.userToken} has been re-admitted with elevated priority at slot ${dept.prefix}-${reclaimedData.reclaimSlot}. Estimated wait time is approximately ${reclaimWait} minutes.`;
        } else if (tokensAhead <= 0) {
          announcement = isHi
            ? `कृपया ध्यान दें। आपका टोकन ${state.userToken} अभी बुलाया जा चुका है। कृपया ${dept.room.hi} में तुरंत संपर्क करें।`
            : `Attention please. Your token ${state.userToken} is now being served. Please proceed immediately to ${dept.room.en}.`;
        } else {
          announcement = isHi
            ? `कृपया ध्यान दें। ${dept.name.hi} में वर्तमान में टोकन ${dept.prefix} ${currentServing} बुलाया जा रहा है। आपके टोकन ${state.userToken} से पहले ${tokensAhead} मरीज प्रतीक्षारत हैं। आपका अनुमानित प्रतीक्षा समय लगभग ${estWait} मिनट है।`
            : `Attention please. In ${dept.name.en}, current serving token is ${dept.prefix}-${currentServing}. Your token is ${state.userToken}. There are ${tokensAhead} patients ahead of you. Estimated wait time is approximately ${estWait} minutes.`;
        }

        set({ lastAnnouncement: announcement });

        if ('speechSynthesis' in window) {
          setTimeout(() => {
            try {
              window.speechSynthesis.cancel();
              const utt = new SpeechSynthesisUtterance(announcement);
              utt.lang = isHi ? 'hi-IN' : 'en-US';
              utt.rate = 0.95;
              utt.onend = () => set({ isAnnouncing: false });
              utt.onerror = () => set({ isAnnouncing: false });
              window.speechSynthesis.speak(utt);
            } catch (err) {
              set({ isAnnouncing: false });
            }
          }, 450);
        } else {
          set({ isAnnouncing: false });
        }
      },

      resetToDefault: () => {
        set({
          departments: initialDepartments,
          userToken: 'OPD-104',
          selectedDeptId: 'opd',
          heldTokens: [
            {
              id: 'held-demo-1',
              tokenCode: 'OPD-100',
              deptId: 'opd',
              heldAt: '12:08 PM',
              reason: 'Unresponsive at Counter (Stepped Away)',
              priorityTag: 'ELEVATED',
              originalServingNum: 100,
            },
          ],
          reclaimedTokens: {},
          logs: [
            {
              id: 'log-' + Date.now(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: 'Queue simulation reset to hackathon baseline values.',
              type: 'new',
            },
          ],
        });
      },
    }),
    {
      name: 'arogyamitra-ps3-queue-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        roleView: state.roleView,
        language: state.language,
        userToken: state.userToken,
        selectedDeptId: state.selectedDeptId,
      }),
    }
  )
);
