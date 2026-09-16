'use client';

import { useState } from 'react';
import { buildTriviaDeck, gergoify } from '@/lib/trivia';

const DECK_SIZE = 10;

export default function LegendsQuiz() {
  const [deck, setDeck] = useState(null);
  const [questionIdx, setQuestionIdx] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const startQuiz = () => {
    const d = buildTriviaDeck({ count: DECK_SIZE });
    setDeck(d.map((q) => gergoify(q)));
    setQuestionIdx(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  };

  const isOver = finished;
  const current = questionIdx !== null && !isOver && deck ? deck[questionIdx] : null;

  const pick = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === current.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (questionIdx + 1 >= deck.length) {
      setFinished(true);
    } else {
      setQuestionIdx((i) => i + 1);
      setPicked(null);
    }
  };

  return (
    <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 text-center space-y-3">
      <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400">
        🏆 Leggende del Pallone
      </h4>

      {questionIdx === null ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">
            Test vero da enciclopedia: fatti storici del calcio mondiale, zero dati inventati. Ogni volta le carte sono mischiate a nuovo. Riesci a fare il pieno?
          </p>
          <button
            onClick={startQuiz}
            className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg"
          >
            🚀 Inizia il Quiz
          </button>
        </div>
      ) : isOver ? (
        <div className="space-y-2">
          <p className="text-lg font-extrabold text-amber-300">
            {score === DECK_SIZE
              ? `🏆 PERFETTO! ${score}/${DECK_SIZE} — sei un'enciclopedia ambulante!`
              : score >= DECK_SIZE * 0.7
                ? `🔥 Gran risultato! ${score}/${DECK_SIZE}`
                : score >= DECK_SIZE * 0.4
                  ? `🙃 Passabile: ${score}/${DECK_SIZE}. La ruota gira anche così.`
                  : `💀 ${score}/${DECK_SIZE}: pura ciucciata storica. Ricarica di capperini!`}
          </p>
          <button
            onClick={startQuiz}
            className="text-[11px] text-amber-400 underline pt-1"
          >
            🔁 Rigira le carte e ritenta
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
            <span>
              Domanda {questionIdx + 1}/{deck.length}
            </span>
            <span className="text-amber-400 font-bold">Punti: {score}</span>
          </div>
          <p className="text-xs font-bold text-slate-200 leading-relaxed">{current.q}</p>
          <div className="space-y-2">
            {current.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => pick(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                  picked === null
                    ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-amber-500'
                    : idx === current.correct
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : idx === picked
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {picked !== null && (
            <div className="bg-slate-900 p-3 rounded-lg border border-amber-500/40 text-xs text-slate-200 animate-fade-in space-y-1">
              <p className="font-bold text-amber-400">
                {picked === current.correct ? '✅ Esatto!' : '❌ Sbagliato!'}
              </p>
              <p>{current.fun}</p>
              <button
                onClick={next}
                className="w-full mt-2 bg-amber-600 text-slate-950 font-extrabold py-1.5 rounded-lg text-[11px] transition-all"
              >
                {questionIdx + 1 >= deck.length ? '🏁 Vedi il Verdetto' : '➡️ Prossima Domanda'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
