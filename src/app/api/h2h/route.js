import { NextResponse } from 'next/server';

const FOOTBALL_DATA_KEY = process.env.FOOTBALL_DATA_KEY || '';

async function fetchFootballData(path) {
  const res = await fetch(`https://api.football-data.org/v4${path}`, {
    headers: { 'X-Auth-Token': FOOTBALL_DATA_KEY },
    next: { revalidate: 43200 }, // 12 ore
  });

  if (!res.ok) {
    throw new Error(`Football-Data API error (${res.status}): ${await res.text()}`);
  }

  return res.json();
}

// Scontri diretti nelle stagioni passate: carica i match finiti di entrambe
// le squadre per le ultime 3 stagioni e filtra quelli reciproci.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const homeId = parseInt(searchParams.get('homeId'), 10);
  const awayId = parseInt(searchParams.get('awayId'), 10);
  const currentSeason = parseInt(searchParams.get('season'), 10) || 2026;

  if (!homeId || !awayId) {
    return NextResponse.json({ success: false, error: 'Parametri homeId e awayId obbligatori.' }, { status: 400 });
  }

  try {
    const seasons = [currentSeason - 1, currentSeason - 2, currentSeason - 3];
    const h2h = [];

    // Carichiamo le stagioni in sequenza (caché 12h): prima stag più recente
    for (const season of seasons) {
      const [homeData, awayData] = await Promise.all([
        fetchFootballData(`/teams/${homeId}/matches?season=${season}&status=FINISHED`),
        fetchFootballData(`/teams/${awayId}/matches?season=${season}&status=FINISHED`),
      ]);

      const homeMatches = homeData.matches || [];
      const awayMatches = awayData.matches || [];

      // Una partita è reciproca se appare in entrambe le liste (stesso id)
      const awayMatchMap = new Map(awayMatches.map((m) => [m.id, m]));
      const mutual = homeMatches.filter((m) => awayMatchMap.has(m.id));

      for (const m of mutual) {
        const isHomeTeamHosting = m.homeTeam.id === homeId;
        const homeGoals = isHomeTeamHosting ? m.score?.fullTime?.home : m.score?.fullTime?.away;
        const awayGoals = isHomeTeamHosting ? m.score?.fullTime?.away : m.score?.fullTime?.home;

        if (homeGoals === undefined || awayGoals === undefined) continue;

        const outcome = homeGoals > awayGoals ? 'V' : homeGoals === awayGoals ? 'P' : 'S';
        h2h.push({
          season,
          date: m.utcDate,
          homeTeamName: isHomeTeamHosting ? m.homeTeam.name : m.awayTeam.name,
          awayTeamName: isHomeTeamHosting ? m.awayTeam.name : m.homeTeam.name,
          homeGoals,
          awayGoals,
          outcome,
          icon: outcome === 'V' ? '🟩' : outcome === 'P' ? '🟨' : '🟥',
          competition: m.competition?.name || 'Campionato',
          homeHosted: isHomeTeamHosting,
        });
      }
    }

    // Più recenti prima
    h2h.sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json({ success: true, h2h });
  } catch (error) {
    console.error('Route /api/h2h error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}