/* Twin Peeks — game flow: title, levels, timer, scoring, hints, win and lose.
   One state object drives the HUD; a requestAnimationFrame loop keeps the
   timer honest and animates the rings. Screenshot presets (?shot=cover,
   ?shot=complete, ?shot=hint) set the game up in a fixed state so the
   maker's screenshots are reproducible. */
(function () {
  'use strict';

  var Draw = window.TwinPeeksDraw;
  var Input = window.TwinPeeksInput;
  var UI = window.TwinPeeksUI;
  var SoundFX = window.SoundFX;
  var SCENES = window.SCENES;

  var DIFFICULTIES = {
    relaxed: { label: 'Relaxed', timeLimit: null, hints: 3, radiusScale: 1.15, wrongSeconds: 0, wrongPoints: 0 },
    classic: { label: 'Classic', timeLimit: 120, hints: 3, radiusScale: 1.0, wrongSeconds: 5, wrongPoints: 25 },
    rush: { label: 'Rush', timeLimit: 75, hints: 2, radiusScale: 0.9, wrongSeconds: 5, wrongPoints: 25 },
  };

  var BEST_KEY = 'twinpeeks.best';

  var state = {
    screen: 'title',
    difficulty: 'classic',
    levelIndex: 0,
    found: new Set(),
    foundAt: {}, // key -> timestamp (ms) the ring popped in
    wrongMarks: [], // {x, y, at, panel}
    hint: null, // {diff, until}
    hintsLeft: 3,
    hintsUsed: 0,
    score: 0,
    totalScore: 0,
    lastLevelScore: 0, // the score the last completed level added, so Replay can take it back
    timeLeft: null,
    timeLimit: null,
    combo: 0,
    lastFindAt: 0,
    paused: false,
    done: new Set(),
    unlocked: 1,
    best: 0,
    helpReturn: 'title',
    lastTickSecond: -1,
  };

  var leftCanvas = document.getElementById('panel-left');
  var rightCanvas = document.getElementById('panel-right');
  var lastFrameAt = 0;

  /* ---------- persistence ---------- */
  function loadBest() {
    try {
      var raw = window.localStorage.getItem(BEST_KEY);
      state.best = raw ? parseInt(raw, 10) || 0 : 0;
    } catch (e) { state.best = 0; }
  }
  function saveBest() {
    try { window.localStorage.setItem(BEST_KEY, String(state.best)); } catch (e) { /* storage unavailable */ }
  }

  /* ---------- rendering ---------- */
  function redraw(now) {
    var scene = SCENES[state.levelIndex];
    Draw.drawBoth(leftCanvas, rightCanvas, scene);
    // Found rings, on both panels.
    for (var i = 0; i < scene.diffs.length; i++) {
      var diff = scene.diffs[i];
      if (!state.found.has(diff.key)) continue;
      var progress = Math.min(1, (now - state.foundAt[diff.key]) / 400);
      Draw.drawFoundRing(leftCanvas, diff, progress);
      Draw.drawFoundRing(rightCanvas, diff, progress);
    }
    // Wrong-click crosses, fading out.
    state.wrongMarks = state.wrongMarks.filter(function (m) { return now - m.at < 600; });
    for (var j = 0; j < state.wrongMarks.length; j++) {
      var mark = state.wrongMarks[j];
      var alpha = 1 - (now - mark.at) / 600;
      Draw.drawWrongMark(mark.panel === 'right' ? rightCanvas : leftCanvas, mark.x, mark.y, alpha);
    }
    // The hint pulse, while it lasts.
    if (state.hint && now < state.hint.until) {
      var phase = (now - (state.hint.until - 4000)) / 1000;
      Draw.drawHintRing(leftCanvas, state.hint.diff, phase);
      Draw.drawHintRing(rightCanvas, state.hint.diff, phase);
    } else if (state.hint) {
      state.hint = null;
    }
  }

  function animationsActive(now) {
    if (state.hint) return true;
    if (state.wrongMarks.length) return true;
    var scene = SCENES[state.levelIndex];
    for (var i = 0; i < scene.diffs.length; i++) {
      var diff = scene.diffs[i];
      if (state.found.has(diff.key) && now - state.foundAt[diff.key] < 400) return true;
    }
    return false;
  }

  function frame(now) {
    if (!lastFrameAt) lastFrameAt = now;
    var dt = Math.min(0.1, (now - lastFrameAt) / 1000);
    lastFrameAt = now;
    if (state.screen === 'play' && !state.paused) {
      if (state.timeLimit !== null) {
        state.timeLeft -= dt;
        var whole = Math.ceil(state.timeLeft);
        if (state.timeLeft <= 10.5 && whole !== state.lastTickSecond && state.timeLeft > 0) {
          state.lastTickSecond = whole;
          SoundFX.tick();
        }
        if (state.timeLeft <= 0) {
          state.timeLeft = 0;
          timeUp();
        }
      }
      pushHud();
    }
    if (state.screen === 'play' && animationsActive(now)) redraw(now);
    window.requestAnimationFrame(frame);
  }

  function pushHud() {
    UI.setHud({
      levelIndex: state.levelIndex,
      levelCount: SCENES.length,
      found: state.found.size,
      total: SCENES[state.levelIndex].diffs.length,
      score: state.totalScore + state.score,
      best: Math.max(state.best, state.totalScore + state.score),
      timeLeft: state.timeLeft,
      timeLimit: state.timeLimit,
      hintsLeft: state.hintsLeft,
    });
  }

  /* ---------- level flow ---------- */
  function startLevel(index) {
    var diff = DIFFICULTIES[state.difficulty];
    state.levelIndex = index;
    state.found = new Set();
    state.foundAt = {};
    state.wrongMarks = [];
    state.hint = null;
    state.hintsLeft = diff.hints;
    state.hintsUsed = 0;
    state.score = 0;
    state.timeLimit = diff.timeLimit;
    state.timeLeft = diff.timeLimit;
    state.combo = 0;
    state.lastFindAt = 0;
    state.paused = false;
    state.lastTickSecond = -1;
    state.screen = 'play';
    UI.setSceneHead(SCENES[index]);
    UI.setMessage('Find 7 differences — click one on either picture.');
    UI.showCombo(0);
    UI.setProgressDots(SCENES.length, index, state.done);
    UI.showScreen('screen-play');
    redraw(performance.now());
    pushHud();
  }

  function quitToTitle() {
    state.screen = 'title';
    state.paused = false;
    UI.buildLevelSelect(SCENES, state.unlocked, state.done, function (index) {
      SoundFX.click();
      startLevel(index);
    });
    UI.showScreen('screen-title');
  }

  function levelComplete() {
    var scene = SCENES[state.levelIndex];
    var timeBonus = state.timeLeft !== null ? Math.ceil(state.timeLeft) * 5 : 0;
    var levelScore = state.score + timeBonus;
    state.totalScore += levelScore;
    state.lastLevelScore = levelScore;
    state.score = 0; // banked into the total; the HUD must not count it twice
    state.done.add(state.levelIndex);
    UI.setProgressDots(SCENES.length, state.levelIndex, state.done);
    state.unlocked = Math.min(SCENES.length, Math.max(state.unlocked, state.levelIndex + 2));
    var stars = 3;
    if (state.hintsUsed > 1) stars = 1;
    else if (state.hintsUsed === 1) stars = 2;
    else if (state.timeLimit !== null && state.timeLeft < state.timeLimit * 0.4) stars = 2;
    if (state.totalScore > state.best) {
      state.best = state.totalScore;
      saveBest();
    }
    SoundFX.win();
    state.screen = 'complete';
    UI.showComplete(scene, scene.diffs.length, timeBonus, levelScore, state.totalScore, stars);
    pushHud();
  }

  function timeUp() {
    state.screen = 'timeup';
    SoundFX.lose();
    UI.showTimeUp(state.found.size, SCENES[state.levelIndex].diffs.length);
  }

  function campaignComplete() {
    state.screen = 'campaign';
    var isNewBest = state.totalScore >= state.best && state.totalScore > 0;
    if (state.totalScore > state.best) {
      state.best = state.totalScore;
      saveBest();
    }
    SoundFX.campaign();
    UI.showCampaign(state.totalScore, state.best, isNewBest);
  }

  /* ---------- clicks, hints, keys ---------- */
  function onPanelClick(point, canvas) {
    if (state.screen !== 'play' || state.paused) return;
    var now = performance.now();
    var scene = SCENES[state.levelIndex];
    var diff = Input.hitTest(scene, state.found, point, DIFFICULTIES[state.difficulty].radiusScale);
    if (diff) {
      state.found.add(diff.key);
      state.foundAt[diff.key] = now;
      if (now - state.lastFindAt < 6000) state.combo += 1;
      else state.combo = 1;
      state.lastFindAt = now;
      var bonus = state.combo >= 2 ? 25 * (state.combo - 1) : 0;
      state.score += 100 + bonus;
      SoundFX.found(state.combo);
      UI.showCombo(state.combo);
      UI.setMessage('Found: ' + diff.label + (bonus ? '  (+' + bonus + ' streak bonus)' : '') +
        ' — ' + (scene.diffs.length - state.found.size) + ' to go.');
      redraw(now);
      pushHud();
      if (state.found.size === scene.diffs.length) {
        window.setTimeout(function () {
          if (state.screen === 'play') levelComplete();
        }, 650);
      }
    } else {
      var cfg = DIFFICULTIES[state.difficulty];
      state.wrongMarks.push({ x: point.x, y: point.y, at: now, panel: canvas === rightCanvas ? 'right' : 'left' });
      state.combo = 0;
      UI.showCombo(0);
      if (cfg.wrongSeconds && state.timeLeft !== null) state.timeLeft = Math.max(0, state.timeLeft - cfg.wrongSeconds);
      if (cfg.wrongPoints) state.score = Math.max(0, state.score - cfg.wrongPoints);
      SoundFX.wrong();
      UI.setMessage('Not quite — that spot matches. ' +
        (cfg.wrongSeconds ? '−' + cfg.wrongSeconds + 's, −' + cfg.wrongPoints + ' points.' : 'Look closer and try again.'));
      redraw(now);
      pushHud();
    }
  }

  function useHint() {
    if (state.screen !== 'play' || state.paused) return;
    if (state.hintsLeft <= 0) {
      UI.setMessage('No hints left on this level.');
      return;
    }
    var scene = SCENES[state.levelIndex];
    var remaining = scene.diffs.filter(function (d) { return !state.found.has(d.key); });
    if (!remaining.length) return;
    var pick = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintsLeft -= 1;
    state.hintsUsed += 1;
    state.score = Math.max(0, state.score - 50);
    state.hint = { diff: pick, until: performance.now() + 4000 };
    SoundFX.hint();
    UI.setMessage('Hint: look inside the blue ring. (−50 points)');
    pushHud();
  }

  function toggleMute() {
    SoundFX.setMuted(!SoundFX.muted);
    document.getElementById('btn-sound').textContent = SoundFX.muted ? 'Sound: Off' : 'Sound: On';
  }

  function togglePause() {
    if (state.screen === 'play' && !state.paused) {
      state.paused = true;
      UI.showScreen('screen-pause');
    } else if (state.screen === 'play' && state.paused) {
      state.paused = false;
      UI.showScreen('screen-play');
    }
  }

  /* ---------- screenshot presets ---------- */
  function applyShotPreset(shot) {
    if (shot === 'cover') {
      startLevel(0);
      var scene = SCENES[0];
      var now = performance.now();
      for (var i = 0; i < 3; i++) {
        state.found.add(scene.diffs[i].key);
        state.foundAt[scene.diffs[i].key] = now - 1000; // rings fully drawn
      }
      state.score = 325;
      state.timeLeft = 87;
      UI.setMessage('Found: ' + scene.diffs[2].label + ' — 4 to go.');
      redraw(now);
      pushHud();
    } else if (shot === 'complete') {
      startLevel(0);
      var s0 = SCENES[0];
      for (var j = 0; j < s0.diffs.length; j++) {
        state.found.add(s0.diffs[j].key);
        state.foundAt[s0.diffs[j].key] = performance.now() - 1000;
      }
      state.score = 700;
      state.timeLeft = 87;
      levelComplete();
    } else if (shot === 'hint') {
      startLevel(1);
      var s1 = SCENES[1];
      state.found.add(s1.diffs[0].key);
      state.foundAt[s1.diffs[0].key] = performance.now() - 1000;
      state.score = 100;
      state.timeLeft = 104;
      state.hint = { diff: s1.diffs[1], until: performance.now() + 3600000 };
      state.hintsLeft = 2;
      UI.setMessage('Hint: look inside the blue ring. (−50 points)');
      redraw(performance.now());
      pushHud();
    }
    // 'select' and anything else: stay on the title screen.
  }

  /* ---------- wiring ---------- */
  function init() {
    loadBest();
    UI.buildLevelSelect(SCENES, state.unlocked, state.done, function (index) {
      SoundFX.click();
      startLevel(index);
    });

    var diffButtons = document.querySelectorAll('.diff-btn');
    for (var i = 0; i < diffButtons.length; i++) {
      diffButtons[i].addEventListener('click', function () {
        SoundFX.click();
        for (var j = 0; j < diffButtons.length; j++) diffButtons[j].classList.remove('selected');
        this.classList.add('selected');
        state.difficulty = this.getAttribute('data-diff');
      });
    }

    document.getElementById('btn-play').addEventListener('click', function () {
      SoundFX.click();
      state.totalScore = 0;
      startLevel(0);
    });
    document.getElementById('btn-sound').addEventListener('click', toggleMute);
    document.getElementById('btn-help').addEventListener('click', function () {
      state.helpReturn = state.screen === 'play' ? 'play' : 'title';
      SoundFX.click();
      UI.showScreen('screen-help');
    });
    document.getElementById('btn-help-close').addEventListener('click', function () {
      SoundFX.click();
      UI.showScreen(state.helpReturn === 'play' ? 'screen-play' : 'screen-title');
    });
    document.getElementById('btn-hint').addEventListener('click', useHint);
    document.getElementById('btn-restart').addEventListener('click', function () {
      SoundFX.click();
      startLevel(state.levelIndex);
    });
    document.getElementById('btn-quit').addEventListener('click', function () {
      SoundFX.click();
      quitToTitle();
    });
    document.getElementById('btn-next').addEventListener('click', function () {
      SoundFX.click();
      if (state.levelIndex + 1 < SCENES.length) startLevel(state.levelIndex + 1);
      else campaignComplete();
    });
    document.getElementById('btn-replay').addEventListener('click', function () {
      SoundFX.click();
      // Take the completed level's points back, so replaying cannot farm them.
      state.totalScore = Math.max(0, state.totalScore - state.lastLevelScore);
      state.lastLevelScore = 0;
      startLevel(state.levelIndex);
    });
    document.getElementById('btn-retry').addEventListener('click', function () {
      SoundFX.click();
      startLevel(state.levelIndex);
    });
    document.getElementById('btn-timeup-levels').addEventListener('click', function () {
      SoundFX.click();
      quitToTitle();
    });
    document.getElementById('btn-again').addEventListener('click', function () {
      SoundFX.click();
      state.totalScore = 0;
      startLevel(0);
    });
    document.getElementById('btn-campaign-levels').addEventListener('click', function () {
      SoundFX.click();
      quitToTitle();
    });
    document.getElementById('btn-resume').addEventListener('click', function () {
      SoundFX.click();
      togglePause();
    });
    document.getElementById('btn-pause-quit').addEventListener('click', function () {
      SoundFX.click();
      quitToTitle();
    });

    Input.bindPanelClick(leftCanvas, onPanelClick);
    Input.bindPanelClick(rightCanvas, onPanelClick);
    Input.bindKeys({
      onHint: useHint,
      onMute: toggleMute,
      onRestart: function () { if (state.screen === 'play') startLevel(state.levelIndex); },
      onPause: togglePause,
      onConfirm: function () {
        if (state.screen === 'title') {
          state.totalScore = 0;
          startLevel(0);
        }
      },
    });

    // Level complete -> last level -> campaign, handled by Next button.
    // (campaignComplete is also reachable from the Next button on level 4.)

    var params = new URLSearchParams(window.location.search);
    var shot = params.get('shot');
    if (shot) applyShotPreset(shot);
    window.requestAnimationFrame(frame);
  }

  // A small handle for automated play-testing.
  window.__game = {
    state: state,
    scenes: SCENES,
    startLevel: startLevel,
    useHint: useHint,
    quitToTitle: quitToTitle,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
