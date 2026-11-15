/* Shared UI helpers: icons, escaping, modal, toast, gauge, charts. */
(function () {
  const P = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  const paths = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
    cards: '<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/>',
    repeat: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
    flame: '<path d="M12 22c4 0 7-2.7 7-7 0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-3 3-5 5.5-5 8 0 4.3 3 7 7 7z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    play: '<path d="M7 4v16l13-8z"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    left: '<path d="M15 18l-6-6 6-6"/>',
    right: '<path d="M9 18l6-6-6-6"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    layers: '<path d="M12 2 2 7l10 5 10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
    pin: '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    sparkle: '<path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    brain: '<path d="M9 3a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 12a3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-2zM15 3a3 3 0 0 1 3 3v.5a3 3 0 0 1 2 5.5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    upload: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
    shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
  };
  const icon = (n, cls) => `<svg class="${cls || ''}" viewBox="0 0 24 24" ${P}>${paths[n] || ''}</svg>`;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const L = i => 'ABCD'[i];

  function toast(ic, title, body) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<div class="t-ic">${icon(ic)}</div><div><b style="font-weight:500">${esc(title)}</b>${body ? `<div class="small muted">${esc(body)}</div>` : ''}</div>`;
    document.getElementById('toasts').appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3600);
  }

  /* modal({title, body(html), actions:[{label, cls, value}]}) → Promise<value|null> */
  function modal(opts) {
    return new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.className = 'modal-wrap';
      wrap.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(opts.title)}"><h3>${esc(opts.title)}</h3><div class="m-body">${opts.body || ''}</div><div class="actions">${(opts.actions || [{ label: 'OK', cls: 'accent', value: true }]).map((a, i) => `<button class="btn ${a.cls || ''}" data-i="${i}">${a.label}</button>`).join('')}</div></div>`;
      const close = v => { wrap.remove(); document.removeEventListener('keydown', onKey); resolve(v); };
      const onKey = e => { if (e.key === 'Escape') close(null); };
      wrap.addEventListener('click', e => {
        if (e.target === wrap) return close(null);
        const b = e.target.closest('[data-i]');
        if (b) {
          const a = opts.actions[+b.dataset.i];
          const v = typeof a.value === 'function' ? a.value(wrap) : a.value;
          if (v !== undefined) close(v);
        }
      });
      document.addEventListener('keydown', onKey);
      document.body.appendChild(wrap);
      if (opts.onOpen) opts.onOpen(wrap);
      const first = wrap.querySelector('.actions .btn:last-child'); if (first) first.focus();
    });
  }
  const confirmBox = (title, body, okLabel, danger) => modal({ title, body: `<p class="muted">${body}</p>`, actions: [{ label: 'Cancel', cls: 'ghost', value: false }, { label: okLabel || 'Confirm', cls: danger ? 'danger' : 'accent', value: true }] });

  /* Semicircular gauge like the reference "wellness score" arc */
  function gauge(value, max, label, sub) {
    const pct = Math.max(0, Math.min(1, (value || 0) / (max || 100)));
    const R = 120, cx = 150, cy = 150, a0 = Math.PI, a = Math.PI - pct * Math.PI;
    const x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);
    const id = 'g' + Math.random().toString(36).slice(2, 7);
    return `<div class="gauge"><svg viewBox="0 0 300 175" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#8a3208"/><stop offset=".55" stop-color="#ff7a2e"/><stop offset="1" stop-color="#ffd2ab"/></linearGradient></defs>
      <path d="M30 150 A120 120 0 0 1 270 150" stroke="#2a2420" stroke-width="26" fill="none" stroke-linecap="round"/>
      ${pct > 0 ? `<path d="M30 150 A120 120 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}" stroke="url(#${id})" stroke-width="26" fill="none" stroke-linecap="round"/>` : ''}
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="#fff"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="#ff7a2e"/>
      ${void a0 || ''}</svg>
      <div class="val"><b>${value == null ? '—' : value}<small>/${max}</small></b>${label ? `<div class="small muted">${label}</div>` : ''}${sub ? `<div class="tiny muted">${sub}</div>` : ''}</div></div>`;
  }

  function bar(pct, cls) { return `<div class="bar ${cls || ''}"><i style="width:${Math.max(0, Math.min(100, pct || 0))}%"></i></div>`; }
  function mastery(dots) { return `<span class="mastery" title="Mastery">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= dots ? 'on' : ''}"></i>`).join('')}</span>`; }
  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  }
  function fmtDur(sec) {
    sec = Math.round(sec || 0);
    if (sec < 60) return sec + 's';
    const h = Math.floor(sec / 3600), m = Math.round(sec % 3600 / 60);
    return h ? `${h}h ${m}m` : `${m} min`;
  }
  function pctClass(p) { return p == null ? '' : p >= 80 ? 'ok' : p >= 60 ? 'warn' : 'bad'; }
  const domainName = d => STRATUS.domains[d] ? STRATUS.domains[d].name : '—';
  const modName = n => { const m = STRATUS.moduleByNum(n); return m ? `M${m.num} · ${m.short}` : 'General'; };
  const catChip = c => c === 'situational' ? '<span class="chip info">Situational</span>' : '<span class="chip">Definition</span>';
  const diffChip = d => `<span class="chip">${['', 'Foundational', 'Intermediate', 'Challenging'][d] || ''}</span>`;

  window.UI = { icon, esc, L, toast, modal, confirm: confirmBox, gauge, bar, mastery, fmtTime, fmtDur, pctClass, domainName, modName, catChip, diffChip };
})();
