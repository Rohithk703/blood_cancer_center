(function () {
  "use strict";

  const MAPS_URL = "https://maps.app.goo.gl/3TKLfb5aUyR8mV2E7";
  const SHEET_URL = (
    window.SHEET_WEB_APP_URL ||
    "https://script.google.com/macros/s/AKfycbyY3nk1qY7iltwLgqOeZgVUDhqyheKTi88YERb3jurc7hrxEVnKxsAk49Ns9VQu13bX/exec"
  ).trim();

  let isSubmitting = false;

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

  function cleanUrl() {
    const hash = location.hash || "#get-in-touch";
    history.replaceState(null, "", location.pathname + hash);
  }

  function clearFieldErrors() {
    document.querySelectorAll(".form-group").forEach((group) => {
      group.classList.remove("invalid");
      const err = group.querySelector(".field-error");
      if (err) {
        err.textContent = "";
      }
    });
  }

  function setFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const group = input.closest(".form-group");
    if (!group) return;
    group.classList.add("invalid");
    let err = group.querySelector(".field-error");
    if (!err) {
      err = document.createElement("span");
      err.className = "field-error";
      err.setAttribute("role", "alert");
      group.appendChild(err);
    }
    err.textContent = message;
  }

  function validateForm(data) {
    const errors = [];
    clearFieldErrors();

    if (!data.name || data.name.length < 2) {
      const msg = "Please enter your full name (at least 2 characters).";
      setFieldError("name", msg);
      errors.push(msg);
    } else if (!/^[a-zA-Z\s.'-]+$/.test(data.name)) {
      const msg = "Name should contain only letters.";
      setFieldError("name", msg);
      errors.push(msg);
    }

    const phoneDigits = data.phone.replace(/\D/g, "");
    if (!phoneDigits) {
      const msg = "Please enter your phone number.";
      setFieldError("phone", msg);
      errors.push(msg);
    } else if (phoneDigits.length < 10) {
      const msg = "Phone number must be at least 10 digits.";
      setFieldError("phone", msg);
      errors.push(msg);
    } else if (phoneDigits.length > 15) {
      const msg = "Phone number is too long.";
      setFieldError("phone", msg);
      errors.push(msg);
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      const msg = "Please enter a valid email address.";
      setFieldError("email", msg);
      errors.push(msg);
    }

    if (!data.message || data.message.length < 3) {
      const msg = "Please enter a message (at least 3 characters).";
      setFieldError("message", msg);
      errors.push(msg);
    }

    return errors;
  }

  function showFormSuccess() {
    const form = document.getElementById("contact-form");
    const successBox = document.getElementById("form-success");

    cleanUrl();

    if (successBox) {
      successBox.textContent =
        "Thank you! We have received your message and will get back to you soon.";
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

  function showFormError(message) {
    const errorBox = document.getElementById("form-error");
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.classList.add("visible");
      errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function hideFormError() {
    const errorBox = document.getElementById("form-error");
    if (errorBox) {
      errorBox.textContent = "";
      errorBox.classList.remove("visible");
    }
  }

  function getFormData() {
    return {
      name: document.getElementById("name")?.value.trim() || "",
      phone: document.getElementById("phone")?.value.trim() || "",
      email: document.getElementById("email")?.value.trim() || "",
      service: document.getElementById("service")?.value.trim() || "",
      message: document.getElementById("message")?.value.trim() || "",
    };
  }

  function sendToGoogleSheet(data) {
    const body = new URLSearchParams({
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: data.service,
      message: data.message,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([body.toString()], {
        type: "application/x-www-form-urlencoded",
      });
      navigator.sendBeacon(SHEET_URL, blob);
    }

    return fetch(SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      body: body,
    }).catch(function () {
      return null;
    });
  }

  function resetSubmitButton(submitBtn, originalText) {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
    const form = document.getElementById("contact-form");
    if (form) {
      form.classList.remove("is-submitting");
    }
    isSubmitting = false;
  }

  function handleSend() {
    if (isSubmitting) return;

    hideFormError();

    if (!SHEET_URL) {
      showFormError("Form is not connected to Google Sheets. Contact the site admin.");
      return;
    }

    const data = getFormData();
    const errors = validateForm(data);

    if (errors.length > 0) {
      showFormError("Please fix the highlighted fields below.");
      const firstInvalid = document.querySelector(".form-group.invalid input, .form-group.invalid textarea, .form-group.invalid select");
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    const form = document.getElementById("contact-form");
    const submitBtn = document.getElementById("form-submit-btn");
    const originalText = submitBtn ? submitBtn.textContent : "Send message";

    isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }
    if (form) {
      form.classList.add("is-submitting");
    }

    sendToGoogleSheet(data)
      .then(function () {
        showFormSuccess();
      })
      .catch(function () {
        showFormSuccess();
      })
      .finally(function () {
        resetSubmitButton(submitBtn, originalText);
      });
  }

  const submitBtn = document.getElementById("form-submit-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", handleSend);
  }

  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      handleSend();
      return false;
    });

    form.querySelectorAll("input, textarea, select").forEach(function (el) {
      el.addEventListener("input", function () {
        const group = el.closest(".form-group");
        if (group) {
          group.classList.remove("invalid");
        }
        hideFormError();
      });
    });
  }

  (function handleLegacyQuerySubmit() {
    const qs = new URLSearchParams(location.search);
    if (!qs.has("name") && !qs.has("phone")) {
      return;
    }

    const data = {
      name: qs.get("name") || "",
      phone: qs.get("phone") || "",
      email: qs.get("email") || "",
      service: qs.get("service") || "",
      message: qs.get("message") || "",
    };

    cleanUrl();

    if (SHEET_URL && data.name && data.phone) {
      sendToGoogleSheet(data).finally(showFormSuccess);
    } else {
      showFormSuccess();
    }
  })();

  window.CLINIC_MAPS_URL = MAPS_URL;
})();
