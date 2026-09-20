(() => {
'use strict';

/* =====================================================================
   常數與資料
   ===================================================================== */
const STORE_KEY = 'gospogo.v1';
const WEEKS = 4;
const PER_WEEK = 3;
const UP_AT = 0.8;     // 完成度 ≥ 80% → 升級進階
const DOWN_BELOW = 0.5; // 完成度 < 50% → 降回基礎
const DAYS = ['週一', '週三', '週五'];
const DAY_OFFSET = [0, 2, 4];
const LEVEL = {
  basic: { label: '基礎' },
  advanced: { label: '進階' },
};

const PLANS = {
  fatburn: {
    name: '燃脂啟動', emoji: '🔥',
    desc: '循環訓練 + 間歇有氧，提升代謝、養成運動習慣。',
    sessions: [
      { title: '全身燃脂循環',
        basic: { min: 35, items: ['開合跳 3×30 秒', '徒手深蹲 3×12', '登山跑 3×20 秒', '平板支撐 3×30 秒'] },
        advanced: { min: 45, items: ['波比跳 4×10', '跳躍深蹲 4×12', '登山跑 4×40 秒', '平板支撐 4×45 秒'] } },
      { title: '間歇有氧',
        basic: { min: 30, items: ['快走或慢跑熱身 5 分鐘', '30 秒快 / 60 秒慢 × 8 組', '收操伸展 5 分鐘'] },
        advanced: { min: 35, items: ['慢跑熱身 5 分鐘', '40 秒衝刺 / 40 秒慢跑 × 10 組', '收操伸展 5 分鐘'] } },
      { title: '核心與下肢',
        basic: { min: 35, items: ['臀橋 3×15', '弓步蹲 3×10（每側）', '捲腹 3×15', '側平板 3×20 秒'] },
        advanced: { min: 45, items: ['單腳臀橋 4×12', '保加利亞分腿蹲 4×10', '懸空抬腿 4×12', '側平板 4×40 秒'] } },
    ],
  },
  muscle: {
    name: '增肌塑形', emoji: '💪',
    desc: '上下肢分化訓練，循序增加重量與組數。',
    sessions: [
      { title: '上肢推',
        basic: { min: 40, items: ['跪姿伏地挺身 3×10', '啞鈴肩推 3×10', '椅上撐體 3×10', '啞鈴側平舉 3×12'] },
        advanced: { min: 50, items: ['標準伏地挺身 4×12', '啞鈴肩推 4×8（加重）', '窄距伏地挺身 4×10', '側平舉 4×12 + 遞減組'] } },
      { title: '下肢力量',
        basic: { min: 40, items: ['徒手深蹲 3×15', '羅馬尼亞硬舉（輕重量）3×12', '弓步蹲 3×10', '提踵 3×20'] },
        advanced: { min: 50, items: ['高腳杯深蹲 4×10', '羅馬尼亞硬舉 4×8', '保加利亞分腿蹲 4×8', '單腳提踵 4×15'] } },
      { title: '上肢拉與核心',
        basic: { min: 40, items: ['彈力帶划船 3×12', '反向飛鳥 3×12', '啞鈴彎舉 3×12', '死蟲式 3×10'] },
        advanced: { min: 50, items: ['啞鈴單臂划船 4×10', '輔助引體向上 4×6', '錘式彎舉 4×10', '懸空抬腿 4×12'] } },
    ],
  },
  endurance: {
    name: '體能耐力', emoji: '🏃',
    desc: '節奏跑、交叉訓練與長距離，打好心肺基礎。',
    sessions: [
      { title: '節奏跑',
        basic: { min: 30, items: ['熱身快走 5 分鐘', '輕鬆跑 15 分鐘（可跑走交替）', '收操伸展 5 分鐘'] },
        advanced: { min: 40, items: ['熱身慢跑 8 分鐘', '節奏跑 20 分鐘（配速稍喘）', '收操伸展 7 分鐘'] } },
      { title: '交叉訓練',
        basic: { min: 35, items: ['飛輪或游泳 25 分鐘（輕鬆強度）', '全身伸展 10 分鐘'] },
        advanced: { min: 45, items: ['飛輪或游泳 30 分鐘（含 4 組 1 分鐘加速）', '核心穩定：平板支撐 3×45 秒', '全身伸展 8 分鐘'] } },
      { title: '長距離低強度',
        basic: { min: 40, items: ['低強度連續跑走 30 分鐘', '伸展放鬆 10 分鐘'] },
        advanced: { min: 60, items: ['低強度連續跑 45 分鐘', '伸展放鬆 10 分鐘', '補水與補充能量'] } },
    ],
  },
};

const ICON = {
  check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  skip: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5l9 7-9 7zM19 5v14"/></svg>',
  lock: '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  up: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  down: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',
  keep: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M5 9h14M5 15h14"/></svg>',
  flag: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  hourglass: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/></svg>',
};

/* =====================================================================
   狀態
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function freshState() {
  return {
    planId: null,
    startMonday: null,   // 'YYYY-MM-DD'
    weeks: [],           // [{ level, marks:[null|'done'|'skipped' ×3], result? }]
    currentWeek: 0,      // 目前已解鎖的最新一週
    viewWeek: 0,
    finished: false,
    coachId: 'chen',
    chat: [],
    tab: 'plan',
  };
}

function isValid(s) {
  if (!s || typeof s !== 'object' || !Array.isArray(s.chat)) return false;
  if (s.planId === null) return true;
  return !!PLANS[s.planId] && Array.isArray(s.weeks) && s.weeks.length === WEEKS &&
    s.weeks.every(w => w && LEVEL[w.level] && Array.isArray(w.marks) && w.marks.length === PER_WEEK) &&
    Number.isInteger(s.currentWeek) && s.currentWeek >= 0 && s.currentWeek < WEEKS;
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (isValid(s)) return { ...freshState(), ...s };
    }
  } catch (_) { /* 忽略，使用預設 */ }
  return freshState();
}

function save() {
  try {
    state.chat = state.chat.slice(-120);
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (_) { /* 儲存失敗時仍可繼續使用 */ }
}

let state = load();

/* =====================================================================
   日期工具
   ===================================================================== */
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmtMD = d => `${d.getMonth() + 1}/${d.getDate()}`;

// 週一～週五 → 本週一；週六、週日 → 下週一
function startMonday(now) {
  const x = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dow = x.getDay();
  if (dow >= 1 && dow <= 5) return addDays(x, -(dow - 1));
  return addDays(x, dow === 0 ? 1 : 2);
}
const sessionDate = (w, i) => addDays(parseYmd(state.startMonday), w * 7 + DAY_OFFSET[i]);

/* =====================================================================
   課表邏輯
   ===================================================================== */
function outcome(w) {
  const wk = state.weeks[w];
  const done = wk.marks.filter(m => m === 'done').length;
  const skipped = wk.marks.filter(m => m === 'skipped').length;
  const marked = done + skipped;
  const rate = done / PER_WEEK;
  let next = wk.level;
  if (rate >= UP_AT) next = 'advanced';
  else if (rate < DOWN_BELOW) next = 'basic';
  const kind = next === wk.level ? 'keep' : (next === 'advanced' ? 'up' : 'down');
  return { rate, pct: Math.round(rate * 100), done, skipped, marked, complete: marked === PER_WEEK, next, kind };
}

const isReadonly = w => state.finished || w < state.currentWeek;
const isLocked = w => w > state.currentWeek;

function startPlan(id) {
  state.planId = id;
  state.startMonday = ymd(startMonday(new Date()));
  state.weeks = Array.from({ length: WEEKS }, () => ({ level: 'basic', marks: Array(PER_WEEK).fill(null) }));
  state.currentWeek = 0;
  state.viewWeek = 0;
  state.finished = false;
  save();
  renderPlan();
  toast(`已建立「${PLANS[id].name}」4 週課表`);
}

function resetPlan() {
  Object.assign(state, {
    planId: null, startMonday: null, weeks: [], currentWeek: 0, viewWeek: 0, finished: false,
  });
  save();
  renderPlan();
}

function mark(w, i, status) {
  if (isReadonly(w) || isLocked(w)) return;
  const wk = state.weeks[w];
  wk.marks[i] = wk.marks[i] === status ? null : status;
  save();
  renderPlan();
}

function advance() {
  const w = state.currentWeek;
  const o = outcome(w);
  if (!o.complete || state.finished) return;
  const wk = state.weeks[w];
  wk.result = { pct: o.pct, kind: o.kind, next: o.next };

  if (w === WEEKS - 1) {
    state.finished = true;
    save();
    renderPlan();
    toast('🎉 恭喜完成 4 週訓練計畫！');
    return;
  }
  state.weeks[w + 1].level = o.next;
  state.currentWeek = w + 1;
  state.viewWeek = w + 1;
  save();
  renderPlan();
  const msg = { up: '已升級！第 %n 週改為進階難度', down: '已調整：第 %n 週降回基礎難度', keep: `第 %n 週維持${LEVEL[o.next].label}難度` }[o.kind];
  toast(msg.replace('%n', w + 2));
}

/* ---------- 預覽文案 ---------- */
function previewInfo(w) {
  const wk = state.weeks[w];
  const o = outcome(w);
  const isLast = w === WEEKS - 1;
  const tag = o.complete ? '已確定' : '預估';
  const remain = PER_WEEK - o.marked;
  const hint = o.complete ? '' : `還有 ${remain} 堂未標記，標記後預覽會即時更新。`;

  if (isLast) {
    return { cls: 'final', icon: ICON.flag, title: '最後一週', tag,
      body: `目前完成度 ${o.pct}%。完成本週後即結束 4 週計畫。`, hint };
  }
  if (o.marked === 0) {
    return { cls: 'idle', icon: ICON.hourglass, title: '下週難度預覽', tag: null,
      body: '完成或跳過訓練後，這裡會即時預覽下週的難度調整。', hint: '' };
  }
  const cur = LEVEL[wk.level].label;
  if (o.kind === 'up') {
    return { cls: 'up', icon: ICON.up, title: '預覽下週：升級為進階', tag,
      body: `完成度 ${o.pct}% 已達 80%，下週將提升強度。`, hint };
  }
  if (o.kind === 'down') {
    return { cls: 'down', icon: ICON.down, title: '預覽下週：降回基礎', tag,
      body: `完成度 ${o.pct}% 低於 50%，下週降回基礎難度，先把節奏找回來。`, hint };
  }
  if (o.rate >= UP_AT) {
    return { cls: 'keep', icon: ICON.keep, title: '預覽下週：維持進階', tag,
      body: `完成度 ${o.pct}% 已達 80%，繼續保持進階強度。`, hint };
  }
  if (o.rate < DOWN_BELOW) {
    return { cls: 'keep', icon: ICON.keep, title: '預覽下週：維持基礎', tag,
      body: `完成度 ${o.pct}% 低於 50%，下週先穩住基礎難度。`, hint };
  }
  return { cls: 'keep', icon: ICON.keep, title: `預覽下週：維持${cur}`, tag,
    body: `完成度 ${o.pct}% 介於 50%–80%，難度不變。`, hint };
}

function resultInfo(w) {
  const r = state.weeks[w].result;
  if (!r) return null;
  const txt = { up: `升級為進階難度`, down: '降回基礎難度', keep: `維持${LEVEL[r.next].label}難度` }[r.kind];
  const ic = { up: ICON.up, down: ICON.down, keep: ICON.keep }[r.kind];
  const bg = { up: 'var(--brand)', down: 'var(--basic)', keep: '#64748b' }[r.kind];
  const isLast = w === WEEKS - 1;
  return { txt: isLast ? '本週為最後一週' : `下週${txt}`, pct: r.pct, ic, bg };
}

/* =====================================================================
   課表畫面
   ===================================================================== */
function renderPlan() {
  const el = $('#view-plan');
  const scroll = el.scrollTop;
  const active = document.activeElement;
  const focusSel = active && el.contains(active) && active.dataset.action
    ? `[data-action="${active.dataset.action}"]` +
      ['week', 'idx', 'status', 'id'].filter(k => active.dataset[k] !== undefined).map(k => `[data-${k}="${active.dataset[k]}"]`).join('')
    : null;

  el.innerHTML = state.planId ? planHTML() : chooserHTML();
  el.scrollTop = scroll;
  if (focusSel) { const n = $(focusSel, el); if (n && !n.disabled) n.focus({ preventScroll: true }); }
}

function chooserHTML() {
  const cards = Object.entries(PLANS).map(([id, p]) => `
    <article class="card plan-card">
      <div class="top">
        <span class="plan-emoji" aria-hidden="true">${p.emoji}</span>
        <div><h3>${esc(p.name)}</h3><p class="desc">${esc(p.desc)}</p></div>
      </div>
      <div class="days">${p.sessions.map((s, i) => `<span class="chip">${DAYS[i]}・${esc(s.title)}</span>`).join('')}</div>
      <button type="button" class="btn primary block" data-action="pick-plan" data-id="${id}">選擇此方案</button>
    </article>`).join('');
  return `
    <div class="hero">
      <h2>選擇你的訓練方案</h2>
      <p>建立 4 週課表，每週三堂（週一／三／五）。系統會依完成度自動調整難度。</p>
    </div>
    <div class="rule-strip" aria-label="難度調整規則">
      <div class="up"><b>≥ 80%</b>升級進階</div>
      <div><b>50–80%</b>維持難度</div>
      <div class="down"><b>&lt; 50%</b>降回基礎</div>
    </div>
    <div class="plan-list">${cards}</div>`;
}

function planHTML() {
  const plan = PLANS[state.planId];
  const w = state.viewWeek;
  const wk = state.weeks[w];
  const readonly = isReadonly(w);

  const tabs = state.weeks.map((_, i) => {
    const done = state.finished || i < state.currentWeek;
    const locked = isLocked(i);
    const cls = done ? 'done' : locked ? 'locked' : '';
    const sub = done ? `${ICON.check}完成` : locked ? `${ICON.lock}未解鎖` : '進行中';
    return `<button type="button" class="wtab ${cls}" role="tab" aria-selected="${i === w}" data-action="week" data-week="${i}">
      第${i + 1}週<small>${sub}</small></button>`;
  }).join('');

  const d0 = sessionDate(w, 0), d4 = sessionDate(w, 2);
  const o = outcome(w);
  const meterCls = o.rate >= UP_AT ? 'up' : o.rate < DOWN_BELOW ? 'low' : 'mid';

  const meter = `
    <div class="card meter">
      <div class="meter-top">
        <strong>本週完成度 ${o.pct}%</strong>
        <span>完成 ${o.done}／${PER_WEEK}・跳過 ${o.skipped}</span>
      </div>
      <div class="track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${o.pct}" aria-label="本週完成度">
        <div class="fill ${meterCls}" style="width:${o.pct}%"></div>
        <i class="tick" style="left:${DOWN_BELOW * 100}%"></i><i class="tick" style="left:${UP_AT * 100}%"></i>
      </div>
      <div class="scale" aria-hidden="true">
        <span style="left:${DOWN_BELOW * 100}%">50% 降級線</span>
        <span style="left:${UP_AT * 100}%">80% 升級線</span>
      </div>
    </div>`;

  let panel;
  if (readonly) {
    const r = resultInfo(w);
    panel = r ? `
      <div class="result">
        <span class="pv-icon" style="display:grid;place-items:center;width:36px;height:36px;border-radius:12px;color:#fff;background:${r.bg};flex:none">${r.ic}</span>
        <div><strong>本週結果：完成度 ${r.pct}%</strong><p>${r.txt}</p></div>
      </div>` : '';
  } else {
    const pv = previewInfo(w);
    panel = `
      <div class="preview ${pv.cls}" aria-live="polite">
        <span class="pv-icon">${pv.icon}</span>
        <div class="pv-body">
          <div class="pv-title">${esc(pv.title)}${pv.tag ? `<span class="pv-tag">${pv.tag}</span>` : ''}</div>
          <p>${esc(pv.body)}</p>
          ${pv.hint ? `<p class="pv-hint">${esc(pv.hint)}</p>` : ''}
        </div>
      </div>`;
  }

  const today = ymd(new Date());
  const sessions = plan.sessions.map((s, i) => {
    const status = wk.marks[i];
    const cfg = s[wk.level];
    const date = sessionDate(w, i);
    const stateTxt = status === 'done' ? '已完成' : status === 'skipped' ? '已跳過' : '待完成';
    const dis = readonly ? 'disabled' : '';
    return `
      <article class="card session ${status || ''}">
        <div class="s-head">
          <div class="s-day"><b>${DAYS[i]}</b><span>${fmtMD(date)}</span></div>
          <div class="s-title"><h3>${esc(s.title)}</h3><p>${cfg.min} 分鐘・${LEVEL[wk.level].label}${ymd(date) === today ? '・<b>今天</b>' : ''}</p></div>
          <span class="s-state">${stateTxt}</span>
        </div>
        <ul class="s-items">${cfg.items.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        <div class="s-actions">
          <button type="button" class="mark done" data-action="mark" data-week="${w}" data-idx="${i}" data-status="done" aria-pressed="${status === 'done'}" ${dis}>${ICON.check}完成</button>
          <button type="button" class="mark skipped" data-action="mark" data-week="${w}" data-idx="${i}" data-status="skipped" aria-pressed="${status === 'skipped'}" ${dis}>${ICON.skip}跳過</button>
        </div>
      </article>`;
  }).join('');

  let footer = '';
  if (!readonly) {
    const remain = PER_WEEK - o.marked;
    const isLast = w === WEEKS - 1;
    footer = `
      <div class="advance">
        <button type="button" class="btn primary block" data-action="advance" ${o.complete ? '' : 'disabled'}>
          ${isLast ? '完成 4 週計畫' : `完成本週，前進第 ${w + 2} 週`}
        </button>
        ${o.complete ? '' : `<p class="hint">再標記 ${remain} 堂（完成或跳過）即可解鎖${isLast ? '結算' : '前進'}</p>`}
      </div>`;
  }

  const finish = state.finished ? `
    <div class="card finish">
      <div class="big" aria-hidden="true">🏆</div>
      <h2>4 週計畫完成！</h2>
      <p>你已走完「${esc(plan.name)}」。可以回顧各週紀錄，或開始新的方案。</p>
      <button type="button" class="btn primary" data-action="change-plan" style="align-self:center">開始新方案</button>
    </div>` : '';

  return `
    ${finish}
    <div class="planbar">
      <span class="plan-emoji" aria-hidden="true">${plan.emoji}</span>
      <div class="info">
        <h2>${esc(plan.name)}</h2>
        <p>${state.finished ? '已完成' : `第 ${state.currentWeek + 1} / ${WEEKS} 週進行中`}</p>
      </div>
      ${state.finished ? '' : '<button type="button" class="link-btn" data-action="change-plan">更換方案</button>'}
    </div>
    <div class="weektabs" role="tablist" aria-label="週次">${tabs}</div>
    <div class="week-head">
      <h2>第 ${w + 1} 週</h2>
      <span class="badge ${wk.level}">${LEVEL[wk.level].label}難度</span>
      <span class="range">${fmtMD(d0)} – ${fmtMD(d4)}</span>
    </div>
    ${meter}
    ${panel}
    <div class="sessions">${sessions}</div>
    ${footer}`;
}

/* =====================================================================
   Toast / Dialog
   ===================================================================== */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function confirmDialog(title, msg, ok = '確定') {
  const dlg = $('#dlg');
  $('#dlg-title').textContent = title;
  $('#dlg-msg').textContent = msg;
  $('#dlg-ok').textContent = ok;
  dlg.returnValue = '';
  return new Promise(resolve => {
    dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok'), { once: true });
    dlg.showModal();
  });
}

/* =====================================================================
   虛擬教練
   ===================================================================== */
const COACHES = {
  chen: {
    name: '陳教練', initial: '陳', avClass: 'av-chen',
    intro: '我是陳教練。訓練靠紀律，不靠心情。有問題直接問，別浪費時間。',
    switched: '換我接手。少說廢話，先看你的課表進度。',
    lines: {
      lowMotivation: [
        '沒動力是常態，等有動力才練，那叫心情運動。規則很簡單：先穿上鞋，做完 10 分鐘熱身，再決定要不要停。多數人熱身完就不會停了。',
        '藉口我聽多了。不用練滿，先做課表裡最短的一組動作。開始，比想清楚重要。',
      ],
      cheer: [
        '不需要我打氣，看你的完成度說話。三堂全部完成，這週就是你的。去做。',
        '你已經站在起跑線上了，剩下的就是執行。別讓我在課表上看到空格。',
      ],
      greet: ['到。今天要問什麼？課表、狀態，還是藉口？'],
      thanks: ['少客氣，用完成度回報我。'],
      fallback: ['這個我不確定。我負責訓練：可以問「今天練什麼」、說「沒動力」；身體不適要立刻告訴我。'],
      safety: '立刻停止訓練。這不是硬撐的時候。\n1. 坐下或躺下休息，補充水分。\n2. 這堂先跳過，別逞強。\n3. 症狀沒有很快緩解，或反覆出現，就去看醫師。\n恢復之前不准加量，課表可以等你。',
      emergency: '出現胸痛、胸悶、呼吸困難、心悸或暈厥，立刻就醫或撥 119，不要自己扛。',
      disclaimer: '我是虛擬教練，無法取代醫療專業判斷。',
    },
  },
  lin: {
    name: '林教練', initial: '林', avClass: 'av-lin',
    intro: '嗨，我是林教練～今天過得好嗎？想聊訓練、課表，或只是需要一點鼓勵，都可以跟我說喔。',
    switched: '換我來陪你囉～有什麼想聊的都可以說。',
    lines: {
      lowMotivation: [
        '沒動力的日子每個人都有，這不代表你不夠好 🤍 我們把目標縮小：只做 10 分鐘熱身就好，做完如果還是想停，也完全沒關係。',
        '今天辛苦了，先深呼吸一下。要不要試試只穿上運動鞋、出門走 5 分鐘？願意開始，就已經很棒囉。',
      ],
      cheer: [
        '你比自己想的還要努力喔！每完成一堂，都是在對未來的自己說謝謝 ✨ 我會一直在旁邊陪你，加油！',
        '看到你願意打開 App，我就覺得好開心。一步一步來，你做得到的 💪',
      ],
      greet: ['嗨嗨～今天想聊什麼？課表、心情、身體狀況都可以說喔。'],
      thanks: ['不客氣～你願意持續練習，就是給我最棒的回饋 😊'],
      fallback: ['我還不太確定你的意思～你可以跟我說「沒動力」、問問「今天練什麼」，或告訴我身體的狀況喔。'],
      safety: '先停下來，好好照顧自己 🤍\n1. 找個舒服的地方坐下或躺著，慢慢喝點水。\n2. 這堂先跳過吧，休息比逞強更重要。\n3. 如果不舒服沒有很快好轉，或一直反覆，建議找醫師看看喔。\n等身體恢復了，我們再一起調整課表。',
      emergency: '如果有胸痛、胸悶、呼吸困難、心悸或快要昏倒的感覺，請馬上就醫或撥打 119，不要一個人硬撐喔。',
      disclaimer: '我是虛擬教練，無法取代醫師的專業判斷。',
    },
  },
};

const QUICK = ['我今天沒動力', '今天要練什麼？', '幫我打氣！', '我身體有點不舒服', '本週進度如何？'];

// 依優先順序比對：安全 > 沒動力 > 打氣 > 課表 > 問候 > 感謝
const RULES = [
  { id: 'safety', re: /不舒服|不適(?!合)|痛|受傷|扭到|拉傷|抽筋|頭暈|暈|胸悶|胸痛|喘不過|呼吸困難|噁心|想吐|心悸|發燒|麻麻|麻痺/ },
  { id: 'lowMotivation', re: /沒動力|沒有動力|不想練|不想動|不想運動|懶|[好太很真]累|有點累|累了|累死|提不起勁|沒力|想放棄|倦怠|不想去/ },
  { id: 'cheer', re: /加油|打氣|鼓勵|給我力量|給我動力|fight/i },
  { id: 'schedule', re: /課表|訓練|今天練|練什麼|本週|這週|下週|進度|難度|升級|降級|完成度/ },
  { id: 'greet', re: /你好|哈囉|嗨|^hi\b|hello|早安|午安|晚安/i },
  { id: 'thanks', re: /謝謝|感謝|thx|thanks/i },
];
const EMERGENCY_RE = /胸痛|胸悶|喘不過|呼吸困難|心悸|暈倒|昏倒|快昏|意識/;

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function scheduleFacts() {
  if (!state.planId) return { kind: 'none' };
  if (state.finished) return { kind: 'finished' };
  const w = state.currentWeek;
  const wk = state.weeks[w];
  const o = outcome(w);
  const idx = wk.marks.findIndex(m => m === null);
  if (idx === -1) return { kind: 'weekdone', w, wk, o };
  const s = PLANS[state.planId].sessions[idx];
  return { kind: 'next', w, wk, o, day: DAYS[idx], title: s.title, min: s[wk.level].min };
}

function scheduleReply(coachId, text) {
  const f = scheduleFacts();
  const chen = coachId === 'chen';
  if (f.kind === 'none') {
    return { text: chen ? '你還沒選訓練方案。先去課表頁選一個，再來問我。'
      : '你還沒選訓練方案喔～先到課表頁挑一個喜歡的，我再幫你看進度 😊', action: true };
  }
  if (f.kind === 'finished') {
    return { text: chen ? '4 週計畫已完成。別鬆懈，去課表頁開新方案。'
      : '你完成整整 4 週的計畫了，太厲害了！想繼續的話，可以到課表頁挑新的方案喔 🎉', action: true };
  }
  const lv = LEVEL[f.wk.level].label;
  let out;
  if (f.kind === 'weekdone') {
    out = chen
      ? `第 ${f.w + 1} 週三堂都已標記，完成 ${f.o.done}/${PER_WEEK}。回課表頁按前進，不要拖。`
      : `第 ${f.w + 1} 週的三堂都標記完了，完成 ${f.o.done}/${PER_WEEK}，辛苦啦！回課表頁按「前進」就能解鎖下一週囉。`;
  } else {
    out = chen
      ? `第 ${f.w + 1} 週・${lv}難度，本週完成 ${f.o.done}/${PER_WEEK}。\n下一堂：${f.day}「${f.title}」${f.min} 分鐘。準時開練。`
      : `你現在在第 ${f.w + 1} 週（${lv}難度），本週完成 ${f.o.done}/${PER_WEEK} 堂囉！\n下一堂是${f.day}的「${f.title}」，大約 ${f.min} 分鐘。準備好就出發吧～`;
  }
  if (/難度|升級|降級|下週/.test(text) && f.w < WEEKS - 1) {
    if (f.o.marked === 0) {
      out += chen ? '\n還沒有紀錄，下週難度沒得預覽。先練。' : '\n目前還沒有紀錄，完成幾堂後就能預覽下週的難度囉。';
    } else {
      const lab = { up: '升級為進階', down: '降回基礎', keep: `維持${LEVEL[f.o.next].label}` }[f.o.kind];
      out += chen ? `\n依目前完成度 ${f.o.pct}%，下週預計：${lab}。` : `\n依目前完成度 ${f.o.pct}%，下週預計會${lab}喔。`;
    }
  }
  return { text: out, action: true };
}

function coachReply(text) {
  const coach = COACHES[state.coachId];
  const rule = RULES.find(r => r.re.test(text));
  const id = rule ? rule.id : 'fallback';
  const L = coach.lines;

  if (id === 'safety') {
    let body = L.safety;
    if (EMERGENCY_RE.test(text)) body += `\n\n${L.emergency}`;
    body += `\n\n${L.disclaimer}`;
    return { text: body, safety: true };
  }
  if (id === 'schedule') return scheduleReply(state.coachId, text);
  if (id === 'lowMotivation') return { text: pick(L.lowMotivation), action: !!state.planId };
  return { text: pick(L[id]) };
}

/* ---------- 聊天 UI ---------- */
const fmtTime = t => `${pad(new Date(t).getHours())}:${pad(new Date(t).getMinutes())}`;

function msgNode(m) {
  if (m.role === 'divider') {
    const d = document.createElement('div');
    d.className = 'divider';
    d.textContent = m.text;
    return d;
  }
  const me = m.role === 'user';
  const row = document.createElement('div');
  row.className = `row ${me ? 'me' : 'coach'}`;

  if (!me) {
    const c = COACHES[m.coach];
    const av = document.createElement('span');
    av.className = `avatar ${c.avClass}`;
    av.setAttribute('aria-hidden', 'true');
    av.textContent = c.initial;
    row.appendChild(av);
  }
  const stack = document.createElement('div');
  stack.className = 'stack';
  if (!me) {
    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = COACHES[m.coach].name;
    stack.appendChild(name);
  }
  const bubble = document.createElement('div');
  bubble.className = 'bubble' + (m.safety ? ' safety' : '');
  if (m.safety) {
    const h = document.createElement('div');
    h.className = 'safety-head';
    h.textContent = '⚠️ 安全提醒';
    bubble.appendChild(h);
  }
  bubble.appendChild(document.createTextNode(m.text));
  if (m.action) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bubble-action';
    b.dataset.action = 'goto-plan';
    b.textContent = '查看課表';
    bubble.appendChild(document.createElement('br'));
    bubble.appendChild(b);
  }
  stack.appendChild(bubble);
  const time = document.createElement('span');
  time.className = 'time';
  time.textContent = fmtTime(m.t);
  stack.appendChild(time);
  row.appendChild(stack);
  return row;
}

const messagesEl = () => $('#messages');
function scrollChat() { const el = messagesEl(); el.scrollTop = el.scrollHeight; }

function renderChat() {
  const el = messagesEl();
  el.replaceChildren(...state.chat.map(msgNode));
  scrollChat();
}

function pushMsg(m) {
  m.t = Date.now();
  state.chat.push(m);
  save();
  messagesEl().appendChild(msgNode(m));
  scrollChat();
}

let typingCount = 0;
function sendUser(raw) {
  const text = raw.trim().slice(0, 200);
  if (!text) return;
  pushMsg({ role: 'user', text });
  const reply = coachReply(text);
  const coachId = state.coachId;

  const typing = document.createElement('div');
  typing.className = 'row coach';
  typing.innerHTML = `<span class="avatar ${COACHES[coachId].avClass}" aria-hidden="true">${COACHES[coachId].initial}</span>
    <div class="bubble typing" aria-label="教練正在輸入"><i></i><i></i><i></i></div>`;
  messagesEl().appendChild(typing);
  scrollChat();
  typingCount++;

  setTimeout(() => {
    typing.remove();
    typingCount--;
    pushMsg({ role: 'coach', coach: coachId, ...reply });
  }, 550 + Math.random() * 350);
}

function setCoach(id, silent) {
  const changed = id !== state.coachId;
  state.coachId = id;
  document.querySelectorAll('.coach-opt').forEach(b => b.setAttribute('aria-checked', String(b.dataset.coach === id)));
  if (changed && !silent) {
    pushMsg({ role: 'divider', text: `已切換為${COACHES[id].name}（${id === 'chen' ? '嚴格' : '溫暖'}語氣）` });
    pushMsg({ role: 'coach', coach: id, text: COACHES[id].switched });
  }
  save();
}

/* =====================================================================
   分頁切換與事件
   ===================================================================== */
function setTab(tab) {
  state.tab = tab;
  const coach = tab === 'coach';
  $('#view-plan').hidden = coach;
  $('#view-coach').hidden = !coach;
  document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === tab)));
  $('#topbar-title').textContent = coach ? `虛擬教練・${COACHES[state.coachId].name}` : '動態課表';
  if (coach) scrollChat();
  save();
}

function init() {
  // 快速回覆
  $('#quick').innerHTML = QUICK.map(q => `<button type="button" data-quick="${esc(q)}">${esc(q)}</button>`).join('');

  if (state.chat.length === 0) {
    state.chat.push({ role: 'coach', coach: state.coachId, text: COACHES[state.coachId].intro, t: Date.now() });
    save();
  }

  renderPlan();
  renderChat();
  setCoach(state.coachId, true);
  setTab(state.tab === 'coach' ? 'coach' : 'plan');

  document.addEventListener('click', async e => {
    const t = e.target.closest('[data-action], [data-tab], [data-coach], [data-quick]');
    if (!t) return;

    if (t.dataset.tab) return setTab(t.dataset.tab);
    if (t.dataset.coach) { setCoach(t.dataset.coach); return setTab('coach'); }
    if (t.dataset.quick) { sendUser(t.dataset.quick); return; }

    switch (t.dataset.action) {
      case 'pick-plan': startPlan(t.dataset.id); break;
      case 'mark': mark(+t.dataset.week, +t.dataset.idx, t.dataset.status); break;
      case 'week': {
        const w = +t.dataset.week;
        if (isLocked(w)) { toast(`完成第 ${state.currentWeek + 1} 週後才會解鎖第 ${w + 1} 週`); break; }
        state.viewWeek = w; save(); renderPlan();
        break;
      }
      case 'advance': advance(); break;
      case 'change-plan': {
        const msg = state.finished ? '目前的紀錄將被清除，並回到方案選擇。' : '更換後，目前的 4 週課表與完成紀錄會被清除。';
        if (await confirmDialog(state.finished ? '開始新方案？' : '更換訓練方案？', msg, '確定')) resetPlan();
        break;
      }
      case 'goto-plan': setTab('plan'); break;
    }
  });

  $('#composer').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#msg-input');
    sendUser(input.value);
    input.value = '';
  });

  // Enter 送出；輸入法選字中的 Enter（isComposing / keyCode 229）不送出
  $('#msg-input').addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229) return;
    e.preventDefault();
    $('#composer').requestSubmit();
  });

  // 教練列以方向鍵切換（radiogroup 慣例）
  $('.coach-switch').addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const next = state.coachId === 'chen' ? 'lin' : 'chen';
    setCoach(next);
    setTab('coach');
    $(`.coach-opt[data-coach="${next}"]`).focus();
  });
}

init();
})();
