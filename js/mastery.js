// mastery.js — Niveau de maîtrise par chapitre (type Khan Academy)
// Combine la maturité des cartes SRS du chapitre (points d'intention + quiz + flashcards).
// 0-39 : À apprendre · 40-69 : En cours · 70-89 : Presque maîtrisé · 90+ : Maîtrisé
const Mastery = (() => {
  function cardIdsForChapter(chapterId) {
    const ids = [];
    Object.values(SUBJECTS).forEach((sub) => {
      sub.chapters.forEach((ch) => {
        if (ch.id === chapterId) ch.points.forEach((_, i) => ids.push(`fc_${ch.id}_${i}`));
      });
    });
    Object.values(QUIZ_BANK).forEach((bank) => {
      bank.forEach((q) => { if (q.chapter === chapterId) ids.push(q.id, `fcq_${q.id}`); });
    });
    return ids;
  }

  function cardMaturity(card) {
    if (!card) return 0;
    const easeScore = ((card.ease - 1.3) / 1.5) * 50;           // 0-50
    const intervalScore = Math.min(50, card.interval * 2);       // 0-50
    return Math.max(0, Math.min(100, easeScore + intervalScore));
  }

  function chapterMastery(chapterId) {
    const ids = cardIdsForChapter(chapterId);
    if (!ids.length) return 0;
    const total = ids.reduce((sum, id) => sum + cardMaturity(Store.state.srs[id]), 0);
    return Math.round(total / ids.length);
  }

  function subjectMastery(subjectId) {
    const sub = SUBJECTS[subjectId];
    if (!sub) return 0;
    const vals = sub.chapters.map((ch) => chapterMastery(ch.id));
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  function label(m) {
    if (m >= 90) return { txt: "Maîtrisé", color: "var(--success)" };
    if (m >= 70) return { txt: "Presque maîtrisé", color: "#a5d6a7" };
    if (m >= 40) return { txt: "En cours", color: "var(--accent)" };
    return { txt: "À apprendre", color: "var(--danger)" };
  }

  return { chapterMastery, subjectMastery, label };
})();
