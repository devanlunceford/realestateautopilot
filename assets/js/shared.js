/* ============================================================
   REAL ESTATE AUTOPILOT — SHARED UI BEHAVIORS
   nav active state · reveal on scroll · count-up · sparklines
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Nav: mark the active link ----------
  function markActiveNav() {
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href").split("#")[0];
      if (href === path) a.classList.add("active");
    });
  }

  // ---------- Footer year ----------
  function setYear() {
    var el = document.getElementById("ft-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  // ---------- Reveal on scroll (also catches .reveal nodes added after load) ----------
  function initReveal() {
    if (!("IntersectionObserver" in window) || reduceMotion) {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
      if (!reduceMotion) return;
      // keep late-added nodes visible under reduced motion
      new MutationObserver(function () {
        document.querySelectorAll(".reveal:not(.in)").forEach(function (el) { el.classList.add("in"); });
      }).observe(document.body, { childList: true, subtree: true });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    function observeAll() {
      document.querySelectorAll(".reveal:not(.in)").forEach(function (el) {
        if (!el.__raiRevealed) { el.__raiRevealed = true; io.observe(el); }
      });
    }
    observeAll();
    new MutationObserver(observeAll).observe(document.body, { childList: true, subtree: true });
    window.RAIUI && (window.RAIUI.refreshReveals = observeAll);
  }

  // ---------- Count-up for [data-count] ----------
  // usage: <span data-count="184" data-prefix="$" data-suffix="K" data-decimals="0">0</span>
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    var decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduceMotion) { el.textContent = prefix + target.toFixed(decimals) + suffix; return; }
    var dur = 1400, t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  // ---------- Sparkline: RAIUI.spark(container, values, {color, fill, h, w}) ----------
  function spark(container, values, opts) {
    opts = opts || {};
    var w = opts.w || container.clientWidth || 120;
    var h = opts.h || container.clientHeight || 36;
    var color = opts.color || "var(--signal)";
    var pad = 3;
    var min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    var range = max - min || 1;
    var pts = values.map(function (v, i) {
      var x = pad + (i / (values.length - 1)) * (w - pad * 2);
      var y = h - pad - ((v - min) / range) * (h - pad * 2);
      return [x.toFixed(1), y.toFixed(1)];
    });
    var line = pts.map(function (p) { return p.join(","); }).join(" ");
    var area = line + " " + (w - pad) + "," + (h - 1) + " " + pad + "," + (h - 1);
    var id = "sg" + Math.random().toString(36).slice(2, 8);
    var svg =
      '<svg viewBox="0 0 ' + w + " " + h + '" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + color + '" stop-opacity="0.28"/>' +
      '<stop offset="1" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
      (opts.fill !== false ? '<polygon points="' + area + '" fill="url(#' + id + ')"/>' : "") +
      '<polyline points="' + line + '" fill="none" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="' + pts[pts.length - 1][0] + '" cy="' + pts[pts.length - 1][1] + '" r="2.6" fill="' + color + '"/>' +
      "</svg>";
    container.innerHTML = svg;
  }

  // ---------- Theme toggle (light "paper" / dark ink, injected on every page) ----------
  // A tiny pre-paint script in each page <head> applies the saved theme before
  // CSS renders; this adds the nav toggle and keeps localStorage in sync.
  function initTheme() {
    var KEY = "rai-theme";
    var root = document.documentElement;

    function isLight() { return root.getAttribute("data-theme") === "light"; }
    function apply(light) {
      if (light) root.setAttribute("data-theme", "light");
      else root.removeAttribute("data-theme");
    }

    try { apply(localStorage.getItem(KEY) === "light"); } catch (e) { /* private mode */ }

    var navRight = document.querySelector(".nav-right");
    if (!navRight || navRight.querySelector(".theme-btn")) return;

    var SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>';
    var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.6 13.2A8.2 8.2 0 1 1 10.8 3.4a6.8 6.8 0 0 0 9.8 9.8z"/></svg>';

    var btn = document.createElement("button");
    btn.className = "theme-btn";
    btn.type = "button";

    function paint() {
      var light = isLight();
      btn.innerHTML = light ? MOON : SUN;
      var label = light ? "Switch to dark mode" : "Switch to light mode";
      btn.setAttribute("aria-label", label);
      btn.title = label;
    }

    btn.addEventListener("click", function () {
      var next = !isLight();
      apply(next);
      try { localStorage.setItem(KEY, next ? "light" : "dark"); } catch (e) { /* private mode */ }
      paint();
    });

    paint();
    navRight.insertBefore(btn, navRight.firstChild);
  }

  // ---------- Command palette (⌘K / Ctrl+K, injected on every page) ----------
  function initPalette() {
    if (!window.RAI || document.querySelector(".pal-overlay")) return;

    var items = [
      { type: "page", label: "Mission Control", sub: "index.html", href: "index.html", color: "var(--gold)" },
      { type: "page", label: "The Roster", sub: "agents.html", href: "agents.html", color: "var(--gold)" },
      { type: "page", label: "Playbooks", sub: "playbooks.html", href: "playbooks.html", color: "var(--gold)" },
      { type: "page", label: "Live Ops", sub: "ops.html", href: "ops.html", color: "var(--gold)" }
    ];
    RAI.agents.forEach(function (a) {
      items.push({ type: "agent", label: a.name, sub: a.codename + " · " + a.dept, href: "agent.html?id=" + a.id, color: RAI.color(a) });
    });
    (RAI.playbooks || []).forEach(function (p) {
      var a = RAI.getAgent(p.agentId);
      items.push({ type: "playbook", label: p.cmd + "  " + p.name, sub: a ? a.codename : "", href: "playbooks.html#" + p.cmd.slice(1), color: a ? RAI.color(a) : "var(--gold)" });
    });

    var ov = document.createElement("div");
    ov.className = "pal-overlay";
    ov.innerHTML =
      '<div class="pal glass-notch" role="dialog" aria-modal="true" aria-label="Command palette">' +
      '<div class="pal-head"><span class="pal-prompt mono">&rsaquo;</span>' +
      '<input class="pal-input" type="text" autocomplete="off" spellcheck="false" ' +
      'placeholder="Jump to an agent, playbook, page — or type a task to deploy" aria-label="Search commands">' +
      '<span class="tag">esc</span></div>' +
      '<div class="pal-list" role="listbox"></div>' +
      '<div class="pal-foot mono">&uarr;&darr; move &middot; &crarr; open &middot; anything else deploys as a mission</div>' +
      "</div>";
    document.body.appendChild(ov);

    var input = ov.querySelector(".pal-input");
    var list = ov.querySelector(".pal-list");
    var active = 0, current = [];

    function render(q) {
      var query = q.trim().toLowerCase();
      current = !query ? items.slice(0, 9) : items.filter(function (it) {
        return (it.label + " " + it.sub).toLowerCase().indexOf(query) !== -1;
      }).slice(0, 8);
      if (q.trim().length >= 3) {
        current = current.concat([{
          type: "deploy", label: 'Deploy: "' + q.trim() + '"', sub: "TOWER routes it live",
          href: "index.html?task=" + encodeURIComponent(q.trim()) + "#console", color: "var(--signal)"
        }]);
      }
      active = 0;
      list.innerHTML = "";
      current.forEach(function (it, i) {
        var a = document.createElement("a");
        a.className = "pal-item" + (i === 0 ? " active" : "");
        a.href = it.href;
        a.style.setProperty("--ac", it.color);
        var dot = document.createElement("i"); dot.className = "pal-dot";
        var txt = document.createElement("div"); txt.className = "pal-txt";
        var lb = document.createElement("div"); lb.className = "pal-label"; lb.textContent = it.label;
        var sb = document.createElement("div"); sb.className = "pal-sub mono"; sb.textContent = it.sub;
        txt.appendChild(lb); txt.appendChild(sb);
        var tp = document.createElement("span"); tp.className = "tag pal-type"; tp.textContent = it.type;
        a.appendChild(dot); a.appendChild(txt); a.appendChild(tp);
        a.addEventListener("mouseenter", function () { setActive(i); });
        list.appendChild(a);
      });
      if (!current.length) {
        var empty = document.createElement("div");
        empty.className = "pal-empty mono";
        empty.textContent = "Nothing matches. Keep typing to deploy it as a task.";
        list.appendChild(empty);
      }
    }

    function setActive(i) {
      var rows = list.querySelectorAll(".pal-item");
      if (!rows.length) return;
      active = (i + rows.length) % rows.length;
      rows.forEach(function (r, n) { r.classList.toggle("active", n === active); });
      rows[active].scrollIntoView({ block: "nearest" });
    }

    function open() { ov.classList.add("open"); input.value = ""; render(""); setTimeout(function () { input.focus(); }, 30); }
    function close() { ov.classList.remove("open"); input.blur(); }

    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(active - 1); }
      else if (e.key === "Enter") {
        var rows = list.querySelectorAll(".pal-item");
        if (rows[active]) location.href = rows[active].getAttribute("href");
      } else if (e.key === "Escape") close();
    });
    ov.addEventListener("mousedown", function (e) { if (e.target === ov) close(); });
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        ov.classList.contains("open") ? close() : open();
      } else if (e.key === "Escape" && ov.classList.contains("open")) close();
    });

    var navRight = document.querySelector(".nav-right");
    if (navRight) {
      var btn = document.createElement("button");
      btn.className = "pal-btn mono";
      btn.type = "button";
      btn.title = "Command palette";
      btn.setAttribute("aria-label", "Open command palette");
      btn.innerHTML = "&#8984;K";
      btn.addEventListener("click", open);
      navRight.insertBefore(btn, navRight.firstChild);
    }
  }

  // ---------- Tiny helpers ----------
  function qsParam(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function timeStamp() {
    var d = new Date();
    return [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (n) {
      return String(n).padStart(2, "0");
    }).join(":");
  }

  window.RAIUI = {
    spark: spark,
    countUp: countUp,
    qsParam: qsParam,
    timeStamp: timeStamp,
    reduceMotion: reduceMotion
  };

  document.addEventListener("DOMContentLoaded", function () {
    markActiveNav();
    setYear();
    initTheme();
    initReveal();
    initCounters();
    initPalette();
  });
})();
