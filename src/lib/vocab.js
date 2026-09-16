// Vocabolario gergale di Odds Buddy. Ogni frase è deterministicamente pescata
// usando un seme (lunghezza dei nomi) così i test e i render restano stabili.

export const GLOSSARY = [
  { term: 'SÌ!!!!', meaning: 'L\'urlo di guerra del Buddy quando i numeri sono clamorosi. "Per dio, quale partitona!"' },
  { term: 'Ciucciata', meaning: 'La favorita che crolla: un risultato inatteso e doloroso, la classica sorpresa che brucia.' },
  { term: 'Aura Farming', meaning: 'Quando una squadra è in forma pazzesca e "farming" energia positiva a valanghe.' },
  { term: 'Campo di Longo', meaning: 'Il campo leggendario dove si gioca la partite : il terreno regola i conti anche quando i numeri non ci stanno.' },
  { term: 'Angu de', meaning: 'Espressione dello stivale che significa più o meno "Oh mamma!", usata davanti a un risultato incredibile.' },
  { term: 'E la madonna!', meaning: 'Esclamazione da gradinata quando succede di tutto e di più in una manciata di minuti.' },
  { term: 'LCT', meaning: 'Livello Ciucità Totale: quanto una partita può rigirarti davanti agli occhi.' },
  { term: 'La fessa di mammata!', meaning: 'Frase colorita per dire "non ci posso credere" quando il campo stravolge ogni pronostico.' },
  { term: 'Per dio', meaning: 'Attacco di ogni verdetto memorabile. Quando dopo "Per dio" arriva "SÌ!!!!" il Buddy è molto convinto.' },
  { term: 'Aura', meaning: 'L\'energia complessiva di una squadra in questo momento: classifica, forma e ruoli si sommano in una sola vibrazione.' },
];

const PICK = (seed, arr) => arr[Math.abs(seed) % arr.length];

export function exclamation(seed) {
  return PICK(seed, ['SÌ!!!!', 'ANGU DE!', 'E LA MADONNA!', 'Ci puoi dire ancora qualcosa!', 'LCT alto, salive basse!']);
}

export function ciucciataPhrase(seed, teamName) {
  return PICK(seed, [
    `Occhio, qui c'è l'ombra della ciucciata: ${teamName} dovrà sudare per non farsi notare di sotto.`,
    `I segnali dicono ${teamName}, ma la storia del Campo di Longo è piena di trampolini per colossi addormentati.`,
    `Numero da paura, ma una ciucciata è sempre dietro l'angolo quando la palla diventa protagonista.`,
    `La classifica sorride a ${teamName}, ma il pallone è perfido e ama i ribaltamenti.`,
  ]);
}

export function auraFarmingPhrase(seed, teamName) {
  return PICK(seed, [
    `${teamName} sta farmando aura come un matto: le vibrazioni sono tutte dalla sua parte.`,
    `${teamName} è in stato di grazia e l'aura si sente anche dal divano.`,
    `Il vento del Campo di Longo soffia dalla parte di ${teamName}: aura farming attivo al massimo.`,
  ]);
}

export function verdictOpener(seed) {
  return PICK(seed, [
    'Il verdetto del Buddy:',
    'E il Buddy tira le somme:',
    'Sentinella al centro, si legge così:',
    'La bocca del campo ha parlato:',
  ]);
}

export function closer(seed) {
  return PICK(seed, [
    'Ma ricorda: al pallone non importa nulla delle nostre tabelle!',
    'Se dovessi puntare una bustina di patatine, questa è la direzione. Ma solo patatine!',
    'I dati dicono questo, la domenica poi fa quello che vuole lei!',
    'Per dio, il resto lo decide il Campo di Longo!',
  ]);
}

export function trapSuffix(seed) {
  return PICK(seed, [
    'Insomma: occhio alla ciucciata, la favorita non è poi così intoccabile.',
    'La pancia dice "Per dio, che trappola!", i numeri confermano.',
    'Qui più che un pronostico serve una lampada al collo.',
  ]);
}

export function foodVerdict(seed, homeName, awayName) {
  return PICK(seed, [
    `Secondo lo stomaco, questa partita si vede in piedi davanti alla tv: ${homeName} e ${awayName} non promettono riposo.`,
    `Il verdetto del food-teller: mangia quanto basta e tieni il telefono carico per gli aggiornamenti.`,
    `Tra una carota cotta e un capperino salato, il fegato ringrazia il tifo da casa.`,
  ]);
}

export function buddyMotto() {
  return 'Nessuna trappola, nessuna ciucciata... SÌ!!!!';
}