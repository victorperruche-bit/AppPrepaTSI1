// correction.js — Moteur de correction des productions
// 1. Photos de cours : capture, classement, statut (à revoir / corrigé / validé)
// 2. Analyse de texte tapé : détection d'erreurs fréquentes (dyslexie + programme)
// 3. Auto-évaluation guidée : checklist de correction avant validation
// Base : self-explanation effect (Chi) + feedback immédiat (Hattie & Timperley)
const Correction = (() => {
  const STATUSES = { todo: "À revoir", review: "En correction", done: "Validé" };

  // Erreurs courantes : homophones (fréquentes en dyslexie), doublets, oublis d'accord
  const HOMOPHONES = {
    "a ": "à (préposition) ou a (verbe avoir) ?", " et ": "est (verbe être) ?",
    " ses ": "ces (démonstratif) ou c'est ?", " ou ": "où (lieu) ?",
    " ce ": "se (pronom) ?", " la ": "là (lieu) ?",
    " on ": "ont (verbe avoir) ?", " peut ": "peux / peut-être ?",
    " sens ": "sent / sans / cend", " leur ": "leurs (pluriel) ?"
  };

  const DYSLEXIA_PATTERNS = [
    { re: /\b(\w+?)\1(ing|ed|s|er)\b/i, tip: "Répétition suspecte de syllabes — relis ce mot à voix haute." },
    { re: /\b[a-z]{20,}\b/i, tip: "Mot très long : vérifie qu'il n'y a pas deux mots collés." },
    { re: /[bcdfgjklmnpqrstvwxz]{5,}/i, tip: "Suite de consonnes inhabituelle — possible inversion de lettres." }
  ];

  const MATH_WORDS = ["théorème", "démonstration", "implication", "équivalent", "convergence", "développement", "intégrale"];
  const PHYS_WORDS = ["tension", "courant", "induction", "flux", "amortissement", "oscillateur", "capacité"];

  async function addPhoto(dataUrl, subject, title) {
    const photo = {
      id: "ph_" + Date.now(),
      subject,
      title: title || "Photo du " + new Date().toLocaleDateString("fr-FR"),
      dataUrl,
      created: Date.now()
    };
    await Store.savePhoto(photo);
    Store.state.photoStatus[photo.id] = { status: "todo", note: "", corrections: [] };
    Gamify.addXp(10, "Photo de cours ajoutée");
    Gamify.checkBadges();
    Store.save();
    return photo;
  }

  function setStatus(photoId, status) {
    const p = Store.state.photoStatus[photoId];
    if (!p) return;
    p.status = status;
    if (status === "done") {
      Gamify.addXp(25, "Photo validée");
      Gamify.touchStreak();
    }
    Gamify.checkBadges();
    Store.save();
  }

  function addCorrectionNote(photoId, note) {
    const p = Store.state.photoStatus[photoId];
    if (!p) return;
    p.corrections.push({ t: Date.now(), note });
    p.status = p.status === "todo" ? "review" : p.status;
    Gamify.addXp(10, "Point d'intention ajouté");
    Store.save();
  }

  // Analyse d'un texte tapé : renvoie une liste d'observations
  function analyzeText(text) {
    const findings = [];
    for (const [frag, tip] of Object.entries(HOMOPHONES)) {
      const re = new RegExp(frag.trim().split(" ")[0] + "(?=[ ,.])", "gi");
      const matches = text.match(re);
      if (matches) {
        findings.push({ type: "homophone", word: matches[0], tip: `Homophone possible : ${tip}` });
      }
    }
    for (const p of DYSLEXIA_PATTERNS) {
      if (p.re.test(text)) findings.push({ type: "dyslexia", tip: p.tip });
    }
    const lower = text.toLowerCase();
    const domainWords = MATH_WORDS.filter((w) => lower.includes(w)).concat(PHYS_WORDS.filter((w) => lower.includes(w)));
    if (domainWords.length) {
      findings.push({ type: "domain", tip: `Termes techniques détectés : ${domainWords.join(", ")}. Assure-toi que chaque terme est défini ou justifié.` });
    }
    if (text.length > 80 && !/[.!?]/.test(text)) {
      findings.push({ type: "style", tip: "Phrases très longues sans ponctuation : coupe en phrases courtes, plus faciles à lire et relire." });
    }
    return findings;
  }

  // Checklist d'auto-correction guidée (self-explanation)
  const CHECKLIST = [
    "J'ai relu à voix haute (ou fait lire par l'app)",
    "Les unités sont indiquées (V, A, m, rad/s…)",
    "Les notations sont définies avant d'être utilisées",
    "Le résultat est cohérent avec l'ordre de grandeur attendu",
    "J'ai encadré le résultat final",
    "J'ai noté le point d'intention clé de cet exercice"
  ];

  return { addPhoto, setStatus, addCorrectionNote, analyzeText, CHECKLIST, STATUSES };
})();
