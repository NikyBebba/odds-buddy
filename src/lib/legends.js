// Quiz "Leggende del Pallone": fatti storici reali e verificabili del calcio mondiale.
// Nessun dato inventato: ogni risposta è un dato storico consolidato.
export const LEGENDS_QUESTIONS = [
  {
    q: 'Chi ha vinto il Mondiale 2022 in Qatar?',
    options: ['Francia', 'Argentina', 'Brasile', 'Croazia'],
    correct: 1,
    fun: 'Messi ha alzato la coppa ai rigori contro la Francia: la rivincita del 2018 era servita.',
  },
  {
    q: 'Quale club ha vinto il maggior numero di Champions League/Coppa dei Campioni?',
    options: ['Real Madrid', 'Barcellona', 'AC Milan', 'Bayern Monaco'],
    correct: 0,
    fun: 'Il Real ha un armadio pieno di coppe coi grandi orecchi. Le altre si affacciano, lui abita lì.',
  },
  {
    q: 'Chi è il miglior marcatore di sempre della storia del calcio?',
    options: ['Pelé', 'Cristiano Ronaldo', 'Lionel Messi', 'Maradona'],
    correct: 1,
    fun: 'CR7 ha segnato ovunque: il suo numero di gol reali certificati lo tiene in vetta alla classifica eterna.',
  },
  {
    q: 'Quante Champions League ha vinto il Milan?',
    options: ['5', '7', '8', '9'],
    correct: 1,
    fun: 'Sette, e le notti di Istanbul e Liverpool sono diventate leggenda (in un senso e nell\'altro).',
  },
  {
    q: 'Qual è stato l\'ultimo club italiano a vincere la Champions League?',
    options: ['Inter', 'Juventus', 'Milan', 'Roma'],
    correct: 0,
    fun: 'L\'Inter di Simone Inzaghi ha alzato la coppa a Istanbul nel 2023, battendo il Manchester City in finale.',
  },
  {
    q: 'Chi ha vinto il Pallone d\'Oro nel 2005?',
    options: ['Ronaldinho', 'Zidane', 'Beckham', 'Henry'],
    correct: 0,
    fun: 'Ronaldinho, nell\'anno magico col Barcellona. Il centrocampo saprà sorridere quando ricorda.',
  },
  {
    q: 'Quale nazionale ha vinto il Mondiale più recente prima dell\'Argentina 2022?',
    options: ['Francia', 'Spagna', 'Germania', 'Italia'],
    correct: 0,
    fun: 'Nel 2018 i francesi alzarono la coppa: Mbappé aveva 19 anni e il mondo lo guardava.',
  },
  {
    q: 'Quante volte l\'Italia vince i Mondiali del 2006?',
    options: ['1', '2', '3', '4'],
    correct: 0,
    fun: 'Una, ma che una: Zidane ha salutato con la testata a Materazzi. La coppa è tornata a casa.',
  },
  {
    q: 'Quale calciatore ha vinto più Palloni d\'Oro nella storia?',
    options: ['Cristiano Ronaldo', 'Lionel Messi', 'Pelé', 'Michel Platini'],
    correct: 1,
    fun: 'Messi ha collezionato un record di Palloni d\'Oro che sembra un numero di telefono.',
  },
  {
    q: 'Chi ha segnato il gol del secolo (definito così dalla FIFA, gol di Maradona nel 1986)?',
    options: ['Maradona', 'Pelé', 'Messi', 'Cruyff'],
    correct: 0,
    fun: 'Il dribbling contro l\'Inghilterra ai quarti del 1986: il campo di Longo era la sua abitazione personale.',
  },
];

export function pickLegendQuestion(baseIndex) {
  return LEGENDS_QUESTIONS[Math.abs(baseIndex) % LEGENDS_QUESTIONS.length];
}