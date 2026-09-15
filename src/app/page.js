'use client';

import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import HelpModal from '@/components/HelpModal';
import VibesCheck from '@/components/VibesCheck';
import ExtraFun from '@/components/ExtraFun';
import AlertSystem from '@/components/AlertSystem';
import MatchVibesHub from '@/components/MatchVibesHub';
import { calculateBuddyRating, getH2HHistory, generateMatchSummary, getSimonettaMeter } from '@/lib/analytics';

const DOMESTIC_LEAGUES = [
  { id: 'serieA', name: '🇮🇹 Serie A' },
  { id: 'premierLeague', name: '🇬🇧 Premier League' },
  { id: 'laLiga', name: '🇪🇸 La Liga' },
  { id: 'bundesliga', name: '🇩🇪 Bundesliga' },
  { id: 'ligue1', name: '🇫🇷 Ligue 1' },
];

const EUROPEAN_LEAGUES = [
  { id: 'championsLeague', name: '🇪🇺 Champions League' },
  { id: 'europaLeague', name: '🇪🇺 Europa League' },
  { id: 'conferenceLeague', name: '🇪🇺 Conference League' },
];

function TeamBadge({ logo, name }) {
  const [imgError, setImgError] = useState(false);

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={name}
        onError={() => setImgError(true)}
        className="w-12 h-12 object-contain mb-2"
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg mb-2 shadow-inner">
      ⚽
    </div>
  );
}

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);
  const [theme, setTheme] = useState('sannicola');
  const [selectedLeague, setSelectedLeague] = useState('serieA');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('simonetta');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    async function fetchMatches() {
      setLoading(true);
      try {
        const res = await fetch(`/api/matches?league=${selectedLeague}`);
        const data = await res.json();
        if (data.success) {
          setMatches(data.matches);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error(err);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [selectedLeague]);

  const filteredMatches = matches.filter((match) => {
    const homeName = match.homeTeam.name.toLowerCase();
    const awayName = match.awayTeam.name.toLowerCase();
    const query = searchQuery.toLowerCase();
    return homeName.includes(query) || awayName.includes(query);
  });

  // Gestione dinamica dei 3 temi (Sannicola / Galatone / Roma)
  const isGalatone = theme === 'galatone';
  const isRoma = theme === 'roma';

  const primaryText = isRoma ? 'text-amber-400' : isGalatone ? 'text-purple-400' : 'text-emerald-400';
  const primaryBg = isRoma ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : isGalatone ? 'bg-purple-600 hover:bg-purple-500 text-slate-100' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950';
  const activeBtnBg = isRoma ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' : isGalatone ? 'bg-purple-600 text-slate-950 shadow-purple-500/20' : 'bg-emerald-500 text-slate-950 shadow-emerald-500/20';
  const borderPrimary = isRoma ? 'border-amber-500/40' : isGalatone ? 'border-purple-500/40' : 'border-emerald-500/40';

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
          className={`absolute right-0 top-0 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs ${primaryText} font-medium flex items-center gap-1 transition-all`}
        >
          💡 Guida Dati
        </button>

        <h1 className={`text-4xl font-extrabold tracking-tight ${primaryText} mb-3`}>
          Odds Buddy ⚽
        </h1>
        <div className="text-slate-400 text-sm md:text-base space-y-1">
          <p className="font-bold text-slate-100 text-xl md:text-2xl tracking-wide">
            Valeriona, <span className="text-xs font-mono text-slate-500">(accesso da {theme.toUpperCase()})</span>
          </p>
          <p className="text-slate-200 font-medium">Ecco il tuo assistente smart per analizzare le partitazze!</p>
          <p className="text-xs md:text-sm text-slate-400">Nessuna trappola, nessuna ciucciata... <span className={`${primaryText} font-bold`}>SÌ!!!!</span> 🚀</p>
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
                    ? `${activeBtnBg} shadow-lg`
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
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  selectedLeague === league.id
                    ? `${activeBtnBg} shadow-lg`
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {league.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

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
            const rating = calculateBuddyRating(match.homeTeam, match.awayTeam);
            return (
              <div
                key={match.id}
                onClick={() => {
                  setSelectedMatch(match);
                  setActiveTab('simonetta');
                }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 cursor-pointer transition-all hover:scale-[1.01] relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-4 text-xs text-slate-400">
                  <span>
                    {new Date(match.date).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`bg-slate-950 ${primaryText} border ${borderPrimary} px-2 py-0.5 rounded text-[11px] font-mono font-bold`}>
                      Rating: {rating}/100
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
                    {match.homeTeam.position && match.homeTeam.position !== 'N/D' && (
                      <div className="text-[11px] text-slate-400 mt-1 font-mono leading-tight">
                        <p className={`${primaryText} font-bold`}>{match.homeTeam.position}° in classifica</p>
                        <p className="text-slate-500 text-[10px]">GF: {match.homeTeam.goalsFor} | GS: {match.homeTeam.goalsAgainst}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                    {match.status === 'FINISHED' && match.score?.home !== undefined ? (
                      <span className={`${primaryText} font-mono text-base`}>{match.score.home} - {match.score.away}</span>
                    ) : (
                      'VS'
                    )}
                  </div>

                  <div className="flex flex-col items-center flex-1 text-center">
                    <TeamBadge logo={match.awayTeam.logo} name={match.awayTeam.name} />
                    <span className="font-bold text-sm text-slate-200">{match.awayTeam.name}</span>
                    {match.awayTeam.position && match.awayTeam.position !== 'N/D' && (
                      <div className="text-[11px] text-slate-400 mt-1 font-mono leading-tight">
                        <p className={`${primaryText} font-bold`}>{match.awayTeam.position}° in classifica</p>
                        <p className="text-slate-500 text-[10px]">GF: {match.awayTeam.goalsFor} | GS: {match.awayTeam.goalsAgainst}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-400">
                  <span>Stato: {match.status === 'FINISHED' ? 'Terminata' : 'Programmata'}</span>
                  <span className={`${primaryText} font-medium`}>Analizza dossier ➔</span>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Modal Dossier */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedMatch(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 text-lg"
            >
              ✕
            </button>

            <div className="flex justify-between items-center mb-4 pr-6">
              <h3 className={`text-xl font-bold ${primaryText}`}>Dossier Analitico Match</h3>
              <span className={`bg-slate-950 ${primaryText} border ${borderPrimary} px-3 py-1 rounded-full text-xs font-mono font-bold`}>
                Buddy Rating: {calculateBuddyRating(selectedMatch.homeTeam, selectedMatch.awayTeam)}/100
              </span>
            </div>

            {/* Testata Squadre */}
            <div className="flex justify-around items-center mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-center flex-1">
                <TeamBadge logo={selectedMatch.homeTeam.logo} name={selectedMatch.homeTeam.name} />
                <p className="font-bold text-base">{selectedMatch.homeTeam.name}</p>
                <p className={`text-xs ${primaryText} font-mono mt-0.5`}>
                  {selectedMatch.homeTeam.position && selectedMatch.homeTeam.position !== 'N/D' ? `${selectedMatch.homeTeam.position}° in classifica` : ''}
                </p>
              </div>

              <div className="text-slate-600 font-extrabold px-4 text-xl">VS</div>

              <div className="text-center flex-1">
                <TeamBadge logo={selectedMatch.awayTeam.logo} name={selectedMatch.awayTeam.name} />
                <p className="font-bold text-base">{selectedMatch.awayTeam.name}</p>
                <p className={`text-xs ${primaryText} font-mono mt-0.5`}>
                  {selectedMatch.awayTeam.position && selectedMatch.awayTeam.position !== 'N/D' ? `${selectedMatch.awayTeam.position}° in classifica` : ''}
                </p>
              </div>
            </div>

            {/* Navigazione tra Tab */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-2 justify-center">
              <button
                onClick={() => setActiveTab('simonetta')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'simonetta'
                    ? `${activeBtnBg} font-bold shadow-md`
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                ✨ Gara di Aura
              </button>
              <button
                onClick={() => setActiveTab('general')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'general'
                    ? `${activeBtnBg} font-bold shadow-md`
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                📊 Quadro
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'history'
                    ? `${activeBtnBg} font-bold shadow-md`
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                🕒 H2H & Ultime
              </button>
              <button
                onClick={() => setActiveTab('extra')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'extra'
                    ? `${activeBtnBg} font-bold shadow-md`
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                }`}
              >
                🪩 Extra & Food
              </button>
            </div>

            {/* TAB 1: Simonetta Meter */}
            {activeTab === 'simonetta' && (() => {
              const sm = getSimonettaMeter(selectedMatch.homeTeam, selectedMatch.awayTeam);
              return (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h4 className={`text-xs uppercase tracking-wider font-semibold ${primaryText} text-center`}>
                      🌾 Status Aura Reale
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center space-y-1">
                        <p className="text-slate-400">{selectedMatch.homeTeam.name}</p>
                        <p className="text-xs font-bold text-amber-400">{sm.homeAuraStatus}</p>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center space-y-1">
                        <p className="text-slate-400">{selectedMatch.awayTeam.name}</p>
                        <p className="text-xs font-bold text-amber-400">{sm.awayAuraStatus}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs gap-2">
                    <span className="text-slate-400 font-medium">Livello "Gasa" della sfida:</span>
                    <span className={`font-bold ${primaryText} font-mono text-xs md:text-sm text-center`}>{sm.gasaLevel}</span>
                  </div>

                  <div className={`bg-slate-950 p-4 rounded-xl border ${borderPrimary} space-y-2`}>
                    <h4 className={`text-xs uppercase tracking-wider font-bold ${primaryText}`}>
                      🗣️ Il Verdetto del Buddy:
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {sm.verdict}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* TAB 2: Quadro Generale */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <VibesCheck
                  homeTeam={selectedMatch.homeTeam}
                  awayTeam={selectedMatch.awayTeam}
                  avgGoals={selectedMatch.analytics?.avgGoals}
                />

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className={`text-xs uppercase tracking-wider font-semibold ${primaryText}`}>
                    📝 Quadro Neutrale di Odds Buddy
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {generateMatchSummary(selectedMatch.homeTeam, selectedMatch.awayTeam, selectedMatch.analytics?.avgGoals)}
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
                        🏠 {selectedMatch.homeTeam.name}
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Gol Segnati:</span>
                        <span className={`${primaryText} font-bold`}>{selectedMatch.homeTeam.homeGoalsFor || 0}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Gol Subiti:</span>
                        <span className="text-rose-400 font-bold">{selectedMatch.homeTeam.homeGoalsAgainst || 0}</span>
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg space-y-2 border border-slate-800">
                      <p className="font-bold text-slate-200 text-center border-b border-slate-800 pb-1">
                        ✈️ {selectedMatch.awayTeam.name}
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Gol Segnati:</span>
                        <span className={`${primaryText} font-bold`}>{selectedMatch.awayTeam.awayGoalsFor || 0}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-slate-400">Gol Subiti:</span>
                        <span className="text-rose-400 font-bold">{selectedMatch.awayTeam.awayGoalsAgainst || 0}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Ultime Partite & Scontri Diretti */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 text-center">
                    🕒 Risultati delle ultime 4 gare
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <p className="font-bold text-slate-300 text-center border-b border-slate-800 pb-1">
                        {selectedMatch.homeTeam.name}
                      </p>
                      {selectedMatch.analytics?.homeHistory?.length > 0 ? (
                        selectedMatch.analytics.homeHistory.map((m, idx) => (
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
                        {selectedMatch.awayTeam.name}
                      </p>
                      {selectedMatch.analytics?.awayHistory?.length > 0 ? (
                        selectedMatch.analytics.awayHistory.map((m, idx) => (
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

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3 text-center">
                    ⚔️ Precedenti Diretti (H2H)
                  </h4>
                  <div className="space-y-2 text-xs">
                    {getH2HHistory(selectedMatch.homeTeam.name, selectedMatch.awayTeam.name, selectedMatch.id).map((h2h, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded font-mono">
                        <span className="text-slate-500">{h2h.season}</span>
                        <span className="text-slate-300">{h2h.home}</span>
                        <span className={`${primaryText} font-bold`}>{h2h.score}</span>
                        <span className="text-slate-300">{h2h.away}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Extra & Food */}
            {activeTab === 'extra' && <MatchVibesHub />}

            <button
              onClick={() => setSelectedMatch(null)}
              className={`w-full mt-6 ${primaryBg} text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg`}
            >
              Chiudi Dossier
            </button>
          </div>
        </div>
      )}

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </main>
  );
}
