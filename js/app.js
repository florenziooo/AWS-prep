/* Page views: dashboard, quiz hub, spaced-repetition hub, analytics. Boot at the bottom. */
(function () {
  const st = () => Store.state;
  const { esc, icon } = UI;
  const view = () => document.getElementById('view');
  const Q = id => STRATUS.questions[id];
  const EXTRA = ['pe', 'kcs', 'fb'];

  /* ---------- Shared bits ---------- */
  function recommendation() {
    const due = SRS.stats().due;
    if (due >= 10) return { eyebrow: 'Spaced repetition', title: 'Clear your review queue', desc: `${due} cards are due today. Reviewing on time is what turns short-term recall into long-term memory.`, meta: [['clock', `~${Math.ceil(due * 0.5)} min`], ['repeat', `${due} cards`]], href: '#/review', cta: 'Start review' };
    for (const m of STRATUS.modules) {
      const p = Lectures.progressOf(m.id);
      if (!p.completed) return { eyebrow: `Module ${m.num} lecture`, title: m.title, desc: p.seen ? `You have read ${p.seen} of ${p.total} sections. Pick up where you left off, then finish with the quick knowledge check.` : 'Start with the ELI5 explanation, then work up to exam-level scenarios. Recall prompts are built in.', meta: [['clock', `${STRATUS.lectures[m.id].minutes} min`], ['book', 'Guided lecture']], href: `#/lecture/${m.id}`, cta: p.seen ? 'Continue lecture' : 'Start lecture' };
      const best = st().best[m.id];
      if (best == null || best < 80) return { eyebrow: `Module ${m.num} quiz`, title: `Practise ${m.short}`, desc: best == null ? '30 questions — 15 definition, 15 situational — with detailed explanations after each answer.' : `Your best is ${best}%. Aim for 80 %+ before moving on.`, meta: [['quiz', '30 questions'], ['target', 'Target 80 %']], href: `#/quiz/${m.id}`, cta: 'Start quiz' };
    }
    if (due) return { eyebrow: 'Spaced repetition', title: 'Finish today\'s reviews', desc: `${due} cards due.`, meta: [['repeat', `${due} cards`]], href: '#/review', cta: 'Start review' };
    if (!st().completedBanks.pe) return { eyebrow: 'Section A', title: 'AWS Practice Exam — Clean Notes', desc: 'All 50 course practice-exam questions with corrected answers and explanations.', meta: [['quiz', '50 questions']], href: '#/quiz/pe', cta: 'Start' };
    if (!st().completedBanks.kcs) return { eyebrow: 'Section B', title: 'Knowledge Check + Slido', desc: 'The consolidated course knowledge checks and Slido recap.', meta: [['quiz', STRATUS.banks.kcs.qids.length + ' questions']], href: '#/quiz/kcs', cta: 'Start' };
    return { eyebrow: 'Section C', title: 'Face the Final Boss', desc: '120 questions across every domain. Try Exam Simulation mode for timed, no-feedback conditions.', meta: [['clock', '165 min'], ['trophy', '120 questions']], href: '#/quiz/fb', cta: 'Enter the arena' };
  }

  function weekStrip() {
    const days = Analytics.lastDays(7);
    return `<div class="days">${days.map((d, i) => `<div class="day ${Progress.isActive(d.key) ? 'done' : ''} ${i === 6 ? 'today' : ''}" title="${d.xp} XP"><div class="c">${d.date.getDate()}</div><span>${d.date.toLocaleDateString(undefined, { weekday: 'short' })}</span></div>`).join('')}</div>`;
  }

  function pillGrid(weeks) {
    // Columns are Monday-start weeks; the last column is the current week (future days dimmed).
    const n = weeks * 7, offset = 6 - ((new Date().getDay() + 6) % 7);
    const cells = [];
    for (let i = n - 1 - offset; i >= -offset; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = Store.todayKey(d), x = st().days[k], future = i < 0;
      cells.push(`<i class="${future ? '' : 'l' + Analytics.heatLevel(x && x.xp)} ${i === 0 ? 'today' : ''}" style="${future ? 'opacity:.25' : ''}" title="${k}: ${x ? x.xp : 0} XP"></i>`);
    }
    return `<div class="pillgrid">${cells.join('')}</div><div class="legend"><span><i style="background:var(--pill-on)"></i>Goal reached (60+ XP)</span><span><i style="background:#a59a92"></i>Active day (20+)</span><span><i style="background:var(--pill-mid)"></i>Partial</span><span><i></i>No activity</span></div>`;
  }

  function forecastDots(days) {
    const f = SRS.forecast(days), max = Math.max(5, ...f.map(x => x.count));
    return `<div class="dotmatrix">${f.map((x, i) => {
      const dots = 10, on = Math.round(dots * x.count / max);
      return `<div class="dcol"><div class="col">${Array.from({ length: dots }, (_, j) => `<i class="${j < on ? (i === 0 ? 'hot' : 'on') : ''}"></i>`).join('')}</div><div class="cnt">${x.count}</div><div class="lbl">${i === 0 ? 'Today' : x.date.toLocaleDateString(undefined, { weekday: 'short' })}</div></div>`;
    }).join('')}</div>`;
  }

  function moduleCard(m) {
    const p = Lectures.progressOf(m.id), ms = Progress.moduleMastery(m.id), best = st().best[m.id];
    const status = st().completedBanks[m.id] && p.completed ? '<span class="chip ok">Complete</span>' : p.seen || st().completedBanks[m.id] ? '<span class="chip warn">In progress</span>' : '<span class="chip">Not started</span>';
    return `<div class="module-card"><div class="num">Module ${m.num} ${status}</div>
      <h4>${esc(m.title)}</h4>
      <div class="row between small"><span class="muted">Lecture</span><span>${p.completed ? '✓ Done' : p.pct + '%'}</span></div>
      <div class="row between small"><span class="muted">Quiz best</span><span class="${UI.pctClass(best)}">${best == null ? '—' : best + '%'}</span></div>
      <div class="row between small"><span class="muted">${ms.label}</span>${UI.mastery(ms.dots)}</div>
      <div class="acts"><a class="btn sm white" href="#/lecture/${m.id}">Lecture</a><a class="btn sm" href="#/quiz/${m.id}">Quiz</a></div></div>`;
  }

  /* ---------- Dashboard ---------- */
  function dashboard() {
    const rec = recommendation(), s = SRS.stats(), sk = Progress.streak(), lv = Progress.levelInfo();
    const ready = Analytics.readiness(), t = Analytics.totals();
    const lecDone = STRATUS.modules.filter(m => Lectures.progressOf(m.id).completed).length;
    const quizDone = STRATUS.modules.filter(m => st().completedBanks[m.id]).length;
    const overall = Math.round((lecDone / 10 + quizDone / 10 + s.mastered / Math.max(1, s.total)) / 3 * 100);
    const week = Analytics.lastDays(14), thisW = week.slice(7), lastW = week.slice(0, 7);
    const acc = arr => { const a = arr.reduce((x, d) => x + d.answered, 0), c = arr.reduce((x, d) => x + d.correct, 0); return a ? Math.round(100 * c / a) : null; };
    const accNow = acc(thisW), accPrev = acc(lastW);
    const recent = st().results.slice(-5).reverse();
    const weak = Analytics.weakTopics(5);
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const avgSession = (() => { const d = Object.values(st().days).filter(x => x.seconds > 0); return d.length ? Math.round(d.reduce((a, x) => a + x.seconds, 0) / d.length / 60) : 0; })();

    view().innerHTML = `<div class="fade-in">
      <div class="grid g3">
        <div class="card glow-card hero span2">
          <div class="top"><span style="font-size:22px;color:#fff">${icon('sparkle', '')}</span><b style="font-weight:500;font-size:20px">${greet}</b>
            <span class="chip loc">${icon('pin')} CLF-C02 · ${t.distinct} of ${Object.keys(STRATUS.questions).length} questions seen</span></div>
          ${weekStrip()}
          <div class="hero-body">
            <div class="eyebrow">${esc(rec.eyebrow)} · Stratus recommendation</div>
            <h1>${esc(rec.title)}</h1>
            <p>${esc(rec.desc)}</p>
            <div class="meta">${rec.meta.map(([i, txt]) => `<span>${icon(i)} ${esc(txt)}</span>`).join('')}</div>
            <a class="btn white lg" href="${rec.href}">${icon('play')} ${esc(rec.cta)}</a>
          </div>
        </div>
        <div class="card" style="display:flex;flex-direction:column">
          <div class="card-head"><h3>Exam readiness</h3><span class="chip end">${icon('target')} Estimate</span></div>
          ${UI.gauge(ready, 100)}
          <div style="text-align:center;margin-top:-6px">
            <span class="chip ${accNow != null && accPrev != null && accNow >= accPrev ? 'ok' : ''}">${icon('chart')} ${accNow == null ? 'No answers this week yet' : accPrev == null ? `${accNow}% accuracy this week` : `${accNow - accPrev >= 0 ? '+' : ''}${accNow - accPrev}% vs last week`}</span>
            <p class="small muted" style="margin-top:12px">Domain-weighted accuracy × coverage across all four CLF-C02 domains. A study signal, not a predicted AWS score.</p>
          </div>
          <div class="kpis k3" style="margin-top:auto;padding-top:14px;border-top:1px solid var(--line)">
            <div class="stat"><b>${overall}%</b><span>Overall progress</span></div>
            <div class="stat"><b>${lecDone}/10</b><span>Lectures</span></div>
            <div class="stat"><b>${quizDone}/10</b><span>Module quizzes</span></div>
          </div>
        </div>
      </div>

      <div class="grid g4" style="margin-top:18px">
        <div class="card"><div class="card-head"><div class="ic">${icon('repeat')}</div><h3>Due today</h3></div><div class="stat"><b class="xl">${s.due}</b><span>${s.new} new · ${s.learning + s.relearning} learning · ${s.mastered} mastered</span></div>
          <a class="btn ${s.due ? 'accent' : ''} sm" style="margin-top:14px" href="#/review">${s.due ? 'Review now' : 'Open deck'}</a></div>
        <div class="card"><div class="card-head"><div class="ic">${icon('flame')}</div><h3>Daily streak</h3></div><div class="stat"><b class="xl">${sk.current}</b><span>Best ${sk.best} days · ${sk.todayDone ? 'today counted ✓' : `${Math.max(0, Progress.ACTIVE_XP - Store.day().xp)} XP to keep it`}</span></div></div>
        <div class="card"><div class="card-head"><div class="ic">${icon('star')}</div><h3>Level ${lv.level}</h3></div><div class="stat"><b>${lv.title}</b><span>${lv.xp} XP · ${lv.span - lv.into} to next level</span></div><div style="margin-top:14px">${UI.bar(100 * lv.into / lv.span)}</div></div>
        <div class="card"><div class="card-head"><div class="ic">${icon('clock')}</div><h3>Study time</h3></div><div class="stat"><b class="xl">${Math.round(t.seconds / 60)}</b><span>minutes total · ${avgSession} min average per study day</span></div></div>
      </div>

      <div class="grid g3" style="margin-top:18px">
        <div class="card span2"><div class="card-head"><div class="ic">${icon('brain')}</div><h3>Study activity</h3><span class="chip end">Last 18 weeks</span></div>${pillGrid(18)}</div>
        <div class="card"><div class="card-head"><div class="ic">${icon('bolt')}</div><h3>Review forecast</h3><span class="chip end">7 days</span></div>${forecastDots(7)}
          <div class="forecast-foot"><div class="row between small"><span class="muted">Retention</span><b style="font-weight:500">${s.retention == null ? '—' : s.retention + '%'}</b></div>
          <div class="slider"><span class="knob" style="left:${s.retention == null ? 50 : s.retention}%">${icon('heart', '')}</span></div>
          <div class="tiny muted">${s.retention == null ? 'Appears once cards older than a day are reviewed.' : `Based on ${s.retentionN} reviews of mature cards.`}</div></div></div>
      </div>

      <div class="section-title"><h2>Your ten modules</h2><span class="muted small">Lecture → quiz → spaced review</span><a class="btn sm end" href="#/lecture">All lectures ${icon('right')}</a></div>
      <div class="grid g5">${STRATUS.modules.map(moduleCard).join('')}</div>

      <div class="grid g3" style="margin-top:24px">
        <div class="card"><div class="card-head"><div class="ic">${icon('trophy')}</div><h3>Recent quiz results</h3></div>
          ${recent.length ? `<div class="review-list">${recent.map(r => `<a class="review-item" href="#/results/${r.id}"><span class="n">${new Date(r.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><span class="t">${esc(r.title)}</span><span class="chip ${UI.pctClass(r.pct)}">${r.pct}%</span></a>`).join('')}</div>` : '<div class="empty">No quizzes finished yet.</div>'}</div>
        <div class="card"><div class="card-head"><div class="ic">${icon('target')}</div><h3>Weakest topics</h3></div>
          ${weak.length ? `<div class="hbars">${weak.map(w => { const sec = Lectures.findSection(w.module, w.topic); return `<div class="hbar" style="grid-template-columns:1fr 70px 44px"><a href="${sec ? `#/lecture/${sec.mid}/${sec.sid}` : '#/lecture'}">${esc(w.topic)}</a>${UI.bar(w.pct)}<div class="v">${w.pct}%</div></div>`; }).join('')}</div>` : '<div class="empty">Answer some questions to find your weak spots.</div>'}</div>
        <div class="card boss"><div class="card-head"><div class="ic">${icon('layers')}</div><h3>Beyond the modules</h3></div>
          <div class="stack">
            <a class="review-item" href="#/quiz/pe"><span class="n">A</span><span class="t">Practice Exam — Clean Notes <span class="muted">· ${STRATUS.banks.pe.qids.length} Qs</span></span><span class="chip">${st().best.pe == null ? '—' : st().best.pe + '%'}</span></a>
            <a class="review-item" href="#/quiz/kcs"><span class="n">B</span><span class="t">Knowledge Check + Slido <span class="muted">· ${STRATUS.banks.kcs.qids.length} Qs</span></span><span class="chip">${st().best.kcs == null ? '—' : st().best.kcs + '%'}</span></a>
            <a class="review-item" href="#/quiz/fb"><span class="n">C</span><span class="t">Final Boss <span class="muted">· 120 Qs</span></span><span class="chip">${st().best.fb == null ? '—' : st().best.fb + '%'}</span></a>
          </div></div>
      </div></div>`;
  }

  /* ---------- Quiz hub ---------- */
  function bankCard(bankId, label) {
    const b = STRATUS.banks[bankId], best = st().best[bankId];
    const last = st().results.slice().reverse().find(r => r.bank === bankId);
    const attempts = st().results.filter(r => r.bank === bankId).length;
    const wrong = b.qids.filter(id => st().answers[id] && st().answers[id].last === false).length;
    const sess = st().sessions['bank:' + bankId];
    const inProg = sess && !sess.finished;
    const m = STRATUS.moduleById(bankId), ms = m ? Progress.moduleMastery(bankId) : null;
    const d = b.qids.filter(id => Q(id).category === 'definition').length;
    return `<div class="card bank-card">
      <div class="row"><span class="chip">${label}</span>${inProg ? '<span class="chip warn">In progress</span>' : ''}${ms ? `<span style="margin-left:auto">${UI.mastery(ms.dots)}</span>` : ''}</div>
      <h3>${esc(m ? m.title : b.title)}</h3>
      <div class="small muted">${b.qids.length} questions · ${d} definition · ${b.qids.length - d} situational</div>
      <div class="score-line"><b class="${UI.pctClass(best)}">${best == null ? '—' : best + '%'}</b><span class="small muted">best${last ? ` · last ${last.pct}%` : ''} · ${attempts} attempt${attempts === 1 ? '' : 's'}</span></div>
      ${UI.bar(best || 0)}
      <div class="row wrap">
        ${inProg ? `<a class="btn white sm" href="#/play/${encodeURIComponent('bank:' + bankId)}">${icon('play')} Resume</a>` : ''}
        <button class="btn ${inProg ? '' : 'white'} sm" data-start="${bankId}">${icon('play')} ${inProg ? 'New attempt' : 'Start'}</button>
        ${wrong ? `<button class="btn sm" data-wrong="${bankId}">${icon('repeat')} Review incorrect (${wrong})</button>` : ''}
        ${m ? `<a class="btn sm ghost" href="#/lecture/${bankId}">${icon('book')} Lecture</a>` : ''}
      </div></div>`;
  }

  function quizHub(openBank) {
    const fbS = st().sessions['bank:fb:exam'];
    const flagged = Object.keys(st().flags).filter(Q);
    const wrongAll = Object.keys(st().answers).filter(id => Q(id) && st().answers[id].last === false);
    const total = Object.keys(STRATUS.questions).length;
    view().innerHTML = `<div class="fade-in">
      <div class="card glow-card lec-hero"><span class="chip">${icon('quiz')} Quiz Mode</span>
        <h1>Practise until it's boring. Then review.</h1>
        <p>Answers stay hidden until you commit. After each answer you get the explanation, why each distractor is wrong, a link back to the lecture, and an Again / Hard / Good / Easy rating that schedules the card in your spaced-repetition deck.</p>
        <div class="row wrap" style="margin-top:14px"><span class="chip">300 module questions</span><span class="chip">${STRATUS.banks.pe.qids.length} Clean Notes</span><span class="chip">${STRATUS.banks.kcs.qids.length} Knowledge Check + Slido</span><span class="chip">120 Final Boss</span><span class="chip accent">${total} total</span></div>
      </div>
      <div class="section-title"><h2>Module quizzes</h2><span class="muted small">30 questions each · 15 definition + 15 situational</span></div>
      <div class="grid g3">${STRATUS.modules.map(m => bankCard(m.id, 'Module ' + m.num)).join('')}</div>

      <div class="section-title"><h2>Additional assessments</h2><span class="muted small">Built from your CSIT341 materials, plus the final exam</span></div>
      <div class="grid g3">
        ${bankCard('pe', 'Section A · Course practice exam')}
        ${bankCard('kcs', 'Section B · Knowledge Check + Slido')}
        <div class="card boss bank-card"><span class="chip accent">Section C · Final Boss</span>
          <h2>The 120-question final</h2>
          <div class="small muted">60 definition + 60 situational across all 10 modules, weighted like CLF-C02 (24 / 30 / 34 / 12 %).</div>
          <div class="score-line"><b class="${UI.pctClass(st().best.fb)}">${st().best.fb == null ? '—' : st().best.fb + '%'}</b><span class="small muted">best full attempt</span></div>
          <div class="stack">
            <button class="btn white" data-start="fb">${icon('eye')} Practice mode · instant feedback</button>
            ${fbS && !fbS.finished ? `<a class="btn accent" href="#/play/${encodeURIComponent('bank:fb:exam')}">${icon('play')} Resume exam simulation</a>` : ''}
            <button class="btn accent" data-exam="full">${icon('clock')} Exam simulation · 120 Q · 165 min</button>
            <button class="btn" data-exam="short">${icon('clock')} Official-length sim · 65 Q · 90 min</button>
          </div></div>
      </div>

      <div class="section-title"><h2>Your custom decks</h2></div>
      <div class="grid g3">
        <div class="card bank-card"><h3>${icon('flag', '')} Flagged questions</h3><div class="small muted">${flagged.length} bookmarked across all quizzes</div>
          <div><button class="btn sm ${flagged.length ? 'white' : ''}" data-custom="flagged" ${flagged.length ? '' : 'disabled'}>Practise flagged</button></div></div>
        <div class="card bank-card"><h3>${icon('x', '')} Currently incorrect</h3><div class="small muted">${wrongAll.length} questions whose last answer was wrong</div>
          <div><button class="btn sm ${wrongAll.length ? 'white' : ''}" data-custom="wrong" ${wrongAll.length ? '' : 'disabled'}>Practise incorrect</button></div></div>
        <div class="card bank-card"><h3>${icon('shuffle', '')} Random mixed set</h3><div class="small muted">20 random questions from the 300 module questions</div>
          <div><button class="btn sm white" data-custom="mixed">Start mixed set</button></div></div>
      </div></div>`;

    const v = view();
    v.querySelectorAll('[data-start]').forEach(b => b.onclick = () => startDialog(b.dataset.start));
    v.querySelectorAll('[data-wrong]').forEach(b => b.onclick = () => Quiz.start(Quiz.bankSessionConfig(b.dataset.wrong, { filter: 'incorrect', key: 'wrong:' + b.dataset.wrong })));
    v.querySelectorAll('[data-exam]').forEach(b => b.onclick = () => examDialog(b.dataset.exam));
    v.querySelectorAll('[data-custom]').forEach(b => b.onclick = () => {
      const k = b.dataset.custom;
      const ids = k === 'flagged' ? flagged : k === 'wrong' ? wrongAll : shuffleArr(STRATUS.allModuleQids()).slice(0, 20);
      Quiz.start({ key: 'custom:' + k, bank: null, kind: 'custom', title: { flagged: 'Flagged questions', wrong: 'Currently incorrect', mixed: 'Random mixed set' }[k], mode: 'practice', qids: ids, full: false });
    });
    if (openBank && STRATUS.banks[openBank]) setTimeout(() => startDialog(openBank), 0);
  }
  function shuffleArr(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  async function startDialog(bankId) {
    const b = STRATUS.banks[bankId];
    const count = f => Quiz.bankSessionConfig(bankId, { filter: f }).qids.length;
    const sess = st().sessions['bank:' + bankId];
    const inProg = sess && !sess.finished;
    const opt = (v, label, n, checked) => `<label class="opt-row"><input type="radio" name="f" value="${v}" ${checked ? 'checked' : ''} ${n ? '' : 'disabled'}> <span>${label}</span><span class="muted small" style="margin-left:auto">${n}</span></label>`;
    const res = await UI.modal({
      title: b.title,
      body: `<p class="small muted">Practice mode: answer, see the explanation, rate your recall. Unanswered questions are never counted as incorrect.</p>
        ${opt('all', 'All questions', count('all'), true)}${opt('definition', 'Definition & knowledge only', count('definition'))}${opt('situational', 'Situational & application only', count('situational'))}
        ${opt('unseen', 'Not yet answered', count('unseen'))}${opt('incorrect', 'Last answer incorrect', count('incorrect'))}${opt('flagged', 'Flagged for review', count('flagged'))}
        <label class="opt-row"><input type="checkbox" name="shuffle"> <span>Shuffle question order</span></label>
        ${inProg ? '<p class="small warn" style="margin-top:10px">Starting replaces your in-progress attempt for this quiz.</p>' : ''}`,
      actions: [{ label: 'Cancel', cls: 'ghost', value: null }, ...(inProg ? [{ label: 'Resume', cls: '', value: 'resume' }] : []),
        { label: 'Start quiz', cls: 'accent', value: w => ({ filter: w.querySelector('input[name=f]:checked').value, shuffle: w.querySelector('input[name=shuffle]').checked }) }]
    });
    if (location.hash !== '#/quiz') history.replaceState(null, '', '#/quiz');
    if (!res) return;
    if (res === 'resume') { location.hash = '#/play/' + encodeURIComponent('bank:' + bankId); return; }
    const cfg = Quiz.bankSessionConfig(bankId, res);
    if (!cfg.qids.length) return UI.toast('list', 'No questions match that filter');
    Quiz.start(cfg);
  }

  async function examDialog(kind) {
    const full = kind === 'full';
    const ok = await UI.confirm(full ? 'Exam simulation · 120 questions' : 'Official-length simulation · 65 questions',
      `${full ? '120 questions in 165 minutes (the official pace of ~83 s per question)' : '65 random Final Boss questions in 90 minutes — the real CLF-C02 length'}. No feedback or explanations until you submit. You can navigate freely and mark questions for review. Unanswered questions score as incorrect. The timer pauses only while this tab is hidden.<br><br><span class="tiny">Simulated score = 100 + 900 × percent correct. AWS's real scaled scoring is different, so treat it as a rough guide only.</span>`, 'Start the clock');
    if (!ok) return;
    const cfg = Quiz.bankSessionConfig('fb', { mode: 'exam', shuffle: true, limit: full ? null : 65, timeLimit: full ? 165 * 60 : 90 * 60 });
    if (!full) cfg.key = 'bank:fb:exam65';
    cfg.title = full ? 'Final Boss · Exam simulation' : 'Final Boss · 65-question sim';
    Quiz.start(cfg);
  }

  /* ---------- Spaced repetition hub ---------- */
  function reviewHub() {
    const s = SRS.stats();
    const f = SRS.forecast(14), max = Math.max(1, ...f.map(x => x.count));
    const banks = [...STRATUS.modules.map(m => m.id), ...EXTRA];
    const rows = banks.map(bid => {
      const b = STRATUS.banks[bid], x = SRS.stats(b.qids);
      const label = STRATUS.moduleById(bid) ? `M${STRATUS.moduleById(bid).num} · ${STRATUS.moduleById(bid).short}` : b.title;
      return `<tr><td>${esc(label)}</td><td>${x.total}</td><td>${x.new}</td><td>${x.learning + x.relearning}</td><td>${x.review}</td><td>${x.mastered}</td><td>${x.due ? `<b class="accent">${x.due}</b>` : 0}</td><td><button class="btn sm" data-learn="${bid}" ${x.new ? '' : 'disabled'}>Learn 10</button></td></tr>`;
    }).join('');
    const kpi = (v, l, cls) => `<div class="stat"><b class="${cls || ''}">${v}</b><span>${l}</span></div>`;
    view().innerHTML = `<div class="fade-in">
      <div class="grid g3">
        <div class="card glow-card hero span2" style="min-height:300px">
          <div class="top"><span class="chip">${icon('repeat')} Spaced repetition</span><span class="chip loc">SM-2 inspired</span></div>
          <div class="hero-body">
            <div class="eyebrow">Today</div>
            <h1>${s.due ? `${s.due} card${s.due === 1 ? '' : 's'} due` : 'You\'re all caught up'}</h1>
            <p>${s.due ? 'Answer from memory, check the explanation, then rate honestly. Cards you forget come back in 10 minutes; easy ones wait a week or more.' : 'Nothing is due. Learn a few new cards below, or take a module quiz — every answered question joins your deck.'}</p>
            <div class="row" style="justify-content:center;gap:10px">
              <button class="btn white lg" id="start-review" ${s.due ? '' : 'disabled'}>${icon('play')} Start review</button>
              <button class="btn lg" id="learn-new" ${s.new ? '' : 'disabled'}>${icon('sparkle')} Learn 20 new</button>
            </div>
          </div>
        </div>
        <div class="card"><div class="card-head"><h3>Retention</h3><span class="chip end">${icon('heart')} ${s.retentionN} mature reviews</span></div>
          ${UI.gauge(s.retention == null ? null : s.retention, 100, 'Recall rate on cards ≥ 1 day old')}
          <p class="small muted" style="text-align:center">Share of reviews of already-learned cards that you did <b>not</b> rate “Again”. Anki users typically aim for 85–90 %.</p></div>
      </div>
      <div class="srs-kpis" style="margin-top:18px">
        ${kpi(s.due, 'Due today', 'accent')}${kpi(s.new, 'New (never seen)')}${kpi(s.learning + s.relearning, 'Being learned')}${kpi(s.review, 'In review')}${kpi(s.mastered, 'Mastered (≥ 21 d)', 'ok')}${kpi(s.forgotten, 'Forgotten (last: Again)', 'bad')}${kpi(s.reviewsTotal, 'Total reviews')}
      </div>
      <div class="grid g3" style="margin-top:18px">
        <div class="card span2"><div class="card-head"><div class="ic">${icon('chart')}</div><h3>Upcoming reviews</h3><span class="chip end">Next 14 days</span></div>
          <div class="vbars">${f.map((x, i) => `<div class="vb"><em>${x.count || ''}</em><i class="${x.count ? '' : 'zero'}" style="height:${Math.max(3, 120 * x.count / max)}px"></i><span>${i === 0 ? 'Today' : x.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span></div>`).join('')}</div></div>
        <div class="card algo"><div class="card-head"><div class="ic">${icon('brain')}</div><h3>How scheduling works</h3></div>
          <div class="small muted">First rating of a card:</div>
          <table class="tbl" style="margin:6px 0 10px"><tr><td>Again</td><td>10 minutes</td></tr><tr><td>Hard</td><td>1 day</td></tr><tr><td>Good</td><td>3 days</td></tr><tr><td>Easy</td><td>7 days</td></tr></table>
          <ol><li>Each card has an ease factor (starts 2.5).</li><li><b>Good</b> multiplies the interval by ease; <b>Easy</b> by ease × 1.3 and raises ease.</li><li><b>Hard</b> grows the interval only ×1.2 and lowers ease.</li><li><b>Again</b> resets to 10 min, lowers ease, and counts a lapse.</li><li>A wrong answer only allows Again or Hard.</li></ol></div>
      </div>
      <div class="section-title"><h2>Decks</h2><span class="muted small">Every question in the app is a card</span></div>
      <div class="card" style="padding:8px 8px"><table class="tbl"><thead><tr><th>Deck</th><th>Cards</th><th>New</th><th>Learning</th><th>Review</th><th>Mastered</th><th>Due</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    </div>`;
    document.getElementById('start-review').onclick = () => {
      const ids = SRS.dueQids().slice(0, 150);
      Quiz.start({ key: 'srs', bank: null, kind: 'review', title: 'Daily review', mode: 'review', qids: ids, full: false });
    };
    const learn = (bid, n) => {
      const pool = bid ? STRATUS.banks[bid].qids : STRATUS.allModuleQids();
      const ids = pool.filter(id => !st().cards[id]).slice(0, n);
      if (!ids.length) return UI.toast('list', 'No new cards left in that deck');
      Quiz.start({ key: 'srs', bank: null, kind: 'review', title: 'Learning new cards', mode: 'review', qids: ids, full: false });
    };
    document.getElementById('learn-new').onclick = () => learn(null, 20);
    view().querySelectorAll('[data-learn]').forEach(b => b.onclick = () => learn(b.dataset.learn, 10));
    // An unfinished review session should resume, not be silently replaced.
    const open = st().sessions.srs;
    if (open && !open.finished) {
      const banner = document.createElement('div');
      banner.className = 'pass-banner ok'; banner.style.marginBottom = '18px';
      banner.innerHTML = `${icon('repeat')} <div>You have an unfinished review session (${open.qids.length - open.idx} cards left).</div><a class="btn sm white" style="margin-left:auto" href="#/play/srs">Resume</a>`;
      view().firstElementChild.prepend(banner);
    }
  }

  function reviewDone() {
    const r = st().lastReview;
    if (!r) { location.hash = '#/review'; return; }
    const ratings = { again: 0, hard: 0, good: 0, easy: 0 };
    st().reviewLog.filter(x => x[0] >= r.ts - r.seconds * 1000 - 5000).forEach(x => { ratings[x[2]]++; });
    view().innerHTML = `<div class="fade-in"><div class="card glow-card hero" style="min-height:280px"><div class="hero-body">
      <div class="eyebrow">Session complete</div><h1>${r.answered} cards reviewed</h1>
      <p>${r.correct} answered correctly · ${UI.fmtDur(r.seconds)} · next reviews are scheduled.</p>
      <div class="row" style="justify-content:center;gap:8px;margin-bottom:18px"><span class="chip bad">Again ${ratings.again}</span><span class="chip warn">Hard ${ratings.hard}</span><span class="chip ok">Good ${ratings.good}</span><span class="chip info">Easy ${ratings.easy}</span></div>
      <a class="btn white lg" href="#/review">Back to deck</a></div></div></div>`;
  }

  /* ---------- Analytics ---------- */
  function analytics() {
    const t = Analytics.totals(), lv = Progress.levelInfo(), sk = Progress.streak(), srs = SRS.stats();
    const bm = Analytics.byModule(), bd = Analytics.byDomain(), bc = Analytics.byCategory();
    const days = Analytics.lastDays(7), prev = Analytics.lastDays(14).slice(0, 7);
    const sum = (a, k) => a.reduce((x, d) => x + (d[k] || 0), 0);
    const maxA = Math.max(1, ...days.map(d => d.answered));
    const hb = (label, g, extra) => `<div class="hbar"><div>${label}</div>${UI.bar(g && g.pct)}<div class="v">${g && g.pct != null ? g.pct + '%' : '—'}${extra || ''}</div></div>`;
    const bankRows = [...STRATUS.modules.map(m => m.id), ...EXTRA].map(bid => {
      const b = STRATUS.banks[bid], rs = st().results.filter(r => r.bank === bid);
      const m = STRATUS.moduleById(bid);
      return `<tr><td>${esc(m ? `M${m.num} · ${m.short}` : b.title)}</td><td class="${UI.pctClass(st().best[bid])}">${st().best[bid] == null ? '—' : st().best[bid] + '%'}</td><td>${rs.length ? rs[rs.length - 1].pct + '%' : '—'}</td><td>${rs.length}</td><td>${st().completedBanks[bid] ? '✓' : ''}</td></tr>`;
    }).join('');
    const recent = st().results.slice(-12).reverse();
    const weak = Analytics.weakTopics(8);
    const lecDone = STRATUS.modules.filter(m => Lectures.progressOf(m.id).completed).length;
    const quizDone = STRATUS.modules.filter(m => st().completedBanks[m.id]).length;
    const ms = (label, v, max) => `<div class="hbar"><div>${label}</div>${UI.bar(100 * v / max)}<div class="v">${v}/${max}</div></div>`;

    view().innerHTML = `<div class="fade-in">
      <div class="card"><div class="kpis">
        <div class="stat"><b>${t.pct == null ? '—' : t.pct + '%'}</b><span>Overall accuracy</span></div>
        <div class="stat"><b>${t.distinct}</b><span>of ${Object.keys(STRATUS.questions).length} questions seen</span></div>
        <div class="stat"><b>${t.attempts}</b><span>Total answers</span></div>
        <div class="stat"><b>${UI.fmtDur(t.seconds)}</b><span>Study time</span></div>
        <div class="stat"><b>Lv ${lv.level}</b><span>${lv.xp} XP · ${lv.title}</span></div>
        <div class="stat"><b>${sk.current} / ${sk.best}</b><span>Current / best streak</span></div>
        <div class="stat"><b>${st().best.fb == null ? '—' : st().best.fb + '%'}</b><span>Best Final Boss</span></div>
      </div></div>

      <div class="grid g2" style="margin-top:18px">
        <div class="card"><div class="card-head"><div class="ic">${icon('chart')}</div><h3>This week</h3><span class="chip end">${sum(days, 'answered')} answers · ${Math.round(sum(days, 'seconds') / 60)} min · ${sum(days, 'xp')} XP</span></div>
          <div class="vbars">${days.map(d => `<div class="vb"><em>${d.answered || ''}</em><i class="${d.answered ? '' : 'zero'}" style="height:${Math.max(3, 120 * d.answered / maxA)}px" title="${d.answered} answers, ${Math.round(d.seconds / 60)} min"></i><span>${d.date.toLocaleDateString(undefined, { weekday: 'short' })}</span></div>`).join('')}</div>
          <div class="row between small muted" style="margin-top:12px"><span>Previous week: ${sum(prev, 'answered')} answers · ${Math.round(sum(prev, 'seconds') / 60)} min</span><span>${sum(days, 'reviews')} reviews this week</span></div></div>
        <div class="card"><div class="card-head"><div class="ic">${icon('target')}</div><h3>By exam domain</h3><span class="chip end">CLF-C02 weighting</span></div>
          <div class="hbars">${Object.values(STRATUS.domains).map(d => hb(`${d.name} <span class="tiny muted">${d.weight}%</span>`, bd[d.id])).join('')}</div>
          <div class="card-head" style="margin-top:22px"><div class="ic">${icon('layers')}</div><h3>Definition vs situational</h3></div>
          <div class="hbars">${hb('Definition & knowledge', bc.definition)}${hb('Situational & application', bc.situational)}</div></div>
      </div>

      <div class="grid g2" style="margin-top:18px">
        <div class="card"><div class="card-head"><div class="ic">${icon('book')}</div><h3>By module</h3><span class="chip end">accuracy · mastery</span></div>
          <div class="hbars">${STRATUS.modules.map(m => hb(`M${m.num} · ${m.short}`, bm[m.num], ` ${UI.mastery(Progress.moduleMastery(m.id).dots)}`)).join('')}</div></div>
        <div class="card"><div class="card-head"><div class="ic">${icon('trophy')}</div><h3>Personal bests</h3></div>
          <table class="tbl"><thead><tr><th>Quiz</th><th>Best</th><th>Last</th><th>Attempts</th><th>Done</th></tr></thead><tbody>${bankRows}</tbody></table></div>
      </div>

      <div class="grid g3" style="margin-top:18px">
        <div class="card"><div class="card-head"><div class="ic">${icon('flag')}</div><h3>Milestones</h3></div>
          <div class="hbars">${ms('Lectures completed', lecDone, 10)}${ms('Module quizzes completed', quizDone, 10)}${ms('Questions seen', t.distinct, Object.keys(STRATUS.questions).length)}${ms('Cards mastered', srs.mastered, srs.total)}${ms('Badges earned', Object.keys(st().badges).length, Progress.BADGES.length)}</div></div>
        <div class="card"><div class="card-head"><div class="ic">${icon('bolt')}</div><h3>Weakest topics</h3></div>
          ${weak.length ? `<div class="hbars">${weak.map(w => { const sec = Lectures.findSection(w.module, w.topic); return `<div class="hbar" style="grid-template-columns:1fr 70px 44px"><a href="${sec ? `#/lecture/${sec.mid}/${sec.sid}` : '#/lecture'}">${esc(w.topic)} <span class="tiny muted">M${w.module}</span></a>${UI.bar(w.pct)}<div class="v">${w.pct}%</div></div>`; }).join('')}</div>` : '<div class="empty">No data yet.</div>'}</div>
        <div class="card"><div class="card-head"><div class="ic">${icon('clock')}</div><h3>Recent results</h3></div>
          ${recent.length ? `<div class="review-list">${recent.map(r => `<a class="review-item" href="#/results/${r.id}"><span class="n">${new Date(r.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><span class="t">${esc(r.title)}${r.scaled != null ? ` <span class="muted">· sim ${r.scaled}</span>` : ''}</span><span class="chip ${UI.pctClass(r.pct)}">${r.pct}%</span></a>`).join('')}</div>` : '<div class="empty">No results yet.</div>'}</div>
      </div>

      <div class="section-title"><h2>Achievements</h2><span class="muted small">${Object.keys(st().badges).length} of ${Progress.BADGES.length} unlocked</span></div>
      <div class="badge-grid">${Progress.BADGES.map(b => `<div class="badge ${st().badges[b.id] ? 'got' : ''}"><div class="b-ic">${icon(b.icon)}</div><b>${esc(b.name)}</b><span>${esc(b.desc)}</span>${st().badges[b.id] ? `<div class="tiny accent" style="margin-top:6px">${new Date(st().badges[b.id]).toLocaleDateString()}</div>` : ''}</div>`).join('')}</div>

      <div class="section-title"><h2>Your data</h2><span class="muted small">Stored only in this browser (localStorage)</span></div>
      <div class="card row wrap">
        <button class="btn" id="exp">${icon('download')} Export progress</button>
        <label class="btn" style="cursor:pointer">${icon('upload')} Import progress<input type="file" id="imp" accept="application/json" hidden></label>
        <button class="btn danger" id="reset" style="margin-left:auto">${icon('trash')} Reset all progress</button>
      </div></div>`;

    document.getElementById('exp').onclick = () => {
      const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'stratus-progress-' + Store.todayKey() + '.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    document.getElementById('imp').onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      f.text().then(async txt => {
        if (!(await UI.confirm('Import progress?', 'This replaces all current progress in this browser with the file’s contents.', 'Import'))) return;
        try { Store.importJSON(txt); UI.toast('check', 'Progress imported'); Nav.route(); } catch (err) { UI.toast('x', 'Import failed', err.message); }
      });
    };
    document.getElementById('reset').onclick = async () => {
      const v = await UI.modal({
        title: 'Reset all progress?',
        body: '<p class="muted">This permanently deletes scores, answer history, spaced-repetition schedules, bookmarks, streaks, XP and badges from this browser. Export first if you might want it back.</p><p class="small">Type <b>RESET</b> to confirm.</p><input type="text" id="reset-confirm" autocomplete="off">',
        actions: [{ label: 'Cancel', cls: 'ghost', value: false }, { label: 'Delete everything', cls: 'danger', value: w => w.querySelector('#reset-confirm').value.trim() === 'RESET' ? true : (UI.toast('x', 'Type RESET to confirm'), undefined) }]
      });
      if (v) { Store.reset(); UI.toast('trash', 'Progress reset'); location.hash = '#/dashboard'; Nav.route(); }
    };
  }

  window.App = { dashboard, quizHub, reviewHub, reviewDone, analytics };

  /* ---------- Boot ---------- */
  Nav.route();
  Progress.checkBadges();
})();
