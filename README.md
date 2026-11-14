# 🎓 PrépaHub — Ta plateforme de révision prépa TSI

Web app (PWA) installable sur **iPhone** et sur **ordinateur**, pensée pour centraliser tes cours, te préparer aux khôlles et suivre ton niveau — avec un mode adapté à la **dyslexie**.

## Fonctionnalités

- **📚 5 matières prépa TSI** : Maths, Physique, Sciences Industrielles, Français, Anglais — chapitres clés avec **points d'intention** (les réflexes à retenir)
- **📸 Photos de cours** : prends en photo un exercice ou un cours, classe-le par matière, suis son statut (À revoir → En correction → Validé), ajoute des notes de correction
- **🎯 Quiz avec répétition espacée** : les questions ratées reviennent plus souvent (algorithme inspiré de SM-2 / Ebbinghaus)
- **🎤 Espace khôlles** : sujet d'oral au hasard par matière, chrono 20 min, attendus du colleur, réflexes de khôlleux, auto-évaluation notée sur 5
- **📈 Suivi de progression** : XP, niveaux, série de jours (streak), badges, réussite par matière
- **🎬 Vidéos** : liens vers des chaînes de référence (El Ji, MicroMaths, ScienceClic, Méthode Physique) + recherche ciblée par chapitre
- **♿ Mode dyslexie** : police adaptée, interlignage large, espacement des lettres, taille de texte réglable, **lecture à voix haute** (double canal visuel + auditif)

## Installation

### Sur iPhone (Safari)
1. Héberge le dossier (GitHub Pages, ou n'importe quel hébergement statique)
2. Ouvre l'URL dans Safari → bouton Partager → **« Sur l'écran d'accueil »**
3. L'app s'installe comme une vraie application, plein écran, avec icône

### Sur ordinateur
- Ouvre l'URL dans Chrome/Edge → icône d'installation dans la barre d'adresse
- Ou ouvre simplement `index.html` (tout fonctionne en local, données stockées sur ton appareil)

## Hébergement gratuit (GitHub Pages)

```
Settings → Pages → Branch: main → Save
```

Le site est disponible sur `https://ton-nom.github.io/ton-repo/`.

## Données & vie privée

100 % local : tes photos et ta progression sont stockées dans ton navigateur (localStorage + IndexedDB). Rien n'est envoyé sur Internet.

## Fondements pédagogiques

- **Répétition espacée** (courbe d'Ebbinghaus, algorithme SM-2)
- **Retrieval practice** — *Make It Stick*, Brown, Roediger & McDaniel
- **Feedback immédiat** — Hattie & Timperley
- **Double codage visuel + auditif** — Paivio
- **Typographie adaptée à la dyslexie** — recommandations British Dyslexia Association
- **Gamification motivante** — Werbach & Hunter ; motivation intrinsèque (Deci & Ryan)

## Structure du code

```
index.html          — page principale (SPA)
manifest.json       — manifeste PWA
sw.js               — service worker (fonctionne hors-ligne)
css/style.css       — design system + mode dyslexie
data/curriculum.js  — programme TSI, quiz, khôlles, liens vidéo
js/store.js         — stockage local (localStorage + IndexedDB)
js/srs.js           — répétition espacée
js/gamify.js        — XP, niveaux, streaks, badges
js/quiz.js          — moteur de quiz
js/correction.js    — photos de cours + analyse de texte + checklists
js/tts.js           — synthèse vocale
js/app.js           — interface et navigation
```
