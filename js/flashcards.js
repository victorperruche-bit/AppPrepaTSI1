// flashcards.js — Mode flashcards (type Anki/Quizlet)
// Cartes générées depuis les points d'intention + banque de quiz.
// Notation 4 boutons (À revoir / Difficile / Correct / Facile) → SRS.
// Le "retrieval practice" (se tester avant de retourner) est le coeur (Rowland, 2014 : g = 0.50).
const Flashcards = (() => {
  let session = null;

  // Construit le paquet de cartes d'une matière
  function buildDeck(subject) {
    const deck = [];
    const sub = SUBJECTS[subject];
    if (!sub) return deck;
    sub.chapters.forEach((ch) => {
      ch.points.forEach((p, i) => {
        deck.push({
          id: `fc_${ch.id}_${i}`,
          chapter: ch.id,
          front: `Point d'intention — ${ch.title} : le formuler !`,
          back: p
        });
      });
    });
    (QUIZ_BANK[subject] || []).forEach((q) => {
      deck.push({
        id: `fcq_${q.id}`,
        chapter: q.chapter,
        front: q.q.replace(/«|»/g, "'"),
        back: q.options[q.answer] + (q.explain ? ` — ${q.explain}` : "")
      });
    });
    return deck;
  }

  function start(subject) {
    const deck = buildDeck(subject);
    // Priorité aux cartes dues (répétition espacée), puis aux jamais vues
    const due = SRS.dueCards(deck.map((c) => c.id));
    const queue = deck.filter((c) => due.includes(c.id));
    const fresh = deck.filter((c) => !Store.state.srs[c.id]);
    const rest = deck.filter((c) => !due.includes(c.id) && Store.state.srs[c.id]);
    shuffle(queue); shuffle(fresh);
    session = { subject, queue: [...fresh.slice(0, 5), ...queue, ...rest].slice(0, 15), idx: 0, flipped: false, stats: { again: 0, hard: 0, good: 0, easy: 0 } };
    App.go("flashcards");
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  function current() { return session.queue[session.idx]; }

  function flip() {
    session.flipped = true;
    if (session.subject) {
      const c = current();
      if (c) TTS.speak(c.back);
    }
    App.render();
  }

  // Note à l'Anki : 1 = À revoir, 2 = Difficile, 3 = Correct, 4 = Facile
  function grade(g) {
    const c = current();
    if (!c) return;
    const map = { 1: "again", 2: "hard", 3: "good", 4: "easy" };
    session.stats[map[g]]++;
    SRS.review(c.id, g <= 2 ? 1 : g === 3 ? 4 : 5);
    Gamify.addXp(g === 1 ? 3 : g === 2 ? 8 : g === 3 ? 12 : 15, "Flashcard");
    Gamify.touchStreakDaily();
    Gamify.checkBadges();
    Store.save();
    session.flipped = false;
    session.idx++;
    if (session.idx >= session.queue.length) {
      Gamify.addXp(20, "Paquet de flashcards terminé");
      Gamify.checkBadges();
      session.finished = true;
    }
    App.render();
  }

  // Compteur de cartes dues tous sujets confondus (type Anki)
  function dueCountAll() {
    let n = 0;
    Object.keys(SUBJECTS).forEach((sid) => {
      buildDeck(sid).forEach((c) => { if (SRS.isDue(c.id)) n++; });
    });
    return n;
  }

  return { start, flip, grade, buildDeck, dueCountAll, get session() { return session; } };
})();
