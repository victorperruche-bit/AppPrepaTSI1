// store.js — persistance locale (localStorage + IndexedDB pour les photos)
const Store = (() => {
  const KEY = "prepahub_state_v1";
  const DB_NAME = "prepahub";
  const DB_STORE = "photos";

  const DEFAULT_STATE = {
    profile: { name: "", dyslexiaMode: true, ttsEnabled: false, fontScale: 1 },
    xp: 0,
    streak: { count: 0, lastDay: null },
    badges: [],
    srs: {},           // id carte -> { ease, interval, due, reps }
    quizStats: {},     // subject -> { attempts, correct }
    photoStatus: {},   // photoId -> { status, note, corrections }
    activityLog: []
  };

  let state = load();

  function freshState() { return JSON.parse(JSON.stringify(DEFAULT_STATE)); }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...freshState(), ...JSON.parse(raw) } : freshState();
    } catch {
      return freshState();
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  // --- IndexedDB pour les photos (trop lourdes pour localStorage) ---
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(DB_STORE)) {
          req.result.createObjectStore(DB_STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function savePhoto(photo) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(photo);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getPhotos(subject) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const req = tx.objectStore(DB_STORE).getAll();
      req.onsuccess = () => {
        const all = req.result || [];
        resolve(subject ? all.filter((p) => p.subject === subject) : all);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function deletePhoto(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  return {
    get state() { return state; },
    save,
    reset() { state = freshState(); save(); },
    savePhoto,
    getPhotos,
    deletePhoto
  };
})();
