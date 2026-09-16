const BASE = 'https://api.bigballsdata.com/v1';

export const BIGBALLS_LEAGUE_CODES = {
  serieA: 'serie_a',
  premierLeague: 'epl',
  laLiga: 'laliga',
  bundesliga: 'bundesliga',
  ligue1: 'ligue1',
  championsLeague: 'cl',
};

const TEAM_CACHE = new Map();
const INJURIES_CACHE = new Map();

function normalizeName(name = '') {
  return (name || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')
    .trim();
}

async function bbFetch(path, key) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-api-key': key, Accept: 'application/json' },
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    throw new Error(`bigballsdata error ${res.status} on ${path}`);
  }
  return res.json();
}

function pickRows(data) {
  const rows = data?.data;
  if (Array.isArray(rows)) return rows;
  if (rows && Array.isArray(rows.injuries?.value)) return rows.injuries.value;
  if (rows && Array.isArray(rows.teams)) return rows.teams;
  return [];
}

export async function getTeamsForLeague(leagueKey, apiKey) {
  const code = BIGBALLS_LEAGUE_CODES[leagueKey];
  if (!code) return [];
  if (TEAM_CACHE.has(code)) return TEAM_CACHE.get(code);

  const data = await bbFetch(`/teams?league=${code}`, apiKey);
  const teams = pickRows(data);
  TEAM_CACHE.set(code, teams);
  return teams;
}

// Cerca l'id BigBalls partendo dal nome squadra (es. "Monza" -> UUID).
export async function resolveTeamByName(teamName, leagueKey, apiKey) {
  const target = normalizeName(teamName);
  const teams = await getTeamsForLeague(leagueKey, apiKey);
  return (
    teams.find((t) => normalizeName(t.name) === target) ||
    teams.find((t) => normalizeName(t.short_name) === target) ||
    teams.find((t) => normalizeName(t.name).includes(target) || target.includes(normalizeName(t.name))) ||
    null
  );
}

// Infortunati di una squadra. Ritorna array di { display_name }.
export async function getInjuriesForTeam(teamId, apiKey) {
  if (INJURIES_CACHE.has(teamId)) return INJURIES_CACHE.get(teamId);
  const data = await bbFetch(`/injuries?sport=football&team=${encodeURIComponent(teamId)}`, apiKey);
  const injuries = pickRows(data);
  INJURIES_CACHE.set(teamId, injuries);
  return injuries;
}

// Dossier extra per le due squadre di una partita: logo + infermeria.
export async function getTeamExtras({ leagueKey, homeName, awayName, apiKey }) {
  const homeTeam = await resolveTeamByName(homeName, leagueKey, apiKey);
  const awayTeam = await resolveTeamByName(awayName, leagueKey, apiKey);

  const out = { home: null, away: null };

  if (homeTeam) {
    out.home = {
      name: homeTeam.name,
      logo: homeTeam.logo_url || null,
      shortName: homeTeam.short_name,
      injured: (await getInjuriesForTeam(homeTeam.id, apiKey)).map((i) => i.display_name || i.full_name).filter(Boolean),
    };
  }

  if (awayTeam) {
    out.away = {
      name: awayTeam.name,
      logo: awayTeam.logo_url || null,
      shortName: awayTeam.short_name,
      injured: (await getInjuriesForTeam(awayTeam.id, apiKey)).map((i) => i.display_name || i.full_name).filter(Boolean),
    };
  }

  return out;
}