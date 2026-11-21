/* Twin Peeks — the four scenes.
   Every picture is drawn in code on a 480 x 300 logical canvas. A scene's
   draw function takes a Set of difference keys: the left picture is drawn
   with an empty set, the right picture with every key, so the two panels
   are near-identical by construction and each difference is exactly where
   its entry in `diffs` says it is. Coordinates are logical (480 x 300);
   hit radius r is in the same units. */
(function () {
  'use strict';

  var W = 480;
  var H = 300;

  /* ---------- small drawing helpers, shared by the scenes ---------- */
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
  }
  function ellipse(ctx, x, y, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  }
  function star(ctx, x, y, r, points) {
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var rad = i % 2 === 0 ? r : r * 0.45;
      var a = (i * Math.PI) / points - Math.PI / 2;
      var px = x + Math.cos(a) * rad;
      var py = y + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }
  function line(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  function fill(ctx, color) { ctx.fillStyle = color; ctx.fill(); }
  function stroke(ctx, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width || 2;
    ctx.stroke();
  }
  function text(ctx, str, x, y, font, color, align) {
    ctx.font = font;
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }
  function vgrad(ctx, y0, y1, stops) {
    var g = ctx.createLinearGradient(0, y0, 0, y1);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    return g;
  }

  /* ---------- Scene 1: The Baker's Morning ---------- */
  function drawBakery(ctx, d) {
    // Wall and wooden floor.
    ctx.fillStyle = vgrad(ctx, 0, 300, [[0, '#fbeecf'], [0.75, '#f6dfae'], [1, '#efcf96']]);
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#b07a45';
    ctx.fillRect(0, 238, W, 62);
    ctx.strokeStyle = 'rgba(90,55,25,0.35)';
    ctx.lineWidth = 1;
    for (var fx = 0; fx < W; fx += 48) { line(ctx, fx, 238, fx, 300); ctx.stroke(); }
    line(ctx, 0, 262, W, 262); ctx.stroke();
    line(ctx, 0, 284, W, 284); ctx.stroke();

    // Big window with morning sky.
    ctx.fillStyle = '#8a5a33';
    rr(ctx, 34, 24, 156, 136, 8); fill(ctx, '#8a5a33');
    ctx.fillStyle = vgrad(ctx, 30, 155, [[0, '#a8d8f0'], [1, '#ffe9a8']]);
    ctx.fillRect(42, 32, 140, 120);
    line(ctx, 112, 32, 112, 152); stroke(ctx, '#8a5a33', 5);
    line(ctx, 42, 92, 182, 92); stroke(ctx, '#8a5a33', 5);
    // Sun — missing on the right picture.
    if (!d.has('sun')) {
      ctx.fillStyle = '#ffcf3f';
      circle(ctx, 75, 60, 17); fill(ctx, '#ffcf3f');
      ctx.strokeStyle = '#ffcf3f'; ctx.lineWidth = 3;
      for (var s = 0; s < 8; s++) {
        var a = (s * Math.PI) / 4;
        line(ctx, 75 + Math.cos(a) * 21, 60 + Math.sin(a) * 21, 75 + Math.cos(a) * 28, 60 + Math.sin(a) * 28);
        ctx.stroke();
      }
    }
    // Hills outside the window.
    ctx.fillStyle = '#8fbf7f';
    ctx.beginPath(); ctx.moveTo(42, 152); ctx.quadraticCurveTo(90, 118, 140, 152); ctx.closePath(); fill(ctx, '#8fbf7f');
    ctx.beginPath(); ctx.moveTo(112, 152); ctx.quadraticCurveTo(155, 122, 182, 152); ctx.closePath(); fill(ctx, '#8fbf7f');

    // Windowsill and the cat sitting on it.
    ctx.fillStyle = '#a06a3a';
    rr(ctx, 28, 152, 168, 12, 4); fill(ctx, '#a06a3a');
    // Cat body.
    ctx.fillStyle = '#e07840';
    ellipse(ctx, 128, 148, 22, 13); fill(ctx, '#e07840');
    circle(ctx, 146, 136, 10); fill(ctx, '#e07840');
    ctx.fillStyle = '#e07840';
    ctx.beginPath(); ctx.moveTo(140, 128); ctx.lineTo(142, 118); ctx.lineTo(147, 127); ctx.closePath(); fill(ctx, '#e07840');
    ctx.beginPath(); ctx.moveTo(149, 127); ctx.lineTo(154, 118); ctx.lineTo(156, 128); ctx.closePath(); fill(ctx, '#e07840');
    // Cat tail — up on the left, drooping on the right.
    ctx.strokeStyle = '#e07840'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(108, 150);
    if (d.has('cattail')) ctx.quadraticCurveTo(96, 152, 94, 160);
    else ctx.quadraticCurveTo(96, 138, 104, 130);
    ctx.stroke();

    // Wall clock — 7:05 on the left, 7:25 on the right.
    ctx.fillStyle = '#fffdf4';
    circle(ctx, 400, 55, 22); fill(ctx, '#fffdf4');
    stroke(ctx, '#5a3d24', 3);
    ctx.strokeStyle = '#3b2d20'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    line(ctx, 400, 55, 400 - 9, 55 + 9); ctx.stroke(); // hour hand, 7 o'clock
    if (d.has('clock')) line(ctx, 400, 55, 400 + 13, 55 + 8); // minute hand at 25
    else line(ctx, 400, 55, 400 + 14, 55 - 3); // minute hand at 5
    ctx.stroke();
    ctx.fillStyle = '#3b2d20';
    circle(ctx, 400, 55, 2.5); fill(ctx, '#3b2d20');

    // Shelf with three jars; the middle jar changes colour.
    ctx.fillStyle = '#8a5a33';
    ctx.fillRect(228, 118, 224, 8);
    ctx.fillStyle = '#f3e2b8';
    rr(ctx, 246, 88, 34, 30, 6); fill(ctx, '#f3e2b8');
    rr(ctx, 316, 88, 34, 30, 6);
    fill(ctx, d.has('jar') ? '#7d9b6a' : '#c94f38');
    ctx.fillStyle = '#f3e2b8';
    rr(ctx, 386, 88, 34, 30, 6); fill(ctx, '#f3e2b8');
    ctx.fillStyle = '#5a3d24';
    ctx.fillRect(252, 82, 22, 7);
    ctx.fillRect(322, 82, 22, 7);
    ctx.fillRect(392, 82, 22, 7);

    // Hanging lamp — lit on the left, dark on the right.
    ctx.strokeStyle = '#5a3d24'; ctx.lineWidth = 3;
    line(ctx, 280, 0, 280, 58); ctx.stroke();
    ctx.fillStyle = d.has('lamp') ? '#8a7a68' : '#e9a13b';
    ctx.beginPath(); ctx.moveTo(258, 76); ctx.lineTo(302, 76); ctx.lineTo(290, 56); ctx.lineTo(270, 56); ctx.closePath();
    fill(ctx, d.has('lamp') ? '#8a7a68' : '#e9a13b');
    if (!d.has('lamp')) {
      ctx.fillStyle = 'rgba(255, 220, 120, 0.35)';
      ctx.beginPath(); ctx.moveTo(262, 78); ctx.lineTo(298, 78); ctx.lineTo(318, 150); ctx.lineTo(242, 150); ctx.closePath(); fill(ctx, 'rgba(255, 220, 120, 0.35)');
      ctx.fillStyle = '#fff3c4';
      circle(ctx, 280, 80, 7); fill(ctx, '#fff3c4');
    }

    // Counter with bread loaves — three on the left, two on the right.
    ctx.fillStyle = '#a06a3a';
    rr(ctx, 60, 200, 360, 16, 5); fill(ctx, '#a06a3a');
    ctx.fillStyle = '#7c4f28';
    ctx.fillRect(70, 216, 14, 22);
    ctx.fillRect(396, 216, 14, 22);
    ctx.fillStyle = '#d99a4e';
    ellipse(ctx, 122, 196, 26, 13); fill(ctx, '#d99a4e');
    ellipse(ctx, 168, 196, 26, 13); fill(ctx, '#d99a4e');
    if (!d.has('loaf')) { ellipse(ctx, 212, 196, 26, 13); fill(ctx, '#d99a4e'); }
    ctx.strokeStyle = '#a86f2e'; ctx.lineWidth = 2;
    line(ctx, 112, 190, 132, 190); ctx.stroke();
    line(ctx, 158, 190, 178, 190); ctx.stroke();
    if (!d.has('loaf')) { line(ctx, 202, 190, 222, 190); ctx.stroke(); }

    // Teapot with steam — steam only on the left.
    ctx.fillStyle = '#5b7fa6';
    ellipse(ctx, 352, 192, 24, 15); fill(ctx, '#5b7fa6');
    ctx.beginPath(); ctx.moveTo(374, 186); ctx.quadraticCurveTo(390, 180, 382, 172); ctx.quadraticCurveTo(376, 178, 372, 182); ctx.closePath(); fill(ctx, '#5b7fa6');
    ctx.fillStyle = '#3f5f82';
    rr(ctx, 346, 172, 12, 8, 3); fill(ctx, '#3f5f82');
    if (!d.has('steam')) {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(346, 168); ctx.quadraticCurveTo(340, 158, 347, 150); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(358, 168); ctx.quadraticCurveTo(364, 156, 357, 146); ctx.stroke();
    }

    // A small rug on the floor.
    ctx.fillStyle = '#b4552d';
    ellipse(ctx, 240, 272, 90, 16); fill(ctx, '#b4552d');
    ctx.fillStyle = '#e9a13b';
    ellipse(ctx, 240, 272, 62, 10); fill(ctx, '#e9a13b');
  }

  var BAKERY_DIFFS = [
    { key: 'sun', x: 75, y: 60, r: 26, label: 'the morning sun' },
    { key: 'clock', x: 400, y: 55, r: 28, label: 'the clock hands' },
    { key: 'cattail', x: 100, y: 140, r: 24, label: 'the cat\u2019s tail' },
    { key: 'loaf', x: 212, y: 196, r: 24, label: 'a bread loaf' },
    { key: 'jar', x: 333, y: 103, r: 24, label: 'the jam jar\u2019s colour' },
    { key: 'lamp', x: 280, y: 70, r: 28, label: 'the hanging lamp' },
    { key: 'steam', x: 352, y: 158, r: 22, label: 'the teapot steam' },
  ];

  // Shared helpers for the later scene chunks, and the first scene's data.
  window.TPDraw = { rr: rr, circle: circle, ellipse: ellipse, star: star, line: line, fill: fill, stroke: stroke, text: text, vgrad: vgrad, W: W, H: H };
  window.__twinPeeksScenesPart1 = { drawBakery: drawBakery, BAKERY_DIFFS: BAKERY_DIFFS };
})();

/* ---------- Scene 2: Night Train Home ---------- */
(function () {
  'use strict';
  var TP = window.TPDraw;
  var rr = TP.rr, circle = TP.circle, ellipse = TP.ellipse, star = TP.star;
  var line = TP.line, fill = TP.fill, stroke = TP.stroke, text = TP.text, vgrad = TP.vgrad;

  function drawTrain(ctx, d) {
    // Night sky.
    ctx.fillStyle = vgrad(ctx, 0, 300, [[0, '#1c2f55'], [0.6, '#2c4a73'], [1, '#3d5a80']]);
    ctx.fillRect(0, 0, 480, 300);
    // Stars — one is missing on the right picture.
    var stars = [[40, 30], [150, 24], [230, 46], [300, 40], [360, 26], [440, 60]];
    ctx.fillStyle = '#ffe9a8';
    for (var i = 0; i < stars.length; i++) {
      if (d.has('stars') && i === 3) continue;
      star(ctx, stars[i][0], stars[i][1], 5, 4); fill(ctx, '#ffe9a8');
    }
    // Moon — full on the left, a crescent on the right.
    ctx.fillStyle = '#f7ead0';
    circle(ctx, 90, 55, 24); fill(ctx, '#f7ead0');
    ctx.fillStyle = '#d8c49a';
    circle(ctx, 82, 50, 5); fill(ctx, '#d8c49a');
    circle(ctx, 98, 62, 4); fill(ctx, '#d8c49a');
    if (d.has('moon')) {
      ctx.fillStyle = '#2c4a73';
      circle(ctx, 100, 50, 21); fill(ctx, '#2c4a73');
    }
    // Distant hills.
    ctx.fillStyle = '#22395e';
    ctx.beginPath(); ctx.moveTo(0, 210); ctx.quadraticCurveTo(120, 160, 260, 210); ctx.closePath(); fill(ctx, '#22395e');
    ctx.beginPath(); ctx.moveTo(220, 210); ctx.quadraticCurveTo(360, 165, 480, 210); ctx.closePath(); fill(ctx, '#22395e');

    // The train.
    ctx.fillStyle = '#274b5f';
    rr(ctx, 28, 148, 424, 68, 14); fill(ctx, '#274b5f');
    ctx.fillStyle = '#1d3849';
    ctx.fillRect(28, 200, 424, 16);
    // Four windows; the third is dark on the right picture.
    for (var w = 0; w < 4; w++) {
      var wx = 76 + w * 84;
      ctx.fillStyle = (d.has('windows') && w === 2) ? '#16242e' : '#ffd76a';
      rr(ctx, wx, 162, 42, 28, 5); fill(ctx, (d.has('windows') && w === 2) ? '#16242e' : '#ffd76a');
      ctx.strokeStyle = '#16242e'; ctx.lineWidth = 2;
      line(ctx, wx + 21, 162, wx + 21, 190); ctx.stroke();
    }
    // Wheels.
    ctx.fillStyle = '#101c26';
    for (var k = 0; k < 5; k++) { circle(ctx, 70 + k * 85, 220, 11); fill(ctx, '#101c26'); }
    ctx.fillStyle = '#5a7d94';
    for (var m = 0; m < 5; m++) { circle(ctx, 70 + m * 85, 220, 4); fill(ctx, '#5a7d94'); }

    // Platform.
    ctx.fillStyle = '#6d7680';
    ctx.fillRect(0, 226, 480, 74);
    ctx.fillStyle = '#5a636d';
    ctx.fillRect(0, 226, 480, 6);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2;
    line(ctx, 0, 252, 480, 252); ctx.stroke();

    // Hanging sign — PLATFORM 2 on the left, PLATFORM 3 on the right.
    ctx.strokeStyle = '#3a4550'; ctx.lineWidth = 3;
    line(ctx, 240, 96, 240, 106); ctx.stroke();
    ctx.fillStyle = '#f7ead0';
    rr(ctx, 196, 106, 88, 26, 5); fill(ctx, '#f7ead0');
    stroke(ctx, '#3a4550', 2);
    text(ctx, 'PLATFORM ' + (d.has('sign') ? '3' : '2'), 240, 120, 'bold 13px Trebuchet MS, sans-serif', '#3a4550');

    // Lamp post — lit on the left, dark on the right.
    ctx.strokeStyle = '#2e3844'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    line(ctx, 430, 226, 430, 132); ctx.stroke();
    ctx.fillStyle = d.has('lamp') ? '#4a545e' : '#ffd76a';
    circle(ctx, 430, 126, 9); fill(ctx, d.has('lamp') ? '#4a545e' : '#ffd76a');
    if (!d.has('lamp')) {
      ctx.fillStyle = 'rgba(255, 215, 106, 0.22)';
      ctx.beginPath(); ctx.moveTo(424, 132); ctx.lineTo(436, 132); ctx.lineTo(462, 226); ctx.lineTo(398, 226); ctx.closePath(); fill(ctx, 'rgba(255, 215, 106, 0.22)');
    }

    // Bench.
    ctx.fillStyle = '#7a4a28';
    ctx.fillRect(356, 196, 62, 8);
    ctx.fillRect(356, 208, 62, 6);
    ctx.fillStyle = '#5a3418';
    ctx.fillRect(362, 214, 6, 12);
    ctx.fillRect(406, 214, 6, 12);

    // Suitcase — present on the left, gone on the right.
    if (!d.has('suitcase')) {
      ctx.fillStyle = '#b4452f';
      rr(ctx, 42, 226, 36, 26, 4); fill(ctx, '#b4452f');
      ctx.strokeStyle = '#7c2f1e'; ctx.lineWidth = 2;
      rr(ctx, 42, 226, 36, 26, 4); ctx.stroke();
      ctx.fillStyle = '#7c2f1e';
      ctx.fillRect(52, 222, 16, 5);
    }

    // Puddle reflecting the moon — only on the left.
    if (!d.has('puddle')) {
      ctx.fillStyle = 'rgba(247, 234, 208, 0.5)';
      ellipse(ctx, 140, 266, 34, 7); fill(ctx, 'rgba(247, 234, 208, 0.5)');
      ctx.fillStyle = 'rgba(255, 233, 168, 0.65)';
      ellipse(ctx, 140, 266, 16, 4); fill(ctx, 'rgba(255, 233, 168, 0.65)');
    }
  }

  var TRAIN_DIFFS = [
    { key: 'moon', x: 90, y: 55, r: 28, label: 'the moon\u2019s shape' },
    { key: 'windows', x: 265, y: 176, r: 26, label: 'a train window gone dark' },
    { key: 'stars', x: 300, y: 40, r: 20, label: 'a missing star' },
    { key: 'sign', x: 240, y: 119, r: 26, label: 'the platform number' },
    { key: 'suitcase', x: 60, y: 239, r: 24, label: 'the red suitcase' },
    { key: 'lamp', x: 430, y: 126, r: 26, label: 'the lamp post' },
    { key: 'puddle', x: 140, y: 266, r: 28, label: 'the moon in the puddle' },
  ];

  /* ---------- Scene 3: The Old Library ---------- */
  function drawLibrary(ctx, d) {
    // Warm wood wall and floor.
    ctx.fillStyle = vgrad(ctx, 0, 300, [[0, '#c99a63'], [1, '#a87a48']]);
    ctx.fillRect(0, 0, 480, 300);
    ctx.fillStyle = '#8a5f33';
    ctx.fillRect(0, 248, 480, 52);

    // Left bookshelf.
    ctx.fillStyle = '#6d4525';
    ctx.fillRect(18, 18, 158, 216);
    var shelfColors = ['#b4452f', '#3f6d8e', '#7d9b6a', '#e9a13b', '#8e5aa8', '#c97f5a'];
    for (var s = 0; s < 3; s++) {
      var sy = 34 + s * 66;
      for (var b = 0; b < 7; b++) {
        var bx = 26 + b * 20;
        var bh = 44 - ((b * 7) % 12);
        // One spine changes colour on the right picture.
        var col = shelfColors[(b + s * 2) % shelfColors.length];
        if (d.has('books') && s === 1 && b === 3) col = '#3f6d8e';
        else if (s === 1 && b === 3) col = '#b4452f';
        ctx.fillStyle = col;
        ctx.fillRect(bx, sy + 52 - bh, 16, bh);
      }
      ctx.fillStyle = '#4a2f18';
      ctx.fillRect(22, sy + 52, 150, 6);
    }
    // Right bookshelf.
    ctx.fillStyle = '#6d4525';
    ctx.fillRect(310, 18, 152, 216);
    for (var s2 = 0; s2 < 3; s2++) {
      var sy2 = 34 + s2 * 66;
      for (var b2 = 0; b2 < 7; b2++) {
        var bx2 = 318 + b2 * 20;
        var bh2 = 44 - ((b2 * 5 + s2) % 12);
        ctx.fillStyle = shelfColors[(b2 + s2 * 3 + 2) % shelfColors.length];
        ctx.fillRect(bx2, sy2 + 52 - bh2, 16, bh2);
      }
      ctx.fillStyle = '#4a2f18';
      ctx.fillRect(314, sy2 + 52, 144, 6);
    }

    // Framed picture on the wall — missing on the right.
    if (!d.has('picture')) {
      ctx.fillStyle = '#f7ead0';
      ctx.fillRect(384, 40, 44, 34);
      ctx.strokeStyle = '#5a3d24';
      ctx.lineWidth = 3;
      ctx.strokeRect(384, 40, 44, 34);
      ctx.fillStyle = '#7fb3d5';
      ctx.fillRect(388, 44, 36, 26);
      ctx.fillStyle = '#e9a13b';
      circle(ctx, 414, 54, 6); fill(ctx, '#e9a13b');
      ctx.fillStyle = '#55703f';
      ctx.beginPath(); ctx.moveTo(388, 70); ctx.lineTo(402, 58); ctx.lineTo(416, 70); ctx.closePath(); fill(ctx, '#55703f');
    }

    // Wall clock — 3:00 on the left, 4:00 on the right.
    ctx.fillStyle = '#fffdf4';
    circle(ctx, 240, 52, 18); fill(ctx, '#fffdf4');
    stroke(ctx, '#5a3d24', 3);
    ctx.strokeStyle = '#3b2d20'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    if (d.has('clock')) line(ctx, 240, 52, 240 + 9, 52 + 5); // hour hand at 4
    else line(ctx, 240, 52, 240 + 10, 52); // hour hand at 3
    ctx.stroke();
    line(ctx, 240, 52, 240, 52 - 12); ctx.stroke(); // minute hand at 12
    ctx.fillStyle = '#3b2d20';
    circle(ctx, 240, 52, 2); fill(ctx, '#3b2d20');

    // Desk.
    ctx.fillStyle = '#7c4f28';
    rr(ctx, 150, 232, 190, 12, 4); fill(ctx, '#7c4f28');
    ctx.fillStyle = '#5a3418';
    ctx.fillRect(160, 244, 10, 30);
    ctx.fillRect(320, 244, 10, 30);

    // Globe — present on the left, gone on the right.
    if (!d.has('globe')) {
      ctx.fillStyle = '#7fb3d5';
      circle(ctx, 182, 214, 16); fill(ctx, '#7fb3d5');
      ctx.fillStyle = '#7d9b6a';
      ctx.beginPath(); ctx.moveTo(170, 210); ctx.quadraticCurveTo(178, 200, 188, 208); ctx.quadraticCurveTo(182, 216, 172, 216); ctx.closePath(); fill(ctx, '#7d9b6a');
      ctx.beginPath(); ctx.moveTo(184, 222); ctx.quadraticCurveTo(192, 214, 196, 220); ctx.quadraticCurveTo(190, 228, 182, 226); ctx.closePath(); fill(ctx, '#7d9b6a');
      ctx.strokeStyle = '#5a3d24'; ctx.lineWidth = 2;
      circle(ctx, 182, 214, 16); ctx.stroke();
      line(ctx, 182, 230, 182, 232); ctx.stroke();
      ctx.fillStyle = '#5a3d24';
      ctx.fillRect(172, 230, 20, 3);
    }

    // Reading lamp — green shade on the left, orange on the right.
    ctx.strokeStyle = '#3a2c1c'; ctx.lineWidth = 3;
    line(ctx, 250, 232, 250, 198); ctx.stroke();
    ctx.fillStyle = d.has('lamp') ? '#e07840' : '#55703f';
    ctx.beginPath(); ctx.moveTo(232, 198); ctx.lineTo(268, 198); ctx.lineTo(260, 178); ctx.lineTo(240, 178); ctx.closePath();
    fill(ctx, d.has('lamp') ? '#e07840' : '#55703f');
    ctx.fillStyle = 'rgba(255, 220, 120, 0.4)';
    ctx.beginPath(); ctx.moveTo(236, 200); ctx.lineTo(264, 200); ctx.lineTo(276, 232); ctx.lineTo(224, 232); ctx.closePath(); fill(ctx, 'rgba(255, 220, 120, 0.4)');

    // A stack of books on the desk.
    ctx.fillStyle = '#b4452f';
    ctx.fillRect(286, 220, 34, 7);
    ctx.fillStyle = '#3f6d8e';
    ctx.fillRect(288, 213, 30, 7);
    ctx.fillStyle = '#e9a13b';
    ctx.fillRect(290, 206, 26, 7);

    // Armchair with a sleeping cat — the cat is gone on the right.
    ctx.fillStyle = '#8e5aa8';
    rr(ctx, 330, 208, 96, 44, 12); fill(ctx, '#8e5aa8');
    ctx.fillStyle = '#74478c';
    rr(ctx, 330, 196, 96, 22, 10); fill(ctx, '#74478c');
    ctx.fillStyle = '#6d4525';
    ctx.fillRect(336, 252, 8, 12);
    ctx.fillRect(412, 252, 8, 12);
    if (!d.has('cat')) {
      ctx.fillStyle = '#e07840';
      ellipse(ctx, 378, 204, 26, 11); fill(ctx, '#e07840');
      circle(ctx, 400, 198, 8); fill(ctx, '#e07840');
      ctx.beginPath(); ctx.moveTo(395, 192); ctx.lineTo(397, 184); ctx.lineTo(401, 191); ctx.closePath(); fill(ctx, '#e07840');
      ctx.beginPath(); ctx.moveTo(402, 191); ctx.lineTo(406, 184); ctx.lineTo(408, 192); ctx.closePath(); fill(ctx, '#e07840');
      ctx.strokeStyle = '#e07840'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(354, 206); ctx.quadraticCurveTo(344, 204, 342, 196); ctx.stroke();
    }

    // Potted plant — five leaves on the left, four on the right.
    ctx.fillStyle = '#b4552d';
    ctx.beginPath(); ctx.moveTo(432, 248); ctx.lineTo(452, 248); ctx.lineTo(448, 268); ctx.lineTo(436, 268); ctx.closePath(); fill(ctx, '#b4552d');
    ctx.strokeStyle = '#55703f'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    var leaves = [[442, 226], [434, 232], [450, 232], [438, 218], [446, 218]];
    for (var l = 0; l < leaves.length; l++) {
      if (d.has('plant') && l === 4) continue;
      line(ctx, 442, 248, leaves[l][0], leaves[l][1]); ctx.stroke();
    }
    ctx.fillStyle = '#7d9b6a';
    for (var l2 = 0; l2 < leaves.length; l2++) {
      if (d.has('plant') && l2 === 4) continue;
      ellipse(ctx, leaves[l2][0], leaves[l2][1], 5, 8); fill(ctx, '#7d9b6a');
    }
  }

  var LIBRARY_DIFFS = [
    { key: 'books', x: 94, y: 134, r: 22, label: 'a book\u2019s colour' },
    { key: 'globe', x: 182, y: 214, r: 24, label: 'the globe' },
    { key: 'cat', x: 378, y: 200, r: 26, label: 'the sleeping cat' },
    { key: 'clock', x: 240, y: 52, r: 24, label: 'the clock hands' },
    { key: 'plant', x: 442, y: 232, r: 24, label: 'a leaf on the plant' },
    { key: 'lamp', x: 250, y: 188, r: 26, label: 'the lamp shade\u2019s colour' },
    { key: 'picture', x: 406, y: 57, r: 24, label: 'the framed picture' },
  ];

  window.TwinPeeksScenes = window.TwinPeeksScenes || [];
  window.TwinPeeksScenes.push(
    { id: 'train', name: 'Night Train Home', blurb: 'The last train waits under a quiet moon — and seven things are not quite the same.', draw: drawTrain, diffs: TRAIN_DIFFS }
  );
  window.TwinPeeksScenes.push(
    { id: 'library', name: 'The Old Library', blurb: 'Dust, lamplight and a sleeping cat. Seven small things have moved, changed or vanished.', draw: drawLibrary, diffs: LIBRARY_DIFFS }
  );
})();

/* ---------- Scene 4: Garden Picnic ---------- */
(function () {
  'use strict';
  var TP = window.TPDraw;
  var rr = TP.rr, circle = TP.circle, ellipse = TP.ellipse;
  var line = TP.line, fill = TP.fill, stroke = TP.stroke, text = TP.text, vgrad = TP.vgrad;

  function drawPicnic(ctx, d) {
    // Sky and sun — the sun has rays on the left, none on the right.
    ctx.fillStyle = vgrad(ctx, 0, 300, [[0, '#8ec8ee'], [0.6, '#cfeec8'], [1, '#8fbf7f']]);
    ctx.fillRect(0, 0, 480, 300);
    ctx.fillStyle = '#ffcf3f';
    circle(ctx, 420, 45, 20); fill(ctx, '#ffcf3f');
    if (!d.has('sun')) {
      ctx.strokeStyle = '#ffcf3f'; ctx.lineWidth = 3;
      for (var s = 0; s < 8; s++) {
        var a = (s * Math.PI) / 4;
        line(ctx, 420 + Math.cos(a) * 25, 45 + Math.sin(a) * 25, 420 + Math.cos(a) * 32, 45 + Math.sin(a) * 32);
        ctx.stroke();
      }
    }
    // Clouds.
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ellipse(ctx, 150, 42, 34, 12); fill(ctx, 'rgba(255,255,255,0.9)');
    ellipse(ctx, 170, 36, 24, 10); fill(ctx, 'rgba(255,255,255,0.9)');
    ellipse(ctx, 250, 30, 26, 9); fill(ctx, 'rgba(255,255,255,0.9)');

    // Kite — red on the left, blue on the right.
    ctx.fillStyle = d.has('kite') ? '#3f6d8e' : '#c94f38';
    ctx.beginPath(); ctx.moveTo(300, 52); ctx.lineTo(318, 72); ctx.lineTo(300, 94); ctx.lineTo(282, 72); ctx.closePath();
    fill(ctx, d.has('kite') ? '#3f6d8e' : '#c94f38');
    ctx.strokeStyle = '#3b2d20'; ctx.lineWidth = 1.5;
    line(ctx, 300, 52, 300, 94); ctx.stroke();
    line(ctx, 282, 72, 318, 72); ctx.stroke();
    ctx.strokeStyle = '#3b2d20'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(300, 94); ctx.quadraticCurveTo(306, 112, 296, 126); ctx.stroke();
    ctx.fillStyle = '#e9a13b';
    circle(ctx, 296, 130, 3); fill(ctx, '#e9a13b');

    // Butterflies — three on the left, two on the right.
    var flies = [[150, 92], [200, 62], [350, 120]];
    for (var f = 0; f < flies.length; f++) {
      if (d.has('butterflies') && f === 2) continue;
      var fx = flies[f][0], fy = flies[f][1];
      ctx.fillStyle = f === 1 ? '#e9a13b' : '#8e5aa8';
      ellipse(ctx, fx - 6, fy, 7, 5); fill(ctx, f === 1 ? '#e9a13b' : '#8e5aa8');
      ellipse(ctx, fx + 6, fy, 7, 5); fill(ctx, f === 1 ? '#e9a13b' : '#8e5aa8');
      ctx.fillStyle = '#3b2d20';
      ellipse(ctx, fx, fy, 2, 6); fill(ctx, '#3b2d20');
    }

    // Big tree on the left.
    ctx.fillStyle = '#7a4a28';
    ctx.beginPath(); ctx.moveTo(58, 210); ctx.quadraticCurveTo(64, 150, 60, 120); ctx.lineTo(82, 120); ctx.quadraticCurveTo(78, 155, 86, 210); ctx.closePath(); fill(ctx, '#7a4a28');
    ctx.fillStyle = '#5d9b4e';
    circle(ctx, 46, 108, 30); fill(ctx, '#5d9b4e');
    circle(ctx, 96, 104, 32); fill(ctx, '#5d9b4e');
    circle(ctx, 70, 78, 34); fill(ctx, '#5d9b4e');
    ctx.fillStyle = '#6fae5c';
    circle(ctx, 62, 88, 20); fill(ctx, '#6fae5c');
    circle(ctx, 88, 82, 18); fill(ctx, '#6fae5c');
    // A bird on a branch — gone on the right.
    if (!d.has('bird')) {
      ctx.strokeStyle = '#7a4a28'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      line(ctx, 82, 138, 112, 128); ctx.stroke();
      ctx.fillStyle = '#3f6d8e';
      ellipse(ctx, 120, 126, 10, 7); fill(ctx, '#3f6d8e');
      circle(ctx, 129, 121, 5); fill(ctx, '#3f6d8e');
      ctx.fillStyle = '#e9a13b';
      ctx.beginPath(); ctx.moveTo(133, 121); ctx.lineTo(139, 123); ctx.lineTo(133, 124); ctx.closePath(); fill(ctx, '#e9a13b');
    }

    // Lawn.
    ctx.fillStyle = '#79b264';
    ctx.fillRect(0, 205, 480, 95);
    ctx.fillStyle = '#6aa657';
    for (var gx = 0; gx < 480; gx += 34) {
      ctx.beginPath(); ctx.moveTo(gx, 300); ctx.quadraticCurveTo(gx + 8, 288, gx + 16, 300); ctx.closePath(); fill(ctx, '#6aa657');
    }

    // Picnic blanket, red and white checks.
    for (var by = 0; by < 3; by++) {
      for (var bx = 0; bx < 6; bx++) {
        ctx.fillStyle = (bx + by) % 2 === 0 ? '#fdf6e9' : '#c94f38';
        ctx.fillRect(196 + bx * 32, 222 + by * 16, 32, 16);
      }
    }
    ctx.strokeStyle = '#8a2f1e'; ctx.lineWidth = 2;
    rr(ctx, 196, 222, 192, 48, 4); ctx.stroke();

    // Basket — lid open on the left, closed on the right.
    ctx.fillStyle = '#a8763e';
    rr(ctx, 268, 238, 44, 22, 4); fill(ctx, '#a8763e');
    ctx.strokeStyle = '#7c5426'; ctx.lineWidth = 2;
    line(ctx, 272, 246, 308, 246); ctx.stroke();
    line(ctx, 272, 253, 308, 253); ctx.stroke();
    ctx.strokeStyle = '#7c5426'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    if (d.has('basket')) {
      line(ctx, 268, 238, 312, 238); ctx.stroke(); // lid flat, closed
    } else {
      ctx.beginPath(); ctx.moveTo(268, 238); ctx.quadraticCurveTo(262, 214, 282, 210); ctx.stroke(); // lid open
      ctx.fillStyle = '#fdf6e9';
      circle(ctx, 292, 232, 6); fill(ctx, '#fdf6e9');
      ctx.fillStyle = '#c94f38';
      circle(ctx, 292, 232, 3); fill(ctx, '#c94f38');
    }

    // Lemonade jug — present on the left, gone on the right.
    if (!d.has('jug')) {
      ctx.fillStyle = '#f3d34e';
      rr(ctx, 222, 226, 18, 24, 4); fill(ctx, '#f3d34e');
      ctx.fillStyle = '#d9b62e';
      ctx.fillRect(226, 220, 10, 7);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillRect(226, 230, 4, 16);
    }
    // A plate with a sandwich.
    ctx.fillStyle = '#fdf6e9';
    ellipse(ctx, 342, 246, 16, 5); fill(ctx, '#fdf6e9');
    ctx.fillStyle = '#e9c88a';
    ctx.beginPath(); ctx.moveTo(334, 244); ctx.lineTo(342, 236); ctx.lineTo(350, 244); ctx.closePath(); fill(ctx, '#e9c88a');

    // Flowers along the bottom — five on the left, four on the right.
    var flowers = [[40, 282], [110, 286], [180, 282], [400, 282], [450, 286]];
    for (var fl = 0; fl < flowers.length; fl++) {
      if (d.has('flowers') && fl === 3) continue;
      var fxx = flowers[fl][0], fyy = flowers[fl][1];
      ctx.strokeStyle = '#4a7a3a'; ctx.lineWidth = 2;
      line(ctx, fxx, fyy, fxx, fyy + 10); ctx.stroke();
      ctx.fillStyle = fl % 2 === 0 ? '#e07840' : '#e9a13b';
      for (var p = 0; p < 5; p++) {
        var pa = (p * Math.PI * 2) / 5;
        circle(ctx, fxx + Math.cos(pa) * 5, fyy + Math.sin(pa) * 5, 3.5); fill(ctx, fl % 2 === 0 ? '#e07840' : '#e9a13b');
      }
      ctx.fillStyle = '#fff3c4';
      circle(ctx, fxx, fyy, 3); fill(ctx, '#fff3c4');
    }
  }

  var PICNIC_DIFFS = [
    { key: 'kite', x: 300, y: 72, r: 26, label: 'the kite\u2019s colour' },
    { key: 'butterflies', x: 350, y: 120, r: 20, label: 'a butterfly' },
    { key: 'sun', x: 420, y: 45, r: 28, label: 'the sun\u2019s rays' },
    { key: 'basket', x: 288, y: 234, r: 26, label: 'the basket lid' },
    { key: 'flowers', x: 400, y: 282, r: 20, label: 'a flower' },
    { key: 'jug', x: 231, y: 238, r: 22, label: 'the lemonade jug' },
    { key: 'bird', x: 120, y: 126, r: 22, label: 'the bird on the branch' },
  ];

  /* ---------- assemble the four scenes in play order ---------- */
  var part1 = window.__twinPeeksScenesPart1;
  var scenes = [
    {
      id: 'bakery',
      name: 'The Baker\u2019s Morning',
      blurb: 'A warm kitchen, a sleepy cat, and seven things that are not quite the same.',
      draw: part1.drawBakery,
      diffs: part1.BAKERY_DIFFS,
    },
  ];
  for (var i = 0; i < window.TwinPeeksScenes.length; i++) scenes.push(window.TwinPeeksScenes[i]);
  scenes.push({
    id: 'picnic',
    name: 'Garden Picnic',
    blurb: 'Sunshine, a kite and a basket of lunch — seven small lies hide in the grass.',
    draw: drawPicnic,
    diffs: PICNIC_DIFFS,
  });

  window.SCENES = scenes;
  window.SCENE_SIZE = { w: 480, h: 300 };
})();
