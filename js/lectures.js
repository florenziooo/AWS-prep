/* Lecture hub and reader. Lecture content lives in data/lectures/*.js. */
(function () {
  const st = () => Store.state;
  const { esc, icon, L } = UI;
  const LVL = { b: ['b', 'Beginner'], i: ['i', 'Intermediate'], a: ['a', 'Advanced'], e: ['e', 'Exam ready'] };
  let observer = null;

  function lecState(mid) { return st().lectures[mid] || (st().lectures[mid] = { seen: {}, completed: 0, checks: {} }); }

  /* Full ordered section list (standard blocks + authored content) */
  function sectionsOf(lec) {
    const out = [{ id: 'intro', title: 'Introduction & objectives', level: 'b' }];
    lec.sections.forEach(s => out.push(s));
    if (lec.terms) out.push({ id: 'terms', title: 'AWS services & terminology', level: 'i' });
    if (lec.hooks) out.push({ id: 'hooks', title: 'Memory hooks & mnemonics', level: 'i' });
    if (lec.tips) out.push({ id: 'tips', title: 'Exam tips & keywords', level: 'e' });
    if (lec.traps) out.push({ id: 'traps', title: 'Misconceptions & traps', level: 'e' });
    if (lec.checks) out.push({ id: 'check', title: 'Quick knowledge check', level: 'e' });
    out.push({ id: 'summary', title: 'Summary & key takeaways', level: 'e' });
    return out;
  }

  function progressOf(mid) {
    const lec = STRATUS.lectures[mid]; if (!lec) return { seen: 0, total: 0, pct: 0, completed: false };
    const secs = sectionsOf(lec), ls = st().lectures[mid] || { seen: {} };
    const seen = secs.filter(s => ls.seen && ls.seen[s.id]).length;
    return { seen, total: secs.length, pct: Math.round(100 * seen / secs.length), completed: !!ls.completed };
  }

  /* Map a question topic to the most relevant lecture section */
  const STOP = new Set(['and', 'the', 'of', 'vs', 'aws', 'amazon', 'a', 'to', 'in', 'for', 'on', 'with', 'service', 'services']);
  const tokens = s => String(s || '').toLowerCase().replace(/[^a-z0-9+ ]/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w));
  function findSection(moduleNum, topic) {
    const tt = tokens(topic); if (!tt.length) return null;
    const mods = moduleNum ? [STRATUS.moduleByNum(moduleNum)] : STRATUS.modules;
    let best = null, bestScore = 0;
    mods.forEach(m => {
      const lec = m && STRATUS.lectures[m.id]; if (!lec) return;
      lec.sections.forEach(s => {
        const words = new Set(tokens(s.title + ' ' + (s.tags || '')));
        let score = 0; tt.forEach(w => { if (words.has(w)) score += 2; else if ([...words].some(x => x.length > 3 && (x.startsWith(w) || w.startsWith(x)))) score += 1; });
        score = score / tt.length + (m.num === moduleNum ? 0.01 : 0);
        if (score > bestScore) { bestScore = score; best = { mid: m.id, sid: s.id, title: s.title, num: m.num, modTitle: m.short }; }
      });
    });
    if (best && bestScore >= 0.5) return best;
    if (moduleNum) { const m = STRATUS.moduleByNum(moduleNum); if (m && STRATUS.lectures[m.id]) return { mid: m.id, sid: 'intro', title: m.title + ' (overview)', num: m.num, modTitle: m.short }; }
    return null;
  }

  /* ---------- Hub ---------- */
  function hub() {
    const view = document.getElementById('view');
    const cards = STRATUS.modules.map(m => {
      const lec = STRATUS.lectures[m.id], p = progressOf(m.id), ms = Progress.moduleMastery(m.id);
      const best = st().best[m.id];
      return `<div class="module-card">
        <div class="num">Module ${m.num} ${p.completed ? '<span class="chip ok">Completed</span>' : p.seen ? '<span class="chip warn">In progress</span>' : ''}</div>
        <h4>${esc(m.title)}</h4>
        <div class="small muted">${lec ? `${lec.minutes} min · ${sectionsOf(lec).length} sections` : ''}</div>
        <div>${UI.bar(p.pct)}<div class="row between tiny muted" style="margin-top:6px"><span>${p.seen}/${p.total} sections read</span><span>Quiz best: ${best == null ? '—' : best + '%'}</span></div></div>
        <div class="row between"><span class="tiny muted">${ms.label}</span>${UI.mastery(ms.dots)}</div>
        <div class="acts"><a class="btn white sm" href="#/lecture/${m.id}">${icon('book')} Lecture</a><a class="btn sm" href="#/quiz/${m.id}">${icon('quiz')} Quiz</a></div>
      </div>`;
    }).join('');
    const done = STRATUS.modules.filter(m => progressOf(m.id).completed).length;
    view.innerHTML = `<div class="fade-in">
      <div class="card glow-card lec-hero"><span class="chip">${icon('book')} Lecture</span>
        <h1>Ten modules, one exam.</h1>
        <p>Each module moves from <b>Beginner</b> (ELI5 + analogies) to <b>Intermediate</b> (how it works) to <b>Advanced</b> (applied scenarios) to <b>Exam ready</b> (keywords, traps). Answer the recall prompts from memory before revealing — that effort is what makes it stick.</p>
        <div class="row wrap" style="margin-top:16px"><span class="chip ok">${done}/10 lectures complete</span><span class="chip">Aligned to CLF-C02 domains & CSIT341 notes</span></div>
      </div>
      <div class="grid g5">${cards}</div></div>`;
  }

  /* ---------- Reader ---------- */
  function reader(mid, sid) {
    const lec = STRATUS.lectures[mid], m = STRATUS.moduleById(mid);
    const view = document.getElementById('view');
    if (!lec) { view.innerHTML = `<div class="empty">Lecture not found. <a href="#/lecture">All lectures</a></div>`; return; }
    const ls = lecState(mid), secs = sectionsOf(lec);
    const paper = st().settings.paper;
    const lvl = l => `<span class="lvl ${LVL[l][0]}">${LVL[l][1]}</span>`;
    const block = (s, body) => `<section id="sec-${s.id}" data-sid="${s.id}"><h2>${esc(s.title)} ${lvl(s.level || 'i')}</h2>${body}</section>`;

    const intro = `<p>${lec.subtitle}</p>
      <h3>Learning objectives</h3><ul>${lec.objectives.map(o => `<li>${o}</li>`).join('')}</ul>
      <h3>Why this matters</h3>${lec.why}
      <p class="small muted">CSIT341 alignment: <i>${esc(m.course)}</i> · CLF-C02 domains: ${m.domains.map(d => UI.domainName(d)).join(', ')}</p>`;
    const checks = (lec.checks || []).map((c, i) => {
      const order = STRATUS.util.seededOrder(4, mid + '-kc-' + i);
      const opts = order.map(k => c[1 + k]);
      const corr = order.indexOf(0);
      const prev = ls.checks[i];
      return `<div class="kc" data-kc="${i}" data-correct="${corr}"><div class="kq">${i + 1}. ${c[0]}</div><div class="opts">${opts.map((o, j) => `<button class="opt ${prev != null ? (j === corr ? 'correct' : j === prev.sel ? 'wrong' : '') : ''}" data-kco="${j}" ${prev != null ? 'disabled' : ''}><span class="L">${L(j)}</span><span>${o}</span><span class="mark"></span></button>`).join('')}</div><div class="kfb ${prev != null ? '' : 'hidden'}">${prev != null ? (prev.ok ? 'Correct. ' : 'Incorrect. ') : ''}${c[5]}</div></div>`;
    }).join('');

    const body = secs.map(s => {
      switch (s.id) {
        case 'intro': return block(s, intro);
        case 'terms': return block(s, K.table(['Service / term', 'What it is', 'Remember it as'], lec.terms));
        case 'hooks': return block(s, lec.hooks.map(h => K.hook(h)).join(''));
        case 'tips': return block(s, lec.tips.map(h => K.tip(h)).join(''));
        case 'traps': return block(s, lec.traps.map(h => K.trap(h)).join(''));
        case 'check': return block(s, `<p class="muted">Commit to an answer — feedback appears only after you choose.</p>${checks}`);
        case 'summary': return block(s, `${lec.summary}<h3>Key takeaways</h3><ul>${lec.takeaways.map(t => `<li>${t}</li>`).join('')}</ul>
          <h3>Sources & further reading</h3><ul class="small">${lec.sources.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul>`);
        default: return block(s, s.html);
      }
    }).join('');

    const idx = STRATUS.modules.findIndex(x => x.id === mid);
    const next = STRATUS.modules[idx + 1];
    const allChecked = (lec.checks || []).every((_, i) => ls.checks[i] != null);
    view.innerHTML = `<div class="lec-layout fade-in">
      <nav class="toc" aria-label="Lecture sections"><h4>Module ${m.num}</h4>
        ${secs.map(s => `<a href="#/lecture/${mid}/${s.id}" data-toc="${s.id}" class="${ls.seen[s.id] ? 'seen' : ''}"><span class="tick">✓</span>${esc(s.title)}</a>`).join('')}
        <div class="toc-prog"><div class="tiny muted" id="toc-count">${progressOf(mid).seen}/${secs.length} read</div>${UI.bar(progressOf(mid).pct)}</div>
        <div style="margin:14px 12px"><button class="btn sm ghost" id="paper-toggle">${icon('sun')} ${paper ? 'Dark reading' : 'Paper reading'}</button></div>
      </nav>
      <div>
        <div class="card glow-card lec-hero"><div class="row wrap"><span class="chip">Module ${m.num}</span><span class="chip">${icon('clock')} ${lec.minutes} min</span>${ls.completed ? '<span class="chip ok">Completed</span>' : ''}</div>
          <h1>${esc(m.title)}</h1><p>${lec.tagline || ''}</p>
          <div class="row wrap" style="margin-top:14px"><a class="btn white" href="#/quiz/${mid}">${icon('quiz')} Practice this module</a></div></div>
        <article class="lec ${paper ? 'paper' : ''}">${body}</article>
        <div class="lec-end" style="margin-top:24px">
          <div><h3>${ls.completed ? 'Lecture complete ✓' : 'Finished reading?'}</h3><div class="small muted">${ls.completed ? 'Now lock it in with the module quiz.' : allChecked ? 'Mark it complete to earn 30 XP.' : 'Answer the quick knowledge check to unlock completion.'}</div></div>
          <div class="row wrap" style="margin-left:auto">
            ${ls.completed ? '' : `<button class="btn accent" id="lec-complete" ${allChecked ? '' : 'disabled'}>${icon('check')} Mark lecture complete</button>`}
            <a class="btn white" href="#/quiz/${mid}">Take Module ${m.num} quiz</a>
            ${next ? `<a class="btn" href="#/lecture/${next.id}">Next: Module ${next.num} ${icon('right')}</a>` : ''}
          </div>
        </div>
      </div></div>`;

    // Interactions
    view.querySelectorAll('.reveal-btn').forEach(b => b.onclick = () => { const r = b.closest('.recall'); r.classList.add('open'); b.remove(); });
    view.querySelectorAll('.kc').forEach(box => box.addEventListener('click', e => {
      const o = e.target.closest('[data-kco]'); if (!o || o.disabled) return;
      const i = +box.dataset.kc, corr = +box.dataset.correct, sel = +o.dataset.kco, ok = sel === corr;
      box.querySelectorAll('[data-kco]').forEach((b, j) => { b.disabled = true; if (j === corr) b.classList.add('correct'); else if (j === sel) b.classList.add('wrong'); });
      const fb = box.querySelector('.kfb'); fb.classList.remove('hidden'); fb.innerHTML = (ok ? 'Correct. ' : 'Incorrect. ') + lec.checks[i][5];
      ls.checks[i] = { sel, ok }; Store.save();
      if ((lec.checks || []).every((_, k) => ls.checks[k] != null)) { const b = document.getElementById('lec-complete'); if (b) b.disabled = false; }
    }));
    const cbtn = document.getElementById('lec-complete');
    if (cbtn) cbtn.onclick = () => {
      secs.forEach(s => { ls.seen[s.id] = true; });
      ls.completed = Date.now(); Progress.addXP(30); Store.save(true);
      UI.toast('book', 'Lecture complete · +30 XP', 'Module ' + m.num + ' — ' + m.short);
      Progress.checkBadges(); reader(mid);
    };
    document.getElementById('paper-toggle').onclick = () => { st().settings.paper = !st().settings.paper; Store.save(); reader(mid, sid); };

    // Section-seen tracking
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const id = en.target.dataset.sid;
        document.querySelectorAll('.toc a').forEach(a => a.classList.toggle('cur', a.dataset.toc === id));
        if (!ls.seen[id]) {
          ls.seen[id] = true; Store.save();
          const a = document.querySelector(`.toc a[data-toc="${id}"]`); if (a) a.classList.add('seen');
          const p = progressOf(mid), c = document.getElementById('toc-count'); if (c) { c.textContent = `${p.seen}/${p.total} read`; c.nextElementSibling.firstElementChild.style.width = p.pct + '%'; }
        }
      });
    }, { rootMargin: '-15% 0px -55% 0px' });
    view.querySelectorAll('article.lec section').forEach(s => observer.observe(s));

    if (sid) { const el = document.getElementById('sec-' + sid); if (el) setTimeout(() => el.scrollIntoView({ block: 'start' }), 30); }
    else window.scrollTo(0, 0);
  }

  window.Lectures = { hub, reader, findSection, progressOf, sectionsOf };
})();
