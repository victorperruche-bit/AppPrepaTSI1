// planning.js — Colles et DS synchronisés depuis ton Google Calendar
// (TSI1 gr B — Lycée Gustave Eiffel, calendrier DS TSI1 2026-2027)
// Chaque événement : { date ISO, durée, titre, matière, salle, type }
const PLANNING = [
  // ===== Novembre 2026 =====
  { date: "2026-11-18T12:00:00+01:00", hours: 2, title: "Colle Français (groupe 10)", subject: "francais", type: "colle", salle: "Lycée Gustave Eiffel" },
  { date: "2026-11-18T14:00:00+01:00", hours: 1, title: "Colle Maths — Moutawakil (gr 10)", subject: "maths", type: "colle", salle: "D115" },
  { date: "2026-11-21T08:00:00+01:00", hours: 4, title: "DS Maths — TSI1", subject: "maths", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2026-11-23T13:00:00+01:00", hours: 1, title: "Colle SI — Blascheck (gr 10)", subject: "si", type: "colle", salle: "A013" },
  { date: "2026-11-27T10:00:00+01:00", hours: 1, title: "Colle Maths — Regnaud (gr 10)", subject: "maths", type: "colle", salle: "B1B" },
  { date: "2026-11-28T08:00:00+01:00", hours: 4, title: "DS Physique — TSI1", subject: "physique", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2026-11-30T12:00:00+01:00", hours: 1, title: "Colle Maths — Frey (gr 10)", subject: "maths", type: "colle", salle: "B101" },
  // ===== Décembre 2026 =====
  { date: "2026-12-02T12:00:00+01:00", hours: 1, title: "Colle Physique — Nancey (gr 10)", subject: "physique", type: "colle", salle: "B1B" },
  { date: "2026-12-02T15:00:00+01:00", hours: 1, title: "Colle Anglais — N Doye (gr 10)", subject: "anglais", type: "colle", salle: "D211" },
  { date: "2026-12-04T15:00:00+01:00", hours: 1, title: "Colle SI — Dufour (gr 10)", subject: "si", type: "colle", salle: "A013" },
  { date: "2026-12-05T08:00:00+01:00", hours: 4, title: "DS SI — TSI1", subject: "si", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2026-12-09T13:00:00+01:00", hours: 1, title: "Colle Anglais — N Doye (gr 10)", subject: "anglais", type: "colle", salle: "D211" },
  { date: "2026-12-09T15:00:00+01:00", hours: 1, title: "Colle Maths — Blanquet (gr 10)", subject: "maths", type: "colle", salle: "D101" },
  { date: "2026-12-11T10:00:00+01:00", hours: 1, title: "Colle Physique — Guichardaz (gr 10)", subject: "physique", type: "colle", salle: "01S" },
  { date: "2026-12-12T08:00:00+01:00", hours: 4, title: "DS Français — TSI1", subject: "francais", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2026-12-16T14:00:00+01:00", hours: 1, title: "Colle Maths — Laurençon (gr 10)", subject: "maths", type: "colle", salle: "D107" },
  { date: "2026-12-18T14:00:00+01:00", hours: 1, title: "Colle SI — Dufour (gr 10)", subject: "si", type: "colle", salle: "A013" },
  // ===== Janvier 2027 =====
  { date: "2027-01-09T08:00:00+01:00", hours: 4, title: "DS Maths — TSI1", subject: "maths", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2027-01-16T08:00:00+01:00", hours: 4, title: "DS Physique — TSI1", subject: "physique", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2027-01-23T08:00:00+01:00", hours: 4, title: "DS SI — TSI1", subject: "si", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2027-01-30T08:00:00+01:00", hours: 4, title: "DS Maths — TSI1", subject: "maths", type: "DS", salle: "Lycée Gustave Eiffel" },
  // ===== Février–Mars 2027 =====
  { date: "2027-02-06T08:00:00+01:00", hours: 4, title: "JPO — Journée Portes Ouvertes", subject: null, type: "autre", salle: "Lycée Gustave Eiffel" },
  { date: "2027-03-06T08:00:00+01:00", hours: 4, title: "DS Physique — TSI1", subject: "physique", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2027-03-13T08:00:00+01:00", hours: 4, title: "DS Français — TSI1", subject: "francais", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2027-03-20T08:00:00+01:00", hours: 4, title: "DS SI — TSI1", subject: "si", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2027-03-27T08:00:00+01:00", hours: 4, title: "DS Maths — TSI1", subject: "maths", type: "DS", salle: "Lycée Gustave Eiffel" },
  // ===== Avril–Mai 2027 =====
  { date: "2027-04-03T08:00:00+02:00", hours: 4, title: "DS Physique — TSI1", subject: "physique", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2027-05-01T08:00:00+02:00", hours: 4, title: "DS SI — TSI1", subject: "si", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2027-05-08T08:00:00+02:00", hours: 4, title: "DS Maths — TSI1", subject: "maths", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2027-05-15T08:00:00+02:00", hours: 4, title: "DS Français — TSI1", subject: "francais", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2027-05-22T08:00:00+02:00", hours: 4, title: "DS Physique — TSI1", subject: "physique", type: "DS", salle: "Lycée Gustave Eiffel" },
  { date: "2027-05-29T08:00:00+02:00", hours: 4, title: "DS SI — TSI1", subject: "si", type: "DS", salle: "Lycée Gustave Eiffel" }
];

const Planning = (() => {
  function upcoming() {
    const now = Date.now();
    return PLANNING.filter((e) => new Date(e.date).getTime() > now).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  function daysUntil(dateStr) {
    const d = Math.ceil((new Date(dateStr) - Date.now()) / 86400000);
    return d;
  }

  function next() { return upcoming()[0] || null; }

  function fmtDate(dateStr) {
    const d = new Date(dateStr);
    const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const months = ["janv.", "févr.", "mars", "avril", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${String(d.getHours()).padStart(2, "0")}h${d.getMinutes() ? String(d.getMinutes()).padStart(2, "0") : ""}`;
  }

  function urgency(days) {
    if (days <= 1) return { label: "DEMAIN !", color: "var(--danger)" };
    if (days <= 3) return { label: `J-${days}`, color: "#ff9f43" };
    if (days <= 7) return { label: `J-${days}`, color: "var(--accent)" };
    return { label: `J-${days}`, color: "var(--text-dim)" };
  }

  return { upcoming, next, daysUntil, fmtDate, urgency };
})();
