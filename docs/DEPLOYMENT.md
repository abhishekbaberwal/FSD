# Deployment Guide

SmartJobs is one Node.js process that serves the pages **and** the API on a single
port, so it can run on any host that runs Node 18+ or Docker.

## 1. Run locally

```bash
node backend/server.js          # http://localhost:3000
```

## 2. Run with Docker (app + Prometheus + Grafana)

```bash
docker compose up --build -d
```

| Service    | URL                    | Notes                    |
|------------|------------------------|--------------------------|
| App        | http://localhost:3000  | health: `/health`        |
| Prometheus | http://localhost:9090  | Status > Targets = UP    |
| Grafana    | http://localhost:3001  | admin / admin (local)    |

The Grafana dashboard "SmartJobs — Application Overview" is provisioned
automatically. Generate some traffic (browse jobs, register, apply) and the
panels fill in.

## 3. Put it on the internet

Any Docker-capable host works (Render, Railway, Fly.io, a VPS, ...). Generic recipe:

1. Push this repo to GitHub.
2. Create a new **Web Service** from the repo and choose the **Dockerfile** build
   (or: build command `npm install`, start command `npm start`).
3. Set the health check path to `/health`.
4. Environment variables:
   - `PORT` — most hosts inject this automatically; the server reads it.
   - `TRUST_PROXY=1` — recommended behind a host's proxy so the login rate limiter
     sees real client IPs.
   - `DATA_DIR` — optional; where `db.json` is stored (default `backend/data`).
5. Deploy, open the URL, register an account, apply to a job.

> The Dockerfile's `HEALTHCHECK` probes port 3000. If your host forces a different
> `PORT`, rely on the platform's own health check (`/health`) instead.

### Important: data persistence

Users, sessions and applications live in `db.json`. On hosts with an **ephemeral
filesystem** (most free tiers) that file is wiped on every redeploy or restart.
To keep data, attach a persistent disk/volume and point `DATA_DIR` at it, or swap
`backend/lib/store.js` for a real database later (the API and frontend don't need
to change). With `docker compose`, the `smartjobs-data` volume already persists it.

## 4. Deployment evidence (for submission)

After the real deployment:

1. Put the public URL in `README.md` under **Live URL**.
2. Screenshot the live site (address bar visible) and save it as
   `docs/deployment-screenshot.png`, then commit it.
3. Push the Docker image (commands are in the README) and keep the registry page
   as evidence.

These steps need your own accounts, so they have to be done by you.
