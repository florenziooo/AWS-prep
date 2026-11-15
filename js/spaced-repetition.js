/* SM-2-inspired spaced repetition scheduler.

   Card: { ef, interval (minutes), reps, lapses, due (ms), last (ms), lastRating }

   First rating of a card:  Again 10 min · Hard 1 day · Good 3 days · Easy 7 days
   Later ratings (I = previous interval, EF = ease factor, starts 2.5, floor 1.3):
     Again → interval 10 min, reps = 0, lapses + 1 (if it had been learned), EF − 0.20
     Hard  → max(1 day, I × 1.2),                          EF − 0.15
     Good  → max(I + 1 day, I × EF)
     Easy  → max(1 day, I) × EF × 1.3,                     EF + 0.15
   Intervals are capped at 365 days.
   Card states: new (never rated) · learning (interval < 1 day) · relearning (learning after a lapse)
                · review (1–20 days) · mastered (≥ 21 days).
   Answering a question incorrectly only allows Again or Hard, so wrong answers come back sooner. */
(function () {
  const MIN = 60 * 1000, DAY_MIN = 1440, CAP = 365 * DAY_MIN;
  const st = () => Store.state;

  function preview(card, rating) {
    const c = card ? Object.assign({}, card) : { ef: 2.5, interval: 0, reps: 0, lapses: 0 };
    const first = !card || card.reps === 0 && !card.last;
    let iv;
    switch (rating) {
      case 'again':
        iv = 10;
        if (c.reps > 0 || c.interval >= DAY_MIN) c.lapses = (c.lapses || 0) + 1;
        c.reps = 0; c.ef = Math.max(1.3, c.ef - 0.2); break;
      case 'hard':
        iv = first ? DAY_MIN : Math.max(DAY_MIN, Math.round(c.interval * 1.2));
        c.ef = Math.max(1.3, c.ef - 0.15); c.reps++; break;
      case 'good':
        iv = first ? 3 * DAY_MIN : Math.max(c.interval + DAY_MIN, Math.round(c.interval * c.ef));
        c.reps++; break;
      case 'easy':
        iv = first ? 7 * DAY_MIN : Math.round(Math.max(DAY_MIN, c.interval) * c.ef * 1.3);
        c.ef = c.ef + 0.15; c.reps++; break;
      default: throw new Error('bad rating ' + rating);
    }
    c.interval = Math.min(CAP, iv);
    return c;
  }

  function rate(qid, rating) {
    const s = st();
    const prev = s.cards[qid];
    const now = Date.now();
    const wasDue = !prev || prev.due <= endOfToday();
    const c = preview(prev, rating);
    c.last = now; c.lastRating = rating; c.due = now + c.interval * MIN;
    s.cards[qid] = c;
    s.reviewLog.push([now, qid, rating, prev ? prev.interval : 0]);
    if (s.reviewLog.length > 4000) s.reviewLog.splice(0, s.reviewLog.length - 4000);
    Store.save();
    return { card: c, wasDue, isNew: !prev };
  }

  /* Used when a quiz finishes without an explicit rating.
     Wrong answers always lapse; correct answers only schedule new or due cards
     so a lucky quiz answer cannot push a not-yet-due card further out. */
  function autoSchedule(qid, correct) {
    const c = st().cards[qid];
    if (!correct) return rate(qid, 'again');
    if (!c || c.due <= endOfToday()) return rate(qid, 'good');
    return null;
  }

  function endOfToday() { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); }

  function stateOf(c) {
    if (!c) return 'new';
    if (c.interval < DAY_MIN) return c.lapses > 0 ? 'relearning' : 'learning';
    if (c.interval >= 21 * DAY_MIN) return 'mastered';
    return 'review';
  }

  function fmt(min) {
    if (min < 60) return Math.round(min) + ' min';
    if (min < DAY_MIN) return Math.round(min / 60) + ' h';
    const d = min / DAY_MIN;
    if (d < 30) return Math.round(d) + (Math.round(d) === 1 ? ' day' : ' days');
    if (d < 365) return Math.round(d / 30) + ' mo';
    return '1 yr';
  }

  function dueQids(limitTs) {
    const t = limitTs || endOfToday(), s = st();
    return Object.keys(s.cards).filter(id => S().questions[id] && s.cards[id].due <= t)
      .sort((a, b) => s.cards[a].due - s.cards[b].due);
  }
  const S = () => window.STRATUS;

  function stats(qidFilter) {
    const s = st();
    const pool = qidFilter || Object.keys(S().questions);
    const out = { total: pool.length, new: 0, learning: 0, relearning: 0, review: 0, mastered: 0, forgotten: 0, due: 0, dueNow: 0 };
    const eot = endOfToday(), now = Date.now();
    pool.forEach(id => {
      const c = s.cards[id];
      const k = stateOf(c);
      out[k]++;
      if (c) {
        if (c.lastRating === 'again') out.forgotten++;
        if (c.due <= eot) out.due++;
        if (c.due <= now) out.dueNow++;
      }
    });
    // Retention: share of reviews of already-learned cards (prev interval ≥ 1 day) not rated Again.
    const mature = s.reviewLog.filter(r => r[3] >= DAY_MIN);
    out.retention = mature.length ? Math.round(100 * mature.filter(r => r[2] !== 'again').length / mature.length) : null;
    out.retentionN = mature.length;
    out.reviewsTotal = s.reviewLog.length;
    return out;
  }

  function forecast(days) {
    const s = st(), res = [];
    const start = new Date(); start.setHours(0, 0, 0, 0);
    for (let i = 0; i < days; i++) {
      const a = start.getTime() + i * 864e5, b = a + 864e5;
      let n = 0;
      Object.keys(s.cards).forEach(id => {
        const d = s.cards[id].due;
        if ((i === 0 ? d < b : d >= a && d < b) && S().questions[id]) n++;
      });
      res.push({ date: new Date(a), count: n });
    }
    return res;
  }

  window.SRS = { preview, rate, autoSchedule, stateOf, fmt, dueQids, stats, forecast, endOfToday, DAY_MIN };
})();
