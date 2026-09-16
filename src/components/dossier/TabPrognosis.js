'use client';

import { getBookiePrognosis } from '@/lib/analytics';

export default function TabPrognosis({
  match,
  textStyle,
  oddsData,
  oddsLoading,
  oddsError,
  guessHome,
  setGuessHome,
  guessAway,
  setGuessAway,
  guessSubmitted,
  setGuessSubmitted,
  guessGhost,
  setGuessGhost,
}) {
  const { primaryText, borderPrimary } = textStyle;
  const bp = getBookiePrognosis(match.homeTeam, match.awayTeam, match.analytics);
  const signAdvice =
    bp.sign.pick === '1' ? `1 (${match.homeTeam.name})` :
    bp.sign.pick === '2' ? `2 (${match.awayTeam.name})` :
    'X (pareggio)';

  return (
    <div className="space-y-4">
      {/* 1X2 */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <h4 className={`text-xs uppercase tracking-wider font-semibold ${primaryText} text-center`}>
          🎯 Segno Suggerito (1X2)
        </h4>
        <div className="flex rounded-lg overflow-hidden h-6 text-[10px] md:text-[11px] font-mono font-bold text-slate-950">
          <div className="bg-emerald-500 flex items-center justify-center min-w-0" style={{ width: `${bp.sign.p1}%` }}>
            {bp.sign.p1 > 12 ? `1 ${bp.sign.p1}%` : ''}
          </div>
          <div className="bg-slate-500 flex items-center justify-center min-w-0" style={{ width: `${bp.sign.pX}%` }}>
            {bp.sign.pX > 12 ? `X ${bp.sign.pX}%` : ''}
          </div>
          <div className="bg-rose-500 flex items-center justify-center min-w-0" style={{ width: `${bp.sign.p2}%` }}>
            {bp.sign.p2 > 12 ? `2 ${bp.sign.p2}%` : ''}
          </div>
        </div>
        <p className="text-xs text-slate-200 text-center font-medium leading-relaxed">{bp.sign.hint}</p>
        <div className="text-center">
          <span className="text-[11px] text-slate-400 font-mono">Consiglio del Buddy: </span>
          <span className={`${primaryText} font-bold text-sm font-mono`}>{signAdvice}</span>
        </div>
      </div>

      {/* Over/Under */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <h4 className={`text-xs uppercase tracking-wider font-semibold ${primaryText} text-center`}>
          ⚽ Over/Under 2.5
        </h4>
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>Gol attesi: <span className="text-slate-200 font-bold">{bp.overUnder.total}</span>
            <span className="text-slate-600"> ({match.homeTeam.name} {match.analytics?.homeExpectedGoals} + {match.awayTeam.name} {match.analytics?.awayExpectedGoals})</span>
          </span>
        </div>
        <div className="relative h-6 bg-slate-800 rounded-lg overflow-hidden">
          <div className={`h-full ${bp.overUnder.pick !== 'UNDER 2.5' ? 'bg-emerald-500/70' : 'bg-slate-600/70'}`} style={{ width: `${bp.overUnder.pOver25}%` }} />
          <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-mono font-bold text-slate-100">
            <span>UNDER {bp.overUnder.pUnder25}%</span>
            <span>{bp.overUnder.pick}</span>
            <span>OVER {bp.overUnder.pOver25}%</span>
          </div>
        </div>
        <p className="text-xs text-slate-200 text-center font-medium leading-relaxed">{bp.overUnder.hint}</p>
      </div>

      {/* Gol/No Gol */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <h4 className={`text-xs uppercase tracking-wider font-semibold ${primaryText} text-center`}>
          🥅 Gol / No Gol
        </h4>
        <div className="relative h-6 bg-slate-800 rounded-lg overflow-hidden">
          <div className={`h-full ${bp.goalNoGoal.pick !== 'NG' ? 'bg-emerald-500/70' : 'bg-slate-600/70'}`} style={{ width: `${bp.goalNoGoal.pGG}%` }} />
          <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-mono font-bold text-slate-100">
            <span>NG {bp.goalNoGoal.pNG}%</span>
            <span>{bp.goalNoGoal.pick}</span>
            <span>GG {bp.goalNoGoal.pGG}%</span>
          </div>
        </div>
        <p className="text-xs text-slate-200 text-center font-medium leading-relaxed">{bp.goalNoGoal.hint}</p>
      </div>

      {bp.minSample < 4 && (
        <p className="text-[11px] text-slate-500 italic text-center">
          🕰️ Campione ancora piccolo (max {bp.minSample} gare in questo stadio): i numeri c&apos;è li mette, la verità arriverà con le prossime giornate.
        </p>
      )}

      {/* Quote medie reali dai bookmaker */}
      <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3">
        <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400 text-center">
          💰 Quotazioni Medie Reali (Bookmaker)
        </h4>

        {oddsLoading ? (
          <p className="text-center text-slate-500 text-xs py-2">Consultazione dei banchi scommessa in corso...</p>
        ) : oddsError ? (
          <p className="text-center text-slate-500 text-xs py-2 italic">
            {oddsError}
            <br />
            <span className="text-slate-600">Dipende dal piano gratuito del provider delle quote: a volte arrivano solo all&apos;ultimo momento.</span>
          </p>
        ) : oddsData?.available ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-amber-300 font-bold shrink-0">Segno 1X2</span>
              <span className="flex gap-3 font-mono text-slate-200">
                <span>1: <b className="text-emerald-400">{oddsData.odds.matchWinner.home}</b></span>
                <span>X: <b className="text-slate-300">{oddsData.odds.matchWinner.draw}</b></span>
                <span>2: <b className="text-rose-400">{oddsData.odds.matchWinner.away}</b></span>
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-amber-300 font-bold shrink-0">Over / Under 2.5</span>
              <span className="flex gap-3 font-mono text-slate-200">
                <span>Over: <b className="text-emerald-400">{oddsData.odds.overUnder25.over}</b></span>
                <span>Under: <b className="text-rose-400">{oddsData.odds.overUnder25.under}</b></span>
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-amber-300 font-bold shrink-0">Gol / No Gol</span>
              <span className="flex gap-3 font-mono text-slate-200">
                <span>GG: <b className="text-emerald-400">{oddsData.odds.btts.yes}</b></span>
                <span>NG: <b className="text-rose-400">{oddsData.odds.btts.no}</b></span>
              </span>
            </div>
            {oddsData.predictions?.winner && (
              <p className="text-[11px] text-slate-400 text-center pt-1 border-t border-slate-800">
                🧠 Sugg. bookmaker: <span className="text-amber-300 font-bold">{oddsData.predictions.winner}</span>
                {oddsData.predictions.percent && (
                  <span className="text-slate-500"> ({oddsData.predictions.percent.home}% / {oddsData.predictions.percent.draw}% / {oddsData.predictions.percent.away}%)</span>
                )}
              </p>
            )}
            <p className="text-[10px] text-slate-500 italic text-center">
              Media da {oddsData.odds.bookmakerCount} bookmaker reali (api-football). Ricorda: quotazioni NOTE, mica consigli!
            </p>
          </div>
        ) : (
          <p className="text-center text-slate-500 text-xs py-2 italic">
            Quote non ancora pubblicate per questa gara.
          </p>
        )}
      </div>

      {/* Minigame: Indovina il Risultato */}
      <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-3">
        <h4 className="text-xs uppercase tracking-wider font-bold text-cyan-400 text-center">
          🎮 Indovina il Risultato!
        </h4>
        <p className="text-xs text-slate-400 text-center">
          Da vero mister, buttala lì: quanto finisce? Poi il Buddy ti dice se il tuo fiuto regge.
        </p>

        {!guessSubmitted ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-slate-300 max-w-[100px] text-center leading-tight">{match.homeTeam.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setGuessHome(Math.max(0, guessHome - 1))} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold">−</button>
                  <span className="w-10 text-center text-2xl font-mono font-bold text-cyan-300">{guessHome}</span>
                  <button onClick={() => setGuessHome(guessHome + 1)} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold">+</button>
                </div>
              </div>
              <span className="text-slate-600 font-extrabold text-lg">-</span>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[11px] font-bold text-slate-300 max-w-[100px] text-center leading-tight">{match.awayTeam.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setGuessAway(Math.max(0, guessAway - 1))} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold">−</button>
                  <span className="w-10 text-center text-2xl font-mono font-bold text-cyan-300">{guessAway}</span>
                  <button onClick={() => setGuessAway(guessAway + 1)} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold">+</button>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const g = { home: guessHome, away: guessAway };
                setGuessGhost(g);
                setGuessSubmitted(true);
              }}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold py-2 rounded-xl text-xs transition-all shadow-lg"
            >
              🌀 Lancia & Confronta col Buddy
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-center">
            <p className="font-mono text-lg">
              <span className="text-slate-300">{match.homeTeam.name}</span>{' '}
              <b className="text-cyan-300">{guessGhost?.home} - {guessGhost?.away}</b>{' '}
              <span className="text-slate-300">{match.awayTeam.name}</span>
            </p>
            <div className="bg-slate-900 p-3 rounded-lg border border-cyan-500/30 text-xs space-y-2">
              <p className="text-cyan-200 leading-relaxed">{(() => {
                const eh = parseFloat(match.analytics?.homeExpectedGoals) || 1;
                const ea = parseFloat(match.analytics?.awayExpectedGoals) || 1;
                const buddy = { home: Math.round(eh), away: Math.round(ea) };
                const total = guessGhost.home + guessGhost.away;
                const buddyTotal = buddy.home + buddy.away;
                const diff = Math.abs(guessGhost.home - buddy.home) + Math.abs(guessGhost.away - buddy.away);
                if (diff === 0) return '🎯 CLAMOROSO! Hai indovinato esattamente il risultato atteso dal Buddy! Il tuo fiuto è da guru della schedina. SÌ!!!!';
                if (diff <= 1) return `🔮 Ci sei andato molto vicino! Il Buddy aveva in mente ${buddy.home}-${buddy.away} (gol attesi ${eh.toFixed(1)}-${ea.toFixed(1)}). Un pelo di più e sbancavi.`;
                if (total === buddyTotal) return `⚖️ Mezzo risultato giusto: stesso numero di gol totali del Buddy (${buddyTotal}), ma non la stessa combinazione (lui dice ${buddy.home}-${buddy.away}). Maglia a righe da discoteca!`;
                return `🤷 Il Buddy tavola ${buddy.home}-${buddy.away} (attesi ${eh.toFixed(1)}-${ea.toFixed(1)}), il tuo fiuto dice ${guessGhost.home}-${guessGhost.away}. Beh, al pallone non importa nulla di nessuno dei due!`;
              })()}</p>
              <p className="text-[11px] text-slate-500 italic">Il Buddy è partito dai gol attesi. Tu dalla pancia. La pancia ha la sua logica!</p>
            </div>
            <button onClick={() => { setGuessSubmitted(false); setGuessGhost(null); }} className="text-[11px] text-cyan-400 underline pt-1">
              Ritenta, sarai più fortunato!
            </button>
          </div>
        )}
      </div>

      <div className={`bg-slate-950 p-4 rounded-xl border ${borderPrimary} space-y-2`}>
        <h4 className={`text-xs uppercase tracking-wider font-bold ${primaryText}`}>🗳️ Il Verdetto del Buddy:</h4>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">{bp.verdict}</p>
      </div>
    </div>
  );
}