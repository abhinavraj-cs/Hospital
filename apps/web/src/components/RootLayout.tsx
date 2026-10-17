'use client';

import React from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans antialiased flex flex-col">
        <Navbar />
        <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto relative z-10">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
