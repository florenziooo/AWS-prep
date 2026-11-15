/* Persistent state in localStorage, with an in-memory fallback when storage is blocked. */
(function () {
  const KEY = 'stratus.clf-c02.v1';

  function defaults() {
    return {
      version: 1,
      createdAt: Date.now(),
      xp: 0,
      days: {},        // 'YYYY-MM-DD' -> { xp, answered, correct, reviews, seconds }
      answers: {},     // qid -> { attempts, correct, last: bool, lastAt }
      cards: {},       // qid -> SRS card (see spaced-repetition.js)
      reviewLog: [],   // [ts, qid, rating, prevIntervalMin]
      flags: {},       // qid -> ts (bookmarked / flagged for review)
      results: [],     // completed quiz summaries, newest last
      best: {},        // bankKey -> best accuracy pct
      completedBanks: {}, // bankId -> first completion ts
      lectures: {},    // moduleId -> { seen: {sectionId: true}, completed: ts, checks: {i: correct} }
      badges: {},      // badgeId -> ts
      sessions: {},    // sessionKey -> in-progress quiz state
      settings: { paper: false }
    };
  }

  let memory = null;
  let storageOK = true;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        memory = Object.assign(defaults(), parsed);
        memory.settings = Object.assign(defaults().settings, parsed.settings || {});
        return memory;
      }
    } catch (e) { storageOK = false; }
    memory = defaults();
    return memory;
  }

  let saveTimer = null;
  function save(now) {
    if (!memory) return;
    const write = () => {
      try { localStorage.setItem(KEY, JSON.stringify(memory)); storageOK = true; }
      catch (e) { storageOK = false; }
    };
    clearTimeout(saveTimer);
    if (now) write(); else saveTimer = setTimeout(write, 150);
  }

  function todayKey(d) {
    const x = d ? new Date(d) : new Date();
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  }

  function day(key) {
    const k = key || todayKey();
    const s = memory;
    if (!s.days[k]) s.days[k] = { xp: 0, answered: 0, correct: 0, reviews: 0, seconds: 0 };
    return s.days[k];
  }

  window.Store = {
    get state() { return memory || load(); },
    load, save, todayKey, day,
    get ok() { return storageOK; },
    reset() {
      memory = defaults();
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      save(true);
    },
    exportJSON() { return JSON.stringify(memory, null, 2); },
    importJSON(text) {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || !parsed.version) throw new Error('Not a Stratus progress file');
      memory = Object.assign(defaults(), parsed);
      save(true);
    }
  };
  window.addEventListener('beforeunload', () => save(true));
  load();
})();
