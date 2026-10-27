"use strict";
/**
 * SmartJobs server — plain Node.js `http`, zero npm runtime dependencies.
 *   - serves the frontend (*.html, css/, js/, assets/)
 *   - REST API under /api
 *   - GET /health   (used by Docker HEALTHCHECK / hosting platforms)
 *   - GET /metrics  (Prometheus text format)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { createStore } = require("./lib/store");
const auth = require("./lib/auth");

const ROOT = path.resolve(__dirname, "..");
const MAX_BODY_BYTES = 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function createApp(options = {}) {
  const dataDir = options.dataDir || process.env.DATA_DIR || path.join(__dirname, "data");
  const store = createStore(dataDir);
  const startedAt = Date.now();

  // ---------------- metrics ----------------
  const requestCounts = new Map(); // "METHOD|route|status" -> count
  const durationBuckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5];
  const durationState = { counts: durationBuckets.map(() => 0), sum: 0, count: 0 };

  function recordRequest(method, route, status, seconds) {
    const key = `${method}|${route}|${status}`;
    requestCounts.set(key, (requestCounts.get(key) || 0) + 1);
    durationState.sum += seconds;
    durationState.count += 1;
    // Prometheus buckets are cumulative: an observation counts in every bucket with le >= value.
    durationBuckets.forEach((b, i) => {
      if (seconds <= b) durationState.counts[i] += 1;
    });
  }

  function metricsText() {
    const lines = [];
    const esc = (v) => String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    lines.push("# HELP smartjobs_http_requests_total Total HTTP requests handled.");
    lines.push("# TYPE smartjobs_http_requests_total counter");
    for (const [key, n] of requestCounts) {
      const [method, route, status] = key.split("|");
      lines.push(`smartjobs_http_requests_total{method="${esc(method)}",route="${esc(route)}",status="${esc(status)}"} ${n}`);
    }
    lines.push("# HELP smartjobs_http_request_duration_seconds HTTP request latency.");
    lines.push("# TYPE smartjobs_http_request_duration_seconds histogram");
    durationBuckets.forEach((b, i) => {
      lines.push(`smartjobs_http_request_duration_seconds_bucket{le="${b}"} ${durationState.counts[i]}`);
    });
    lines.push(`smartjobs_http_request_duration_seconds_bucket{le="+Inf"} ${durationState.count}`);
    lines.push(`smartjobs_http_request_duration_seconds_sum ${durationState.sum}`);
    lines.push(`smartjobs_http_request_duration_seconds_count ${durationState.count}`);

    const c = store.counts();
    lines.push("# HELP smartjobs_jobs_total Jobs currently listed.");
    lines.push("# TYPE smartjobs_jobs_total gauge");
    lines.push(`smartjobs_jobs_total ${c.jobs}`);
    lines.push("# HELP smartjobs_users_total Registered users.");
    lines.push("# TYPE smartjobs_users_total gauge");
    lines.push(`smartjobs_users_total ${c.users}`);
    lines.push("# HELP smartjobs_applications_total Job applications submitted.");
    lines.push("# TYPE smartjobs_applications_total gauge");
    lines.push(`smartjobs_applications_total ${c.applications}`);

    lines.push("# HELP smartjobs_uptime_seconds Seconds since the server started.");
    lines.push("# TYPE smartjobs_uptime_seconds gauge");
    lines.push(`smartjobs_uptime_seconds ${((Date.now() - startedAt) / 1000).toFixed(3)}`);
    const mem = process.memoryUsage();
    lines.push("# HELP smartjobs_process_resident_memory_bytes Resident memory size.");
    lines.push("# TYPE smartjobs_process_resident_memory_bytes gauge");
    lines.push(`smartjobs_process_resident_memory_bytes ${mem.rss}`);
    lines.push("# HELP smartjobs_nodejs_heap_used_bytes Node.js heap in use.");
    lines.push("# TYPE smartjobs_nodejs_heap_used_bytes gauge");
    lines.push(`smartjobs_nodejs_heap_used_bytes ${mem.heapUsed}`);
    return lines.join("\n") + "\n";
  }

  // ---------------- tiny rate limiter (login/register) ----------------
  const attempts = new Map(); // ip -> { count, resetAt }
  const WINDOW_MS = 15 * 60 * 1000;
  const MAX_ATTEMPTS = Number(process.env.AUTH_RATE_LIMIT || 50);

  function clientIp(req) {
    if (process.env.TRUST_PROXY === "1") {
      const xff = req.headers["x-forwarded-for"];
      if (typeof xff === "string" && xff) return xff.split(",")[0].trim();
    }
    return req.socket.remoteAddress || "unknown";
  }

  function checkRateLimit(req) {
    const ip = clientIp(req);
    const now = Date.now();
    let entry = attempts.get(ip);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + WINDOW_MS };
      attempts.set(ip, entry);
    }
    entry.count += 1;
    if (attempts.size > 5000) {
      for (const [k, v] of attempts) if (v.resetAt <= now) attempts.delete(k);
    }
    if (entry.count > MAX_ATTEMPTS) throw new HttpError(429, "Too many attempts. Please try again later.");
  }

  // ---------------- helpers ----------------
  function sendJson(res, status, body) {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(payload),
      "Cache-Control": "no-store",
      ...SECURITY_HEADERS,
    });
    res.end(payload);
  }

  function readJsonBody(req) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      req.on("data", (chunk) => {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
          reject(new HttpError(413, "Request body too large"));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on("end", () => {
        if (size === 0) return resolve({});
        try {
          const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
            return reject(new HttpError(400, "JSON body must be an object"));
          }
          resolve(parsed);
        } catch (err) {
          reject(new HttpError(400, "Invalid JSON body"));
        }
      });
      req.on("error", reject);
    });
  }

  function currentUser(req) {
    const token = auth.parseBearer(req.headers.authorization);
    if (!token) return { token: null, user: null };
    return { token, user: store.findUserByToken(token) };
  }

  function requireUser(req) {
    const { token, user } = currentUser(req);
    if (!user) throw new HttpError(401, "Please log in to continue");
    return { token, user };
  }

  const str = (value) => (typeof value === "string" ? value.trim() : "");

  // ---------------- API ----------------
  // `ctx.route` is set as soon as a route matches so /metrics can label error responses too.
  async function handleApi(req, res, url, ctx) {
    const method = req.method;
    const p = url.pathname.replace(/\/+$/, "") || "/";

    if (p === "/api/register" && method === "POST") {
      ctx.route = "/api/register";
      checkRateLimit(req);
      const body = await readJsonBody(req);
      const name = str(body.name);
      const email = str(body.email).toLowerCase();
      const password = typeof body.password === "string" ? body.password : "";
      const role = str(body.role) || "student";
      if (name.length < 2 || name.length > 80) throw new HttpError(400, "Please enter your full name (2–80 characters)");
      if (!EMAIL_RE.test(email) || email.length > 254) throw new HttpError(400, "Please enter a valid email address");
      if (password.length < 6 || password.length > 200) throw new HttpError(400, "Password must be at least 6 characters");
      if (!["student", "recruiter"].includes(role)) throw new HttpError(400, "Role must be student or recruiter");
      if (store.findUserByEmail(email)) throw new HttpError(409, "An account with this email already exists");
      const user = store.createUser({ name, email, passwordHash: auth.hashPassword(password), role });
      const token = auth.generateToken();
      store.createSession(user.id, token);
      return { status: 201, route: ctx.route, body: { token, user: store.publicUser(user) } };
    }

    if (p === "/api/login" && method === "POST") {
      ctx.route = "/api/login";
      checkRateLimit(req);
      const body = await readJsonBody(req);
      const email = str(body.email).toLowerCase();
      const password = typeof body.password === "string" ? body.password : "";
      const user = email ? store.findUserByEmail(email) : null;
      // Same message whether the email or password is wrong (no account enumeration).
      if (!user || !auth.verifyPassword(password, user.passwordHash)) throw new HttpError(401, "Invalid email or password");
      const token = auth.generateToken();
      store.createSession(user.id, token);
      return { status: 200, route: ctx.route, body: { token, user: store.publicUser(user) } };
    }

    if (p === "/api/logout" && method === "POST") {
      ctx.route = "/api/logout";
      const { token } = requireUser(req);
      store.deleteSession(token);
      return { status: 200, route: ctx.route, body: { message: "Logged out" } };
    }

    if (p === "/api/me" && method === "GET") {
      ctx.route = "/api/me";
      const { user } = requireUser(req);
      return { status: 200, route: ctx.route, body: { user: store.publicUser(user) } };
    }

    if (p === "/api/jobs" && method === "GET") {
      ctx.route = "/api/jobs";
      const q = url.searchParams;
      const jobs = store.listJobs({
        search: q.get("search"),
        location: q.get("location"),
        category: q.get("category"),
        type: q.get("type"),
        experience: q.get("experience"),
      });
      return { status: 200, route: ctx.route, body: { count: jobs.length, jobs } };
    }

    const jobMatch = /^\/api\/jobs\/(\d+)$/.exec(p);
    if (jobMatch && method === "GET") {
      ctx.route = "/api/jobs/:id";
      const job = store.getJob(jobMatch[1]);
      if (!job) throw new HttpError(404, "Job not found");
      return { status: 200, route: ctx.route, body: { job } };
    }

    if (p === "/api/applications" && method === "POST") {
      ctx.route = "/api/applications";
      const { user } = requireUser(req);
      if (user.role !== "student") throw new HttpError(403, "Only student accounts can apply to jobs");
      const body = await readJsonBody(req);
      const jobId = Number(body.jobId);
      if (!Number.isInteger(jobId)) throw new HttpError(400, "jobId is required");
      const job = store.getJob(jobId);
      if (!job) throw new HttpError(404, "Job not found");
      if (store.findApplication(user.id, jobId)) throw new HttpError(409, "You have already applied to this job");
      const application = store.createApplication(user.id, jobId);
      return { status: 201, route: ctx.route, body: { application: { ...application, job } } };
    }

    if (p === "/api/applications" && method === "GET") {
      ctx.route = "/api/applications";
      const { user } = requireUser(req);
      const applications = store.listApplications(user.id);
      return { status: 200, route: ctx.route, body: { count: applications.length, applications } };
    }

    const known = ["/api/register", "/api/login", "/api/logout", "/api/me", "/api/jobs", "/api/applications"];
    if (known.includes(p) || jobMatch) throw new HttpError(405, "Method not allowed");
    throw new HttpError(404, "API endpoint not found");
  }

  // ---------------- static files ----------------
  function resolveStatic(pathname) {
    let rel;
    try {
      rel = decodeURIComponent(pathname);
    } catch (err) {
      return null;
    }
    if (rel.includes("\0")) return null;
    if (rel === "/" || rel === "") rel = "/index.html";
    const clean = path.posix.normalize(rel).replace(/^\/+/, "");
    if (clean.startsWith("..")) return null;
    const segments = clean.split("/");
    const topLevelHtml = segments.length === 1 && clean.endsWith(".html");
    const allowedDir = segments.length > 1 && ["css", "js", "assets"].includes(segments[0]);
    if (!topLevelHtml && !allowedDir) return null; // never expose backend/, tests/, Dockerfile, etc.
    const full = path.join(ROOT, clean);
    if (!full.startsWith(ROOT + path.sep)) return null;
    return full;
  }

  function serveStatic(req, res, url) {
    if (req.method !== "GET" && req.method !== "HEAD") throw new HttpError(405, "Method not allowed");
    const file = resolveStatic(url.pathname);
    if (!file) return { status: 404, route: "static" };
    let stat;
    try {
      stat = fs.statSync(file);
    } catch (err) {
      return { status: 404, route: "static" };
    }
    if (!stat.isFile()) return { status: 404, route: "static" };
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=300",
      ...SECURITY_HEADERS,
    });
    if (req.method === "HEAD") res.end();
    else fs.createReadStream(file).pipe(res);
    return { status: 200, route: "static" };
  }

  function sendNotFoundPage(res) {
    const body = "404 — Page not found";
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Content-Length": Buffer.byteLength(body), ...SECURITY_HEADERS });
    res.end(body);
  }

  // ---------------- CORS (local development only) ----------------
  // Pages are normally same-origin. This lets a page opened from disk (Origin: null) or an
  // editor dev server on localhost call the API too. Auth uses a bearer header, not cookies,
  // so this does not open the API to other websites' cookies. Set CORS_ORIGINS to add hosts.
  const extraOrigins = (process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean);
  function corsOrigin(origin) {
    if (!origin) return null;
    if (origin === "null" || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
    return extraOrigins.includes(origin) ? origin : null;
  }

  // ---------------- request handler ----------------
  const server = http.createServer(async (req, res) => {
    const started = process.hrtime.bigint();
    const allowedOrigin = corsOrigin(req.headers.origin);
    if (allowedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    }
    if (req.method === "OPTIONS" && req.url.startsWith("/api")) {
      res.writeHead(204, { "Access-Control-Max-Age": "600" });
      res.end();
      return;
    }
    let url;
    try {
      url = new URL(req.url, "http://localhost");
    } catch (err) {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }
    let status = 500;
    let route = "other";
    const ctx = { route: "/api/other" };
    try {
      if (url.pathname === "/health") {
        route = "/health";
        status = 200;
        sendJson(res, 200, { status: "ok", uptimeSeconds: Math.round((Date.now() - startedAt) / 1000), timestamp: new Date().toISOString() });
      } else if (url.pathname === "/metrics") {
        route = "/metrics";
        status = 200;
        const text = metricsText();
        res.writeHead(200, { "Content-Type": "text/plain; version=0.0.4; charset=utf-8", "Content-Length": Buffer.byteLength(text), "Cache-Control": "no-store" });
        res.end(text);
      } else if (url.pathname.startsWith("/api/") || url.pathname === "/api") {
        route = "/api/other";
        try {
          const result = await handleApi(req, res, url, ctx);
          route = result.route;
          status = result.status;
          sendJson(res, result.status, result.body);
        } catch (err) {
          route = ctx.route; // keep the matched route label even when the handler throws
          throw err;
        }
      } else {
        const result = serveStatic(req, res, url);
        route = result.route;
        status = result.status;
        if (result.status === 404) sendNotFoundPage(res);
      }
    } catch (err) {
      if (err instanceof HttpError) {
        status = err.status;
        if (!res.headersSent) sendJson(res, err.status, { error: err.message });
      } else {
        status = 500;
        console.error("Unhandled error:", err);
        if (!res.headersSent) sendJson(res, 500, { error: "Internal server error" });
      }
    } finally {
      recordRequest(req.method, route, status, Number(process.hrtime.bigint() - started) / 1e9);
    }
  });

  return { server, store };
}

function start() {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || "0.0.0.0";
  const { server } = createApp();
  server.listen(port, host, () => {
    console.log(`SmartJobs running on http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
  });
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

if (require.main === module) start();

module.exports = { createApp };
