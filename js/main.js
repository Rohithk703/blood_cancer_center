(function () {
  "use strict";

  const MAPS_URL = "https://share.google/4bghoMILRT78vWleW";

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

  // Contact form (local demo; Netlify Forms handles real submissions when deployed)
  const form = document.getElementById("contact-form");
  const successBox = document.getElementById("form-success");

  if (form) {
    form.addEventListener("submit", (e) => {
      const onNetlify =
        location.hostname.endsWith(".netlify.app") ||
        location.hostname.endsWith(".netlify.live");

      if (!onNetlify) {
        e.preventDefault();
        const name = document.getElementById("name")?.value.trim() || "there";

        if (successBox) {
          successBox.textContent =
            "Thank you, " + name + "! We have received your message and will contact you soon.";
          successBox.classList.add("visible");
          form.style.display = "none";
        } else {
          alert(
            "Thank you, " + name + "! We have received your message and will contact you soon."
          );
        }

        form.reset();
      }
    });
  }

  // Expose maps URL for any future scripts
  window.CLINIC_MAPS_URL = MAPS_URL;
})();
