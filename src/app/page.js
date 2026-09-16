'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import HelpModal from '@/components/HelpModal';
import ExtraFun from '@/components/ExtraFun';
import AlertSystem from '@/components/AlertSystem';
import TeamBadge from '@/components/TeamBadge';
import DossierModal from '@/components/dossier/DossierModal';
import { getThemeClasses } from '@/lib/theme';
import { calculateBuddyRating, getBookiePrognosis } from '@/lib/analytics';

const DOMESTIC_LEAGUES = [
  { id: 'serieA', name: '🇮🇹 Serie A' },
  { id: 'premierLeague', name: '🇬🇧 Premier League' },
  { id: 'laLiga', name: '🇪🇸 La Liga' },
  { id: 'bundesliga', name: '🇩🇪 Bundesliga' },
  { id: 'ligue1', name: '🇫🇷 Ligue 1' },
];

const EUROPEAN_LEAGUES = [
  { id: 'championsLeague', name: '🇪🇺 Champions League' },
  { id: 'europaLeague', name: '🇪🇺 Europa League', standby: true },
  { id: 'conferenceLeague', name: '🇪🇺 Conference League', standby: true },
];

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);
  const [theme, setTheme] = useState('sannicola');
  const [selectedLeague, setSelectedLeague] = useState('serieA');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [error, setError] = useState(null);
  const [standbyNote, setStandbyNote] = useState(null);

  const isStandbyLeague = EUROPEAN_LEAGUES.some((l) => l.id === selectedLeague && l.standby);

  useEffect(() => {
    async function fetchMatches() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/matches?league=${selectedLeague}`);
        const data = await res.json();
        if (data.success) {
          setMatches(data.matches);
          setStandbyNote(data.standby ? data.note : null);
        } else {
          setMatches([]);
          setError(data.error || 'Errore sconosciuto dal server.');
          setStandbyNote(null);
        }
      } catch (err) {
        console.error(err);
        setMatches([]);
        setError('Impossibile contattare il server. Riprova tra un attimo.');
        setStandbyNote(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [selectedLeague]);

  const textStyle = getThemeClasses(theme);

  const filteredMatches = matches.filter((match) => {
    const homeName = match.homeTeam.name.toLowerCase();
    const awayName = match.awayTeam.name.toLowerCase();
    const query = searchQuery.toLowerCase();
    return homeName.includes(query) || awayName.includes(query);
  });

  if (!hasEntered) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-amber-500/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl relative z-10 space-y-5">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">
            ⚽
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-amber-400">
              Odds Buddy
            </h1>
            <p className="text-lg font-bold text-slate-100">
              Ciao Valeriona! 👋
            </p>
          </div>

          <ExtraFun />

          <p className="text-xs text-slate-300 font-medium pt-2">
            Vita mia, scegli da quale varco vuoi accedere alla dashboard:
          </p>

          <div className="space-y-2">
            <button
              onClick={() => {
                setTheme('sannicola');
                setHasEntered(true);
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-xs tracking-wide"
            >
              🛰️ Entra da Sannicola
            </button>

            <button
              onClick={() => {
                setTheme('galatone');
                setHasEntered(true);
              }}
              className="w-full bg-purple-600 hover:bg-purple-500 text-slate-100 font-extrabold py-3 rounded-2xl transition-all shadow-lg shadow-purple-600/20 text-xs tracking-wide"
            >
              🗿 Entra da Galatone
            </button>

            <button
              onClick={() => {
                setTheme('roma');
                setHasEntered(true);
              }}
              className="w-full bg-gradient-to-r from-red-700 to-amber-600 hover:from-red-600 hover:to-amber-500 text-slate-100 font-extrabold py-3 rounded-2xl transition-all shadow-lg shadow-red-900/40 text-xs tracking-wide border border-amber-500/30"
            >
              🐺 Entra da Roma
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <header className="max-w-5xl mx-auto mb-6 text-center flex flex-col items-center relative">
        <button
          onClick={() => setIsHelpOpen(true)}
          className={`absolute right-0 top-0 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs ${textStyle.primaryText} font-medium flex items-center gap-1 transition-all`}
        >
          💡 Guida Dati
        </button>

        <h1 className={`text-4xl font-extrabold tracking-tight ${textStyle.primaryText} mb-3`}>
          Odds Buddy ⚽
        </h1>
        <div className="text-slate-400 text-sm md:text-base space-y-1">
          <p className="font-bold text-slate-100 text-xl md:text-2xl tracking-wide">
            Valeriona, <span className="text-xs font-mono text-slate-500">(accesso da {theme.toUpperCase()})</span>
          </p>
          <p className="text-slate-200 font-medium">Ecco il tuo assistente smart per analizzare le partitazze!</p>
          <p className="text-xs md:text-sm text-slate-400">Nessuna trappola, nessuna ciucciata... <span className={`${textStyle.primaryText} font-bold`}>SÌ!!!!</span> 🚀</p>
        </div>
      </header>

      <AlertSystem />

      <div className="max-w-5xl mx-auto mb-6 space-y-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Campionati</span>
          <div className="flex flex-wrap gap-2 justify-center">
            {DOMESTIC_LEAGUES.map((league) => (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedLeague === league.id
                    ? `${textStyle.activeBtnBg} shadow-lg`
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {league.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-800/50">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">Coppe Europee</span>
          <div className="flex flex-wrap gap-2 justify-center">
            {EUROPEAN_LEAGUES.map((league) => (
              <button
                key={league.id}
                onClick={() => setSelectedLeague(league.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  selectedLeague === league.id
                    ? `${textStyle.activeBtnBg} shadow-lg`
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {league.name}
                {league.standby && (
                  <span className="text-[9px] uppercase tracking-wider font-bold bg-slate-950/60 text-slate-400 px-1.5 py-0.5 rounded-full">
                    stand-by
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {error && (
        <div className="max-w-5xl mx-auto mb-6 bg-rose-950/40 border border-rose-500/40 text-rose-200 rounded-2xl p-4 text-sm">
          <p className="font-bold mb-1">😾 Qualcosa si è inceppato:</p>
          <p className="text-rose-300/80">{error}</p>
        </div>
      )}

      {isStandbyLeague ? (
        <section className="max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-inner">
            🌿
          </div>
          <h3 className="text-lg font-bold text-slate-100">Coppa in Stand-by</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Stiamo ancora cercando un&apos;API gratuita che fornisca dati veri per questa competizione.
            {standbyNote ? ` ${standbyNote}` : ''}
          </p>
          <p className="text-[11px] text-slate-500">
            Intanto goditi i campionati nazionali, dove i numeri sono tutti veri e controllati! ⚽
          </p>
        </section>
      ) : (
        <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              Caricamento dati analitici in corso...
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              Nessuna partita corrisponde al nome cercato.
            </div>
          ) : (
            filteredMatches.map((match) => {
              const rating = calculateBuddyRating(match.homeTeam, match.awayTeam, match.analytics);
              const prognosis = getBookiePrognosis(match.homeTeam, match.awayTeam, match.analytics);
              return (
                <div
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 cursor-pointer transition-all hover:scale-[1.01] relative overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-4 text-xs text-slate-400">
                    <span>
                      {new Date(match.date).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {match.status === 'SCHEDULED' && (
                        <span className="text-slate-500 ml-1 font-mono">
                          {new Date(match.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`bg-slate-950 ${textStyle.primaryText} border ${textStyle.borderPrimary} px-2 py-0.5 rounded text-[11px] font-mono font-bold`}>
                        Rating: {rating.score}/100
                      </span>
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-slate-200">
                        Segno {prognosis.sign.pick}
                      </span>
                      <span className="bg-slate-800 px-2.5 py-0.5 rounded text-slate-300 font-mono">
                        {typeof match.matchday === 'number' ? `G${match.matchday}` : match.matchday}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 my-2">
                    <div className="flex flex-col items-center flex-1 text-center">
                      <TeamBadge logo={match.homeTeam.logo} name={match.homeTeam.name} />
                      <span className="font-bold text-sm text-slate-200">{match.homeTeam.name}</span>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">🏠 casa</span>
                      {match.homeTeam.position && match.homeTeam.position !== 'N/D' && (
                        <div className="text-[11px] text-slate-400 mt-1 font-mono leading-tight">
                          <p className={`${textStyle.primaryText} font-bold`}>{match.homeTeam.position}° in classifica</p>
                          <p className="text-slate-500 text-[10px]">GF: {match.homeTeam.goalsFor} | GS: {match.homeTeam.goalsAgainst}</p>
                        </div>
                      )}
                    </div>

                    <div className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                      {match.status === 'FINISHED' && match.score?.home !== undefined ? (
                        <span className={`${textStyle.primaryText} font-mono text-base`}>{match.score.home} - {match.score.away}</span>
                      ) : (
                        'VS'
                      )}
                    </div>

                    <div className="flex flex-col items-center flex-1 text-center">
                      <TeamBadge logo={match.awayTeam.logo} name={match.awayTeam.name} />
                      <span className="font-bold text-sm text-slate-200">{match.awayTeam.name}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">✈️ trasferta</span>
                      {match.awayTeam.position && match.awayTeam.position !== 'N/D' && (
                        <div className="text-[11px] text-slate-400 mt-1 font-mono leading-tight">
                          <p className={`${textStyle.primaryText} font-bold`}>{match.awayTeam.position}° in classifica</p>
                          <p className="text-slate-500 text-[10px]">GF: {match.awayTeam.goalsFor} | GS: {match.awayTeam.goalsAgainst}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex gap-2 justify-between items-center text-xs text-slate-400">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>Stato: {match.status === 'FINISHED' ? 'Terminata' : 'In programma'}</span>
                      {match.analytics?.trapScore?.level === 'danger' && (
                        <span className="text-rose-400 font-bold text-[11px]" title={match.analytics.trapScore.message}>
                          🚨 Trappola
                        </span>
                      )}
                      {match.analytics?.trapScore?.level === 'warning' && (
                        <span className="text-amber-400 font-bold text-[11px]" title={match.analytics.trapScore.message}>
                          ⚠️ Occhio
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">{match.analytics?.homeTrend}</span>
                      <span className={`${textStyle.primaryText} font-medium whitespace-nowrap`}>Analizza dossier ➔</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      )}

      {/* Modal Dossier */}
      {selectedMatch && (
        <DossierModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          textStyle={textStyle}
          league={selectedLeague}
        />
      )}

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </main>
  );
}