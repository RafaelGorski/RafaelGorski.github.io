// Radar: progressive enhancement only. Without this script the disc still links every blip
// to its entry, and the ledger reads in full.
(function () {
  var radar = document.querySelector(".radar");
  if (!radar) return;
  var disc = radar.querySelector(".disc");
  var read = radar.querySelector(".disc-read");
  var idle = read ? read.innerHTML : "";
  var target = null;

  function marks(id) {
    return radar.querySelectorAll('.bp[data-b="' + id + '"]');
  }
  function entry(id) {
    return document.getElementById("blip-" + id);
  }
  function say(id) {
    var li = entry(id);
    if (!li || !read) return;
    var parts = li.getAttribute("data-say").split(" · ");
    read.textContent = "";
    var b = document.createElement("b");
    b.textContent = parts.slice(0, 2).join(" · ");
    read.appendChild(b);
    read.appendChild(document.createTextNode(" · " + parts.slice(2).join(" · ")));
  }
  function light(id, on) {
    marks(id).forEach(function (m) { m.classList.toggle("is-lit", on); });
    var li = entry(id);
    if (li) li.classList.toggle("is-lit", on);
    if (on) say(id);
    else if (target) say(target);
    else if (read) read.innerHTML = idle;
  }
  function fromHash() {
    if (target) marks(target).forEach(function (m) { m.classList.remove("is-target"); });
    var m = /^#blip-([a-z0-9-]+)$/.exec(location.hash);
    target = m && entry(m[1]) ? m[1] : null;
    if (target) {
      marks(target).forEach(function (el) { el.classList.add("is-target"); });
      say(target);
    } else if (read) read.innerHTML = idle;
  }

  radar.querySelectorAll(".blip").forEach(function (li) {
    var id = li.getAttribute("data-b");
    li.addEventListener("mouseenter", function () { light(id, true); });
    li.addEventListener("mouseleave", function () { light(id, false); });
    li.addEventListener("focusin", function () { light(id, true); });
    li.addEventListener("focusout", function () { light(id, false); });
  });
  radar.querySelectorAll(".bp").forEach(function (a) {
    var id = a.getAttribute("data-b");
    a.addEventListener("mouseenter", function () { light(id, true); });
    a.addEventListener("mouseleave", function () { light(id, false); });
  });
  window.addEventListener("hashchange", fromHash);
  fromHash();

  // The quadrant being read stays at full strength on the disc.
  if (disc && "IntersectionObserver" in window) {
    var visible = new Set();
    var order = [];
    var io = new IntersectionObserver(
      function (records) {
        records.forEach(function (r) {
          var q = r.target.getAttribute("data-q");
          if (r.isIntersecting) visible.add(q);
          else visible.delete(q);
        });
        var current = order.filter(function (q) { return visible.has(q); })[0];
        if (current) disc.setAttribute("data-q", current);
        else disc.removeAttribute("data-q");
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    radar.querySelectorAll(".rq").forEach(function (s) {
      order.push(s.getAttribute("data-q"));
      io.observe(s);
    });
  }
})();
