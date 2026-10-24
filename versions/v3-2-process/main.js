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
  const nf = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 });
  const zl = (n) => `${nf.format(Math.round(n))} zł`;
  const half = (v) => nf1.format(Math.round(v * 2) / 2);
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
  const people = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'людини' : 'людей');

  /* ---------- compose: find the process, draw it, automate it ---------- */
  const cp = $('#cp');
  const STEPS = [
    { n: 'Нова заявка', who: 'менеджер', agent: 'агент читає заявку й заводить картку' },
    { n: 'Внести в CRM', who: 'менеджер', agent: 'агент вносить дані в CRM' },
    { n: 'Погодити знижку', who: 'власник', gate: true, agent: 'Human Gate: вирішує власник' },
    { n: 'Виставити рахунок', who: 'бухгалтерія', agent: 'агент виставляє рахунок' },
    { n: 'Звіт власнику', who: 'менеджер', agent: 'агент збирає звіт щопонеділка' },
  ];
  let cpNext = 0, cpDone = false;
  if (cp) {
    const pile = $('#cpPile'), slots = $$('.cp-slot', cp), msg = $('#cpMsg'), hand = $('#cpHand');
    const auto = $('#cpAuto'), book = $('#cpBook'), resetBtn = $('#cpReset');
    const phases = $$('#cpPhases li');
    const cards = $$('.cp-card', pile);
    const phase = (k) => phases.forEach((li, i) => { li.classList.toggle('is-on', i === k); $('.hl', li).classList.toggle('is-on', i === k); });
    const pointAt = (card) => {
      if (!hand || !card) return;
      const s = cp.getBoundingClientRect(), r = card.getBoundingClientRect();
      hand.style.setProperty('--hx', `${r.left - s.left + r.width * 0.62}px`);
      hand.style.setProperty('--hy', `${r.top - s.top + r.height * 0.55}px`);
    };
    const markNext = () => {
      cards.forEach((c) => c.classList.remove('is-next'));
      const next = cards.find((c) => Number(c.dataset.i) === cpNext);
      if (next) { next.classList.add('is-next'); pointAt(next); }
    };
    const place = (card) => {
      const i = Number(card.dataset.i), slot = slots[i];
      const from = card.getBoundingClientRect();
      slot.append(card); slot.classList.add('is-filled');
      card.classList.add('is-square'); card.classList.remove('is-next');
      $('.cp-who', card).textContent = STEPS[i].who;
      card.disabled = true;
      if (canMove) { const to = card.getBoundingClientRect(); M.animate(card, { x: [from.left - to.left, 0], y: [from.top - to.top, 0] }, { duration: 0.55, ease: [0.16, 1, 0.3, 1] }); }
    };
    cards.forEach((card) => card.addEventListener('click', () => {
      if (cpDone || card.disabled) return;
      if (Number(card.dataset.i) !== cpNext) {
        card.classList.remove('is-wrong'); void card.offsetWidth; card.classList.add('is-wrong');
        msg.textContent = `Спершу «${STEPS[cpNext].n}».`;
        return;
      }
      place(card);
      if (hand) hand.classList.add('is-gone');
      cpNext += 1;
      if (cpNext < STEPS.length) { msg.textContent = `Далі: «${STEPS[cpNext].n}».`; markNext(); return; }
      cpDone = true; phase(1); pile.hidden = true;
      msg.textContent = 'Тепер процес на схемі: видно, що за чим іде і хто відповідає. Чотири кроки з п\'яти повторюються щодня.';
      auto.hidden = false; resetBtn.hidden = false;
    }));
    auto.addEventListener('click', () => {
      phase(2);
      slots.forEach((slot, i) => {
        const card = $('.cp-card', slot); if (!card) return;
        card.classList.add(STEPS[i].gate ? 'is-gate' : 'is-agent');
        $('.cp-who', card).textContent = STEPS[i].agent;
        if (canMove) M.animate(card, { scale: [0.96, 1] }, { duration: 0.35, delay: i * 0.12 });
      });
      msg.textContent = 'Агенти роблять 4 кроки з 5, а рішення про знижку лишається за власником. Так працює Calm Ops на одному процесі.';
      auto.hidden = true; book.hidden = false;
    });
    resetBtn.addEventListener('click', () => {
      cards.forEach((card) => {
        card.classList.remove('is-square', 'is-agent', 'is-gate'); card.disabled = false;
        $('.cp-who', card).textContent = 'хто?';
        pile.append(card);
      });
      slots.forEach((s) => s.classList.remove('is-filled'));
      cpNext = 0; cpDone = false; phase(0); pile.hidden = false;
      msg.textContent = 'Почніть з картки «Нова заявка».';
      auto.hidden = true; book.hidden = true; resetBtn.hidden = true;
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
  const months = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'місяць' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'місяці' : 'місяців');
  const calc = () => {
    if (!pairs[0][0]) return;
    const [h, r, s, inv] = pairs.map(([rg]) => Number(rg.value));
    const share = s / 100;
    const month = h * 4.33 * r, back = month * share, hoursBack = h * 4.33 * share;
    const pay = back > 0 ? inv / back : Infinity, payM = Math.max(1, Math.ceil(pay));
    Object.assign(last, { h, r, s, inv, year: month * 12, back, payM });
    countTo($('#rYear'), month * 12, zl);
    countTo($('#rMonth'), back, zl);
    countTo($('#rHours'), Math.round(hoursBack), (v) => `${nf.format(Math.round(v))} год`);
    $('#rPay').textContent = payM > 36 ? 'понад 3 роки' : `${payM} міс.`;
    // bars: cumulative savings on one scale; months until the budget is earned back stay light
    const bars = $('#bars');
    const total = Math.max(1, back * 12), top = Math.max(total, inv);
    if (!axis || top > axis || top < axis / 4) axis = nice(top * 1.15);
    $$('i', bars).forEach((b, i) => {
      b.style.setProperty('--h', `${((back * (i + 1)) / axis) * 100}%`);
      b.classList.toggle('is-pay', i + 1 <= payM);
    });
    $('.q', bars).style.setProperty('--q', `${Math.min(100, (inv / axis) * 100)}%`);
    $('#qLabel').textContent = `бюджет ${zl(inv)}`;
    $('#chartScale').textContent = `шкала до ${zl(axis)}`;
    bars.setAttribute('aria-label', `Накопичена економія: ${zl(back * 12)} за 12 місяців, бюджет ${zl(inv)} окупається за ${payM} ${months(payM)}`);
    const t = $('#payText');
    if (payM <= 12) t.replaceChildren('Бюджет ', el('b', '', zl(inv)), ` окупиться за ${payM} ${months(payM)}. Далі автоматизація повертає `, el('b', '', zl(back)), ' щомісяця.');
    else t.replaceChildren(`З такими цифрами бюджет окупиться за ${payM > 36 ? 'понад 3 роки' : `${payM} ${months(payM)}`}. На консультації подивимось, що автоматизувати першим, щоб скоротити цей строк.`);
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
    tgCount.textContent = left === 1 ? 'Залишилося одне рішення.' : 'Два рішення за дві хвилини. Решту зробили агенти.';
  }));

  /* ---------- booking sheet ---------- */
  const sheet = $('#sheet');
  const radio = (group) => $$('.chip', group).forEach((c) => c.addEventListener('click', () => { $$('.chip', group).forEach((x) => x.setAttribute('aria-checked', String(x === c))); }));
  const fWho = $('#fWho'), fPain = $('#fPain'), fDays = $('#fDays'), fTimes = $('#fTimes'), fWhat = $('#fWhat');
  [fWho, fPain].forEach((g) => g && radio(g));
  if (fDays && fTimes) {
    const wd = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
    const d = new Date(); d.setHours(12, 0, 0, 0);
    const days = [];
    while (days.length < 8) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d)); }
    fDays.replaceChildren(...days.map((x) => {
      const c = el('button', 'chip day'); c.type = 'button'; c.setAttribute('role', 'radio'); c.setAttribute('aria-checked', 'false');
      const date = `${String(x.getDate()).padStart(2, '0')}.${String(x.getMonth() + 1).padStart(2, '0')}`;
      c.dataset.v = `${wd[x.getDay()]} ${date}`; c.append(el('b', '', wd[x.getDay()]), document.createTextNode(date));
      return c;
    }));
    fTimes.replaceChildren(...['9:00', '11:00', '14:00', '16:30'].map((t) => { const c = el('button', 'chip', t); c.type = 'button'; c.setAttribute('role', 'radio'); c.setAttribute('aria-checked', 'false'); c.dataset.v = t; return c; }));
    radio(fDays); radio(fTimes);
  }
  const pick = (g) => { const c = g && $('.chip[aria-checked="true"]', g); return c ? c.dataset.v : ''; };
  const setPick = (g, v) => g && $$('.chip', g).forEach((x) => x.setAttribute('aria-checked', String(x.dataset.v === v)));
  const PREFILL = {
    audit: 'Хочу обговорити аудит процесів.',
    pilot: 'Хочу обговорити пілот на одному процесі.',
    care: 'Хочу обговорити супровід автоматизацій.',
  };
  let opener = null;
  const openSheet = (from) => {
    if (!sheet || typeof sheet.showModal !== 'function') return false;
    opener = from;
    const kind = from && from.dataset.prefill;
    if (kind === 'process') fWhat.value = 'Склав процес на сайті: заявка, CRM, знижка, рахунок, звіт. Хочу так само у себе.';
    if (kind === 'data') fWhat.value = 'Хочу прибрати ручне перенесення даних з таблиць у CRM.';
    if (kind === 'calc' && last.year != null) fWhat.value = `Мої цифри з калькулятора: ${last.h} год на тиждень, ${last.r} zł за годину, ${zl(last.year)} на рік, бюджет ${zl(last.inv)}.`;
    if (PREFILL[kind]) fWhat.value = PREFILL[kind];
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.hidden = false; err.textContent = 'Вкажіть email у форматі name@firma.pl, щоб я міг підтвердити час.'; $('#fEmail').focus(); return; }
    err.hidden = true;
    const when = [pick(fDays), pick(fTimes)].filter(Boolean).join(', ');
    const lines = [
      'Заявка на консультацію (30 хв, 190 zł)',
      `Хто: ${pick(fWho) || 'не вказано'}`,
      `Болить: ${pick(fPain) || 'не вказано'}`,
      `Коли: ${when ? `${when} (Варшава)` : 'узгодимо в листі'}`,
      `Email: ${email}`,
      $('#fName').value.trim() && `Ім'я: ${$('#fName').value.trim()}`,
      fWhat.value.trim() && `Що автоматизувати: ${fWhat.value.trim()}`,
    ].filter(Boolean);
    const text = lines.join('\n');
    $('#confirmText').textContent = text;
    $('#mailLink').href = `mailto:kontakt@mlohaza.com?subject=${encodeURIComponent('Консультація 30 хв')}&body=${encodeURIComponent(text)}`;
    form.hidden = true; confirmBox.hidden = false; $('.sheet__in', sheet).scrollTop = 0; confirmBox.focus({ preventScroll: true });
  });
  const copyBtn = $('#copyBtn');
  if (copyBtn) copyBtn.addEventListener('click', () => {
    const text = $('#confirmText').textContent, msg = $('#copyMsg');
    const fallback = () => { const r = document.createRange(); r.selectNodeContents($('#confirmText')); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); msg.textContent = 'Текст виділено, скопіюйте його клавішами Ctrl+C або через меню.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => { msg.textContent = 'Скопійовано. Вставте в лист на kontakt@mlohaza.com.'; }, fallback);
    else fallback();
  });
  const editBtn = $('#editBtn');
  if (editBtn) editBtn.addEventListener('click', () => { confirmBox.hidden = true; form.hidden = false; $('#fEmail').focus(); });


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
    const LABELS = ['Excel', 'AI-агент', 'CRM', 'Пошта', 'Перевірка даних', 'Звіт', 'Telegram', 'Рахунок', 'Human Gate', 'Google Sheets', 'Календар', 'База кандидатів'];
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
    const ROWS = [
      { raw: 'petrenko ivan · 600123456 · 12/10', name: 'Іван Петренко', sub: '+48 600 123 456 · 12.10.2026', note: 'Виправляю формат імені, телефону й дати.' },
      { raw: 'Іван Петренко · +48 600 123 456', dup: true, note: "Це дубль, об'єдную записи." },
      { raw: 'Anna Kowalska · 511022033 · 13/10', name: 'Anna Kowalska', sub: '+48 511 022 033 · 13.10.2026', note: 'Додаю код країни й повну дату.' },
      { raw: 'Олена Ковальчук · відмова', name: 'Олена Ковальчук', sub: 'лист з відмовою надіслано', gate: true, note: 'Лист з відмовою чекає рекрутера.', ok: 'Рекрутер погодив.' },
      { raw: 'Marek Nowak · marek@firma.pl · 14.10', name: 'Marek Nowak', sub: 'marek@firma.pl · 14.10.2026', note: 'Створюю картку.' },
    ];
    const xl = $('#mXl'), crm = $('#mCrm'), agent = $('#mAgent'), gate = $('#mGate'), note = $('#mNote'), stat = $('#mStat'), again = $('#mAgain'), count = $('#mCount');
    let timers = [], played = false;
    const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    const reset = () => {
      timers.forEach(clearTimeout); timers = [];
      xl.replaceChildren(...ROWS.map((r) => el('li', '', r.raw)));
      crm.replaceChildren(); agent.classList.remove('is-busy'); gate.classList.remove('is-waiting');
      note.textContent = 'Чекаю на перший рядок.'; stat.textContent = `Перенесено 0 з ${ROWS.length}`; count.textContent = '0 записів'; again.hidden = true;
    };
    const cards = () => crm.children.length;
    const addCard = (r) => { const li = el('li', r.gate ? 'is-gate' : '', r.name); li.append(el('small', '', r.sub)); crm.append(li); count.textContent = `${cards()} ${cards() === 1 ? 'запис' : cards() < 5 ? 'записи' : 'записів'}`; return li; };
    const finish = () => { agent.classList.remove('is-busy'); note.textContent = `Готово: ${cards()} записи, 1 дубль, 1 рішення людини.`; again.hidden = false; };
    const play = (instant) => {
      reset();
      const rows = $$('li', xl);
      if (instant) {
        ROWS.forEach((r, i) => { rows[i].classList.add('is-done'); if (!r.dup) addCard(r); });
        stat.textContent = `Перенесено ${ROWS.length} з ${ROWS.length}`; finish(); return;
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
          if (r.dup) { const first = crm.firstElementChild; if (first) first.lastChild.textContent += ' · 2 джерела'; } else addCard(r);
          stat.textContent = `Перенесено ${i + 1} з ${ROWS.length}`;
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
  if (M.press) {
    M.press('.cp-card, .chip, .btn, .fab, .t-act, .rung__btn, .msg__btns button, .op__btn', (node) => {
      M.animate(node, { scale: 0.97 }, { duration: 0.12 });
      return () => M.animate(node, { scale: 1 }, { type: 'spring', stiffness: 520, damping: 30 });
    });
  }
})();
