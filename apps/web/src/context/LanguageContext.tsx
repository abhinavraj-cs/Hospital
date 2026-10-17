'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

export interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    home: 'Home',
    queueSystem: 'Queue System',
    patientView: 'Patient View',
    staffView: 'Staff View',
    publicDisplay: 'Public Display',
    emergency: 'Emergency',
    
    // Hero & Tracker
    title: 'Hospital Live Token & Queue Tracker',
    subtitle: 'Track your real-time token status, eliminate waiting room congestion, and receive synthesized audio announcements.',
    listenAudio: 'Listen to Queue Status',
    trackStatus: 'Track Status',
    getNewToken: '+ Get New Token',
    quickSelect: 'Quick Select:',
    
    // Audio synthesis phrases
    audioPhrase: 'Token {token}. Your approximate waiting time is {time} minutes.',
    emergencyNotice: 'Emergency cases bypass this queue. Please report to Casualty directly.',
    
    // Analytics & Capacity Row
    analyticsTitle: 'Hospital Queue Analytics & Real-Time Capacity',
    analyticsSubtitle: 'Live hospital census, counter availability, and patient flow monitoring',
    avgFootfall: 'Avg Footfall',
    avgFootfallSub: 'Daily patient throughput',
    footfallUnit: 'patients/day',
    peakHours: 'Hospital Peak Hours',
    peakHoursSub: 'Maximum OPD congestion',
    peakHoursVal: '09:30 AM - 01:00 PM',
    peopleInQueue: 'People in Queue',
    peopleInQueueSub: 'Live across all counters',
    peopleUnit: 'waiting',
    countersAvailable: 'Doctor Counters Available',
    countersAvailableSub: 'Live OPD rooms consulting',
    countersUnit: 'active',
    meanWaitTime: 'Mean Waiting Time',
    meanWaitTimeSub: 'Dynamic real-time estimate',
    minsUnit: 'mins'
  },
  hi: {
    // Navigation
    home: 'होम',
    queueSystem: 'टोकन कतार प्रणाली',
    patientView: 'मरीज दृश्य',
    staffView: 'स्टाफ दृश्य',
    publicDisplay: 'सार्वजनिक डिस्प्ले',
    emergency: 'आपातकालीन (कैजुअल्टी)',
    
    // Hero & Tracker
    title: 'अस्पताल लाइव टोकन एवं कतार ट्रैकर',
    subtitle: 'अपने टोकन की स्थिति लाइव देखें, भीड़ से बचें और सीधे वॉयस सहायता प्राप्त करें।',
    listenAudio: 'कतार स्थिति सुनें',
    trackStatus: 'स्थिति जांचें',
    getNewToken: '+ नया टोकन लें',
    quickSelect: 'त्वरित चयन:',
    
    // Audio synthesis phrases
    audioPhrase: 'टोकन संख्या {token}। आपकी बारी आने में लगभग {time} मिनट शेष हैं।',
    emergencyNotice: 'आपातकालीन मरीज इस लाइन में न लगें, सीधे कैजुअल्टी कक्ष में जाएं।',

    // Analytics & Capacity Row
    analyticsTitle: 'अस्पताल कतार एनालिटिक्स एवं वास्तविक क्षमता',
    analyticsSubtitle: 'लाइव मरीज गणना, सक्रिय काउंटर एवं अस्पताल प्रवाह निगरानी',
    avgFootfall: 'औसत दैनिक फुटफॉल',
    avgFootfallSub: 'दैनिक मरीज आवक',
    footfallUnit: 'मरीज / दिन',
    peakHours: 'अधिकतम भीड़ के घंटे',
    peakHoursSub: 'अधिकतम ओपीडी लोड',
    peakHoursVal: '09:30 पूर्वाह्न - 01:00 अपराह्न',
    peopleInQueue: 'कतार में कुल मरीज',
    peopleInQueueSub: 'सभी काउंटरों पर लाइव प्रतीक्षा',
    peopleUnit: 'प्रतीक्षारत',
    countersAvailable: 'सक्रिय डॉक्टर काउंटर',
    countersAvailableSub: 'खुले ओपीडी परामर्श कक्ष',
    countersUnit: 'सक्रिय',
    meanWaitTime: 'औसत प्रतीक्षा समय',
    meanWaitTimeSub: 'गतिशील लाइव अनुमान',
    minsUnit: 'मिनट'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  // Load saved preference on first mount
  useEffect(() => {
    const saved = localStorage.getItem('arogya_lang') as Language;
    if (saved === 'en' || saved === 'hi') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('arogya_lang', newLang);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
