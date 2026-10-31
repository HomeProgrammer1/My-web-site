/* mlohaza.com v3: the desk, the builder, the calculator, the booking sheet and the motion layer (Motion 12, vanilla build). */
(() => {
  'use strict';
  const M = window.Motion || null;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canMove = Boolean(M) && !reduce;
  const root = document.documentElement;
  if (!canMove) root.classList.remove('motion');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  // Every visible string comes from lang/<code>.js (generated from src/i18n), so this file stays language-free.
  const T = window.T;
  const nf = new Intl.NumberFormat(T.locale, { maximumFractionDigits: 0 });
  const fmt = (tpl, vars = {}) => tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  const money = (n) => fmt(T.cur, { n: nf.format(Math.round(n)) });
  const rules = new Intl.PluralRules(T.locale);
  const plural = (key, n) => { const forms = T.plural[key]; return forms[rules.select(n)] || forms.other; };
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const countTo = (node, to, format) => {
    if (!node) return;
    const from = Number(node.dataset.v || 0);
    node.dataset.v = String(to);
    if (!canMove || from === to) { node.textContent = format(to); return; }
    M.animate(from, to, { duration: 0.45, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => { node.textContent = format(v); } });
  };

  /* ---------- compose: find the process, draw it, automate it ---------- */
  const cp = $('#cp');
  const STEPS = [{ min: 10 }, { min: 10 }, { min: 15, gate: true }, { min: 3 }, { min: 2 }]
    .map((x, i) => ({ ...x, ...T.cp.steps[i], sys: T.cp.sys[i] }));
  const byHand = (i) => fmt(T.cp.min, { n: STEPS[i].min });
  let cpNext = 0, cpDone = false, cpRunning = false;
  if (cp) {
    const pile = $('#cpPile'), slots = $$('.cp-slot', cp), msg = $('#cpMsg'), hand = $('#cpHand'), token = $('#cpToken');
    const auto = $('#cpAuto'), book = $('#cpBook'), again = $('#cpAgain'), resetBtn = $('#cpReset');
    const phases = $$('#cpPhases li');
    const cards = $$('.cp-card', pile);
    const total = STEPS.reduce((s, x) => s + x.min, 0);
    const phase = (k) => phases.forEach((li, i) => { li.classList.toggle('is-on', i === k); $('.hl', li).classList.toggle('is-on', i === k); });
    const rel = (node) => { const s = cp.getBoundingClientRect(), r = node.getBoundingClientRect(); return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height }; };
    const pointAt = (card) => {
      if (!hand || !card) return;
      const r = rel(card);
      hand.style.setProperty('--hx', `${r.x + r.w * 0.62}px`);
      hand.style.setProperty('--hy', `${r.y + r.h * 0.55}px`);
    };
    const markNext = () => {
      cards.forEach((c) => c.classList.remove('is-next'));
      const next = cards.find((c) => Number(c.dataset.i) === cpNext);
      if (next) { next.classList.add('is-next'); pointAt(next); }
    };
    const setLine = (card, sys, who) => { $('.cp-sys', card).textContent = sys; $('.cp-who', card).textContent = who; };
    const place = (card) => {
      const i = Number(card.dataset.i), slot = slots[i];
      const from = card.getBoundingClientRect();
      slot.append(card); slot.classList.add('is-filled');
      card.classList.add('is-square'); card.classList.remove('is-next');
      setLine(card, STEPS[i].sys, byHand(i));
      card.disabled = true;
      if (canMove) { const to = card.getBoundingClientRect(); M.animate(card, { x: [from.left - to.left, 0], y: [from.top - to.top, 0] }, { duration: 0.55, ease: [0.16, 1, 0.3, 1] }); }
    };
    cards.forEach((card) => card.addEventListener('click', () => {
      if (cpDone || card.disabled) return;
      if (Number(card.dataset.i) !== cpNext) {
        card.classList.remove('is-wrong'); void card.offsetWidth; card.classList.add('is-wrong');
        msg.textContent = fmt(T.cp.first, { n: STEPS[cpNext].n });
        return;
      }
      place(card);
      if (hand) hand.classList.add('is-gone');
      cpNext += 1;
      if (cpNext < STEPS.length) { msg.textContent = fmt(T.cp.next, { n: STEPS[cpNext].n }); markNext(); return; }
      cpDone = true; phase(1); pile.hidden = true;
      msg.textContent = fmt(T.cp.drawn, { total });
      auto.hidden = false; resetBtn.hidden = false;
    }));

    // The agents pass one request along the line: a token travels card to card, each step lights up as its agent works.
    const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    const run = async () => {
      if (cpRunning) return;
      cpRunning = true; phase(2);
      auto.hidden = true; again.hidden = true; book.hidden = true; resetBtn.hidden = true;
      const placed = slots.map((s) => $('.cp-card', s));
      placed.forEach((card, i) => { card.classList.remove('is-agent', 'is-gate', 'is-run', 'is-ok'); setLine(card, STEPS[i].sys, T.cp.waiting); });
      slots.forEach((s) => s.classList.remove('is-live'));
      const moveTo = async (card) => {
        const r = rel(card);
        const to = { x: r.x + r.w / 2 - token.offsetWidth / 2, y: r.y - token.offsetHeight / 2 };
        if (canMove) { await M.animate(token, { x: to.x, y: to.y, opacity: 1 }, { duration: 0.6, ease: [0.65, 0, 0.35, 1] }); }
        else { token.style.transform = `translate(${to.x}px, ${to.y}px)`; token.style.opacity = '1'; }
      };
      if (canMove) { const r0 = rel(placed[0]); M.animate(token, { x: r0.x - 40, y: r0.y - 20, opacity: 0 }, { duration: 0 }); }
      msg.textContent = T.cp.start;
      for (let i = 0; i < placed.length; i++) {
        const card = placed[i], s = STEPS[i];
        await moveTo(card);
        card.classList.add('is-run');
        if (i > 0) slots[i].classList.add('is-live');
        if (s.gate) {
          card.classList.add('is-gate'); setLine(card, s.sys, s.agent);
          msg.textContent = T.cp.gate;
          await wait(canMove ? 1600 : 0);
          card.classList.add('is-ok'); setLine(card, s.sys, s.ok);
        } else {
          card.classList.add('is-agent'); setLine(card, s.sys, s.agent);
          await wait(canMove ? 650 : 0);
        }
        card.classList.remove('is-run');
      }
      if (canMove) await M.animate(token, { opacity: 0, y: '-=12' }, { duration: 0.3 });
      msg.textContent = fmt(T.cp.end, { total });
      again.hidden = false; book.hidden = false; resetBtn.hidden = false;
      cpRunning = false;
    };
    auto.addEventListener('click', run);
    again.addEventListener('click', run);
    resetBtn.addEventListener('click', () => {
      if (cpRunning) return;
      cards.forEach((card) => {
        card.classList.remove('is-square', 'is-agent', 'is-gate', 'is-run', 'is-ok'); card.disabled = false;
        setLine(card, '', byHand(Number(card.dataset.i)));
        pile.append(card);
      });
      slots.forEach((s) => s.classList.remove('is-filled', 'is-live'));
      cpNext = 0; cpDone = false; phase(0); pile.hidden = false;
      msg.textContent = T.cp.reset;
      auto.hidden = true; book.hidden = true; again.hidden = true; resetBtn.hidden = true;
      markNext();
    });
    markNext();
    window.addEventListener('resize', () => { const n = cards.find((c) => c.classList.contains('is-next')); if (n) pointAt(n); });
    if (reduce && hand) hand.classList.add('is-gone');
  }

  /* ---------- calculator: the visitor's own numbers ---------- */
  const pairs = ['Hours', 'Rate', 'Share', 'Invest'].map((k) => [$(`#c${k}`), $(`#n${k}`)]);
  const last = {};
  let axis = 0;
  const NICE = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const nice = (v) => { const p = 10 ** Math.floor(Math.log10(v)); return NICE.find((k) => k * p >= v) * p; };
  // Puts the formatted values into a sentence; the money figures are set in bold.
  const sentence = (node, tpl, vars, bold) => node.replaceChildren(...tpl.split(/(\{\w+\})/).filter(Boolean).map((part) => {
    const k = part.slice(1, -1);
    if (part[0] !== '{' || !(k in vars)) return document.createTextNode(part);
    return bold.includes(k) ? el('b', '', vars[k]) : document.createTextNode(vars[k]);
  }));
  const calc = () => {
    if (!pairs[0][0]) return;
    const [h, r, s, inv] = pairs.map(([rg]) => Number(rg.value));
    const share = s / 100;
    const month = h * 4.33 * r, back = month * share, hoursBack = h * 4.33 * share;
    const pay = back > 0 ? inv / back : Infinity, payM = Math.max(1, Math.ceil(pay));
    Object.assign(last, { h, r, s, inv, year: month * 12, back, payM });
    countTo($('#rYear'), month * 12, money);
    countTo($('#rMonth'), back, money);
    countTo($('#rHours'), Math.round(hoursBack), (v) => fmt(T.hours, { n: nf.format(Math.round(v)) }));
    $('#rPay').textContent = payM > 36 ? T.calc.payLong : fmt(T.calc.pay, { n: payM });
    // bars: cumulative savings on one scale; months until the budget is earned back stay light
    const bars = $('#bars');
    const total = Math.max(1, back * 12), top = Math.max(total, inv);
    if (!axis || top > axis || top < axis / 4) axis = nice(top * 1.15);
    $$('i', bars).forEach((b, i) => {
      b.style.setProperty('--h', `${((back * (i + 1)) / axis) * 100}%`);
      b.classList.toggle('is-pay', i + 1 <= payM);
    });
    $('.q', bars).style.setProperty('--q', `${Math.min(100, (inv / axis) * 100)}%`);
    $('#qLabel').textContent = fmt(T.calc.budget, { v: money(inv) });
    $('#chartScale').textContent = fmt(T.calc.scale, { v: money(axis) });
    const when = payM > 36 ? T.calc.whenLong : fmt(T.calc.whenN, { n: payM, months: plural('months', payM) });
    bars.setAttribute('aria-label', fmt(T.calc.aria, { total: money(back * 12), inv: money(inv), when }));
    sentence($('#payText'), payM <= 12 ? T.calc.ok : T.calc.slow, { inv: money(inv), back: money(back), when }, ['inv', 'back']);
  };
  pairs.forEach(([rg, num]) => {
    if (!rg) return;
    rg.addEventListener('input', () => { num.value = rg.value; calc(); });
    num.addEventListener('input', () => {
      const v = Number(num.value);
      if (num.value === '' || Number.isNaN(v)) return;
      rg.value = String(Math.min(Number(rg.max), Math.max(Number(rg.min), v)));
      calc();
    });
    num.addEventListener('change', () => { num.value = rg.value; });
  });
  calc();

  /* ---------- Calm Ops: accordion of tinted panels ---------- */
  const ops = $$('#ops .op');
  const openOp = (op) => ops.forEach((o) => {
    const open = o === op;
    o.classList.toggle('is-open', open);
    $('.op__btn', o).setAttribute('aria-expanded', String(open));
  });
  ops.forEach((o) => $('.op__btn', o).addEventListener('click', () => {
    if (o.classList.contains('is-open')) return;
    openOp(o);
    if (canMove) M.animate($('.op__body', o), { opacity: [0, 1], y: [12, 0] }, { duration: 0.4, delay: 0.15 });
  }));

  /* ---------- 8:00: the visitor is the Human Gate ---------- */
  const tgList = $('#tgList'), tgCount = $('#tgCount');
  if (tgList) $$('.msg[data-q] button', tgList).forEach((btn) => btn.addEventListener('click', () => {
    const m = btn.closest('.msg');
    if (m.dataset.done) return;
    m.dataset.done = '1';
    $$('button', m).forEach((x) => { x.disabled = true; });
    const now = m.querySelector('time').textContent;
    const mine = el('p', 'msg msg--me', btn.textContent); mine.append(el('time', '', now));
    const reply = el('p', 'msg', btn.dataset.reply); reply.append(el('time', '', now));
    tgList.append(mine, reply);
    tgList.scrollTo({ top: tgList.scrollHeight, behavior: canMove ? 'smooth' : 'auto' });
    if (canMove) { M.animate(mine, { opacity: [0, 1], y: [8, 0] }, { duration: 0.3 }); M.animate(reply, { opacity: [0, 1], y: [8, 0] }, { duration: 0.35, delay: 0.35 }); }
    const left = $$('.msg[data-q]', tgList).filter((x) => !x.dataset.done).length;
    tgCount.textContent = left === 1 ? T.tg.one : T.tg.done;
  }));

  /* ---------- booking sheet ---------- */
  const sheet = $('#sheet');
  const radio = (group) => $$('.chip', group).forEach((c) => c.addEventListener('click', () => { $$('.chip', group).forEach((x) => x.setAttribute('aria-checked', String(x === c))); }));
  const fWho = $('#fWho'), fPain = $('#fPain'), fDays = $('#fDays'), fTimes = $('#fTimes'), fWhat = $('#fWhat');
  [fWho, fPain].forEach((g) => g && radio(g));
  if (fDays && fTimes) {
    const wd = T.book.wd;
    const d = new Date(); d.setHours(12, 0, 0, 0);
    const days = [];
    while (days.length < 8) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d)); }
    fDays.replaceChildren(...days.map((x) => {
      const c = el('button', 'chip day'); c.type = 'button'; c.setAttribute('role', 'radio'); c.setAttribute('aria-checked', 'false');
      const date = `${String(x.getDate()).padStart(2, '0')}.${String(x.getMonth() + 1).padStart(2, '0')}`;
      c.dataset.v = `${wd[x.getDay()]} ${date}`; c.append(el('b', '', wd[x.getDay()]), document.createTextNode(date));
      return c;
    }));
    fTimes.replaceChildren(...T.book.times.map((t) => { const c = el('button', 'chip', t); c.type = 'button'; c.setAttribute('role', 'radio'); c.setAttribute('aria-checked', 'false'); c.dataset.v = t; return c; }));
    radio(fDays); radio(fTimes);
  }
  const pick = (g) => { const c = g && $('.chip[aria-checked="true"]', g); return c ? c.dataset.v : ''; };
  const setPick = (g, v) => g && $$('.chip', g).forEach((x) => x.setAttribute('aria-checked', String(x.dataset.v === v)));
  let opener = null;
  const openSheet = (from) => {
    if (!sheet || typeof sheet.showModal !== 'function') return false;
    opener = from;
    const kind = from && from.dataset.prefill;
    if (kind === 'calc' && last.year != null) fWhat.value = fmt(T.book.prefill.calc, { h: last.h, r: money(last.r), year: money(last.year), inv: money(last.inv) });
    else if (kind && T.book.prefill[kind] && kind !== 'calc') fWhat.value = T.book.prefill[kind];
    sheet.showModal();
    $('.sheet__in', sheet).scrollTop = 0;
    if (canMove) {
      const phone = window.matchMedia('(max-width: 760px)').matches;
      M.animate(sheet, phone ? { y: ['100%', '0%'] } : { x: ['100%', '0%'] }, { duration: 0.45, ease: [0.16, 1, 0.3, 1] });
    }
    return true;
  };
  const closeSheet = () => { if (sheet && sheet.open) sheet.close(); };
  $$('[data-book]').forEach((a) => a.addEventListener('click', (e) => { if (openSheet(a)) e.preventDefault(); }));
  if (sheet) {
    $('#sheetClose').addEventListener('click', closeSheet);
    sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
    sheet.addEventListener('close', () => { if (opener) opener.focus({ preventScroll: true }); });
  }
  const form = $('#bookForm'), confirmBox = $('#confirm');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#fEmail').value.trim();
    const err = $('#fError');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.hidden = false; err.textContent = T.book.error; $('#fEmail').focus(); return; }
    err.hidden = true;
    const when = [pick(fDays), pick(fTimes)].filter(Boolean).join(', ');
    const B = T.book;
    const lines = [
      B.title,
      `${B.who}: ${pick(fWho) || B.none}`,
      `${B.pain}: ${pick(fPain) || B.none}`,
      `${B.when}: ${when ? fmt(B.whenTz, { when }) : B.whenNone}`,
      `Email: ${email}`,
      $('#fName').value.trim() && `${B.name}: ${$('#fName').value.trim()}`,
      fWhat.value.trim() && `${B.what}: ${fWhat.value.trim()}`,
    ].filter(Boolean);
    const text = lines.join('\n');
    $('#confirmText').textContent = text;
    $('#mailLink').href = `mailto:kontakt@mlohaza.com?subject=${encodeURIComponent(T.book.subject)}&body=${encodeURIComponent(text)}`;
    form.hidden = true; confirmBox.hidden = false; $('.sheet__in', sheet).scrollTop = 0; confirmBox.focus({ preventScroll: true });
  });
  const copyBtn = $('#copyBtn');
  if (copyBtn) copyBtn.addEventListener('click', () => {
    const text = $('#confirmText').textContent, msg = $('#copyMsg');
    const fallback = () => { const r = document.createRange(); r.selectNodeContents($('#confirmText')); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); msg.textContent = T.book.selected; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => { msg.textContent = T.book.copied; }, fallback);
    else fallback();
  });
  const editBtn = $('#editBtn');
  if (editBtn) editBtn.addEventListener('click', () => { confirmBox.hidden = true; form.hidden = false; $('#fEmail').focus(); });


  /* ---------- a new page opens at its top unless a section was asked for ---------- */
  if (!window.location.hash) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });
    const first = $('.skip') || document.body;
    try { first.scrollIntoView({ block: 'start', behavior: 'instant' }); } catch (e) { first.scrollIntoView(true); }
  }

  /* ---------- the bar steps aside while you read and comes back when you scroll up ---------- */
  const nav = $('#nav');
  if (nav) {
    const menu = $('.nav__menu', nav);
    const setOpen = (open) => { nav.classList.toggle('is-open', open); menu.setAttribute('aria-expanded', String(open)); };
    menu.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    $$('.nav__links a', nav).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (!nav.classList.contains('is-open')) {
        if (y > lastY + 6 && y > 140) nav.classList.add('is-hidden');
        else if (y < lastY - 6 || y <= 140) nav.classList.remove('is-hidden');
      }
      lastY = y;
    }, { passive: true });
    nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));
  }

  /* ---------- hero: the process that is already there, revealed by the cursor ---------- */
  const bp = $('#blueprint');
  if (bp && bp.getContext) {
    const host = bp.parentElement, ctx = bp.getContext('2d');
    const tok = getComputedStyle(root);
    const C = { line: tok.getPropertyValue('--cobalt').trim(), gate: tok.getPropertyValue('--marker').trim(), ink: tok.getPropertyValue('--ink').trim() };
    const LABELS = T.canvas;
    let W = 1, H = 1, dpr = 1, off = null, spot = null, running = false, raf = 0, clear = null;
    const copy = $('.hero__copy', host);
    const mouse = { x: 0, y: 0, on: false, tm: 0 }, cur = { x: 0, y: 0, init: false };
    const t0 = performance.now();
    const build = () => {
      off = document.createElement('canvas'); spot = document.createElement('canvas');
      [off, spot].forEach((c) => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
      const o = off.getContext('2d'); o.setTransform(dpr, 0, 0, dpr, 0, 0);
      o.strokeStyle = C.line; o.fillStyle = C.line; o.lineWidth = 1;
      o.globalAlpha = 0.3;
      for (let x = 0; x < W; x += 40) { o.beginPath(); o.moveTo(x + 0.5, 0); o.lineTo(x + 0.5, H); o.stroke(); }
      for (let y = 0; y < H; y += 40) { o.beginPath(); o.moveTo(0, y + 0.5); o.lineTo(W, y + 0.5); o.stroke(); }
      // on a phone the words fill the stage, so the process boxes would sit on top of them: keep only the grid
      if (W < 700) return;
      const nw = 136, nh = 36;
      const cols = Math.max(3, Math.floor(W / 230)), rows = Math.max(3, Math.floor(H / 140)), cw = W / cols, rh = H / rows;
      const nodes = [];
      for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) { if ((c * 7 + r * 3) % 4 === 0) continue; nodes.push({ x: c * cw + cw * 0.14, y: r * rh + rh * 0.34, c, r }); }
      o.globalAlpha = 0.9; o.lineWidth = 1.5;
      nodes.forEach((n) => {
        const nx = nodes.find((k) => k.c === n.c + 1 && Math.abs(k.r - n.r) <= 1);
        if (nx) { o.beginPath(); o.moveTo(n.x + nw, n.y + nh / 2); o.bezierCurveTo(n.x + nw + 34, n.y + nh / 2, nx.x - 34, nx.y + nh / 2, nx.x, nx.y + nh / 2); o.stroke(); }
      });
      o.font = '600 13px Geologica, "Segoe UI", system-ui, sans-serif';
      nodes.forEach((n, i) => {
        const label = LABELS[i % LABELS.length];
        if (label === 'Human Gate') { o.globalAlpha = 0.95; o.fillStyle = C.gate; o.fillRect(n.x, n.y, nw, nh); o.fillStyle = C.ink; o.fillText(label, n.x + 12, n.y + 23); o.fillStyle = C.line; return; }
        o.globalAlpha = 0.9; o.strokeRect(n.x + 0.5, n.y + 0.5, nw, nh); o.globalAlpha = 0.85; o.fillText(label, n.x + 12, n.y + 23);
      });
    };
    const frame = (now) => {
      const t = (now - t0) / 1000;
      const tg = mouse.on ? mouse : { x: W * (0.5 + 0.36 * Math.sin(t * 0.38)), y: H * (0.5 + 0.32 * Math.sin(t * 0.61 + 1)) };
      if (!cur.init) { cur.x = tg.x; cur.y = tg.y; cur.init = true; }
      cur.x += (tg.x - cur.x) * 0.12; cur.y += (tg.y - cur.y) * 0.12;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 0.09; ctx.drawImage(off, 0, 0, W, H); ctx.globalAlpha = 1;
      const s = spot.getContext('2d'); s.setTransform(1, 0, 0, 1, 0, 0);
      s.globalCompositeOperation = 'source-over'; s.clearRect(0, 0, spot.width, spot.height); s.drawImage(off, 0, 0);
      const k = spot.width / W, R = 240 * k, g = s.createRadialGradient(cur.x * k, cur.y * k, 0, cur.x * k, cur.y * k, R);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      s.globalCompositeOperation = 'destination-in'; s.fillStyle = g; s.fillRect(0, 0, spot.width, spot.height); s.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.75; ctx.drawImage(spot, 0, 0, W, H); ctx.globalAlpha = 1;
      // keep the words readable: the drawing fades out under the headline and the buttons
      if (clear) {
        ctx.save(); ctx.globalCompositeOperation = 'destination-out';
        ctx.translate(clear.x, clear.y); ctx.scale(clear.rx / clear.ry, 1);
        const f = ctx.createRadialGradient(0, 0, 0, 0, 0, clear.ry);
        f.addColorStop(0, 'rgba(0,0,0,.92)'); f.addColorStop(0.7, 'rgba(0,0,0,.75)'); f.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = f; ctx.fillRect(-clear.ry, -clear.ry, clear.ry * 2, clear.ry * 2); ctx.restore();
      }
    };
    const loop = (now) => { if (!running) return; frame(now); raf = requestAnimationFrame(loop); };
    const start = () => { if (running || reduce) return; running = true; raf = requestAnimationFrame(loop); };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const resize = () => {
      const r = host.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      bp.width = Math.round(W * dpr); bp.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (copy) { const c = copy.getBoundingClientRect(); clear = { x: c.left - r.left + c.width / 2, y: c.top - r.top + c.height / 2, rx: c.width * 0.62, ry: c.height * 0.72 }; }
      if (!running) { cur.init = false; mouse.on = true; mouse.x = W * 0.8; mouse.y = H * 0.32; frame(performance.now()); mouse.on = false; }
    };
    host.addEventListener('pointermove', (e) => { const r = bp.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true; clearTimeout(mouse.tm); mouse.tm = setTimeout(() => { mouse.on = false; }, 2200); }, { passive: true });
    host.addEventListener('pointerleave', () => { mouse.on = false; });
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host); else window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { if (es[0].isIntersecting) start(); else stop(); }).observe(host); else start();
    resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  }

  /* ---------- Excel and CRM become one: the demo plays itself ---------- */
  const mStage = $('#mStage');
  if (mStage) {
    const ROWS = T.merge.rows, MG = T.merge;
    const xl = $('#mXl'), crm = $('#mCrm'), agent = $('#mAgent'), gate = $('#mGate'), note = $('#mNote'), stat = $('#mStat'), again = $('#mAgain'), count = $('#mCount');
    let timers = [], played = false;
    const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    const reset = () => {
      timers.forEach(clearTimeout); timers = [];
      xl.replaceChildren(...ROWS.map((r) => el('li', '', r.raw)));
      crm.replaceChildren(); agent.classList.remove('is-busy'); gate.classList.remove('is-waiting');
      note.textContent = MG.wait; stat.textContent = fmt(MG.moved, { i: 0, n: ROWS.length }); count.textContent = fmt(MG.count, { n: 0, records: plural('records', 0) }); again.hidden = true;
    };
    const cards = () => crm.children.length;
    const addCard = (r) => { const li = el('li', r.gate ? 'is-gate' : '', r.name); li.append(el('small', '', r.sub)); crm.append(li); count.textContent = fmt(MG.count, { n: cards(), records: plural('records', cards()) }); return li; };
    const finish = () => { agent.classList.remove('is-busy'); note.textContent = fmt(MG.done, { n: cards(), records: plural('records', cards()) }); again.hidden = false; };
    const play = (instant) => {
      reset();
      const rows = $$('li', xl);
      if (instant) {
        ROWS.forEach((r, i) => { rows[i].classList.add('is-done'); if (!r.dup) addCard(r); });
        stat.textContent = fmt(MG.moved, { i: ROWS.length, n: ROWS.length }); finish(); return;
      }
      let t = 300;
      ROWS.forEach((r, i) => {
        later(() => { rows.forEach((x) => x.classList.remove('is-now')); rows[i].classList.add('is-now'); agent.classList.add('is-busy'); note.textContent = r.note; }, t);
        t += 1300;
        if (r.gate) {
          later(() => { gate.classList.add('is-waiting'); }, t - 600);
          t += 1600;
          later(() => { gate.classList.remove('is-waiting'); note.textContent = r.ok; }, t);
          t += 700;
        }
        later(() => {
          rows[i].classList.remove('is-now'); rows[i].classList.add('is-done');
          if (r.dup) { const first = crm.firstElementChild; if (first) first.lastChild.textContent += MG.sources; } else addCard(r);
          stat.textContent = fmt(MG.moved, { i: i + 1, n: ROWS.length });
        }, t);
        t += 500;
      });
      later(finish, t);
    };
    again.addEventListener('click', () => play(reduce));
    reset();
    if (reduce || !('IntersectionObserver' in window)) play(true);
    else new IntersectionObserver((es, ob) => { if (es[0].isIntersecting && !played) { played = true; ob.disconnect(); play(false); } }, { threshold: 0.4 }).observe(mStage);
  }

  /* ---------- motion: sheets land on the desk, then lie still ---------- */
  if (!canMove) return;
  const ease = [0.16, 1, 0.3, 1];
  // Loose sheets fall a little further askew than where they rest; Motion's rotate adds to the CSS rotate.
  const land = (nodes, delay = 0, fade = false) => nodes.forEach((n, i) => {
    const r = parseFloat(getComputedStyle(n).getPropertyValue('--r')) || 0;
    const fall = { y: [-26, 0], rotate: [r * 2.4 + (i % 2 ? 1.5 : -1.5), 0] };
    if (fade) fall.opacity = [0, 1];
    M.animate(n, fall, { duration: 0.7, ease, delay: delay + i * 0.07 });
  });
  M.inView('#cpPile', () => { land($$('#cpPile .cp-card')); }, { amount: 0.3 });

  // Opening a page puts its first sheets on the desk; nothing else fades or slides on scroll.
  const deal = (nodes) => nodes.forEach((n, i) => {
    M.animate(n, { y: [-18, 0], rotate: [i % 2 ? 0.8 : -0.8, 0] }, { duration: 0.6, ease, delay: 0.05 + i * 0.06 });
  });
  deal($$('.page-band > *, .me > .tile, .me > figure, .me .rail > .tile'));
  // 8:00: the morning messages arrive one after another.
  if (tgList) M.inView(tgList, () => {
    M.animate($$('.msg, .tg__head', tgList), { y: [14, 0], scale: [0.98, 1] }, { duration: 0.4, ease, delay: M.stagger(0.25) });
  }, { amount: 0.4 });
  // Only loose sheets move after that: they land, and they square up when the visitor decides.
  $$('.askew').filter((n) => !n.closest('#cpPile, .cp-flow')).forEach((n) => {
    M.inView(n, () => { land([n]); }, { amount: 0.3 });
  });
  // Case studies: the picture next to each case replays "before, what we did, result" while it is on screen,
  // and the matching text column lights up. One case plays at a time; reduced motion keeps the still picture.
  const caseRows = $$('.case-row[data-anim]');
  if (caseRows.length) {
    const pics = new Map(caseRows.map((row) => [row, $('.cr-pic', row).innerHTML]));
    const MSGS = (T.cases && T.cases.msgs) || [];
    const pct = (v) => `${Math.round(v)}%`;
    const whole = (v) => String(Math.round(v));
    const beat = (row, k) => $$('.cr-steps > div', row).forEach((d, i) => d.classList.toggle('is-beat', i === k));
    const restore = (row) => { $('.cr-pic', row).innerHTML = pics.get(row); beat(row, -1); };
    let run = null;
    const make = (row) => {
      const r = { row, alive: true, timers: [], anims: [] };
      r.wait = (ms) => new Promise((res) => { r.timers.push(setTimeout(() => { if (r.alive) res(); }, ms)); });
      r.go = (el, kf, opt) => { const a = M.animate(el, kf, { ease, ...opt }); r.anims.push(a); return a; };
      r.count = (node, from, to, fmt, duration) => r.go(from, to, { duration, onUpdate: (v) => { node.textContent = fmt(v); } });
      return r;
    };
    const SCENES = {
      async jira(row, r) {
        const bars = $$('.cbars i', row), vals = $$('.cbars b', row), msg = $('.crx-msg', row);
        const finals = vals.map((v) => v.textContent);
        bars.forEach((b) => { b.style.transform = 'scaleX(0)'; });
        vals.forEach((v) => { v.textContent = '0%'; });
        msg.style.opacity = '0';
        beat(row, 0);
        r.go(bars[0], { scaleX: [0, 1] }, { duration: 1.4 });
        r.count(vals[0], 0, 100, pct, 1.4);
        await r.wait(2000);
        beat(row, 1);
        for (const m of MSGS) {
          const lane = $(`[data-lane="${m.to}"]`, row);
          msg.textContent = m.t;
          r.go(msg, { opacity: [0, 1], x: [-14, 0] }, { duration: 0.35 });
          await r.wait(800);
          lane.classList.add('is-hit');
          r.go(msg, { opacity: [1, 0], x: [0, 18] }, { duration: 0.3, delay: 0.25 });
          await r.wait(750);
          lane.classList.remove('is-hit');
        }
        beat(row, 2);
        r.go(bars[1], { scaleX: [0, 1] }, { duration: 0.9 });
        r.count(vals[1], 0, 13, pct, 0.9);
        await r.wait(1100);
        vals[1].textContent = finals[1];
        r.go(vals[1], { scale: [1.3, 1] }, { duration: 0.4 });
        await r.wait(2600);
      },
      async erp(row, r) {
        const bars = $$('.cbars i', row), vals = $$('.cbars b', row), hand = $('.crx-clock i', row), n = $('.crx-n', row), people = $$('.crx-people i', row);
        bars.forEach((b) => { b.style.transform = 'scaleX(0)'; });
        vals.forEach((v) => { v.style.opacity = '0'; });
        people.forEach((p) => p.classList.remove('is-on'));
        n.textContent = '0%';
        beat(row, 0);
        r.go(bars[0], { scaleX: [0, 1] }, { duration: 2.4, ease: 'linear' });
        r.go(hand, { rotate: [0, 1440] }, { duration: 2.4, ease: 'linear' });
        await r.wait(2400);
        r.go(vals[0], { opacity: [0, 1] }, { duration: 0.3 });
        await r.wait(700);
        beat(row, 1);
        r.go(bars[1], { scaleX: [0, 1] }, { duration: 0.25 });
        r.go(hand, { rotate: [1440, 1470] }, { duration: 0.25 });
        r.go(vals[1], { opacity: [0, 1] }, { duration: 0.3, delay: 0.2 });
        await r.wait(1400);
        beat(row, 2);
        people.slice(0, 9).forEach((p, i) => r.timers.push(setTimeout(() => p.classList.add('is-on'), i * 130)));
        r.count(n, 0, 90, pct, 1.2);
        await r.wait(3000);
      },
      async crm(row, r) {
        const sheets = $$('.cmerge span', row), box = $('.cmerge b', row), n = $('.crx-n', row), note = $('.crx-note', row);
        n.textContent = `0/${sheets.length}`;
        note.style.opacity = '0';
        beat(row, 0);
        r.go(sheets, { opacity: [0, 1], y: [-10, 0] }, { duration: 0.4, delay: M.stagger(0.12) });
        await r.wait(1500);
        beat(row, 1);
        const b = box.getBoundingClientRect();
        for (let i = sheets.length - 1, done = 1; i >= 0; i--, done++) {
          const s = sheets[i].getBoundingClientRect();
          r.go(sheets[i], { x: [0, b.left + b.width / 2 - (s.left + s.width / 2)], opacity: [1, 0], scale: [1, 0.5] }, { duration: 0.5 });
          await r.wait(420);
          n.textContent = `${done}/${sheets.length}`;
        }
        beat(row, 2);
        box.classList.add('is-hit');
        r.go(note, { opacity: [0, 1], y: [6, 0] }, { duration: 0.4 });
        await r.wait(2800);
      },
      async stories(row, r) {
        const brief = $('.cgrid b', row), tiles = $$('.cgrid i', row), n = $('.crx-n', row);
        tiles.forEach((t) => { t.style.opacity = '0.15'; });
        n.textContent = '0';
        beat(row, 0);
        await r.wait(1000);
        beat(row, 1);
        r.go(brief, { scale: [1, 1.15, 1] }, { duration: 0.6 });
        await r.wait(700);
        r.go(brief, { scale: [1, 1.15, 1] }, { duration: 0.6 });
        await r.wait(900);
        beat(row, 2);
        tiles.forEach((t, i) => t.classList.add(`c${i % 4}`));
        r.go(tiles, { opacity: [0.15, 1] }, { duration: 0.3, delay: M.stagger(0.045) });
        r.count(n, 0, tiles.length, whole, tiles.length * 0.045 + 0.3);
        await r.wait(3400);
      },
      async podium(row, r) {
        const blocks = $$('.cpodium > i', row), layer = $('.crx-dots', row), dots = $$('.crx-dots i', row), n = $('.crx-n', row), big = $('.cr-big', row);
        blocks.forEach((b) => { b.style.transform = 'scaleY(0)'; });
        blocks[0].classList.remove('is-hi');
        layer.style.opacity = '1';
        dots.forEach((d) => { d.style.opacity = '0'; });
        big.style.opacity = '0';
        n.textContent = '0';
        beat(row, 0);
        r.go(dots, { opacity: [0, 1], scale: [0.4, 1] }, { duration: 0.25, delay: M.stagger(0.015) });
        r.count(n, 0, 70, whole, 1.3);
        await r.wait(1900);
        beat(row, 1);
        r.go(dots, { opacity: [1, 0], scale: [1, 0.3] }, { duration: 0.3, delay: M.stagger(0.006) });
        r.go([blocks[1], blocks[0], blocks[2]], { scaleY: [0, 1] }, { duration: 0.55, delay: M.stagger(0.18, { startDelay: 0.3 }) });
        await r.wait(1700);
        beat(row, 2);
        blocks[0].classList.add('is-hi');
        r.go(big, { opacity: [0, 1], scale: [1.4, 1] }, { duration: 0.45 });
        await r.wait(2800);
      },
    };
    const stop = () => {
      if (!run) return;
      run.alive = false;
      run.timers.forEach(clearTimeout);
      run.anims.forEach((a) => { if (a && a.stop) a.stop(); });
      restore(run.row);
      run = null;
    };
    const start = async (row) => {
      if (run && run.row === row) return;
      stop();
      const r = make(row);
      run = r;
      while (r.alive) {
        restore(row);
        await SCENES[row.dataset.anim](row, r);
        beat(row, -1);
        await r.wait(500);
      }
    };
    // play the case whose picture is most in view; nothing plays when no picture is half visible
    const seen = new Map();
    const pick = () => {
      let best = null, top = 0.5;
      seen.forEach((ratio, row) => { if (ratio >= top) { best = row; top = ratio; } });
      if (best) start(best); else stop();
    };
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => seen.set(e.target.closest('.case-row'), e.intersectionRatio));
      pick();
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    caseRows.forEach((row) => io.observe($('.cr-pic', row)));
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else pick(); });
  }

  if (M.press) {
    M.press('.cp-card, .chip, .btn, .fab, .t-act, .rung__btn, .msg__btns button, .op__btn', (node) => {
      M.animate(node, { scale: 0.97 }, { duration: 0.12 });
      return () => M.animate(node, { scale: 1 }, { type: 'spring', stiffness: 520, damping: 30 });
    });
  }
})();
