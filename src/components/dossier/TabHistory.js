'use client';

import { getH2HHistory } from '@/lib/analytics';

export default function TabHistory({ match, textStyle, h2hPast, h2hPastLoading, h2hPastError }) {
  const { primaryText } = textStyle;

  return (
    <div className="space-y-4">
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 text-center">
          🕒 Risultati delle ultime 4 gare
        </h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <p className="font-bold text-slate-300 text-center border-b border-slate-800 pb-1">
              {match.homeTeam.name}
            </p>
            {match.analytics?.homeHistory?.length > 0 ? (
              match.analytics.homeHistory.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900 px-2 py-1.5 rounded">
                  <span className="truncate max-w-[90px] text-slate-400">{m.opponent}</span>
                  <span className="font-mono">{m.score}</span>
                  <span>{m.icon}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-600 text-center">Dati non disp.</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="font-bold text-slate-300 text-center border-b border-slate-800 pb-1">
              {match.awayTeam.name}
            </p>
            {match.analytics?.awayHistory?.length > 0 ? (
              match.analytics.awayHistory.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900 px-2 py-1.5 rounded">
                  <span className="truncate max-w-[90px] text-slate-400">{m.opponent}</span>
                  <span className="font-mono">{m.score}</span>
                  <span>{m.icon}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-600 text-center">Dati non disp.</p>
            )}
          </div>
        </div>
      </div>

      {/* H2H stagione corrente (già nel payload principale) */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 text-center">
          ⚔️ Precedenti Diretti — Stagione Corrente
        </h4>
        {getH2HHistory(match).length > 0 ? (
          <div className="space-y-2 text-xs">
            {getH2HHistory(match).map((h2h, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded font-mono">
                <span className="text-slate-500">{h2h.season}</span>
                <span className="flex items-center gap-1.5 truncate max-w-[40%]">
                  <span className="text-slate-300 truncate">{h2h.home}</span>
                  <span className="text-[10px]">🏠</span>
                </span>
                <span className={`${primaryText} font-bold`}>{h2h.score}</span>
                <span className="flex items-center gap-1.5 truncate max-w-[40%]">
                  <span className="text-[10px]">✈️</span>
                  <span className="text-slate-300 truncate">{h2h.away}</span>
                </span>
                <span>{h2h.icon}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 text-sm py-4">
            Nessuno scontro diretto ancora registrato in questa stagione.
          </p>
        )}
      </div>

      {/* H2H stagioni passate (caricate on-demand da football-data) */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 text-center">
          📜 Stagioni Passate (scontri diretti)
        </h4>

        {h2hPastLoading ? (
          <p className="text-center text-slate-500 text-sm py-4">Caricamento storico in corso...</p>
        ) : h2hPastError ? (
          <p className="text-center text-rose-400 text-sm py-4">{h2hPastError}</p>
        ) : Array.isArray(h2hPast) && h2hPast.length === 0 ? (
          <p className="text-center text-slate-500 text-sm py-4">
            Nessuno scontro diretto nelle stagioni passate (probabile promozione o campionato diverso).
          </p>
        ) : (
          <div className="space-y-2 text-xs">
            {Array.isArray(h2hPast) &&
              h2hPast.map((h, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded font-mono">
                  <span className="text-slate-500 shrink-0">
                    {new Date(h.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5 truncate max-w-[40%]">
                    <span className="text-slate-300 truncate">{h.homeTeamName}</span>
                    <span className="text-[10px]">{h.homeHosted ? '🏠' : '✈️'}</span>
                  </span>
                  <span className={`${primaryText} font-bold`}>{h.homeGoals} - {h.awayGoals}</span>
                  <span className="flex items-center gap-1.5 truncate max-w-[40%]">
                    <span className="text-[10px]">{h.homeHosted ? '✈️' : '🏠'}</span>
                    <span className="text-slate-300 truncate">{h.awayTeamName}</span>
                  </span>
                  <span>{h.icon}</span>
                </div>
              ))}
            <p className="text-[11px] text-slate-500 italic pt-1">
              * Dati reali delle ultime 3 stagioni (football-data.org). Pesca dalla memoria per capire chi morde di più.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}