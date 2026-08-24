# Task API

A small, production-style REST API for managing tasks, built with Express and backed by **PostgreSQL** (persistent storage) and **Redis** (fast cache / visit counter). The whole stack is containerized with Docker and orchestrated with Docker Compose.

This project was built to demonstrate practical, production-oriented Docker skills: multi-stage builds, non-root containers, healthchecks, conditional startup ordering, resource limits, and persistent volumes — not just "it runs in a container."

## Architecture

```
┌─────────┐      ┌──────────────┐      ┌────────────┐
│  Client │ ───► │   api (3000) │ ───► │ PostgreSQL │  (persistent task data)
└─────────┘      │   Express    │      └────────────┘
                  │              │      ┌────────────┐
                  └──────────────┘ ───► │   Redis    │  (visit counter / cache)
                                        └────────────┘
```

- **api** — Express server exposing the REST endpoints below. Built from source via a multi-stage Dockerfile.
- **db** — PostgreSQL 16, stores tasks in a named Docker volume so data survives container restarts.
- **redis** — Redis, used here as a lightweight counter/cache to show a second common storage pattern alongside a relational database.

## Why this project is structured this way

| Decision | Reason |
|---|---|
| Multi-stage Dockerfile | Keeps the final image small — build tools and dev dependencies never ship to production. |
| Non-root user (`appuser`) | Limits the blast radius if the application is ever compromised. |
| Healthchecks on every service | `depends_on` alone only guarantees a container has *started*, not that it's *ready*. Healthchecks make sure Postgres and Redis are actually accepting connections before the API starts. |
| Named volume for Postgres | Containers are disposable by design. Without a volume, recreating the `db` container would wipe all task data. |
| Password from `.env`, never hardcoded | Keeps secrets out of the image and out of version control. |
| Resource limits per service | Prevents one misbehaving service from starving the others of CPU/RAM. |
| `.dockerignore` | Keeps `node_modules`, `.git`, and `.env` out of the build context entirely. |

## Getting started

```bash
cp .env.example .env
# edit .env and set a real DB_PASSWORD

docker-compose up -d --build
docker-compose ps   # all three services should show "healthy"
```

## API reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health message + Redis-backed visit counter |
| GET | `/health` | Plain health check, used by Docker's HEALTHCHECK |
| GET | `/tasks` | List all tasks |
| POST | `/tasks` | Create a task — body: `{ "title": "string" }` |
| PATCH | `/tasks/:id/done` | Mark a task as done |
| DELETE | `/tasks/:id` | Delete a task |

### Example usage

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Docker"}'

curl http://localhost:3000/tasks

curl -X PATCH http://localhost:3000/tasks/1/done

curl -X DELETE http://localhost:3000/tasks/1
```

## Verifying data persistence

This is the detail worth demonstrating in an interview: task data survives a full container teardown, because it lives in a Docker volume, not inside the container itself.

```bash
docker-compose down      # removes all three containers + the network
docker-compose up -d     # recreates them from scratch
curl http://localhost:3000/tasks   # previously created tasks are still there
```

## Graceful shutdown

The app listens for `SIGTERM` (sent by `docker stop`) and `SIGINT`, and on receiving either one it stops accepting new HTTP requests, closes the Redis connection, closes the PostgreSQL connection pool, and only then exits. Without this, Docker falls back to `SIGKILL` after its grace period, which can cut off in-flight requests mid-write.

## Testing

A small test suite covers the parts of the API that don't require a live database or Redis connection (the health check, and request validation), so it can run anywhere — including CI — without `docker-compose up`.

```bash
npm install
npm test
```

## Continuous Integration

`.github/workflows/ci.yml` runs on every push and pull request to `main`:
1. Installs dependencies and runs the test suite.
2. Builds the Docker image, to catch any Dockerfile regressions early.

## Tech stack

- Node.js 20 (Alpine)
- Express
- PostgreSQL 16
- Redis (Alpine)
- Docker & Docker Compose
- GitHub Actions (CI)

## Possible next steps

- Add authentication (JWT) to the API
- Scan the built image with Trivy as part of CI
- Add pagination to `GET /tasks`
- Add integration tests that run against a real Postgres/Redis via `docker-compose` in CI
