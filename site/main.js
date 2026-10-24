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

  /* ---------- the desk: the visitor marks what is true for them ---------- */
  const slips = $$('#slips .slip');
  const sumH = $('#sumH'), sumText = $('#sumText');
  const marked = () => slips.filter((s) => s.getAttribute('aria-pressed') === 'true');
  const updateDesk = () => {
    const on = marked();
    const h = Math.round(on.reduce((a, s) => a + Number(s.dataset.h), 0) * 0.7);
    countTo(sumH, h, (v) => nf.format(Math.round(v)));
    if (!on.length) sumText.textContent = 'на тиждень можна віддати агентам. Поки нічого не позначено.';
    else sumText.textContent = `на тиждень можна віддати агентам. Позначено ${on.length} з ${slips.length}, рахую 70% від цих годин.`;
  };
  slips.forEach((s) => s.addEventListener('click', () => {
    s.setAttribute('aria-pressed', String(s.getAttribute('aria-pressed') !== 'true'));
    updateDesk();
  }));

  /* ---------- your kind of work: the builder ---------- */
  const SEGS = {
    hr: {
      who: 'HR- або рекрутингова агенція', pain: 'Робота з кандидатами',
      trigger: ['Новий відгук на вакансію', 'пошта, Pracuj.pl, OLX Praca'],
      result: ['Одна база кандидатів', 'і одне повідомлення о 8:00'],
      steps: [
        { n: 'Розібрати відгуки', h: 6, gate: true, tool: 'AI читає CV і розкладає їх у базу', msg: '34 відгуки розкладено, 8 найсильніших чекають вашого рішення.' },
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
  // How each loose sheet lies on the desk until it is handed to the agent.
  const LIE = [[-1.4, -3], [1.1, 6], [-0.7, -2], [1.6, 4], [-1.1, -5]];
  const b = { seg: 'hr', on: new Set([0, 1]) };
  const bTasks = $('#bTasks'), bNodes = $('#bNodes');
  const stateText = (s, on) => (on ? (s.gate ? 'агент готує, вирішуєте ви' : 'робить агент') : 'вручну');
  const renderFlow = (animateIt) => {
    const S = SEGS[b.seg];
    const chosen = S.steps.filter((_, i) => b.on.has(i));
    const node = (cls, title, small) => { const n = el('li', cls, title); n.append(el('small', '', small)); return n; };
    const bar = () => { const x = el('li', 'bar'); x.setAttribute('aria-hidden', 'true'); return x; };
    const parts = [node('', S.trigger[0], S.trigger[1])];
    chosen.forEach((s) => { parts.push(bar(), node(s.gate ? 'is-gate' : '', s.n, s.gate ? 'Human Gate: агент готує, вирішуєте ви' : s.tool)); });
    parts.push(bar(), node('is-end', S.result[0], S.result[1]));
    bNodes.replaceChildren(...parts);
    if (animateIt && canMove) M.animate($$('li:not(.bar)', bNodes), { opacity: [0.4, 1] }, { duration: 0.25, delay: M.stagger(0.06) });
    const manual = S.steps.reduce((a, s) => a + s.h, 0);
    const back = chosen.reduce((a, s) => a + s.h * (s.gate ? 0.5 : 0.8), 0);
    countTo($('#bBack'), Math.round(back * 2) / 2, half);
    const gates = chosen.filter((s) => s.gate).length;
    $('#bOf').textContent = `на тиждень зекономлено з ${manual} год ручної роботи${gates ? `, ${gates === 1 ? 'одне рішення лишається' : `${gates} рішення лишаються`} за вами` : ''}`;
    const msg = $('#bMsg');
    msg.replaceChildren(el('b', '', 'Повідомлення агента о 8:00, приклад'));
    msg.append(document.createTextNode(chosen.length ? `Доброго ранку. ${chosen.map((s) => s.msg).join(' ')}` : 'Позначте хоча б один крок, і тут з\'явиться ваше ранкове повідомлення.'));
  };
  const renderTasks = () => {
    const S = SEGS[b.seg];
    bTasks.replaceChildren(...S.steps.map((s, i) => {
      const on = b.on.has(i);
      const t = el('button', `task askew${s.gate ? ' is-gate' : ''}`);
      t.type = 'button';
      t.style.setProperty('--r', `${LIE[i][0]}deg`);
      t.style.setProperty('--dx', `${LIE[i][1]}px`);
      t.setAttribute('aria-pressed', String(on));
      const st = el('span', 'task__state', stateText(s, on));
      t.append(el('span', 'task__name', s.n), el('span', 'task__h', `${s.h} год`), st);
      t.addEventListener('click', () => {
        const now = !b.on.has(i);
        if (now) b.on.add(i); else b.on.delete(i);
        t.setAttribute('aria-pressed', String(now));
        st.textContent = stateText(s, now);
        renderFlow(true);
      });
      return t;
    }));
  };
  const segs = $$('#bWho .seg');
  segs.forEach((c) => c.addEventListener('click', () => {
    if (c.getAttribute('aria-checked') === 'true') return;
    segs.forEach((x) => { x.setAttribute('aria-checked', String(x === c)); x.tabIndex = x === c ? 0 : -1; });
    b.seg = c.dataset.seg; b.on = new Set([0, 1]);
    renderTasks(); renderFlow(true);
    if (canMove) M.animate($$('.task', bTasks), { opacity: [0, 1], y: [-16, 0] }, { duration: 0.4, delay: M.stagger(0.05) });
  }));
  segs.forEach((c, i) => {
    c.tabIndex = c.getAttribute('aria-checked') === 'true' ? 0 : -1;
    c.addEventListener('keydown', (e) => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
      e.preventDefault();
      const next = segs[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : segs.length - 1)) % segs.length];
      next.focus(); next.click();
    });
  });
  if (bTasks) { renderTasks(); renderFlow(false); }

  /* ---------- calculator ---------- */
  const PROC = [['Введення даних', 4, true], ['Звіти й зведення', 3, true], ['Заявки та клієнти', 3, false],
    ['Документи й рахунки', 3, false], ['Типове листування', 4, true], ['Робота з кандидатами', 5, true]];
  const cProc = $('#cProc');
  const proc = cProc ? PROC.map(([n, h, on]) => {
    const c = el('button', 'chip', `${n}, ${h} год`);
    c.type = 'button'; c.dataset.h = h; c.setAttribute('aria-pressed', String(on));
    c.addEventListener('click', () => { c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); calc(); });
    return c;
  }) : [];
  if (cProc) cProc.replaceChildren(...proc);
  const cPeople = $('#cPeople'), cRate = $('#cRate'), cShare = $('#cShare');
  const last = {};
  const drawChart = (monthBack) => {
    const box = $('#chart'); if (!box) return;
    const NS = 'http://www.w3.org/2000/svg';
    const W = Math.max(280, Math.min(820, box.clientWidth || 640)), H = 236, top = W > 460 ? 40 : 58, base = 204;
    const bw = Math.min(44, (W - 11 * 6) / 12), gap = (W - 12 * bw) / 11;
    const max = monthBack * 12 || 1;
    const y = (v) => base - (v / max) * (base - top);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const mk = (tag, attrs, text) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); if (text != null) n.textContent = text; svg.append(n); return n; };
    for (let m = 1; m <= 12; m++) {
      const v = monthBack * m, x = (m - 1) * (bw + gap);
      mk('rect', { x, y: y(v), width: bw, height: Math.max(2, base - y(v)), fill: m <= 3 ? '#9DB0E6' : '#1C3FAE' });
      mk('text', { x: x + bw / 2, y: base + 22, 'text-anchor': 'middle' }, m === 1 && W > 420 ? '1 міс.' : String(m));
    }
    const q = monthBack * 3;
    mk('rect', { x: 0, y: y(q) - 1.5, width: W, height: 3, fill: '#0F1629' });
    mk('rect', { x: 0, y: 9, width: 18, height: 4, fill: '#0F1629' });
    mk('text', { class: 'lab', x: 26, y: 16 }, `3 місяці: ${zl(q)}`);
    if (W > 460) mk('text', { class: 'lab', x: W, y: 16, 'text-anchor': 'end' }, `12 місяців: ${zl(max)}`);
    else mk('text', { class: 'lab', x: 26, y: 36 }, `12 місяців: ${zl(max)}`);
    box.replaceChildren(svg);
    box.setAttribute('aria-label', `Накопичена економія: ${zl(q)} за 3 місяці, ${zl(max)} за 12 місяців`);
  };
  const calc = () => {
    if (!cPeople) return;
    const hours = proc.filter((c) => c.getAttribute('aria-pressed') === 'true').reduce((a, c) => a + Number(c.dataset.h), 0);
    const p = Number(cPeople.value), r = Number(cRate.value), s = Number(cShare.value) / 100;
    $('#oPeople').textContent = p; $('#oRate').textContent = `${r} zł`; $('#oShare').textContent = `${Math.round(s * 100)}%`;
    const month = p * hours * 4.33 * r;
    Object.assign(last, { hours, p, r, s, year: month * 12, back: month * s });
    countTo($('#rYear'), month * 12, zl);
    countTo($('#rMonth'), month * s, zl);
    $('#rWeek').textContent = `кожна людина віддає рутині ${hours} год із 40 щотижня, це ${Math.round((hours / 40) * 100)}% робочого часу`;
    countTo($('#rPerson'), Math.round(hours * s * 2) / 2, half);
    countTo($('#rHours'), Math.round(p * hours * 4.33 * s), (v) => nf.format(Math.round(v)));
    $('#rTeamL').textContent = `на місяць для всієї команди з ${p} ${people(p)}`;
    const pay = $('#payText');
    pay.replaceChildren('За 3 місяці ви заощадите ', el('b', '', zl(month * s * 3)), '. Впровадження, яке коштує менше, окупиться за квартал. За рік економія сягне ', el('b', '', zl(month * s * 12)), '.');
    drawChart(month * s);
  };
  [cPeople, cRate, cShare].forEach((i) => i && i.addEventListener('input', calc));
  let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => last.back != null && drawChart(last.back), 150); });
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
    if (kind === 'pains' && marked().length) fWhat.value = `Позначено на сайті: ${marked().map((s) => $('.slip__t', s).textContent.toLowerCase()).join('; ')}.`;
    if (kind === 'builder' && bTasks) {
      const S = SEGS[b.seg]; setPick(fWho, S.who); setPick(fPain, S.pain);
      const chosen = S.steps.filter((_, i) => b.on.has(i)).map((s) => s.n + (s.gate ? ' (рішення за людиною)' : ''));
      if (chosen.length) fWhat.value = `Схема з сайту: ${S.trigger[0]} → ${chosen.join(' → ')}.`;
    }
    if (kind === 'calc' && last.year != null) fWhat.value = `Мої цифри з калькулятора: ${last.p} ${people(last.p)}, ${last.hours} год рутини на тиждень, ${zl(last.year)} на рік.`;
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
  if (slips.length) { land(slips, 0.15, true); setTimeout(() => root.classList.remove('motion'), 1400); }
  else root.classList.remove('motion');

  // Opening a page puts its first sheets on the desk; nothing else fades or slides on scroll.
  const deal = (nodes) => nodes.forEach((n, i) => {
    M.animate(n, { y: [-18, 0], rotate: [i % 2 ? 0.8 : -0.8, 0] }, { duration: 0.6, ease, delay: 0.05 + i * 0.06 });
  });
  deal($$('.page-band > *, .me > .tile, .me > figure, .me .rail > .tile'));
  // The Human Gate flow runs once, left to right, and stops at the gate.
  const gFlow = $('.g-flow');
  if (gFlow) M.inView(gFlow, () => {
    const steps = $$(':scope > li', gFlow);
    steps.forEach((li, i) => M.animate(li, li.classList.contains('is-gate') ? { scale: [0.94, 1.04, 1] } : { x: [-12, 0] }, { duration: 0.45, ease, delay: i * 0.12 }));
  }, { amount: 0.5 });
  // 8:00: the morning messages arrive one after another.
  if (tgList) M.inView(tgList, () => {
    M.animate($$('.msg, .tg__head', tgList), { y: [14, 0], scale: [0.98, 1] }, { duration: 0.4, ease, delay: M.stagger(0.25) });
  }, { amount: 0.4 });
  // Only loose sheets move after that: they land, and they square up when the visitor decides.
  $$('.askew').filter((n) => !n.closest('#slips, #bWho, #bTasks, .g-ex')).forEach((n) => {
    M.inView(n, () => { land([n]); }, { amount: 0.3 });
  });
  $$('#bWho, #bTasks, .g-ex').forEach((group) => {
    M.inView(group, () => { land($$('.askew', group)); }, { amount: 0.25 });
  });
  if (M.press) {
    M.press('.slip, .seg, .task, .chip, .btn, .t-act, .t-link, .rung__btn, .msg__btns button, .op__btn', (node) => {
      M.animate(node, { scale: 0.97 }, { duration: 0.12 });
      return () => M.animate(node, { scale: 1 }, { type: 'spring', stiffness: 520, damping: 30 });
    });
  }
})();
