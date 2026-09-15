'use client';

export default function VibesCheck({ homeTeam, awayTeam, avgGoals }) {
  // Calcolo semplificato dell'indice di forma
  const getStatusEmoji = (pos) => {
    const position = parseInt(pos) || 10;
    if (position <= 3) return { label: 'In Trono 👑', color: 'text-amber-400' };
    if (position <= 7) return { label: 'In Corsa 🔥', color: 'text-emerald-400' };
    if (position <= 13) return { label: 'Naviga a Vista ⛵', color: 'text-blue-400' };
    return { label: 'Zona Pericolo ⚠️', color: 'text-rose-400' };
  };

  const homeStatus = getStatusEmoji(homeTeam.position);
  const awayStatus = getStatusEmoji(awayTeam.position);

  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 mb-6">
      <h4 className="text-xs uppercase tracking-wider font-semibold text-emerald-400 text-center">
        ✨ Vibes Check: Blasone vs Realtà
      </h4>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center space-y-1">
          <p className="font-bold text-slate-200">{homeTeam.name}</p>
          <p className={`font-semibold ${homeStatus.color}`}>{homeStatus.label}</p>
          <p className="text-[11px] text-slate-400">
            {homeTeam.goalsFor > homeTeam.goalsAgainst ? 'Attacco in salute ⚽' : 'Difesa da rivedere 🛡️'}
          </p>
        </div>

        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center space-y-1">
          <p className="font-bold text-slate-200">{awayTeam.name}</p>
          <p className={`font-semibold ${awayStatus.color}`}>{awayStatus.label}</p>
          <p className="text-[11px] text-slate-400">
            {awayTeam.goalsFor > awayTeam.goalsAgainst ? 'Attacco in salute ⚽' : 'Difesa da rivedere 🛡️'}
          </p>
        </div>
      </div>
    </div>
  );
}
