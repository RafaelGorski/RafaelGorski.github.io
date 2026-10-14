// The climb, with JavaScript. Progressive enhancement only: without this script the route behind
// the title draws itself on scroll where CSS can (scroll-driven animation) and is shown drawn in
// full elsewhere, and the six camps are a compact list under the title.
//
// 1. Where CSS has no scroll-driven animation, it sets --p (0 at the top of the page, 1 once the
//    panorama reaches the top of the screen) from scroll, as the CSS would.
// 2. From 40rem it moves the camps' list onto the panorama (.climb-points), each camp's link on its
//    point. Pointing at a camp, moving along the drawing, focusing a camp or tapping it takes that
//    camp in hand: the blaze walks the route to it, the route is drawn solid up to it, and its
//    callout opens. Letting go returns the climb to where the scroll puts it. With reduced motion
//    the blaze jumps to the camp and the route stays drawn.
(function () {
  var track = document.querySelector(".climb-track");
  var frame = document.querySelector(".climb-frame");
  var slot = document.querySelector(".climb-points");
  var head = document.querySelector(".home-head");
  var list = document.getElementById("camps");
  if (!track || !frame || !window.matchMedia || !window.requestAnimationFrame) return;
  var timeline = !!(window.CSS && CSS.supports && CSS.supports("animation-timeline: view()"));
  var still = matchMedia("(prefers-reduced-motion: reduce)");
  var wide = matchMedia("(min-width: 40rem)");

  // Where the scroll puts the climber.
  function scrollP() {
    if (still.matches || !wide.matches) return 1;
    var r = track.getBoundingClientRect();
    return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
  }

  var on = -1; // the camp in hand
  var shown = null; // --p while this script holds it; null when the scroll drives it
  var raf = 0;
  function setP(v, hold) {
    frame.style.setProperty("--p", v.toFixed(4), hold ? "important" : "");
  }
  function follow() {
    if (on >= 0 || shown !== null) return;
    if (timeline || still.matches || !wide.matches) frame.style.removeProperty("--p");
    else setP(scrollP());
  }
  var queued = false;
  function queue() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        follow();
      });
    }
  }
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  follow();

  var camps = list && slot && head ? [].slice.call(list.querySelectorAll(".camp")) : [];
  var f = camps.map(function (c) { return parseFloat(c.getAttribute("data-f")); });
  var x = camps.map(function (c) { return parseFloat(c.style.getPropertyValue("--x")); });
  if (!camps.length || f.some(isNaN) || x.some(isNaN)) return;
  var marks = camps.map(function (c) { return frame.querySelector('.cp[data-camp="' + c.id.slice(5) + '"]'); });

  // Decelerating, with no overshoot.
  function ease(t) { return 1 - Math.pow(1 - t, 4); }
  function current() {
    if (shown !== null) return shown;
    var v = parseFloat(getComputedStyle(frame).getPropertyValue("--p"));
    return isNaN(v) ? 1 : v;
  }
  function glide(to, done) {
    cancelAnimationFrame(raf);
    var from = current();
    var dur = 260 + 540 * Math.min(1, Math.abs(to - from));
    var t0 = performance.now();
    (function step(now) {
      var t = Math.min(1, Math.max(0, (now - t0) / dur));
      shown = from + (to - from) * ease(t);
      setP(shown, true);
      if (t < 1) raf = requestAnimationFrame(step);
      else if (done) done();
    })(t0);
  }
  function mark(i, state) {
    camps[i].classList.toggle("is-on", state);
    if (marks[i]) marks[i].classList.toggle("is-on", state);
  }
  function take(i) {
    if (i === on) return;
    if (on >= 0) mark(on, false);
    on = i;
    mark(i, true);
    if (still.matches) frame.style.setProperty("--b", f[i].toFixed(4));
    else glide(f[i]);
  }
  function release() {
    if (on < 0) return;
    mark(on, false);
    on = -1;
    if (still.matches) {
      frame.style.removeProperty("--b");
      return;
    }
    glide(scrollP(), function () {
      shown = null;
      follow();
    });
  }

  // Without the script the list lives under the title; from 40rem it moves onto the panorama.
  var section = list.closest("section");
  var home = list.parentNode;
  var after = list.nextSibling;
  var mounted = false;
  function fit() {
    if (wide.matches && !mounted) {
      slot.appendChild(list);
      if (section) section.hidden = true;
      mounted = true;
      var m = /^#camp-([a-z]+)$/.exec(location.hash);
      if (m) camps.forEach(function (c, i) { if (c.id === "camp-" + m[1]) take(i); });
    } else if (!wide.matches && mounted) {
      release();
      home.insertBefore(list, after);
      if (section) section.hidden = false;
      mounted = false;
    }
    queue();
  }
  if (wide.addEventListener) wide.addEventListener("change", fit);
  else if (wide.addListener) wide.addListener(fit);
  fit();

  function campOf(el) {
    var c = el && el.closest ? el.closest(".camp") : null;
    return c ? camps.indexOf(c) : -1;
  }
  function nearest(clientX) {
    var r = frame.getBoundingClientRect();
    var u = (clientX - r.left) / r.width;
    var best = 0;
    for (var i = 1; i < x.length; i++) if (Math.abs(x[i] - u) < Math.abs(x[best] - u)) best = i;
    return best;
  }

  // Mouse: the camp nearest the pointer along the drawing is in hand, until the pointer leaves the
  // drawing; while it reads an open callout, that camp stays.
  head.addEventListener("pointermove", function (e) {
    if (!mounted || e.pointerType !== "mouse") return;
    var t = e.target;
    if (t.closest && t.closest(".camp-c")) return;
    var r = frame.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 16 && e.clientY <= r.bottom) take(nearest(e.clientX));
    else if (!slot.contains(document.activeElement)) release();
  });
  head.addEventListener("pointerleave", function (e) {
    if (e.pointerType === "mouse" && !slot.contains(document.activeElement)) release();
  });

  // Touch and pen: the first tap on a camp opens it; the links in its callout go on. A second tap
  // on the camp follows its link. A tap elsewhere lets go.
  var type = "mouse";
  var armed = false;
  slot.addEventListener("pointerdown", function (e) {
    type = e.pointerType || "mouse";
    var i = campOf(e.target);
    armed = i >= 0 && i === on;
  }, true);
  slot.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".camp-a");
    if (!a || !mounted) return;
    var i = campOf(a);
    if (e.detail && type !== "mouse" && !armed) {
      e.preventDefault();
      take(i);
    }
  });
  document.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" && on >= 0 && !camps[on].contains(e.target)) release();
  });

  // Keyboard: focus takes the camp in hand (its callout's links come next in the tab order);
  // Enter follows the focused link; Escape lets go.
  slot.addEventListener("focusin", function (e) {
    var i = campOf(e.target);
    if (i >= 0) take(i);
  });
  slot.addEventListener("focusout", function (e) {
    if (!e.relatedTarget || !slot.contains(e.relatedTarget)) release();
  });
  document.addEventListener("keydown", function (e) {
    type = "key";
    if (e.key === "Escape" && on >= 0) release();
  });
})();
