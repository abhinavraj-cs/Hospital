'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Volume2, Sparkles } from 'lucide-react';

export interface TokenHeroProps {
  tokenNumber?: string;
  waitTime?: number;
}

export default function TokenHero({
  tokenNumber = 'OPD-101',
  waitTime = 15,
}: TokenHeroProps) {
  const { lang, t } = useLanguage();

  const handleSpeak = (token: string, time: number) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any pending audio

    const rawPhrase = t('audioPhrase');
    const message = rawPhrase
      .replace('{token}', token)
      .replace('{time}', time.toString());

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-7 bg-[#FFFFFF] rounded-2xl md:rounded-3xl border border-[#A6DEF7]/50 shadow-[0_4px_20px_-2px_rgba(62,54,176,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] relative overflow-hidden">
      {/* Sky Blue accent background blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#A6DEF7]/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#A6DEF7]/20 text-[#3E36B0] border border-[#A6DEF7]/60 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#3E36B0]" />
            <span>AI Voice & Smart Token Tracker</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#111111] tracking-tight leading-tight">
            {t('title')}
          </h1>
          <p className="text-[#4B5563] text-sm md:text-base font-normal mt-2 max-w-2xl leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        {/* Audio Guidance Button: Electric Blue (#002BFF) with Sky Blue (#A6DEF7) badge highlights */}
        <button
          onClick={() => handleSpeak(tokenNumber, waitTime)}
          className="px-6 py-3.5 bg-[#002BFF] hover:bg-[#0022CC] text-white rounded-2xl flex items-center gap-3 font-bold transition-all shadow-[0_4px_16px_rgba(0,43,255,0.3)] active:scale-95 shrink-0"
        >
          <Volume2 className="h-5 w-5 text-white" />
          <div className="text-left">
            <span className="block text-sm font-bold text-white leading-none">
              {t('listenAudio')}
            </span>
            <span className="inline-block mt-1 text-[10px] font-semibold bg-[#A6DEF7] text-[#002BFF] px-2 py-0.5 rounded-full uppercase tracking-wider">
              {tokenNumber} • ~{waitTime}m
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

export { TokenHero };
