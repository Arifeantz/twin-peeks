/* Twin Peeks — panel rendering and markers.
   Each panel is a 960 x 600 canvas drawn at 2x for crispness; all scene
   coordinates are logical 480 x 300 and scaled by SCALE. This module owns
   drawing both pictures, the golden rings on found differences, the red
   cross on a wrong click, and the pulsing hint ring. */
(function () {
  'use strict';

  var SCALE = 2; // canvas pixels per logical unit
  var LOGICAL_W = 480;
  var LOGICAL_H = 300;

  // Draw one scene into a panel canvas. `applied` is the Set of difference
  // keys this panel shows (empty for picture A, all seven for picture B).
  function drawPanel(canvas, scene, applied) {
    var ctx = canvas.getContext('2d');
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
    scene.draw(ctx, applied);
  }

  // Draw both panels for a scene.
  function drawBoth(leftCanvas, rightCanvas, scene) {
    drawPanel(leftCanvas, scene, new Set());
    var all = new Set();
    for (var i = 0; i < scene.diffs.length; i++) all.add(scene.diffs[i].key);
    drawPanel(rightCanvas, scene, all);
  }

  // A golden ring with a check mark, drawn on a panel at a found difference.
  // `progress` runs 0..1 while the ring pops in; at 1 it rests.
  function drawFoundRing(canvas, diff, progress) {
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    var p = progress >= 1 ? 1 : progress;
    var r = diff.r * (0.6 + 0.4 * p);
    ctx.globalAlpha = 0.35 + 0.65 * p;
    ctx.strokeStyle = '#e9a13b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#fff3c4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, r - 4, 0, Math.PI * 2);
    ctx.stroke();
    if (p >= 1) {
      ctx.fillStyle = '#e9a13b';
      ctx.beginPath();
      ctx.arc(diff.x + diff.r - 2, diff.y - diff.r + 2, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(diff.x + diff.r - 7, diff.y - diff.r + 2);
      ctx.lineTo(diff.x + diff.r - 3, diff.y - diff.r + 6);
      ctx.lineTo(diff.x + diff.r + 3, diff.y - diff.r - 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // A red cross that fades out where the player clicked wrongly.
  function drawWrongMark(canvas, x, y, alpha) {
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.strokeStyle = '#c94f38';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x + 10, y + 10);
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x - 10, y + 10);
    ctx.stroke();
    ctx.restore();
  }

  // A pulsing dashed ring around a difference the hint points at.
  function drawHintRing(canvas, diff, phase) {
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    var pulse = 1 + 0.12 * Math.sin(phase * 4);
    ctx.globalAlpha = 0.65 + 0.3 * Math.sin(phase * 4);
    ctx.strokeStyle = '#7fb3d5';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(diff.x, diff.y, diff.r * pulse + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Convert a pointer event on a panel canvas to logical scene coordinates.
  function eventToLogical(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = ((event.clientX - rect.left) / rect.width) * LOGICAL_W;
    var y = ((event.clientY - rect.top) / rect.height) * LOGICAL_H;
    return { x: x, y: y };
  }

  window.TwinPeeksDraw = {
    SCALE: SCALE,
    LOGICAL_W: LOGICAL_W,
    LOGICAL_H: LOGICAL_H,
    drawPanel: drawPanel,
    drawBoth: drawBoth,
    drawFoundRing: drawFoundRing,
    drawWrongMark: drawWrongMark,
    drawHintRing: drawHintRing,
    eventToLogical: eventToLogical,
  };
})();
