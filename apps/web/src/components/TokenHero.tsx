'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

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
    <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
      <p className="text-gray-600 mt-2">{t('subtitle')}</p>

      <button
        onClick={() => handleSpeak(tokenNumber, waitTime)}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 font-medium transition shadow-sm active:scale-95"
      >
        <span>🔊</span> {t('listenAudio')}
      </button>
    </div>
  );
}

export { TokenHero };
