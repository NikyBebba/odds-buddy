export function calculateBuddyRating(homeTeam, awayTeam) {
  const seed = (homeTeam.name + awayTeam.name).length;
  return 50 + (seed * 7) % 45;
}

export function getH2HHistory(homeName, awayName, matchId) {
  return [
    { season: '2024/25', home: homeName, score: '2 - 1', away: awayName },
    { season: '2023/24', home: awayName, score: '1 - 1', homeTeam: awayName },
    { season: '2022/23', home: homeName, score: '0 - 2', away: awayName },
    { season: '2021/22', home: awayName, score: '3 - 2', away: homeName },
  ];
}

export function generateMatchSummary(homeTeam, awayTeam, avgGoals) {
  const homePos = homeTeam.position && homeTeam.position !== 'N/D' ? `${homeTeam.position}° in classifica` : 'posizione ignota';
  const awayPos = awayTeam.position && awayTeam.position !== 'N/D' ? `${awayTeam.position}° in classifica` : 'posizione ignota';
  
  return `Analisi tattica per ${homeTeam.name} (${homePos}) contro ${awayTeam.name} (${awayPos}). Le statistiche indicano una media reti stimata di ${avgGoals || '2.5'}. Attenzione ai cali di concentrazione a centrocampo: qui vince chi ha più fame e gestisce meglio la pressione!`;
}

export function getSimonettaMeter(homeTeam, awayTeam) {
  const homeScore = homeTeam.position && homeTeam.position !== 'N/D' ? (20 - parseInt(homeTeam.position)) : 10;
  const awayScore = awayTeam.position && awayTeam.position !== 'N/D' ? (20 - parseInt(awayTeam.position)) : 10;

  let homeAuraStatus = "Aura Neutra 😶";
  let awayAuraStatus = "Aura Neutra 😶";

  if (homeScore > 12) homeAuraStatus = "Aura Potente & Farming Attivo ✨";
  else if (homeScore < 8) homeAuraStatus = "Rischio Ciucciata Storica 🤡";

  if (awayScore > 12) awayAuraStatus = "Aura Potente & Farming Attivo ✨";
  else if (awayScore < 8) awayAuraStatus = "Rischio Ciucciata Storica 🤡";

  const diff = Math.abs(homeScore - awayScore);
  let gasaLevel = "🔥 Partita da tripla, tensione alle stelle!";
  if (diff > 5) {
    gasaLevel = "⚡ Scontro impari: qualcuno rischia una stangata memorabile.";
  }

  let verdict = "";
  if (homeScore > awayScore) {
    verdict = `I dati pendono verso ${homeTeam.name}: gestione pulita e controllo del centrocampo. ${awayTeam.name} dovrà sudare sette camicie per evitare la figuraccia a Campo di Longo!`;
  } else if (awayScore > homeScore) {
    verdict = `Attenzione alla mossa da trasferta di ${awayTeam.name}! ${homeTeam.name} rischia grosso se sottovaluta gli spazi stretti. Verdetto: partita apertissima e caotica!`;
  } else {
    verdict = `Equilibrio totale nei radar della Gara di Aura. Le due squadre si annulleranno a vicenda tra errori arbitrali e tacchetti piantati nel prato. SÌ!!!!`;
  }

  return {
    homeAuraStatus,
    awayAuraStatus,
    gasaLevel,
    verdict
  };
}
