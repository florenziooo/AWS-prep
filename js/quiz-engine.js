/* Quiz engine: practice mode, exam simulation, spaced-repetition review, results and answer review.
   Sessions persist in Store.state.sessions so a refresh resumes exactly where you left off. */
(function () {
  const st = () => Store.state;
  const Q = id => STRATUS.questions[String(id).split('#')[0]]; // '#n' = re-queued copy in a review session
  const { esc, icon, L } = UI;
  let timer = null;

  /* ---------- Session lifecycle ---------- */
  function start(cfg) {
    const s = Object.assign({
      mode: 'practice', idx: 0, ans: {}, startedAt: Date.now(), elapsed: 0, finished: false, requeued: {}
    }, cfg);
    s.qids = cfg.qids.slice();
    st().sessions[s.key] = s;
    Store.save(true);
    location.hash = '#/play/' + encodeURIComponent(s.key);
  }
  const session = key => st().sessions[key];
  function discard(key) { delete st().sessions[key]; Store.save(); }

  function bankSessionConfig(bankId, opts) {
    const bank = STRATUS.banks[bankId];
    let qids = bank.qids.slice();
    const f = opts.filter || 'all';
    if (f === 'definition' || f === 'situational') qids = qids.filter(id => Q(id).category === f);
    if (f === 'incorrect') qids = qids.filter(id => st().answers[id] && st().answers[id].last === false);
    if (f === 'flagged') qids = qids.filter(id => st().flags[id]);
    if (f === 'unseen') qids = qids.filter(id => !st().answers[id]);
    if (opts.limit && opts.limit < qids.length) { qids = shuffle(qids).slice(0, opts.limit); }
    else if (opts.shuffle) qids = shuffle(qids);
    const full = f === 'all' && !opts.limit;
    return {
      key: opts.key || ('bank:' + bankId + (opts.mode === 'exam' ? ':exam' : '')),
      bank: bankId, kind: bank.kind, title: bank.title + (f !== 'all' ? ' · ' + filterLabel(f) : '') + (opts.limit ? ` · ${opts.limit}-question sim` : ''),
      mode: opts.mode || 'practice', qids, full, timeLimit: opts.timeLimit || null
    };
  }
  const filterLabel = f => ({ definition: 'Definition only', situational: 'Situational only', incorrect: 'Incorrect only', flagged: 'Flagged only', unseen: 'Unseen only' }[f] || f);
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ---------- Rendering ---------- */
  function optionsHTML(q, a, reveal, disabled) {
    return q.options.map((o, i) => {
      let cls = '', mark = '';
      if (reveal) {
        if (i === q.correctAnswer) { cls = 'correct'; mark = a && a.sel === i ? '✓ Your answer' : '✓ Correct answer'; }
        else if (a && a.sel === i) { cls = 'wrong'; mark = '✗ Your answer'; }
      } else if (a && a.sel === i) cls = 'sel';
      return `<button class="opt ${cls}" data-opt="${i}" ${disabled ? 'disabled' : ''} aria-pressed="${a && a.sel === i}"><span class="L">${L(i)}</span><span>${esc(o)}</span><span class="mark">${mark}</span></button>`;
    }).join('');
  }

  function feedbackHTML(q, a, extra) {
    const answered = a && a.sel != null;
    const ok = answered && a.sel === q.correctAnswer;
    const why = Object.keys(q.distractorExplanations).map(Number).sort().map(i =>
      `<li><b>${L(i)}</b><span>${esc(q.distractorExplanations[i])}</span></li>`).join('');
    const sec = window.Lectures ? Lectures.findSection(q.module, q.topic) : null;
    return `<div class="feedback ${ok ? 'is-ok' : 'is-bad'}">
      <div class="verdict"><span class="dot">${ok ? '✓' : '✗'}</span>${answered ? (ok ? 'Correct!' : 'Not quite.') : 'Not answered.'}
        <span class="muted small" style="font-weight:400">Correct answer: <b class="ok">${L(q.correctAnswer)}</b></span></div>
      <div>${esc(q.explanation)}</div>
      ${why ? `<h5>Why the other options are wrong</h5><ul class="why">${why}</ul>` : ''}
      ${q.note ? `<h5>Source note</h5><div class="small muted">${esc(q.note)}</div>` : ''}
      <div class="related">
        <span class="chip accent">${icon('layers')} ${esc(q.topic)}</span>
        ${q.module ? `<span class="chip">${esc(UI.modName(q.module))}</span>` : ''}
        <span class="chip">${esc(UI.domainName(q.domain))}</span>
        ${sec ? `<a class="btn sm ghost" href="#/lecture/${sec.mid}/${sec.sid}">${icon('book')} Revisit: ${esc(sec.title)}</a>` : ''}
        <span class="tiny muted" style="margin-left:auto">${esc(q.source)}</span>
      </div>
      ${extra || ''}
    </div>`;
  }

  function rateHTML(q, a, required) {
    const card = st().cards[q.id];
    const wrong = a.sel !== q.correctAnswer;
    const btn = (r, label, desc) => {
      const iv = SRS.fmt(SRS.preview(card, r).interval);
      const dis = wrong && (r === 'good' || r === 'easy');
      return `<button class="rate-btn ${r} ${a.rated === r ? 'on' : ''}" data-rate="${r}" ${dis ? 'disabled title="You answered incorrectly — choose Again or Hard"' : ''}><b>${label}</b><span>${desc} · ${iv}</span></button>`;
    };
    return `<div class="rate"><div class="row"><b style="font-weight:500">How well did you know this?</b><span class="small muted">${required ? 'Rate to continue.' : a.rated ? 'Scheduled ✓ — change if you like.' : 'Optional — unrated answers are scheduled automatically when you finish.'}</span></div>
      <div class="rate-btns">${btn('again', 'Again', 'Forgot')}${btn('hard', 'Hard', 'Struggled')}${btn('good', 'Good', 'Remembered')}${btn('easy', 'Easy', 'Instant')}</div></div>`;
  }

  function paletteHTML(s, reveal) {
    return s.qids.map((id, i) => {
      const a = s.ans[id]; let cls = '';
      if (a && a.sel != null) cls = reveal || (s.mode !== 'exam' && a.done) ? (a.sel === Q(id).correctAnswer ? 'ok' : 'bad') : 'answered';
      if (st().flags[Q(id).id]) cls += ' flag';
      if (i === s.idx) cls += ' cur';
      return `<button class="${cls}" data-goto="${i}" aria-label="Question ${i + 1}">${i + 1}</button>`;
    }).join('');
  }

  function counts(s) {
    let answered = 0, correct = 0;
    s.qids.forEach(id => { const a = s.ans[id]; if (a && a.sel != null && (s.mode === 'exam' || a.done)) { answered++; if (a.sel === Q(id).correctAnswer) correct++; } });
    return { answered, correct, flagged: s.qids.filter(id => !id.includes('#') && st().flags[id]).length };
  }

  function render(key) {
    const s = session(key);
    const view = document.getElementById('view');
    if (!s) { view.innerHTML = `<div class="empty">This quiz session no longer exists. <a href="#/quiz">Back to Quiz Mode</a></div>`; return; }
    if (s.finished && s.resultId) { location.hash = '#/results/' + s.resultId; return; }
    if (s.idx >= s.qids.length) s.idx = Math.max(0, s.qids.length - 1);
    const id = s.qids[s.idx], q = Q(id);
    if (!q) { view.innerHTML = `<div class="empty">No questions in this set. <a href="#/quiz">Back</a></div>`; return; }
    const a = s.ans[id] || {};
    const isExam = s.mode === 'exam', isReview = s.mode === 'review';
    const reveal = !isExam && a.done;
    const c = counts(s);
    const flagged = !!st().flags[q.id];
    const last = s.idx === s.qids.length - 1;

    let actions;
    if (isExam) {
      actions = `<button class="btn" data-act="prev" ${s.idx === 0 ? 'disabled' : ''}>${icon('left')} Previous</button>
        <div class="end">${last ? `<button class="btn accent" data-act="finish">Submit exam</button>` : `<button class="btn white" data-act="next">Next ${icon('right')}</button>`}</div>`;
    } else if (!a.done) {
      actions = `<button class="btn" data-act="prev" ${s.idx === 0 || isReview ? 'disabled' : ''}>${icon('left')} Previous</button>
        <div class="end">${isReview ? '' : `<button class="btn ghost" data-act="next">Skip ${icon('right')}</button>`}<button class="btn accent" data-act="submit" ${a.sel == null ? 'disabled' : ''}>Submit answer</button></div>`;
    } else {
      const needRate = isReview && !a.rated;
      actions = `<button class="btn" data-act="prev" ${s.idx === 0 || isReview ? 'disabled' : ''}>${icon('left')} Previous</button>
        <div class="end">${last ? `<button class="btn white" data-act="finish" ${needRate ? 'disabled' : ''}>${isReview ? 'Finish review' : 'Finish quiz'}</button>` : `<button class="btn white" data-act="next" ${needRate ? 'disabled' : ''}>Next question ${icon('right')}</button>`}</div>`;
    }

    const timeBox = s.timeLimit
      ? `<div class="small muted">Time remaining</div><div class="timer" id="q-timer">${UI.fmtTime(s.timeLimit - s.elapsed)}</div>`
      : `<div class="small muted">Time spent</div><div class="timer" id="q-timer">${UI.fmtTime(s.elapsed)}</div>`;

    view.innerHTML = `<div class="quiz-layout fade-in">
      <div>
        <div class="q-head">
          <span class="q-num">Question <b>${s.idx + 1}</b> of ${s.qids.length}</span>
          <span class="chip accent">${esc(s.title)}</span>
          ${isExam ? '<span class="chip warn">Exam simulation · no feedback until you submit</span>' : ''}
          ${isReview ? '<span class="chip info">Spaced repetition</span>' : ''}
          <div class="end"><button class="btn sm flag-btn ${flagged ? 'on' : ''}" data-act="flag" title="Flag for review (F)">${icon('flag')} ${flagged ? 'Flagged' : isExam ? 'Mark for review' : 'Flag'}</button></div>
        </div>
        <div class="card q-card">
          <div class="q-chips">${isExam ? '' : `<span class="chip">${esc(q.topic)}</span>`}${UI.catChip(q.category)}${UI.diffChip(q.difficulty)}<span class="chip">${esc(UI.domainName(q.domain))}</span></div>
          <div class="q-text">${esc(q.question)}</div>
          <div class="opts" role="group" aria-label="Answer choices">${optionsHTML(q, a, reveal, reveal)}</div>
          <div class="q-actions">${actions}</div>
          ${reveal ? feedbackHTML(q, a, rateHTML(q, a, isReview)) : ''}
        </div>
        <p class="tiny muted" style="margin-top:12px">Keys: <span class="mono">A–D / 1–4</span> select · <span class="mono">Enter</span> ${isExam ? 'next' : 'submit / next'} · <span class="mono">←/→</span> navigate · <span class="mono">F</span> flag${isExam ? '' : ' · after answering: <span class="mono">Q W E R</span> = Again / Hard / Good / Easy'}</p>
      </div>
      <aside class="quiz-side">
        <div class="card tight">${timeBox}
          <div style="margin:12px 0 6px">${UI.bar(100 * c.answered / s.qids.length)}</div>
          <div class="row between small"><span class="muted">${c.answered}/${s.qids.length} answered</span>${isExam ? `<span class="muted">${c.flagged} flagged</span>` : `<span class="ok">${c.correct} correct</span>`}</div>
        </div>
        <div class="card tight"><div class="small muted" style="margin-bottom:10px">Question navigator</div>
          <div class="palette">${paletteHTML(s, false)}</div>
          <div class="pal-legend"><span><i style="background:var(--surface-3)"></i>${isExam ? 'Answered' : 'Selected'}</span>${isExam ? '' : '<span><i style="background:var(--ok-bg);border-color:var(--ok)"></i>Correct</span><span><i style="background:var(--bad-bg);border-color:var(--bad)"></i>Incorrect</span>'}<span><i style="background:var(--warn);border-color:var(--warn);border-radius:50%"></i>Flagged</span></div>
        </div>
        <div class="card tight stack">
          <button class="btn ${isExam ? 'accent' : ''}" data-act="finish">${isExam ? 'Submit exam' : isReview ? 'End review session' : 'Finish & see results'}</button>
          <button class="btn ghost sm" data-act="quit">Save & exit</button>
        </div>
      </aside>
    </div>`;
    startTimer(key);
  }

  function startTimer(key) {
    clearInterval(timer);
    let lastTs = Date.now();
    timer = setInterval(() => {
      const s = session(key);
      if (!s || s.finished || !location.hash.startsWith('#/play/')) { clearInterval(timer); return; }
      const now = Date.now();
      if (document.visibilityState === 'visible') s.elapsed += (now - lastTs) / 1000;
      lastTs = now;
      const el = document.getElementById('q-timer');
      if (s.timeLimit) {
        const left = s.timeLimit - s.elapsed;
        if (el) { el.textContent = UI.fmtTime(left); el.classList.toggle('low', left < 300); }
        if (left <= 0) { clearInterval(timer); UI.toast('clock', 'Time is up', 'Your exam was submitted automatically.'); finish(key, true); return; }
      } else if (el) el.textContent = UI.fmtTime(s.elapsed);
      Store.save();
    }, 1000);
  }

  /* ---------- Interaction ---------- */
  function handle(key, act, val) {
    const s = session(key); if (!s) return;
    const id = s.qids[s.idx], q = Q(id);
    const a = s.ans[id] || (s.ans[id] = { sel: null });
    switch (act) {
      case 'opt':
        if (a.done && s.mode !== 'exam') return;
        a.sel = val; break;
      case 'submit':
        if (a.sel == null || a.done) return;
        a.done = true; a.ok = a.sel === q.correctAnswer;
        Progress.recordAnswer(q.id, a.ok);
        break;
      case 'rate': {
        if (!a.done) return;
        if (a.sel !== q.correctAnswer && (val === 'good' || val === 'easy')) return;
        if (a.rated) return rerate(s, q.id, a, val);
        const r = SRS.rate(q.id, val);
        a.rated = val;
        if (s.mode === 'review' || r.wasDue) Progress.recordReview(r.wasDue);
        if (s.mode === 'review' && val === 'again' && (s.requeued[q.id] || 0) < 2) {
          s.requeued[q.id] = (s.requeued[q.id] || 0) + 1;
          s.qids.push(q.id + '#' + s.requeued[q.id]); // show it again later in this session
        }
        break;
      }
      case 'next': if (s.idx < s.qids.length - 1) s.idx++; break;
      case 'prev': if (s.idx > 0 && s.mode !== 'review') s.idx--; break;
      case 'goto': if (s.mode !== 'review') s.idx = Math.max(0, Math.min(s.qids.length - 1, val)); break;
      case 'flag':
        if (st().flags[q.id]) delete st().flags[q.id]; else st().flags[q.id] = Date.now();
        break;
      case 'quit': Store.save(true); location.hash = s.mode === 'review' ? '#/review' : '#/quiz'; return;
      case 'finish': return confirmFinish(key);
    }
    Store.save();
    render(key);
    Progress.checkBadges();
  }

  function rerate(s, id, a, val) {
    // Replace the previous rating from this session (undo the last log entry for this card).
    const log = st().reviewLog;
    for (let i = log.length - 1; i >= 0; i--) if (log[i][1] === id) { log.splice(i, 1); break; }
    if (a.prevCard !== undefined) { if (a.prevCard) st().cards[id] = a.prevCard; else delete st().cards[id]; }
    SRS.rate(id, val); a.rated = val; Store.save(); render(s.key);
  }

  async function confirmFinish(key) {
    const s = session(key);
    const c = counts(s);
    const unanswered = s.qids.length - c.answered;
    if (s.mode === 'review') {
      const pending = s.qids.slice(s.idx).filter(id => !(s.ans[id] && s.ans[id].rated)).length;
      if (pending && !(await UI.confirm('End review session?', `${pending} card(s) in this session are not rated yet. They stay due and will be waiting next time.`, 'End session'))) return;
    } else if (s.mode === 'exam') {
      const ok = await UI.confirm('Submit exam?', `You answered <b>${c.answered}</b> of ${s.qids.length}. ${unanswered ? `<b class="bad">${unanswered} unanswered</b> question(s) will be scored as incorrect, as on the real exam. ` : ''}${c.flagged ? `${c.flagged} question(s) are flagged for review. ` : ''}You cannot change answers after submitting.`, 'Submit exam');
      if (!ok) return;
    } else if (unanswered) {
      const ok = await UI.confirm('Finish quiz?', `${unanswered} question(s) are unanswered. They will be listed as <b>unanswered</b>, not incorrect, and accuracy is based on answered questions only.`, 'Finish quiz');
      if (!ok) return;
    }
    finish(key);
  }

  /* ---------- Results ---------- */
  function finish(key) {
    const s = session(key); if (!s || s.finished) return;
    clearInterval(timer);
    const isExam = s.mode === 'exam';
    const realQids = s.qids.filter(id => !id.includes('#'));
    // Exam mode: answers are graded only now.
    if (isExam) realQids.forEach(id => { const a = s.ans[id]; if (a && a.sel != null) { a.done = true; a.ok = a.sel === Q(id).correctAnswer; Progress.recordAnswer(id, a.ok); } });
    // Schedule anything answered but not rated.
    realQids.forEach(id => { const a = s.ans[id]; if (a && a.done && !a.rated) { SRS.autoSchedule(id, a.ok); } });

    const r = summarize(s, realQids);
    if (s.mode !== 'review') {
      const res = st().results; res.push(r); if (res.length > 120) res.splice(0, res.length - 120);
      const bestKey = s.bank;
      // Completion rewards need every question answered, so submitting an empty exam earns nothing.
      const complete = r.answered === r.total;
      if (s.full && bestKey) {
        const prevBest = st().best[bestKey];
        st().best[bestKey] = Math.max(prevBest || 0, r.pct);
        if (complete && !st().completedBanks[bestKey]) { st().completedBanks[bestKey] = Date.now(); Progress.addXP(50); r.xpBonus = 50; }
        if (r.pct >= 80) { Progress.addXP(25); r.xpBonus = (r.xpBonus || 0) + 25; }
        if (complete && bestKey === 'fb' && realQids.length >= 120) { Progress.addXP(200); r.xpBonus = (r.xpBonus || 0) + 200; }
        if (prevBest != null && r.pct > prevBest) r.newBest = true;
      }
    }
    s.finished = true; s.resultId = r.id;
    if (s.mode === 'review') { delete st().sessions[key]; st().lastReview = r; }
    Store.save(true);
    Progress.checkBadges();
    location.hash = s.mode === 'review' ? '#/review/done' : '#/results/' + r.id;
  }

  function summarize(s, qids) {
    const blank = () => ({ n: 0, c: 0, a: 0 });
    const r = {
      id: 'r' + Date.now().toString(36), ts: Date.now(), bank: s.bank || null, kind: s.kind || s.mode, mode: s.mode, title: s.title,
      full: !!s.full, total: qids.length, answered: 0, correct: 0, incorrect: 0, unanswered: 0, seconds: Math.round(s.elapsed),
      byCat: {}, byDomain: {}, byModule: {}, topics: {}, items: []
    };
    qids.forEach(id => {
      const q = Q(id), a = s.ans[id];
      const sel = a && a.sel != null && (a.done || s.mode === 'exam') ? a.sel : null;
      const ok = sel === q.correctAnswer;
      r.items.push([id, sel]);
      if (sel == null) r.unanswered++; else { r.answered++; ok ? r.correct++ : r.incorrect++; }
      [[r.byCat, q.category], [r.byDomain, q.domain], [r.byModule, q.module || 0], [r.topics, (q.module || 0) + '|' + q.topic]].forEach(([obj, k]) => {
        const g = obj[k] || (obj[k] = blank()); g.n++; if (sel != null) g.a++; if (ok) g.c++;
      });
    });
    // Practice: accuracy over answered; Exam: unanswered count as wrong (like AWS).
    r.pct = r.total ? Math.round(100 * r.correct / r.total) : 0;
    r.acc = r.answered ? Math.round(100 * r.correct / r.answered) : 0;
    if (s.mode === 'exam' || s.bank === 'fb') r.scaled = Math.round(100 + 900 * r.correct / Math.max(1, r.total));
    return r;
  }

  function resultView(rid) {
    const r = st().results.find(x => x.id === rid);
    const view = document.getElementById('view');
    if (!r) { view.innerHTML = `<div class="empty">Result not found. <a href="#/quiz">Back to Quiz Mode</a></div>`; return; }
    const pctOf = g => g && g.n ? Math.round(100 * g.c / g.n) : null;
    const hb = (label, g, extra) => `<div class="hbar"><div>${label}${extra || ''}</div>${UI.bar(pctOf(g))}<div class="v">${g ? `${g.c}/${g.n}` : '—'}</div></div>`;
    const isExamLike = r.scaled != null;
    const domains = Object.values(STRATUS.domains).filter(d => r.byDomain[d.id]).map(d => hb(`${d.name} <span class="tiny muted">${d.weight}% of exam</span>`, r.byDomain[d.id])).join('');
    const mods = Object.keys(r.byModule).length > 1 ? STRATUS.modules.filter(m => r.byModule[m.num]).map(m => hb(`M${m.num} · ${m.short}`, r.byModule[m.num])).join('') : '';
    const weak = Object.entries(r.topics).map(([k, g]) => { const [m, t] = k.split('|'); return { m: +m, t, ...g, p: g.c / g.n }; })
      .filter(x => x.c < x.n).sort((a, b) => a.p - b.p || b.n - a.n).slice(0, 6);
    const recs = []; const seen = new Set();
    weak.forEach(w => { const sec = Lectures.findSection(w.m, w.t); if (sec && !seen.has(sec.mid + sec.sid)) { seen.add(sec.mid + sec.sid); recs.push(sec); } });
    const reviewItems = r.items.map(([id, sel], i) => ({ id, sel, i, q: Q(id) })).filter(x => x.q && (x.sel !== x.q.correctAnswer || st().flags[x.id]));
    const passLine = isExamLike
      ? `<div class="pass-banner ${r.scaled >= 700 ? 'ok' : 'bad'}"><div><b>Simulated score ${r.scaled} / 1000</b> — ${r.scaled >= 700 ? 'above' : 'below'} the 700 passing mark used by AWS.
         <div class="tiny muted">Simulation only: this maps percent-correct linearly onto 100–1000. AWS uses scaled scoring across exam forms, 15 unscored questions and a compensatory model — a practice score never guarantees certification.</div></div></div>` : '';
    const def = r.byCat.definition, sit = r.byCat.situational;

    view.innerHTML = `<div class="fade-in">
      <div class="card glow-card" style="padding:30px">
        <div class="res-hero">
          ${UI.gauge(isExamLike ? r.scaled : r.pct, isExamLike ? 1000 : 100, isExamLike ? 'Simulated scaled score' : 'Score', `${r.correct} of ${r.total} correct`)}
          <div class="stack">
            <div><span class="chip accent">${esc(r.title)}</span> <span class="chip">${r.mode === 'exam' ? 'Exam simulation' : 'Practice'}</span> ${r.newBest ? '<span class="chip ok">New personal best!</span>' : ''} ${r.xpBonus ? `<span class="chip ok">+${r.xpBonus} XP bonus</span>` : ''}</div>
            <h1 style="font-weight:400">${r.pct >= 90 ? 'Outstanding work.' : r.pct >= 75 ? 'Solid performance.' : r.pct >= 60 ? 'Getting there.' : 'Good diagnostic — now review.'}</h1>
            <div class="res-kpis">
              <div class="stat"><b>${r.total}</b><span>Total questions</span></div>
              <div class="stat"><b class="ok">${r.correct}</b><span>Correct</span></div>
              <div class="stat"><b class="bad">${r.incorrect}</b><span>Incorrect</span></div>
              <div class="stat"><b>${r.unanswered}</b><span>Unanswered${r.mode === 'exam' ? ' (scored wrong)' : ''}</span></div>
              <div class="stat"><b>${r.acc}%</b><span>Accuracy (answered)</span></div>
              <div class="stat"><b>${pctOf(def) == null ? '—' : pctOf(def) + '%'}</b><span>Definition ${def ? `${def.c}/${def.n}` : ''}</span></div>
              <div class="stat"><b>${pctOf(sit) == null ? '—' : pctOf(sit) + '%'}</b><span>Situational ${sit ? `${sit.c}/${sit.n}` : ''}</span></div>
              <div class="stat"><b>${UI.fmtDur(r.seconds)}</b><span>Time spent</span></div>
            </div>
            ${passLine}
          </div>
        </div>
      </div>
      <div class="grid g2" style="margin-top:18px">
        <div class="card"><div class="card-head"><div class="ic">${icon('target')}</div><h3>Performance by exam domain</h3></div><div class="hbars">${domains}</div>
          <div class="card-head" style="margin-top:22px"><div class="ic">${icon('layers')}</div><h3>Definition vs situational</h3></div>
          <div class="hbars">${hb('Definition & knowledge', def)}${hb('Situational & application', sit)}</div>
          ${mods ? `<div class="card-head" style="margin-top:22px"><div class="ic">${icon('book')}</div><h3>Performance by module</h3></div><div class="hbars">${mods}</div>` : ''}
        </div>
        <div class="stack">
          <div class="card"><div class="card-head"><div class="ic">${icon('bolt')}</div><h3>Weakest concepts</h3></div>
            ${weak.length ? `<div class="hbars">${weak.map(w => `<div class="hbar"><div>${esc(w.t)} <span class="tiny muted">M${w.m || '–'}</span></div>${UI.bar(100 * w.p)}<div class="v">${w.c}/${w.n}</div></div>`).join('')}</div>` : '<div class="empty">No weak concepts in this attempt.</div>'}
          </div>
          <div class="card"><div class="card-head"><div class="ic">${icon('book')}</div><h3>Recommended lecture sections</h3></div>
            ${recs.length ? `<div class="stack">${recs.map(x => `<a class="review-item" href="#/lecture/${x.mid}/${x.sid}"><span class="n">M${x.num}</span><span class="t">${esc(x.title)} <span class="muted">· ${esc(x.modTitle)}</span></span>${icon('right')}</a>`).join('')}</div>` : '<div class="empty">Nothing to revisit — try the next module.</div>'}
          </div>
        </div>
      </div>
      <div class="section-title"><h2>Questions requiring review</h2><span class="muted small">${reviewItems.length} incorrect, unanswered or flagged</span>
        <div class="end row">
          <a class="btn" href="#/answers/${r.id}/0">${icon('eye')} Review all answers</a>
          ${reviewItems.length && r.bank ? `<button class="btn accent" data-retry="${r.id}">${icon('repeat')} Retry incorrect</button>` : ''}
          <a class="btn white" href="#/quiz">Back to Quiz Mode</a>
        </div></div>
      ${reviewItems.length ? `<div class="review-list">${reviewItems.map(x => `<a class="review-item" href="#/answers/${r.id}/${x.i}"><span class="n">#${x.i + 1}</span><span class="t">${esc(x.q.question)}</span><span class="chip ${x.sel == null ? 'warn' : x.sel === x.q.correctAnswer ? 'ok' : 'bad'}">${x.sel == null ? 'Unanswered' : x.sel === x.q.correctAnswer ? 'Flagged' : 'Incorrect'}</span></a>`).join('')}</div>` : '<div class="empty">Every question correct and nothing flagged.</div>'}
      <p class="tiny muted" style="margin-top:18px">All answered questions have been added to your spaced-repetition deck (unrated correct answers → Good, incorrect → Again).</p>
    </div>`;
    view.querySelectorAll('[data-retry]').forEach(b => b.onclick = () => {
      const ids = r.items.filter(([id, sel]) => Q(id) && sel !== Q(id).correctAnswer).map(x => x[0]);
      start({ key: 'retry:' + r.id, bank: null, kind: 'custom', title: 'Retry · ' + r.title, mode: 'practice', qids: ids, full: false });
    });
  }

  /* Read-only answer review for a finished result */
  function answersView(rid, idx) {
    const r = st().results.find(x => x.id === rid);
    const view = document.getElementById('view');
    if (!r) { view.innerHTML = `<div class="empty">Result not found.</div>`; return; }
    idx = Math.max(0, Math.min(r.items.length - 1, idx | 0));
    const [id, sel] = r.items[idx], q = Q(id), a = { sel };
    view.innerHTML = `<div class="quiz-layout fade-in"><div>
      <div class="q-head"><span class="q-num">Reviewing <b>${idx + 1}</b> of ${r.items.length}</span><span class="chip accent">${esc(r.title)}</span>
        <div class="end"><button class="btn sm flag-btn ${st().flags[id] ? 'on' : ''}" data-flag="${id}">${icon('flag')} ${st().flags[id] ? 'Flagged' : 'Flag'}</button></div></div>
      <div class="card q-card"><div class="q-chips"><span class="chip">${esc(q.topic)}</span>${UI.catChip(q.category)}${UI.diffChip(q.difficulty)}<span class="chip">${esc(UI.domainName(q.domain))}</span></div>
        <div class="q-text">${esc(q.question)}</div><div class="opts">${optionsHTML(q, a, true, true)}</div>
        ${feedbackHTML(q, a)}
        <div class="q-actions"><a class="btn ${idx === 0 ? 'hidden' : ''}" href="#/answers/${rid}/${idx - 1}">${icon('left')} Previous</a>
          <div class="end">${idx < r.items.length - 1 ? `<a class="btn white" href="#/answers/${rid}/${idx + 1}">Next ${icon('right')}</a>` : ''}<a class="btn" href="#/results/${rid}">Back to results</a></div></div>
      </div></div>
      <aside class="quiz-side"><div class="card tight"><div class="small muted" style="margin-bottom:10px">Answer map</div>
        <div class="palette">${r.items.map(([qid, s2], i) => { const qq = Q(qid); const cls = s2 == null ? '' : s2 === qq.correctAnswer ? 'ok' : 'bad'; return `<a href="#/answers/${rid}/${i}"><button class="${cls}${i === idx ? ' cur' : ''}${st().flags[qid] ? ' flag' : ''}" tabindex="-1" style="width:100%">${i + 1}</button></a>`; }).join('')}</div></div></aside></div>`;
    view.querySelectorAll('[data-flag]').forEach(b => b.onclick = () => { const k = b.dataset.flag; if (st().flags[k]) delete st().flags[k]; else st().flags[k] = Date.now(); Store.save(); answersView(rid, idx); });
  }

  /* ---------- Delegated events for the play view ---------- */
  document.addEventListener('click', e => {
    if (!location.hash.startsWith('#/play/')) return;
    const key = decodeURIComponent(location.hash.slice(7));
    const t = e.target.closest('[data-opt],[data-act],[data-goto],[data-rate]');
    if (!t || !document.getElementById('view').contains(t) || t.disabled) return;
    const s = session(key);
    if (t.dataset.rate && s) { const id = s.qids[s.idx], a = s.ans[id]; if (a && !a.rated) a.prevCard = st().cards[Q(id).id] ? Object.assign({}, st().cards[Q(id).id]) : null; }
    if (t.dataset.opt != null) handle(key, 'opt', +t.dataset.opt);
    else if (t.dataset.goto != null) handle(key, 'goto', +t.dataset.goto);
    else if (t.dataset.rate) handle(key, 'rate', t.dataset.rate);
    else handle(key, t.dataset.act);
  });
  document.addEventListener('keydown', e => {
    if (!location.hash.startsWith('#/play/') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector('.modal-wrap') || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const key = decodeURIComponent(location.hash.slice(7)), s = session(key); if (!s) return;
    const id = s.qids[s.idx], a = s.ans[id] || {};
    const k = e.key.toLowerCase();
    const map = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 };
    if (k in map && !(a.done && s.mode !== 'exam')) { handle(key, 'opt', map[k]); e.preventDefault(); }
    else if (a.done && s.mode !== 'exam' && 'qwer'.includes(k) && k.length === 1) {
      const r = { q: 'again', w: 'hard', e: 'good', r: 'easy' }[k];
      const b = document.querySelector(`[data-rate="${r}"]`); if (b && !b.disabled) b.click();
    }
    else if (k === 'enter') {
      const b = document.querySelector('[data-act="submit"]:not(:disabled)') || document.querySelector('.q-actions [data-act="next"]:not(:disabled)') || document.querySelector('.q-actions [data-act="finish"]:not(:disabled)');
      if (b) { b.click(); e.preventDefault(); }
    }
    else if (k === 'arrowright') handle(key, 'next');
    else if (k === 'arrowleft') handle(key, 'prev');
    else if (k === 'f') handle(key, 'flag');
  });

  window.Quiz = { start, session, discard, render, bankSessionConfig, resultView, answersView, finish, counts };
})();
