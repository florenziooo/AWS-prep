/* Content registry: modules, lectures, question banks.
   Data files call STRATUS.bank(...) / STRATUS.lecture(...) to register content.

   Authoring row format (compact, expanded here into full question objects):
   [category 'D'|'S', domain 1-4, difficulty 1-3, topic, question,
    correctOption, distractor1, distractor2, distractor3,
    explanation, whyNot1, whyNot2, whyNot3, extra?]
   extra = module number (for mixed banks) or { m, src, obj, note }.
   The correct option is authored first; options are then shuffled with a
   seeded shuffle keyed by question id, so letters are stable per question
   but the answer position never leaks. */
(function () {
  const S = window.STRATUS = window.STRATUS || {};
  S.modules = S.modules || [];
  S.lectures = S.lectures || {};
  S.banks = S.banks || {};
  S.questions = S.questions || {};
  S.domains = {
    1: { id: 1, name: 'Cloud Concepts', weight: 24 },
    2: { id: 2, name: 'Security and Compliance', weight: 30 },
    3: { id: 3, name: 'Cloud Technology and Services', weight: 34 },
    4: { id: 4, name: 'Billing, Pricing, and Support', weight: 12 }
  };

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let a = seed;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seededOrder(n, seed) {
    const r = rng(hash(seed)), arr = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }
  S.util = { hash, rng, seededOrder };

  const objectiveVerb = { D: 'Define and recognise', S: 'Apply to a scenario:' };

  S.bank = function (bankId, meta, rows) {
    const bank = Object.assign({ id: bankId, qids: [] }, meta);
    rows.forEach((r, i) => {
      const [cat, domain, diff, topic, text, c, w1, w2, w3, exp, x1, x2, x3, extra] = r;
      const id = bankId + '-' + String(i + 1).padStart(3, '0');
      const ex = typeof extra === 'number' ? { m: extra } : (extra || {});
      const authored = [c, w1, w2, w3];
      const why = [null, x1, x2, x3];
      const order = seededOrder(4, id);
      const options = order.map(k => authored[k]);
      const distractorExplanations = {};
      order.forEach((k, pos) => { if (k !== 0) distractorExplanations[pos] = why[k] || ''; });
      const q = {
        id, bank: bankId, number: i + 1,
        module: ex.m || meta.module || null,
        domain, topic,
        category: cat === 'S' ? 'situational' : 'definition',
        difficulty: diff,
        question: text,
        options,
        correctAnswer: order.indexOf(0),
        explanation: exp,
        distractorExplanations,
        source: ex.src || meta.source || 'Original question',
        learningObjective: ex.obj || (objectiveVerb[cat] + ' ' + topic),
        note: ex.note || null
      };
      S.questions[id] = q;
      bank.qids.push(id);
    });
    S.banks[bankId] = bank;
    return bank;
  };

  S.lecture = function (lec) { S.lectures[lec.id] = lec; };

  S.q = id => S.questions[id];
  S.bankQuestions = id => (S.banks[id] ? S.banks[id].qids.map(S.q) : []);
  S.moduleById = id => S.modules.find(m => m.id === id);
  S.moduleByNum = n => S.modules.find(m => m.num === n);
  S.allModuleQids = () => S.modules.flatMap(m => (S.banks[m.id] ? S.banks[m.id].qids : []));
})();
