/* SmartJobs — login & register forms (validation + real API calls). */
(function () {
  "use strict";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Only same-site .html paths are allowed as post-login redirects (prevents open redirects).
  var SAFE_REDIRECT = /^[A-Za-z0-9._-]+\.html(\?[A-Za-z0-9=&%._-]*)?$/;

  function $(id) { return document.getElementById(id); }

  function setInvalid(input, invalid, message) {
    input.classList.toggle("is-invalid", invalid);
    if (invalid && message) {
      var fb = input.parentElement.querySelector(".invalid-feedback");
      if (fb) fb.textContent = message;
    }
    return !invalid;
  }

  function showFormAlert(form, message) {
    var el = form.querySelector("#formAlert");
    if (!el) {
      el = document.createElement("div");
      el.id = "formAlert";
      el.className = "alert alert-danger py-2 small";
      el.setAttribute("role", "alert");
      form.insertBefore(el, form.firstChild);
    }
    el.textContent = message;
  }

  function clearFormAlert(form) {
    var el = form.querySelector("#formAlert");
    if (el) el.remove();
  }

  function setBusy(button, busy, label) {
    if (busy) {
      button.dataset.label = button.textContent;
      button.disabled = true;
      button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>' + label;
    } else {
      button.disabled = false;
      button.textContent = button.dataset.label || label;
    }
  }

  function afterAuthRedirect(user) {
    var target = new URLSearchParams(window.location.search).get("redirect");
    if (target && SAFE_REDIRECT.test(target)) {
      window.location.href = target;
    } else {
      window.location.href = user.role === "student" ? "dashboard.html" : "index.html";
    }
  }

  // Clear a field's error state as soon as the user edits it.
  function liveClear(form) {
    form.addEventListener("input", function (e) {
      if (e.target.classList && e.target.classList.contains("is-invalid")) e.target.classList.remove("is-invalid");
    });
  }

  // ---------------- login ----------------
  var loginForm = $("loginForm");
  if (loginForm) {
    liveClear(loginForm);
    var forgot = loginForm.querySelector('a[href="#"]');
    if (forgot) {
      forgot.addEventListener("click", function (e) {
        e.preventDefault();
        window.SJ.toast("Password reset isn't available yet — contact support.", "");
      });
    }
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFormAlert(loginForm);
      var email = $("email");
      var password = $("password");
      var okEmail = setInvalid(email, !EMAIL_RE.test(email.value.trim()), "Please enter a valid email address.");
      var okPass = setInvalid(password, password.value.length === 0, "Please enter your password.");
      if (!okEmail || !okPass) return;

      var button = loginForm.querySelector('button[type="submit"]');
      setBusy(button, true, "Logging in…");
      window.SJApi.post("/api/login", { email: email.value.trim(), password: password.value }).then(
        function (data) {
          window.SJApi.setSession(data.token, data.user, $("rememberMe").checked);
          afterAuthRedirect(data.user);
        },
        function (err) {
          setBusy(button, false, "Login");
          showFormAlert(loginForm, err.message);
        }
      );
    });
  }

  // ---------------- register ----------------
  var registerForm = $("registerForm");
  if (registerForm) {
    liveClear(registerForm);
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFormAlert(registerForm);
      var name = $("fullName");
      var email = $("email");
      var password = $("password");
      var confirm = $("confirmPassword");

      var results = [
        setInvalid(name, name.value.trim().length < 2, "Please enter your full name."),
        setInvalid(email, !EMAIL_RE.test(email.value.trim()), "Please enter a valid email address."),
        setInvalid(password, password.value.length < 6, "Password must be at least 6 characters."),
        setInvalid(confirm, confirm.value !== password.value || confirm.value.length === 0, "Passwords do not match."),
      ];
      if (results.indexOf(false) !== -1) return;

      var roleInput = registerForm.querySelector('input[name="userType"]:checked');
      var button = registerForm.querySelector('button[type="submit"]');
      setBusy(button, true, "Creating account…");
      window.SJApi.post("/api/register", {
        name: name.value.trim(),
        email: email.value.trim(),
        password: password.value,
        role: roleInput ? roleInput.value : "student",
      }).then(
        function (data) {
          window.SJApi.setSession(data.token, data.user, true);
          afterAuthRedirect(data.user);
        },
        function (err) {
          setBusy(button, false, "Create Account");
          showFormAlert(registerForm, err.message);
        }
      );
    });
  }
})();
