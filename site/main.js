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
  const bTasks = $('#bTasks');
  const stateText = (s, on) => (on ? (s.gate ? 'агент готує, вирішуєте ви' : 'робить агент') : 'вручну');
  const renderFlow = (animateIt) => {
    const S = SEGS[b.seg];
    const chosen = S.steps.filter((_, i) => b.on.has(i));
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
  const segs = $$('#bWho [role="radio"]');
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
  // The bars are measured against one scale that only changes in round steps, so they grow and shrink with the sliders.
  let axis = 0;
  const STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const nice = (v) => { const p = 10 ** Math.floor(Math.log10(v)); return STEPS.find((k) => k * p >= v) * p; };
  const drawChart = (monthBack) => {
    const bars = $('#bars'); if (!bars) return;
    const total = Math.max(1, monthBack * 12);
    if (!axis || total > axis || total < axis / 4) axis = nice(total * 1.2);
    $$('i', bars).forEach((b, i) => b.style.setProperty('--h', `${((monthBack * (i + 1)) / axis) * 100}%`));
    $('.q', bars).style.setProperty('--q', `${((monthBack * 3) / axis) * 100}%`);
    $('#chartScale').textContent = `шкала до ${zl(axis)}`;
    bars.setAttribute('aria-label', `Накопичена економія: ${zl(monthBack * 3)} за 3 місяці, ${zl(total)} за 12 місяців`);
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
    countTo($('#rPerson'), Math.round(hours * s * 2) / 2, (v) => `${half(v)} год`);
    countTo($('#rHours'), Math.round(p * hours * 4.33 * s), (v) => `${nf.format(Math.round(v))} год`);
    $('#rTeamL').textContent = `на місяць для всієї команди з ${p} ${people(p)}`;
    const pay = $('#payText');
    pay.replaceChildren('За 3 місяці ви заощадите ', el('b', '', zl(month * s * 3)), '. Впровадження, яке коштує менше, окупиться за квартал. За рік економія сягне ', el('b', '', zl(month * s * 12)), '. Чорна лінія на графіку показує суму за перші 3 місяці.');
    drawChart(month * s);
  };
  [cPeople, cRate, cShare].forEach((i) => i && i.addEventListener('input', calc));
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
      { raw: 'petrenko ivan · 600123456 · 12/10', name: 'Іван Петренко', sub: '+48 600 123 456 · 12.10.2026', note: "Привожу ім'я, телефон і дату до одного формату." },
      { raw: 'Іван Петренко · +48 600 123 456', dup: true, note: "Це той самий кандидат. Об'єдную з попереднім записом." },
      { raw: 'Anna Kowalska · 511022033 · 13/10', name: 'Anna Kowalska', sub: '+48 511 022 033 · 13.10.2026', note: 'Додаю код країни й повну дату.' },
      { raw: 'Олена Ковальчук · відмова', name: 'Олена Ковальчук', sub: 'лист з відмовою надіслано', gate: true, note: 'Лист з відмовою готовий. Надіслати його може тільки рекрутер.', ok: 'Рекрутер погодив лист.' },
      { raw: 'Marek Nowak · marek@firma.pl · 14.10', name: 'Marek Nowak', sub: 'marek@firma.pl · 14.10.2026', note: 'Новий кандидат, створюю картку.' },
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
    const finish = () => { agent.classList.remove('is-busy'); note.textContent = `Готово: ${cards()} записи в CRM, 1 дубль об'єднано, 1 рішення ухвалила людина.`; again.hidden = false; };
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
  if (slips.length) M.inView('#slips', () => { land(slips); }, { amount: 0.3 });

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
  $$('.askew').filter((n) => !n.closest('#slips, #bTasks')).forEach((n) => {
    M.inView(n, () => { land([n]); }, { amount: 0.3 });
  });
  $$('#bTasks').forEach((group) => {
    M.inView(group, () => { land($$('.askew', group)); }, { amount: 0.25 });
  });
  if (M.press) {
    M.press('.slip, .tab, .task, .chip, .btn, .fab, .t-act, .rung__btn, .msg__btns button, .op__btn', (node) => {
      M.animate(node, { scale: 0.97 }, { duration: 0.12 });
      return () => M.animate(node, { scale: 1 }, { type: 'spring', stiffness: 520, damping: 30 });
    });
  }
})();
