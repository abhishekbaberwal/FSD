# Smart Job Portal

## Project Overview

Smart Job Portal (SmartJobs) is a full-stack job/internship portal built as
an FSD project. Students and freshers can browse jobs, filter by category,
location, type and experience, register/login, and apply to jobs — with
applications tracked on a personal dashboard.

## Features

- Home page with hero search, categories, and featured jobs (live data)
- Job listings page with working search/filter (title, location, category,
  type, experience)
- Job details page with an Apply flow
- Registration and login backed by a real API (hashed passwords, session
  tokens) — no more fake `onsubmit="return false"` forms
- "My Applications" dashboard with status badges (Applied, In Review,
  Shortlisted, Rejected, Selected)
- About and Contact pages
- Responsive design (Bootstrap 5)

## Technologies Used

- **Frontend:** HTML5, CSS3, Bootstrap 5, jQuery, vanilla JS (`fetch`)
- **Backend:** Node.js — plain `http` module only, **no Express and no
  `npm install` required to run it**. Uses only Node's built-in `crypto`
  module for password hashing (scrypt) and session tokens.
- **Storage:** a single JSON file (`backend/data/db.json`), created and
  seeded automatically on first run. Good enough for a student project;
  swap in a real database later without touching the frontend.
- **Testing:** Jest for backend logic (`tests/`), Python `unittest` for
  project-structure checks (`test_project.py`, run by the Jenkins pipeline)

## Running the Project

You need Node.js installed (no other runtime dependencies). From the
project root:

```bash
node backend/server.js
```

Then open **http://localhost:3000** in your browser. The server serves the
frontend pages *and* the API from the same port, so there's nothing else to
configure and no CORS issues.

On first run it creates `backend/data/db.json`, pre-seeded with 10 sample
jobs. Registering a user or applying to a job updates that file directly —
delete it any time to reset to a clean seeded state.

### Troubleshooting: "Can't reach the SmartJobs server"

The pages talk to the backend, so the backend must be running:

1. In the project folder run `node backend/server.js` and leave that terminal open.
2. Open **http://localhost:3000** (not by double-clicking the HTML file).

Pages opened from disk or from VS Code Live Server are also supported — they call the
backend at `http://localhost:3000` automatically — but the server still has to be running.

### Running the tests

```bash
npm install        # only needed once, to pull in Jest itself
npm test            # runs the Jest suite in tests/
python -m unittest discover -v   # runs the structural checks (used by CI)
```


## MT2 — Modules 5–6: Containerization, Deployment & Monitoring

### Docker / Containerization

The project includes:

- `Dockerfile` — builds and runs the Node.js application.
- `docker-compose.yml` — runs the application, Prometheus, and Grafana.
- `.dockerignore` — keeps local/dev files out of the image.

Build and run the application:

```bash
docker build -t smart-job-portal:latest .
docker run --rm -p 3000:3000 smart-job-portal:latest
```

Or run the complete monitoring stack:

```bash
docker compose up --build -d
```

### Health and monitoring endpoints

- `GET /health` — application health check.
- `GET /metrics` — Prometheus-compatible application metrics.

Local monitoring URLs:

- Application: http://localhost:3000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

Grafana credentials for the local Compose setup are `admin` / `admin`.

### Container registry

Before submission, build and push the image to a registry:

```bash
docker login
docker tag smart-job-portal:latest YOUR_DOCKERHUB_USERNAME/smart-job-portal:latest
docker push YOUR_DOCKERHUB_USERNAME/smart-job-portal:latest
```

Replace `YOUR_DOCKERHUB_USERNAME` with the student's Docker Hub username.
The pushed image is the evidence that the Docker build genuinely succeeded.

### Deployment evidence

The final public deployment URL must be placed below after the real deployment:

**Live URL:** `TODO — replace with the actual deployed URL`

Deployment screenshot instructions are in `docs/DEPLOYMENT.md`. The real
deployment screenshot should be committed as `docs/deployment-screenshot.png`.

### MT2 checklist

| Module | Requirement | Status |
|---|---|---|
| M5 | Dockerfile present | Done |
| M5 | docker-compose.yml present | Done |
| M5 | Image pushed to container registry | Pending student's registry login/push |
| M6 | Live URL responding | Pending deployment |
| M6 | Prometheus config present | Done |
| M6 | Monitoring dashboard committed under `monitoring/` | Done |
| M6 | Deployment screenshot committed under `docs/` | Pending real deployment |

## API Reference

All endpoints are under `/api`. Protected endpoints expect
`Authorization: Bearer <token>`.

| Method | Endpoint             | Auth | Description                          |
|--------|-----------------------|------|---------------------------------------|
| POST   | `/api/register`       | No   | Create an account, returns a token    |
| POST   | `/api/login`          | No   | Log in, returns a token               |
| POST   | `/api/logout`         | Yes  | Invalidate the current session token  |
| GET    | `/api/me`              | Yes  | Get the current user                  |
| GET    | `/api/jobs`            | No   | List jobs (supports query filters)    |
| GET    | `/api/jobs/:id`        | No   | Get a single job                      |
| POST   | `/api/applications`   | Yes  | Apply to a job (`{ "jobId": 1 }`)     |
| GET    | `/api/applications`   | Yes  | List the current user's applications  |

`GET /api/jobs` query params: `search`, `location`, `category`, `type`,
`experience` — all optional and combinable.

## Project Structure

```text
smart-job-portal/
├── index.html
├── jobs.html
├── job-details.html
├── login.html
├── register.html
├── dashboard.html
├── about.html
├── contact.html
├── css/
│   ├── style.css
│   └── responsive.css
├── js/
│   ├── api.js            # fetch wrapper + session storage
│   ├── main.js            # shared navbar auth-state logic
│   ├── validation.js       # login/register form handling
│   ├── jobs.js             # jobs.html listing + filters
│   ├── job-details.js      # job-details.html
│   ├── dashboard.js        # dashboard.html
│   └── index.js            # index.html featured jobs + hero search
├── backend/
│   ├── server.js           # HTTP server: static files + REST API
│   ├── lib/
│   │   ├── auth.js         # password hashing, session tokens
│   │   └── store.js        # JSON file "database" + seed jobs
│   └── data/
│       └── db.json         # created automatically on first run
├── tests/
│   ├── auth.test.js
│   ├── jobs-seed.test.js
│   └── api.test.js         # end-to-end API tests (register, login, apply, metrics)
├── monitoring/             # Prometheus config + Grafana dashboard
├── docs/                   # deployment guide + MT2 evidence checklist
├── test_project.py
├── Dockerfile
├── docker-compose.yml
├── Jenkinsfile
├── package.json
└── README.md
```

CI workflow verified successfully.
CI verification run 3.
CI verification run 4.


## MT2 Evidence Checklist

See [`docs/MT2_EVIDENCE_CHECKLIST.md`](docs/MT2_EVIDENCE_CHECKLIST.md) before submission.
