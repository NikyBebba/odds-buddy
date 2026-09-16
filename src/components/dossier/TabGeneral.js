'use client';

import VibesCheck from '@/components/VibesCheck';
import VenueInfo from '@/components/VenueInfo';
import { calculateBuddyRating, generateMatchSummary } from '@/lib/analytics';

function InjuredList({ teamData }) {
  if (!teamData) return null;
  const injured = teamData.injured || [];
  return (
    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
      <p className="font-bold text-slate-300 text-center text-[11px] mb-1">{teamData.name}</p>
      {injured.length > 0 ? (
        <ul className="text-[11px] text-slate-400 font-mono leading-relaxed space-y-0.5">
          {injured.map((p, idx) => (
            <li key={idx} className="flex items-center justify-between gap-1">
              <span className="truncate">{p}</span>
              <span className="text-rose-400 shrink-0">🩹</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[11px] text-slate-500 text-center italic">Infermeria vuota: tutti in sella (o in panchina).</p>
      )}
    </div>
  );
}

export default function TabGeneral({ match, textStyle, teamExtras, teamExtrasLoading, teamExtrasError, venues }) {
  const { primaryText, primaryBg } = textStyle;
  const rating = calculateBuddyRating(match.homeTeam, match.awayTeam, match.analytics);
  const trap = match.analytics?.trapScore;

  return (
    <div className="space-y-4">
      <VibesCheck
        homeTeam={match.homeTeam}
        awayTeam={match.awayTeam}
        avgGoals={match.analytics?.avgGoals}
        accentClass={primaryText}
        homeForm={match.analytics?.homeForm}
        awayForm={match.analytics?.awayForm}
      />

      {/* Infermeria (bigballsdata) */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <h4 className={`text-xs uppercase tracking-wider font-semibold ${primaryText} text-center`}>
          🩹 Infermeria Reale
        </h4>
        {teamExtrasLoading ? (
          <p className="text-center text-slate-500 text-xs py-2">Traduzione dei referti medici in corso...</p>
        ) : teamExtrasError ? (
          <p className="text-center text-slate-500 text-xs py-2 italic">
            Infermeria non raggiungibile: {teamExtrasError}
          </p>
        ) : teamExtras ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <InjuredList teamData={teamExtras.home} />
              <InjuredList teamData={teamExtras.away} />
            </div>
            <p className="text-[10px] text-slate-500 italic text-center">
              * Dati infortunati in tempo reale (bigballsdata.com). Occhio alle assenze: cambiano ogni prognosi!
            </p>
          </>
        ) : (
          <p className="text-center text-slate-500 text-xs py-2 italic">Clicca il tab &quot;Quadro&quot; per aprire l&apos;infermeria.</p>
        )}
      </div>

      {/* Buddy Rating breakdown */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className={`text-xs uppercase tracking-wider font-semibold ${primaryText}`}>
            💡 Perché questo Rating ({rating.score}/100)?
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">{rating.label}</span>
        </div>
        <div className="space-y-2">
          {rating.breakdown.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400 w-36 shrink-0">{b.label}</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${primaryBg.split(' ')[0]}`} style={{ width: `${(b.value / b.max) * 100}%` }} />
              </div>
              <span className="font-mono text-slate-300 w-16 text-right">
                {b.value}/{b.max}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Venue trivie */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
        <h4 className={`text-xs uppercase tracking-wider font-semibold ${primaryText} text-center mb-1`}>🏟️ Stadio della casa</h4>
        <div className="grid grid-cols-2 gap-3">
          <VenueInfo venue={venues?.home} teamName={match.homeTeam.name} />
          <VenueInfo venue={venues?.away} teamName={match.awayTeam.name} />
        </div>
      </div>

      {/* Alert Trappola */}
      {trap && trap.level !== 'none' && (
        <div className={`p-4 rounded-xl border text-xs space-y-1 ${
          trap.level === 'danger'
            ? 'bg-rose-950/40 border-rose-500/50'
            : 'bg-amber-950/30 border-amber-500/40'
        }`}>
          <p className={`font-bold ${trap.level === 'danger' ? 'text-rose-300' : 'text-amber-300'}`}>
            {trap.level === 'danger' ? '🚨 Alert Trappola' : '⚠️ Occhio, possibile trappola'}
          </p>
          <p className="text-slate-300 leading-relaxed">{trap.message}</p>
        </div>
      )}

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <h4 className={`text-xs uppercase tracking-wider font-semibold ${primaryText}`}>
          📝 Quadro Neutrale di Odds Buddy
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          {generateMatchSummary(match.homeTeam, match.awayTeam, match.analytics)}
        </p>
        <p className="text-[11px] text-slate-500 italic pt-1">
          * Ricorda: le statistiche raccontano il passato, ma nel calcio il verdetto spetta solo al campo!
        </p>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 text-center">
          📊 Rendimento Casa vs Trasferta
        </h4>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-slate-900 p-3 rounded-lg space-y-2 border border-slate-800">
            <p className="font-bold text-slate-200 text-center border-b border-slate-800 pb-1">
              🏠 {match.homeTeam.name}
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Gol segnati in casa:</span>
              <span className={`${primaryText} font-bold`}>{match.homeTeam.homeGoalsFor ?? 0}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Gol subiti in casa:</span>
              <span className="text-rose-400 font-bold">{match.homeTeam.homeGoalsAgainst ?? 0}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Media gol/gara in casa:</span>
              <span className="text-slate-200 font-bold">{match.homeTeam.avgGoalsHome ?? '-'}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">🛡️ Clean sheet totali:</span>
              <span className="text-slate-200 font-bold">{match.homeTeam.cleanSheets ?? 0}</span>
            </p>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg space-y-2 border border-slate-800">
            <p className="font-bold text-slate-200 text-center border-b border-slate-800 pb-1">
              ✈️ {match.awayTeam.name}
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Gol segnati in trasferta:</span>
              <span className={`${primaryText} font-bold`}>{match.awayTeam.awayGoalsFor ?? 0}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Gol subiti in trasferta:</span>
              <span className="text-rose-400 font-bold">{match.awayTeam.awayGoalsAgainst ?? 0}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">Media gol/gara in trasferta:</span>
              <span className="text-slate-200 font-bold">{match.awayTeam.avgGoalsAway ?? '-'}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-slate-400">🛡️ Clean sheet totali:</span>
              <span className="text-slate-200 font-bold">{match.awayTeam.cleanSheets ?? 0}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}