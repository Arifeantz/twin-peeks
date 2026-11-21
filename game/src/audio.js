/* Twin Peeks — sound effects, synthesized live with WebAudio.
   No audio files are loaded; every sound is a few oscillators and a gain
   envelope. The module exposes one object, SoundFX, with a muted flag. */
(function () {
  'use strict';

  var ctx = null;
  var muted = false;
  var master = null;

  function ensureContext() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    return ctx;
  }

  // A single note: sine or triangle, with a quick attack and an exponential decay.
  function note(freq, startAt, duration, type, volume) {
    if (muted) return;
    var ac = ensureContext();
    if (!ac) return;
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    var t = ac.currentTime + startAt;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume || 0.25, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  // A short filtered noise burst, used for the wrong-click thud.
  function thud() {
    if (muted) return;
    var ac = ensureContext();
    if (!ac) return;
    var len = Math.floor(ac.sampleRate * 0.12);
    var buffer = ac.createBuffer(1, len, ac.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ac.createBufferSource();
    src.buffer = buffer;
    var filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    var gain = ac.createGain();
    gain.gain.value = 0.4;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start();
  }

  var SoundFX = {
    get muted() { return muted; },
    setMuted: function (value) {
      muted = !!value;
      if (muted && ctx) ctx.suspend();
      if (!muted && ctx) ctx.resume();
    },
    // A bright two-note pop when a difference is found.
    found: function (comboStep) {
      var base = 660 + Math.min(comboStep || 0, 6) * 40;
      note(base, 0, 0.18, 'sine', 0.28);
      note(base * 1.5, 0.07, 0.28, 'sine', 0.22);
    },
    // A dull thud for a wrong click.
    wrong: function () { thud(); },
    // A soft rising blip for a hint.
    hint: function () {
      note(520, 0, 0.12, 'triangle', 0.18);
      note(780, 0.09, 0.2, 'triangle', 0.16);
    },
    // A single tick as the timer runs low.
    tick: function () { note(980, 0, 0.05, 'square', 0.06); },
    // A short click for buttons.
    click: function () { note(440, 0, 0.06, 'triangle', 0.12); },
    // A little fanfare when a level is cleared.
    win: function () {
      var seq = [523, 659, 784, 1047];
      for (var i = 0; i < seq.length; i++) note(seq[i], i * 0.11, 0.32, 'triangle', 0.22);
    },
    // A longer fanfare for finishing the whole campaign.
    campaign: function () {
      var seq = [523, 659, 784, 1047, 784, 1047, 1319];
      for (var i = 0; i < seq.length; i++) note(seq[i], i * 0.12, 0.34, 'triangle', 0.22);
    },
    // A low descending phrase when time runs out.
    lose: function () {
      note(392, 0, 0.25, 'sawtooth', 0.1);
      note(330, 0.18, 0.25, 'sawtooth', 0.1);
      note(262, 0.36, 0.45, 'sawtooth', 0.1);
    },
  };

  window.SoundFX = SoundFX;
})();
