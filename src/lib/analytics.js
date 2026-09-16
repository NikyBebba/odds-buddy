import { auraFarmingPhrase, closer, exclamation } from './vocab.js';

function posOf(team) {
  const n = parseInt(team?.position);
  return Number.isNaN(n) || n <= 0 ? 10 : n;
}

function num(team, key) {
  const v = parseFloat(team?.[key]);
  return Number.isFinite(v) ? v : 0;
}

function formScoreOf(form) {
  if (!Array.isArray(form) || form.length === 0) return null;
  const wins = form.filter((f) => f === '🟩').length;
  const draws = form.filter((f) => f === '🟨').length;
  return wins + draws * 0.5;
}

export function calculateBuddyRating(homeTeam, awayTeam, analytics) {
  // 1) Divario in classifica: piu' ampio = piu' prevedibile (max 30)
  const posGap = Math.abs(posOf(homeTeam) - posOf(awayTeam));
  const posFactor = Math.min(30, Math.round((posGap / 12) * 30));

  // 2) Forma recente: forma diversa tra le due = favorita piu' chiara (max 25)
  const homeFormV = formScoreOf(analytics?.homeForm);
  const awayFormV = formScoreOf(analytics?.awayForm);
  let formFactor = 10;
  if (homeFormV !== null && awayFormV !== null) {
    const formDiff = Math.abs(homeFormV - awayFormV);
    const best = Math.max(homeFormV, awayFormV);
    formFactor = Math.min(25, Math.round(formDiff * 4 + (best >= 3 ? 5 : best >= 2.5 ? 3 : 1)));
  }

  // 3) Potenza attacco/difesa: divario di differenza reti a partita (max 25)
  const netOf = (team) => {
    const games = Math.max(1, num(team, 'playedGames') || 1);
    return (num(team, 'goalsFor') - num(team, 'goalsAgainst')) / games;
  };
  const netGap = Math.abs(netOf(homeTeam) - netOf(awayTeam));
  const netFactor = Math.min(25, Math.round(netGap * 6));

  // 4) Fattore campo: quanto la casa rende piu' forte la signora di casa (max 20)
  const homeGames = Math.max(1, num(homeTeam, 'homeMatches') || 1);
  const awayGames = Math.max(1, num(awayTeam, 'awayMatches') || 1);
  const homeHomeNet = (num(homeTeam, 'homeGoalsFor') - num(homeTeam, 'homeGoalsAgainst')) / homeGames;
  const awayAwayNet = (num(awayTeam, 'awayGoalsFor') - num(awayTeam, 'awayGoalsAgainst')) / awayGames;
  const homeAdvFactor = Math.max(0, Math.min(20, Math.round(8 + (homeHomeNet - awayAwayNet) * 4)));

  let score = Math.round(posFactor + formFactor + netFactor + homeAdvFactor);
  score = Math.max(35, Math.min(95, score));

  const breakdown = [
    { label: 'Divario in classifica', value: posFactor, max: 30 },
    { label: 'Forma recente', value: formFactor, max: 25 },
    { label: 'Attacco / difesa', value: netFactor, max: 25 },
    { label: 'Fattore campo', value: homeAdvFactor, max: 20 },
  ];

  const label =
    score >= 75 ? 'Favorita praticamente certa 🔒' :
    score >= 60 ? 'Indicatore moderato 🌗' :
    'Partita da sorpresa 🎲';

  return { score, breakdown, label };
}

export function getH2HHistory(match) {
  const list = match?.analytics?.h2h;
  if (!Array.isArray(list) || list.length === 0) return [];

  return list.map((m) => ({
    season: m.date
      ? new Date(m.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'n/d',
    home: m.homeTeamName,
    score: `${m.homeGoals} - ${m.awayGoals}`,
    away: m.awayTeamName,
    icon: m.icon || '',
  }));
}

export function generateMatchSummary(homeTeam, awayTeam, analytics) {
  const formPts = (form) => {
    const s = formScoreOf(form);
    return s === null ? 'n/d' : `${s}/4`;
  };

  const homeF = formScoreOf(analytics?.homeForm);
  const awayF = formScoreOf(analytics?.awayForm);
  const avg = analytics?.avgGoals && analytics.avgGoals !== '-' ? analytics.avgGoals : 'n/d';

  const lines = [];
  lines.push(
    `${homeTeam.name} (${posOf(homeTeam)}° in classifica, forma ${formPts(analytics?.homeForm)}) ospita ${awayTeam.name} (${posOf(awayTeam)}°, forma ${formPts(analytics?.awayForm)}). Attesa media di ${avg} gol totali.`
  );

  const trends = [];
  if (homeF !== null && homeF >= 3) trends.push(`${homeTeam.name} è una palla infuocata (${homeF}/4)`);
  if (awayF !== null && awayF >= 3) trends.push(`${awayTeam.name} corre in positivo (${awayF}/4)`);
  if (homeF !== null && homeF <= 1) trends.push(`${homeTeam.name} è in frenata (${homeF}/4)`);
  if (awayF !== null && awayF <= 1) trends.push(`${awayTeam.name} arranca (${awayF}/4)`);
  if (trends.length) lines.push(trends.join('. ') + '.');

  const closers = [
    'Il verdetto però lo dà solo il campo... e il nostro cuore da tifosi!',
    'Numeri utili, ma il pallone è strano e adora le sorprese!',
    'Qui vince chi ha più fame, più pazienza e meno paura del risultato!',
  ];
  const idx = (homeTeam.name.length + awayTeam.name.length) % closers.length;
  lines.push(closers[idx]);

  const fb = homeF !== null && awayF !== null;
  if (fb && homeF - awayF >= 2.5) {
    lines.push(auraFarmingPhrase(homeTeam.name.length, homeTeam.name));
  } else if (fb && awayF - homeF >= 2.5) {
    lines.push(auraFarmingPhrase(awayTeam.name.length * 3, awayTeam.name));
  }

  return lines.join(' ');
}

export function getAuraMeter(homeTeam, awayTeam, analytics) {
  const homeF = formScoreOf(analytics?.homeForm);
  const awayF = formScoreOf(analytics?.awayForm);

  // Scala 0-100: si parte da 100 per la capolista, si perde ~5 punti a posizione,
  // poi la forma recente (0-4) sposta il punteggio di +/-10.
  const auraOf = (team, form) => {
    const position = posOf(team);
    const base = Math.max(5, 100 - (position - 1) * 5);
    const formBonus = form === null ? 0 : (form - 2) * 5;
    const score = Math.max(0, Math.min(100, Math.round(base + formBonus)));
    return {
      score,
      position,
      form: form === null ? null : `${form}/4`,
      formBonus: form === null ? 0 : formBonus,
    };
  };

  const homeAura = auraOf(homeTeam, homeF);
  const awayAura = auraOf(awayTeam, awayF);
  const homeScore = homeAura.score;
  const awayScore = awayAura.score;

  const statusOf = (score) =>
    score >= 70
      ? 'Aura Potente & Farming Attivo ✨'
      : score <= 35
        ? 'Rischio Ciucciata Storica 🤡'
        : 'Aura Neutra 😶';

  const homeAuraStatus = statusOf(homeScore);
  const awayAuraStatus = statusOf(awayScore);

  const diff = Math.abs(homeScore - awayScore);
  let gasaLevel;
  if (diff >= 40) gasaLevel = '⚡ Scontro impari: qualcuno rischia una stangata memorabile.';
  else if (diff >= 20) gasaLevel = '🌗 Favoritismo moderato, occhi aperti alla sorpresa.';
  else gasaLevel = '🔥 Partita da tripla, tensione alle stelle!';

  // Verdetto: SEMPRE dal punto di vista di chi ospita, dati reali per primi,
  // gergo solo in chiusura.
  const formLabel = (f) => (f === null ? 'n/d' : `${f}/4`);
  const situazione = `${homeTeam.name} ospita ${awayTeam.name} al suo campo. Dati reali: ${homeTeam.name} è ${homeAura.position}° (forma ${formLabel(homeF)}), ${awayTeam.name} è ${awayAura.position}° (forma ${formLabel(awayF)}).`;

  let ragionamento;
  if (homeAura.position < awayAura.position && homeF !== null && (awayF === null || homeF > awayF)) {
    ragionamento =
      `I numeri mettono la casa davanti: più su in classifica e con la forma dalla sua. ${awayTeam.name} dovrà correre il doppio per evitare la figuraccia.`;
  } else if (awayAura.position < homeAura.position && awayF !== null && (homeF === null || awayF > homeF)) {
    ragionamento =
      `Attenzione alla mossa da trasferta: ${awayTeam.name} sta meglio di ${homeTeam.name} sia in classifica sia in forma. La casa non può dormire.`;
  } else {
    ragionamento =
      homeScore > awayScore
        ? `L'aura globale pende leggermente verso la casa: classifica e rendimento la sostengono.`
        : awayScore > homeScore
          ? `L'aura globale pende leggermente verso gli ospiti: il loro momento è migliore sulla carta.`
          : `Aura alla pari o quasi: i numeri si annullano, partita apertissima.`;
  }

  const verdict = `${situazione} ${ragionamento} ${exclamation(homeTeam.name.length + awayTeam.name.length)}`;

  return {
    homeScore,
    awayScore,
    homeAuraStatus,
    awayAuraStatus,
    homeAura, // { score, position, form, formBonus }
    awayAura,
    gasaLevel,
    verdict,
  };
}

const rate = (n, d) => (d ? n / d : 0);

const pct = (v) => Math.round(v * 100);

export function getBookiePrognosis(homeTeam, awayTeam, analytics) {
  // ---- 1X2: stima dai rendimenti casa/trasferta reali ----
  const hWin = rate(homeTeam.homeWins, homeTeam.homeMatches);
  const hDraw = rate(homeTeam.homeDraws, homeTeam.homeMatches);
  const aWin = rate(awayTeam.awayWins, awayTeam.awayMatches);
  const aDraw = rate(awayTeam.awayDraws, awayTeam.awayMatches);

  let p1 = 0.5 * hWin + 0.5 * (1 - aWin - aDraw);
  let pX = 0.5 * hDraw + 0.5 * aDraw;
  let p2 = 1 - p1 - pX;

  if (p1 < 0) p1 = 0;
  if (pX < 0) pX = 0;
  if (p2 < 0) p2 = 0;
  const sum = p1 + pX + p2 || 1;
  p1 /= sum;
  pX /= sum;
  p2 /= sum;

  const signPick = p1 > pX && p1 > p2 ? '1' : p2 > pX ? '2' : 'X';

  const signHints = {
    1: `Segno 1: ${homeTeam.name} fa la padrona in casa sua (${pct(p1)}%).`,
    X: `Segno X: le due si annullano a vicenda (${pct(pX)}%), il pareggio spunta da dietro l'angolo.`,
    2: `Segno 2: colpo gobbo di ${awayTeam.name} in trasferta (${pct(p2)}%).`,
  };

  // ---- Over/Under 2.5: Poisson con i gol attesi (somma di due Poisson = Poisson) ----
  const expHome = parseFloat(analytics?.homeExpectedGoals) || 1;
  const expAway = parseFloat(analytics?.awayExpectedGoals) || 1;
  const total = expHome + expAway;
  const pUnder25 = Math.exp(-total) * (1 + total + (total * total) / 2);
  const pOver25 = 1 - pUnder25;
  const overPick = pOver25 >= 0.6 ? 'OVER 2.5' : pOver25 <= 0.4 ? 'UNDER 2.5' : '50/50';
  const overHints = {
    'OVER 2.5': `Over: le reti piovono (${pct(pOver25)}%), le porte sembrano vasi di coccio.`,
    'UNDER 2.5': `Under: le difese chiudono la saracinesca (${pct(pUnder25)}% no gol a raffica).`,
    '50/50': `Over/Under una vera moneta (${pct(pOver25)}% Over): meglio godersi il gioco.`,
  };

  // ---- Gol/No Gol: probabilità che entrambe segnino ----
  const pHomeScores = rate(homeTeam.homeScoredIn, homeTeam.homeMatches);
  const pAwayScores = rate(awayTeam.awayScoredIn, awayTeam.awayMatches);
  const pGG = pHomeScores * pAwayScores;
  const ggPick = pGG >= 0.6 ? 'GG' : pGG <= 0.4 ? 'NG' : '50/50';
  const ggHints = {
    GG: `GG: entrambe segnano quasi sempre (${pct(pGG)}%), difese con le suole di burro.`,
    NG: `NG: una delle due chiude la porta coi catenacci (${pct(1 - pGG)}% no gol per l'altra).`,
    '50/50': `GG|NG monetina: dipenderà dalla prima rete (${pct(pGG)}%).`,
  };

  const samples = [
    { n: homeTeam.homeMatches, label: homeTeam.name, where: 'in casa' },
    { n: awayTeam.awayMatches, label: awayTeam.name, where: 'in trasferta' },
  ];
  const minSample = Math.min(...samples.map((s) => s.n));

  const closing = closer((homeTeam.name.length + awayTeam.name.length) * 7);

  return {
    sign: { pick: signPick, p1: pct(p1), pX: pct(pX), p2: pct(p2), hint: signHints[signPick] },
    overUnder: { total: total.toFixed(1), pOver25: pct(pOver25), pUnder25: pct(pUnder25), pick: overPick, hint: overHints[overPick] },
    goalNoGoal: { pGG: pct(pGG), pNG: pct(1 - pGG), pick: ggPick, hint: ggHints[ggPick] },
    minSample,
    verdict: closing,
  };
}