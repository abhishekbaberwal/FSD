/* SmartJobs — API client + session storage.
 * Everything talks to the same origin (the Node server serves both pages and API),
 * so there is no base URL or CORS to configure. */
(function (global) {
  "use strict";

  // Normally the Node server serves the pages AND the API, so requests are same-origin ("").
  // If the page was opened straight from disk (file://) or from an editor dev server
  // (VS Code Live Server, Vite), point at the backend on localhost:3000 instead.
  // Override with: <script>window.SJ_API_BASE = "https://your-host";</script> before api.js.
  var DEV_PORTS = ["5500", "5501", "5502", "5173", "4173"];
  var API_BASE = (function () {
    if (typeof window.SJ_API_BASE === "string") return window.SJ_API_BASE.replace(/\/+$/, "");
    if (window.location.protocol === "file:") return "http://localhost:3000";
    if (DEV_PORTS.indexOf(window.location.port) !== -1) return "http://localhost:3000";
    return "";
  })();

  var TOKEN_KEY = "sj_token";
  var USER_KEY = "sj_user";

  function readBoth(key) {
    try {
      return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function getToken() { return readBoth(TOKEN_KEY); }

  function getUser() {
    var raw = readBoth(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function clearSession() {
    try {
      [window.localStorage, window.sessionStorage].forEach(function (s) {
        s.removeItem(TOKEN_KEY);
        s.removeItem(USER_KEY);
      });
    } catch (e) { /* storage unavailable */ }
  }

  /** remember=true -> localStorage (survives browser restart); false -> sessionStorage. */
  function setSession(token, user, remember) {
    clearSession();
    try {
      var s = remember ? window.localStorage : window.sessionStorage;
      s.setItem(TOKEN_KEY, token);
      s.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) { /* storage unavailable */ }
  }

  /** fetch wrapper: JSON in/out, attaches the bearer token, throws Error(message) with .status. */
  function request(path, options) {
    options = options || {};
    var headers = { Accept: "application/json" };
    var token = getToken();
    if (token) headers.Authorization = "Bearer " + token;
    var init = { method: options.method || "GET", headers: headers };
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }
    return fetch(API_BASE + path, init).then(
      function (res) {
        return res.text().then(function (text) {
          var data = {};
          try { data = text ? JSON.parse(text) : {}; } catch (e) { /* non-JSON body */ }
          if (!res.ok) {
            if (res.status === 401 && token) clearSession(); // expired / invalid session
            var err = new Error(data.error || "Something went wrong (HTTP " + res.status + ")");
            err.status = res.status;
            throw err;
          }
          return data;
        });
      },
      function () {
        var err = new Error(
          "Can't reach the SmartJobs server. Start it with \"node backend/server.js\" and open http://localhost:3000 in your browser."
        );
        err.status = 0;
        throw err;
      }
    );
  }

  global.SJApi = {
    getToken: getToken,
    getUser: getUser,
    setSession: setSession,
    clearSession: clearSession,
    isLoggedIn: function () { return !!getToken() && !!getUser(); },
    get: function (path) { return request(path); },
    post: function (path, body) { return request(path, { method: "POST", body: body === undefined ? {} : body }); },
  };
})(window);
