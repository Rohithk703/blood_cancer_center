(function () {
  "use strict";

  const MAPS_URL = "https://maps.app.goo.gl/3TKLfb5aUyR8mV2E7";
  const SHEET_URL = (window.SHEET_WEB_APP_URL || "").trim();

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

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

  const sections = document.querySelectorAll("main section[id], footer[id]");
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
      successBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (form) {
      form.reset();
      form.style.display = "none";
    }
  }

  function showFormError(message) {
    const errorBox = document.getElementById("form-error");
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.classList.add("visible");
      errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      alert(message);
    }
  }

  function submitToGoogleSheet(form) {
    const name = document.getElementById("name")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const service = document.getElementById("service")?.value.trim() || "";
    const message = document.getElementById("message")?.value.trim() || "";

    const body = new URLSearchParams({
      name: name,
      phone: phone,
      email: email,
      service: service,
      message: message,
    }).toString();

    return fetch(SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body,
    }).then(function () {
      showFormSuccess(name || "there");
    });
  }

  const form = document.getElementById("contact-form");

  if (form) {
    form.setAttribute("action", "#");
    form.setAttribute("method", "get");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const errorBox = document.getElementById("form-error");
      if (errorBox) {
        errorBox.classList.remove("visible");
        errorBox.textContent = "";
      }

      if (!SHEET_URL) {
        showFormError(
          "Form is not connected to Google Sheets yet. Admin: add your Apps Script URL in js/config.js (see GOOGLE_SHEETS_SETUP.md)."
        );
        return false;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : "";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      form.classList.add("is-submitting");

      submitToGoogleSheet(form)
        .catch(function () {
          showFormError(
            "Could not send your message. Please try again or call the clinic directly."
          );
        })
        .finally(function () {
          form.classList.remove("is-submitting");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
        });

      return false;
    });
  }

  if (
    location.pathname.includes("thank-you") ||
    location.search.includes("success")
  ) {
    showFormSuccess();
    history.replaceState(null, "", window.location.pathname + "#get-in-touch");
  }

  window.CLINIC_MAPS_URL = MAPS_URL;
})();
