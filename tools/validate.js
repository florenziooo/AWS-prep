#!/usr/bin/env node
/* Content QA: checks counts and schema for every question bank and lecture.
   Run in a browser: open tools/validate.html   ·   or with Node:  node tools/validate.js */
(function () {
const isNode = typeof window === 'undefined' || !window.STRATUS;
let S, missing = [];
const out = [];
const log = (...a) => out.push(a.join(' '));
if (isNode) {
  const fs = require('fs'), path = require('path'), vm = require('vm');
  const root = path.join(__dirname, '..');
  const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(s => /questions|lecture-kit|data\//.test(s));
  scripts.forEach(s => {
    const f = path.join(root, s);
    if (!fs.existsSync(f)) { missing.push(s); return; }
    vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: s });
  });
  S = ctx.STRATUS;
} else { S = window.STRATUS; missing = window.__missing || []; }
const errors = [], warn = [];
if (missing.length) errors.push('Missing files: ' + missing.join(', '));

const expect = (bank, total, d, s) => {
  const b = S.banks[bank]; if (!b) return errors.push(`Bank ${bank} missing`);
  const qs = b.qids.map(id => S.questions[id]);
  const nd = qs.filter(q => q.category === 'definition').length, ns = qs.length - nd;
  if (total != null && qs.length !== total) errors.push(`${bank}: ${qs.length} questions (expected ${total})`);
  if (d != null && nd !== d) errors.push(`${bank}: ${nd} definition (expected ${d})`);
  if (s != null && ns !== s) errors.push(`${bank}: ${ns} situational (expected ${s})`);
  return { total: qs.length, d: nd, s: ns };
};

const report = {};
S.modules.forEach(m => { report[m.id] = expect(m.id, 30, 15, 15); });
report.fb = expect('fb', 120, 60, 60);
report.pe = expect('pe');
report.kcs = expect('kcs');

const seenText = new Map();
Object.values(S.questions).forEach(q => {
  const tag = q.id;
  if (q.options.length !== 4) errors.push(`${tag}: ${q.options.length} options`);
  if (new Set(q.options.map(o => o.trim().toLowerCase())).size !== 4) errors.push(`${tag}: duplicate options`);
  if (q.options.some(o => !o || !String(o).trim())) errors.push(`${tag}: empty option`);
  if (!(q.correctAnswer >= 0 && q.correctAnswer < 4)) errors.push(`${tag}: bad correctAnswer`);
  if (!q.explanation || q.explanation.length < 20) errors.push(`${tag}: explanation too short`);
  if (Object.keys(q.distractorExplanations).length !== 3 || Object.values(q.distractorExplanations).some(x => !x)) errors.push(`${tag}: distractor explanations incomplete`);
  if (![1, 2, 3, 4].includes(q.domain)) errors.push(`${tag}: bad domain ${q.domain}`);
  if (![1, 2, 3].includes(q.difficulty)) errors.push(`${tag}: bad difficulty`);
  if (!q.module || !S.moduleByNum(q.module)) errors.push(`${tag}: no module`);
  if (!q.topic) errors.push(`${tag}: no topic`);
  if (/all of the above|none of the above/i.test(q.options.join('|'))) warn.push(`${tag}: “all/none of the above” breaks under shuffling`);
  const key = q.question.trim().toLowerCase();
  if (seenText.has(key)) warn.push(`${tag}: same question text as ${seenText.get(key)}`); else seenText.set(key, tag);
});

// Answer-position balance
const pos = [0, 0, 0, 0]; Object.values(S.questions).forEach(q => pos[q.correctAnswer]++);

// Final Boss domain blueprint
const fbDom = { 1: 0, 2: 0, 3: 0, 4: 0 }, fbMod = {};
(S.banks.fb ? S.banks.fb.qids : []).forEach(id => { const q = S.questions[id]; fbDom[q.domain]++; fbMod[q.module] = (fbMod[q.module] || 0) + 1; });

// Lectures
const lecErr = [];
S.modules.forEach(m => {
  const l = S.lectures[m.id]; if (!l) return lecErr.push(`${m.id}: lecture missing`);
  ['objectives', 'why', 'sections', 'terms', 'hooks', 'tips', 'traps', 'checks', 'summary', 'takeaways', 'sources'].forEach(k => { if (!l[k] || (Array.isArray(l[k]) && !l[k].length)) lecErr.push(`${m.id}: missing ${k}`); });
  const h = l.sections.map(s => s.html).join('');
  if (!/callout eli5/.test(h)) lecErr.push(`${m.id}: no ELI5`);
  if (!/class="diagram"/.test(h)) lecErr.push(`${m.id}: no diagram`);
  if (!/<table>/.test(h)) lecErr.push(`${m.id}: no comparison table`);
  if (!/callout story/.test(h)) lecErr.push(`${m.id}: no story/scenario`);
  if (!/class="recall"/.test(h)) lecErr.push(`${m.id}: no active-recall prompt`);
  const lv = new Set(l.sections.map(s => s.level)); ['b', 'i', 'a'].forEach(x => { if (!lv.has(x)) lecErr.push(`${m.id}: no level ${x} section`); });
  l.checks.forEach((c, i) => { if (c.length !== 6) lecErr.push(`${m.id}: check ${i + 1} malformed`); });
});
errors.push(...lecErr);

log('Question banks:');
Object.entries(report).forEach(([k, v]) => v && log(`  ${k.padEnd(4)} ${String(v.total).padStart(3)} total · ${String(v.d).padStart(3)} definition · ${String(v.s).padStart(3)} situational`));
log('Total questions:', Object.keys(S.questions).length);
log('Correct-answer positions A/B/C/D:', pos.join(' / '));
log('Final Boss by domain:', JSON.stringify(fbDom), ' by module:', JSON.stringify(fbMod));
log('Lectures:', S.modules.filter(m => S.lectures[m.id]).length, '/ 10');
if (warn.length) { log(`\nWarnings (${warn.length}):`); warn.forEach(w => log('  - ' + w)); }
if (errors.length) { log(`\nERRORS (${errors.length}):`); errors.forEach(e => log('  ✗ ' + e)); }
else log('\n✓ All content checks passed.');
if (isNode) { console.log(out.join('\n')); if (errors.length) process.exit(1); }
else { const pre = document.getElementById('out'); pre.textContent = out.join('\n'); pre.className = errors.length ? 'bad' : 'ok'; window.__validation = { errors, warn, out }; }
})();
