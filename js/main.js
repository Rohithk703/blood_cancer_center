(function () {
  "use strict";

  const MAPS_URL = "https://maps.app.goo.gl/3TKLfb5aUyR8mV2E7";
  const SHEET_URL = (
    window.SHEET_WEB_APP_URL ||
    "https://script.google.com/macros/s/AKfycbyY3nk1qY7iltwLgqOeZgVUDhqyheKTi88YERb3jurc7hrxEVnKxsAk49Ns9VQu13bX/exec"
  ).trim();

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

  function showFormSuccess(name) {
    const form = document.getElementById("contact-form");
    const successBox = document.getElementById("form-success");
    const displayName = name || "there";

    cleanUrl();

    if (successBox) {
      successBox.textContent =
        "Thank you! We have received your message and will get back to you soon.";
      successBox.classList.add("visible");
      successBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (form) {
      form.reset();
      form.style.display = "none";
    }

    const section = document.getElementById("get-in-touch");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
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

  function getFormData() {
    return {
      name: document.getElementById("name")?.value.trim() || "",
      phone: document.getElementById("phone")?.value.trim() || "",
      email: document.getElementById("email")?.value.trim() || "",
      service: document.getElementById("service")?.value.trim() || "",
      message: document.getElementById("message")?.value.trim() || "",
    };
  }

  /** POST to Google Apps Script (hidden form — does not change page URL) */
  function submitToGoogleSheet(data) {
    return new Promise(function (resolve) {
      const iframeName = "hidden_sheet_frame";
      let iframe = document.getElementById(iframeName);

      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.name = iframeName;
        iframe.id = iframeName;
        iframe.style.display = "none";
        iframe.setAttribute("aria-hidden", "true");
        document.body.appendChild(iframe);
      }

      const tempForm = document.createElement("form");
      tempForm.method = "POST";
      tempForm.action = SHEET_URL;
      tempForm.target = iframeName;
      tempForm.style.display = "none";

      Object.keys(data).forEach(function (key) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = data[key];
        tempForm.appendChild(input);
      });

      document.body.appendChild(tempForm);
      tempForm.submit();

      window.setTimeout(function () {
        if (tempForm.parentNode) {
          tempForm.parentNode.removeChild(tempForm);
        }
        resolve();
      }, 2500);
    });
  }

  function handleSend() {
    const form = document.getElementById("contact-form");
    const errorBox = document.getElementById("form-error");

    if (errorBox) {
      errorBox.classList.remove("visible");
      errorBox.textContent = "";
    }

    if (!SHEET_URL) {
      showFormError("Form is not connected to Google Sheets yet.");
      return;
    }

    const data = getFormData();

    if (!data.name || !data.phone || !data.message) {
      showFormError("Please fill in name, phone, and message.");
      return;
    }

    const submitBtn = document.getElementById("form-submit-btn");
    const originalText = submitBtn ? submitBtn.textContent : "";

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }
    if (form) {
      form.classList.add("is-submitting");
    }

    submitToGoogleSheet(data)
      .then(function () {
        showFormSuccess(data.name);
      })
      .catch(function () {
        showFormError("Could not send. Please call the clinic directly.");
      })
      .finally(function () {
        if (form) {
          form.classList.remove("is-submitting");
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
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
  }

  // Fix old broken URLs like ?name=Rohith&phone=... — save to sheet, show thanks, clean URL
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

    if (SHEET_URL && (data.name || data.phone)) {
      submitToGoogleSheet(data).finally(function () {
        showFormSuccess(data.name);
      });
    } else {
      showFormSuccess(data.name);
    }
  })();

  window.CLINIC_MAPS_URL = MAPS_URL;
})();
