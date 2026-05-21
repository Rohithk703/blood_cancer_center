(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("visible");
    });
    return;
  }

  /* ── Floating blood cells (DOM) ── */
  function initBloodCells() {
    const layer = document.getElementById("blood-fx-layer");
    if (!layer) return;

    const sizes = ["sm", "md", "lg"];
    const count = window.innerWidth < 768 ? 18 : 35;

    for (let i = 0; i < count; i++) {
      const cell = document.createElement("div");
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const duration = 12 + Math.random() * 18;
      const delay = Math.random() * duration;
      const left = Math.random() * 100;
      const drift = (Math.random() - 0.5) * 120;

      cell.className = "blood-cell blood-cell--" + size;
      cell.style.cssText =
        "left:" +
        left +
        "%;" +
        "animation-duration:" +
        duration +
        "s;" +
        "animation-delay:" +
        (-delay) +
        "s;" +
        "--drift:" +
        drift +
        "px;";

      layer.appendChild(cell);
    }
  }

  /* ── Canvas particle stream ── */
  function initCanvasParticles() {
    const canvas = document.getElementById("fx-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let w, h;
    const particles = [];
    const count = window.innerWidth < 768 ? 40 : 80;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.6,
        alpha: 0.2 + Math.random() * 0.5,
        hue: 340 + Math.random() * 30,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        grad.addColorStop(0, "hsla(" + p.hue + ", 80%, 55%, " + p.alpha + ")");
        grad.addColorStop(1, "hsla(" + p.hue + ", 70%, 40%, 0)");

        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    draw();
  }

  /* ── Scroll reveal ── */
  function initScrollReveal() {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Parallax on hero ── */
  function initHeroParallax() {
    const hero = document.querySelector(".hero-bg");
    if (!hero) return;

    window.addEventListener(
      "scroll",
      function () {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          hero.style.transform = "translateY(" + y * 0.25 + "px)";
        }
      },
      { passive: true }
    );
  }

  /* ── Mouse glow on hero ── */
  function initHeroGlow() {
    const hero = document.querySelector(".hero");
    if (!hero || window.innerWidth < 768) return;

    hero.addEventListener(
      "mousemove",
      function (e) {
        const rect = hero.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty("--mx", x + "%");
        hero.style.setProperty("--my", y + "%");
      },
      { passive: true }
    );
  }

  initBloodCells();
  initCanvasParticles();
  initScrollReveal();
  initHeroParallax();
  initHeroGlow();
})();
