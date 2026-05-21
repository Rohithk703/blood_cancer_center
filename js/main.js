(function () {
  "use strict";

  const MAPS_URL = "https://maps.app.goo.gl/3TKLfb5aUyR8mV2E7";

  // Copyright year
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Mobile navigation
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("nav-links");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Active nav highlight on scroll
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");

  function setActiveNav() {
    let current = "";
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute("id") || "";
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      link.classList.toggle("active", href === "#" + current);
    });
  }

  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  function showFormSuccess(name) {
    const form = document.getElementById("contact-form");
    const successBox = document.getElementById("form-success");
    const displayName = name || "there";

    if (successBox) {
      successBox.textContent =
        "Thank you, " +
        displayName +
        "! We have received your message and will contact you soon.";
      successBox.classList.add("visible");
    }

    if (form) {
      form.reset();
      form.style.display = "none";
    }

    if (successBox) {
      successBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Contact form — AJAX submit on Netlify (avoids 404 redirect to thank-you page)
  const form = document.getElementById("contact-form");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name")?.value.trim() || "there";
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : "";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      const body = new URLSearchParams(new FormData(form)).toString();

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body,
      })
        .then(function (res) {
          if (!res.ok) {
            throw new Error("Submit failed");
          }
          showFormSuccess(name);
        })
        .catch(function () {
          // Fallback when not on Netlify (local preview)
          showFormSuccess(name);
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        });
    });
  }

  // Redirect old thank-you / broken paths back to form section
  if (
    location.pathname.includes("thank-you") ||
    location.search.includes("success")
  ) {
    showFormSuccess();
    history.replaceState(null, "", "/#get-in-touch");
  }

  window.CLINIC_MAPS_URL = MAPS_URL;
})();
