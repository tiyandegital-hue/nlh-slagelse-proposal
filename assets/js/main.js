/* Tømrermester NLH — interactions
   Nav toggle · header shadow · scroll reveal · FAQ accordions
   Projekter filter · before/after sliders · quote forms (client-side only) */
(function () {
  "use strict";

  /* ---------- header ---------- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "LUK ×" : "MENU ☰";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "MENU ☰";
      }
    });
  }

  /* ---------- active nav link ---------- */
  var page = document.body.getAttribute("data-page");
  if (page && nav) {
    nav.querySelectorAll("a").forEach(function (a) {
      if (a.getAttribute("data-nav") === page) a.classList.add("active");
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- FAQ accordions ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    if (!btn || !panel) return;
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      // close siblings in the same faq list
      var list = item.closest(".faq");
      if (list) {
        list.querySelectorAll(".faq-item.open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("open");
            other.querySelector(".faq-a").style.maxHeight = null;
            other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
          }
        });
      }
      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : null;
    });
  });

  /* ---------- Projekter filter ---------- */
  var filterBar = document.querySelector(".filter-bar");
  if (filterBar) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".proj-card"));
    var countLabel = document.getElementById("filter-count");
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      var f = btn.getAttribute("data-filter");
      var shown = 0;
      cards.forEach(function (card) {
        var show = f === "alle" || card.getAttribute("data-cat") === f;
        card.classList.toggle("hidden", !show);
        if (show) shown += 1;
      });
      if (countLabel) countLabel.textContent = "Viser " + shown + " af " + cards.length + " pladser";
    });
  }

  /* ---------- before / after sliders ---------- */
  document.querySelectorAll(".ba-slider").forEach(function (slider) {
    var range = slider.parentElement.querySelector(".ba-range");
    var setPos = function (pct) {
      pct = Math.max(2, Math.min(98, pct));
      slider.style.setProperty("--pos", pct + "%");
      if (range) range.value = pct;
    };
    if (range) {
      range.addEventListener("input", function () { setPos(Number(range.value)); });
    }
    var dragging = false;
    var fromEvent = function (e) {
      var rect = slider.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      setPos((x / rect.width) * 100);
    };
    slider.addEventListener("pointerdown", function (e) {
      dragging = true;
      slider.setPointerCapture(e.pointerId);
      fromEvent(e);
    });
    slider.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (evt) {
      slider.addEventListener(evt, function () { dragging = false; });
    });
    slider.addEventListener("keydown", function (e) {
      var cur = parseFloat(getComputedStyle(slider).getPropertyValue("--pos")) || 50;
      if (e.key === "ArrowLeft") { setPos(cur - 5); e.preventDefault(); }
      if (e.key === "ArrowRight") { setPos(cur + 5); e.preventDefault(); }
    });
  });

  /* ---------- quote forms: client-side validation + success state ----------
     No backend: nothing is sent to a server. The success state says the
     carpenter will call back, and a demo note explains the form is a demo. */
  document.querySelectorAll("form.quote-form").forEach(function (form) {
    var success = form.parentElement.querySelector(".form-success");
    var setInvalid = function (field, bad) {
      field.classList.toggle("invalid", bad);
      var input = field.querySelector("input, select, textarea");
      if (input) input.setAttribute("aria-invalid", bad ? "true" : "false");
      return !bad;
    };
    var validateField = function (field) {
      var input = field.querySelector("input, select, textarea");
      if (!input) return true;
      var val = (input.value || "").trim();
      var ok = true;
      if (input.hasAttribute("required") && !val) ok = false;
      if (ok && input.type === "email" && val) {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
      }
      if (ok && input.type === "tel" && val) {
        ok = val.replace(/[\s+()-]/g, "").length >= 8 && /^[+0-9][0-9\s()+-]*$/.test(val);
      }
      if (ok && input.tagName === "TEXTAREA" && input.hasAttribute("required")) {
        ok = val.length >= 10;
      }
      if (ok && input.tagName === "INPUT" && input.name === "navn") {
        ok = val.length >= 2;
      }
      return setInvalid(field, !ok);
    };
    form.querySelectorAll(".field").forEach(function (field) {
      var input = field.querySelector("input, select, textarea");
      if (input) {
        input.addEventListener("blur", function () { validateField(field); });
        input.addEventListener("input", function () {
          if (field.classList.contains("invalid")) validateField(field);
        });
      }
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allOk = true;
      form.querySelectorAll(".field").forEach(function (field) {
        if (!validateField(field)) allOk = false;
      });
      var consent = form.querySelector('input[type="checkbox"][required]');
      if (consent && !consent.checked) {
        allOk = false;
        consent.closest(".check-field").style.outline = "2px solid var(--orange)";
        consent.closest(".check-field").style.outlineOffset = "4px";
        consent.closest(".check-field").style.borderRadius = "4px";
      } else if (consent) {
        consent.closest(".check-field").style.outline = "";
      }
      if (!allOk) {
        var firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        if (firstBad) firstBad.focus();
        return;
      }
      form.style.display = "none";
      if (success) {
        success.classList.add("show");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
  });
})();
