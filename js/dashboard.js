/* SmartJobs — "My Applications" dashboard (students). */
(function () {
  "use strict";

  var esc = window.SJ.escapeHtml;
  var list = document.getElementById("applicationsList");
  var greeting = document.getElementById("dashboardGreeting");

  if (!window.SJApi.isLoggedIn()) {
    window.location.replace("login.html?redirect=dashboard.html");
    return;
  }

  var user = window.SJApi.getUser();
  greeting.textContent = "Hi, " + String(user.name || "there").split(" ")[0] + " — your applications";

  function statusClass(status) {
    return "status-" + String(status).toLowerCase().replace(/\s+/g, "-");
  }

  function formatDate(iso) {
    var d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function empty(message, showBrowse) {
    list.innerHTML =
      '<div class="card p-5 text-center">' +
        '<i class="bi bi-inbox display-4 text-secondary"></i>' +
        '<p class="text-secondary mt-3 mb-3">' + esc(message) + "</p>" +
        (showBrowse ? '<div><a href="jobs.html" class="btn btn-primary">Browse jobs</a></div>' : "") +
      "</div>";
  }

  if (user.role !== "student") {
    empty("Recruiter accounts can't apply to jobs, so there are no applications to show.", false);
    return;
  }

  window.SJApi.get("/api/applications").then(
    function (data) {
      if (!data.applications.length) {
        empty("You haven't applied to any jobs yet.", true);
        return;
      }
      list.innerHTML = data.applications.map(function (a) {
        var job = a.job || { title: "Job no longer listed", company: "", location: "" };
        var title = a.job
          ? '<a class="text-decoration-none fw-semibold" href="job-details.html?id=' + encodeURIComponent(a.job.id) + '">' + esc(job.title) + "</a>"
          : '<span class="fw-semibold">' + esc(job.title) + "</span>";
        return (
          '<div class="card p-3 mb-3"><div class="d-flex flex-wrap justify-content-between align-items-center gap-2">' +
            "<div>" +
              '<div class="fs-6">' + title + "</div>" +
              '<div class="small text-secondary">' +
                (job.company ? '<i class="bi bi-building me-1"></i>' + esc(job.company) : "") +
                (job.location ? ' &nbsp;|&nbsp; <i class="bi bi-geo-alt me-1"></i>' + esc(job.location) : "") +
                ' &nbsp;|&nbsp; Applied ' + esc(formatDate(a.appliedAt)) +
              "</div>" +
            "</div>" +
            '<span class="badge status-badge ' + statusClass(a.status) + '">' + esc(a.status) + "</span>" +
          "</div></div>"
        );
      }).join("");
    },
    function (err) {
      if (err.status === 401) {
        window.location.replace("login.html?redirect=dashboard.html");
        return;
      }
      list.innerHTML = '<div class="alert alert-danger">' + esc(err.message) + "</div>";
    }
  );
})();
