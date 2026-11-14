// curriculum.js — Programme prépa TSI avec points d'intention.
// Les "points d'intention" sont les idées clés à retenir, formulées court et actionable.
const SUBJECTS = {
  maths: {
    name: "Maths", emoji: "📐", color: "#81c784",
    chapters: [
      { id: "ma_suite", title: "Suites numériques", points: [
        "Une suite croissante et majorée converge (théorème de la convergence monotone).",
        "Adjacentes ⇒ convergent vers la même limite : réflexe pour les encadrements."
      ]},
      { id: "ma_fct", title: "Fonctions, limites, continuité", points: [
        "Théorème des valeurs intermédiaires : la rédaction exige continu + strictement monotone.",
        "Croissances comparées : ln x ≪ x^a ≪ e^x — l'échelle à avoir en tête."
      ]},
      { id: "ma_der", title: "Dérivabilité & développements limités", points: [
        "DL(0) de e^x, ln(1+x), cos, sin, 1/(1−x) : à savoir écrire les yeux fermés.",
        "Un DL donne le signe local ET la tangente — double usage à exploiter."
      ]},
      { id: "ma_int", title: "Intégrales & primitives", points: [
        "Intégration par parties : u'v = (uv)' − uv' — à savoir redémontrer.",
        "Aire sous la courbe = intégrale : le lien géométrie/analyse sauve beaucoup de calculs."
      ]},
      { id: "ma_al", title: "Algèbre linéaire & matrices", points: [
        "rang + dim(ker f) = dim E (théorème du rang) — vérifie toujours tes calculs avec.",
        "Diagonalisation : valeurs propres simples ⇒ vecteurs propres indépendants."
      ]},
      { id: "ma_eq", title: "Équations différentielles", points: [
        "y' + ay = b : solution générale = solution homogène + solution particulière.",
        "Ordre 2 à coefficients constants : discuter Δ > 0, = 0, < 0 (sin/cos)."
      ]}
    ]
  },
  physique: {
    name: "Physique", emoji: "⚡", color: "#4fc3f7",
    chapters: [
      { id: "ph_elec1", title: "Électricité : lois de base & régimes", points: [
        "Loi des mailles + loi des nœuds : TOUJOURS le point de départ de tout circuit.",
        "Diviseur de tension : U = E·R/(R+R') — le réflexe pour aller vite.",
        "Conventions récepteur/émetteur : une flèche mal orientée = tout l'exercice faux."
      ]},
      { id: "ph_rlc", title: "RLC & régimes transitoires", points: [
        "Régime apériodique / critique / pseudo-périodique : tout dépend de la valeur de R.",
        "t½ = L/R pour RL, t½ = RC pour RC : les constantes de temps à connaître."
      ]},
      { id: "ph_ind", title: "Induction & machines électriques", points: [
        "Loi de Lenz : l'induction s'oppose à la CAUSE de la variation du flux.",
        "Moteur, transformateur : le schéma équivalent d'abord, le calcul ensuite."
      ]},
      { id: "ph_meca", title: "Mécanique du point", points: [
        "Le PFD (2e loi de Newton) ne s'applique que dans un référentiel galiléen.",
        "Choisis le système AVANT le référentiel — l'erreur classique en khôlle.",
        "Théorème de l'énergie cinétique : plus rapide que le PFD quand on cherche une vitesse."
      ]},
      { id: "ph_osc", title: "Oscillateurs mécaniques", points: [
        "Pseudo-pulsation ω' = √(ω₀² − (2λ)²) : distingue le régime pseudo-périodique.",
        "Facteur de qualité Q = ω₀/2λ : grand Q ⇒ oscillations longues."
      ]}
    ]
  },
  si: {
    name: "Sciences Industrielles", emoji: "⚙️", color: "#4dd0e1",
    chapters: [
      { id: "si_meca", title: "Mécanismes & cinématique du solide", points: [
        "Chaîne fermée de solides : ferme en projection, jamais à l'œil.",
        "Classes d'équivalence : les identifier avant toute modélisation.",
        "Degré de mobilité m = nombre de mouvements indépendants : à calculer systématiquement."
      ]},
      { id: "si_graphe", title: "Graphe de structure & liaisons", points: [
        "Liaison pivot = 1 rotation ; glissière = 1 translation ; hélicoïdale = 1 movement combiné.",
        "Le schéma cinématique se construit à partir du graphe des liaisons, pas l'inverse."
      ]},
      { id: "si_dyn", title: "Dynamique du solide & énergétique", points: [
        "Théorème du moment cinétique : le PFD en version rotationnelle.",
        "Puissance des actions : P = moment · vitesse de rotation — pour les rendements."
      ]},
      { id: "si_asser", title: "Asservissements", points: [
        "Un asservi : consigne → comparateur → correcteur → système → capteur (retour).",
        "Diagramme de Bode : marge de phase > 45° pour la stabilité confortable.",
        "Précision, rapidité, stabilité : le triptyque à citer dans chaque analyse."
      ]},
      { id: "si_info", title: "Informatique & SI numérique", points: [
        "Un algorithme : entrées, traitement, sorties — écris-les avant de coder.",
        "Représentation binaire, table de vérité, logique combinatoire vs séquentielle : base des oraux."
      ]},
      { id: "si_mat", title: "Matériaux & fabrication", points: [
        "Contrainte = force/surface (σ = F/S) : la base de la résistance des matériaux.",
        "Choix d'un matériau : critères mécaniques + fabrication + coût, jamais un seul critère."
      ]}
    ]
  },
  francais: {
    name: "Français", emoji: "📚", color: "#f06292",
    chapters: [
      { id: "fr_theme", title: "Thème de l'année (culture générale)", points: [
        "Structure ta dissertation : problématique claire, 2-3 parties, transitions logiques.",
        "Chaque affirmation littéraire s'appuie sur un exemple précis (auteur, œuvre, date)."
      ]},
      { id: "fr_fig", title: "Figures de style", points: [
        "Métaphore vs comparaison : la métaphore n'a pas de mot de liaison.",
        "Chiasme, anaphore, hyperbole : les repérer + nommer + interpréter, jamais juste citer."
      ]},
      { id: "fr_red", title: "Réduction / orthographe", points: [
        "Accord du participe passé avec avoir : le COD placé AVANT le verbe.",
        "Les homophones (a/à, ses/ces, et/est) : relecture systématique à voix haute."
      ]}
    ]
  },
  anglais: {
    name: "Anglais", emoji: "🇬🇧", color: "#ffb74d",
    chapters: [
      { id: "en_gram", title: "Grammaire clé", points: [
        "Present perfect = lien avec le présent ; preterit = moment daté du passé.",
        "Depuis : 'since' + point, 'for' + durée. Jamais inversés."
      ]},
      { id: "en_voc", title: "Vocabulaire scientifique & technique", points: [
        "to increase/decrease, slope, assumption, statement, design, process : les mots des textes de concours.",
        "Les thèmes IA, écologie, innovation et éthique reviennent chaque année en thème/version."
      ]},
      { id: "en_meth", title: "Méthode (essais, textes)", points: [
        "Introduction : hook + problématique + plan en 3 phrases maximum.",
        "Un paragraphe = une idée + un exemple précis. Pas de 'filler'."
      ]}
    ]
  }
};

// Banque de sujets de khôlle (oraux) par matière.
// format : { id, chapter, subject, prompt, expected: [attendus du prof], tips: [réflexes] }
const KHOLLE_BANK = {
  maths: [
    { id: "k_ma1", chapter: "ma_suite", prompt: "Montrer que la suite un = (1 + 1/n)^n est croissante et convergente. Que vaut sa limite ?",
      expected: ["Étude du quotient ou de la différence u(n+1) − u(n)", "Croissance + majoration ⇒ convergence", "Limite = e, admise ou montrée via ln"],
      tips: ["Annonce le plan en 3 phrases avant de commencer : les profs adorent ça.", "Écris les quantificateurs : « pour tout ε > 0, il existe n₀… »"] },
    { id: "k_ma2", chapter: "ma_der", prompt: "Donner le DL(0) à l'ordre 2 de ln(1+x) et en déduire le signe local de ln(1+x) − x.",
      expected: ["ln(1+x) = x − x²/2 + o(x²)", "Différence = −x²/2 + o(x²) ≤ 0 localement", "Conclusion : ln(1+x) ≤ x au voisinage de 0"],
      tips: ["Le DL se récite d'abord, se démontre ensuite si le prof demande.", "Un DL sans o(·) est un DL faux : écris toujours le reste."] },
    { id: "k_ma3", chapter: "ma_eq", prompt: "Résoudre y'' + 4y = 0 puis y'' + 2y' + 5y = 0. Nature des solutions ?",
      expected: ["Équation caractéristique, discuter le discriminant", "Solutions en cos/sin pour la première", "Exponentielle × cos/sin (régime pseudo-périodique) pour la seconde"],
      tips: ["Trace toujours l'allure de la solution : le prof veut voir que tu « vois » la solution."] },
    { id: "k_ma4", chapter: "ma_al", prompt: "A ∈ M2(R), A² = A. Montrer que A est diagonalisable.",
      expected: ["X² = X(X−1) annulateur à racines simples", "Polynôme scindé à racines simples ⇒ diagonalisable", "Valeurs propres possibles : 0 et 1"],
      tips: ["Réflexe : polynôme annulateur à racines simples = diagonalisable. À citer mot pour mot."] },
    { id: "k_ma5", chapter: "ma_int", prompt: "Calculer ∫₀¹ x·e^x dx, puis en donner une interprétation géométrique.",
      expected: ["Intégration par parties : (x−1)e^x entre 0 et 1", "Résultat : 1", "Aire sous la courbe x·e^x sur [0,1]"],
      tips: ["Justifie la validité de l'IPP (fonctions de classe C¹).", "Vérifie ton résultat avec un ordre de grandeur."] }
  ],
  physique: [
    { id: "k_ph1", chapter: "ph_elec1", prompt: "Énoncer la loi des nœuds et la loi des mailles. Application : trouver l'intensité dans chaque branche d'un circuit à 2 mailles.",
      expected: ["Somme des courants entrants = sortants", "Somme des tensions le long d'une maille = 0", "Mise en équation puis résolution du système"],
      tips: ["Oriente le circuit AVANT d'écrire les équations.", "Un schéma clair et propre = la moitié de la note."] },
    { id: "k_ph2", chapter: "ph_rlc", prompt: "Circuit RC : établir l'équation différentienne de la tension et donner l'expression de la solution. Temps caractéristique ?",
      expected: ["RC·du/dt + u = E", "Solution : E + (u₀−E)e^(−t/RC)", "τ = RC, 63 % à τ, permanent à 5τ"],
      tips: ["Fais le schéma avec flèches de tension et conventions.", "Trace u(t) : le prof veut voir l'exponentielle."] },
    { id: "k_ph3", chapter: "ph_ind", prompt: "Énoncer la loi de Lenz-Faraday et l'illustrer par une expérience simple.",
      expected: ["e = −dΦ/dt", "Opposition à la cause de la variation", "Aimant + bobine + galvanomètre : courant induit qui s'oppose"],
      tips: ["Le signe MOINS est l'essence de la loi : ne l'oublie jamais."] },
    { id: "k_ph4", chapter: "ph_meca", prompt: "Solide en chute avec frottement fluide f = −kv : établir l'équation du mouvement et la vitesse limite.",
      expected: ["PFD projeté sur l'axe vertical", "mdv/dt = mg − kv", "v_lim = mg/k"],
      tips: ["Choisis le système et le référentiel à voix haute avant d'écrire.", "La vitesse limite se devine par dv/dt = 0 : dis-le."] }
  ],
  si: [
    { id: "k_si1", chapter: "si_meca", prompt: "Fermeture géométrique d'un système bielle-manivelle : établir la relation entre l'angle moteur et la position du piston.",
      expected: ["Chaîne fermée : projeter dans un repère", "Relation en sin/cos", "Discussion éventuelle de la transmission"],
      tips: ["Dessine le paramétrage complet avant d'écrire.", "La fermeture se projette, elle ne s'écrit pas « à l'œil »."] },
    { id: "k_si2", chapter: "si_asser", prompt: "Tracer le schéma-bloc d'un asservissement de vitesse et définir précision, rapidité, stabilité.",
      expected: ["Consigne → comparateur → correcteur → moteur → capteur", "Précision : écart en régime permanent", "Rapidité : temps de réponse ; stabilité : marges"],
      tips: ["Le triptyque précision/rapidité/stabilité : cite-le dans chaque analyse, c'est le réflexe du colleur."] },
    { id: "k_si3", chapter: "si_graphe", prompt: "Donner le torseur cinématique des liaisons usuelles : pivot, glissière, pivot glissant, sphérique.",
      expected: ["Pivot : 1 rotation (0 sur le reste)", "Glissière : 1 translation", "Pivot glissant : 1 rot + 1 trans ; sphérique : 3 rotations"],
      tips: ["Écris les torseurs au tableau colonne par colonne, sans hésiter : c'est du par cœur."] },
    { id: "k_si4", chapter: "si_mat", prompt: "Une barre de section 100 mm² supporte 10 kN en traction. Contrainte ? Que se passe-t-il si σ dépasse la limite élastique ?",
      expected: ["σ = F/S = 100 MPa", "Déformation plastique au-delà de Re", "Notion de coefficient de sécurité"],
      tips: ["Convertis toujours en unités SI avant de calculer : mm² → m²."] },
    { id: "k_si5", chapter: "si_info", prompt: "Expliquer la différence entre logique combinatoire et séquentielle, avec un exemple de chaque.",
      expected: ["Combinatoire : sortie = f(entrées) — ex : additionneur", "Séquentielle : mémoire de l'état — ex : bascule D, compteur", "Horloge et fronts"],
      tips: ["Un exemple précis par concept : le colleur veut du concret."] }
  ],
  francais: [
    { id: "k_fr1", chapter: "fr_theme", prompt: "Le progrès technique rend-il l'homme plus libre ? (dissertation, 20 min de préparation)",
      expected: ["Problématique claire avec tension", "Plan en 2-3 parties avec exemples précis", "Introduction accroche + problématique + plan"],
      tips: ["Prépare l'intro en dernier : c'est ce que tu lis en premier au jury."] },
    { id: "k_fr2", chapter: "fr_fig", prompt: "Analyser la figure de style : « J'ai vu des choses, des vraies, des dures » (anaphore ? gradation ?).",
      expected: ["Anaphore + gradation", "Effet d'insistance et d'intensification", "Interprétation au service du sens, pas juste la nomination"],
      tips: ["Toujours : nommer → citer → interpréter. Jamais juste nommer."] }
  ],
  anglais: [
    { id: "k_en1", chapter: "en_meth", prompt: "Should artificial intelligence be regulated? (essay plan, 15 min)",
      expected: ["Hook + problématique + plan", "2 parties avec connecteurs logiques", "Vocabulaire précis : regulation, liability, bias…"],
      tips: ["Prépare 2-3 exemples récents avant l'oral : ça impressionne toujours."] },
    { id: "k_en2", chapter: "en_gram", prompt: "Expliquer la différence entre present perfect et preterit, avec un exemple de chaque.",
      expected: ["Present perfect : lien avec le présent (since, already)", "Preterit : moment daté du passé (yesterday, in 2019)", "Exemples corrects"],
      tips: ["Si tu peux ajouter une date précise → preterit. Réflexe simple."] }
  ]
};

// Banque de quiz : QCM par matière, avec explication pédagogique.
const QUIZ_BANK = {
  maths: [
    { id: "q_ma1", q: "Quelle est la bonne hiérarchie des croissances quand x → +∞ ?",
      options: ["ln x ≪ x^a ≪ e^x", "e^x ≪ x^a ≪ ln x", "x^a ≪ ln x ≪ e^x", "ln x ≪ e^x ≪ x^a"],
      answer: 0, explain: "Le logarithme croît très lentement, l'exponentielle domine toutes les puissances : c'est l'échelle des croissances comparées." },
    { id: "q_ma2", q: "Le théorème du rang s'écrit :",
      options: ["dim Im f + dim Ker f = dim E", "dim Im f = dim Ker f", "rg f = dim E", "dim Ker f = rg f"],
      answer: 0, explain: "Toujours vrai pour un endomorphisme : c'est un excellent contrôle de tes calculs de rang." },
    { id: "q_ma3", q: "DL(0) de ln(1+x) à l'ordre 1 :",
      options: ["x − x²/2", "x + x²", "1 + x", "x − x"],
      answer: 0, explain: "ln(1+x) = x − x²/2 + x³/3 − … : alterne, uniquement des puissances impaires au dénominateur." },
    { id: "q_ma4", q: "Solution générale de y' + ay = b (a, b constants) :",
      options: ["C·e^(−ax) + b/a", "C·e^(ax) + b", "b/a seulement", "C·x + b/a"],
      answer: 0, explain: "Solution homogène + solution particulière constante : la structure à réutiliser pour toute équation linéaire." },
    { id: "q_ma5", q: "Une primitive de x·e^x est :",
      options: ["(x−1)·e^x", "x·e^x", "(x+1)·e^x", "e^x"],
      answer: 0, explain: "Intégration par parties avec u = x, v' = e^x : ∫x e^x = x e^x − e^x = (x−1)e^x." }
  ],
  physique: [
    { id: "q_ph1", q: "La constante de temps d'un circuit RC vaut :",
      options: ["τ = RC", "τ = R/C", "τ = 1/(RC)", "τ = √(RC)"],
      answer: 0, explain: "τ = RC : au bout de τ, la tension a atteint 63 % de sa valeur finale ; 5τ ≈ régime permanent." },
    { id: "q_ph2", q: "Loi de Lenz : la force induite s'oppose à :",
      options: ["La cause de la variation du flux", "Le champ magnétique", "Le courant lui-même", "La tension d'alimentation"],
      answer: 0, explain: "C'est la formulation précise à donner en khôlle : opposition à la CAUSE, pas juste « ça s'oppose »." },
    { id: "q_ph3", q: "Un diviseur de tension : E = 12 V, R = 2 kΩ, R' = 4 kΩ. U aux bornes de R ?",
      options: ["4 V", "6 V", "8 V", "12 V"],
      answer: 0, explain: "U = E·R/(R+R') = 12·2/6 = 4 V : le réflexe diviseur, à faire en 10 secondes." },
    { id: "q_ph4", q: "Dans un circuit RLC série, augmenter R favorise :",
      options: ["L'amortissement", "La résonance", "La pulsation propre", "L'énergie stockée"],
      answer: 0, explain: "R dissipe l'énergie : plus R grand, plus les oscillations s'amortissent vite (jusqu'au régime apériodique)." },
    { id: "q_ph5", q: "Un solide glisse sans frottement sur un plan incliné. Nature du mouvement ?",
      options: ["Uniformément accéléré", "Uniforme", "Circulaire uniforme", "Oscillatoire"],
      answer: 0, explain: "Sans frottement, la composante du poids le long du plan est constante ⇒ accélération constante (PFD)." }
  ],
  si: [
    { id: "q_si1", q: "Dans un schéma-bloc d'asservissement, le comparateur :",
      options: ["Soustrait la mesure à la consigne", "Amplifie l'erreur", "Mesure la sortie", "Corrige le système"],
      answer: 0, explain: "Comparateur = consigne − mesure ; c'est l'écart qui pilote le correcteur." },
    { id: "q_si2", q: "Fermer une chaîne cinématique, c'est :",
      options: ["Projeter la boucle fermée dans un repère", "Compter les solides", "Trouver les liaisons", "Dessiner le schéma"],
      answer: 0, explain: "On écrit la fermeture vectorielle puis on projette : c'est la méthode systématique en SI." },
    { id: "q_si3", q: "Marge de phase confortable en asservissement :",
      options: ["> 45°", "> 5°", "= 0°", "< 45°"],
      answer: 0, explain: "En dessous de 45°, le système est proche de l'instabilité : oscillations, dépassements." },
    { id: "q_si4", q: "Une liaison pivot autorise :",
      options: ["1 rotation", "1 translation", "2 rotations", "3 translations"],
      answer: 0, explain: "Pivot = 1 degré de liberté en rotation. Glissière = 1 en translation. À classer par cœur." },
    { id: "q_si5", q: "Contrainte normale σ dans une pièce tendue :",
      options: ["σ = F/S", "σ = S/F", "σ = F·S", "σ = F²/S"],
      answer: 0, explain: "σ = F/S (en Pa) : la base de la RDM, à relier au critère de résistance du matériau." },
    { id: "q_si6", q: "Logique séquentielle vs combinatoire : la différence clé ?",
      options: ["La sortie dépend de l'état passé (mémoire)", "La sortie dépend seulement des entrées", "Il y a des portes ET", "Le montage est plus rapide"],
      answer: 0, explain: "Combinatoire : sortie = f(entrées). Séquentielle : l'historique compte (bascules, mémoires)." }
  ],
  francais: [
    { id: "q_fr1", q: "« Les pommes que j'ai ___ » : participe passé ?",
      options: ["mangées", "mangé", "mangés", "manger"],
      answer: 0, explain: "COD 'que' (= les pommes, fém. pluriel) placé avant le verbe ⇒ accord : mangées." },
    { id: "q_fr2", q: "« Cette enfant est l'aigle de sa race » est une :",
      options: ["Métaphore", "Comparaison", "Métonymie", "Litote"],
      answer: 0, explain: "Pas de mot de liaison (comme, tel que) : c'est une métaphore. La nommer puis l'interpréter." },
    { id: "q_fr3", q: "Une anaphore, c'est :",
      options: ["La répétition d'un mot en début de phrases successives", "Une opposition", "Une exagération", "Un renversement"],
      answer: 0, explain: "Répetition at the beginning of successive lines — effet d'insistance, de rythme, d'amplification." },
    { id: "q_fr4", q: "Dans une dissertation, la problématique sert à :",
      options: ["Poser la tension centrale du sujet", "Résumer le plan", "Citer un auteur", "Annoncer la conclusion"],
      answer: 0, explain: "Elle formule la tension (paradoxes, enjeux) que le plan va dénouer ; formulée sous forme de question." }
  ],
  anglais: [
    { id: "q_en1", q: "« I ___ in Paris since 2020. »",
      options: ["have lived", "lived", "live", "am living"],
      answer: 0, explain: "'Since' + point de départ = lien avec le présent ⇒ present perfect." },
    { id: "q_en2", q: "« The experience was so intense ___ I'll never forget it. »",
      options: ["that", "than", "then", "as"],
      answer: 0, explain: "Construction 'so + adjectif + that' : la conséquence." },
    { id: "q_en3", q: "Le mot « assumption » signifie :",
      options: ["hypothèse", "consommation", "assurance", "assertion"],
      answer: 0, explain: "To assume = supposer. 'Assumption' = hypothèse de départ, pas une assurance." },
    { id: "q_en4", q: "Dans un essai d'anglais, une « hook » désigne :",
      options: ["Une accroche dans l'introduction", "Un crochet", "Une conclusion", "Une citation obligatoire"],
      answer: 0, explain: "La hook capte l'attention dès la première phrase : anecdote, chiffre, question." }
  ]
};

// Liens vidéo : chaînes de référence par matière + recherche ciblée par chapitre.
// Chaînes reconnues pour la prépa francophone :
//  - Maths : El Ji (https://www.youtube.com/@ElJi), MicroMaths (@MicroMaths)
//  - Physique : ScienceClic (@scienceclic), Méthode Physique (@MethodePhysique)
//  - SI : Matthieu Rigal / prépa SI, plus chaîne "SI prépa"
const VIDEO_CHANNELS = {
  maths: [
    { label: "El Ji — cours de prépa pas à pas", url: "https://www.youtube.com/@ElJi" },
    { label: "MicroMaths — exercices corrigés", url: "https://www.youtube.com/@MicroMaths" }
  ],
  physique: [
    { label: "ScienceClic — physique visualisée", url: "https://www.youtube.com/@scienceclic" },
    { label: "Méthode Physique — méthodes et exercices prépa", url: "https://www.youtube.com/@MethodePhysique" }
  ],
  si: [
    { label: "Rechercher des cours SI prépa (YouTube)", url: "https://www.youtube.com/results?search_query=pr%C3%A9pa+SI+sciences+industrielles+cours" }
  ]
};

// Recherche YouTube ciblée par chapitre (toujours à jour, aucun lien mort).
const VIDEO_QUERIES = {
  ma_suite: "suites numériques prépa convergence exercice",
  ma_fct: "limites continuité théorème valeurs intermédiaires prépa",
  ma_der: "développement limité DL prépa méthode",
  ma_int: "intégration par parties prépa exercice",
  ma_al: "algèbre linéaire diagonalisation prépa",
  ma_eq: "équation différentielle linéaire prépa résolution",
  ph_elec1: "loi des mailles loi des nœuds exercice",
  ph_rlc: "circuit RC RL RLC régime transitoire prépa",
  ph_ind: "loi de Lenz Faraday induction exercice",
  ph_meca: "deuxième loi de Newton exercice prépa",
  ph_osc: "oscillateur amorti facteur de qualité prépa",
  si_meca: "fermeture chaîne cinématique prépa SI",
  si_graphe: "liaisons mécaniques torseur cinématique prépa",
  si_dyn: "moment cinétique dynamique solide SI",
  si_asser: "asservissement schéma bloc prépa SI",
  si_info: "logique combinatoire séquentielle bascule",
  si_mat: "contrainte traction résistance matériaux"
};

function videoUrlFor(chapterId) {
  const q = VIDEO_QUERIES[chapterId];
  if (!q) return null;
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
}
