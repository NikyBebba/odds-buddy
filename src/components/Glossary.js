'use client';

import { GLOSSARY } from '@/lib/vocab';

export default function Glossary({ accentClass = 'text-emerald-400' }) {
  return (
    <div className="space-y-1.5">
      {GLOSSARY.map((entry) => (
        <div key={entry.term} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
          <p className={`font-bold ${accentClass}`}>{entry.term}</p>
          <p className="text-slate-400">{entry.meaning}</p>
        </div>
      ))}
    </div>
  );
}