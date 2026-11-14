// quiz.js — Moteur de quiz avec répétition espacée et feedback pédagogique
// Principes : "Make It Stick" (Brown, Roediger & McDaniel) —
// le retrieval practice (se tester) ancre mieux que relire ;
// le feedback immédiat corrige les erreurs avant qu'elles s'installent.
const Quiz = (() => {
  let session = null;

  function start(subject) {
    const bank = QUIZ_BANK[subject] || [];
    const due = SRS.dueCards(bank.map((q) => q.id));
    const pool = bank.filter((q) => due.includes(q.id));
    const questions = (pool.length >= 3 ? pool : bank).slice();
    shuffle(questions);
    session = { subject, questions, idx: 0, score: 0, answered: false };
    App.render();
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  function current() {
    return session.questions[session.idx];
  }

  function answer(optIdx) {
    if (session.answered) return;
    session.answered = true;
    session.chosen = optIdx;
    const q = current();
    const correct = optIdx === q.answer;
    if (correct) session.score++;

    const s = Store.state.quizStats[session.subject] || (Store.state.quizStats[session.subject] = { attempts: 0, correct: 0 });
    s.attempts++;
    if (correct) s.correct++;
    SRS.review(q.id, correct ? 5 : 1);
    Gamify.addXp(correct ? 15 : 5, correct ? "Quiz : bonne réponse" : "Quiz : tentative");
    Gamify.checkBadges();
    Store.save();
    App.render();
    TTS.speak(correct ? "Bonne réponse !" : "Pas tout à fait. " + q.explain);
  }

  function next() {
    session.answered = false;
    session.idx++;
    if (session.idx >= session.questions.length) {
      finish();
    } else {
      App.render();
    }
  }

  function finish() {
    const total = session.questions.length;
    const pct = Math.round((session.score / total) * 100);
    Gamify.addXp(20, "Quiz terminé");
    Gamify.touchStreak();
    Gamify.checkBadges();
    const done = { subject: session.subject, score: session.score, total, pct };
    session = { finished: true, result: done };
    App.render();
    if (pct >= 70) App.confetti();
  }

  return { start, answer, next, get session() { return session; } };
})();
