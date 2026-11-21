/* Twin Peeks — input: pointer clicks on the panels and keyboard shortcuts.
   A click counts when it lands within a difference's hit radius (a little
   generous, so a fair hunt never feels fussy). The module reports clicks
   to the game through callbacks the main module installs. */
(function () {
  'use strict';

  var TwinPeeksDraw = window.TwinPeeksDraw;

  // Find the first not-yet-found difference near a logical point, or null.
  function hitTest(scene, foundKeys, point, radiusScale) {
    var best = null;
    var bestDist = Infinity;
    for (var i = 0; i < scene.diffs.length; i++) {
      var diff = scene.diffs[i];
      if (foundKeys.has(diff.key)) continue;
      var dx = point.x - diff.x;
      var dy = point.y - diff.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var reach = diff.r * (radiusScale || 1);
      if (dist <= reach && dist < bestDist) {
        best = diff;
        bestDist = dist;
      }
    }
    return best;
  }

  // Wire a panel canvas to a click handler that receives logical coordinates.
  function bindPanelClick(canvas, onClick) {
    canvas.addEventListener('click', function (event) {
      var point = TwinPeeksDraw.eventToLogical(canvas, event);
      onClick(point, canvas);
    });
    // Touch devices fire click too; prevent double-tap zoom from stealing it.
    canvas.addEventListener('touchstart', function (event) {
      event.preventDefault();
    }, { passive: false });
  }

  // Keyboard shortcuts. The callbacks are optional; missing ones are ignored.
  function bindKeys(handlers) {
    document.addEventListener('keydown', function (event) {
      if (event.repeat) return;
      var key = event.key.toLowerCase();
      if (key === 'h' && handlers.onHint) { handlers.onHint(); }
      else if (key === 'm' && handlers.onMute) { handlers.onMute(); }
      else if (key === 'r' && handlers.onRestart) { handlers.onRestart(); }
      else if (key === 'escape' && handlers.onPause) { handlers.onPause(); }
      else if (key === 'enter' && handlers.onConfirm) { handlers.onConfirm(); }
    });
  }

  window.TwinPeeksInput = {
    hitTest: hitTest,
    bindPanelClick: bindPanelClick,
    bindKeys: bindKeys,
  };
})();
