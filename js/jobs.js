/* SmartJobs — jobs listing page: live search + filters backed by /api/jobs. */
(function () {
  "use strict";

  var DEFAULT_CATEGORY = "All Categories";
  var DEFAULT_TYPE = "All Types";
  var DEFAULT_EXPERIENCE = "Any Experience";

  var els = {
    form: document.getElementById("filterForm"),
    search: document.getElementById("filterSearch"),
    location: document.getElementById("filterLocation"),
    category: document.getElementById("filterCategory"),
    type: document.getElementById("filterType"),
    experience: document.getElementById("filterExperience"),
    reset: document.getElementById("resetFilters"),
    container: document.getElementById("jobsContainer"),
    empty: document.getElementById("emptyState"),
    count: document.getElementById("resultCount"),
  };

  var requestId = 0; // ignore out-of-order responses

  function filters() {
    return {
      search: els.search.value.trim(),
      location: els.location.value.trim(),
      category: els.category.value === DEFAULT_CATEGORY ? "" : els.category.value,
      type: els.type.value === DEFAULT_TYPE ? "" : els.type.value,
      experience: els.experience.value === DEFAULT_EXPERIENCE ? "" : els.experience.value,
    };
  }

  function queryString(f) {
    var params = new URLSearchParams();
    Object.keys(f).forEach(function (k) { if (f[k]) params.set(k, f[k]); });
    return params.toString();
  }

  function showLoading() {
    els.empty.classList.add("d-none");
    els.container.innerHTML =
      '<div class="col-12 text-center text-secondary py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading…</span></div></div>';
  }

  function load() {
    var f = filters();
    var qs = queryString(f);
    var mine = ++requestId;
    showLoading();
    // Keep the URL shareable / refresh-safe without adding history entries.
    history.replaceState(null, "", "jobs.html" + (qs ? "?" + qs : ""));

    window.SJApi.get("/api/jobs" + (qs ? "?" + qs : "")).then(
      function (data) {
        if (mine !== requestId) return;
        els.count.textContent = data.count;
        if (data.count === 0) {
          els.container.innerHTML = "";
          els.empty.classList.remove("d-none");
          return;
        }
        els.empty.classList.add("d-none");
        els.container.innerHTML = data.jobs.map(function (job) {
          return window.SJ.jobCardHtml(job, "col-md-6");
        }).join("");
      },
      function (err) {
        if (mine !== requestId) return;
        els.count.textContent = "0";
        els.container.innerHTML =
          '<div class="col-12"><div class="alert alert-danger d-flex justify-content-between align-items-center">' +
          "<span>" + window.SJ.escapeHtml(err.message) + '</span><button type="button" class="btn btn-sm btn-outline-danger" id="retryBtn">Retry</button></div></div>';
        var retry = document.getElementById("retryBtn");
        if (retry) retry.addEventListener("click", load);
      }
    );
  }

  function debounce(fn, ms) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  els.form.addEventListener("submit", function (e) { e.preventDefault(); load(); });
  [els.category, els.type, els.experience].forEach(function (el) { el.addEventListener("change", load); });
  var debounced = debounce(load, 300);
  els.search.addEventListener("input", debounced);
  els.location.addEventListener("input", debounced);

  els.reset.addEventListener("click", function () {
    els.search.value = "";
    els.location.value = "";
    els.category.value = DEFAULT_CATEGORY;
    els.type.value = DEFAULT_TYPE;
    els.experience.value = DEFAULT_EXPERIENCE;
    load();
  });

  load();
})();
