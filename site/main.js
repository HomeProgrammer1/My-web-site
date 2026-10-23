/* mlohaza.com v2 — interactions, booking sheet and the motion layer (Motion 12, vanilla build). */
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

  /* ---------- sticky action after the hero ---------- */
  const hero = $('#hero');
  const dock = $('#dock');
  if (hero && dock && 'IntersectionObserver' in window) {
    // The button waits out of the way while the visitor reads down, and comes back on a pause or a scroll up.
    let past = false, lastY = window.scrollY, idle;
    const show = (on) => dock.classList.toggle('is-on', past && on);
    new IntersectionObserver(([e]) => { past = !e.isIntersecting; show(past); }, { threshold: 0.05 }).observe(hero);
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 6) { show(y < lastY); lastY = y; }
      clearTimeout(idle); idle = setTimeout(() => show(true), 900);
    }, { passive: true });
  }

  /* ---------- hero: hand the notifications to the agent ---------- */
  const notifs = $$('#notifs .notif');
  const lockH = $('#lockH');
  const total = notifs.reduce((a, n) => a + Number(n.dataset.h), 0);
  let saved = 0;
  const markNext = () => {
    notifs.forEach((n) => n.classList.remove('is-next'));
    const next = notifs.find((n) => !n.classList.contains('is-done'));
    if (next && saved === 0) next.classList.add('is-next');
  };
  const doNote = (n) => {
    if (n.classList.contains('is-done')) return;
    const gate = n.classList.contains('is-gate');
    const h = Number(n.dataset.h);
    n.classList.add('is-done');
    n.setAttribute('aria-disabled', 'true');
    $('.tt', n).textContent = n.dataset.after;
    const tx = $('.tx', n);
    tx.classList.remove('late');
    tx.textContent = gate ? 'Агент підготував · рішення за вами' : 'Агент · зроблено';
    $('.hd span:last-child', n).textContent = `+${h} год`;
    saved += h;
    countTo(lockH, saved, (v) => nf.format(Math.round(v)));
    hero.style.setProperty('--p', String(Math.min(1, saved / total)));
    markNext();
    if (canMove) M.animate(n, { scale: [0.97, 1] }, { duration: 0.35, ease: [0.16, 1, 0.3, 1] });
    if (notifs.every((x) => x.classList.contains('is-done'))) {
      setTimeout(() => {
        $('#notifs').hidden = true; $('#lockAll').hidden = true;
        $('#lockSum').textContent = String(saved);
        const done = $('#lockDone'); done.hidden = false;
        if (canMove) M.animate(done, { opacity: [0, 1], y: [12, 0] }, { duration: 0.45 });
      }, canMove ? 650 : 0);
    }
  };
  notifs.forEach((n) => { n.dataset.orig = n.innerHTML; n.addEventListener('click', () => doNote(n)); });
  markNext();
  const lockAll = $('#lockAll');
  if (lockAll) lockAll.addEventListener('click', () => notifs.forEach((n, i) => setTimeout(() => doNote(n), canMove ? i * 160 : 0)));
  const lockReset = $('#lockReset');
  if (lockReset) lockReset.addEventListener('click', () => {
    notifs.forEach((n) => { n.classList.remove('is-done'); n.removeAttribute('aria-disabled'); n.innerHTML = n.dataset.orig; });
    saved = 0; countTo(lockH, 0, (v) => nf.format(Math.round(v)));
    hero.style.setProperty('--p', '0');
    $('#notifs').hidden = false; $('#lockAll').hidden = false; $('#lockDone').hidden = true;
    markNext(); notifs[0].focus();
  });

  /* ---------- teams band ---------- */
  const segs = $$('#band .seg');
  const openSeg = (s) => segs.forEach((x) => x.setAttribute('aria-expanded', String(x === s)));
  segs.forEach((s) => {
    s.addEventListener('click', () => openSeg(s));
    s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSeg(s); } });
    s.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && window.innerWidth > 1100) openSeg(s); });
  });

  /* ---------- builder ---------- */
  const SEGS = {
    hr: {
      who: 'HR- або рекрутингова агенція', pain: 'Робота з кандидатами',
      trigger: ['Новий відгук на вакансію', 'пошта, Pracuj.pl, OLX Praca'],
      result: ['Одна база кандидатів', 'і одне повідомлення о 8:00'],
      steps: [
        { n: 'Розібрати відгуки', h: 6, gate: true, tool: 'AI читає CV і розкладає в базу', msg: '34 відгуки розкладено, 8 найсильніших чекають вашого рішення.' },
        { n: 'Листи кандидатам', h: 4, tool: 'листи за шаблонами, ви бачите чернетки', msg: 'Кандидатам надіслано 26 відповідей.' },
        { n: 'Запис на співбесіди', h: 3, tool: 'кандидат сам обирає час', msg: '12 кандидатів записалися на співбесіди.' },
        { n: 'Договори з шаблонів', h: 3, tool: 'договір з даних кандидата за хвилину', msg: '2 договори готові до підпису.' },
        { n: 'Звіт клієнту', h: 4, tool: 'звіт збирається з бази', msg: 'Звіт для клієнта надіслано.' },
      ],
    },
    smb: {
      who: 'Компанія 5–200 людей', pain: 'Заявки й клієнти',
      trigger: ['Нова заявка', 'з сайту або пошти'],
      result: ['Нічого не губиться', 'звіт щоранку в Telegram'],
      steps: [
        { n: 'Внести заявку в CRM', h: 4, tool: 'заявка сама потрапляє в CRM', msg: '9 нових заявок у CRM, менеджерів сповіщено.' },
        { n: 'Виставити рахунок', h: 3, tool: 'рахунок формується після замовлення', msg: '5 рахунків виставлено, копії в бухгалтерії.' },
        { n: 'Відповісти на типові питання', h: 5, tool: 'AI готує відповідь, складне передає людині', msg: 'AI відповів на 31 типове питання, 4 складні чекають на менеджера.' },
        { n: 'Зібрати звіт', h: 4, tool: 'звіт оновлюється сам', msg: 'Звіт для власника оновлено.' },
        { n: 'Погодити витрати', h: 2, gate: true, tool: 'агент готує, власник погоджує', msg: '3 витрати чекають вашого погодження.' },
      ],
    },
    jdg: {
      who: 'ФОП / JDG / самозайнятий', pain: 'Рахунки й документи',
      trigger: ['Повідомлення від клієнта', 'Telegram, WhatsApp, пошта'],
      result: ['Усе в одному місці', 'документи готові для бухгалтера'],
      steps: [
        { n: 'Відповісти в месенджерах', h: 4, tool: 'усі звернення в одному місці', msg: '14 звернень зібрано, на 10 відповіді вже надіслано.' },
        { n: 'Записати клієнта', h: 2, tool: 'клієнт сам бронює час', msg: '4 клієнти записалися на цей тиждень.' },
        { n: 'Виставити рахунок', h: 2, tool: 'рахунок іде сам після послуги', msg: '3 рахунки виставлено.' },
        { n: 'Нагадати про оплату', h: 1, tool: 'нагадування йдуть самі', msg: '2 нагадування про оплату надіслано.' },
        { n: 'Документи для бухгалтера', h: 2, gate: true, tool: 'документи складаються в папку, ви перевіряєте', msg: 'Папка для бухгалтера готова, перегляньте перед відправкою.' },
      ],
    },
  };
  const b = { seg: 'hr', on: new Set([0, 1]) };
  const bTasks = $('#bTasks');
  const bNodes = $('#bNodes');
  const renderBuilder = (animateIt) => {
    const S = SEGS[b.seg];
    bTasks.replaceChildren(...S.steps.map((s, i) => {
      const on = b.on.has(i);
      const t = el('button', `task${s.gate ? ' is-gate' : ''}`);
      t.type = 'button';
      t.setAttribute('aria-pressed', String(on));
      t.append(el('span', 'task__h', `${s.h} год`), el('span', 'task__name', s.n),
        el('span', 'task__state', on ? (s.gate ? 'агент готує · рішення за вами' : 'робить агент') : 'вручну'));
      t.addEventListener('click', () => { b.on.has(i) ? b.on.delete(i) : b.on.add(i); renderBuilder(true); });
      return t;
    }));
    const chosen = S.steps.filter((_, i) => b.on.has(i));
    const gateAt = chosen.findIndex((s) => s.gate);
    const node = (cls, title, small) => { const n = el('p', `node ${cls}`, title); n.append(el('small', '', small)); return n; };
    const link = (i) => { const l = el('span', `flow__link${gateAt === -1 || i <= gateAt ? ' is-lit' : ''}`); l.setAttribute('aria-hidden', 'true'); return l; };
    const parts = [node('node--trigger', S.trigger[0], S.trigger[1])];
    chosen.forEach((s, i) => { parts.push(link(i)); parts.push(node(s.gate ? 'node--gate' : '', s.n, s.gate ? 'Human Gate · рішення за вами' : s.tool)); });
    parts.push(link(chosen.length));
    parts.push(node('node--result', S.result[0], S.result[1]));
    bNodes.replaceChildren(...parts);
    if (animateIt && canMove) {
      M.animate($$('.flow__link', bNodes), { scaleY: [0, 1] }, { duration: 0.22, delay: M.stagger(0.09) });
      M.animate($$('.node', bNodes), { opacity: [0.4, 1] }, { duration: 0.25, delay: M.stagger(0.09) });
    }
    const manual = chosen.reduce((a, s) => a + s.h, 0);
    const back = Math.round(chosen.reduce((a, s) => a + s.h * (s.gate ? 0.5 : 0.8), 0) * 2) / 2;
    countTo($('#bBack'), back, (v) => nf1.format(Math.round(v * 2) / 2));
    const gates = chosen.filter((s) => s.gate).length;
    $('#bOf').textContent = chosen.length ? `з ${manual} год ручної роботи${gates ? ` · ${gates} рішення за людьми` : ''}` : '';
    const msg = $('#bMsg');
    msg.replaceChildren(el('b', '', 'Ранковий агент · 8:00 · приклад'));
    msg.append(document.createTextNode(chosen.length ? `Доброго ранку. ${chosen.map((s) => s.msg).join(' ')}` : 'Позначте хоча б один крок ліворуч, і тут з\'явиться ваше ранкове повідомлення.'));
  };
  $$('#bWho .chip').forEach((c) => c.addEventListener('click', () => {
    $$('#bWho .chip').forEach((x) => x.setAttribute('aria-checked', String(x === c)));
    b.seg = c.dataset.seg; b.on = new Set([0, 1]);
    renderBuilder(true);
  }));
  if (bTasks) renderBuilder(false);

  /* ---------- calculator ---------- */
  const PROC = [['Введення даних', 4, true], ['Звіти й зведення', 3, true], ['Заявки та клієнти', 3, false],
    ['Документи й рахунки', 3, false], ['Типове листування', 4, true], ['Робота з кандидатами', 5, true]];
  const proc = PROC.map(([n, h, on]) => {
    const c = el('button', 'chip', `${n} · ${h}`);
    c.type = 'button'; c.dataset.h = h; c.setAttribute('aria-pressed', String(on));
    c.addEventListener('click', () => { c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); calc(); });
    return c;
  });
  const cProc = $('#cProc');
  if (cProc) cProc.replaceChildren(...proc);
  const people = $('#cPeople'), rate = $('#cRate'), share = $('#cShare');
  const last = {};
  const drawChart = (monthBack) => {
    const box = $('#chart'); if (!box) return;
    const NS = 'http://www.w3.org/2000/svg';
    const W = Math.max(280, Math.min(720, box.clientWidth || 640)), H = 220, top = 30, base = 186;
    const bw = Math.min(38, (W - 11 * 6) / 12), gap = (W - 12 * bw) / 11;
    const max = monthBack * 12 || 1;
    const y = (v) => base - (v / max) * (base - top);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const mk = (tag, attrs, text) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); if (text != null) n.textContent = text; svg.append(n); return n; };
    for (let m = 1; m <= 12; m++) {
      const v = monthBack * m, x = (m - 1) * (bw + gap);
      mk('rect', { x, y: y(v), width: bw, height: Math.max(2, base - y(v)), rx: 6, fill: m <= 3 ? 'var(--lilac)' : 'var(--accent)', 'fill-opacity': m <= 3 ? 0.55 : 1 });
      mk('text', { x: x + bw / 2, y: base + 20, 'text-anchor': 'middle' }, m === 1 && W > 420 ? '1 міс.' : String(m));
    }
    const q = monthBack * 3, qx = 3 * (bw + gap) - gap / 2;
    mk('line', { x1: 0, x2: W, y1: y(q), y2: y(q), stroke: 'var(--lilac)', 'stroke-width': 2, 'stroke-dasharray': '5 6' });
    mk('text', { class: 'lab', x: 0, y: y(q) - 10 }, `3 місяці: ${zl(q)}`);
    mk('text', { class: 'lab', x: W, y: 16, 'text-anchor': 'end' }, `12 місяців: ${zl(max)}`);
    box.replaceChildren(svg);
    box.setAttribute('aria-label', `Накопичена економія: ${zl(q)} за 3 місяці, ${zl(max)} за 12 місяців`);
  };
  const calc = () => {
    if (!people) return;
    const hours = proc.filter((c) => c.getAttribute('aria-pressed') === 'true').reduce((a, c) => a + Number(c.dataset.h), 0);
    const p = Number(people.value), r = Number(rate.value), s = Number(share.value) / 100;
    $('#oPeople').textContent = p; $('#oRate').textContent = `${r} zł`; $('#oShare').textContent = `${Math.round(s * 100)}%`;
    const month = p * hours * 4.33 * r;
    Object.assign(last, { hours, p, r, s, year: month * 12, back: month * s });
    countTo($('#rYear'), month * 12, zl);
    countTo($('#rMonth'), month * s, zl);
    $('#rWeek').textContent = `${hours} год із 40`;
    $('#rWeekP').textContent = `рутини на людину щотижня, це ${Math.round((hours / 40) * 100)}% робочого часу`;
    $('#rHours').textContent = `${nf.format(Math.round(p * hours * 4.33 * s))} год`;
    $('#rHoursP').textContent = `звільняється щомісяця на всю команду з ${p} ${p % 10 === 1 && p % 100 !== 11 ? 'людини' : 'людей'}`;
    $('#rPerson').textContent = `${nf1.format(Math.round(hours * s * 10) / 10)} год`;
    $('#payText').innerHTML = '';
    $('#payText').append('За 3 місяці ви заощадите ', el('b', '', zl(month * s * 3)), '. Впровадження, яке коштує менше, окупиться за квартал. За рік економія сягне ', el('b', '', zl(month * s * 12)), '.');
    drawChart(month * s);
  };
  [people, rate, share].forEach((i) => i && i.addEventListener('input', calc));
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => last.back != null && drawChart(last.back), 150); });
  calc();
  const mailForm = $('#mailForm');
  if (mailForm) mailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#mailEmail').value.trim();
    const msg = $('#mailMsg');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg.className = 'mail-msg is-error'; msg.textContent = 'Перевірте email: має бути у форматі name@firma.pl.'; return; }
    msg.className = 'mail-msg';
    msg.textContent = `Дякую. Надішлю розрахунок на ${v}: ${zl(last.year)} на рік, ${zl(last.back)} можна повертати щомісяця, і 3 процеси, з яких я б почав.`;
  });

  /* ---------- Calm Ops: tabs + chaos-to-order diagram ---------- */
  const STEPS = [
    { t: 'Слухаю', p: 'Розмовляю з людьми, які роблять роботу, і з\'ясовую, що вони самі називають рутиною.', get: 'Карту процесів і де губляться години.', time: '2–3 розмови.', z: 'хаос, з якого починаємо' },
    { t: 'Автоматизую', p: 'Будую флоу на n8n, Make, Claude та AI-агентах і підключаю ваші системи. У кожному флоу є Human Gate.', get: 'Робочу автоматизацію на ваших даних, спершу на одному процесі.', time: 'Тестуєте й даєте зворотний зв\'язок.', z: 'рутина стискається в один потік, жовта точка — Human Gate' },
    { t: 'Навчаю', p: 'Показую команді, як цим користуватися, і лишаю документацію.', get: 'Команду, яка вміє і не боїться. Документація й доступи лишаються у вас.', time: 'Одна-дві сесії.', z: 'команда підхоплює новий порядок' },
    { t: 'Міряю', p: 'Рахую повернені години й те, скільки людей справді користуються, потім беремо наступний процес.', get: 'Цифри результату й план наступного кроку.', time: '15 хвилин на звіт.', z: 'порядок, який можна виміряти' },
  ];
  const diag = $('#opsDiagram');
  let rects = [], gateRect = null, activeZ = 0;
  const highlight = (z) => rects.forEach((r) => { r.style.transition = 'opacity .35s'; r.style.opacity = Number(r.dataset.z) === z ? '1' : '.22'; });
  if (diag) {
    const NS = 'http://www.w3.org/2000/svg';
    const L = 1200, A = 267, S = 12;
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const pts = [];
    for (let i = 0; i < 40; i++) pts.push({ z: 0, f: 8 + rnd() * 270, c: 12 + rnd() * (A - 36), fill: i % 2 ? '#B9C2CC' : '#CDD4DB' });
    for (let k = 0; k < 14; k++) for (let r = 0; r < 3; r++) pts.push({ z: 1, f: 312 + k * 19, c: A / 2 - 22 + r * 16, fill: '#5E6B77' });
    for (let k = 0; k < 8; k++) for (let r = 0; r < 5; r++) pts.push({ z: 2, f: 612 + k * 30, c: A / 2 - 6 + (r - 2) * (16 + k * 5), fill: 'var(--lilac)' });
    for (let k = 0; k < 8; k++) for (let r = 0; r < 6; r++) pts.push({ z: 3, f: 906 + k * 36, c: 28 + r * 40, fill: 'var(--accent)' });
    const draw = (vertical) => {
      const svg = document.createElementNS(NS, 'svg');
      const sf = vertical ? 0.62 : 1, sc = vertical ? 1.2 : 1;
      svg.setAttribute('viewBox', vertical ? `0 0 ${A * sc} ${L * sf}` : `0 0 ${L} ${A}`);
      const at = (f, c) => (vertical ? [c * sc, f * sf] : [f, c]);
      rects = pts.map((p) => {
        const r = document.createElementNS(NS, 'rect');
        const [x, y] = at(p.f, p.c);
        r.setAttribute('x', x.toFixed(1)); r.setAttribute('y', y.toFixed(1)); r.setAttribute('width', S); r.setAttribute('height', S); r.setAttribute('rx', 3);
        r.setAttribute('fill', p.fill); r.dataset.z = p.z; svg.append(r); return r;
      });
      gateRect = document.createElementNS(NS, 'rect');
      const [gx, gy] = at(578, A / 2 - 12);
      gateRect.setAttribute('x', gx); gateRect.setAttribute('y', gy); gateRect.setAttribute('width', 24); gateRect.setAttribute('height', 24); gateRect.setAttribute('rx', 6);
      gateRect.setAttribute('fill', 'var(--gate)'); gateRect.dataset.z = 1;
      svg.append(gateRect); rects.push(gateRect);
      diag.replaceChildren(svg);
      highlight(activeZ);
    };
    const mq = window.matchMedia('(max-width: 760px)');
    draw(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', (e) => draw(e.matches));
    if (canMove) M.inView(diag, () => { M.animate(rects, mq.matches ? { y: [-30, 0] } : { x: [-50, 0] }, { duration: 0.8, delay: M.stagger(0.005), ease: [0.16, 1, 0.3, 1] }); }, { amount: 0.3 });
  }
  const tabs = $$('#opsTabs .tab');
  const selectTab = (t, focus) => {
    const i = Number(t.dataset.step); const s = STEPS[i];
    tabs.forEach((x) => { x.setAttribute('aria-selected', String(x === t)); x.tabIndex = x === t ? 0 : -1; });
    const panel = $('#opsPanel');
    panel.replaceChildren(el('h3', '', s.t), el('p', '', s.p));
    const dl = el('dl'); dl.append(el('dt', '', 'Ви отримуєте'), el('dd', '', s.get), el('dt', '', 'Ваш час'), el('dd', '', s.time)); panel.append(dl);
    $('#opsStep').textContent = `Крок ${i + 1} з 4: ${s.z}`;
    activeZ = i; highlight(i);
    if (canMove) M.animate(panel, { opacity: [0.3, 1], y: [8, 0] }, { duration: 0.3 });
    if (focus) t.focus();
  };
  tabs.forEach((t, i) => {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      selectTab(tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length], true);
    });
  });

  /* ---------- 8:00: the visitor is the Human Gate ---------- */
  const tgList = $('#tgList');
  const tgCount = $('#tgCount');
  $$('.msg[data-q] button', tgList).forEach((btn) => btn.addEventListener('click', () => {
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
  const fWho = $('#fWho'), fPain = $('#fPain'), fDays = $('#fDays'), fTimes = $('#fTimes');
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
  let opener = null;
  const openSheet = (from) => {
    if (!sheet || typeof sheet.showModal !== 'function') return false;
    opener = from;
    if (from && from.dataset.prefill === 'builder') {
      const S = SEGS[b.seg]; setPick(fWho, S.who); setPick(fPain, S.pain);
      const chosen = S.steps.filter((_, i) => b.on.has(i)).map((s) => s.n + (s.gate ? ' (рішення за людиною)' : ''));
      if (chosen.length) $('#fWhat').value = `Схема з сайту: ${S.trigger[0]} → ${chosen.join(' → ')}.`;
    }
    if (from && from.dataset.prefill === 'calc' && last.year != null) {
      $('#fWhat').value = `Мої цифри з калькулятора: ${last.p} людей, ${last.hours} год/тиждень рутини, ${zl(last.year)} на рік.`;
    }
    sheet.showModal();
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
      $('#fWhat').value.trim() && `Що автоматизувати: ${$('#fWhat').value.trim()}`,
    ].filter(Boolean);
    const text = lines.join('\n');
    $('#confirmText').textContent = text;
    $('#mailLink').href = `mailto:kontakt@mlohaza.com?subject=${encodeURIComponent('Консультація 30 хв')}&body=${encodeURIComponent(text)}`;
    form.hidden = true; confirmBox.hidden = false; confirmBox.focus();
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

  /* ---------- motion layer ---------- */
  if (!canMove) return;
  const ease = [0.16, 1, 0.3, 1];
  M.animate($$('.hero h1 .line > span'), { y: ['105%', '0%'] }, { duration: 0.75, ease, delay: M.stagger(0.1) });
  M.animate($$('.hero__copy > :not(h1)'), { opacity: [0, 1], y: [16, 0] }, { duration: 0.6, ease, delay: M.stagger(0.08, { startDelay: 0.3 }) });
  M.animate('.hero__stage', { opacity: [0, 1], y: [40, 0], scale: [0.97, 1] }, { duration: 0.9, ease, delay: 0.25 });
  M.animate($$('#notifs .notif'), { opacity: [0, 1], y: [14, 0] }, { duration: 0.45, ease, delay: M.stagger(0.07, { startDelay: 0.6 }) });
  requestAnimationFrame(() => root.classList.remove('motion'));
  const heroImg = $('.hero__photo img');
  if (heroImg && M.scroll) M.scroll(M.animate(heroImg, { scale: [1.04, 1.12], y: [0, 40] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });

  $$('main > section').forEach((sec) => {
    if (sec === hero) return;
    const parts = $$('[data-rise]', sec);
    if (!parts.length) return;
    M.inView(sec, () => { M.animate(parts, { opacity: [0.35, 1], y: [24, 0] }, { duration: 0.7, ease, delay: M.stagger(0.07) }); }, { amount: 0.05 });
  });
  if (M.press) {
    M.press('[data-press], .chip, .task, .notif, .msg__btns button, .seg, .tab', (node) => {
      M.animate(node, { scale: 0.97 }, { duration: 0.12 });
      return () => M.animate(node, { scale: 1 }, { type: 'spring', stiffness: 520, damping: 30 });
    });
  }
})();
