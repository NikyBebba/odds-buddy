import { getJSON, setJSON } from './kv.js';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY || '';
const BASE_URL = 'https://v3.football.api-sports.io';

// Mapping statico: football-data team ID → api-football team ID
// (compilato una tantum per la Serie A; le altre squadre vengono risolte dinamicamente)
const TEAM_MAP = {
  100: 497,   // AS Roma
  108: 505,   // FC Internazionale Milano
  7397: 895,  // Como 1907
  110: 487,   // SS Lazio
  104: 490,   // Cagliari Calcio
  98: 489,    // AC Milan
  470: 512,   // Frosinone Calcio
  109: 496,   // Juventus FC
  471: 488,   // US Sassuolo Calcio
  113: 492,   // SSC Napoli
  102: 499,   // Atalanta BC
  5890: 867,  // US Lecce
  115: 494,   // Udinese Calcio
  586: 503,   // Torino FC
  99: 502,    // ACF Fiorentina
  103: 500,   // Bologna FC 1909
  112: 523,   // Parma Calcio 1913
  5911: 1579, // AC Monza
  107: 495,   // Genoa CFC
  454: 517,   // Venezia FC
};

// Cache persistente per le risoluzioni dinamiche degli id (30 giorni)
const resolveCacheTtl = 60 * 60 * 24 * 30;

async function apiFootballFetch(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'x-apisports-key': API_FOOTBALL_KEY },
    cache: 'no-store',
  });
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football error: ${JSON.stringify(data.errors)}`);
  }
  return data;
}

export function getApiFootballTeamId(fdTeamId) {
  return TEAM_MAP[fdTeamId] || null;
}

// Risolve l'id api-football per una squadra football-data:
// - cerca prima nel mapping statico
// - poi con una ricerca per nome (thumb de-normalizzata), filtrando le squadre donne/internazionali
export async function resolveApiFootballId(fdTeamId, teamName) {
  const mapped = getApiFootballTeamId(fdTeamId);
  if (mapped) return mapped;

  const cacheKey = `af:id:${fdTeamId}`;
  const cached = await getJSON(cacheKey);
  if (cached !== null) return cached;

  const searchName = teamName
    .replace(/\b(FC|AC|CF|Calcio|AS|SS|US|SC|BC|CFC|Club)\b/gi, '')
    .replace(/\d{4}/g, '')
    .trim();

  const data = await apiFootballFetch(`/teams?search=${encodeURIComponent(searchName)}`);
  const results = data.response || [];

  // Preferisce la squadra il cui nome contiene la ricerca, escludendo
  // i team femminili, U19/U20 e le "doppie" internazionali
  const needle = searchName.toLowerCase();
  const best =
    results.find(
      (t) =>
        t.team.name.toLowerCase().includes(needle) &&
        !/w\b|women|u19|u2\d| ii\.?$|ii\b/i.test(t.team.name) &&
        t.team.country === 'Italy'
    ) ||
    results.find((t) => t.team.name.toLowerCase().includes(needle)) ||
    results[0];

  if (best) {
    await setJSON(cacheKey, best.team.id, resolveCacheTtl);
    return best.team.id;
  }
  return null;
}

// Scontri diretti (stadio storico + prossima gara) tra due squadre api-football
export async function getHeadToHead(apiId1, apiId2) {
  const data = await apiFootballFetch(`/fixtures/headtohead?h2h=${apiId1}-${apiId2}`);
  return data.response || [];
}

// Quote dei bookmaker per una fixture specifica
export async function getOddsForFixture(fixtureId) {
  const data = await apiFootballFetch(`/odds?fixture=${fixtureId}`);
  return data.response || [];
}

// Previsioni (win probability) per una fixture specifica
export async function getPredictionsForFixture(fixtureId) {
  const data = await apiFootballFetch(`/predictions?fixture=${fixtureId}`);
  return data.response || [];
}

// Media semplice delle quote tra i bookmaker presenti
function averageQuotes(items, key) {
  const valid = items.filter((x) => Number.isFinite(x[key]));
  if (!valid.length) return null;
  const sum = valid.reduce((acc, x) => acc + x[key], 0);
  return (sum / valid.length).toFixed(2);
}

// Estrae e media le quote da una risposta /odds
export function extractAveragedOdds(oddsResponse) {
  const matchWinner = [];
  const overUnder = [];
  const btts = [];

  for (const match of oddsResponse) {
    for (const bm of match.bookmakers || []) {
      for (const bet of bm.bets || []) {
        if (bet.name === 'Match Winner') {
          for (const v of bet.values) {
            if (v.value === 'Home') matchWinner.push({ bookmaker: bm.name, home: parseFloat(v.odd) });
            else if (v.value === 'Draw') matchWinner.push({ bookmaker: bm.name, draw: parseFloat(v.odd) });
            else if (v.value === 'Away') matchWinner.push({ bookmaker: bm.name, away: parseFloat(v.odd) });
          }
        }
        if (bet.name === 'Goals Over/Under') {
          for (const v of bet.values) {
            const line = parseFloat(v.value.replace(/[^\d.]/g, ''));
            if (v.value.toLowerCase().includes('over') && line === 2.5) {
              overUnder.push({ bookmaker: bm.name, over: parseFloat(v.odd) });
            }
            if (v.value.toLowerCase().includes('under') && line === 2.5) {
              overUnder.push({ bookmaker: bm.name, under: parseFloat(v.odd) });
            }
          }
        }
        if (['Both Teams To Score', 'Both Teams Score'].includes(bet.name)) {
          for (const v of bet.values) {
            if (v.value === 'Yes') btts.push({ bookmaker: bm.name, yes: parseFloat(v.odd) });
            else if (v.value === 'No') btts.push({ bookmaker: bm.name, no: parseFloat(v.odd) });
          }
        }
      }
    }
  }

  const bookmakerCount = new Set([...matchWinner, ...overUnder, ...btts].map((x) => x.bookmaker)).size;

  return {
    bookmakerCount,
    matchWinner: {
      home: averageQuotes(matchWinner, 'home'),
      draw: averageQuotes(matchWinner, 'draw'),
      away: averageQuotes(matchWinner, 'away'),
    },
    overUnder25: {
      over: averageQuotes(overUnder, 'over'),
      under: averageQuotes(overUnder, 'under'),
    },
    btts: {
      yes: averageQuotes(btts, 'yes'),
      no: averageQuotes(btts, 'no'),
    },
  };
}