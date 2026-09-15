'use client';

import { useState } from 'react';

const TRACKS = [
  "🎶 TRACCIA 1: Cassa Dritta, Gambe Aperte",
  "🎧 TRACCIA 2: Techno di Sannicola",
  "🪩 TRACCIA 3: Lo Sguardo di Simonetta (Slow Bass)",
  "🔥 TRACCIA 4: Cartucce Anthem",
];

const FOOD_OPTIONS = [
  { id: 'carote', label: 'Carote cotte (Una prelibatezza 🥕)', result: 'Scelta saggia e salutare, perchè le porche siamo noi!' },
  { id: 'capperini', label: 'Capperini salati (Per dare sprint alla serata 🌿)', result: 'Sapore forte e stanno bene su tutto, anche nel caffè!' },
  { id: 'lattosio', label: 'Mozzarella, latte o yogurt (Per speedrunnare il bagno 🥛💀)', result: 'ALLARME ROSSO! Situazione catastrofica in bagno tra 10 secondi.' },
];

export default function MatchVibesHub() {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const nextTrack = () => {
    setIsPlaying(true);
    setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
  };

  return (
    <div className="space-y-4">
      {/* 1. DJ SET DI CAMPO DA LONGO */}
      <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase tracking-wider font-bold text-purple-400">
            🎧 DJ Set nel Campo di Longo
          </h4>
          <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
            {isPlaying ? '🔴 IN ONDA' : '⏸️ PAUSA'}
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center space-y-2">
          <p className="text-xs font-mono font-bold text-purple-200">
            {TRACKS[currentTrackIdx]}
          </p>
          <button
            onClick={nextTrack}
            className="w-full bg-purple-600 hover:bg-purple-500 text-slate-100 font-extrabold py-2 rounded-xl text-xs transition-all shadow-lg"
          >
            {isPlaying ? '⏭️ Cambia Traccia (Alza i Bassi!)' : '▶️ Avvia il DJ Set'}
          </button>
        </div>
      </div>

      {/* 2. SONDAGGINO GASTRONOMICO */}
      <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
        <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400">
          🥗 Sondaggino: Cosa si mangia durante la partita?
        </h4>
        <p className="text-xs text-slate-400">
          Vota il menu della serata per scoprire il destino del tuo stomaco:
        </p>

        <div className="space-y-2">
          {FOOD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedFood(opt)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                selectedFood?.id === opt.id
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {selectedFood && (
          <div className="bg-slate-900 p-3 rounded-lg border border-emerald-500/40 text-xs text-slate-200 animate-fade-in space-y-1">
            <p className="font-bold text-emerald-400">Verdetto dello stomaco:</p>
            <p>{selectedFood.result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
