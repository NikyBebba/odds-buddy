'use client';

import { useState } from 'react';
import { calculateBuddyRating } from '@/lib/analytics';
import { exclamation, buddyMotto } from '@/lib/vocab.js';

const FOOD_OPTIONS = [
  { id: 'carote', label: 'Carote cotte (Una prelibatezza 🥕)', result: 'Scelta saggia e salutare, perchè le porche siamo noi!' },
  { id: 'capperini', label: 'Capperini salati (Per dare sprint alla serata 🌿)', result: 'Sapore forte e stanno bene su tutto, anche nel caffè!' },
  { id: 'lattosio', label: 'Mozzarella, latte o yogurt (Per speedrunnare il bagno 🥛💀)', result: 'ALLARME ROSSO! Situazione catastrofica in bagno tra 10 secondi.' },
];

const WHEEL_OUTCOMES = [
  "🥅 Sorpresone: chi è sotto in classifica rosica la vittoria",
  "🏠 Il fattore Campo di Longo fa il suo sporco lavoro",
  "🖊️ 1-1 scritto con una calligrafia da bar",
  "💥 Over di brutto: le difese vanno in ferie",
  "🧱 Under totale: due muraglie cinesi in campo",
  "🎲 Partita da schedina dalla comodità del divano",
  "🐢 Clamoroso pari e patta al 90esimo",
  "⚡ Scintille: la capolista non scherza in trasferta",
];

const WHEEL_FLAVOR = [
  'Ciucciata in arrivo? Il Fato non fa sconti.',
  'Angu de, il Campo di Longo ci ha messo lo zampino.',
  'Per dio, la classifica non c\'entra nulla qui.',
  'E la madonna: i numeri se ne possono anche andare a quel paese.',
  'LCT al massimo: tiene duro la difesa, soffre la bestia.',
  'Sì, lo so, sembra uno scherzo. SÌ!!!!',
];

// Le tracce cambiano con l'aria della partita: se è da tripla, si passa al pezzo da stadio.
const VIBE_TRACKS = {
  explosive: [
    "🎶 TRACCIA 1: Cassa Dritta, Gambe Aperte (Da Tripla)",
    "🔥 TRACCIA 2: Overload Sì, Paura No",
    "🪩 TRACCIA 3: Bar Sport Bass Boost",
    "🚀 TRACCIA 4: Il Var Non Ferma Nessuno",
  ],
  tense: [
    "🎧 TRACCIA 1: Techno di Sannicola (Sotto Tensione)",
    "💼 TRACCIA 2: Da Fondocampo Senza Respiro",
    "🧨 TRACCIA 3: Lo Sguardo di Simonetta (Slow + Rabbia)",
    "⏱️ TRACCIA 4: Minuti di Recupero Infinite",
  ],
  cozy: [
    "🛋️ TRACCIA 1: Lo Sguardo di Simonetta (Slow Bass)",
    "🥕 TRACCIA 2: Carote & Relax",
    "🍋 TRACCIA 3: Basso da Divano",
    "☕ TRACCIA 4: Cocktail Col Molle",
  ],
  random: [
    "🎪 TRACCIA 1: Cartucce Anthem",
    "🃏 TRACCIA 2: Sorprendimi, Buddy",
    "🎯 TRACCIA 3: Colpo di Testa Samba",
    "🌫️ TRACCIA 4: Nessun Pronostico, Solo Gioia",
  ],
};

function detectVibe(homeTeam, awayTeam, analytics) {
  const rating = calculateBuddyRating(homeTeam, awayTeam, analytics);
  const avg = parseFloat(analytics?.avgGoals) || 2.5;
  if (rating.score >= 75) return 'explosive';
  if (avg >= 2.8) return 'tense';
  if (avg <= 2.1) return 'cozy';
  return 'random';
}

export default function MatchVibesHub({ homeTeam, awayTeam, analytics }) {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);

  const [wheelAngle, setWheelAngle] = useState(0);
  const [wheelOutcome, setWheelOutcome] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPicked, setQuizPicked] = useState(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const vibe = detectVibe(homeTeam, awayTeam, analytics);
  const TRACKS = VIBE_TRACKS[vibe];

  const vibeNote =
    vibe === 'explosive'
      ? 'Vibe da tripla: cassa dritta e polmoni pieni!'
      : vibe === 'tense'
        ? 'Vibra la tensione: volume alto, cuori a mille!'
        : vibe === 'cozy'
          ? 'Niente fretta: si guarda comodi, coi bassi morbidi.'
          : 'Vibe imprevedibile: playlist alla carlona, come i pronostici!';

  const nextTrack = () => {
    setIsPlaying(true);
    setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
  };

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWheelOutcome(null);
    const spin = 720 + Math.floor(Math.random() * 720);
    const next = wheelAngle + spin;
    setWheelAngle(next);
    const idx = Math.floor((((next % 360) + 360) % 360 + 22.5) / 45) % WHEEL_OUTCOMES.length;
    const outcome = WHEEL_OUTCOMES[idx];
    setTimeout(() => {
      const flavor = WHEEL_FLAVOR[Math.floor(Math.random() * WHEEL_FLAVOR.length)];
      setWheelOutcome({ text: outcome, flavor });
      setIsSpinning(false);
    }, 1300);
  };

  const posOf = (team) => {
    const n = parseInt(team?.position);
    return Number.isNaN(n) || n <= 0 ? 10 : n;
  };

  const buildQuiz = () => {
    const qs = [];
    qs.push({
      q: `Chi è più su in classifica tra le due?`,
      options: [homeTeam.name, awayTeam.name],
      correct: posOf(homeTeam) < posOf(awayTeam) ? 0 : 1,
      fun: posOf(homeTeam) === posOf(awayTeam)
        ? 'Sono appaiate, che diabolico test!'
        : posOf(homeTeam) < posOf(awayTeam)
          ? `${homeTeam.name} guida la nave, ${awayTeam.name} rema da sotto.`
          : `${awayTeam.name} ha più punti, ${homeTeam.name} fa il pesce in padella.`,
    });
    qs.push({
      q: `La signora di casa ${homeTeam.name} ha segnato in casa?`,
      options: ['Sì, quasi sempre', 'No, digiuna in casa'],
      correct: (() => {
        const scoredIn = parseInt(homeTeam?.homeScoredIn) || 0;
        const matches = parseInt(homeTeam?.homeMatches) || 1;
        return scoredIn / Math.max(1, matches) >= 0.5 ? 0 : 1;
      })(),
      fun: 'I dati della stagione corrente parlano: la porta la conosce o non la conosce.',
    });
    qs.push({
      q: `Chi segna di più a partita (in casa/trasferta)?`,
      options: [
        `${homeTeam.name}: ${homeTeam?.avgGoalsHome ?? '-'} gol/gara in casa`,
        `${awayTeam.name}: ${awayTeam?.avgGoalsAway ?? '-'} gol/gara fuori`,
      ],
      correct: (() => {
        const h = parseFloat(homeTeam?.avgGoalsHome) || 0;
        const a = parseFloat(awayTeam?.avgGoalsAway) || 0;
        return h >= a ? 0 : 1;
      })(),
      fun: ['La casa tifa, la trasferta trema.', 'Fuori casa non è mai un picnic.'][0],
    });
    qs.push({
      q: `Secondo i numeri, quanti gol totali è lecito aspettarsi?`,
      options: [
        `Pochi (⭐ ${analytics?.avgGoals ?? '?'} di media)`,
        `Tanti (🔥 ${analytics?.avgGoals ?? '?'} di media)`,
        `Mi aspetto il diluvio: +3.5`,
      ],
      correct: (() => {
        const avg = parseFloat(analytics?.avgGoals) || 2.5;
        if (avg >= 3) return 1;
        if (avg <= 2.2) return 0;
        return 2;
      })(),
      fun: (() => {
        const avg = parseFloat(analytics?.avgGoals) || 2.5;
        if (avg >= 3) return `Media ${avg}: le porte qui buttano dentro tutto, anche gli spazzini.`;
        if (avg <= 2.2) return `Media ${avg}: le difese fanno la guerra e le punizioni pure.`;
        return `Media ${avg}: la palla può fare di tutto, leggi il campo!`;
      })(),
    });
    return qs;
  };

  const quiz = buildQuiz();
  const current = quiz[quizIndex];

  return (
    <div className="space-y-4">
      {/* 0. RUOTA DELLA FORTUNA */}
      <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-3 text-center">
        <h4 className="text-xs uppercase tracking-wider font-bold text-cyan-400">
          🎡 La Ruota del Fato di Campo di Longo
        </h4>
        <p className="text-xs text-slate-400">
          Spinna la ruota e scopri cosa &quot;sentono&quot; i giunti del campo (senza alcuna responsabilità sportiva):
        </p>

        <div className="relative w-56 h-56 mx-auto">
          {/* Ruota fissa: i settori non girano, le etichette restano leggibili */}
          <div
            className="absolute inset-0 rounded-full border-4 border-slate-700 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
            style={{
              background: `conic-gradient(${WHEEL_OUTCOMES.map(
                (_, i) => `hsl(${(i * 45 + 20) % 360} 60% 62%) 0deg ${(i + 1) * 45}deg`
              ).join(',')})`,
            }}
          >
            {WHEEL_OUTCOMES.map((o, i) => {
              const a = ((i * 45 - 90 + 22.5) * Math.PI) / 180;
              const left = 50 + 50 * 0.66 * Math.cos(a);
              const top = 50 + 50 * 0.66 * Math.sin(a);
              return (
                <span
                  key={i}
                  className="absolute text-[9px] font-extrabold text-slate-800 leading-tight px-1 text-center"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    transform: 'translate(-50%, -50%)',
                    textShadow: '0 0 3px rgba(255,255,255,0.7)',
                    width: '84px',
                  }}
                >
                  {o.slice(0, 13)}
                </span>
              );
            })}
          </div>

          {/* Lancetta: gira lei, non il campo */}
          <div
            className="absolute left-1/2 top-1/2 w-2 h-24 z-20"
            style={{
              transform: `rotate(${wheelAngle}deg)`,
              transformOrigin: '50% 100%',
              marginLeft: '-4px',
              marginTop: '-96px',
              transition: `transform ${isSpinning ? '1300ms' : '0ms'} cubic-bezier(0.12, 0.8, 0.16, 1)`,
            }}
          >
            <div
              className="w-full h-full"
              style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', background: 'linear-gradient(#ef4444, #b91c1c)' }}
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-slate-100 rounded-full border-4 border-slate-600 z-30 shadow-lg" />
          </div>
        </div>

        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-extrabold py-2 rounded-xl text-xs transition-all shadow-lg"
        >
          {isSpinning ? '🌀 In rotazione...' : '🎡 Fai girare la Ruota'}
        </button>

        {wheelOutcome && (
          <div className="bg-slate-900 p-3 rounded-lg border border-cyan-500/40 text-xs text-slate-200 animate-fade-in space-y-1">
            <p>
              <span className="font-bold text-cyan-300">Il Fato di Campo di Longo ha deciso: </span>
              {wheelOutcome.text}
            </p>
            <p className="text-[11px] text-cyan-200/70 italic">{wheelOutcome.flavor}</p>
          </div>
        )}
      </div>

      {/* QUIZ DEL TIFOSO */}
      <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3">
        <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400 text-center">
          🧠 Quiz del Tifoso Da Divano
        </h4>

        {!quizStarted ? (
          <div className="text-center space-y-2">
            <p className="text-xs text-slate-400">
              Quattro domandine sui dati reali di {homeTeam.name} vs {awayTeam.name}. Rivela quanto conosci la tua squadra del cuore!
            </p>
            <button
              onClick={() => setQuizStarted(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs transition-all shadow-lg"
            >
              🚀 Inizia il Quiz
            </button>
          </div>
        ) : quizFinished ? (
          <div className="text-center space-y-2">
            <p className="text-lg font-extrabold text-emerald-300">
              {quizScore === 4 ? '🏆 QUADRUPLA!! Fenomeno, LCT=0!' : quizScore === 3 ? '🔥 Tre su quattro, mister!' : quizScore === 2 ? '🙃 Metà giusto, si ricomincia.' : quizScore === 1 ? '😬 Un punto: ciucciata di fiuto.' : '💀 Full ciucciata. La panca ti aspetta.'}
            </p>
            <p className="text-xs text-slate-400">Punteggio: {quizScore}/4</p>
            <p className="text-xs text-slate-500 italic">{buddyMotto()}</p>
            <button
              onClick={() => {
                setQuizStarted(false);
                setQuizIndex(0);
                setQuizScore(0);
                setQuizFinished(false);
                setQuizPicked(null);
              }}
              className="text-[11px] text-emerald-400 underline pt-1"
            >
              Ritenta il Quiz
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
              <span>Domanda {quizIndex + 1}/{quiz.length}</span>
              <span className="text-emerald-400 font-bold">Punti: {quizScore}</span>
            </div>
            <p className="text-xs font-bold text-slate-200 text-center leading-relaxed">{current.q}</p>
            <div className="space-y-2">
              {current.options.map((opt, idx) => (
                <button
                  key={idx}
                  disabled={quizPicked !== null}
                  onClick={() => {
                    setQuizPicked(idx);
                    if (idx === current.correct) setQuizScore((s) => s + 1);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                    quizPicked === null
                      ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-emerald-500'
                      : idx === current.correct
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {quizPicked !== null && (
              <div className="bg-slate-900 p-3 rounded-lg border border-emerald-500/40 text-xs text-slate-200 animate-fade-in space-y-1">
                <p className="font-bold text-emerald-400">
                  {quizPicked === current.correct ? '✅ Esatto!' : '❌ Sbagliato!'}
                </p>
                <p>{current.fun}</p>
                <button
                  onClick={() => {
                    const next = quizIndex + 1;
                    if (next >= quiz.length) {
                      setQuizFinished(true);
                    } else {
                      setQuizIndex(next);
                    }
                    setQuizPicked(null);
                  }}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold py-1.5 rounded-lg text-[11px] transition-all"
                >
                  {quizIndex + 1 >= quiz.length ? '🏁 Vedi il Verdetto' : '➡️ Prossima Domanda'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 1. DJ SET */}
      <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs uppercase tracking-wider font-bold text-purple-400">
            🎧 DJ Set nel Campo di Longo
          </h4>
          <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
            {isPlaying ? '🔴 IN ONDA' : '⏸️ PAUSA'}
          </span>
        </div>

        <p className="text-[11px] text-purple-200/70 italic">{vibeNote}</p>

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
            <p className="text-[11px] text-slate-500 italic pt-1">
              {exclamation(homeTeam.name.length + awayTeam.name.length + selectedFood.id.length)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}