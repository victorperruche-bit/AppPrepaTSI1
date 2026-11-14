// exam.js — Test blanc chronométré (type DS/examen)
// Simule les conditions d'un devoir surveillé : toutes matières, temps limité,
// note sur 20. Le diagnostic par matière oriente les révisions suivantes.
const Exam = (() => {
  let session = null;
  let timer = null;

  function start() {
    const subjects = Object.keys(QUIZ_BANK);
    // 12 questions : répartition équilibrée entre matières
    const picks = [];
    subjects.forEach((sid) => {
      const bank = QUIZ_BANK[sid].slice();
      shuffle(bank);
      picks.push(...bank.slice(0, 3).map((q) => ({ ...q, subject: sid })));
    });
    shuffle(picks);
    session = { questions: picks.slice(0, 12), idx: 0, correct: 0, perSubject: {}, left: 15 * 60, answered: false, finished: false };
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (!session || session.finished) return;
      session.left--;
      const t = document.querySelector("#exam-chrono");
      if (t) {
        const m = Math.floor(Math.max(0, session.left) / 60), s = Math.max(0, session.left) % 60;
        t.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        if (session.left <= 0) { t.style.color = "var(--danger)"; finish(true); }
      }
    }, 1000);
    App.go("exam");
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  function current() { return session.questions[session.idx]; }

  function answer(optIdx) {
    if (session.answered || session.finished) return;
    session.answered = true;
    const q = current();
    const ok = optIdx === q.answer;
    if (ok) session.correct++;
    const ps = session.perSubject[q.subject] || (session.perSubject[q.subject] = { correct: 0, total: 0 });
    ps.total++;
    if (ok) ps.correct++;
    SRS.review(q.id, ok ? 5 : 1);
    session.chosen = optIdx;
    App.render();
    App.renderExamFeedback(q, ok, optIdx);
  }

  function next() {
    if (session.finished) return;
    session.answered = false;
    session.idx++;
    if (session.idx >= session.questions.length) finish(false);
    else App.render();
  }

  function finish(timeout) {
    if (!session || session.finished) return;
    session.finished = true;
    if (timer) { clearInterval(timer); timer = null; }
    const total = session.questions.length;
    const note = Math.round((session.correct / total) * 20);
    const xp = session.correct * 12 + (timeout ? 0 : 15);
    Gamify.addXp(xp, `Test blanc : ${session.correct}/${total}`);
    Gamify.touchStreak();
    Gamify.checkBadges();
    Store.save();
    App.toast(timeout ? "⏰ Temps écoulé — test corrigé !" : `📝 Test terminé : ${note}/20`);
    if (note >= 14) App.confetti();
    App.render();
  }

  return { start, answer, next, get session() { return session; } };
})();
