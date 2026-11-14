// srs.js — Répétition espacée (version simplifiée de SM-2, Ebbinghaus)
// Chaque carte est notée 0 (raté) à 5 (parfait). L'intervalle de révision
// augmente quand tu réussis, revient à 1 jour sinon.
const SRS = (() => {
  function getCard(id) {
    const s = Store.state.srs;
    if (!s[id]) s[id] = { ease: 2.5, interval: 0, due: Date.now(), reps: 0 };
    return s[id];
  }

  function review(id, quality) {
    const card = getCard(id);
    card.reps += 1;
    if (quality < 3) {
      card.interval = 1;
      card.ease = Math.max(1.3, card.ease - 0.2);
    } else {
      card.ease = Math.min(2.8, card.ease + (quality >= 5 ? 0.12 : 0.02));
      if (card.reps === 1) card.interval = 1;
      else if (card.reps === 2) card.interval = 3;
      else card.interval = Math.round(card.interval * card.ease);
      card.interval = Math.min(card.interval, 120);
    }
    card.due = Date.now() + card.interval * 86400000;
    Store.save();
    return card;
  }

  function isDue(id) {
    const c = Store.state.srs[id];
    return !c || c.due <= Date.now();
  }

  function dueCards(ids) {
    return ids.filter(isDue);
  }

  function daysUntil(id) {
    const c = Store.state.srs[id];
    if (!c) return 0;
    return Math.max(0, Math.ceil((c.due - Date.now()) / 86400000));
  }

  return { review, isDue, dueCards, daysUntil };
})();
