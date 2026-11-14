// gamify.js — XP, niveaux, série de jours, badges
// Inspiré de : Werbach & Hunter, "For the Win" (gamification) et
// le modèle de motivation SDT de Decy & Ryan (autonomie, compétence, progression visible).
const Gamify = (() => {
  const LEVELS = [0, 100, 250, 500, 850, 1300, 1900, 2600, 3500, 4600, 6000];
  const LEVEL_NAMES = [
    "Débutant", "Apprenti", "Curieux", "Assidu", "Constant",
    "Solide", "Costaud", "Vétéran", "Élite", "Machine de prépa"
  ];

  const BADGES = [
    { id: "first_quiz", icon: "🎯", label: "Premier quiz réussi", check: (s) => Object.values(s.quizStats).some((q) => q.correct > 0) },
    { id: "streak_3", icon: "🔥", label: "3 jours d'affilée", check: (s) => s.streak.count >= 3 },
    { id: "streak_7", icon: "⚡", label: "7 jours d'affilée", check: (s) => s.streak.count >= 7 },
    { id: "photo_5", icon: "📸", label: "5 photos de cours", check: (s) => Object.keys(s.photoStatus).length >= 5 },
    { id: "photo_20", icon: "🗂️", label: "20 photos de cours", check: (s) => Object.keys(s.photoStatus).length >= 20 },
    { id: "xp_500", icon: "🏅", label: "500 XP", check: (s) => s.xp >= 500 },
    { id: "xp_2000", icon: "👑", label: "2000 XP", check: (s) => s.xp >= 2000 },
    { id: "all_subjects", icon: "🎓", label: "Toutes les matières touchées", check: (s) => Object.keys(s.quizStats).length >= 5 }
  ];

  function levelFromXp(xp) {
    let lvl = 0;
    for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i]) lvl = i;
    const next = LEVELS[lvl + 1] ?? null;
    const base = LEVELS[lvl];
    const pct = next ? Math.min(100, Math.round(((xp - base) / (next - base)) * 100)) : 100;
    return { level: lvl, name: LEVEL_NAMES[Math.min(lvl, LEVEL_NAMES.length - 1)], pct, next };
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function touchStreak() {
    const s = Store.state;
    const t = today();
    if (s.streak.lastDay === t) return false;
    const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    s.streak.count = s.streak.lastDay === yest ? s.streak.count + 1 : 1;
    s.streak.lastDay = t;
    return true;
  }

  function addXp(amount, reason) {
    const s = Store.state;
    const before = levelFromXp(s.xp).level;
    s.xp += amount;
    const after = levelFromXp(s.xp).level;
    s.activityLog.unshift({ t: Date.now(), amount, reason });
    if (s.activityLog.length > 60) s.activityLog.length = 60;
    Store.save();
    if (after > before) {
      App.toast(`🎉 Niveau ${after + 1} atteint : ${LEVEL_NAMES[Math.min(after, LEVEL_NAMES.length - 1)]} !`);
      App.confetti();
    }
    return { leveledUp: after > before, level: after };
  }

  function checkBadges() {
    const s = Store.state;
    const newly = BADGES.filter((b) => !s.badges.includes(b.id) && b.check(s));
    if (newly.length) {
      s.badges.push(...newly.map((b) => b.id));
      Store.save();
      newly.forEach((b) => App.toast(`${b.icon} Badge débloqué : ${b.label}`));
    }
    return newly;
  }

  return { levelFromXp, touchStreak, addXp, checkBadges, BADGES, today };
})();
