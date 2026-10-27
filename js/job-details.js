/* SmartJobs — job details page + Apply flow. */
(function () {
  "use strict";

  var esc = window.SJ.escapeHtml;
  var content = document.getElementById("jobDetailsContent");
  var jobId = Number(new URLSearchParams(window.location.search).get("id"));

  function showError(message) {
    content.innerHTML =
      '<div class="card p-5 text-center">' +
        '<i class="bi bi-exclamation-circle display-4 text-secondary"></i>' +
        '<p class="mt-3 mb-3 text-secondary">' + esc(message) + "</p>" +
        '<div><a href="jobs.html" class="btn btn-primary">Browse all jobs</a></div>' +
      "</div>";
  }

  function list(items) {
    return "<ul>" + (items || []).map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
  }

  function render(job) {
    document.title = job.title + " at " + job.company + " -- SmartJobs";
    var skills = (job.skills || []).map(function (s) { return '<span class="badge skill-badge">' + esc(s) + "</span>"; }).join("");
    content.innerHTML =
      '<div class="card detail-card p-4 p-md-5">' +
        '<div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">' +
          '<h2 class="fw-bold mb-0">' + esc(job.title) + "</h2>" +
          '<span class="badge type-badge">' + esc(job.type) + "</span>" +
        "</div>" +
        '<p class="fs-5 text-secondary mb-3"><i class="bi bi-building me-1"></i>' + esc(job.company) + "</p>" +
        '<div class="detail-meta mb-3">' +
          '<span><i class="bi bi-geo-alt me-1"></i>' + esc(job.location) + "</span>" +
          '<span><i class="bi bi-cash-coin me-1"></i>' + esc(job.salary) + "</span>" +
          '<span><i class="bi bi-person-badge me-1"></i>' + esc(job.experience) + "</span>" +
          '<span><i class="bi bi-tag me-1"></i>' + esc(job.category) + "</span>" +
        "</div>" +
        '<div class="mb-4">' + skills + "</div>" +
        '<div class="mb-4" id="applyArea"></div>' +
        '<div class="detail-section mb-4"><h6>About the role</h6><p class="text-secondary mb-0">' + esc(job.description) + "</p></div>" +
        '<div class="detail-section mb-4"><h6>Responsibilities</h6>' + list(job.responsibilities) + "</div>" +
        '<div class="detail-section mb-0"><h6>Requirements</h6>' + list(job.requirements) + "</div>" +
      "</div>";
    setupApply(job);
  }

  // ---------- login-required modal (created on demand) ----------
  function ensureLoginModal() {
    var existing = document.getElementById("loginRequiredModal");
    if (existing) return existing;
    var redirect = encodeURIComponent("job-details.html?id=" + jobId);
    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="modal fade" id="loginRequiredModal" tabindex="-1" aria-labelledby="loginRequiredTitle" aria-hidden="true">' +
        '<div class="modal-dialog modal-dialog-centered"><div class="modal-content">' +
          '<div class="modal-header border-0 pb-0">' +
            '<h5 class="modal-title fw-bold" id="loginRequiredTitle">Login required</h5>' +
            '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
          "</div>" +
          '<div class="modal-body"><p class="mb-0">Please login to apply for this job.</p></div>' +
          '<div class="modal-footer border-0 pt-0">' +
            '<a href="register.html?redirect=' + redirect + '" class="btn btn-outline-primary">Register</a>' +
            '<a href="login.html?redirect=' + redirect + '" class="btn btn-primary">Login</a>' +
          "</div>" +
        "</div></div>" +
      "</div>";
    document.body.appendChild(wrap.firstChild);
    return document.getElementById("loginRequiredModal");
  }

  // ---------- apply button ----------
  function setupApply(job) {
    var area = document.getElementById("applyArea");
    var loggedIn = window.SJApi.isLoggedIn();
    var user = window.SJApi.getUser();

    function appliedState() {
      area.innerHTML =
        '<button type="button" class="btn btn-success btn-lg px-4" disabled><i class="bi bi-check-circle me-1"></i>Applied</button>' +
        ' <a href="dashboard.html" class="btn btn-link">View my applications</a>';
    }

    area.innerHTML = '<button type="button" id="applyBtn" class="btn btn-primary btn-lg px-4">Apply Now</button>';
    var btn = document.getElementById("applyBtn");

    btn.addEventListener("click", function () {
      if (!window.SJApi.isLoggedIn()) {
        window.bootstrap.Modal.getOrCreateInstance(ensureLoginModal()).show();
        return;
      }
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Applying…';
      window.SJApi.post("/api/applications", { jobId: job.id }).then(
        function () {
          window.SJ.toast("Application submitted — good luck!", "success");
          appliedState();
        },
        function (err) {
          if (err.status === 409) {
            window.SJ.toast(err.message, "");
            appliedState();
          } else if (err.status === 401) {
            btn.disabled = false;
            btn.textContent = "Apply Now";
            window.bootstrap.Modal.getOrCreateInstance(ensureLoginModal()).show();
          } else {
            window.SJ.toast(err.message, "error");
            btn.disabled = false;
            btn.textContent = "Apply Now";
          }
        }
      );
    });

    // If a student already applied, show that instead of a live Apply button.
    if (loggedIn && user && user.role === "student") {
      window.SJApi.get("/api/applications").then(function (data) {
        var already = data.applications.some(function (a) { return a.jobId === job.id; });
        if (already) appliedState();
      }, function () { /* leave the Apply button as is */ });
    }
  }

  if (!Number.isInteger(jobId) || jobId < 1) {
    showError("That job link looks incomplete. Pick a job from the listings instead.");
    return;
  }
  window.SJApi.get("/api/jobs/" + jobId).then(
    function (data) { render(data.job); },
    function (err) { showError(err.status === 404 ? "This job is no longer available." : err.message); }
  );
})();
