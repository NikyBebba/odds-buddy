'use client';

export default function VibesCheck({ homeTeam, awayTeam, avgGoals, accentClass = 'text-emerald-400', homeForm = [], awayForm = [] }) {
  const getStatusEmoji = (pos) => {
    const position = parseInt(pos) || 10;
    if (position <= 3) return { label: 'In Trono 👑', color: 'text-amber-400' };
    if (position <= 7) return { label: 'In Corsa 🔥', color: 'text-emerald-400' };
    if (position <= 13) return { label: 'Naviga a Vista ⛵', color: 'text-blue-400' };
    return { label: 'Zona Pericolo ⚠️', color: 'text-rose-400' };
  };

  const renderForm = (form) =>
    form && form.length > 0 ? (
      <p className="text-[11px] tracking-wide text-slate-400">
        Forma: <span className="space-x-0.5">{form.join('')}</span>
      </p>
    ) : (
      <p className="text-[11px] text-slate-600">Forma: dati non disp.</p>
    );

  const renderNet = (team) => {
    if (team.goalsFor === undefined || team.goalsFor === '-') {
      return <p className="text-[11px] text-slate-600">GF/GS: dati non disp.</p>;
    }
    return team.goalsFor > team.goalsAgainst
      ? <p className="text-[11px] text-slate-400">Attacco in salute ⚽</p>
      : <p className="text-[11px] text-slate-400">Difesa da rivedere 🛡️</p>;
  };

  const homeStatus = getStatusEmoji(homeTeam.position);
  const awayStatus = getStatusEmoji(awayTeam.position);

  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 mb-6">
      <h4 className={`text-xs uppercase tracking-wider font-semibold text-center ${accentClass}`}>
        ✨ Vibes Check: Blasone vs Realtà
      </h4>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center space-y-1">
          <p className="font-bold text-slate-200">{homeTeam.name}</p>
          <p className={`font-semibold ${homeStatus.color}`}>{homeStatus.label}</p>
          {renderNet(homeTeam)}
          {renderForm(homeForm)}
        </div>

        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center space-y-1">
          <p className="font-bold text-slate-200">{awayTeam.name}</p>
          <p className={`font-semibold ${awayStatus.color}`}>{awayStatus.label}</p>
          {renderNet(awayTeam)}
          {renderForm(awayForm)}
        </div>
      </div>

      {avgGoals && avgGoals !== '-' && (
        <p className="text-center text-[11px] text-slate-500 font-mono">
          ⚽ Gol attesi complessivi: <span className={accentClass + ' font-bold'}>{avgGoals}</span> (~{((parseFloat(avgGoals) || 2) / 2).toFixed(1)} per squadra)
        </p>
      )}
    </div>
  );
}