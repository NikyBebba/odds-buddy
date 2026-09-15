import { NextResponse } from 'next/server';

const FOOTBALL_DATA_LEAGUES = {
  serieA: 'SA',
  premierLeague: 'PL',
  laLiga: 'PD',
  championsLeague: 'CL',
  bundesliga: 'BL1',
  ligue1: 'FL1',
};

const OPEN_FOOTBALL_URLS = {
  europaLeague: 'https://raw.githubusercontent.com/openfootball/europe/master/2024-25/el.json',
  conferenceLeague: 'https://raw.githubusercontent.com/openfootball/europe/master/2024-25/ecl.json',
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const leagueKey = searchParams.get('league') || 'serieA';

  try {
    let matches = [];

    if (OPEN_FOOTBALL_URLS[leagueKey]) {
      const res = await fetch(OPEN_FOOTBALL_URLS[leagueKey], {
        next: { revalidate: 86400 },
      });

      if (res.ok) {
        const data = await res.json();
        const rawMatches = [];

        if (data.rounds) {
          data.rounds.forEach((round) => {
            if (round.matches) {
              round.matches.forEach((m) => {
                rawMatches.push({
                  id: `${m.team1}-${m.team2}-${m.date}`,
                  date: m.date ? `${m.date}T21:00:00Z` : new Date().toISOString(),
                  matchday: round.name || 'Fase a gironi',
                  status: m.score ? 'FINISHED' : 'SCHEDULED',
                  homeTeam: {
                    name: typeof m.team1 === 'object' ? m.team1.name : m.team1,
                    logo: '',
                    position: 'N/D',
                    goalsFor: '-',
                    goalsAgainst: '-',
                    homeGoalsFor: '-',
                    homeGoalsAgainst: '-',
                    cleanSheets: '-',
                  },
                  awayTeam: {
                    name: typeof m.team2 === 'object' ? m.team2.name : m.team2,
                    logo: '',
                    position: 'N/D',
                    goalsFor: '-',
                    goalsAgainst: '-',
                    awayGoalsFor: '-',
                    awayGoalsAgainst: '-',
                    cleanSheets: '-',
                  },
                  score: m.score ? { home: m.score.ft?.[0], away: m.score.ft?.[1] } : null,
                  analytics: {
                    homeForm: ['🟩', '🟩', '🟨', '🟩'],
                    awayForm: ['🟩', '🟨', '🟥', '🟩'],
                    homeHistory: [],
                    awayHistory: [],
                    avgGoals: '2.3',
                    trapScore: 'Rendimento nella norma',
                    homeTrend: 'In Ascesa 📈',
                    awayTrend: 'Stabile ⚖️',
                  },
                });
              });
            }
          });
        }
        matches = rawMatches.slice(-10);
      }
    } else {
      const leagueCode = FOOTBALL_DATA_LEAGUES[leagueKey] || 'SA';

      // 1. Classifica
      const standingsRes = await fetch(
        `https://api.football-data.org/v4/competitions/${leagueCode}/standings`,
        {
          headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_KEY || '' },
          next: { revalidate: 3600 },
        }
      );
      const standingsData = await standingsRes.json();
      
      const teamStatsMap = {};
      const table = standingsData.standings?.[0]?.table || [];
      
      table.forEach((row) => {
        teamStatsMap[row.team.id] = {
          position: row.position,
          points: row.points,
          playedGames: row.playedGames,
          goalsFor: row.goalsFor,
          goalsAgainst: row.goalsAgainst,
          goalDifference: row.goalDifference,
          homeGoalsFor: 0,
          homeGoalsAgainst: 0,
          homeMatches: 0,
          awayGoalsFor: 0,
          awayGoalsAgainst: 0,
          awayMatches: 0,
          cleanSheets: 0,
          recentMatches: [],
        };
      });

      // 2. Analisi Partite Giocate per Casa/Trasferta e Clean Sheet
      const finishedRes = await fetch(
        `https://api.football-data.org/v4/competitions/${leagueCode}/matches?status=FINISHED`,
        {
          headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_KEY || '' },
          next: { revalidate: 3600 },
        }
      );
      const finishedData = await finishedRes.json();
      const finishedMatches = finishedData.matches || [];

      finishedMatches.forEach((m) => {
        const homeId = m.homeTeam.id;
        const awayId = m.awayTeam.id;
        const homeScore = m.score?.fullTime?.home;
        const awayScore = m.score?.fullTime?.away;

        if (homeScore !== undefined && awayScore !== undefined) {
          // Stats Casa
          if (teamStatsMap[homeId]) {
            teamStatsMap[homeId].homeGoalsFor += homeScore;
            teamStatsMap[homeId].homeGoalsAgainst += awayScore;
            teamStatsMap[homeId].homeMatches += 1;
            if (awayScore === 0) teamStatsMap[homeId].cleanSheets += 1;

            const outcome = homeScore > awayScore ? 'V' : homeScore === awayScore ? 'P' : 'S';
            teamStatsMap[homeId].recentMatches.push({
              opponent: m.awayTeam.name,
              score: `${homeScore}-${awayScore}`,
              outcome,
              icon: outcome === 'V' ? '🟩' : outcome === 'P' ? '🟨' : '🟥',
            });
          }

          // Stats Trasferta
          if (teamStatsMap[awayId]) {
            teamStatsMap[awayId].awayGoalsFor += awayScore;
            teamStatsMap[awayId].awayGoalsAgainst += homeScore;
            teamStatsMap[awayId].awayMatches += 1;
            if (homeScore === 0) teamStatsMap[awayId].cleanSheets += 1;

            const outcome = awayScore > homeScore ? 'V' : homeScore === awayScore ? 'P' : 'S';
            teamStatsMap[awayId].recentMatches.push({
              opponent: m.homeTeam.name,
              score: `${awayScore}-${homeScore}`,
              outcome,
              icon: outcome === 'V' ? '🟩' : outcome === 'P' ? '🟨' : '🟥',
            });
          }
        }
      });

      // 3. Prossime Partite
      let matchesRes = await fetch(
        `https://api.football-data.org/v4/competitions/${leagueCode}/matches?status=SCHEDULED`,
        {
          headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_KEY || '' },
          next: { revalidate: 3600 },
        }
      );

      let data = await matchesRes.json();
      let matchesList = data.matches || [];

      if (matchesList.length === 0) {
        matchesList = finishedMatches.slice(-10);
      } else {
        matchesList = matchesList.slice(0, 10);
      }

      matches = matchesList.map((match) => {
        const homeStats = teamStatsMap[match.homeTeam.id] || { position: '-', playedGames: 1, goalsFor: 0, goalsAgainst: 0, homeGoalsFor: 0, homeGoalsAgainst: 0, homeMatches: 1, cleanSheets: 0, recentMatches: [] };
        const awayStats = teamStatsMap[match.awayTeam.id] || { position: '-', playedGames: 1, goalsFor: 0, goalsAgainst: 0, awayGoalsFor: 0, awayGoalsAgainst: 0, awayMatches: 1, cleanSheets: 0, recentMatches: [] };

        const homeHistory = homeStats.recentMatches.slice(-4).reverse();
        const awayHistory = awayStats.recentMatches.slice(-4).reverse();

        const homeForm = homeHistory.map((m) => m.icon);
        const awayForm = awayHistory.map((m) => m.icon);

        const homeGoalAvg = homeStats.playedGames ? (homeStats.goalsFor / homeStats.playedGames) : 1.2;
        const awayGoalAvg = awayStats.playedGames ? (awayStats.goalsFor / awayStats.playedGames) : 1.1;
        const totalAvgGoals = (homeGoalAvg + awayGoalAvg).toFixed(1);

        const homeWinRate = homeHistory.filter(m => m.outcome === 'V').length;
        const awayWinRate = awayHistory.filter(m => m.outcome === 'V').length;

        const homeTrend = homeWinRate >= 3 ? 'In Ascesa 📈' : homeWinRate <= 1 ? 'In Difficoltà 📉' : 'Stabile ⚖️';
        const awayTrend = awayWinRate >= 3 ? 'In Ascesa 📈' : awayWinRate <= 1 ? 'In Difficoltà 📉' : 'Stabile ⚖️';

        const posDiff = Math.abs((parseInt(homeStats.position) || 10) - (parseInt(awayStats.position) || 10));
        const trapAlert = posDiff > 8 ? '⚠️ Attenzione: Scontro ad alto divario' : 'Match Equilibrato';

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
            homeGoalsFor: homeStats.homeGoalsFor,
            homeGoalsAgainst: homeStats.homeGoalsAgainst,
            cleanSheets: homeStats.cleanSheets,
            playedGames: homeStats.playedGames,
          },
          awayTeam: {
            id: match.awayTeam.id,
            name: match.awayTeam.name,
            logo: match.awayTeam.crest || '',
            position: awayStats.position,
            points: awayStats.points,
            goalsFor: awayStats.goalsFor,
            goalsAgainst: awayStats.goalsAgainst,
            awayGoalsFor: awayStats.awayGoalsFor,
            awayGoalsAgainst: awayStats.awayGoalsAgainst,
            cleanSheets: awayStats.cleanSheets,
            playedGames: awayStats.playedGames,
          },
          score: match.score?.fullTime,
          analytics: {
            homeForm,
            awayForm,
            homeHistory,
            awayHistory,
            avgGoals: totalAvgGoals,
            trapScore: trapAlert,
            homeTrend,
            awayTrend,
          },
        };
      });
    }

    return NextResponse.json({ success: true, matches });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
