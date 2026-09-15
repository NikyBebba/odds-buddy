'use client';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 text-lg"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          💡 Pillole del Buddy: Guida ai Dati
        </h3>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-emerald-400">🎯 Buddy Rating (0-100)</p>
            <p>È il punteggio di prevedibilità della partita. Un punteggio alto (&gt;75) indica un match con favoriti chiari e trend stabili.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-amber-400">⚠️ Alert Trappola</p>
            <p>Si attiva quando c'è grande distanza in classifica ma la squadra favorita gioca fuori casa o ha un rendimento recente in calo.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-slate-200">🛡️ Clean Sheet</p>
            <p>Indica il numero di partite disputate in cui la squadra non ha subito nemmeno un gol. Fondamentale per valutare la difesa.</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl transition-all text-xs"
        >
          Ho Capito
        </button>
      </div>
    </div>
  );
}
