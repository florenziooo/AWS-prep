/* Aggregations over answer history for the dashboard and analytics pages. */
(function () {
  const st = () => Store.state;
  const Q = id => STRATUS.questions[id];

  function group(keyFn, filter) {
    const out = {};
    Object.entries(st().answers).forEach(([id, a]) => {
      const q = Q(id); if (!q || (filter && !filter(q))) return;
      const k = keyFn(q); if (k == null) return;
      const g = out[k] || (out[k] = { attempts: 0, correct: 0, distinct: 0, lastCorrect: 0 });
      g.attempts += a.attempts; g.correct += a.correct; g.distinct++; if (a.last) g.lastCorrect++;
    });
    Object.values(out).forEach(g => { g.pct = g.attempts ? Math.round(100 * g.correct / g.attempts) : null; });
    return out;
  }

  const byModule = () => group(q => q.module);
  const byDomain = () => group(q => q.domain);
  const byCategory = () => group(q => q.category);

  function weakTopics(limit, filter) {
    const g = group(q => q.module + '|' + q.topic, filter);
    return Object.entries(g)
      .filter(([, v]) => v.attempts >= 1 && v.pct < 100)
      .map(([k, v]) => { const [m, topic] = k.split('|'); return { module: +m, topic, ...v }; })
      .sort((a, b) => a.pct - b.pct || b.attempts - a.attempts)
      .slice(0, limit || 6);
  }

  function totals() {
    let attempts = 0, correct = 0, distinct = 0;
    Object.entries(st().answers).forEach(([id, a]) => { if (!Q(id)) return; attempts += a.attempts; correct += a.correct; distinct++; });
    const seconds = Object.values(st().days).reduce((s, d) => s + (d.seconds || 0), 0);
    return { attempts, correct, distinct, pct: attempts ? Math.round(100 * correct / attempts) : null, seconds };
  }

  /* Readiness estimate (0–100): domain-weighted accuracy × coverage.
     Coverage reaches 100 % for a domain after ~40 distinct questions (or half the bank if smaller).
     It is a study signal, not a prediction of the real AWS score. */
  function readiness() {
    const avail = {}; Object.values(STRATUS.questions).forEach(q => { avail[q.domain] = (avail[q.domain] || 0) + 1; });
    const g = byDomain();
    let score = 0;
    Object.values(STRATUS.domains).forEach(d => {
      const x = g[d.id]; if (!x) return;
      const target = Math.min(40, Math.ceil((avail[d.id] || 1) / 2));
      const coverage = Math.min(1, x.distinct / target);
      score += d.weight * (x.lastCorrect / x.distinct) * coverage;
    });
    return Math.round(score);
  }

  function lastDays(n) {
    const res = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = Store.todayKey(d);
      res.push({ key: k, date: d, ...(st().days[k] || { xp: 0, answered: 0, correct: 0, reviews: 0, seconds: 0 }) });
    }
    return res;
  }

  function heatLevel(xp) { return !xp ? 0 : xp < Progress.ACTIVE_XP ? 1 : xp < 60 ? 2 : 3; }

  window.Analytics = { group, byModule, byDomain, byCategory, weakTopics, totals, readiness, lastDays, heatLevel };
})();
