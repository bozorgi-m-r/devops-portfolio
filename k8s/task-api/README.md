# Task API — Kubernetes Manifests

Kubernetes deployment of the Task API stack (Node.js + PostgreSQL + Redis),
ported from the Docker Compose setup in `docker/task-api/`.

## Components

| File | Resource | Purpose |
|---|---|---|
| `secret.example.yaml` | Secret | Database password (copy to `secret.yaml` and set a real value before applying) |
| `postgres-pvc.yaml` | PersistentVolumeClaim | Durable storage for PostgreSQL data |
| `postgres.yaml` | Deployment + Service | PostgreSQL 16 database, exposed internally as `db` |
| `redis.yaml` | Deployment + Service | Redis cache, exposed internally as `redis` |
| `api.yaml` | Deployment + Service | Node.js Task API, exposed via NodePort on port 3000 |

## Deploy

```bash
cp secret.example.yaml secret.yaml
# edit secret.yaml and set a real DB_PASSWORD value
kubectl apply -f secret.yaml
kubectl apply -f postgres-pvc.yaml
kubectl apply -f postgres.yaml
kubectl apply -f redis.yaml
kubectl apply -f api.yaml
```

## Notes

- The API reads `DB_HOST=db` and `REDIS_HOST=redis`, resolved via Kubernetes'
  internal DNS (no hardcoded IPs).
- Both `postgres` and `redis` use `exec`-based readiness probes
  (`pg_isready`, `redis-cli ping`), mirroring the original Docker Compose
  healthchecks.
- The API exposes a `/health` endpoint used by both readiness and liveness
  probes.
