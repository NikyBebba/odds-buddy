'use client';

import { useState } from 'react';
import LegendsQuiz from '@/components/LegendsQuiz';

const TAROT_CARDS = [
  { title: '🔮 La Carta del Trappolone', desc: 'Oggi lo squadrone blasonato rischia una ciucciata storica. Fidati solo del campo!' },
  { title: '👑 L\'Imperatore dell\'Aura', desc: 'Aura Farming a livelli mai visti prima. Vittoria schiacciante in arrivo!' },
  { title: '🎪 Il Matto a Campo di Longo', desc: 'Partita caotica, autoreti assurde e Var protagonista. SÌ!!!!' },
  { title: '🍷 La Temperanza di Sannicola', desc: 'Pareggino scritto nei tarocchi. Prendi le patatine e rilassati.' },
];

export default function ExtraFun() {
  const [card, setCard] = useState(null);

  const drawCard = () => {
    const random = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    setCard(random);
  };

  return (
    <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/30 text-center space-y-3">
      <h4 className="text-xs uppercase tracking-wider font-bold text-purple-400">
        🔮 L&apos;Oroscopo Calcistico del Giorno
      </h4>
      <p className="text-xs text-slate-400">
        Pesca una carta prima di analizzare i dati per scoprire che aria tira oggi!
      </p>

      {card ? (
        <div className="bg-slate-900 p-3 rounded-xl border border-purple-500/40 space-y-1 animate-fade-in">
          <p className="font-bold text-sm text-purple-300">{card.title}</p>
          <p className="text-xs text-slate-200">{card.desc}</p>
          <button
            onClick={() => setCard(null)}
            className="text-[11px] text-purple-400 underline pt-1"
          >
            Pesca un&apos;altra carta
          </button>
        </div>
      ) : (
        <button
          onClick={drawCard}
          className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg"
        >
          ✨ Pesca la Carta della Giornata
        </button>
      )}

      <div className="pt-3 border-t border-slate-800">
        <LegendsQuiz />
      </div>
    </div>
  );
}
