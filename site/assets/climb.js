// The climb: progressive enhancement only, for browsers without scroll-driven animation (where
// site.css drives the route from .climb-track's view timeline and this script does nothing).
// Without it the route behind the title is drawn in full and the blaze stands on the summit.
// It sets one number, --p, from 0 at the top of the page to 1 when the panorama reaches the top of
// the screen; site.css derives the route, the camps, the blaze and the ridges from it. Phones
// keep the route drawn in full.
(function () {
  var track = document.querySelector(".climb-track");
  var frame = document.querySelector(".climb-frame");
  if (!track || !frame) return;
  if (window.CSS && CSS.supports && CSS.supports("animation-timeline: view()")) return;
  if (!window.matchMedia || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var wide = matchMedia("(min-width: 40rem)");

  var queued = false;
  function update() {
    queued = false;
    if (!wide.matches) {
      frame.style.removeProperty("--p");
      return;
    }
    var r = track.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
    frame.style.setProperty("--p", p.toFixed(4));
  }
  function queue() {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(update);
    }
  }
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  update();
})();
