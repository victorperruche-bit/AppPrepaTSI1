// app.js — Rendu de l'interface (SPA vanilla, léger et rapide partout)
const App = (() => {
  let view = "home";       // home | subject | quiz | flashcards | exam | photos | photo | kholle | focus | search | planning | progress | settings
  let currentSubject = null;
  let currentPhoto = null;
  let photosCache = null;

  const $ = (sel) => document.querySelector(sel);
  const el = (html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); return d; };

  function init() {
    applySettings();
    registerSW();
    render();
  }

  function registerSW() {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  function applySettings() {
    const p = Store.state.profile;
    document.body.classList.toggle("dyslexia-mode", p.dyslexiaMode);
    document.documentElement.style.setProperty("--font-scale", p.fontScale);
    TTS.setEnabled(p.ttsEnabled);
  }

  let kholleTimer = null;

  // ===== Navigation =====
  function go(v, data) {
    view = v;
    if (v === "subject") currentSubject = data;
    if (v === "photo") currentPhoto = data;
    if (v === "photos") photosCache = null;
    if (v !== "kholle" && kholleTimer) { clearInterval(kholleTimer); kholleTimer = null; }
    if (v !== "focus" && Focus.state && Focus.state.running) { /* le chrono focus continue entre les vues */ }
    render();
    window.scrollTo(0, 0);
  }

  // ===== Rendu =====
  function render() {
    const main = $("#app");
    main.innerHTML = "";
    renderHeader();

    if (view === "home") main.append(homeView());
    else if (view === "subject") main.append(subjectView(currentSubject));
    else if (view === "quiz") main.append(quizView());
    else if (view === "photos") photosView().then((node) => main.append(node));
    else if (view === "photo") main.append(photoView(currentPhoto));
    else if (view === "kholle") main.append(kholleView());
    else if (view === "flashcards") main.append(flashcardsView());
    else if (view === "exam") main.append(examView());
    else if (view === "search") main.append(searchView());
    else if (view === "planning") main.append(planningView());
    else if (view === "focus") main.append(focusView());
    else if (view === "progress") main.append(progressView());
    else if (view === "settings") main.append(settingsView());

    renderTabs();
  }

  function renderHeader() {
    const lvl = Gamify.levelFromXp(Store.state.xp);
    $("#level-label").textContent = `Nv ${lvl.level + 1} · ${lvl.name}`;
    $("#streak-label").textContent = `🔥 ${Store.state.streak.count} j`;
    const dp = Gamify.dailyProgress();
    const ring = $("#goal-ring");
    ring.style.setProperty("--pct", dp.pct);
    ring.classList.toggle("done", dp.done);
    $("#goal-ring-inner").textContent = dp.done ? "✓" : dp.pct + "%";
  }

  function renderTabs() {
    const tabs = [
      { id: "home", icon: "🏠", label: "Accueil" },
      { id: "photos", icon: "📸", label: "Mes photos" },
      { id: "kholle", icon: "🎤", label: "Khôlles" },
      { id: "planning", icon: "📅", label: "Planning" },
      { id: "progress", icon: "📈", label: "Progrès" },
      { id: "settings", icon: "⚙️", label: "Réglages" }
    ];
    const nav = $("#tabs");
    nav.innerHTML = "";
    tabs.forEach((t) => {
      const b = document.createElement("button");
      b.innerHTML = `<span class="icon">${t.icon}</span><span>${t.label}</span>`;
      b.className = view === t.id || (view === "subject" && t.id === "home") || (view === "quiz" && t.id === "home") ? "active" : "";
      b.onclick = () => go(t.id);
      nav.append(b);
    });
  }

  // ===== Vues =====
  function homeView() {
    const wrap = el(`<div></div>`);
    const lvl = Gamify.levelFromXp(Store.state.xp);

    // Onboarding première utilisation (type Duolingo : 30 secondes pour bien démarrer)
    if (!Store.state.profile.onboarded) {
      const ob = el(`
        <div class="card">
          <h1>👋 Bienvenue sur PrépaHub !</h1>
          <p class="muted">30 secondes pour configurer ton espace de révision.</p>
          <label class="field-label">Ton prénom</label>
          <input type="text" id="ob-name" placeholder="Ton prénom">
          <label class="field-label">Ton objectif quotidien</label>
          <select id="ob-goal">
            <option value="30">Tranquille — 30 XP/jour</option>
            <option value="60" selected>Régulier — 60 XP/jour</option>
            <option value="100">Ambitieux — 100 XP/jour</option>
            <option value="150">Khûle — 150 XP/jour</option>
          </select>
          <button class="btn success" style="margin-top:0.9rem" id="ob-done">C'est parti ! 🚀</button>
        </div>`);
      ob.querySelector("#ob-done").onclick = () => {
        const p = Store.state.profile;
        p.name = ob.querySelector("#ob-name").value.trim() || "champion";
        p.dailyGoal = parseInt(ob.querySelector("#ob-goal").value, 10);
        p.onboarded = true;
        Store.save();
        Gamify.addXp(10, "Bienvenue");
        toast(`Bienvenue ${p.name} ! Objectif : ${p.dailyGoal} XP/jour. +10 XP de départ 🎁`);
        render();
      };
      wrap.append(ob);
      return wrap;
    }

    wrap.append(el(`
      <div class="card">
        <h1>Bonjour ${Store.state.profile.name || "👋"} ${Store.state.profile.name ? "👋" : ""}</h1>
        <p class="muted">Ta centrale de révision prépa TSI. Ajoute des photos de cours, révise avec les quiz, garde tes points d'intention.</p>
        <div class="stat-row" style="margin-top:0.8rem">
          <div class="stat-box"><div class="val">${Store.state.xp}</div><div class="label">XP total</div></div>
          <div class="stat-box"><div class="val">${Store.state.streak.count}</div><div class="label">Jours d'affilée</div></div>
          <div class="stat-box"><div class="val">${Object.keys(Store.state.photoStatus).length}</div><div class="label">Photos de cours</div></div>
        </div>
      </div>
    `));

    // Bandeau prochain événement (colle/DS) depuis le planning Google Calendar
    const nextEv = Planning.next();
    if (nextEv) {
      const u = Planning.urgency(Planning.daysUntil(nextEv.date));
      const subj = nextEv.subject ? SUBJECTS[nextEv.subject] : null;
      const banner = el(`
        <div class="card" style="cursor:pointer;border:1.5px solid ${u.color};padding:0.85rem 1rem">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem">
            <div style="flex:1">
              <span class="chip" style="color:${u.color};border-color:${u.color}">${nextEv.type === "DS" ? "📝 Prochain DS" : "🎤 Prochaine colle"} · ${u.label}</span>
              <div style="font-weight:800;margin-top:0.35rem">${subj ? subj.emoji + " " : ""}${nextEv.title}</div>
              <div class="muted" style="font-size:0.78rem">${Planning.fmtDate(nextEv.date)}</div>
            </div>
            <span style="font-size:1.3rem">📅</span>
          </div>
        </div>`);
      banner.onclick = () => go("planning");
      wrap.append(banner);
    }

    // Objectif du jour (type Duolingo)
    const dp = Gamify.dailyProgress();
    const due = Flashcards.dueCountAll();
    wrap.append(el(`
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h2>🎯 Objectif du jour</h2>
          <span class="chip">${dp.done ? "✅ Atteint !" : dp.pct + "%"}</span>
        </div>
        <div class="progress-track" style="margin:0.6rem 0"><div class="progress-fill" style="width:${dp.pct}%"></div></div>
        <p class="muted">${dp.xp} / ${dp.goal} XP aujourd'hui ${dp.done ? "— objectif atteint, bravo ! 🎉" : ""}</p>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.7rem">
          <button class="btn small" id="go-flashcards">🗂️ ${due} flashcards à revoir</button>
          <button class="btn small secondary" id="go-focus">🌲 Session de focus</button>
        </div>
      </div>
    `));
    wrap.querySelector("#go-flashcards").onclick = () => {
      const weak = Gamify.weakestSubject() || Object.keys(SUBJECTS)[0];
      Flashcards.start(weak);
    };
    wrap.querySelector("#go-focus").onclick = () => go("focus");

    const grid = el(`<div class="subject-grid"></div>`);
    Object.entries(SUBJECTS).forEach(([id, s]) => {
      const stats = Store.state.quizStats[id];
      const mastery = Mastery.subjectMastery(id);
      const card = el(`
        <button class="subject-card">
          <span class="accent-strip"></span>
          <span class="emoji">${s.emoji}</span>
          <div class="name">${s.name}</div>
          <div class="meta">${s.chapters.length} chapitres${stats ? ` · ${stats.correct}/${stats.attempts} quiz OK` : " · pas encore de quiz"}</div>
          <div class="subj-progress">
            <div class="progress-track"><div class="progress-fill" style="width:${mastery}%"></div></div>
            <span class="pct">${mastery}%</span>
          </div>
        </button>`);
      card.style.setProperty("--subj-color", s.color);
      card.onclick = () => go("subject", id);
      grid.append(card);
    });
    const sect = el(`<div><div class="section-title"><h2>Mes matières</h2></div></div>`);
    sect.append(grid);
    wrap.append(sect);

    const weak = Gamify.weakestSubject();
    wrap.append(el(`
      <div class="card">
        <h2>🎯 Révision du jour</h2>
        <p class="muted">${weak ? `Ta matière la plus faible : <strong>${SUBJECTS[weak].emoji} ${SUBJECTS[weak].name}</strong> — la pratique personnalisée cible tes points faibles (méthode Duolingo).` : "Les quiz utilisent la répétition espacée : les questions ratées reviennent plus souvent."}</p>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.6rem">
          <button class="btn" id="quick-quiz">Quiz rapide</button>
          <button class="btn secondary" id="exam-btn">📝 Test blanc</button>
          <button class="btn secondary" id="search-btn">🔍 Rechercher</button>
          ${weak ? `<button class="btn secondary" id="weak-drill">💪 Renforcer ${SUBJECTS[weak].name}</button>` : ""}
        </div>
      </div>
    `));
    const wd = wrap.querySelector("#weak-drill");
    if (wd) wd.onclick = () => { Quiz.start(weak); go("quiz"); };
    wrap.querySelector("#exam-btn").onclick = () => Exam.start();
    wrap.querySelector("#search-btn").onclick = () => go("search");
    wrap.querySelector("#quick-quiz").onclick = () => startQuickQuiz();
    return wrap;
  }

  function startQuickQuiz() {
    const subjects = Object.keys(QUIZ_BANK);
    const pick = subjects[Math.floor(Math.random() * subjects.length)];
    Quiz.start(pick);
    go("quiz");
  }

  function subjectView(subjectId) {
    const s = SUBJECTS[subjectId];
    const wrap = el(`<div></div>`);
    wrap.append(el(`
      <div class="section-title">
        <h1>${s.emoji} ${s.name}</h1>
        <button class="back-link" id="back">← Accueil</button>
      </div>`));
    wrap.querySelector("#back").onclick = () => go("home");

    s.chapters.forEach((ch) => {
      const vid = videoUrlFor(ch.id);
      const m = Mastery.chapterMastery(ch.id);
      const lb = Mastery.label(m);
      const card = el(`<div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem">
          <h3 style="flex:1">${ch.title}</h3>
          <span class="chip" style="color:${lb.color};border-color:${lb.color}">${m}% · ${lb.txt}</span>
        </div>
        <div class="progress-track" style="margin:0.5rem 0"><div class="progress-fill" style="width:${m}%"></div></div>
        ${ch.points.map((p) => `<div class="intention-point"><span class="tag">Point d'intention</span><div>${p}</div></div>`).join("")}
        ${vid ? `<a class="btn secondary small" style="display:inline-block;margin-top:0.5rem;text-decoration:none" href="${vid}" target="_blank" rel="noopener">🎬 Voir une vidéo explicative</a>` : ""}
      </div>`);
      wrap.append(card);
    });

    const actions = el(`<div class="card">
      <h3>Entraîne-toi</h3>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button class="btn" id="quiz-btn">🎯 Quiz ${s.name}</button>
        <button class="btn secondary" id="fc-btn">🗂️ Flashcards</button>
      </div>
    </div>`);
    actions.querySelector("#quiz-btn").onclick = () => { Quiz.start(subjectId); go("quiz"); };
    actions.querySelector("#fc-btn").onclick = () => Flashcards.start(subjectId);
    wrap.append(actions);

    const sm = Mastery.subjectMastery(subjectId);
    wrap.append(el(`<div class="card"><h3>📈 Maîtrise globale : ${sm}%</h3>
      <p class="muted">La maîtrise monte quand tes flashcards et quiz sont réussis dans la durée (répétition espacée).</p></div>`));

    if (VIDEO_CHANNELS[subjectId]) {
      const vids = el(`<div class="card"><h3>🎬 Chaînes vidéo recommandées</h3>
        ${VIDEO_CHANNELS[subjectId].map((c) => `<p style="margin:0.4rem 0"><a href="${c.url}" target="_blank" rel="noopener">▶️ ${c.label}</a></p>`).join("")}
        <p class="muted" style="margin-top:0.5rem">Regarde une vidéo APRÈS avoir essayé l'exercice : la vidéo consolide, elle ne remplace pas l'effort.</p></div>`);
      wrap.append(vids);
    }
    return wrap;
  }

  function quizView() {
    const wrap = el(`<div></div>`);
    const sess = Quiz.session;
    if (!sess) { wrap.append(el(`<div class="card">Aucun quiz en cours. <button class="btn secondary" id="back">Retour</button></div>`)); wrap.querySelector("#back").onclick = () => go("home"); return wrap; }

    if (sess.finished) {
      const r = sess.result;
      const msg = r.pct >= 80 ? "Excellent ! 🏆" : r.pct >= 50 ? "Bien, continue ! 💪" : "Courage : chaque erreur t'apprend quelque chose. 🌱";
      wrap.append(el(`
        <div class="card" style="text-align:center">
          <h1>${r.pct >= 70 ? "🎉" : "📝"} Quiz terminé</h1>
          <div style="font-size:2.2rem;font-weight:800;color:var(--accent)">${r.score}/${r.total}</div>
          <p>${msg}</p>
          <p class="muted" style="margin-top:0.5rem">Les questions ratées reviendront plus tôt dans tes révisions (répétition espacée).</p>
          <button class="btn success" id="again">Rejouer</button>
          <button class="btn secondary" id="home">Accueil</button>
        </div>`));
      wrap.querySelector("#again").onclick = () => { Quiz.start(r.subject); render(); };
      wrap.querySelector("#home").onclick = () => go("home");
      return wrap;
    }

    const q = sess.questions[sess.idx];
    const answered = sess.answered;
    const correct = answered && sess.chosen === q.answer;
    const card = el(`<div class="card">
      <div class="chip">Question ${sess.idx + 1}/${sess.questions.length} · ${SUBJECTS[sess.subject].name}</div>
      <h2 style="margin:0.7rem 0">${q.q}</h2>
      <div class="progress-track" style="margin-bottom:0.9rem"><div class="progress-fill" style="width:${(sess.idx / sess.questions.length) * 100}%"></div></div>
      <div id="options"></div>
      ${answered ? `
        <div class="feedback-box ${correct ? "good" : "bad"}">
          <strong>${correct ? "✅ Bravo !" : "❌ Presque…"}</strong>
          <p>${q.explain}</p>
          <button class="btn small" style="margin-top:0.5rem" id="next-btn">${sess.idx + 1 >= sess.questions.length ? "Voir le résultat →" : "Suivant →"}</button>
        </div>` : ""}
    </div>`);

    const opts = card.querySelector("#options");
    q.options.forEach((opt, i) => {
      const b = el(`<button class="quiz-option">${opt}</button>`);
      if (answered) {
        b.disabled = true;
        if (i === q.answer) b.classList.add("correct");
        else if (i === sess.chosen) b.classList.add("wrong");
      } else {
        b.onclick = () => Quiz.answer(i);
      }
      opts.append(b);
    });
    const nb = card.querySelector("#next-btn");
    if (nb) nb.onclick = () => Quiz.next();
    wrap.append(card);

    const speakBtn = el(`<button class="btn secondary small" style="margin-bottom:1rem">🔊 Lire la question</button>`);
    speakBtn.onclick = () => TTS.speak(q.q);
    wrap.prepend(speakBtn);
    return wrap;
  }

  async function photosView() {
    const wrap = el(`<div></div>`);
    wrap.append(el(`
      <div class="section-title">
        <h1>📸 Mes photos de cours</h1>
      </div>
      <div class="card">
        <p class="muted">Prends en photo un exercice, une correction, un cours de tableau. L'app les classe par matière, et tu suis leur statut : à revoir → en correction → validé.</p>
        <label class="btn" style="display:inline-block;margin-top:0.6rem">📷 Ajouter une photo<input type="file" id="photo-input" accept="image/*" capture="environment"></label>
        <div id="photo-form" class="hidden" style="margin-top:0.8rem">
          <img id="preview" style="max-width:100%;border-radius:12px;margin-bottom:0.6rem">
          <label class="field-label">Matière</label>
          <select id="photo-subject">${Object.entries(SUBJECTS).map(([id, s]) => `<option value="${id}">${s.emoji} ${s.name}</option>`).join("")}</select>
          <label class="field-label">Titre / description</label>
          <input type="text" id="photo-title" placeholder="Ex : Exercice RLC, khôlle du…">
          <button class="btn success" style="margin-top:0.7rem" id="save-photo">Enregistrer (+10 XP)</button>
        </div>
      </div>
      <div id="photo-list"></div>`));

    const input = wrap.querySelector("#photo-input");
    let pendingData = null;
    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        pendingData = e.target.result;
        wrap.querySelector("#preview").src = pendingData;
        wrap.querySelector("#photo-form").classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    };
    wrap.querySelector("#save-photo").onclick = async () => {
      if (!pendingData) return;
      const subject = wrap.querySelector("#photo-subject").value;
      const title = wrap.querySelector("#photo-title").value;
      await Correction.addPhoto(pendingData, subject, title);
      toast("Photo enregistrée ! +10 XP");
      go("photos");
    };

    const list = wrap.querySelector("#photo-list");
    const photos = await Store.getPhotos();
    photosCache = photos;
    if (!photos.length) {
      list.append(el(`<div class="card"><p class="muted">Aucune photo pour l'instant. La première vaut +10 XP 😉</p></div>`));
    } else {
      photos.sort((a, b) => b.created - a.created);
      const grid = el(`<div class="photo-grid"></div>`);
      photos.forEach((p) => {
        const st = Store.state.photoStatus[p.id] || { status: "todo" };
        const statusClass = st.status === "done" ? "done" : st.status === "review" ? "review" : "todo";
        const t = el(`<div class="photo-thumb">
          <img src="${p.dataUrl}" alt="${p.title}">
          <span class="status-badge ${statusClass}">${Correction.STATUSES[st.status]}</span>
        </div>`);
        t.onclick = () => go("photo", p);
        grid.append(t);
      });
      list.append(grid);
    }
    return wrap;
  }

  function photoView(photo) {
    const wrap = el(`<div></div>`);
    const st = Store.state.photoStatus[photo.id] || { status: "todo", corrections: [] };
    wrap.append(el(`
      <div class="section-title">
        <h1>${SUBJECTS[photo.subject].emoji} ${photo.title}</h1>
        <button class="back-link" id="back">← Photos</button>
      </div>
      <div class="card"><img src="${photo.dataUrl}" style="width:100%;border-radius:12px"></div>
      <div class="card">
        <h3>Statut : ${Correction.STATUSES[st.status]}</h3>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.6rem">
          <button class="btn small secondary" data-set="todo">À revoir</button>
          <button class="btn small secondary" data-set="review">En correction</button>
          <button class="btn small success" data-set="done">Validé (+25 XP)</button>
        </div>
      </div>
      <div class="card">
        <h3>📝 Mes notes de correction</h3>
        <p class="muted">Note ce qui faut retenir, l'erreur à ne plus refaire, le point d'intention.</p>
        <div id="corr-list"></div>
        <textarea id="corr-input" placeholder="Ex : ne pas oublier la loi des mailles avant de calculer U…"></textarea>
        <button class="btn small" style="margin-top:0.5rem" id="add-corr">Ajouter la note (+10 XP)</button>
      </div>
      <div class="card">
        <h3>✅ Checklist d'auto-correction</h3>
        ${Correction.CHECKLIST.map((c) => `<label style="display:flex;gap:0.5rem;align-items:center;margin:0.4rem 0"><input type="checkbox" class="chk"> <span>${c}</span></label>`).join("")}
      </div>`));

    wrap.querySelector("#back").onclick = () => go("photos");
    wrap.querySelectorAll("[data-set]").forEach((b) => {
      b.onclick = () => { Correction.setStatus(photo.id, b.dataset.set); toast("Statut mis à jour"); render(); };
    });

    const list = wrap.querySelector("#corr-list");
    (st.corrections || []).forEach((c) => {
      list.append(el(`<div class="intention-point"><span class="tag">Note</span><div>${escapeHtml(c.note)}</div></div>`));
    });
    wrap.querySelector("#add-corr").onclick = () => {
      const v = wrap.querySelector("#corr-input").value.trim();
      if (!v) return;
      Correction.addCorrectionNote(photo.id, v);
      toast("Note ajoutée ! +10 XP");
      render();
    };
    return wrap;
  }

  let kholleState = null;

  function kholleStart(subject) {
    const bank = KHOLLE_BANK[subject] || [];
    const q = bank[Math.floor(Math.random() * bank.length)];
    kholleState = { subject, q, seconds: 20 * 60, running: true, revealed: false, done: false };
    if (kholleTimer) clearInterval(kholleTimer);
    kholleTimer = setInterval(() => {
      if (kholleState && kholleState.running && !kholleState.done) {
        kholleState.seconds--;
        const t = document.querySelector("#kholle-chrono");
        if (t) {
          const m = Math.floor(Math.max(0, kholleState.seconds) / 60);
          const s = Math.max(0, kholleState.seconds) % 60;
          t.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
          if (kholleState.seconds <= 0) { t.style.color = "var(--danger)"; kholleState.running = false; toast("⏰ Temps écoulé ! Passe à l'auto-évaluation."); }
        }
      }
    }, 1000);
    render();
  }

  function kholleView() {
    const wrap = el(`<div></div>`);
    if (!kholleState) {
      wrap.append(el(`
        <div class="section-title"><h1>🎤 S'entraîner aux khôlles</h1></div>
        <div class="card">
          <p class="muted">Un sujet d'oral au hasard, 20 minutes de chrono, puis tu compares avec les attendus du colleur. Comme en vrai khôlle, mais sans pression.</p>
          <label class="field-label">Choisis ta matière</label>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.4rem">
            ${Object.entries(SUBJECTS).filter(([id]) => KHOLLE_BANK[id] && KHOLLE_BANK[id].length).map(([id, s]) => `<button class="btn secondary" data-kh="${id}">${s.emoji} ${s.name}</button>`).join("")}
          </div>
        </div>
        <div class="card">
          <h3>💡 Méthode de khôlle (à lire une fois)</h3>
          <div class="intention-point"><span class="tag">Réflexe 1</span><div>Annonce ton plan à voix haute avant de commencer : le prof évalue la structure autant que le contenu.</div></div>
          <div class="intention-point"><span class="tag">Réflexe 2</span><div>Écris proprement les notations et définis-les. Une notation non définie = une perte de points assurée.</div></div>
          <div class="intention-point"><span class="tag">Réflexe 3</span><div>Si tu bloques : dis ce que tu ferais (« je chercherais la limite par encadrement »). Le raisonnement compte.</div></div>
        </div>`));
      wrap.querySelectorAll("[data-kh]").forEach((b) => {
        b.onclick = () => kholleStart(b.dataset.kh);
      });
      return wrap;
    }

    const { subject, q, seconds, running, revealed, done } = kholleState;
    const m = Math.floor(Math.max(0, seconds) / 60), s = Math.max(0, seconds) % 60;
    const vid = videoUrlFor(q.chapter);

    const card = el(`<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem">
        <div class="chip">${SUBJECTS[subject].emoji} ${SUBJECTS[subject].name} · ${q.chapter}</div>
        <div style="font-size:1.4rem;font-weight:800" id="kholle-chrono">${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}</div>
      </div>
      <h2 style="margin:0.8rem 0">${q.prompt}</h2>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button class="btn small secondary" id="kh-pause">${running ? "⏸ Pause" : "▶️ Reprendre"}</button>
        <button class="btn small" id="kh-reveal">👀 Voir les attendus</button>
        <button class="btn small danger" id="kh-skip">Autre sujet</button>
      </div>
      <div id="kh-reveal-zone"></div>
      <div id="kh-eval-zone"></div>
    </div>`);

    card.querySelector("#kh-pause").onclick = () => { kholleState.running = !kholleState.running; render(); };
    card.querySelector("#kh-skip").onclick = () => kholleStart(subject);
    card.querySelector("#kh-reveal").onclick = () => {
      kholleState.revealed = true;
      const zone = card.querySelector("#kh-reveal-zone");
      zone.innerHTML = `
        <h3 style="margin-top:1rem">✅ Ce que le colleur attend</h3>
        ${q.expected.map((e) => `<div class="intention-point"><span class="tag">Attendu</span><div>${e}</div></div>`).join("")}
        <h3 style="margin-top:0.8rem">💡 Réflexes de khôlleux</h3>
        ${q.tips.map((t) => `<div class="intention-point"><span class="tag">Tip</span><div>${t}</div></div>`).join("")}
        ${vid ? `<a class="btn secondary small" style="display:inline-block;margin-top:0.6rem;text-decoration:none" href="${vid}" target="_blank" rel="noopener">🎬 Vidéo pour approfondir ce chapitre</a>` : ""}
        <h3 style="margin-top:1rem">Auto-évaluation (comme une vraie note de khôlle)</h3>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
          ${[1, 2, 3, 4, 5].map((n) => `<button class="btn small secondary" data-note="${n}">${n}/5</button>`).join("")}
        </div>
        <p class="muted" style="margin-top:0.4rem">5 = exposé impeccable · 3 = correct avec aides · 1 = pas réussi</p>`;
      zone.querySelectorAll("[data-note]").forEach((b) => {
        b.onclick = () => {
          const note = parseInt(b.dataset.note, 10);
          SRS.review(q.id, note);
          Gamify.addXp(note >= 3 ? 30 : 10, "Khôlle faite");
          Gamify.touchStreak();
          Gamify.checkBadges();
          Store.save();
          toast(note >= 4 ? "🎉 Excellente khôlle ! +30 XP" : "Khôlle enregistrée. Les points faibles reviendront !");
          if (note >= 4) App.confetti();
          kholleState = null;
          if (kholleTimer) { clearInterval(kholleTimer); kholleTimer = null; }
          go("kholle");
        };
      });
      TTS.speak("Voici les attendus du colleur.");
    };
    wrap.append(card);
    return wrap;
  }

  function flashcardsView() {
    const wrap = el(`<div></div>`);
    const sess = Flashcards.session;
    if (!sess) { go("home"); return el("<div></div>"); }

    if (sess.finished) {
      const st = sess.stats;
      wrap.append(el(`
        <div class="card" style="text-align:center">
          <h1>🗂️ Paquet terminé !</h1>
          <div style="font-size:1.1rem;margin:0.7rem 0">
            ✅ Correct : ${st.good + st.easy} · 😅 Difficile : ${st.hard} · 🔁 À revoir : ${st.again}
          </div>
          <p class="muted">Les cartes « À revoir » reviendront demain — c'est exactement le principe de la répétition espacée.</p>
          <button class="btn success" id="fc-again">Refaire un paquet</button>
          <button class="btn secondary" id="fc-home">Accueil</button>
        </div>`));
      wrap.querySelector("#fc-again").onclick = () => Flashcards.start(sess.subject);
      wrap.querySelector("#fc-home").onclick = () => go("home");
      return wrap;
    }

    const c = sess.queue[sess.idx];
    const card = el(`<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="chip">${SUBJECTS[sess.subject].emoji} ${SUBJECTS[sess.subject].name}</div>
        <span class="muted">${sess.idx + 1}/${sess.queue.length}</span>
      </div>
      <div class="flashcard" id="fc-card" style="cursor:pointer;margin:1rem 0;padding:1.2rem;background:var(--surface-2);border:2px solid rgba(255,255,255,0.14);border-radius:16px;min-height:120px;display:flex;align-items:center;justify-content:center;text-align:center">
        <div>${c.front}</div>
      </div>
      ${sess.flipped ? `
        <div class="intention-point"><span class="tag">Réponse</span><div>${c.back}</div></div>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.8rem">
          <button class="btn small danger" data-g="1">🔁 À revoir</button>
          <button class="btn small" data-g="2" style="background:#e67e22">😅 Difficile</button>
          <button class="btn small success" data-g="3">✅ Correct</button>
          <button class="btn small" data-g="4" style="background:#3498db">⚡ Facile</button>
        </div>` : `
        <button class="btn" id="fc-flip">Retourner la carte 👆</button>`}
    </div>`);

    card.querySelector("#fc-card").onclick = () => { if (!sess.flipped) Flashcards.flip(); };
    const flipBtn = card.querySelector("#fc-flip");
    if (flipBtn) flipBtn.onclick = () => Flashcards.flip();
    card.querySelectorAll("[data-g]").forEach((b) => {
      b.onclick = () => Flashcards.grade(parseInt(b.dataset.g, 10));
    });
    wrap.append(card);
    const speakBtn = el(`<button class="btn secondary small" style="margin-bottom:1rem">🔊 Lire</button>`);
    speakBtn.onclick = () => TTS.speak(sess.flipped ? c.back : c.front);
    wrap.prepend(speakBtn);
    return wrap;
  }

  function focusView() {
    const wrap = el(`<div></div>`);
    const st = Focus.state;
    if (!st) {
      wrap.append(el(`
        <div class="section-title"><h1>🌲 Session de focus</h1><button class="back-link" id="back">← Accueil</button></div>
        <div class="card">
          <p class="muted">Pomodoro : un temps de travail sans distraction, récompensé en XP. Choisis ta durée, mets le téléphone en mode avion si possible, et travaille dans le vide. 🚫📱</p>
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.8rem">
            <button class="btn" data-min="25">⏱️ 25 min (+100 XP)</button>
            <button class="btn secondary" data-min="15">🧠 15 min (+60 XP)</button>
            <button class="btn secondary" data-min="50">💪 50 min (+200 XP)</button>
          </div>
        </div>`));
      wrap.querySelector("#back").onclick = () => go("home");
      wrap.querySelectorAll("[data-min]").forEach((b) => {
        b.onclick = () => Focus.start(parseInt(b.dataset.min, 10));
      });
      return wrap;
    }
    const m = Math.floor(st.left / 60), s = st.left % 60;
    wrap.append(el(`
      <div class="section-title"><h1>🌲 Concentration</h1><button class="back-link" id="back">← Accueil</button></div>
      <div class="card" style="text-align:center">
        <div id="focus-chrono" style="font-size:3rem;font-weight:800;color:var(--accent)">${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}</div>
        <p class="muted">${st.running ? "Concentration maximale 💪" : "En pause ⏸"}</p>
        <div style="display:flex;gap:0.5rem;justify-content:center;margin-top:0.8rem">
          <button class="btn secondary" id="f-pause">${st.running ? "⏸ Pause" : "▶️ Reprendre"}</button>
          <button class="btn danger" id="f-stop">Arrêter</button>
        </div>
      </div>`));
    wrap.querySelector("#back").onclick = () => go("home");
    wrap.querySelector("#f-pause").onclick = () => Focus.pause();
    wrap.querySelector("#f-stop").onclick = () => Focus.reset();
    return wrap;
  }

  function examView() {
    const wrap = el(`<div></div>`);
    const sess = Exam.session;
    if (!sess) { go("home"); return el("<div></div>"); }

    if (sess.finished) {
      const total = sess.questions.length;
      const note = Math.round((sess.correct / total) * 20);
      const diag = Object.entries(sess.perSubject).map(([sid, ps]) => {
        const rate = Math.round((ps.correct / ps.total) * 100);
        const col = rate >= 70 ? "var(--success)" : rate >= 40 ? "var(--accent)" : "var(--danger)";
        return `<div style="display:flex;justify-content:space-between;margin:0.4rem 0;font-size:0.9rem">
          <span>${SUBJECTS[sid].emoji} ${SUBJECTS[sid].name}</span>
          <strong style="color:${col}">${ps.correct}/${ps.total} (${rate}%)</strong></div>`;
      }).join("");
      wrap.append(el(`
        <div class="card" style="text-align:center">
          <h1>📝 Test blanc corrigé</h1>
          <div style="font-size:2.4rem;font-weight:800;color:${note >= 10 ? "var(--success)" : "var(--danger)"}">${note}/20</div>
          <p class="muted">${note >= 16 ? "Excellent niveau, garde le rythme ! 🏆" : note >= 10 ? "Base solide — cible les matières en rouge ci-dessous. 💪" : "Courage : refais les flashcards des matières faibles, puis retente. 🌱"}</p>
        </div>
        <div class="card"><h3>Diagnostic par matière</h3>${diag}</div>
        <div class="card">
          <button class="btn success" id="exam-again">Refaire un test blanc</button>
          <button class="btn secondary" id="exam-home">Accueil</button>
        </div>`));
      wrap.querySelector("#exam-again").onclick = () => Exam.start();
      wrap.querySelector("#exam-home").onclick = () => go("home");
      return wrap;
    }

    const q = sess.questions[sess.idx];
    const m = Math.floor(Math.max(0, sess.left) / 60), s = Math.max(0, sess.left) % 60;
    const card = el(`<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="chip">Question ${sess.idx + 1}/${sess.questions.length}</div>
        <div id="exam-chrono" style="font-size:1.2rem;font-weight:800;color:var(--accent)">${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}</div>
      </div>
      <h2 style="margin:0.7rem 0">${q.q}</h2>
      <div id="exam-options"></div>
      <div id="exam-feedback"></div>
    </div>`);
    const opts = card.querySelector("#exam-options");
    q.options.forEach((opt, i) => {
      const b = el(`<button class="quiz-option">${opt}</button>`);
      b.onclick = () => Exam.answer(i);
      opts.append(b);
    });
    wrap.append(card);
    return wrap;
  }

  function renderExamFeedback(q, ok, chosenIdx) {
    const zone = document.querySelector("#exam-feedback");
    if (!zone) return;
    document.querySelectorAll("#exam-options .quiz-option").forEach((o, j) => {
      o.disabled = true;
      if (j === q.answer) o.classList.add("correct");
      else if (j === chosenIdx) o.classList.add("wrong");
    });
    zone.innerHTML = `<div class="feedback-box ${ok ? "good" : "bad"}">
      <strong>${ok ? "✅" : "❌"}</strong>
      <p>${q.explain}</p>
      <button class="btn small" style="margin-top:0.5rem" id="exam-next">${Exam.session.idx + 1 >= Exam.session.questions.length ? "Voir le résultat →" : "Suivant →"}</button>
    </div>`;
    zone.querySelector("#exam-next").onclick = () => Exam.next();
  }

  function searchView() {
    const wrap = el(`<div>
      <div class="section-title"><h1>🔍 Rechercher</h1><button class="back-link" id="back">← Accueil</button></div>
      <div class="card">
        <input type="text" id="search-input" placeholder="Ex : théorème du rang, Lenz, anaphore…">
        <p class="muted" style="margin-top:0.5rem">Cherche dans tous les points d'intention, les quiz et les sujets de khôlle.</p>
        <div id="search-results"></div>
      </div>
    </div>`);
    wrap.querySelector("#back").onclick = () => go("home");
    const input = wrap.querySelector("#search-input");
    const results = wrap.querySelector("#search-results");
    input.oninput = () => {
      const q = input.value.trim().toLowerCase();
      results.innerHTML = "";
      if (q.length < 2) return;
      let count = 0;
      Object.entries(SUBJECTS).forEach(([sid, sub]) => {
        sub.chapters.forEach((ch) => {
          ch.points.forEach((p) => {
            if (p.toLowerCase().includes(q) || ch.title.toLowerCase().includes(q)) {
              count++;
              results.append(el(`<div class="intention-point" style="cursor:pointer" data-subject="${sid}"><span class="tag">${sub.emoji} ${sub.name} · ${ch.title}</span><div>${p}</div></div>`));
            }
          });
        });
      });
      Object.entries(QUIZ_BANK).forEach(([sid, bank]) => {
        bank.forEach((qq) => {
          if (qq.q.toLowerCase().includes(q)) {
            count++;
            results.append(el(`<div class="intention-point" style="cursor:pointer" data-subject="${sid}"><span class="tag">${SUBJECTS[sid].emoji} Quiz</span><div>${qq.q}</div></div>`));
          }
        });
      });
      Object.entries(KHOLLE_BANK).forEach(([sid, bank]) => {
        bank.forEach((k) => {
          if (k.prompt.toLowerCase().includes(q)) {
            count++;
            results.append(el(`<div class="intention-point" style="cursor:pointer" data-subject="${sid}"><span class="tag">${SUBJECTS[sid].emoji} Sujet de khôlle</span><div>${k.prompt}</div></div>`));
          }
        });
      });
      if (!count) results.append(el(`<p class="muted">Aucun résultat pour « ${escapeHtml(input.value)} ». Essaie un autre mot-clé.</p>`));
      results.querySelectorAll("[data-subject]").forEach((r) => {
        r.onclick = () => go("subject", r.dataset.subject);
      });
    };
    return wrap;
  }

  function planningView() {
    const wrap = el(`<div></div>`);
    const next = Planning.next();
    wrap.append(el(`<div class="section-title"><h1>📅 Colles & DS</h1></div>`));

    if (!next) {
      wrap.append(el(`<div class="card"><p class="muted">Aucune colle ni DS à venir dans le planning. Profites pour prendre de l'avance ! 💪</p></div>`));
      return wrap;
    }

    // Prochain événement mis en avant
    const u0 = Planning.urgency(Planning.daysUntil(next.date));
    const subj0 = next.subject ? SUBJECTS[next.subject] : null;
    wrap.append(el(`
      <div class="card" style="border:1.5px solid ${u0.color}">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.6rem">
          <div>
            <span class="chip" style="color:${u0.color};border-color:${u0.color}">${next.type === "DS" ? "📝 DS" : "🎤 Colle"} · ${u0.label}</span>
            <h2 style="margin-top:0.5rem">${subj0 ? subj0.emoji + " " : ""}${next.title}</h2>
            <p class="muted" style="margin-top:0.3rem">${Planning.fmtDate(next.date)}${next.salle ? " · " + next.salle : ""}</p>
          </div>
        </div>
        ${next.subject ? `
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.8rem">
          <button class="btn small" id="plan-revise">🎯 Réviser ${subj0.name}</button>
          <button class="btn small secondary" id="plan-kholle">🎤 S'y entraîner (khôlle blanche)</button>
        </div>` : ""}
      </div>`));
    const pr = wrap.querySelector("#plan-revise");
    if (pr) pr.onclick = () => go("subject", next.subject);
    const pk = wrap.querySelector("#plan-kholle");
    if (pk) pk.onclick = () => go("kholle");

    // Liste des prochains événements
    const list = Planning.upcoming().slice(1, 15);
    const listCard = el(`<div class="card"><h3>Ensuite</h3><div id="plan-list"></div></div>`);
    const cont = listCard.querySelector("#plan-list");
    if (!list.length) {
      cont.append(el(`<p class="muted">Rien d'autre de programmé pour l'instant.</p>`));
    }
    list.forEach((e) => {
      const u = Planning.urgency(Planning.daysUntil(e.date));
      const subj = e.subject ? SUBJECTS[e.subject] : null;
      const row = el(`
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.6rem;padding:0.65rem 0;border-bottom:1px solid var(--border);cursor:pointer">
          <div style="flex:1">
            <div style="font-weight:700;font-size:0.92rem">${subj ? subj.emoji + " " : ""}${e.title}</div>
            <div class="muted" style="font-size:0.78rem">${Planning.fmtDate(e.date)}${e.salle ? " · " + e.salle : ""}</div>
          </div>
          <span class="chip" style="color:${u.color};border-color:${u.color};flex-shrink:0">${e.type === "DS" ? "DS " : ""}${u.label}</span>
        </div>`);
      if (e.subject) row.onclick = () => go("subject", e.subject);
      cont.append(row);
    });
    wrap.append(listCard);

    wrap.append(el(`
      <div class="card">
        <h3>💡 Stratégie de révision</h3>
        <div class="intention-point"><span class="tag">J-7 → J-3</span><div>Flashcards + quiz quotidiens sur la matière : la répétition espacée fait le travail.</div></div>
        <div class="intention-point"><span class="tag">J-3 → J-1</span><div>Khôlles blanches chronométrées dans l'app + relecture de tes photos de cours validées.</div></div>
        <div class="intention-point"><span class="tag">Veille du DS</span><div>Un test blanc complet, puis une session de focus 25 min. Pas de nouveauté : uniquement de la consolidation.</div></div>
      </div>`));
    return wrap;
  }

  function progressView() {
    const wrap = el(`<div></div>`);
    wrap.append(el(`<h1>📈 Mon évolution</h1>`));

    const statsCard = el(`<div class="card">
      <div class="stat-row">
        <div class="stat-box"><div class="val">${Store.state.xp}</div><div class="label">XP</div></div>
        <div class="stat-box"><div class="val">${Store.state.streak.count}</div><div class="label">Série (jours)</div></div>
        <div class="stat-box"><div class="val">${Store.state.badges.length}</div><div class="label">Badges</div></div>
      </div>
    </div>`);
    wrap.append(statsCard);

    // XP des 7 derniers jours (graphique en barres, type Duolingo)
    const week = Gamify.weeklyXp();
    const max = Math.max(20, ...week.map((d) => d.xp));
    const weekCard = el(`<div class="card">
      <h3>📅 Cette semaine</h3>
      <div style="display:flex;align-items:flex-end;gap:6px;height:110px;margin-top:0.6rem">
        ${week.map((d) => `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end">
            <span style="font-size:0.62rem;color:var(--text-dim)">${d.xp > 0 ? d.xp : ""}</span>
            <div style="width:100%;border-radius:6px 6px 0 0;background:${d.xp > 0 ? "linear-gradient(180deg, var(--accent), var(--primary))" : "rgba(255,255,255,0.08)"};height:${Math.max(4, (d.xp / max) * 80)}px"></div>
            <span style="font-size:0.62rem;color:var(--text-dim)">${d.label}</span>
          </div>`).join("")}
      </div>
      <p class="muted" style="margin-top:0.5rem">${week.filter((d) => d.xp > 0).length}/7 jours actifs — vise 7/7 !</p>
    </div>`);
    wrap.append(weekCard);

    const perSubject = el(`<div class="card"><h3>Réussite par matière</h3><div id="subj-stats"></div></div>`);
    const cont = perSubject.querySelector("#subj-stats");
    Object.entries(SUBJECTS).forEach(([id, s]) => {
      const q = Store.state.quizStats[id];
      const pct = q && q.attempts ? Math.round((q.correct / q.attempts) * 100) : 0;
      cont.append(el(`
        <div style="margin:0.6rem 0">
          <div style="display:flex;justify-content:space-between;font-size:0.85rem">
            <span>${s.emoji} ${s.name}</span><span class="muted">${q ? `${q.correct}/${q.attempts} (${pct}%)` : "pas encore de quiz"}</span>
          </div>
          <div class="progress-track" style="margin-top:0.25rem"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>`));
    });
    wrap.append(perSubject);

    const badges = el(`<div class="card"><h3>🏅 Badges</h3><div class="badge-grid"></div></div>`);
    const bg = badges.querySelector(".badge-grid");
    Gamify.BADGES.forEach((b) => {
      const owned = Store.state.badges.includes(b.id);
      bg.append(el(`<div class="badge-item ${owned ? "" : "locked"}"><span>${b.icon}</span>${b.label}</div>`));
    });
    wrap.append(badges);

    const log = Store.state.activityLog.slice(0, 12);
    if (log.length) {
      const logCard = el(`<div class="card"><h3>🕒 Activité récente</h3>${log.map((l) => `<p class="muted" style="margin:0.3rem 0">${new Date(l.t).toLocaleDateString("fr-FR")} · +${l.amount} XP · ${l.reason}</p>`).join("")}</div>`);
      wrap.append(logCard);
    }
    return wrap;
  }

  function settingsView() {
    const p = Store.state.profile;
    const wrap = el(`<div>
      <h1>⚙️ Réglages</h1>
      <div class="card">
        <div class="setting-row">
          <div><strong>Mode dyslexie</strong><p class="muted">Police adaptée, interlignage large, espacement des lettres.</p></div>
          <label class="switch"><input type="checkbox" id="set-dys" ${p.dyslexiaMode ? "checked" : ""}><span class="slider"></span></label>
        </div>
        <div class="setting-row">
          <div><strong>Lecture à voix haute</strong><p class="muted">L'app lit les questions et les feedbacks (double canal visuel + auditif).</p></div>
          <label class="switch"><input type="checkbox" id="set-tts" ${p.ttsEnabled ? "checked" : ""}><span class="slider"></span></label>
        </div>
        <div class="setting-row">
          <div><strong>Taille du texte</strong><p class="muted">Agrandis si tu lis mieux en grand.</p></div>
          <div><button class="btn small secondary" id="font-minus">A−</button> <button class="btn small secondary" id="font-plus">A+</button></div>
        </div>
        <div class="setting-row">
          <div><strong>Objectif quotidien</strong><p class="muted">L'XP à viser chaque jour (méthode Duolingo : petit mais chaque jour).</p></div>
          <select id="set-goal" style="width:auto">
            ${[30, 60, 100, 150].map((g) => `<option value="${g}" ${p.dailyGoal === g ? "selected" : ""}>${g} XP/jour</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="card">
        <h3>💾 Sauvegarde de mes données</h3>
        <p class="muted">Tes données restent sur cet appareil. Exporte un fichier de sauvegarde pour ne rien perdre (ou transférer sur un autre appareil).</p>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.6rem">
          <button class="btn small" id="export-btn">⬇️ Exporter ma sauvegarde</button>
          <label class="btn small secondary" style="display:inline-block">⬆️ Importer une sauvegarde<input type="file" id="import-input" accept="application/json" style="display:none"></label>
        </div>
      </div>
      <div class="card">
        <h3>À propos des méthodes</h3>
        <p class="muted">Cette app s'appuie sur : répétition espacée (Ebbinghaus, SM-2), retrieval practice ("Make It Stick", Brown/Roediger/McDaniel), feedback immédiat (Hattie & Timperley), double codage visuel + auditif (Paivio), et recommandations typographiques pour la dyslexie (British Dyslexia Association).</p>
      </div>
      <div class="card">
        <button class="btn danger small" id="reset-all">⚠️ Réinitialiser toutes mes données</button>
      </div>
    </div>`);

    wrap.querySelector("#set-dys").onchange = (e) => { Store.state.profile.dyslexiaMode = e.target.checked; Store.save(); applySettings(); };
    wrap.querySelector("#set-tts").onchange = (e) => { Store.state.profile.ttsEnabled = e.target.checked; Store.save(); applySettings(); };
    wrap.querySelector("#font-plus").onclick = () => { p.fontScale = Math.min(1.4, p.fontScale + 0.08); Store.save(); applySettings(); };
    wrap.querySelector("#font-minus").onclick = () => { p.fontScale = Math.max(0.9, p.fontScale - 0.08); Store.save(); applySettings(); };
    wrap.querySelector("#set-goal").onchange = (e) => { p.dailyGoal = parseInt(e.target.value, 10); Store.save(); toast("Objectif quotidien mis à jour !"); };
    wrap.querySelector("#export-btn").onclick = async () => { await Store.exportBackup(); toast("Sauvegarde exportée 💾"); };
    wrap.querySelector("#import-input").onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          await Store.importBackup(ev.target.result);
          toast("Sauvegarde restaurée ✅");
          applySettings();
          render();
        } catch (err) {
          toast("Fichier invalide ❌");
        }
      };
      reader.readAsText(file);
    };
    wrap.querySelector("#reset-all").onclick = () => {
      if (confirm("Tout effacer ? XP, badges, photos, statistiques. Irréversible.")) { Store.reset(); go("home"); }
    };
    return wrap;
  }

  // ===== Utilitaires =====
  function escapeHtml(s) { return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  function confetti() {
    const c = $("#confetti");
    const colors = ["#6c5ce7", "#ffd166", "#2ecc71", "#ff6b6b", "#4fc3f7"];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement("div");
      p.style.cssText = `position:absolute;width:8px;height:8px;left:50%;top:40%;background:${colors[i % colors.length]};border-radius:${Math.random() > 0.5 ? "50%" : "2px"};transition:all 1.2s ease-out;opacity:1;`;
      c.append(p);
      requestAnimationFrame(() => {
        p.style.transform = `translate(${(Math.random() - 0.5) * 600}px, ${Math.random() * 500 + 100}px) rotate(${Math.random() * 720}deg)`;
        p.style.opacity = "0";
      });
      setTimeout(() => p.remove(), 1400);
    }
  }

  return { init, render, go, toast, confetti, renderExamFeedback };
})();

window.addEventListener("DOMContentLoaded", App.init);
