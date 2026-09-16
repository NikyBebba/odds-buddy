'use client';

import { useState } from 'react';
import TeamBadge from '@/components/TeamBadge';
import TabAura from '@/components/dossier/TabAura';
import TabGeneral from '@/components/dossier/TabGeneral';
import TabPrognosis from '@/components/dossier/TabPrognosis';
import TabHistory from '@/components/dossier/TabHistory';
import TabExtra from '@/components/dossier/TabExtra';
import { calculateBuddyRating } from '@/lib/analytics';

export default function DossierModal({ match, onClose, textStyle, league }) {
  const { activeBtnBg, primaryText, borderPrimary, primaryBg } = textStyle;

  const [activeTab, setActiveTab] = useState('aura');

  // Dati aggiuntivi caricati on-demand nei tab (H2H passate, quote reali)
  const [h2hPast, setH2hPast] = useState(null);
  const [h2hPastLoading, setH2hPastLoading] = useState(false);
  const [h2hPastError, setH2hPastError] = useState(null);
  const [oddsData, setOddsData] = useState(null);
  const [oddsLoading, setOddsLoading] = useState(false);
  const [oddsError, setOddsError] = useState(null);

  // Minigame "Indovina il Risultato"
  const [guessHome, setGuessHome] = useState(0);
  const [guessAway, setGuessAway] = useState(0);
  const [guessSubmitted, setGuessSubmitted] = useState(false);
  const [guessGhost, setGuessGhost] = useState(null);

  // Infermeria + dati extra (bigballsdata) + venue (thesportsdb)
  const [teamExtras, setTeamExtras] = useState(null);
  const [teamExtrasLoading, setTeamExtrasLoading] = useState(false);
  const [teamExtrasError, setTeamExtrasError] = useState(null);
  const [venues, setVenues] = useState({ home: null, away: null });

  const loadTeamExtras = () => {
    if (!match || teamExtras !== null || teamExtrasLoading) return;
    setTeamExtrasLoading(true);
    const params = new URLSearchParams({
      league,
      home: match.homeTeam.name,
      away: match.awayTeam.name,
    });
    Promise.all([
      fetch(`/api/team-extra?${params}`).then((res) => res.json()),
      fetch(`/api/venue?team=${encodeURIComponent(match.homeTeam.name)}`).then((res) => res.json()),
      fetch(`/api/venue?team=${encodeURIComponent(match.awayTeam.name)}`).then((res) => res.json()),
    ])
      .then(([extraData, homeVenue, awayVenue]) => {
        if (extraData.success) {
          setTeamExtras(extraData.teamExtras);
        } else {
          setTeamExtrasError(extraData.error || 'Nessun dato extra disponibile.');
        }
        setVenues({
          home: homeVenue?.success ? homeVenue.venue : null,
          away: awayVenue?.success ? awayVenue.venue : null,
        });
      })
      .catch(() => {
        setTeamExtrasError('Impossibile contattare la fonte dati extra.');
      })
      .finally(() => setTeamExtrasLoading(false));
  };

  const loadH2hPast = () => {
    if (!match || h2hPast !== null || h2hPastLoading) return;
    setH2hPastLoading(true);
    fetch(
      `/api/h2h?homeId=${match.homeTeam.id}&awayId=${match.awayTeam.id}&season=${new Date().getFullYear()}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setH2hPast(data.h2h);
        } else {
          setH2hPast([]);
          setH2hPastError(data.error || 'Errore sconosciuto.');
        }
      })
      .catch(() => {
        setH2hPast([]);
        setH2hPastError('Impossibile contattare il server per gli scontri diretti.');
      })
      .finally(() => setH2hPastLoading(false));
  };

  const loadOdds = () => {
    if (!match || oddsData !== null || oddsLoading) return;
    setOddsLoading(true);
    const params = new URLSearchParams({
      matchId: String(match.id),
      homeId: String(match.homeTeam.id),
      awayId: String(match.awayTeam.id),
      homeName: match.homeTeam.name,
      awayName: match.awayTeam.name,
    });
    fetch(`/api/match-bets?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setOddsData(data);
        if (!data.success) setOddsError(data.error || 'Errore sconosciuto.');
        else if (!data.available) setOddsError(data.error || 'Quote non ancora pubblicate.');
      })
      .catch(() => {
        setOddsData({ success: false, available: false });
        setOddsError('Impossibile contattare il server delle quote.');
      })
      .finally(() => setOddsLoading(false));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 text-lg">
          ✕
        </button>

        <div className="flex justify-between items-center mb-4 pr-6">
          <h3 className={`text-xl font-bold ${primaryText}`}>Dossier Analitico Match</h3>
          <span className={`bg-slate-950 ${primaryText} border ${borderPrimary} px-3 py-1 rounded-full text-xs font-mono font-bold`}>
            Buddy Rating: {calculateBuddyRating(match.homeTeam, match.awayTeam, match.analytics).score}/100
          </span>
        </div>

        {/* Testata Squadre */}
        <div className="flex justify-around items-center mb-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-center flex-1">
            <TeamBadge logo={match.homeTeam.logo} name={match.homeTeam.name} size="lg" />
            <p className="font-bold text-base">{match.homeTeam.name}</p>
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">🏠 casa</span>
            <p className={`text-xs ${primaryText} font-mono mt-0.5`}>
              {match.homeTeam.position && match.homeTeam.position !== 'N/D' ? `${match.homeTeam.position}° in classifica` : ''}
            </p>
          </div>

          <div className="text-slate-600 font-extrabold px-4 text-xl">VS</div>

          <div className="text-center flex-1">
            <TeamBadge logo={match.awayTeam.logo} name={match.awayTeam.name} size="lg" />
            <p className="font-bold text-base">{match.awayTeam.name}</p>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">✈️ trasferta</span>
            <p className={`text-xs ${primaryText} font-mono mt-0.5`}>
              {match.awayTeam.position && match.awayTeam.position !== 'N/D' ? `${match.awayTeam.position}° in classifica` : ''}
            </p>
          </div>
        </div>

        {/* Navigazione tra Tab */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-2 justify-center">
          <button
            onClick={() => setActiveTab('aura')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'aura'
                ? `${activeBtnBg} font-bold shadow-md`
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            ✨ Gara di Aura
          </button>
          <button
            onClick={() => {
              setActiveTab('general');
              loadTeamExtras();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'general'
                ? `${activeBtnBg} font-bold shadow-md`
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            📊 Quadro
          </button>
          <button
            onClick={() => {
              setActiveTab('prognosis');
              loadOdds();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'prognosis'
                ? `${activeBtnBg} font-bold shadow-md`
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            🎯 Pronostico
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              loadH2hPast();
            }}
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

        {/* TAB 1: Gara di Aura */}
        {activeTab === 'aura' && <TabAura match={match} textStyle={textStyle} />}

        {/* TAB 2: Quadro Generale */}
        {activeTab === 'general' && (
          <TabGeneral
            match={match}
            textStyle={textStyle}
            teamExtras={teamExtras}
            teamExtrasLoading={teamExtrasLoading}
            teamExtrasError={teamExtrasError}
            venues={venues}
          />
        )}

        {/* TAB 5: Pronostico del Buddy */}
        {activeTab === 'prognosis' && (
          <TabPrognosis
            match={match}
            textStyle={textStyle}
            oddsData={oddsData}
            oddsLoading={oddsLoading}
            oddsError={oddsError}
            guessHome={guessHome}
            setGuessHome={setGuessHome}
            guessAway={guessAway}
            setGuessAway={setGuessAway}
            guessSubmitted={guessSubmitted}
            setGuessSubmitted={setGuessSubmitted}
            guessGhost={guessGhost}
            setGuessGhost={setGuessGhost}
          />
        )}

        {/* TAB 3: Ultime Partite & Scontri Diretti */}
        {activeTab === 'history' && (
          <TabHistory match={match} textStyle={textStyle} h2hPast={h2hPast} h2hPastLoading={h2hPastLoading} h2hPastError={h2hPastError} />
        )}

        {/* TAB 4: Extra & Food */}
        {activeTab === 'extra' && <TabExtra match={match} textStyle={textStyle} />}

        <button onClick={onClose} className={`w-full mt-6 ${primaryBg} text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg`}>
          Chiudi Dossier
        </button>
      </div>
    </div>
  );
}