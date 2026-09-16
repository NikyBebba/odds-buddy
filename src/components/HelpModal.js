'use client';

import Glossary from '@/components/Glossary';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
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
            <p className="font-bold text-emerald-400">🎯 Buddy Rating (35-95)</p>
            <p>È il punteggio di prevedibilità della partita, calcolato da dati reali: divario in classifica (max 30), forma recente (max 25), potenza attacco/difesa (max 25) e fattore campo (max 20). Più è alto, più il pronostico è chiaro; sotto i 60 è partita da sorpresa.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-amber-400">⚠️ Alert Trappola</p>
            <p>Si attiva quando c&apos;è grande distanza in classifica ma uno di questi punti zoppica: la favorita gioca fuori casa, oppure arriva in calo di forma. In quei casi la classifica può mentire.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-slate-200">🛡️ Clean Sheet</p>
            <p>Numero di partite in cui la squadra non ha subito nemmeno un gol. Insieme ai gol segnati/incassati in casa o in trasferta, ti dice dove una squadra è davvero forte.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-blue-400">⚔️ Scontri diretti (H2H)</p>
            <p>Gli ultimi precedenti tra le due squadre, tratti dai dati reali. Nel tab &quot;H2H &amp; Ultime&quot; trovi sia la stagione corrente sia le stagioni passate (le ultime 3, via football-data.org).</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-amber-400">💰 Quotazioni Medie Bookmaker</p>
            <p>Nel tab &quot;Pronostico&quot; il Buddy pizzica le quote reali dai bookmaker (tramite api-football.com) e le medie: Segno 1X2, Over/Under 2.5 e Gol/No Gol. Sono quotazioni di mercato, non consigli di scommessa!</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-emerald-400">🎯 Pronostico del Buddy</p>
            <p>Stime statistiche dai rendimenti reali: il segno 1X2 lo ricava da vittorie/pareggi/sconfitte in casa e in trasferta, Over/Under 2.5 dai gol attesi, Gol/No Gol dalla probabilità che entrambe segnino. Indicazioni a scopo informativo, non gonfiartela se perdi! 😄</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-rose-400">🩹 Infermeria Reale</p>
            <p>Nel tab &quot;Quadro&quot; il Buddy consulta bigballsdata.com per gli infortunati reali delle due squadre. Le assenze cambiano ogni pronostico: chi gioca in emergenza può trasformarsi in una ciucciata a sorpresa!</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-cyan-400">🏆 Leggende del Pallone</p>
            <p>Quiz di cultura calcistica con fatti storici veri e verificabili. Niente numeri tirati a caso: solo pagine di enciclopedia del calcio.</p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <p className="font-bold text-slate-200">🌿 Coppe in Stand-by</p>
            <p>Europa League e Conference League sono momentaneamente in stand-by: l&apos;API gratuita non fornisce dati veri per quelle competizioni, quindi preferiamo non inventare nulla!</p>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-800 pt-3">
          <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
            📖 Dizionario del Buddy
          </h4>
          <Glossary accentClass="text-purple-300" />
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