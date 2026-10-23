/* mlohaza.com — interactions and the motion layer (Motion 12, vanilla build). */
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

  /* Count a number up or down in place. */
  const countTo = (node, to, format) => {
    const from = Number(node.dataset.v || 0);
    node.dataset.v = String(to);
    if (!canMove || from === to) { node.textContent = format(to); return; }
    M.animate(from, to, { duration: 0.45, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => { node.textContent = format(v); } });
  };

  /* ---------- sticky bar + the Monday clock ---------- */
  const bar = $('#bar');
  const hero = $('.hero');
  if (bar && hero && 'IntersectionObserver' in window) {
    // The bar returns when the reader scrolls back up, and stays out of the way while reading down.
    let pastHero = false, lastY = window.scrollY;
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; if (!pastHero) bar.classList.remove('is-on'); }, { threshold: 0.02 }).observe(hero);
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < 6) return;
      bar.classList.toggle('is-on', pastHero && y < lastY);
      lastY = y;
    }, { passive: true });
    bar.addEventListener('focusin', () => bar.classList.add('is-on'));
    const clock = $('#clock');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting && clock) clock.textContent = e.target.dataset.time; });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('[data-time]').forEach((s) => io.observe(s));
  }

  /* ---------- 9:14: hand notifications to the agent ---------- */
  const notes = $$('#notes .note');
  const lockHours = $('#lockHours');
  let returned = 0;
  const finishLock = () => {
    if (notes.every((n) => n.classList.contains('is-done'))) {
      $('#lockFoot').hidden = true;
      const fin = $('#lockFinal');
      fin.hidden = false;
      if (canMove) M.animate(fin, { opacity: [0, 1], y: [12, 0] }, { duration: 0.5 });
    }
  };
  const doNote = (n) => {
    if (n.classList.contains('is-done')) return;
    const gate = n.classList.contains('is-gate');
    const h = Number(n.dataset.h);
    n.classList.add('is-done');
    n.setAttribute('aria-disabled', 'true');
    $('.note__app', n).textContent = `Агент · ${$('.note__app', n).textContent}`;
    $('.note__title', n).textContent = n.dataset.after;
    $('.note__text', n).textContent = gate ? 'Рішення за вами' : 'Зроблено без вас';
    $('.note__hours', n).textContent = `+${h} год`;
    returned += h;
    countTo(lockHours, returned, (v) => nf.format(Math.round(v)));
    if (canMove) M.animate(n, { x: [10, 0] }, { duration: 0.35, ease: [0.16, 1, 0.3, 1] });
    finishLock();
  };
  notes.forEach((n) => {
    n.dataset.orig = n.innerHTML;
    n.addEventListener('click', () => doNote(n));
  });
  const lockAll = $('#lockAll');
  if (lockAll) lockAll.addEventListener('click', () => notes.forEach((n, i) => setTimeout(() => doNote(n), canMove ? i * 140 : 0)));
  const lockReset = $('#lockReset');
  if (lockReset) lockReset.addEventListener('click', () => {
    notes.forEach((n) => { n.classList.remove('is-done'); n.removeAttribute('aria-disabled'); n.innerHTML = n.dataset.orig; });
    returned = 0; countTo(lockHours, 0, (v) => nf.format(Math.round(v)));
    $('#lockFinal').hidden = true; $('#lockFoot').hidden = false;
    notes[0].focus();
  });

  /* ---------- segments band ---------- */
  const segs = $$('#band .seg');
  const openSeg = (s) => segs.forEach((x) => x.setAttribute('aria-expanded', String(x === s)));
  segs.forEach((s) => {
    s.addEventListener('click', () => openSeg(s));
    s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSeg(s); } });
    s.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') openSeg(s); });
  });

  /* ---------- builder: your first automation ---------- */
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
  const renderBuilder = (animateNodes) => {
    const S = SEGS[b.seg];
    bTasks.replaceChildren(...S.steps.map((s, i) => {
      const on = b.on.has(i);
      const t = el('button', `task${s.gate ? ' is-gate' : ''}`);
      t.type = 'button';
      t.setAttribute('aria-pressed', String(on));
      t.append(el('span', 'task__h', `${s.h} год`), el('span', 'task__name', s.n),
        el('span', 'task__state', on ? (s.gate ? 'агент готує · рішення за вами' : 'агент') : 'вручну'));
      t.addEventListener('click', () => { b.on.has(i) ? b.on.delete(i) : b.on.add(i); renderBuilder(true); });
      return t;
    }));
    const chosen = S.steps.filter((_, i) => b.on.has(i));
    const node = (cls, title, small) => { const n = el('p', `node ${cls}`, title); n.append(el('small', '', small)); return n; };
    const parts = [node('node--trigger', S.trigger[0], S.trigger[1])];
    chosen.forEach((s) => {
      parts.push(el('span', 'arrow'));
      parts.push(node(s.gate ? 'node--gate' : '', s.n, s.gate ? 'Human Gate · рішення за вами' : s.tool));
    });
    parts.push(el('span', 'arrow'));
    parts.push(node('node--result', S.result[0], S.result[1]));
    bNodes.replaceChildren(...parts);
    if (animateNodes && canMove) M.animate($$('.node', bNodes), { opacity: [0.4, 1], scale: [0.97, 1] }, { duration: 0.3, delay: M.stagger(0.03) });
    const manual = chosen.reduce((a, s) => a + s.h, 0);
    const back = chosen.reduce((a, s) => a + s.h * (s.gate ? 0.5 : 0.8), 0);
    countTo($('#bManual'), manual, (v) => nf.format(Math.round(v)));
    countTo($('#bBack'), Math.round(back * 2) / 2, (v) => nf1.format(Math.round(v * 2) / 2));
    countTo($('#bGates'), chosen.filter((s) => s.gate).length, (v) => nf.format(Math.round(v)));
    const msg = $('#bMsg');
    msg.replaceChildren(el('b', '', 'Ранковий агент · 8:00 · приклад'));
    msg.append(document.createTextNode(chosen.length ? `Доброго ранку. ${chosen.map((s) => s.msg).join(' ')}` : 'Позначте хоча б один крок вище, і тут з\'явиться ваше ранкове повідомлення.'));
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
  const cProc = $('#cProc');
  const proc = PROC.map(([n, h, on]) => {
    const c = el('button', 'chip', `${n} · ${h}`);
    c.type = 'button'; c.dataset.h = h; c.setAttribute('aria-pressed', String(on));
    c.addEventListener('click', () => { c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); calc(); });
    return c;
  });
  if (cProc) cProc.replaceChildren(...proc);
  const people = $('#cPeople'), rate = $('#cRate'), share = $('#cShare');
  const last = {};
  const drawChart = (monthBack) => {
    const box = $('#chart'); if (!box) return;
    const W = 720, H = 210, top = 34, base = 180, bw = 40, gap = (W - 12 * bw) / 11;
    const max = monthBack * 12 || 1;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    for (let m = 1; m <= 12; m++) {
      const v = monthBack * m, h = Math.max(2, (v / max) * (base - top));
      const x = (m - 1) * (bw + gap);
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', x); r.setAttribute('y', base - h); r.setAttribute('width', bw); r.setAttribute('height', h);
      r.setAttribute('fill', m === 12 ? 'var(--cobalt)' : 'var(--surface-2)');
      svg.append(r);
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', x + bw / 2); t.setAttribute('y', base + 20); t.setAttribute('text-anchor', 'middle');
      t.textContent = m === 1 ? '1 міс.' : String(m);
      svg.append(t);
    }
    const lab = document.createElementNS(NS, 'text');
    lab.setAttribute('class', 'lab'); lab.setAttribute('x', W); lab.setAttribute('y', 22); lab.setAttribute('text-anchor', 'end');
    lab.textContent = `${zl(max)} за 12 місяців`;
    svg.append(lab);
    box.replaceChildren(svg);
    box.setAttribute('aria-label', `Накопичена економія за 12 місяців: ${zl(max)}`);
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
    $('#rShareWeek').textContent = `${hours} год із 40`;
    $('#rShareWeekP').textContent = `${Math.round((hours / 40) * 100)}% тижня кожної людини йде на рутину`;
    $('#rHoursMonth').textContent = `${nf.format(Math.round(p * hours * 4.33 * s))} год`;
    $('#rPerPerson').textContent = `${nf1.format(Math.round(hours * s * 10) / 10)} год`;
    drawChart(month * s);
  };
  [people, rate, share].forEach((i) => i && i.addEventListener('input', calc));
  calc();

  const mailForm = $('#mailForm');
  if (mailForm) mailForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#mailEmail').value.trim();
    const msg = $('#mailMsg');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      msg.className = 'mail-msg is-error';
      msg.textContent = 'Перевірте email: має бути у форматі name@firma.pl.';
      return;
    }
    msg.className = 'mail-msg';
    msg.textContent = `Дякую. Надішлю розрахунок на ${v}: ${zl(last.year)} на рік, ${zl(last.back)} можна повертати щомісяця, і 3 процеси, з яких я б почав.`;
  });

  /* ---------- position: belief inks in as you read ---------- */
  const belief = $('#belief');
  if (belief && canMove && M.scroll) {
    const words = belief.textContent.trim().split(/\s+/);
    belief.replaceChildren(...words.flatMap((w, i) => { const s = el('span', 'w', w); return i ? [document.createTextNode(' '), s] : [s]; }));
    const spans = $$('.w', belief);
    M.scroll((p) => {
      const k = p * (spans.length + 6);
      spans.forEach((s, i) => s.style.setProperty('--o', String(Math.min(1, Math.max(0.28, k - i)))));
    }, { target: belief, offset: ['start 92%', 'end 45%'] });
  }

  /* ---------- Calm Ops: many into one ---------- */
  const diag = $('#opsDiagram');
  if (diag) {
    const NS = 'http://www.w3.org/2000/svg';
    const W = 1200, H = 267, S = 12;
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const pts = [];
    for (let i = 0; i < 40; i++) pts.push({ z: 0, x: 8 + rnd() * 270, y: 12 + rnd() * (H - 36), f: i % 2 ? 'var(--surface-2)' : 'var(--surface)' });
    for (let c = 0; c < 14; c++) for (let r = 0; r < 3; r++) pts.push({ z: 1, x: 312 + c * 19, y: H / 2 - 22 + r * 16, f: 'var(--muted)' });
    for (let c = 0; c < 8; c++) for (let r = 0; r < 5; r++) {
      const spread = 16 + c * 5;
      pts.push({ z: 2, x: 612 + c * 30, y: H / 2 - 6 + (r - 2) * spread, f: 'var(--cobalt)' });
    }
    for (let c = 0; c < 8; c++) for (let r = 0; r < 6; r++) pts.push({ z: 3, x: 906 + c * 36, y: 28 + r * 40, f: 'var(--cobalt)' });
    const rects = pts.map((p) => {
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', p.x.toFixed(1)); r.setAttribute('y', p.y.toFixed(1)); r.setAttribute('width', S); r.setAttribute('height', S);
      r.setAttribute('fill', p.f); r.dataset.z = p.z;
      svg.append(r); return r;
    });
    const gate = document.createElementNS(NS, 'rect');
    gate.setAttribute('x', 578); gate.setAttribute('y', H / 2 - 12); gate.setAttribute('width', 24); gate.setAttribute('height', 24);
    gate.setAttribute('fill', 'var(--accent)'); gate.dataset.z = 1;
    svg.append(gate); rects.push(gate);
    diag.append(svg);
    if (canMove) {
      M.inView(diag, () => {
        M.animate(rects.slice(0, -1), { opacity: [0.15, 1], x: [-60, 0] }, { duration: 0.8, delay: M.stagger(0.006), ease: [0.16, 1, 0.3, 1] });
        M.animate(gate, { scale: [1, 1.5, 1] }, { duration: 0.7, delay: 1.1 });
      }, { amount: 0.4 });
    }
    const steps = $$('#opsSteps .ops-step');
    steps.forEach((s) => s.addEventListener('click', () => {
      const on = s.getAttribute('aria-pressed') !== 'true';
      steps.forEach((x) => x.setAttribute('aria-pressed', String(on && x === s)));
      const z = Number(s.dataset.step);
      rects.forEach((r) => { r.style.transition = 'opacity .35s'; r.style.opacity = !on || Number(r.dataset.z) === z ? '1' : '.18'; });
    }));
  }

  /* ---------- 8:00: the visitor is the Human Gate ---------- */
  const tgList = $('#tgList');
  const tgCount = $('#tgCount');
  const updateCount = () => {
    const left = $$('.msg[data-q]', tgList).filter((m) => !m.dataset.done).length;
    tgCount.textContent = left === 2 ? 'Два рішення чекають на вас.' : left === 1 ? 'Залишилося одне рішення.' : 'Два рішення за дві хвилини. Решту зробили агенти.';
  };
  $$('.msg[data-q] button', tgList).forEach((btn) => btn.addEventListener('click', () => {
    const m = btn.closest('.msg');
    if (m.dataset.done) return;
    m.dataset.done = '1';
    $$('button', m).forEach((x) => { x.disabled = true; });
    const now = m.querySelector('time').textContent;
    const mine = el('p', 'msg msg--me', btn.textContent); mine.append(el('time', '', now));
    const reply = el('p', 'msg', btn.dataset.reply); reply.append(el('time', '', now));
    m.after(mine);
    mine.after(reply);
    if (canMove) {
      M.animate(mine, { opacity: [0, 1], y: [8, 0] }, { duration: 0.3 });
      M.animate(reply, { opacity: [0, 1], y: [8, 0] }, { duration: 0.35, delay: 0.35 });
    }
    updateCount();
  }));

  /* ---------- booking ---------- */
  const radio = (group) => $$('.chip', group).forEach((c) => c.addEventListener('click', () => {
    $$('.chip', group).forEach((x) => x.setAttribute('aria-checked', String(x === c)));
  }));
  const fWho = $('#fWho'), fPain = $('#fPain'), fDays = $('#fDays'), fTimes = $('#fTimes');
  [fWho, fPain].forEach((g) => g && radio(g));
  if (fDays && fTimes) {
    const wd = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
    const d = new Date(); d.setHours(12, 0, 0, 0);
    const days = [];
    while (days.length < 8) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) days.push(new Date(d));
    }
    fDays.replaceChildren(...days.map((x) => {
      const c = el('button', 'chip day'); c.type = 'button'; c.setAttribute('role', 'radio'); c.setAttribute('aria-checked', 'false');
      const label = `${wd[x.getDay()]} ${String(x.getDate()).padStart(2, '0')}.${String(x.getMonth() + 1).padStart(2, '0')}`;
      c.dataset.v = label; c.append(el('b', '', wd[x.getDay()]), document.createTextNode(label.slice(3)));
      return c;
    }));
    fTimes.replaceChildren(...['9:00', '11:00', '14:00', '16:30'].map((t) => {
      const c = el('button', 'chip', t); c.type = 'button'; c.setAttribute('role', 'radio'); c.setAttribute('aria-checked', 'false'); c.dataset.v = t;
      return c;
    }));
    radio(fDays); radio(fTimes);
  }
  const pick = (g) => { const c = g && $('.chip[aria-checked="true"]', g); return c ? c.dataset.v : ''; };
  const setPick = (g, v) => g && $$('.chip', g).forEach((x) => x.setAttribute('aria-checked', String(x.dataset.v === v)));

  const bCta = $('#bCta');
  if (bCta) bCta.addEventListener('click', () => {
    const S = SEGS[b.seg];
    setPick(fWho, S.who); setPick(fPain, S.pain);
    const chosen = S.steps.filter((_, i) => b.on.has(i)).map((s) => s.n + (s.gate ? ' (рішення за людиною)' : ''));
    const what = $('#fWhat');
    if (what && chosen.length) what.value = `Схема з сайту: ${S.trigger[0]} → ${chosen.join(' → ')}.`;
  });

  const form = $('#bookForm'), confirmBox = $('#confirm');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#fEmail').value.trim();
    const err = $('#fError');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      err.hidden = false; err.textContent = 'Вкажіть email у форматі name@firma.pl, щоб я міг підтвердити час.';
      $('#fEmail').focus(); return;
    }
    err.hidden = true;
    const when = [pick(fDays), pick(fTimes)].filter(Boolean).join(', ');
    const lines = [
      'Заявка на консультацію (30 хв, 190 zł)',
      `Хто: ${pick(fWho) || 'не вказано'}`,
      `Болить: ${pick(fPain) || 'не вказано'}`,
      `Коли: ${when ? `${when} (Варшава)` : 'узгодимо в листі'}`,
      `Email: ${email}`,
      $('#fName').value.trim() && `Ім'я: ${$('#fName').value.trim()}`,
      $('#fCompany').value.trim() && `Компанія: ${$('#fCompany').value.trim()}`,
      $('#fWhat').value.trim() && `Що автоматизувати: ${$('#fWhat').value.trim()}`,
    ].filter(Boolean);
    const text = lines.join('\n');
    $('#confirmText').textContent = text;
    $('#mailLink').href = `mailto:kontakt@mlohaza.com?subject=${encodeURIComponent('Консультація 30 хв')}&body=${encodeURIComponent(text)}`;
    form.hidden = true; confirmBox.hidden = false; confirmBox.focus();
    if (canMove) M.animate(confirmBox, { opacity: [0, 1], y: [12, 0] }, { duration: 0.4 });
  });
  const copyBtn = $('#copyBtn');
  if (copyBtn) copyBtn.addEventListener('click', () => {
    const text = $('#confirmText').textContent;
    const msg = $('#copyMsg');
    const fallback = () => {
      const r = document.createRange(); r.selectNodeContents($('#confirmText'));
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      msg.textContent = 'Текст виділено, скопіюйте його клавішами Ctrl+C або через меню.';
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => { msg.textContent = 'Скопійовано. Вставте в лист на kontakt@mlohaza.com.'; }, fallback);
    } else fallback();
  });
  const editBtn = $('#editBtn');
  if (editBtn) editBtn.addEventListener('click', () => { confirmBox.hidden = true; form.hidden = false; $('#fEmail').focus(); });

  /* ---------- motion layer ---------- */
  if (!canMove) return;
  const ease = [0.16, 1, 0.3, 1];

  // Signature: the headline rises line by line from behind its own baseline.
  const lines = $$('.hero h1 .line > span');
  M.animate(lines, { y: ['105%', '0%'] }, { duration: 0.75, ease, delay: M.stagger(0.09) });
  M.animate('[data-hero-talk], .hero__media', { opacity: [0, 1], y: [16, 0] }, { duration: 0.6, ease, delay: M.stagger(0.08, { startDelay: 0.35 }) });
  requestAnimationFrame(() => root.classList.remove('motion'));

  // The portrait drifts as the hero scrolls away.
  const heroPhoto = $('#heroPhoto');
  if (heroPhoto && M.scroll) M.scroll(M.animate(heroPhoto, { scale: [1.06, 1], y: [0, -36] }, { ease: 'linear' }), { target: hero, offset: ['start start', 'end start'] });
  const posPhoto = $('#posPhoto');
  if (posPhoto && M.scroll) M.scroll(M.animate(posPhoto, { y: [40, -40] }, { ease: 'linear' }), { target: posPhoto, offset: ['start end', 'end start'] });

  // Each section's parts rise in order as it arrives; nothing is hidden at rest.
  $$('main > section, footer').forEach((sec) => {
    if (sec.classList.contains('hero')) return;
    const parts = $$('[data-rise]', sec);
    if (!parts.length) return;
    M.inView(sec, () => {
      M.animate(parts, { opacity: [0.35, 1], y: [24, 0] }, { duration: 0.7, ease, delay: M.stagger(0.075) });
    }, { amount: 0.05 });
  });

  // Press feedback on every control.
  if (M.press) {
    M.press('[data-press], .chip, .task, .note, .msg__btns button, .seg, .ops-step', (node) => {
      M.animate(node, { scale: 0.97 }, { duration: 0.12 });
      return () => M.animate(node, { scale: 1 }, { type: 'spring', stiffness: 520, damping: 30 });
    });
  }
})();
