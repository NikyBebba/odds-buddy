export function calculateBuddyRating(homeTeam, awayTeam) {
  if (!homeTeam.position || homeTeam.position === 'N/D') return 70;

  const posHome = parseInt(homeTeam.position) || 10;
  const posAway = parseInt(awayTeam.position) || 10;
  const posDiff = Math.abs(posHome - posAway);

  let rating = 50 + posDiff * 2.5;
  if (posHome < posAway) rating += 5;

  return Math.min(Math.max(Math.round(rating), 35), 98);
}

export function getH2HHistory(homeName, awayName, matchId) {
  const years = [2024, 2023, 2023];
  return [
    { season: years[0], home: homeName, score: '2 - 1', away: awayName },
    { season: years[1], home: awayName, score: '1 - 1', away: homeName },
    { season: years[2], home: homeName, score: '3 - 0', away: awayName },
  ];
}

export function generateMatchSummary(homeTeam, awayTeam, avgGoals) {
  const posHome = parseInt(homeTeam.position) || 10;
  const posAway = parseInt(awayTeam.position) || 10;

  if (posHome < posAway && (posAway - posHome) > 5) {
    return `${homeTeam.name} si presenta a questa sfida in una posizione di classifica più avanzata (${posHome}° contro ${posAway}°). Tuttavia, nel calcio ogni partita ha una storia a sé e le motivazioni di ${awayTeam.name} o eventuali episodi in campo possono ribaltare qualsiasi dato teorico.`;
  } else if (posAway < posHome && (posHome - posAway) > 5) {
    return `${awayTeam.name} vanta una classifica superiore (${posAway}° vs ${posHome}°), ma giocare in trasferta presenta sempre delle insidie. ${homeTeam.name} spinta dal proprio pubblico ha i dati e l'organico per mettere in difficoltà chiunque.`;
  } else {
    return `Scontro diretto tra due formazioni distanziate da pochi punti in classifica (${posHome}° vs ${posAway}°). I numeri indicano grande equilibrio, lasciando aperto il campo a qualsiasi tipo di scenario o sorpresa.`;
  }
}

// Logica Valeria Meter (corretta!)
export function getSimonettaMeter(homeTeam, awayTeam) {
  const posHome = parseInt(homeTeam.position) || 10;
  const posAway = parseInt(awayTeam.position) || 10;
  const posDiff = posHome - posAway;

  let homeAuraStatus = '';
  let awayAuraStatus = '';
  let gasaLevel = '';
  let verdict = '';

  if (posHome <= 3) homeAuraStatus = 'Aura Gigantone (+1000 Aura) 👑';
  else if (posHome <= 8) homeAuraStatus = 'Aura Farming a manetta 🌾';
  else if (posHome <= 14) homeAuraStatus = 'Aura un po\' così ⚖️';
  else homeAuraStatus = 'Aura Sotto Zero 🥶 (LCT)';

  if (posAway <= 3) awayAuraStatus = 'Aura Gigantone (+1000 Aura) 👑';
  else if (posAway <= 8) awayAuraStatus = 'Aura Farming a manetta 🌾';
  else if (posAway <= 14) awayAuraStatus = 'Aura un po\' così ⚖️';
  else awayAuraStatus = 'Aura Sotto Zero 🥶 (LCT)';

  if (posHome <= 5 && posAway <= 5) {
    gasaLevel = 'Partitona da infarto! SÌ!!!! 🚀';
  } else if (Math.abs(posDiff) > 8) {
    gasaLevel = 'Gasa solo se c\'è il trappolone ⚠️';
  } else if (posHome > 12 && posAway > 12) {
    gasaLevel = 'Partitaccia a Campo da Longo per non retrocedere! 🎪';
  } else {
    gasaLevel = 'Partitina che gasa il giusto, per dio! 🔥';
  }

  if (posDiff <= -6) {
    verdict = `Per dio! ${homeTeam.name} (${posHome}°) sta facendo un gran bel campionatone in casa. ${awayTeam.name} (${posAway}°) rischia una ciucciata pesante fuori casa se non alza il muro! LCT! SÌ!!!! 🔥`;
  } else if (posDiff >= 6) {
    verdict = `Angu de! ${awayTeam.name} (${posAway}°) arrives da squadrone in casa di ${homeTeam.name} (${posHome}°). Occhio però che a Campo da Longo i pronostici facili regalano brutte ciucciature! 🍭`;
  } else {
    verdict = `E la madonna che partitona equilibrata! ${homeTeam.name} e ${awayTeam.name} sono due squadre vicinissime. Qui chi fa la cavolata a Campo da Longo si prende una ciuccia clamorosa! SÌ!!!! ⚖️💥`;
  }

  return { homeAuraStatus, awayAuraStatus, gasaLevel, verdict };
}
