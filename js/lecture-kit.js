/* Small HTML builders used by lecture content files (data/lectures/*.js).
   They keep the content files readable and the markup consistent. */
(function () {
  const callout = (cls, label) => (html, title) =>
    `<div class="callout ${cls}"><div class="ct">${title || label}</div>${html}</div>`;

  window.K = {
    eli5: callout('eli5', 'Explain like I\'m five'),
    story: (title, html) => `<div class="callout story"><div class="ct">Story · ${title}</div>${html}</div>`,
    tip: callout('tip', 'Exam tip'),
    trap: callout('trap', 'Common trap'),
    hook: callout('hook', 'Memory hook'),
    note: callout('note', 'Note'),
    fix: callout('fix', 'Updated fact (corrects older course notes)'),
    analogy: callout('eli5', 'Real-world analogy'),
    recall: (q, a) => `<div class="recall"><div class="rq">${q}</div><textarea placeholder="Answer from memory first — then reveal."></textarea><button class="btn sm reveal-btn">Reveal answer</button><div class="ra">${a}</div></div>`,
    table: (head, rows) => `<table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`,
    /* nodes: 'Title|subtitle', prefix '*' to highlight */
    flow: (nodes, cap) => `<div class="diagram"><div class="flow">${nodes.map((n, i) => {
      const hl = n.startsWith('*'); const [t, s] = (hl ? n.slice(1) : n).split('|');
      return (i ? '<div class="arrow">→</div>' : '') + `<div class="node${hl ? ' hl' : ''}">${t}${s ? `<small>${s}</small>` : ''}</div>`;
    }).join('')}</div>${cap ? `<div class="cap">${cap}</div>` : ''}</div>`,
    /* layers: [label, 'you'|'aws'|'shared', tag] */
    stack: (layers, cap) => `<div class="diagram"><div class="stackd">${layers.map(l => `<div class="layer ${l[1]}"><div>${l[0]}</div><span>${l[2] || (l[1] === 'you' ? 'Customer' : l[1] === 'aws' ? 'AWS' : 'Shared')}</span></div>`).join('')}</div>${cap ? `<div class="cap">${cap}</div>` : ''}</div>`,
    /* items: [title, description]; axis: [leftLabel, rightLabel] */
    spectrum: (items, axis, cap) => `<div class="diagram"><div class="spectrum" style="--n:${items.length}">${items.map(i => `<div class="sp"><b>${i[0]}</b><small>${i[1]}</small></div>`).join('')}</div>${axis ? `<div class="spectrum-axis"><span>← ${axis[0]}</span><span>${axis[1]} →</span></div>` : ''}${cap ? `<div class="cap">${cap}</div>` : ''}</div>`,
    diagram: (html, cap) => `<div class="diagram">${html}${cap ? `<div class="cap">${cap}</div>` : ''}</div>`,
    nest: (cls, label, inner) => `<div class="nest ${cls}"><div class="nl">${label}</div>${inner}</div>`,
    row: (...cells) => `<div class="nest-row">${cells.join('')}</div>`,
    box: (t, hl) => `<div class="box${hl ? ' o' : ''}">${t}</div>`
  };
})();
