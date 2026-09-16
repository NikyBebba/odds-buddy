import { NextResponse } from 'next/server';
import { getJSON, setJSON } from '@/lib/kv';
import {
  resolveApiFootballId,
  getHeadToHead,
  getOddsForFixture,
  getPredictionsForFixture,
  extractAveragedOdds,
} from '@/lib/api-football';

// Cache persistente delle quote: 1 ora
const CACHE_TTL_S = 60 * 60;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('matchId');
  const homeId = parseInt(searchParams.get('homeId'), 10);
  const awayId = parseInt(searchParams.get('awayId'), 10);
  const homeName = searchParams.get('homeName') || '';
  const awayName = searchParams.get('awayName') || '';

  if (!homeId || !awayId) {
    return NextResponse.json({ success: false, error: 'Parametri homeId e awayId obbligatori.' }, { status: 400 });
  }

  if (matchId) {
    const cached = await getJSON(`odds:${matchId}`);
    if (cached) {
      return NextResponse.json(cached);
    }
  }

  try {
    // 1) Risolviamo gli id api-football dei due club
    const [apiHomeId, apiAwayId] = await Promise.all([
      resolveApiFootballId(homeId, homeName),
      resolveApiFootballId(awayId, awayName),
    ]);

    if (!apiHomeId || !apiAwayId) {
      return NextResponse.json({
        success: false,
        error: 'Impossibile trovare le squadre sul provider delle quote.',
      });
    }

    // 2) Scontri diretti (include la prossima gara) per trovare il fixture id
    const h2h = await getHeadToHead(apiHomeId, apiAwayId);
    const upcoming = h2h.find((f) => f.fixture?.status?.short === 'NS') || null;

    if (!upcoming) {
      return NextResponse.json({
        success: true,
        available: false,
        error: 'Nessuna prossima gara ancora schedulata tra queste due squadre.',
      });
    }

    const fixtureId = upcoming.fixture.id;
    const fixtureInfo = {
      id: fixtureId,
      date: upcoming.fixture.date,
      home: upcoming.teams?.home?.name,
      away: upcoming.teams?.away?.name,
    };

    // 3) Quote dei bookmaker e previsioni di mercato
    const [oddsResponse, predictionsResponse] = await Promise.all([
      getOddsForFixture(fixtureId),
      getPredictionsForFixture(fixtureId),
    ]);

    const averaged = extractAveragedOdds(oddsResponse);

    const prediction = predictionsResponse[0]?.predictions || null;
    const predictionInfo = prediction
      ? {
          winner: prediction.winner?.name || null,
          advice: prediction.advice || '',
          percent: prediction.percent || null,
        }
      : null;

    const result = {
      success: true,
      available: averaged.bookmakerCount > 0,
      fixture: fixtureInfo,
      odds: averaged,
      predictions: predictionInfo,
    };

    if (matchId) await setJSON(`odds:${matchId}`, result, CACHE_TTL_S);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Route /api/match-bets error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}