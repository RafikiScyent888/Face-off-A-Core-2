/* =====================================================================
   FACE-OFF: A+ CORE 2  —  application
   Roles:  #/          launcher
           #/host      host console (projector)
           #/play/CODE student device
   ===================================================================== */
(function () {
'use strict';

var QB  = window.FACEOFF_QUESTIONS;
var FB  = window.FACEOFF_FIREBASE || { enabled: false };
var app = document.getElementById('app');

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function uid() { return Math.random().toString(36).slice(2, 10); }
function roomCode() {
  var L = 'ABCDEFGHJKLMNPQRSTUVWXYZ', s = '';
  for (var i = 0; i < 4; i++) s += L[Math.floor(Math.random() * L.length)];
  return s;
}
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function fmt(n) { return (n < 0 ? '-' : '') + Math.abs(n).toLocaleString(); }
function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
/* per-TAB identity: two tabs on one machine = two different players,
   and a refresh keeps you in your seat */
function ssGet(k, d) { try { var v = sessionStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
function ssSet(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

var COLORS = [
  { id: 'blue',   name: 'Royal',   hex: '#2f4fb0' },
  { id: 'red',    name: 'Crimson', hex: '#b91c1c' },
  { id: 'green',  name: 'Emerald', hex: '#15803d' },
  { id: 'purple', name: 'Violet',  hex: '#6d28d9' },
  { id: 'yellow', name: 'Gold',    hex: '#eab308' },
  { id: 'orange', name: 'Ember',   hex: '#c2410c' },
  { id: 'cyan',   name: 'Ice',     hex: '#0e7490' },
  { id: 'pink',   name: 'Magenta', hex: '#a21caf' }
];

/* keep caret/focus across re-renders */
function withFocus(fn) {
  var el = document.activeElement, id = el && el.id, ss = null, se = null;
  try { ss = el.selectionStart; se = el.selectionEnd; } catch (e) {}
  fn();
  if (id) {
    var n = document.getElementById(id);
    if (n) { n.focus(); try { if (ss != null) n.setSelectionRange(ss, se); } catch (e) {} }
  }
}

function flash(msg, kind) {
  var host = $('#flash-host');
  host.innerHTML = '<div class="flash ' + (kind || '') + '">' + esc(msg) + '</div>';
  clearTimeout(flash._t);
  flash._t = setTimeout(function () { host.innerHTML = ''; }, 1800);
}

/* ------------------------------------------------------------------ */
/* sound                                                               */
/* ------------------------------------------------------------------ */
var Snd = {
  on: true, ctx: null,
  ac: function () {
    if (!this.on) return null;
    if (!this.ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; this.ctx = new C(); }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  tone: function (freq, dur, type, vol, delay) {
    var c = this.ac(); if (!c) return;
    var t0 = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.03);
  },
  buzz:    function () { this.tone(200, .28, 'square', .16); this.tone(150, .3, 'square', .12, .02); },
  correct: function () { this.tone(660, .13, 'sine', .18); this.tone(880, .22, 'sine', .18, .12); },
  wrong:   function () { this.tone(200, .3, 'sawtooth', .13); this.tone(140, .35, 'sawtooth', .12, .1); },
  dd:      function () { [523, 659, 784, 1047].forEach(function (f, i) { Snd.tone(f, .3, 'triangle', .16, i * .1); }); },
  tick:    function () { this.tone(1100, .04, 'square', .05); },
  timeup:  function () { this.tone(120, .6, 'sawtooth', .16); }
};

/* ------------------------------------------------------------------ */
/* transports                                                          */
/* ------------------------------------------------------------------ */
/* Local transport: works across browser TABS (BroadcastChannel) *and* across
   same-page frames (a shared in-page bus). Messages are deduped, so both
   channels can run at once without doubling up. */
function sharedBus() {
  var w = window;
  try { if (window.top && window.top.document) w = window.top; } catch (e) { w = window; }
  if (!w.__FO_BUS) {
    w.__FO_BUS = {
      subs: [],
      post: function (m) { this.subs.slice().forEach(function (f) { try { f(m); } catch (e) {} }); },
      sub: function (f) { this.subs.push(f); }
    };
  }
  return w.__FO_BUS;
}

function LocalTransport(room) {
  this.room = room;
  this.self = uid();
  this.seen = {};
  try { this.ch = ('BroadcastChannel' in window) ? new BroadcastChannel('faceoff:' + room) : null; }
  catch (e) { this.ch = null; }
  this.bus = sharedBus();
  this.kPub = 'fo:pub:' + room; this.kTim = 'fo:tim:' + room;
}
LocalTransport.prototype = {
  name: 'local',
  _post: function (msg) {
    msg.__room = this.room; msg.__from = this.self; msg.__id = uid();
    try { if (this.ch) this.ch.postMessage(msg); } catch (e) {}
    try { this.bus.post(msg); } catch (e) {}
  },
  _listen: function (fn) {
    var self = this;
    var handler = function (msg) {
      if (!msg || msg.__room !== self.room) return;
      if (msg.__from === self.self) return;          // ignore our own echo
      if (self.seen[msg.__id]) return;
      self.seen[msg.__id] = 1;
      fn(msg);
    };
    try { if (this.ch) this.ch.onmessage = function (e) { handler(e.data); }; } catch (e) {}
    try { this.bus.sub(handler); } catch (e) {}
  },
  hostInit: function (onAction) {
    var self = this;
    this._listen(function (d) {
      if (d.k === 'action') onAction(d.v);
      if (d.k === 'hello') { if (self.last) self._post({ k: 'pub', v: self.last }); if (self.lastT) self._post({ k: 'timer', v: self.lastT }); }
    });
    return Promise.resolve();
  },
  publish: function (pub) { this.last = pub; lsSet(this.kPub, pub); this._post({ k: 'pub', v: pub }); },
  publishTimer: function (t) { this.lastT = t; lsSet(this.kTim, t); this._post({ k: 'timer', v: t }); },
  playerInit: function (onPub, onTimer) {
    this._listen(function (d) {
      if (d.k === 'pub') onPub(d.v);
      if (d.k === 'timer') onTimer(d.v);
    });
    var p = lsGet(this.kPub, null); if (p) onPub(p);
    var t = lsGet(this.kTim, null); if (t) onTimer(t);
    this._post({ k: 'hello' });
    return Promise.resolve();
  },
  send: function (a) { this._post({ k: 'action', v: a }); }
};

function FirebaseTransport(room) { this.room = room; }
FirebaseTransport.prototype = {
  name: 'firebase',
  _load: function () {
    if (this._p) return this._p;
    var self = this;
    this._p = Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js')
    ]).then(function (m) {
      self.A = m[0]; self.D = m[1];
      self.appRef = self.A.initializeApp(FB.config);
      self.db = self.D.getDatabase(self.appRef);
      self.base = 'rooms/' + self.room;
    });
    return this._p;
  },
  hostInit: function (onAction) {
    var self = this;
    return this._load().then(function () {
      var D = self.D;
      return D.set(D.ref(self.db, self.base + '/actions'), null).then(function () {
        D.onChildAdded(D.ref(self.db, self.base + '/actions'), function (snap) {
          var v = snap.val();
          D.remove(snap.ref);
          if (v) onAction(v);
        });
        D.set(D.ref(self.db, self.base + '/meta'), { created: Date.now() });
      });
    });
  },
  publish: function (pub) {
    var self = this;
    this._load().then(function () { self.D.set(self.D.ref(self.db, self.base + '/pub'), pub); });
  },
  publishTimer: function (t) {
    var self = this;
    this._load().then(function () { self.D.set(self.D.ref(self.db, self.base + '/timer'), t); });
  },
  playerInit: function (onPub, onTimer) {
    var self = this;
    return this._load().then(function () {
      var D = self.D;
      D.onValue(D.ref(self.db, self.base + '/pub'), function (s) { if (s.val()) onPub(s.val()); });
      D.onValue(D.ref(self.db, self.base + '/timer'), function (s) { if (s.val()) onTimer(s.val()); });
    });
  },
  send: function (a) {
    var self = this;
    this._load().then(function () { self.D.push(self.D.ref(self.db, self.base + '/actions'), a); });
  }
};

function makeTransport(room) {
  var useFB = FB.enabled && FB.config && FB.config.apiKey && FB.config.apiKey.indexOf('PASTE') !== 0;
  return useFB ? new FirebaseTransport(room) : new LocalTransport(room);
}
function liveMode() {
  return FB.enabled && FB.config && FB.config.apiKey && FB.config.apiKey.indexOf('PASTE') !== 0;
}

/* ------------------------------------------------------------------ */
/* board construction                                                  */
/* ------------------------------------------------------------------ */
function buildBoard(round) {
  var src = round === 1 ? QB.round1 : QB.round2;
  if (!src || !src.length) return [];
  var mult = round === 2 ? 200 : 100;
  var board = src.map(function (cat) {
    return {
      name: cat.name,
      clues: cat.clues.map(function (cl, i) {
        return {
          q: cl.q, a: cl.a, alt: cl.alt || [], obj: cl.obj || '',
          value: (i + 1) * mult, done: false, dd: false
        };
      })
    };
  });
  // hide daily doubles randomly among the higher-value rows
  var ddCount = round === 2 ? 2 : 1;
  var pool = [];
  board.forEach(function (cat, c) {
    cat.clues.forEach(function (cl, i) { if (i >= 2) pool.push([c, i]); });
  });
  var usedCats = {};
  for (var k = 0; k < ddCount && pool.length; k++) {
    var pick, tries = 0;
    do { pick = pool[Math.floor(Math.random() * pool.length)]; tries++; }
    while (usedCats[pick[0]] && tries < 40);
    usedCats[pick[0]] = true;
    board[pick[0]].clues[pick[1]].dd = true;
    pool = pool.filter(function (p) { return !(p[0] === pick[0] && p[1] === pick[1]); });
  }
  return board;
}

/* ------------------------------------------------------------------ */
/* router                                                              */
/* ------------------------------------------------------------------ */
var currentTeardown = null;
function route() {
  if (currentTeardown) { try { currentTeardown(); } catch (e) {} currentTeardown = null; }
  var h = (location.hash || '#/').replace(/^#/, '');
  var mh = h.match(/^\/host\/?([A-Za-z0-9]*)/);
  var m  = h.match(/^\/play\/?([A-Za-z0-9]*)\/?([0-9]*)/);
  if (mh) { currentTeardown = Host((mh[1] || '').toUpperCase() || null); }
  else if (m) { currentTeardown = Player((m[1] || '').toUpperCase(), m[2] || ''); }
  else { Launcher(); }
}
window.addEventListener('hashchange', route);

/* ------------------------------------------------------------------ */
/* launcher                                                            */
/* ------------------------------------------------------------------ */
function Launcher() {
  var live = liveMode();
  app.innerHTML =
  '<div class="launch"><div class="launch-inner">' +
    '<div class="brand" style="justify-content:center"><div class="mark">⚔</div>' +
      '<div><div class="t1">CYBER WARRIOR</div><div class="t2">COMMAND CENTER</div></div></div>' +
    '<h1>FACE-OFF</h1>' +
    '<div class="sub">A+ Core 2 &nbsp;·&nbsp; 220-1102 &nbsp;·&nbsp; Team Review</div>' +
    '<div class="launch-cards">' +
      '<div class="card" data-go="host"><h3>🎬 Host a Game</h3>' +
        '<div class="hint">Open this on the projector. Generates a room code + QR for students to join.</div></div>' +
      '<div class="card" data-go="play"><h3>📱 Join as a Player</h3>' +
        '<div class="hint">Students tap here (or scan the QR) to pick a team, name it, and get a buzzer.</div></div>' +
    '</div>' +
    '<div class="mode-pill ' + (live ? 'live' : '') + '">' +
      (live ? '● LIVE MODE — students can join from any device'
            : '○ LOCAL MODE — works across tabs on this computer only. See FIREBASE-SETUP.md to go live.') +
    '</div>' +
  '</div></div>';
  app.onclick = function (e) {
    var c = e.target.closest('[data-go]'); if (!c) return;
    location.hash = c.getAttribute('data-go') === 'host' ? '#/host' : '#/play';
  };
}

/* ================================================================== */
/* HOST                                                                */
/* ================================================================== */
function Host(forcedCode) {
  var saved = lsGet('fo:host', null);
  var S = {
    room: forcedCode || (saved && saved.room) || roomCode(),
    settings: Object.assign({
      teamCount: 7, answerSecs: 15, finalSecs: 60, minWager: 100, deduct: false, sound: true
    }, (saved && saved.settings) || {}),
    phase: 'lobby', round: 1,
    teams: [], boards: { 1: buildBoard(1), 2: buildBoard(2) },
    active: null, control: null,
    buzzOrder: [], lockedOut: [], current: null,
    answers: {}, reveal: false, ddWager: null,
    final: { wagers: {}, answers: {}, judged: {}, revealIdx: -1 },
    timer: { running: false, endsAt: 0, total: 0 },
    settingsOpen: false
  };
  Snd.on = S.settings.sound;

  function makeTeams(n) {
    var old = S.teams.slice();
    S.teams = [];
    for (var i = 0; i < n; i++) {
      S.teams.push(old[i] || {
        id: 't' + (i + 1), slot: i + 1, name: 'Team ' + (i + 1),
        color: COLORS[i % COLORS.length].hex, colorId: COLORS[i % COLORS.length].id,
        members: [], score: 0, captain: null, locked: false
      });
    }
  }
  makeTeams(S.settings.teamCount);

  var T = makeTransport(S.room);
  var tickHandle = null;

  function team(id) { for (var i = 0; i < S.teams.length; i++) if (S.teams[i].id === id) return S.teams[i]; return null; }
  function persist() { lsSet('fo:host', { room: S.room, settings: S.settings }); }

  /* ---------- publish ---------- */
  function pubState() {
    var q = null;
    if (S.active && ['clue', 'answering', 'judge', 'ddclue', 'ddjudge', 'reveal'].indexOf(S.phase) >= 0) {
      q = { cat: S.active.cat, text: S.active.clue.q, value: S.active.value, dd: !!S.active.clue.dd };
    }
    var answered = {};
    Object.keys(S.answers).forEach(function (k) { answered[k] = true; });
    var p = {
      ts: Date.now(),
      phase: S.phase, round: S.round, room: S.room,
      teams: S.teams.map(function (t) {
        return { id: t.id, slot: t.slot, name: t.name, color: t.color, colorId: t.colorId,
                 score: t.score, members: t.members, captain: t.captain, locked: t.locked };
      }),
      q: q, control: S.control, current: S.current,
      buzzOrder: S.buzzOrder, lockedOut: S.lockedOut, answered: answered,
      reveal: S.reveal && S.active ? { a: S.active.clue.a } : null,
      ddTeam: (S.phase === 'ddwager' || S.phase === 'ddclue' || S.phase === 'ddjudge') ? S.control : null,
      ddWager: S.ddWager,
      minWager: S.settings.minWager,
      roundMax: S.round === 2 ? 1000 : 500,
      final: (S.phase.indexOf('final') === 0) ? {
        cat: QB.final.category,
        text: (S.phase === 'finalclue' || S.phase === 'finaljudge') ? QB.final.q : null,
        wagers: Object.keys(S.final.wagers).reduce(function (o, k) { o[k] = true; return o; }, {}),
        answeredF: Object.keys(S.final.answers).reduce(function (o, k) { o[k] = true; return o; }, {})
      } : null,
      answerSecs: S.settings.answerSecs
    };
    T.publish(clone(p));
  }
  function pubTimer() {
    T.publishTimer({ running: S.timer.running, endsAt: S.timer.endsAt, total: S.timer.total, hostNow: Date.now() });
  }
  function sync() { pubState(); pubTimer(); render(); }

  /* ---------- timer ---------- */
  function startTimer(secs) {
    S.timer = { running: true, endsAt: Date.now() + secs * 1000, total: secs };
    if (tickHandle) clearInterval(tickHandle);
    var lastWhole = secs;
    tickHandle = setInterval(function () {
      var left = S.timer.endsAt - Date.now();
      var whole = Math.ceil(left / 1000);
      if (whole !== lastWhole && whole > 0 && whole <= 5) Snd.tick();
      lastWhole = whole;
      paintTimer();
      if (left <= 0) { stopTimer(); Snd.timeup(); onExpire(); }
    }, 100);
    pubTimer();
  }
  function stopTimer() {
    S.timer.running = false;
    if (tickHandle) { clearInterval(tickHandle); tickHandle = null; }
    pubTimer();
  }
  function timeLeft() { return S.timer.running ? Math.max(0, S.timer.endsAt - Date.now()) : 0; }
  function paintTimer() {
    var ring = $('#ring'); if (!ring) return;
    var total = S.timer.total * 1000, left = timeLeft(), frac = total ? left / total : 0;
    var C = 2 * Math.PI * 40;
    var fg = $('.fg', ring); if (fg) fg.setAttribute('stroke-dashoffset', String(C * (1 - frac)));
    var num = $('.num', ring); if (num) num.textContent = Math.ceil(left / 1000);
    ring.className = 'ring' + (frac <= .25 ? ' crit' : frac <= .5 ? ' warn' : '');
  }
  function onExpire() {
    if (S.phase === 'answering') { S.phase = 'judge'; sync(); }
    else if (S.phase === 'ddclue') { S.phase = 'ddjudge'; sync(); }
    else if (S.phase === 'finalclue') { S.phase = 'finaljudge'; S.final.revealIdx = 0; sync(); }
  }

  /* ---------- actions from players ---------- */
  function onAction(a) {
    if (!a || !a.type) return;
    var t;
    switch (a.type) {
      case 'join':
        t = team(a.teamId); if (!t) return;
        var lower = String(a.name || '').trim().toLowerCase();
        var byId = t.members.filter(function (m) { return m.id === a.memberId; })[0];
        var byName = t.members.filter(function (m) { return m.name.trim().toLowerCase() === lower; })[0];
        if (byId) {
          byId.name = a.name;
        } else if (byName) {                       // same student rejoining after a refresh/close
          if (t.captain === byName.id) t.captain = a.memberId;
          byName.id = a.memberId;
        } else {
          if (t.members.length >= 5) return;
          t.members.push({ id: a.memberId, name: a.name });
          if (!t.captain) t.captain = a.memberId;
        }
        sync(); break;

      case 'leave':
        t = team(a.teamId); if (!t) return;
        t.members = t.members.filter(function (m) { return m.id !== a.memberId; });
        if (t.captain === a.memberId) t.captain = t.members.length ? t.members[0].id : null;
        sync(); break;

      case 'teamname':
        t = team(a.teamId); if (!t || t.locked) return;
        if (t.captain && a.memberId !== t.captain) return;
        t.name = String(a.name || '').slice(0, 26) || t.name; sync(); break;

      case 'teamcolor':
        t = team(a.teamId); if (!t || t.locked) return;
        if (t.captain && a.memberId !== t.captain) return;
        if (S.teams.some(function (x) { return x.id !== t.id && x.colorId === a.colorId; })) return;
        var col = COLORS.filter(function (c) { return c.id === a.colorId; })[0];
        if (col) { t.color = col.hex; t.colorId = col.id; } sync(); break;

      case 'buzz':      doBuzz(a.teamId); break;
      case 'answer':    doAnswer(a.teamId, a.text, a.by); break;
      case 'wager':     doWager(a.teamId, a.amount); break;
      case 'finalwager':
        t = team(a.teamId); if (!t || S.phase !== 'finalwager') return;
        S.final.wagers[a.teamId] = Math.max(0, Math.min(Math.max(t.score, 0), parseInt(a.amount, 10) || 0));
        sync(); break;
      case 'finalanswer':
        if (S.phase !== 'finalclue') return;
        S.final.answers[a.teamId] = { text: String(a.text || '').slice(0, 400), by: a.by }; sync(); break;
    }
  }

  function doBuzz(teamId) {
    if (S.phase !== 'clue') return;
    if (!team(teamId)) return;
    if (S.lockedOut.indexOf(teamId) >= 0) return;
    if (S.buzzOrder.indexOf(teamId) >= 0) return;
    S.buzzOrder.push(teamId);
    if (!S.current) {
      S.current = teamId; S.phase = 'answering'; Snd.buzz(); startTimer(S.settings.answerSecs);
    }
    sync();
  }
  function doAnswer(teamId, text, by) {
    var ok = (S.phase === 'answering' && teamId === S.current) ||
             (S.phase === 'ddclue' && teamId === S.control);
    if (!ok) return;
    S.answers[teamId] = { text: String(text || '').slice(0, 300), by: by || '' };
    stopTimer();
    S.phase = (S.phase === 'ddclue') ? 'ddjudge' : 'judge';
    sync();
  }
  function doWager(teamId, amt) {
    if (S.phase !== 'ddwager' || teamId !== S.control) return;
    var t = team(teamId);
    var max = Math.max(t.score, S.round === 2 ? 1000 : 500);
    var min = Math.min(S.settings.minWager, max);
    S.ddWager = Math.max(min, Math.min(max, parseInt(amt, 10) || min));
    S.active.value = S.ddWager;
    S.phase = 'ddclue';
    startTimer(S.settings.answerSecs);
    sync();
  }

  /* ---------- host game control ---------- */
  function openClue(c, i) {
    var b = S.boards[S.round];
    var cl = b[c].clues[i];
    if (cl.done) return;
    S.active = { c: c, i: i, cat: b[c].name, clue: cl, value: cl.value };
    S.answers = {}; S.buzzOrder = []; S.lockedOut = []; S.current = null; S.reveal = false; S.ddWager = null;
    if (cl.dd) {
      if (!S.control) { flash('Pick which team has control first (click a team card)', 'bad'); S.active = null; return; }
      S.phase = 'ddwager'; Snd.dd();
    } else {
      S.phase = 'clue';
    }
    sync();
  }
  function judge(correct) {
    var val = S.active.value;
    var isDDp = (S.phase === 'ddclue' || S.phase === 'ddjudge');
    var who = isDDp ? S.control : S.current;
    var t = team(who); if (!t) return;
    if (correct) {
      t.score += val; Snd.correct();
      S.control = who;
      S.active.clue.done = true;
      S.reveal = true; S.phase = 'reveal'; stopTimer();
    } else {
      Snd.wrong();
      if (S.settings.deduct) t.score -= val;
      if (isDDp) {                                    // no steal on a Daily Double
        S.active.clue.done = true; S.reveal = true; S.phase = 'reveal'; stopTimer();
      } else {
        S.lockedOut.push(who);
        delete S.answers[who];
        S.current = null;
        S.buzzOrder = S.buzzOrder.filter(function (x) { return x !== who; });
        var remaining = S.teams.filter(function (x) { return S.lockedOut.indexOf(x.id) < 0; });
        if (remaining.length) { S.phase = 'clue'; stopTimer(); flash('STEAL — open to all other teams', 'bad'); }
        else { S.active.clue.done = true; S.reveal = true; S.phase = 'reveal'; stopTimer(); }
      }
    }
    sync();
  }
  function revealNow() {
    S.active.clue.done = true; S.reveal = true; S.phase = 'reveal'; stopTimer(); sync();
  }
  function backToBoard() {
    S.active = null; S.reveal = false; S.phase = 'board'; S.answers = {};
    S.buzzOrder = []; S.lockedOut = []; S.current = null; stopTimer(); sync();
  }
  function roundDone() {
    var b = S.boards[S.round]; if (!b.length) return true;
    return b.every(function (c) { return c.clues.every(function (x) { return x.done; }); });
  }
  function gotoRound(n) {
    S.round = n; S.phase = 'board'; S.active = null; S.control = null; sync();
  }
  function startFinal() {
    S.phase = 'finalwager';
    S.final = { wagers: {}, answers: {}, judged: {}, revealIdx: -1 };
    S.teams.forEach(function (t) { if (t.score <= 0) S.final.wagers[t.id] = 0; });
    stopTimer(); sync();
  }
  function finalShowQ() { S.phase = 'finalclue'; startTimer(S.settings.finalSecs); sync(); }
  function finalJudge(correct) {
    var t = S.teams[S.final.revealIdx]; if (!t) return;
    var w = S.final.wagers[t.id] || 0;
    t.score += correct ? w : -w;
    S.final.judged[t.id] = correct;
    correct ? Snd.correct() : Snd.wrong();
    S.final.revealIdx++;
    if (S.final.revealIdx >= S.teams.length) S.phase = 'gameover';
    sync();
  }
  function newGame() {
    if (!confirm('Start a brand new game? Scores and the board reset. Teams stay.')) return;
    S.boards = { 1: buildBoard(1), 2: buildBoard(2) };
    S.teams.forEach(function (t) { t.score = 0; });
    S.round = 1; S.control = null; S.phase = 'board'; S.active = null;
    S.final = { wagers: {}, answers: {}, judged: {}, revealIdx: -1 };
    sync();
  }
  function demoTeams() {
    var names = ['PACKET PIRATES', 'BLUE SCREEN CREW', 'ROOT ACCESS', 'THE FIREWALLS', 'CTRL ALT DEFEAT', 'SUDO SQUAD', 'NULL POINTERS', 'BIT BENDERS'];
    var people = ['Alex', 'Jordan', 'Sam', 'Riley', 'Casey', 'Morgan', 'Taylor', 'Drew', 'Jamie', 'Quinn'];
    S.teams.forEach(function (t, i) {
      if (t.members.length) return;          // never clobber real students
      t.name = names[i % names.length];
      t.members = [];
      var n = 4 + (i % 2);
      for (var k = 0; k < n; k++) t.members.push({ id: uid(), name: people[(i * 3 + k) % people.length] });
      t.captain = t.members[0].id;
    });
    sync();
  }

  /* ---------- render ---------- */
  function render() { withFocus(_render); }

  function scoreStrip() {
    return '<div class="scores">' + S.teams.map(function (t) {
      return '<div class="scard' + (S.control === t.id ? ' control' : '') + '" data-ctl="' + t.id + '" title="Click to give this team board control">' +
        '<div class="bar" style="background:' + t.color + '"></div>' +
        '<div class="adj"><button data-adj="' + t.id + '" data-d="-100">−</button>' +
        '<button data-adj="' + t.id + '" data-d="100">+</button></div>' +
        '<div class="nm">' + esc(t.name) + '</div>' +
        '<div class="sc' + (t.score < 0 ? ' neg' : '') + '">' + fmt(t.score) + '</div>' +
        '<div class="mem">' + (t.members.length ? esc(t.members.map(function (m) { return m.name; }).join(', ')) : '<span style="opacity:.5">no players yet</span>') + '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function topbar() {
    var joinUrl = location.origin + location.pathname + '#/play/' + S.room;
    return '<div class="topbar">' +
      '<div class="brand"><div class="mark">⚔</div><div><div class="t1">FACE-OFF</div>' +
      '<div class="t2">A+ CORE 2 · 220-1102</div></div></div>' +
      '<div class="roundchip">' + (S.round === 2 ? 'Round 2 · Double' : 'Round 1') + '</div>' +
      (S.control ? '<div class="roundchip" style="border-color:' + team(S.control).color + '">' + esc(team(S.control).name) + ' picks</div>' : '') +
      '<div class="spacer"></div>' +
      '<div class="codechip">' + S.room + '</div>' +
      '<button class="btn sm" data-act="lobby">Join screen</button>' +
      '<button class="btn sm" data-act="settings">⚙</button>' +
      '<button class="btn sm" data-act="full">⛶</button>' +
    '</div>';
  }

  function lobbyView() {
    var joinUrl = location.origin + location.pathname + '#/play/' + S.room;
    var total = S.teams.reduce(function (a, t) { return a + t.members.length; }, 0);
    return '<div class="wrap"><div class="lobbygrid">' +
      '<div class="card joinbox">' +
        '<div style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;opacity:.75">Scan to join</div>' +
        '<div class="qr" id="qr"></div>' +
        '<div style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;opacity:.75;margin-top:14px">Room code</div>' +
        '<div class="bigcode">' + S.room + '</div>' +
        '<div class="joinurl mono">' + esc(joinUrl) + '</div>' +
        '<div class="row" style="justify-content:center;margin-top:14px">' +
          '<button class="btn sm" data-act="copy">Copy link</button>' +
          '<button class="btn sm" data-act="newcode">New code</button>' +
        '</div>' +
        (liveMode() ? '' : '<div class="notice" style="margin-top:14px;text-align:left">Running in <b>LOCAL MODE</b> — the join link only works in another tab on this same computer. See <span class="mono">FIREBASE-SETUP.md</span> to let phones join.</div>') +
      '</div>' +
      '<div>' +
        '<div class="row" style="margin-bottom:12px">' +
          '<h2 style="margin:0;font-size:22px">Teams <span style="opacity:.6;font-weight:600;font-size:15px">' + total + ' / 33 students joined</span></h2>' +
          '<div class="spacer"></div>' +
          '<button class="btn sm" data-act="demo">Fill demo teams</button>' +
          '<button class="btn primary" data-act="start">Start Game →</button>' +
        '</div>' +
        '<div class="tgrid">' + S.teams.map(function (t) {
          return '<div class="tcard"><div class="bar" style="background:' + t.color + '"></div>' +
            '<h4>' + esc(t.name) + ' <span style="opacity:.55;font-weight:600;font-size:12px">' + t.members.length + '/5</span></h4>' +
            (t.members.length
              ? '<div class="roster" style="margin-left:8px">' + t.members.map(function (m) {
                  return '<span class="rchip' + (m.id === t.captain ? ' cap' : '') + '">' + esc(m.name) + '</span>';
                }).join('') + '</div>'
              : '<div class="waiting">waiting for players…</div>') +
          '</div>';
        }).join('') + '</div>' +
        '<div class="hint" style="margin-top:14px">★ = team captain (first to join). The captain sets the team name and color; everyone else just types their own name.</div>' +
      '</div>' +
    '</div></div>';
  }

  function boardView() {
    var b = S.boards[S.round];
    if (!b.length) {
      return '<div class="wrap"><div class="card"><h2>Round ' + S.round + ' has no questions yet</h2>' +
        '<div class="hint">Add 6 categories × 5 clues to <span class="mono">round' + S.round + '</span> in <span class="mono">questions-core2.js</span>.</div>' +
        '<div class="row" style="margin-top:14px"><button class="btn" data-act="r1">← Round 1</button>' +
        '<button class="btn primary" data-act="final">Go to Final Face-Off →</button></div></div></div>';
    }
    return '<div class="boardwrap">' +
      '<div class="board">' + b.map(function (cat, c) {
        return '<div class="bcol"><div class="bcat">' + esc(cat.name) + '</div>' +
          cat.clues.map(function (cl, i) {
            return '<div class="btile' + (cl.done ? ' done' : '') + '" data-clue="' + c + ',' + i + '">' +
              (cl.done ? '' : fmt(cl.value)) + '</div>';
          }).join('') + '</div>';
      }).join('') + '</div>' +
      scoreStrip() +
      '<div class="row" style="justify-content:center">' +
        (roundDone() && S.round === 1 && S.boards[2].length ? '<button class="btn primary" data-act="r2">Round 2 →</button>' : '') +
        (roundDone() ? '<button class="btn primary" data-act="final">Final Face-Off →</button>' : '') +
        '<button class="btn ghost sm" data-act="new">New game</button>' +
        '<span class="hint">Keys: <b>1-' + S.teams.length + '</b> buzz for a team · <b>Y</b>/<b>N</b> judge · <b>Space</b> continue</span>' +
      '</div>' +
    '</div>';
  }

  function ringHTML() {
    var C = 2 * Math.PI * 40;
    return '<div class="ring" id="ring"><svg viewBox="0 0 100 100">' +
      '<circle class="bg" cx="50" cy="50" r="40" fill="none" stroke-width="9"/>' +
      '<circle class="fg" cx="50" cy="50" r="40" fill="none" stroke-width="9" stroke-linecap="round" ' +
      'stroke-dasharray="' + C + '" stroke-dashoffset="0"/></svg><div class="num">' + S.settings.answerSecs + '</div></div>';
  }

  function queueHTML() {
    if (!S.buzzOrder.length && !S.lockedOut.length) return '<div class="queue"><span class="hint">Waiting for a buzz…</span></div>';
    return '<div class="queue">' +
      S.buzzOrder.map(function (id, n) {
        var t = team(id);
        return '<div class="qchip' + (n === 0 ? ' first' : '') + '" style="background:' + t.color + '">' +
          '<span class="ord">#' + (n + 1) + '</span>' + esc(t.name) + '</div>';
      }).join('') +
      S.lockedOut.map(function (id) { return '<div class="lockchip">' + esc(team(id).name) + '</div>'; }).join('') +
    '</div>';
  }

  function clueOverlay() {
    var A = S.active, cl = A.clue;
    var isDD = (S.phase === 'ddclue' || S.phase === 'ddjudge');
    var whoId = isDD ? S.control : S.current;
    var who = whoId ? team(whoId) : null;
    var ans = S.answers[whoId] || null;
    var isJudge = (S.phase === 'judge' || S.phase === 'ddjudge');
    var isLive = (S.phase === 'answering' || S.phase === 'ddclue');
    return '<div class="overlay">' +
      '<div class="ovtop">' +
        '<div><div class="ovcat">' + esc(A.cat) + (isDD ? ' · DAILY DOUBLE' : '') + '</div><div class="ovval">' + fmt(A.value) + ' pts</div></div>' +
        '<div class="spacer"></div>' +
        '<div class="objtag">Obj ' + esc(cl.obj) + '</div>' +
        '<button class="btn sm ghost" data-act="close">Esc ✕</button>' +
      '</div>' +
      '<div class="qbox"><div class="qtext">' + esc(cl.q) + '</div></div>' +
      (isLive || isJudge ?
        '<div class="row" style="align-items:stretch">' +
          (isLive ? '<div class="timer">' + ringHTML() + '</div>' : '') +
          '<div style="flex:1;min-width:260px">' +
            '<div class="subans' + (ans ? '' : ' empty') + '" style="height:100%">' +
              '<div class="who">' + (who ? esc(who.name) : '') + (ans && ans.by ? ' — typed by ' + esc(ans.by) : '') + '</div>' +
              '<div class="txt">' + (ans ? esc(ans.text) : (isJudge ? 'No answer submitted — time expired' : 'typing…')) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' : '') +
      (isDD ? '' : queueHTML()) +
      '<div class="row">' +
        (isLive || isJudge ?
          '<button class="btn good lg" data-act="ok">✓ Correct <span style="opacity:.7;font-size:13px">(Y)</span></button>' +
          '<button class="btn bad lg" data-act="no">✕ Incorrect <span style="opacity:.7;font-size:13px">(N)</span></button>' : '') +
        '<div class="spacer"></div>' +
        '<button class="btn" data-act="show">Reveal answer &amp; move on</button>' +
      '</div>' +
      scoreStrip() +
      '<div class="hostans"><span style="opacity:.6">Host only —</span> <b>' + esc(cl.a) + '</b>' +
        (cl.alt && cl.alt.length ? '<span style="opacity:.7"> &nbsp;·&nbsp; also accept: ' + esc(cl.alt.join(' / ')) + '</span>' : '') + '</div>' +
    '</div>';
  }

  function revealOverlay() {
    var A = S.active, cl = A.clue;
    return '<div class="overlay">' +
      '<div class="ovtop"><div><div class="ovcat">' + esc(A.cat) + '</div>' +
      '<div class="ovval">' + fmt(A.value) + ' pts</div></div><div class="spacer"></div>' +
      '<div class="objtag">Obj ' + esc(cl.obj) + '</div></div>' +
      '<div class="qbox"><div><div class="qtext" style="font-size:clamp(18px,2.6vw,34px);opacity:.72;font-weight:650">' + esc(cl.q) + '</div>' +
      '<div class="abox" style="margin-top:26px"><div class="lbl">Answer</div><div class="txt">' + esc(cl.a) + '</div></div></div></div>' +
      '<div class="row" style="justify-content:center"><button class="btn primary lg" data-act="back">Back to board <span style="opacity:.7;font-size:13px">(Space)</span></button></div>' +
      scoreStrip() +
    '</div>';
  }

  function ddOverlay() {
    var t = team(S.control);
    var max = Math.max(t.score, S.round === 2 ? 1000 : 500);
    var min = Math.min(S.settings.minWager, max);
    return '<div class="dd"><div>' +
      '<h1>DAILY<br>DOUBLE</h1>' +
      '<p>' + esc(t.name) + (min >= max ? ' — wager is locked at ' + fmt(max) + ' points'
            : ' — wager anywhere from ' + fmt(min) + ' up to ' + fmt(max) + ' points') + '</p>' +
      '<div class="row" style="justify-content:center">' +
        '<input id="ddw" type="number" onfocus="this.select()" style="width:190px;text-align:center;font-size:26px;font-weight:900" value="' + min + '" min="' + min + '" max="' + max + '">' +
        '<button class="btn primary lg" data-act="ddgo">Lock it in</button>' +
      '</div>' +
      '<div class="hint" style="margin-top:16px;opacity:.85">' + esc(t.name) + ' can also enter this on their own device. No buzzing, no steal — this one is theirs alone.</div>' +
    '</div></div>';
  }

  function finalView() {
    var F = QB.final;
    if (S.phase === 'finalwager') {
      return '<div class="overlay"><div class="ovtop"><div class="ovcat">FINAL FACE-OFF</div><div class="spacer"></div>' +
        '<button class="btn sm ghost" data-act="close">Esc ✕</button></div>' +
        '<div class="qbox"><div><div style="font-size:13px;letter-spacing:.2em;opacity:.7">CATEGORY</div>' +
        '<div class="qtext">' + esc(F.category) + '</div>' +
        '<div class="hint" style="margin-top:18px">Every team wagers 0 up to their current score — on their own device.</div></div></div>' +
        '<div class="scores">' + S.teams.map(function (t) {
          var w = S.final.wagers[t.id];
          return '<div class="scard"><div class="bar" style="background:' + t.color + '"></div>' +
            '<div class="nm">' + esc(t.name) + '</div><div class="sc">' + fmt(t.score) + '</div>' +
            '<div class="mem">' + (w == null ? 'wagering…' : '✔ wager locked') + '</div></div>';
        }).join('') + '</div>' +
        '<div class="row" style="justify-content:center"><button class="btn primary lg" data-act="fq">Show the question →</button></div></div>';
    }
    if (S.phase === 'finalclue') {
      return '<div class="overlay"><div class="ovtop"><div class="ovcat">FINAL FACE-OFF · ' + esc(F.category) + '</div>' +
        '<div class="spacer"></div><div class="objtag">Obj ' + esc(F.obj) + '</div></div>' +
        '<div class="qbox"><div class="qtext">' + esc(F.q) + '</div></div>' +
        '<div class="row" style="justify-content:center">' + ringHTML() + '</div>' +
        '<div class="scores">' + S.teams.map(function (t) {
          return '<div class="scard"><div class="bar" style="background:' + t.color + '"></div>' +
            '<div class="nm">' + esc(t.name) + '</div>' +
            '<div class="mem">' + (S.final.answers[t.id] ? '✔ answer locked' : 'writing…') + '</div></div>';
        }).join('') + '</div></div>';
    }
    // finaljudge
    var t2 = S.teams[S.final.revealIdx];
    var ans = t2 ? S.final.answers[t2.id] : null;
    return '<div class="overlay"><div class="ovtop"><div class="ovcat">FINAL FACE-OFF · REVEAL ' + (S.final.revealIdx + 1) + ' of ' + S.teams.length + '</div></div>' +
      '<div class="qbox"><div style="width:min(900px,100%)">' +
        '<div style="font-size:19px;opacity:.7;margin-bottom:10px">' + esc(F.q) + '</div>' +
        '<div class="subans' + (ans ? '' : ' empty') + '" style="border-color:' + (t2 ? t2.color : '#fff') + '">' +
          '<div class="who">' + (t2 ? esc(t2.name) : '') + ' — wagered ' + fmt(S.final.wagers[t2 ? t2.id : ''] || 0) + '</div>' +
          '<div class="txt">' + (ans ? esc(ans.text) : 'No answer submitted') + '</div>' +
        '</div>' +
        '<div class="abox" style="margin-top:18px"><div class="lbl">Correct answer</div><div class="txt" style="font-size:19px;text-align:left">' + esc(F.a) + '</div></div>' +
      '</div></div>' +
      '<div class="row" style="justify-content:center">' +
        '<button class="btn good lg" data-act="fok">✓ Correct</button>' +
        '<button class="btn bad lg" data-act="fno">✕ Incorrect</button>' +
      '</div>' + scoreStrip() + '</div>';
  }

  function gameoverView() {
    var sorted = S.teams.slice().sort(function (a, b) { return b.score - a.score; });
    var top = sorted.slice(0, 3), rest = sorted.slice(3);
    var heights = [148, 116, 96];
    var order = [1, 0, 2];   // 2nd, 1st, 3rd — real podium layout
    return '<div class="wrap" style="text-align:center;padding-top:30px">' +
      '<h1 style="font-size:clamp(32px,5.5vw,58px);margin:0;color:var(--royal-yellow)">FINAL SCORES</h1>' +
      '<div class="podium">' + order.filter(function (i) { return top[i]; }).map(function (i) {
        var t = top[i];
        return '<div class="pod" style="background:' + t.color + '33;border-color:' + t.color + ';height:' + heights[i] + 'px">' +
          '<div class="rk">' + (i === 0 ? '🏆 Champion' : i === 1 ? '2nd' : '3rd') + '</div>' +
          '<div class="nm">' + esc(t.name) + '</div><div class="sc">' + fmt(t.score) + '</div></div>';
      }).join('') + '</div>' +
      (rest.length ? '<div style="max-width:520px;margin:26px auto 0;text-align:left">' + rest.map(function (t, n) {
        return '<div class="row" style="border-bottom:1px solid var(--line-soft);padding:9px 6px;gap:12px">' +
          '<span style="opacity:.55;width:26px">#' + (n + 4) + '</span>' +
          '<span style="width:12px;height:12px;border-radius:3px;background:' + t.color + '"></span>' +
          '<b style="flex:1">' + esc(t.name) + '</b>' +
          '<b style="color:var(--royal-yellow)">' + fmt(t.score) + '</b></div>';
      }).join('') + '</div>' : '') +
      '<div class="row" style="justify-content:center;margin-top:30px">' +
        '<button class="btn primary lg" data-act="new">New game</button>' +
        '<button class="btn lg" data-act="lobby">Back to join screen</button>' +
      '</div></div>';
  }

  function settingsModal() {
    return '<div class="modal"><div class="card">' +
      '<div class="row"><h2 style="margin:0;flex:1">Game settings</h2><button class="btn sm ghost" data-act="closeset">✕</button></div>' +
      '<div class="grid2" style="margin-top:16px">' +
        '<div><label class="fld">Number of teams</label><input id="setTeams" type="number" min="2" max="8" value="' + S.settings.teamCount + '"></div>' +
        '<div><label class="fld">Seconds to answer</label><input id="setSecs" type="number" min="5" max="120" value="' + S.settings.answerSecs + '"></div>' +
        '<div><label class="fld">Final Face-Off seconds</label><input id="setFinal" type="number" min="15" max="300" value="' + S.settings.finalSecs + '"></div>' +
        '<div><label class="fld">Minimum Daily Double wager</label><input id="setMin" type="number" min="0" step="100" value="' + S.settings.minWager + '"></div>' +
      '</div>' +
      '<div class="row" style="margin-top:16px">' +
        '<label><input type="checkbox" id="setDeduct"' + (S.settings.deduct ? ' checked' : '') + '> Deduct points for a wrong answer</label>' +
      '</div>' +
      '<div class="row" style="margin-top:8px">' +
        '<label><input type="checkbox" id="setSound"' + (S.settings.sound ? ' checked' : '') + '> Sound effects</label>' +
      '</div>' +
      '<div class="notice" style="margin-top:16px">33 students ÷ 5 per team = <b>7 teams</b>. Changing the team count keeps existing teams and their rosters.</div>' +
      '<div class="row" style="margin-top:18px"><button class="btn primary" data-act="saveset">Save</button></div>' +
    '</div></div>';
  }

  function _render() {
    var body;
    if (S.phase === 'lobby') body = topbar() + lobbyView();
    else if (S.phase === 'gameover') body = topbar() + gameoverView();
    else if (S.phase.indexOf('final') === 0) body = topbar() + boardView() + finalView();
    else if (S.phase === 'ddwager') body = topbar() + boardView() + ddOverlay();
    else if (S.phase === 'reveal') body = topbar() + boardView() + revealOverlay();
    else if (S.active) body = topbar() + boardView() + clueOverlay();
    else body = topbar() + boardView();
    if (S.settingsOpen) body += settingsModal();
    app.innerHTML = '<div class="host">' + body + '</div>';
    if (S.phase === 'lobby') {
      var q = $('#qr');
      if (q && window.QR) QR.render(q, location.origin + location.pathname + '#/play/' + S.room, 230, '#ffffff', '#0f1f4d');
    }
    paintTimer();
  }

  /* ---------- events ---------- */
  function onClick(e) {
    var el;
    if ((el = e.target.closest('[data-clue]'))) {
      var p = el.getAttribute('data-clue').split(','); openClue(+p[0], +p[1]); return;
    }
    if ((el = e.target.closest('[data-adj]'))) {
      e.stopPropagation();
      var t = team(el.getAttribute('data-adj')); t.score += parseInt(el.getAttribute('data-d'), 10); sync(); return;
    }
    if ((el = e.target.closest('[data-ctl]'))) {
      S.control = el.getAttribute('data-ctl'); sync();
      flash(team(S.control).name + ' has board control'); return;
    }
    el = e.target.closest('[data-act]'); if (!el) return;
    var a = el.getAttribute('data-act');
    switch (a) {
      case 'lobby':   S.phase = 'lobby'; sync(); break;
      case 'start':   S.phase = 'board'; sync(); break;
      case 'settings':S.settingsOpen = true; render(); break;
      case 'closeset':S.settingsOpen = false; render(); break;
      case 'saveset':
        S.settings.teamCount = Math.max(2, Math.min(8, parseInt($('#setTeams').value, 10) || 7));
        S.settings.answerSecs = Math.max(5, parseInt($('#setSecs').value, 10) || 15);
        S.settings.finalSecs = Math.max(15, parseInt($('#setFinal').value, 10) || 60);
        S.settings.minWager = Math.max(0, parseInt($('#setMin').value, 10) || 0);
        S.settings.deduct = $('#setDeduct').checked;
        S.settings.sound = $('#setSound').checked; Snd.on = S.settings.sound;
        makeTeams(S.settings.teamCount); persist(); S.settingsOpen = false; sync(); break;
      case 'full':
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
        break;
      case 'copy':
        var u = location.origin + location.pathname + '#/play/' + S.room;
        (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject())
          .then(function () { flash('Join link copied', 'good'); }, function () { prompt('Copy this link:', u); });
        break;
      case 'newcode': location.reload(); break;
      case 'demo':    demoTeams(); break;
      case 'ok':      judge(true); break;
      case 'no':      judge(false); break;
      case 'show':    revealNow(); break;
      case 'back':    backToBoard(); break;
      case 'close':   backToBoard(); break;
      case 'ddgo':    doWager(S.control, $('#ddw').value); break;
      case 'r1':      gotoRound(1); break;
      case 'r2':      gotoRound(2); break;
      case 'final':   startFinal(); break;
      case 'fq':      finalShowQ(); break;
      case 'fok':     finalJudge(true); break;
      case 'fno':     finalJudge(false); break;
      case 'new':     newGame(); break;
    }
  }
  function onKey(e) {
    if (/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= S.teams.length && S.phase === 'clue') { doBuzz(S.teams[n - 1].id); e.preventDefault(); return; }
    if (['answering', 'judge', 'ddclue', 'ddjudge'].indexOf(S.phase) >= 0) {
      if (e.key === 'y' || e.key === 'Y') { judge(true); e.preventDefault(); return; }
      if (e.key === 'n' || e.key === 'N') { judge(false); e.preventDefault(); return; }
    }
    if (S.phase.indexOf('finaljudge') === 0) {
      if (e.key === 'y' || e.key === 'Y') { finalJudge(true); return; }
      if (e.key === 'n' || e.key === 'N') { finalJudge(false); return; }
    }
    if (e.key === ' ') {
      if (S.phase === 'reveal') { backToBoard(); e.preventDefault(); }
      else if (S.phase === 'clue' || S.phase === 'answering' || S.phase === 'judge') { revealNow(); e.preventDefault(); }
    }
    if (e.key === 'Escape' && S.active) backToBoard();
  }
  app.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);

  T.hostInit(onAction).then(sync, function (err) {
    flash('Connection error — see console', 'bad'); console.error(err); render();
  });
  sync();
  window.__FO_HOST = S;   // exposed for automated testing

  return function () {
    app.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKey);
    if (tickHandle) clearInterval(tickHandle);
  };
}

/* ================================================================== */
/* PLAYER                                                              */
/* ================================================================== */
function Player(code, seat) {
  if (!code) return CodeEntry();

  /* seat lets ONE machine drive more than one player (testing, shared laptop):
     #/play/ABCD/2 is a separate identity from #/play/ABCD/1 */
  var KEY = 'fo:me:' + code + (seat ? ':' + seat : '');
  var me = ssGet(KEY, null) || { memberId: uid(), teamId: null, name: '' };
  ssSet(KEY, me);

  var T = makeTransport(code);
  var P = null;                    // published state
  var timer = { running: false, endsAt: 0, total: 0, offset: 0 };
  var draft = { answer: '', tname: '', wager: '', myname: '' };
  var tickHandle = null;

  /* my team = the team I am actually a MEMBER of (not merely one I tapped) */
  function myTeam() {
    if (!P) return null;
    return P.teams.filter(function (t) {
      return (t.members || []).some(function (m) { return m.id === me.memberId; });
    })[0] || null;
  }
  function amCaptain() { var t = myTeam(); return t && (!t.captain || t.captain === me.memberId); }
  function send(a) { a.memberId = me.memberId; T.send(a); }
  function left() {
    if (!timer.running) return 0;
    return Math.max(0, timer.endsAt - (Date.now() + timer.offset));
  }

  function onPub(p) { P = p; render(); }
  function onTimer(t) {
    timer.running = t.running;
    timer.endsAt = t.endsAt;
    timer.total = t.total;
    timer.offset = (t.hostNow || Date.now()) - Date.now();
    paint();
  }
  function paint() {
    var bar = $('#tbar'); if (!bar) return;
    var frac = timer.total ? left() / (timer.total * 1000) : 0;
    $('i', bar).style.width = (frac * 100) + '%';
    bar.className = 'tbar' + (frac <= .25 ? ' crit' : frac <= .5 ? ' warn' : '');
    var s = $('#tsecs'); if (s) s.textContent = Math.ceil(left() / 1000) + 's';
  }

  /* ---------- views ---------- */
  function header() {
    var t = myTeam();
    if (!t) return '';
    return '<div class="phead"><div class="bar" style="background:' + t.color + '"></div>' +
      '<div><div class="nm">' + esc(t.name) + '</div><div class="me">' + esc(me.name || 'you') + (amCaptain() ? ' ★ captain' : '') + '</div></div>' +
      '<div class="sc">' + fmt(t.score) + '</div></div>';
  }

  function joinView() {
    return '<div class="card"><h2 style="margin:0 0 4px">Join the game</h2>' +
      '<div class="hint" style="margin-bottom:16px">Room <b class="mono">' + esc(code) + '</b> — pick the team your instructor assigned you to.</div>' +
      '<label class="fld">Your name</label>' +
      '<input id="myname" type="text" maxlength="18" placeholder="First name + last initial" value="' + esc(draft.myname || me.name) + '">' +
      '<label class="fld" style="margin-top:16px">Your team</label>' +
      '<div class="slots">' + P.teams.map(function (t) {
        var full = t.members.length >= 5 && !t.members.some(function (m) { return m.id === me.memberId; });
        return '<button class="slot' + (me.teamId === t.id ? ' sel' : '') + '" data-team="' + t.id + '"' + (full ? ' disabled' : '') + '>' +
          '<div class="bar" style="background:' + t.color + '"></div>' +
          '<div class="n">' + esc(t.name) + '</div>' +
          '<div class="c">' + t.members.length + '/5' + (full ? ' · FULL' : '') + '</div></button>';
      }).join('') + '</div>' +
      '<button class="btn primary lg" data-act="join" style="width:100%;margin-top:18px">Join team</button></div>';
  }

  function lobbyView() {
    var t = myTeam();
    var takenColors = P.teams.filter(function (x) { return x.id !== t.id; }).map(function (x) { return x.colorId; });
    return header() +
      '<div class="card">' +
        (amCaptain()
          ? '<h3 style="margin:0 0 4px">You\'re the captain ★</h3><div class="hint" style="margin-bottom:14px">Pick your team name and color. Everyone else on your team just adds their name.</div>' +
            '<label class="fld">Team name</label>' +
            '<div class="row"><input id="tname" type="text" maxlength="26" onfocus="this.select()" placeholder="e.g. PACKET PIRATES" value="' + esc(draft.tname || t.name) + '">' +
            '<button class="btn" data-act="setname">Set</button></div>' +
            '<label class="fld" style="margin-top:16px">Team color</label>' +
            '<div class="swatches">' + COLORS.map(function (c) {
              var taken = takenColors.indexOf(c.id) >= 0;
              return '<button class="sw' + (t.colorId === c.id ? ' sel' : '') + '" style="background:' + c.hex + '" ' +
                'data-color="' + c.id + '"' + (taken ? ' disabled' : '') + ' title="' + c.name + (taken ? ' — taken by another team' : '') + '">' +
                (taken ? '<span class="swx">✕</span>' : '') + '</button>';
            }).join('') + '</div>'
          : '<h3 style="margin:0 0 4px">You\'re on ' + esc(t.name) + '</h3><div class="hint">Your captain is setting the team name and color.</div>') +
        '<label class="fld" style="margin-top:18px">Squad (' + t.members.length + '/5)</label>' +
        '<div class="roster">' + t.members.map(function (m) {
          return '<span class="rchip' + (m.id === t.captain ? ' cap' : '') + '">' + esc(m.name) + '</span>';
        }).join('') + '</div>' +
      '</div>' +
      '<div class="card" style="text-align:center"><div style="font-size:15px;opacity:.85">Waiting for your instructor to start…</div>' +
      '<div class="hint" style="margin-top:8px">Keep this page open. Your buzzer appears here.</div></div>' +
      '<button class="btn ghost sm" data-act="leave" style="align-self:center">Leave team</button>';
  }

  function questionCard() {
    if (!P.q) return '';
    return '<div class="pq"><div class="cat"><span class="val">' + fmt(P.q.value) + '</span>' + esc(P.q.cat) + (P.q.dd ? ' · DAILY DOUBLE' : '') + '</div>' +
      '<div class="txt">' + esc(P.q.text) + '</div></div>';
  }
  function timerBar() {
    return '<div class="row"><div class="tbar" id="tbar" style="flex:1"><i style="width:100%"></i></div>' +
      '<b id="tsecs" style="width:44px;text-align:right">' + Math.ceil(left() / 1000) + 's</b></div>';
  }

  function playView() {
    var t = myTeam(), ph = P.phase;
    var iAmCurrent = P.current === t.id;
    var iAmLocked = (P.lockedOut || []).indexOf(t.id) >= 0;
    var iBuzzed = (P.buzzOrder || []).indexOf(t.id) >= 0;
    var pos = (P.buzzOrder || []).indexOf(t.id);
    var body = '', status = '';

    /* daily double — control team only */
    if (ph === 'ddwager') {
      if (P.ddTeam === t.id) {
        var max = Math.max(t.score, P.roundMax || 500);
        var min = Math.min(P.minWager || 0, max);
        body = '<div class="card" style="text-align:center;background:linear-gradient(135deg,rgba(109,40,217,.5),rgba(185,28,28,.5))">' +
          '<h2 style="margin:0 0 6px;font-size:30px">DAILY DOUBLE</h2>' +
          '<div class="hint" style="margin-bottom:14px">' + (min >= max ? 'Your wager is locked at ' + fmt(max) + '.'
              : 'Wager anywhere from ' + fmt(min) + ' up to ' + fmt(max) + '.') + ' No steal — this one is yours alone.</div>' +
          '<input id="wager" type="number" onfocus="this.select()" style="text-align:center;font-size:28px;font-weight:900" min="' + min + '" max="' + max + '" value="' + (draft.wager || min) + '">' +
          '<button class="btn primary lg" data-act="wager" style="width:100%;margin-top:12px">Lock in wager</button></div>';
      } else {
        body = '<div class="card" style="text-align:center"><h2 style="margin:0">DAILY DOUBLE</h2>' +
          '<div class="hint" style="margin-top:8px">' + esc((P.teams.filter(function (x) { return x.id === P.ddTeam; })[0] || {}).name || '') +
          ' found it. Sit tight — no steal on this one.</div></div>';
      }
      return header() + body;
    }

    if (ph === 'ddclue' || ph === 'ddjudge') {
      if (P.ddTeam === t.id) {
        body = questionCard() + (ph === 'ddclue' ? timerBar() : '') +
          '<textarea id="ans" rows="3" placeholder="Type your team\'s answer…"' + (ph !== 'ddclue' ? ' disabled' : '') + '>' + esc(draft.answer) + '</textarea>' +
          '<button class="btn primary lg" data-act="answer" style="width:100%"' + (ph !== 'ddclue' ? ' disabled' : '') + '>Submit answer</button>';
        status = ph === 'ddjudge' ? 'Locked in — waiting on your instructor.' : 'Your Daily Double. Talk it out, then submit.';
      } else {
        body = '<div class="card" style="text-align:center"><div style="font-size:16px">Daily Double in progress…</div></div>';
      }
      return header() + body + '<div class="statusline">' + status + '</div>';
    }

    /* final face-off */
    if (ph === 'finalwager') {
      var maxF = Math.max(t.score, 0);
      var done = P.final && P.final.wagers && P.final.wagers[t.id];
      body = '<div class="card"><h2 style="margin:0 0 4px">FINAL FACE-OFF</h2>' +
        '<div class="hint">Category: <b>' + esc(P.final.cat) + '</b></div>' +
        '<label class="fld" style="margin-top:16px">Your wager (0 – ' + fmt(maxF) + ')</label>' +
        (done ? '<div style="font-size:26px;font-weight:900;color:var(--royal-yellow)">✔ Wager locked</div>'
              : '<input id="wager" type="number" onfocus="this.select()" min="0" max="' + maxF + '" value="' + (draft.wager || 0) + '" style="text-align:center;font-size:26px;font-weight:900">' +
                '<button class="btn primary lg" data-act="finalwager" style="width:100%;margin-top:12px">Lock in wager</button>') +
        (maxF <= 0 ? '<div class="hint" style="margin-top:10px">You\'re at or below zero, so your wager is 0.</div>' : '') +
      '</div>';
      return header() + body;
    }
    if (ph === 'finalclue' || ph === 'finaljudge') {
      var doneF = P.final && P.final.answeredF && P.final.answeredF[t.id];
      body = '<div class="pq"><div class="cat">FINAL · ' + esc(P.final.cat) + '</div><div class="txt">' + esc(P.final.text || '') + '</div></div>' +
        (ph === 'finalclue' ? timerBar() : '') +
        '<textarea id="ans" rows="5" placeholder="Type your team\'s final answer…"' + (ph !== 'finalclue' || doneF ? ' disabled' : '') + '>' + esc(draft.answer) + '</textarea>' +
        '<button class="btn primary lg" data-act="finalanswer" style="width:100%"' + (ph !== 'finalclue' || doneF ? ' disabled' : '') + '>' + (doneF ? '✔ Locked in' : 'Lock in answer') + '</button>';
      return header() + body;
    }

    if (ph === 'gameover') {
      var rank = P.teams.slice().sort(function (a, b) { return b.score - a.score; })
        .findIndex(function (x) { return x.id === t.id; }) + 1;
      return header() + '<div class="card" style="text-align:center">' +
        '<h2 style="margin:0">' + (rank === 1 ? '🏆 CHAMPIONS' : 'Finished #' + rank) + '</h2>' +
        '<div style="font-size:44px;font-weight:900;color:var(--royal-yellow);margin-top:10px">' + fmt(t.score) + '</div></div>';
    }

    /* board / clue / answering / judge / reveal */
    if (ph === 'board' || ph === 'lobby') {
      var ctl = P.control === t.id;
      body = '<div class="card" style="text-align:center"><div style="font-size:17px;font-weight:750">' +
        (ctl ? 'Your team picks the next clue' : 'Watch the big screen') + '</div>' +
        '<div class="hint" style="margin-top:8px">' + (ctl ? 'Call out a category and a point value.' : 'Your buzzer wakes up when the next question goes live.') + '</div></div>';
      return header() + body;
    }

    if (ph === 'reveal') {
      body = questionCard() +
        '<div class="card" style="border-color:var(--royal-green);background:rgba(21,128,61,.2);text-align:center">' +
        '<div class="hint" style="letter-spacing:.16em;text-transform:uppercase">Answer</div>' +
        '<div style="font-size:20px;font-weight:800;margin-top:6px">' + esc((P.reveal && P.reveal.a) || '') + '</div></div>';
      return header() + body;
    }

    /* clue / answering / judge */
    var canBuzz = ph === 'clue' && !iAmLocked && !iBuzzed;
    var label, cls = 'buzz';
    if (iAmCurrent && (ph === 'answering' || ph === 'judge')) { label = 'YOU\'RE UP'; cls += ' mine'; }
    else if (iAmLocked) label = 'LOCKED OUT — this one\'s gone';
    else if (iBuzzed && ph === 'clue') label = 'BUZZED IN · #' + (pos + 1) + ' in line';
    else if (ph === 'clue') label = 'BUZZ';
    else label = 'ANOTHER TEAM HAS IT';

    body = questionCard() +
      '<button class="' + cls + '" data-act="buzz"' + (canBuzz ? '' : ' disabled') + '>' + label + '</button>';

    if (iAmCurrent && ph === 'answering') {
      body += timerBar() +
        '<textarea id="ans" rows="3" placeholder="Type your team\'s answer…">' + esc(draft.answer) + '</textarea>' +
        '<button class="btn primary lg" data-act="answer" style="width:100%">Submit answer</button>';
      status = 'Anyone on your team can type. Talk fast.';
    } else if (iAmCurrent && ph === 'judge') {
      status = 'Locked in — your instructor is judging.';
    } else if (ph === 'clue' && (P.buzzOrder || []).length) {
      var f = P.teams.filter(function (x) { return x.id === P.buzzOrder[0]; })[0];
      status = (f ? f.name : 'Another team') + ' buzzed first.';
    } else if (ph === 'clue') {
      status = iAmLocked ? 'You already had your shot on this one.' : 'Buzz when your team knows it.';
    }
    return header() + body + '<div class="statusline">' + status + '</div>';
  }

  function render() { withFocus(_render); }
  function _render() {
    if (!P) {
      app.innerHTML = '<div class="play"><div class="card" style="text-align:center">' +
        '<div class="brand" style="justify-content:center"><div class="mark">⚔</div><div><div class="t1">FACE-OFF</div><div class="t2">A+ CORE 2</div></div></div>' +
        '<h3 style="margin:18px 0 6px">Looking for room <span class="mono">' + esc(code) + '</span>…</h3>' +
        '<div class="hint">Make sure your instructor has the host screen open.' +
        (liveMode() ? '' : '<br><br><b>Local mode:</b> this join link only works in another tab on the host computer.') + '</div>' +
        '<button class="btn sm ghost" data-act="recode" style="margin-top:14px">Enter a different code</button></div></div>';
      return;
    }
    var inner = myTeam() ? (P.phase === 'lobby' ? lobbyView() : playView()) : joinView();
    app.innerHTML = '<div class="play">' + inner + '</div>';
    paint();
  }

  function onClick(e) {
    var el;
    if ((el = e.target.closest('[data-team]'))) {
      me.teamId = el.getAttribute('data-team'); ssSet(KEY, me); render(); return;
    }
    if ((el = e.target.closest('[data-color]'))) {
      var mt = myTeam(); if (!mt) return;
      send({ type: 'teamcolor', teamId: mt.id, colorId: el.getAttribute('data-color') }); return;
    }
    el = e.target.closest('[data-act]'); if (!el) return;
    var a = el.getAttribute('data-act'), t = myTeam();
    switch (a) {
      case 'recode': location.hash = '#/play'; break;
      case 'join':
        var nm = (($('#myname') && $('#myname').value) || draft.myname || '').trim();
        if (!nm) { flash('Enter your name first', 'bad'); return; }
        if (!me.teamId) { flash('Pick your team', 'bad'); return; }
        me.name = nm.slice(0, 18); ssSet(KEY, me);
        send({ type: 'join', teamId: me.teamId, name: me.name });
        Snd.ac(); break;
      case 'leave':
        send({ type: 'leave', teamId: t ? t.id : me.teamId }); me.teamId = null; ssSet(KEY, me); render(); break;
      case 'setname':
        draft.tname = $('#tname').value;
        send({ type: 'teamname', teamId: t.id, name: draft.tname }); flash('Team name set', 'good'); break;
      case 'buzz':
        send({ type: 'buzz', teamId: t.id }); Snd.buzz();
        el.disabled = true; el.textContent = 'BUZZED!'; break;
      case 'answer':
        draft.answer = $('#ans').value;
        send({ type: 'answer', teamId: t.id, text: draft.answer, by: me.name });
        draft.answer = ''; break;
      case 'wager':
        draft.wager = $('#wager').value;
        send({ type: 'wager', teamId: t.id, amount: draft.wager }); break;
      case 'finalwager':
        draft.wager = $('#wager').value;
        send({ type: 'finalwager', teamId: t.id, amount: draft.wager }); break;
      case 'finalanswer':
        draft.answer = $('#ans').value;
        send({ type: 'finalanswer', teamId: t.id, text: draft.answer, by: me.name }); break;
    }
  }
  app.addEventListener('click', onClick);
  app.addEventListener('input', function (e) {
    if (e.target.id === 'ans') draft.answer = e.target.value;
    if (e.target.id === 'myname') draft.myname = e.target.value;
    if (e.target.id === 'tname') draft.tname = e.target.value;
    if (e.target.id === 'wager') draft.wager = e.target.value;
  });

  render();
  T.playerInit(onPub, onTimer);
  tickHandle = setInterval(paint, 100);
  window.__FO_PLAYER = { send: send, me: me, get pub() { return P; } };

  return function () { app.removeEventListener('click', onClick); if (tickHandle) clearInterval(tickHandle); };
}

function CodeEntry() {
  app.innerHTML = '<div class="launch"><div class="launch-inner" style="max-width:440px">' +
    '<div class="brand" style="justify-content:center"><div class="mark">⚔</div><div><div class="t1">FACE-OFF</div><div class="t2">A+ CORE 2</div></div></div>' +
    '<h1 style="font-size:44px">JOIN</h1>' +
    '<div class="card" style="text-align:left">' +
      '<label class="fld">Room code</label>' +
      '<input id="code" type="text" maxlength="4" placeholder="ABCD" style="text-transform:uppercase;text-align:center;font-size:34px;font-weight:900;letter-spacing:.3em">' +
      '<button class="btn primary lg" data-act="go" style="width:100%;margin-top:14px">Enter</button>' +
      '<div class="hint" style="margin-top:12px">Your instructor has the code on the big screen — or just scan the QR.</div>' +
    '</div></div></div>';
  app.onclick = function (e) {
    if (!e.target.closest('[data-act=go]')) return;
    var v = ($('#code').value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (v.length !== 4) { flash('4 letters, like ABCD', 'bad'); return; }
    location.hash = '#/play/' + v;
  };
  app.onkeydown = function (e) { if (e.key === 'Enter') { var b = $('[data-act=go]'); b && b.click(); } };
  return null;
}

/* boot */
route();
})();
