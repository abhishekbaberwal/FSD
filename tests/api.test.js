const fs = require("fs");
const os = require("os");
const path = require("path");
const { createApp } = require("../backend/server");

let server, dir, base;

beforeAll(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "sj-api-"));
  ({ server } = createApp({ dataDir: dir }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(dir, { recursive: true, force: true });
});

async function call(method, url, { body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(base + url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch (e) { /* not json */ }
  return { status: res.status, json, text, headers: res.headers };
}

describe("health and metrics", () => {
  test("GET /health returns ok", async () => {
    const r = await call("GET", "/health");
    expect(r.status).toBe(200);
    expect(r.json.status).toBe("ok");
  });

  test("GET /metrics is Prometheus text with app gauges", async () => {
    await call("GET", "/api/jobs");
    const r = await call("GET", "/metrics");
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toMatch(/text\/plain/);
    expect(r.text).toMatch(/smartjobs_http_requests_total\{method="GET",route="\/api\/jobs",status="200"\}/);
    expect(r.text).toMatch(/smartjobs_jobs_total 10/);
  });

  test("error responses keep their route label in metrics", async () => {
    await call("GET", "/api/applications"); // 401
    const r = await call("GET", "/metrics");
    expect(r.text).toMatch(/smartjobs_http_requests_total\{method="GET",route="\/api\/applications",status="401"\}/);
  });
});

describe("jobs API", () => {
  test("lists, filters and fetches a single job", async () => {
    expect((await call("GET", "/api/jobs")).json.count).toBe(10);
    expect((await call("GET", "/api/jobs?category=UI%2FUX%20Design")).json.count).toBe(2);
    const one = await call("GET", "/api/jobs/3");
    expect(one.status).toBe(200);
    expect(one.json.job.id).toBe(3);
    expect((await call("GET", "/api/jobs/999")).status).toBe(404);
  });
});

describe("auth + applications flow", () => {
  let token;
  const creds = { name: "Test Student", email: "student@example.com", password: "secret1", role: "student" };

  test("register validates input", async () => {
    expect((await call("POST", "/api/register", { body: { ...creds, email: "nope" } })).status).toBe(400);
    expect((await call("POST", "/api/register", { body: { ...creds, password: "123" } })).status).toBe(400);
    expect((await call("POST", "/api/register", { body: { ...creds, role: "admin" } })).status).toBe(400);
  });

  test("register, reject duplicates, login, me", async () => {
    const reg = await call("POST", "/api/register", { body: creds });
    expect(reg.status).toBe(201);
    expect(reg.json.user.email).toBe("student@example.com");
    expect(reg.json.user.passwordHash).toBeUndefined();
    expect((await call("POST", "/api/register", { body: creds })).status).toBe(409);

    expect((await call("POST", "/api/login", { body: { email: creds.email, password: "wrong" } })).status).toBe(401);
    const login = await call("POST", "/api/login", { body: { email: "STUDENT@example.com", password: creds.password } });
    expect(login.status).toBe(200);
    token = login.json.token;
    expect((await call("GET", "/api/me", { token })).json.user.name).toBe("Test Student");
  });

  test("protected routes require a token", async () => {
    expect((await call("GET", "/api/applications")).status).toBe(401);
    expect((await call("POST", "/api/applications", { body: { jobId: 1 } })).status).toBe(401);
    expect((await call("GET", "/api/me", { token: "deadbeef" })).status).toBe(401);
  });

  test("apply once, block duplicates, list with job details", async () => {
    const first = await call("POST", "/api/applications", { token, body: { jobId: 1 } });
    expect(first.status).toBe(201);
    expect(first.json.application.status).toBe("Applied");
    expect((await call("POST", "/api/applications", { token, body: { jobId: 1 } })).status).toBe(409);
    expect((await call("POST", "/api/applications", { token, body: { jobId: 999 } })).status).toBe(404);
    expect((await call("POST", "/api/applications", { token, body: {} })).status).toBe(400);
    const mine = await call("GET", "/api/applications", { token });
    expect(mine.json.count).toBe(1);
    expect(mine.json.applications[0].job.title).toBe("Frontend Developer Intern");
  });

  test("recruiters cannot apply", async () => {
    const reg = await call("POST", "/api/register", { body: { name: "Rec Ruiter", email: "rec@example.com", password: "secret1", role: "recruiter" } });
    expect((await call("POST", "/api/applications", { token: reg.json.token, body: { jobId: 2 } })).status).toBe(403);
  });

  test("logout invalidates the token", async () => {
    expect((await call("POST", "/api/logout", { token })).status).toBe(200);
    expect((await call("GET", "/api/me", { token })).status).toBe(401);
  });

  test("malformed JSON gives 400, unknown API route gives 404", async () => {
    const res = await fetch(base + "/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{not json" });
    expect(res.status).toBe(400);
    expect((await call("GET", "/api/nope")).status).toBe(404);
  });
});

describe("CORS for local dev (page opened from disk or Live Server)", () => {
  test("preflight from file:// (Origin: null) is allowed", async () => {
    const res = await fetch(base + "/api/login", { method: "OPTIONS", headers: { Origin: "null", "Access-Control-Request-Method": "POST" } });
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("null");
    expect(res.headers.get("access-control-allow-headers")).toMatch(/Authorization/);
  });

  test("Live Server origin is allowed, a random website is not", async () => {
    const ok = await fetch(base + "/api/jobs", { headers: { Origin: "http://127.0.0.1:5500" } });
    expect(ok.headers.get("access-control-allow-origin")).toBe("http://127.0.0.1:5500");
    const bad = await fetch(base + "/api/jobs", { headers: { Origin: "https://evil.example" } });
    expect(bad.headers.get("access-control-allow-origin")).toBeNull();
  });
});

describe("static files", () => {
  test("serves every page and asset", async () => {
    expect((await call("GET", "/")).status).toBe(200);
    for (const p of ["/index.html", "/jobs.html", "/job-details.html", "/login.html", "/register.html", "/dashboard.html", "/about.html", "/contact.html", "/css/style.css", "/css/responsive.css", "/js/api.js", "/js/main.js"]) {
      expect((await call("GET", p)).status).toBe(200);
    }
  });

  test("never exposes source, config or traversal paths", async () => {
    for (const p of ["/backend/server.js", "/package.json", "/Dockerfile", "/tests/auth.test.js", "/.git/config", "/backend/data/db.json"]) {
      expect((await call("GET", p)).status).toBe(404);
    }
    const res = await fetch(base + "/..%2f..%2fetc/passwd");
    expect(res.status).toBe(404);
  });
});
