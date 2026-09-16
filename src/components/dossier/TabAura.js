'use client';

import { getAuraMeter } from '@/lib/analytics';

export default function TabAura({ match, textStyle }) {
  const { primaryText, borderPrimary } = textStyle;
  const aura = getAuraMeter(match.homeTeam, match.awayTeam, match.analytics);

  return (
    <div className="space-y-4">
      {/* Status Aura Reale */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
        <h4 className={`text-xs uppercase tracking-wider font-semibold ${primaryText} text-center`}>
          🌾 Status Aura Reale
        </h4>

        {/* Barre 0-100 */}
        {[
          { label: match.homeTeam.name, data: aura.homeAura, status: aura.homeAuraStatus },
          { label: match.awayTeam.name, data: aura.awayAura, status: aura.awayAuraStatus },
        ].map((t) => (
          <div key={t.label} className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-300 font-bold truncate">{t.label}</span>
              <span className={`font-mono font-bold ${primaryText} shrink-0`}>{t.data.score}/100</span>
            </div>

            {/* Barra */}
            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  t.data.score >= 70
                    ? 'bg-emerald-500'
                    : t.data.score <= 35
                      ? 'bg-rose-500/80'
                      : 'bg-amber-400/70'
                }`}
                style={{ width: `${t.data.score}%` }}
              />
            </div>

            {/* Dettagli composizione */}
            <div className="flex flex-wrap justify-between text-[10px] text-slate-500 font-mono gap-1">
              <span>Posizione: {t.data.position}°</span>
              <span>Forma: {t.data.form ?? 'n/d'}</span>
              <span>Agg. forma: {t.data.formBonus >= 0 ? '+' : ''}{t.data.formBonus}</span>
            </div>

            <p className={`text-[11px] font-bold ${primaryText} text-center`}>{t.status}</p>
          </div>
        ))}

        {/* Scala legenda */}
        <p className="text-[10px] text-slate-600 text-center font-mono">
          Aura da 0 (panchina) a 100 (padroni del campo) — + alte = + sicuri del proprio rendimento
        </p>
      </div>

      {/* Livello Gasa */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs gap-2">
        <span className="text-slate-400 font-medium">Livello &quot;Gasa&quot; della sfida:</span>
        <span className={`font-bold ${primaryText} font-mono text-xs md:text-sm text-center`}>{aura.gasaLevel}</span>
      </div>

      {/* Verdetto */}
      <div className={`bg-slate-950 p-4 rounded-xl border ${borderPrimary} space-y-2`}>
        <h4 className={`text-xs uppercase tracking-wider font-bold ${primaryText}`}>
          🗣️ Verdetto del Buddy (casa + dati prima):
        </h4>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {aura.verdict}
        </p>
      </div>
    </div>
  );
}