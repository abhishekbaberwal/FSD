/* SmartJobs — shared UI helpers + navbar auth state (loaded on every page). */
(function (global) {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function toast(message, kind) {
    var wrap = document.getElementById("sjToastWrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "sjToastWrap";
      wrap.className = "sj-toast-wrap";
      wrap.setAttribute("aria-live", "polite");
      document.body.appendChild(wrap);
    }
    var el = document.createElement("div");
    el.className = "sj-toast " + (kind || "");
    el.textContent = message;
    wrap.appendChild(el);
    setTimeout(function () { el.remove(); }, 4000);
  }

  /** One job card, used on the home page and the jobs listing. */
  function jobCardHtml(job, colClass) {
    var skills = (job.skills || []).slice(0, 4).map(function (s) {
      return '<span class="badge skill-badge">' + escapeHtml(s) + "</span>";
    }).join("");
    return (
      '<div class="' + (colClass || "col-md-6") + '">' +
        '<div class="card job-card p-3 h-100">' +
          '<div class="d-flex justify-content-between align-items-start gap-2 mb-1">' +
            '<h5 class="fw-semibold mb-0">' + escapeHtml(job.title) + "</h5>" +
            '<span class="badge type-badge">' + escapeHtml(job.type) + "</span>" +
          "</div>" +
          '<p class="text-secondary mb-2"><i class="bi bi-building me-1"></i>' + escapeHtml(job.company) + "</p>" +
          '<p class="mb-2 small text-secondary">' +
            '<i class="bi bi-geo-alt me-1"></i>' + escapeHtml(job.location) +
            ' &nbsp;|&nbsp; <i class="bi bi-cash-coin me-1"></i>' + escapeHtml(job.salary) +
            ' &nbsp;|&nbsp; ' + escapeHtml(job.experience) +
          "</p>" +
          '<div class="mb-3">' + skills + "</div>" +
          '<a href="job-details.html?id=' + encodeURIComponent(job.id) + '" class="btn btn-outline-primary btn-sm mt-auto align-self-start">View Details</a>' +
        "</div>" +
      "</div>"
    );
  }

  function renderNavAuth() {
    var area = document.getElementById("navAuthArea");
    if (!area) return;
    var user = global.SJApi.getUser();
    if (!global.SJApi.isLoggedIn() || !user) return; // keep the default Login / Register buttons
    var firstName = String(user.name || "there").split(" ")[0];
    var applicationsLink = user.role === "student"
      ? '<a href="dashboard.html" class="btn btn-outline-primary btn-sm">My Applications</a>'
      : "";
    area.classList.add("align-items-center");
    area.innerHTML =
      '<span class="small text-secondary d-none d-lg-inline me-1">Hi, ' + escapeHtml(firstName) + "</span>" +
      applicationsLink +
      '<button type="button" id="logoutBtn" class="btn btn-primary btn-sm">Logout</button>';
    document.getElementById("logoutBtn").addEventListener("click", logout);
  }

  function logout() {
    var done = function () {
      global.SJApi.clearSession();
      window.location.href = "index.html";
    };
    global.SJApi.post("/api/logout").then(done, done); // clear locally even if the server call fails
  }

  /** Confirm the stored session is still valid; if not, fall back to Login/Register. */
  function verifySession() {
    if (!global.SJApi.isLoggedIn()) return;
    global.SJApi.get("/api/me").then(
      function (data) {
        var token = global.SJApi.getToken();
        var inLocal = false;
        try { inLocal = !!window.localStorage.getItem("sj_token"); } catch (e) { /* ignore */ }
        global.SJApi.setSession(token, data.user, inLocal); // refresh cached profile
      },
      function (err) {
        if (err.status === 401) location.reload(); // session expired -> api.js already cleared it
      }
    );
  }

  global.SJ = { escapeHtml: escapeHtml, toast: toast, jobCardHtml: jobCardHtml, logout: logout };

  document.addEventListener("DOMContentLoaded", function () {
    renderNavAuth();
    verifySession();
  });
})(window);
