// The climb: progressive enhancement only, for browsers without scroll-driven animation (where
// site.css draws the route from the camps' own view timelines and this script does nothing).
// Without it the route is drawn in full, every camp is shown and the blaze stands on the summit.
// It sets one number, --p, from 0 at the first camp to 1 on the summit, while each camp crosses
// the reading line; site.css derives the route, the camps, the blaze and the ridges from it.
(function () {
  var climb = document.querySelector(".climb");
  if (!climb) return;
  if (window.CSS && CSS.supports && CSS.supports("animation-timeline: view()")) return;
  if (!window.matchMedia || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var body = climb.querySelector(".climb-body");
  var camps = [].slice.call(climb.querySelectorAll(".camp"));
  var f = camps.map(function (c) { return parseFloat(c.getAttribute("data-f")); });
  if (!body || camps.length < 2 || f.some(isNaN)) return;
  document.documentElement.classList.add("climb-js");

  var queued = false;
  function line() {
    var v = parseFloat(getComputedStyle(climb).getPropertyValue("--line"));
    return ((isNaN(v) ? 56 : v) / 100) * window.innerHeight;
  }
  function update() {
    queued = false;
    var y = line();
    var p = 0;
    for (var i = 0; i < camps.length - 1; i++) {
      var r = camps[i].getBoundingClientRect();
      if (r.top > y) break;
      var t = Math.min(1, (y - r.top) / Math.max(1, r.height));
      p = f[i] + (f[i + 1] - f[i]) * t;
    }
    body.style.setProperty("--p", p.toFixed(4));
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

  // Each camp's text settles in as it enters view.
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (records) {
        records.forEach(function (r) {
          if (r.isIntersecting) {
            r.target.classList.add("is-in");
            io.unobserve(r.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    camps.forEach(function (c) { io.observe(c); });
  } else {
    camps.forEach(function (c) { c.classList.add("is-in"); });
  }
})();
