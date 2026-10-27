/* SmartJobs — home page: featured jobs + hero search. */
(function () {
  "use strict";

  var container = document.getElementById("featuredJobsContainer");

  function render(jobs) {
    if (!jobs.length) {
      container.innerHTML = '<div class="col-12 text-center text-secondary py-4">No jobs available right now — check back soon.</div>';
      return;
    }
    container.innerHTML = jobs.slice(0, 6).map(function (job) {
      return window.SJ.jobCardHtml(job, "col-md-6 col-lg-4");
    }).join("");
  }

  window.SJApi.get("/api/jobs").then(
    function (data) { render(data.jobs); },
    function (err) {
      container.innerHTML =
        '<div class="col-12"><div class="alert alert-warning text-center mb-0">' +
        window.SJ.escapeHtml(err.message) + "</div></div>";
    }
  );

  // Hero search -> jobs page with the query pre-filled.
  var form = document.getElementById("heroSearchForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var params = new URLSearchParams();
      var keyword = document.getElementById("searchKeyword").value.trim();
      var location = document.getElementById("searchLocation").value.trim();
      if (keyword) params.set("search", keyword);
      if (location) params.set("location", location);
      var qs = params.toString();
      window.location.href = "jobs.html" + (qs ? "?" + qs : "");
    });
  }
})();
