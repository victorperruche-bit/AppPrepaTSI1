// focus.js — Minuteur de concentration Pomodoro (type Forest)
// 25 min de travail = XP de focus. La méthode Pomodoro réduit la procrastination
// et les sessions courtes collent à la capacité d'attention (études sur l'attention).
const Focus = (() => {
  let timer = null;
  let state = null;

  const DURATIONS = { 25: 25 * 60, 15: 15 * 60, 50: 50 * 60 };

  function start(minutes) {
    stop();
    state = { total: DURATIONS[minutes] || 25 * 60, left: DURATIONS[minutes] || 25 * 60, running: true, done: false };
    timer = setInterval(() => {
      if (!state.running) return;
      state.left--;
      const t = document.querySelector("#focus-chrono");
      if (t) {
        const m = Math.floor(state.left / 60), s = state.left % 60;
        t.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
      }
      if (state.left <= 0) {
        state.done = true;
        stop();
        const xp = Math.round(state.total / 60) * 4;
        Gamify.addXp(xp, `Session de focus ${state.total / 60} min`);
        Gamify.touchStreak();
        Gamify.checkBadges();
        Store.save();
        App.toast(`🌲 Session terminée ! +${xp} XP de focus`);
        App.confetti();
        App.render();
      }
    }, 1000);
    App.render();
  }

  function pause() { if (state) { state.running = !state.running; App.render(); } }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function reset() { stop(); state = null; App.render(); }

  return { start, pause, reset, get state() { return state; } };
})();
