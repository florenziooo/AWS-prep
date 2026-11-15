/* XP, levels, streaks, badges, study-time tracking and per-question answer history.
   XP rewards learning, not clicking:
     +10 first time a question is answered correctly, +3 for a later correct answer, +1 for a wrong one
     +5 for rating a card that was due (+1 if it was not due yet)
     +30 for completing a lecture (after its knowledge checks), +50 first completion of a quiz bank,
     +25 bonus for ≥ 80 %, +200 for finishing the 120-question Final Boss.
   A study day counts toward the streak once it earns 20 XP. */
(function () {
  const st = () => Store.state;
  const ACTIVE_XP = 20;
  const TITLES = ['Cloud Curious', 'Cloud Novice', 'Region Rookie', 'AZ Apprentice', 'Instance Initiate', 'Bucket Builder',
    'VPC Voyager', 'IAM Insider', 'Well-Architected', 'Cloud Practitioner', 'Cloud Sage', 'Stratus Legend'];

  function addXP(n) {
    if (!n) return 0;
    st().xp += n; Store.day().xp += n; Store.save();
    return n;
  }

  function recordAnswer(qid, correct) {
    const s = st();
    const a = s.answers[qid] || (s.answers[qid] = { attempts: 0, correct: 0, last: null, lastAt: 0, everCorrect: false });
    const firstCorrect = correct && !a.everCorrect;
    a.attempts++; if (correct) a.correct++;
    a.last = !!correct; a.lastAt = Date.now();
    if (correct) a.everCorrect = true;
    const d = Store.day(); d.answered++; if (correct) d.correct++;
    const xp = addXP(correct ? (firstCorrect ? 10 : 3) : 1);
    return xp;
  }

  function recordReview(wasDue) { Store.day().reviews++; return addXP(wasDue ? 5 : 1); }

  function levelInfo(xp) {
    const x = xp == null ? st().xp : xp;
    let n = 1; while (50 * (n + 1) * n <= x) n++;
    const base = 50 * n * (n - 1), next = 50 * (n + 1) * n;
    return { level: n, title: TITLES[Math.min(n - 1, TITLES.length - 1)], into: x - base, span: next - base, xp: x, next };
  }

  function isActive(key) { const d = st().days[key]; return !!d && d.xp >= ACTIVE_XP; }

  function streak() {
    const keys = Object.keys(st().days).filter(isActive).sort();
    const set = new Set(keys);
    const d = new Date();
    let cur = 0;
    if (!set.has(Store.todayKey(d))) d.setDate(d.getDate() - 1); // today still open
    while (set.has(Store.todayKey(d))) { cur++; d.setDate(d.getDate() - 1); }
    let best = 0, run = 0, prev = null;
    keys.forEach(k => {
      const t = new Date(k + 'T12:00:00').getTime();
      run = prev && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1;
      best = Math.max(best, run); prev = t;
    });
    return { current: cur, best: Math.max(best, cur), todayDone: isActive(Store.todayKey()) };
  }

  /* ---------- Mastery ---------- */
  const LEVELS = ['Not started', 'Novice', 'Apprentice', 'Practitioner', 'Expert', 'Master'];
  function moduleMastery(mid) {
    const b = STRATUS.banks[mid]; if (!b) return { dots: 0, label: LEVELS[0], pct: 0 };
    const best = st().best[mid] || 0;
    let mature = 0;
    b.qids.forEach(id => { const k = SRS.stateOf(st().cards[id]); if (k === 'mastered') mature += 1; else if (k === 'review') mature += 0.5; });
    const score = 0.5 * best / 100 + 0.5 * mature / b.qids.length;
    const answered = b.qids.some(id => st().answers[id]);
    const dots = answered ? Math.max(1, Math.round(score * 5)) : 0;
    return { dots, label: LEVELS[dots], pct: Math.round(score * 100), best };
  }

  /* ---------- Badges ---------- */
  const moduleBanks = () => STRATUS.modules.map(m => m.id);
  const BADGES = [
    { id: 'first-lecture', icon: 'book', name: 'Bookmarked Brain', desc: 'Complete your first lecture', test: s => Object.values(s.lectures).some(l => l.completed) },
    { id: 'first-steps', icon: 'play', name: 'First Steps', desc: 'Complete your first module quiz', test: s => moduleBanks().some(b => s.completedBanks[b]) },
    { id: 'cloud-explorer', icon: 'target', name: 'Cloud Explorer', desc: 'Finish five module quizzes', test: s => moduleBanks().filter(b => s.completedBanks[b]).length >= 5 },
    { id: 'full-stack', icon: 'layers', name: 'Full Stack', desc: 'Finish all ten module quizzes', test: s => moduleBanks().every(b => s.completedBanks[b]) },
    { id: 'bookworm', icon: 'book', name: 'Bookworm', desc: 'Complete all ten lectures', test: s => STRATUS.modules.every(m => s.lectures[m.id] && s.lectures[m.id].completed) },
    { id: 'security-specialist', icon: 'layers', name: 'Security Specialist', desc: 'Score ≥ 90 % on Module 7 and get 15 of its cards into long-term review', test: s => (s.best.m7 || 0) >= 90 && (STRATUS.banks.m7 ? STRATUS.banks.m7.qids.filter(id => ['review', 'mastered'].includes(SRS.stateOf(s.cards[id]))).length >= 15 : false) },
    { id: 'perfect-score', icon: 'star', name: 'Perfect Score', desc: 'Score 100 % on a full module quiz', test: s => s.results.some(r => r.kind === 'module' && r.full && r.correct === r.total) },
    { id: 'memory-master', icon: 'brain', name: 'Memory Master', desc: 'Review 100 spaced-repetition cards', test: s => s.reviewLog.length >= 100 },
    { id: 'clean-notes', icon: 'check', name: 'Clean Sweep', desc: 'Finish the Practice Exam — Clean Notes quiz', test: s => !!s.completedBanks.pe },
    { id: 'kc-slido', icon: 'quiz', name: 'Knowledge Keeper', desc: 'Finish the Knowledge Check + Slido quiz', test: s => !!s.completedBanks.kcs },
    { id: 'final-boss', icon: 'trophy', name: 'Final Boss Slayer', desc: 'Complete the 120-question final exam', test: s => s.results.some(r => r.bank === 'fb' && r.answered >= 120) },
    { id: 'sim-pass', icon: 'trophy', name: 'Simulated Pass', desc: 'Reach a simulated 700+ in Exam Simulation mode', test: s => s.results.some(r => r.mode === 'exam' && r.scaled >= 700) },
    { id: 'streak-3', icon: 'flame', name: 'On a Roll', desc: 'Study 3 days in a row', test: () => streak().best >= 3 },
    { id: 'streak-7', icon: 'bolt', name: 'Unstoppable', desc: 'Study 7 days in a row', test: () => streak().best >= 7 },
    { id: 'centurion', icon: 'layers', name: 'Centurion', desc: 'Answer 500 questions', test: s => Object.values(s.answers).reduce((a, x) => a + x.attempts, 0) >= 500 }
  ];

  function checkBadges() {
    const s = st(), earned = [];
    BADGES.forEach(b => {
      if (!s.badges[b.id]) {
        let ok = false; try { ok = b.test(s); } catch (e) { ok = false; }
        if (ok) { s.badges[b.id] = Date.now(); earned.push(b); }
      }
    });
    if (earned.length) { Store.save(); earned.forEach(b => window.UI && UI.toast(b.icon, 'Badge unlocked: ' + b.name, b.desc)); }
    return earned;
  }

  /* ---------- Study time (only while visible, recently active, and on a study screen) ---------- */
  let lastInput = Date.now();
  ['pointerdown', 'keydown', 'scroll', 'wheel'].forEach(e => window.addEventListener(e, () => { lastInput = Date.now(); }, { passive: true, capture: true }));
  setInterval(() => {
    if (document.visibilityState === 'visible' && Progress.studying && Date.now() - lastInput < 120000) {
      Store.day().seconds += 10; Store.save();
    }
  }, 10000);

  window.Progress = {
    studying: false, addXP, recordAnswer, recordReview, levelInfo, streak, isActive, moduleMastery, checkBadges,
    BADGES, LEVELS, ACTIVE_XP
  };
})();
