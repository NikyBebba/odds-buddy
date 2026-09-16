// Trivia "Leggende del Pallone" — layer casuale sopra la banca di fatti reali.
// I fatti (domande, opzioni, risposta) vivono in legends.js e qui NON vengono
// mai modificati: solo mischiati. Zero dati inventati, tutto già verificato.
import { LEGENDS_QUESTIONS } from '@/lib/legends';

function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptions(q, rand) {
  const order = shuffle(q.options.map((_, i) => i), rand);
  return {
    ...q,
    options: order.map((i) => q.options[i]),
    correct: order.indexOf(q.correct),
  };
}

// Estrae per ogni partita un sottoinsieme casuale di fatti, con le opzioni
// rimescolate: la domanda giusta cambia posizione e il set non si ripete mai identico.
export function buildTriviaDeck({ count = 5, rand = Math.random } = {}) {
  return shuffle(LEGENDS_QUESTIONS, rand)
    .slice(0, count)
    .map((q) => shuffleOptions(q, rand));
}

// GIUNTO per il traduttore in gergo (v2).
// Oggi le fun sono già scritte nello slang del Buddy, quindi questo è solo un
// pass-through. Quando arriverá una fonte di domande esterne, qui le "vestiremo"
// con il dizionario di vocab.js. Nome esposto cosÃ¬ il component chiama solo lui.
export function gergoify(q) {
  return q;
}
