import { NextResponse } from 'next/server';

const FOOTBALL_DATA_LEAGUES = {
  serieA: { code: 'SA', kind: 'LEAGUE' },
  premierLeague: { code: 'PL', kind: 'LEAGUE' },
  laLiga: { code: 'PD', kind: 'LEAGUE' },
  championsLeague: { code: 'CL', kind: 'CUP' },
  bundesliga: { code: 'BL1', kind: 'LEAGUE' },
  ligue1: { code: 'FL1', kind: 'LEAGUE' },
};

const STANDBY_LEAGUES = {
  europaLeague: 'UEFA Europa League',
  conferenceLeague: 'UEFA Conference League',
};

async function fetchFootballData(path) {
  const res = await fetch(`https://api.football-data.org/v4${path}`, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_KEY || '' },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Football-Data API error (${res.status}): ${await res.text()}`);
  }

  return res.json();
}

function buildTeamStatsMap(table) {
  const map = {};
  table.forEach((row) => {
    map[row.team.id] = {
      id: row.team.id,
      name: row.team.name,
      position: row.position,
      points: row.points,
      playedGames: row.playedGames,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      homeGoalsFor: 0,
      homeGoalsAgainst: 0,
      homeMatches: 0,
      homeWins: 0,
      homeDraws: 0,
      homeLosses: 0,
      homeScoredIn: 0,
      homeOver25: 0,
      awayGoalsFor: 0,
      awayGoalsAgainst: 0,
      awayMatches: 0,
      awayWins: 0,
      awayDraws: 0,
      awayLosses: 0,
      awayScoredIn: 0,
      awayOver25: 0,
      cleanSheets: 0,
      recentMatches: [],
    };
  });
  return map;
}

function accumulateTeamStats(map, m) {
  const homeId = m.homeTeam.id;
  const awayId = m.awayTeam.id;
  const homeScore = m.score?.fullTime?.home;
  const awayScore = m.score?.fullTime?.away;

  if (homeScore === undefined || awayScore === undefined) return;

  // Stats Casa
  const home = map[homeId];
  if (home) {
    home.homeGoalsFor += homeScore;
    home.homeGoalsAgainst += awayScore;
    home.homeMatches += 1;
    if (awayScore === 0) home.cleanSheets += 1;
    if (homeScore > 0) home.homeScoredIn += 1;
    if (homeScore + awayScore >= 3) home.homeOver25 += 1;

    const outcome = homeScore > awayScore ? 'V' : homeScore === awayScore ? 'P' : 'S';
    if (outcome === 'V') home.homeWins += 1;
    else if (outcome === 'P') home.homeDraws += 1;
    else home.homeLosses += 1;

    home.recentMatches.push({
      opponent: m.awayTeam.name,
      score: `${homeScore}-${awayScore}`,
      outcome,
      icon: outcome === 'V' ? '🟩' : outcome === 'P' ? '🟨' : '🟥',
    });
    if (home.recentMatches.length > 14) home.recentMatches.shift();
  }

  // Stats Trasferta
  const away = map[awayId];
  if (away) {
    away.awayGoalsFor += awayScore;
    away.awayGoalsAgainst += homeScore;
    away.awayMatches += 1;
    if (homeScore === 0) away.cleanSheets += 1;
    if (awayScore > 0) away.awayScoredIn += 1;
    if (homeScore + awayScore >= 3) away.awayOver25 += 1;

    const outcome = awayScore > homeScore ? 'V' : homeScore === awayScore ? 'P' : 'S';
    if (outcome === 'V') away.awayWins += 1;
    else if (outcome === 'P') away.awayDraws += 1;
    else away.awayLosses += 1;

    away.recentMatches.push({
      opponent: m.homeTeam.name,
      score: `${awayScore}-${homeScore}`,
      outcome,
      icon: outcome === 'V' ? '🟩' : outcome === 'P' ? '🟨' : '🟥',
    });
    if (away.recentMatches.length > 14) away.recentMatches.shift();
  }
}

// Media gol attesa per la singola partita, pesata con rendimento casa/trasferta
// e "smussata" verso la media del campionato finché i campioni sono piccoli.
function expectedGoals(scoringTeam, concedingTeam, isHome, leagueAvg) {
  const gf = isHome ? scoringTeam.homeGoalsFor : scoringTeam.awayGoalsFor;
  const gfGames = isHome ? scoringTeam.homeMatches : scoringTeam.awayMatches;
  const ga = isHome ? concedingTeam.homeGoalsAgainst : concedingTeam.awayGoalsAgainst;
  const gaGames = isHome ? concedingTeam.homeMatches : concedingTeam.awayMatches;

  const scoreRate = gfGames ? gf / gfGames : null;
  const concedeRate = gaGames ? ga / gaGames : null;
  const sampleSize = Math.max(gfGames, gaGames);
  const weight = Math.min(1, sampleSize / 6);

  if (scoreRate !== null && concedeRate !== null) {
    const sampleExp = (scoreRate + concedeRate) / 2;
    return weight * sampleExp + (1 - weight) * leagueAvg;
  }
  if (scoreRate !== null) return weight * scoreRate + (1 - weight) * leagueAvg;
  if (concedeRate !== null) return weight * concedeRate + (1 - weight) * leagueAvg;
  return leagueAvg;
}

// Per le coppe (gruppi/champions) usiamo solo la tabella della fase a gironi:
// niente preliminari, niente medie gonfiate.
function expectedGoalsCup(homeStats, awayStats, leagueAvg) {
  const homeGames = Math.max(1, homeStats.playedGames);
  const awayGames = Math.max(1, awayStats.playedGames);
  const homeScoreRate = homeStats.goalsFor / homeGames;
  const homeConcedeRate = homeStats.goalsAgainst / homeGames;
  const awayScoreRate = awayStats.goalsFor / awayGames;
  const awayConcedeRate = awayStats.goalsAgainst / awayGames;

  const homeExpect = (homeScoreRate + awayConcedeRate) / 2;
  const awayExpect = (awayScoreRate + homeConcedeRate) / 2;

  const weight = Math.min(1, Math.max(homeStats.playedGames, awayStats.playedGames) / 6);
  return {
    homeExpect: weight * homeExpect + (1 - weight) * leagueAvg,
    awayExpect: weight * awayExpect + (1 - weight) * leagueAvg,
  };
}

function buildTrapScore(homeStats, awayStats, homeHistory, awayHistory) {
  const homePos = parseInt(homeStats.position) || 10;
  const awayPos = parseInt(awayStats.position) || 10;
  const posDiff = Math.abs(homePos - awayPos);

  if (posDiff <= 4) {
    return { level: 'none', message: 'Partita in equilibrio: le due squadre sono vicine in classifica.' };
  }

  const favoriteIsHome = homePos < awayPos;
  const favName = (favoriteIsHome ? homeStats.name : awayStats.name) || 'la favorita';
  const favoriteWins = (favoriteIsHome ? homeHistory : awayHistory).filter((m) => m.outcome === 'V').length;
  const favoriteAway = !favoriteIsHome;
  const favoriteInCrisis = favoriteWins <= 1;

  if (favoriteAway && favoriteInCrisis) {
    return {
      level: 'danger',
      message: `🔥 TRAPPOLA! ${favName} gioca in trasferta e sta rallentando: scenario perfetto per la ciucciata al Campo di Longo. Occhi aperti, che l'aura qui si perde in fretta!`,
    };
  }

  if (favoriteAway) {
    return {
      level: 'warning',
      message: `⚠️ Scontro ad alto divario, ma ${favName} gioca fuori casa: il fattore campo potrebbe fare il furbo. L'aura da trasferta è roba da professionisti.`,
    };
  }

  if (favoriteInCrisis) {
    return {
      level: 'warning',
      message: `⚠️ ${favName} arriva in calo di forma: l'aura farming è fermo. Non fidarti solo della classifica, che il pallone è perfido.`,
    };
  }

  return {
    level: 'none',
    message: 'Divario in classifica netto e forma a posto: tutto sotto controllo, almeno sulla carta.',
  };
}

function buildH2H(finishedMatches, homeId, awayId) {
  return finishedMatches
    .filter(
      (m) =>
        (m.homeTeam.id === homeId && m.awayTeam.id === awayId) ||
        (m.homeTeam.id === awayId && m.awayTeam.id === homeId)
    )
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
    .slice(-6)
    .map((m) => ({ ...m, h2hHomeIsCurrent: m.homeTeam.id === homeId }));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const leagueKey = searchParams.get('league') || 'serieA';

  if (STANDBY_LEAGUES[leagueKey]) {
    return NextResponse.json({
      success: true,
      standby: true,
      matches: [],
      note: `La ${STANDBY_LEAGUES[leagueKey]} è in stand-by: l'API gratuita non fornisce ancora dati reali per questa competizione.`,
    });
  }

  try {
    const leagueInfo = FOOTBALL_DATA_LEAGUES[leagueKey] || { code: 'SA', kind: 'LEAGUE' };
    const leagueCode = leagueInfo.code;

    // 1. Classifica
    const standingsData = await fetchFootballData(`/competitions/${leagueCode}/standings`);
    const table = standingsData.standings?.[0]?.table || [];
    const teamStatsMap = buildTeamStatsMap(table);

    // Media gol media del campionato per smussare i campioni piccoli
    const totalGF = table.reduce((s, r) => s + r.goalsFor, 0);
    const totalGames = Math.max(1, table.reduce((s, r) => s + r.playedGames, 0));
    const leagueAvg = totalGF / totalGames; // gol segnati per partita da una singola squadra

    // 2. Partite giocate (forma, casa/trasferta, clean sheet)
    const finishedData = await fetchFootballData(`/competitions/${leagueCode}/matches?status=FINISHED`);
    const finishedMatches = finishedData.matches || [];
    finishedMatches.forEach((m) => accumulateTeamStats(teamStatsMap, m));

    // 3. Prossime partite
    const scheduledData = await fetchFootballData(`/competitions/${leagueCode}/matches?status=SCHEDULED`);
    let matchesList = scheduledData.matches || [];

    if (matchesList.length === 0) {
      matchesList = finishedMatches.slice(-10);
    } else {
      matchesList = matchesList.slice(0, 10);
    }

    const matches = matchesList.map((match) => {
      const homeId = match.homeTeam.id;
      const awayId = match.awayTeam.id;
      const homeStats = teamStatsMap[homeId] || {
        position: '-', points: 0, playedGames: 1, goalsFor: 0, goalsAgainst: 0,
        homeGoalsFor: 0, homeGoalsAgainst: 0, homeMatches: 1,
        homeWins: 0, homeDraws: 0, homeLosses: 0, homeScoredIn: 0, homeOver25: 0,
        awayGoalsFor: 0, awayGoalsAgainst: 0, awayMatches: 1,
        awayWins: 0, awayDraws: 0, awayLosses: 0, awayScoredIn: 0, awayOver25: 0,
        cleanSheets: 0, recentMatches: [],
      };
      const awayStats = teamStatsMap[awayId] || {
        position: '-', points: 0, playedGames: 1, goalsFor: 0, goalsAgainst: 0,
        homeGoalsFor: 0, homeGoalsAgainst: 0, homeMatches: 1,
        homeWins: 0, homeDraws: 0, homeLosses: 0, homeScoredIn: 0, homeOver25: 0,
        awayGoalsFor: 0, awayGoalsAgainst: 0, awayMatches: 1,
        awayWins: 0, awayDraws: 0, awayLosses: 0, awayScoredIn: 0, awayOver25: 0,
        cleanSheets: 0, recentMatches: [],
      };

      const homeHistory = homeStats.recentMatches.slice(-4).reverse();
      const awayHistory = awayStats.recentMatches.slice(-4).reverse();

      const homeForm = homeHistory.map((m) => m.icon);
      const awayForm = awayHistory.map((m) => m.icon);

      let homeExpect;
      let awayExpect;
      if (leagueInfo.kind === 'CUP') {
        const cup = expectedGoalsCup(homeStats, awayStats, leagueAvg);
        homeExpect = cup.homeExpect;
        awayExpect = cup.awayExpect;
      } else {
        homeExpect = expectedGoals(homeStats, awayStats, true, leagueAvg);
        awayExpect = expectedGoals(awayStats, homeStats, false, leagueAvg);
      }
      // Cap: gol attesi coerenti col calcio reale (mai oltre il 5.5 complessivo)
      const totalRaw = homeExpect + awayExpect;
      if (totalRaw > 5.5) {
        const scale = 5.5 / totalRaw;
        homeExpect *= scale;
        awayExpect *= scale;
      }
      const totalAvgGoals = (homeExpect + awayExpect).toFixed(1);

      const homeWinRate = homeHistory.filter((m) => m.outcome === 'V').length;
      const awayWinRate = awayHistory.filter((m) => m.outcome === 'V').length;

      const homeTrend = homeWinRate >= 3 ? 'In Ascesa 📈' : homeWinRate <= 1 ? 'In Difficoltà 📉' : 'Stabile ⚖️';
      const awayTrend = awayWinRate >= 3 ? 'In Ascesa 📈' : awayWinRate <= 1 ? 'In Difficoltà 📉' : 'Stabile ⚖️';

      const trapScore = buildTrapScore(homeStats, awayStats, homeHistory, awayHistory);

      const h2hRaw = buildH2H(finishedMatches, homeId, awayId);
      const h2h = h2hRaw.map((m) => {
        const currentHomeIsHost = m.h2hHomeIsCurrent;
        const homeGoals = currentHomeIsHost ? m.score?.fullTime?.home : m.score?.fullTime?.away;
        const awayGoals = currentHomeIsHost ? m.score?.fullTime?.away : m.score?.fullTime?.home;
        const homeTeamName = currentHomeIsHost ? match.homeTeam.name : match.awayTeam.name;
        const awayTeamName = currentHomeIsHost ? match.awayTeam.name : match.homeTeam.name;
        const outcome = homeGoals > awayGoals ? 'V' : homeGoals === awayGoals ? 'P' : 'S';
        const icon = outcome === 'V' ? '🟩' : outcome === 'P' ? '🟨' : '🟥';
        return {
          date: m.utcDate,
          homeTeamName,
          awayTeamName,
          homeGoals,
          awayGoals,
          outcome,
          icon,
        };
      });

      return {
        id: match.id,
        date: match.utcDate,
        status: match.status,
        matchday: match.matchday,
        homeTeam: {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          logo: match.homeTeam.crest || '',
          position: homeStats.position,
          points: homeStats.points,
          goalsFor: homeStats.goalsFor,
          goalsAgainst: homeStats.goalsAgainst,
          goalDifference: homeStats.goalDifference,
          homeGoalsFor: homeStats.homeGoalsFor,
          homeGoalsAgainst: homeStats.homeGoalsAgainst,
          homeMatches: homeStats.homeMatches,
          homeWins: homeStats.homeWins,
          homeDraws: homeStats.homeDraws,
          homeLosses: homeStats.homeLosses,
          homeScoredIn: homeStats.homeScoredIn,
          homeOver25: homeStats.homeOver25,
          cleanSheets: homeStats.cleanSheets,
          playedGames: homeStats.playedGames,
          avgGoalsHome: homeStats.homeMatches ? (homeStats.homeGoalsFor / homeStats.homeMatches).toFixed(1) : '-',
        },
        awayTeam: {
          id: match.awayTeam.id,
          name: match.awayTeam.name,
          logo: match.awayTeam.crest || '',
          position: awayStats.position,
          points: awayStats.points,
          goalsFor: awayStats.goalsFor,
          goalsAgainst: awayStats.goalsAgainst,
          goalDifference: awayStats.goalDifference,
          awayGoalsFor: awayStats.awayGoalsFor,
          awayGoalsAgainst: awayStats.awayGoalsAgainst,
          awayMatches: awayStats.awayMatches,
          awayWins: awayStats.awayWins,
          awayDraws: awayStats.awayDraws,
          awayLosses: awayStats.awayLosses,
          awayScoredIn: awayStats.awayScoredIn,
          awayOver25: awayStats.awayOver25,
          cleanSheets: awayStats.cleanSheets,
          playedGames: awayStats.playedGames,
          avgGoalsAway: awayStats.awayMatches ? (awayStats.awayGoalsFor / awayStats.awayMatches).toFixed(1) : '-',
        },
        score: match.score?.fullTime,
        analytics: {
          homeForm,
          awayForm,
          homeHistory,
          awayHistory,
          h2h,
          avgGoals: totalAvgGoals,
          homeExpectedGoals: homeExpect.toFixed(1),
          awayExpectedGoals: awayExpect.toFixed(1),
          trapScore,
          homeTrend,
          awayTrend,
        },
      };
    });

    return NextResponse.json({ success: true, standby: false, matches });
  } catch (error) {
    console.error('Route /api/matches error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}