/* Twin Peeks — the HUD and the screens.
   This module owns everything the player reads: the counter, the timer bar,
   the score, the level chips, the overlays and the little messages. It never
   touches game logic; the main module tells it what to show. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var SCREENS = ['screen-title', 'screen-play', 'screen-complete', 'screen-timeup', 'screen-campaign', 'screen-help', 'screen-pause'];

  function showScreen(id) {
    for (var i = 0; i < SCREENS.length; i++) {
      $(SCREENS[i]).hidden = SCREENS[i] !== id;
    }
    if (id === 'screen-play') $('hud').hidden = false;
    else if (id === 'screen-title') $('hud').hidden = true;
  }

  function formatTime(seconds) {
    var s = Math.max(0, Math.ceil(seconds));
    var m = Math.floor(s / 60);
    var rest = s % 60;
    return m + ':' + (rest < 10 ? '0' : '') + rest;
  }

  function setHud(state) {
    $('hud-level').textContent = (state.levelIndex + 1) + ' / ' + state.levelCount;
    $('hud-found').textContent = state.found + ' / ' + state.total;
    $('hud-score').textContent = state.score;
    $('hud-best').textContent = state.best;
    if (state.timeLeft === null) {
      $('hud-time').textContent = '—';
      $('timer-bar').style.width = '100%';
      $('timer-bar').classList.remove('low');
    } else {
      $('hud-time').textContent = formatTime(state.timeLeft);
      var frac = Math.max(0, state.timeLeft / state.timeLimit);
      $('timer-bar').style.width = (frac * 100).toFixed(1) + '%';
      $('timer-bar').classList.toggle('low', state.timeLeft <= 10);
    }
    $('hint-count').textContent = '(' + state.hintsLeft + ' left)';
    $('btn-hint').disabled = state.hintsLeft <= 0;
  }

  function setSceneHead(scene) {
    $('scene-name').textContent = scene.name;
    $('scene-blurb').textContent = scene.blurb;
  }

  function setMessage(text) {
    $('play-message').textContent = text || '';
  }

  function showCombo(step) {
    var el = $('combo');
    if (step >= 2) {
      el.hidden = false;
      el.textContent = 'Streak x' + step + ' — nice eyes!';
    } else {
      el.hidden = true;
    }
  }

  function setProgressDots(levelCount, currentIndex, doneSet) {
    var wrap = $('level-progress');
    wrap.innerHTML = '';
    for (var i = 0; i < levelCount; i++) {
      var dot = document.createElement('span');
      dot.className = 'progress-dot' + (doneSet.has(i) ? ' done' : '') + (i === currentIndex ? ' current' : '');
      dot.title = 'Level ' + (i + 1);
      wrap.appendChild(dot);
    }
    $('foot-progress').textContent = doneSet.size + ' of ' + levelCount + ' scenes solved';
  }

  function buildLevelSelect(scenes, unlockedCount, doneSet, onPick) {
    var wrap = $('level-select');
    wrap.innerHTML = '';
    for (var i = 0; i < scenes.length; i++) {
      (function (index) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'level-chip' + (doneSet.has(index) ? ' done' : '');
        chip.disabled = index >= unlockedCount;
        var label = document.createElement('strong');
        label.textContent = (index + 1) + '. ' + scenes[index].name;
        var sub = document.createElement('span');
        sub.textContent = doneSet.has(index) ? 'Solved ✓' : (index >= unlockedCount ? 'Locked' : '7 differences');
        chip.appendChild(label);
        chip.appendChild(sub);
        chip.addEventListener('click', function () { onPick(index); });
        wrap.appendChild(chip);
      })(i);
    }
  }

  function showComplete(scene, found, timeBonus, levelScore, totalScore, stars) {
    $('complete-title').textContent = scene.name;
    $('complete-found').textContent = found + ' / ' + scene.diffs.length;
    $('complete-time').textContent = '+' + timeBonus;
    $('complete-score').textContent = levelScore;
    $('complete-total').textContent = totalScore;
    var starsEl = $('complete-stars');
    starsEl.innerHTML = '';
    for (var i = 0; i < 3; i++) {
      var s = document.createElement('span');
      s.textContent = '★';
      if (i >= stars) s.className = 'dim';
      starsEl.appendChild(s);
    }
    showScreen('screen-complete');
  }

  function showTimeUp(found, total) {
    $('timeup-text').textContent = 'You found ' + found + ' of ' + total +
      ' differences. The missing ones were so close — have another look.';
    showScreen('screen-timeup');
  }

  function showCampaign(finalScore, bestScore, isNewBest) {
    $('campaign-score').textContent = finalScore;
    $('campaign-best').textContent = bestScore + (isNewBest ? ' — new best!' : '');
    showScreen('screen-campaign');
  }

  window.TwinPeeksUI = {
    showScreen: showScreen,
    setHud: setHud,
    setSceneHead: setSceneHead,
    setMessage: setMessage,
    showCombo: showCombo,
    setProgressDots: setProgressDots,
    buildLevelSelect: buildLevelSelect,
    showComplete: showComplete,
    showTimeUp: showTimeUp,
    showCampaign: showCampaign,
  };
})();
