# MT2 Evidence Checklist

Tick each item and keep proof (screenshot / link) ready for submission.

## Module 5 — Containerization
- [ ] `docker build -t smart-job-portal:latest .` succeeds
- [ ] Container runs and `http://localhost:3000/health` returns `{"status":"ok",...}`
- [ ] `docker compose up --build -d` starts app, Prometheus and Grafana
- [ ] Image pushed to Docker Hub — screenshot of the repository page
- [ ] `docker ps` screenshot showing the app container as **healthy**

## Module 6 — Deployment & Monitoring
- [ ] Live URL opens the site — URL added to `README.md`
- [ ] `docs/deployment-screenshot.png` committed (real deployment, URL visible)
- [ ] Prometheus `/targets` shows `smart-job-portal` as **UP** — screenshot
- [ ] Grafana "SmartJobs — Application Overview" with live data — screenshot
- [ ] `/metrics` output screenshot (shows `smartjobs_http_requests_total`)

## CI / tests
- [ ] `npm test` — all Jest suites pass
- [ ] `python -m unittest discover -v` — all structure checks pass
- [ ] Jenkins pipeline run is green — screenshot of the build page

## Demo script (viva)
1. Home -> search "figma" -> 1 result.
2. Jobs page -> filter Data Science + Internship -> 2 results.
3. Open a job -> Apply while logged out -> login modal.
4. Register -> redirected back -> Apply -> button turns to "Applied".
5. My Applications -> the application with an "Applied" badge.
6. Open `/metrics` and the Grafana dashboard to show counters moving.
