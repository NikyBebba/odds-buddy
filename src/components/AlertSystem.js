'use client';

import { useState } from 'react';

const ALARMS = [
  "🚨 ATTENZIONE: Simonetta ti sta tracciando su LifeMadonna369! Metti il telefono in modalità aereo! 📱💥",
  "🕶️ ALLARME ROSSO: Robertone ha messo gli occhiali veloci! La situazione sta precipitando alla velocità della luce! ⚡",
  "🔍 ALLERTA MASSIMA: Giovanni sta tornando e sta cercando i ladri nel Campo da Longo! Mettetevi al riparo! 🏃‍♂️💨",
  "📢 EMERGENZA: Lorenza sta gridando! Corri subito ad aiutarla! 🆘🔥",
  "👑 SHHH: Cocula Piccolo Principe sta dormendo! Non fare rumore! 🤫😴",
];

export default function AlertSystem() {
  const [currentAlarm, setCurrentAlarm] = useState(() => 
    ALARMS[Math.floor(Math.random() * ALARMS.length)]
  );

  const nextAlarm = () => {
    const random = ALARMS[Math.floor(Math.random() * ALARMS.length)];
    setCurrentAlarm(random);
  };

  return (
    <div className="max-w-5xl mx-auto mb-6 bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border border-rose-500/40 p-3.5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg shadow-rose-950/30 animate-pulse">
      <div className="flex items-center gap-3 text-xs md:text-sm font-medium text-rose-200">
        <span className="text-xl">⚠️</span>
        <p className="leading-tight">{currentAlarm}</p>
      </div>

      <button
        onClick={nextAlarm}
        className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap"
      >
        🔄 Cambia Allarme
      </button>
    </div>
  );
}
