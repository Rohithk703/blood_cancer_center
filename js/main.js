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

  /**
   * Sends data via hidden form POST into iframe.
   * This is the most reliable way to reach Google Apps Script from a static site.
   */
  function submitToGoogleSheet(data) {
    return new Promise(function (resolve, reject) {
      var iframeName = "sheet_submit_frame_" + Date.now();
      var iframe = document.createElement("iframe");
      iframe.name = iframeName;
      iframe.style.display = "none";
      iframe.setAttribute("aria-hidden", "true");

      var settled = false;

      function finish(ok) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        if (tempForm.parentNode) tempForm.parentNode.removeChild(tempForm);
        if (ok) resolve();
        else reject(new Error("Submit failed"));
      }

      iframe.onload = function () {
        finish(true);
      };

      var timer = window.setTimeout(function () {
        finish(true);
      }, 3000);

      var tempForm = document.createElement("form");
      tempForm.method = "POST";
      tempForm.action = SHEET_URL;
      tempForm.target = iframeName;
      tempForm.style.display = "none";

      Object.keys(data).forEach(function (key) {
        var input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = data[key];
        tempForm.appendChild(input);
      });

      document.body.appendChild(iframe);
      document.body.appendChild(tempForm);
      tempForm.submit();
    });
  }

  const form = document.getElementById("contact-form");

  if (form) {
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
          "Form is not connected to Google Sheets. Add your Apps Script URL in js/config.js."
        );
        return false;
      }

      const name = document.getElementById("name")?.value.trim() || "";
      const phone = document.getElementById("phone")?.value.trim() || "";
      const email = document.getElementById("email")?.value.trim() || "";
      const service = document.getElementById("service")?.value.trim() || "";
      const message = document.getElementById("message")?.value.trim() || "";

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : "";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      form.classList.add("is-submitting");

      submitToGoogleSheet({
        name: name,
        phone: phone,
        email: email,
        service: service,
        message: message,
      })
        .then(function () {
          showFormSuccess(name || "there");
        })
        .catch(function () {
          showFormError(
            "Could not send your message. Please try again or call the clinic."
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
