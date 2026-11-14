// tts.js — Synthèse vocale (lecture à voix haute), support dyslexie
// La modalité auditive double le canal visuel : principe du "dual coding" (Paivio).
const TTS = (() => {
  let enabled = false;

  function speak(text) {
    if (!enabled || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.rate = 0.95;
    speechSynthesis.speak(u);
  }

  function stop() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  function setEnabled(v) {
    enabled = v;
    if (!v) stop();
  }

  return { speak, stop, setEnabled, get enabled() { return enabled; } };
})();
