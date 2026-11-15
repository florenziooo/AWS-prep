/* Hash router, sidebar, and top bar. */
(function () {
  const { icon, esc } = UI;
  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home', href: '#/dashboard' },
    { id: 'lecture', label: 'Lecture', icon: 'book', href: '#/lecture', primary: true },
    { id: 'quiz', label: 'Quiz Mode', icon: 'quiz', href: '#/quiz', primary: true },
    { id: 'review', label: 'Spaced Repetition', icon: 'repeat', href: '#/review' },
    { id: 'analytics', label: 'Progress & Analytics', icon: 'chart', href: '#/analytics' }
  ];

  function parse() {
    const parts = (location.hash.replace(/^#\/?/, '') || 'dashboard').split('/');
    return parts.map(p => decodeURIComponent(p));
  }

  function section(parts) {
    const p = parts[0];
    if (p === 'play' || p === 'results' || p === 'answers') {
      if (p === 'play') { const s = Quiz.session(parts[1]); if (s && s.mode === 'review') return 'review'; }
      return 'quiz';
    }
    return NAV.some(n => n.id === p) ? p : 'dashboard';
  }

  function renderChrome(parts) {
    const cur = section(parts);
    const due = SRS.stats().due;
    document.getElementById('nav').innerHTML =
      `<div class="nav-label">Overview</div>` +
      NAV.filter(n => !n.primary && n.id === 'dashboard').map(item).join('') +
      `<div class="nav-label">Learn</div>` + NAV.filter(n => n.primary).map(item).join('') +
      `<div class="nav-label">Retain</div>` + NAV.filter(n => n.id === 'review' || n.id === 'analytics').map(item).join('');
    function item(n) {
      const count = n.id === 'review' && due ? `<span class="count">${due}</span>` : '';
      return `<a href="${n.href}" class="${cur === n.id ? 'active' : ''}">${icon(n.icon)}<span>${n.label}</span>${count}</a>`;
    }
    const lv = Progress.levelInfo(), sk = Progress.streak();
    document.getElementById('sidebar-foot').innerHTML = `
      <div class="mini-card"><div class="row between"><span class="small muted">Daily streak</span><span class="${sk.todayDone ? 'accent' : 'muted'}">${icon('flame')}</span></div>
        <div class="row" style="margin-top:4px"><b>${sk.current}</b><span class="small muted">day${sk.current === 1 ? '' : 's'} · best ${sk.best}</span></div>
        <div class="tiny muted" style="margin-top:4px">${sk.todayDone ? 'Today counted ✓' : `Earn ${Math.max(0, Progress.ACTIVE_XP - Store.day().xp)} more XP today`}</div></div>
      <div class="mini-card"><div class="row between"><span class="small muted">Level ${lv.level}</span><span class="tiny accent">${lv.xp} XP</span></div>
        <div style="margin:4px 0 8px;font-size:14px">${lv.title}</div>${UI.bar(100 * lv.into / lv.span)}
        <div class="tiny muted" style="margin-top:6px">${lv.span - lv.into} XP to level ${lv.level + 1}</div></div>
      ${Store.ok ? '' : '<div class="mini-card tiny bad">Browser storage is blocked — progress will not persist.</div>'}`;

    const titles = { dashboard: 'Dashboard', lecture: 'Lecture', quiz: 'Quiz Mode', review: 'Spaced Repetition', analytics: 'Progress & Analytics' };
    const nested = parts.length > 1 || ['play', 'results', 'answers'].includes(parts[0]);
    let sub = '';
    if (parts[0] === 'lecture' && parts[1]) { const m = STRATUS.moduleById(parts[1]); if (m) sub = 'Module ' + m.num + ' · ' + m.short; }
    if (parts[0] === 'play') { const s = Quiz.session(parts[1]); if (s) sub = s.title; }
    if (parts[0] === 'results') sub = 'Results';
    if (parts[0] === 'answers') sub = 'Answer review';
    const back = parts[0] === 'answers' ? '#/results/' + parts[1] : parts[0] === 'play' ? (cur === 'review' ? '#/review' : '#/quiz') : parts[0] === 'results' ? '#/quiz' : '#/' + parts[0];
    document.getElementById('crumbs').innerHTML = (nested ? `<a class="back" href="${back}" aria-label="Back">${icon('arrowLeft')}</a>` : '') +
      `<span>${titles[cur]}</span>${sub ? `<span class="muted">/</span><span class="muted">${esc(sub)}</span>` : ''}`;
    document.getElementById('top-right').innerHTML = `
      ${due ? `<a class="chip accent" href="#/review">${icon('repeat')} ${due} due</a>` : ''}
      <span class="chip">${icon('flame')} ${sk.current}-day streak</span>
      <span class="chip">${icon('star')} Lv ${lv.level} · ${lv.xp} XP</span>`;
  }

  function route() {
    const parts = parse();
    document.body.classList.remove('nav-open');
    Progress.studying = ['lecture', 'play', 'answers', 'review'].includes(parts[0]);
    try {
      switch (parts[0]) {
        case 'lecture': parts[1] ? Lectures.reader(parts[1], parts[2]) : Lectures.hub(); break;
        case 'quiz': App.quizHub(parts[1]); break;
        case 'play': Quiz.render(parts[1]); break;
        case 'results': Quiz.resultView(parts[1]); break;
        case 'answers': Quiz.answersView(parts[1], +parts[2] || 0); break;
        case 'review': parts[1] === 'done' ? App.reviewDone() : App.reviewHub(); break;
        case 'analytics': App.analytics(); break;
        default: App.dashboard();
      }
    } catch (err) {
      console.error(err);
      document.getElementById('view').innerHTML = `<div class="empty">Something went wrong rendering this page: ${esc(err.message)}. <a href="#/dashboard">Go to dashboard</a></div>`;
    }
    renderChrome(parts);
    if (!['lecture'].includes(parts[0]) || !parts[2]) window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  document.getElementById('menu-btn').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  document.addEventListener('click', e => { if (document.body.classList.contains('nav-open') && !e.target.closest('.sidebar') && !e.target.closest('#menu-btn')) document.body.classList.remove('nav-open'); });

  window.Nav = { route, renderChrome, parse };
})();
