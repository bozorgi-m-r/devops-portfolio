# DevOps Portfolio

[![CI with Quality Gates](https://github.com/bozorgi-m-r/devops-portfolio/actions/workflows/ci-with-tests.yml/badge.svg)](https://github.com/bozorgi-m-r/devops-portfolio/actions/workflows/ci-with-tests.yml)

A hands-on DevOps portfolio demonstrating the full lifecycle of a containerized application: from local development to automated, production-style deployment on Kubernetes. Built as a progressive learning project covering four core disciplines — Docker, Kubernetes, Terraform, and CI/CD.

## Architecture Overview
                    ┌─────────────────────┐
                    │   Task API (App)    │
                    │  Node.js + Express   │
                    └──────────┬───────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
          ┌──────────┐  ┌──────────┐   ┌───────────┐
          │PostgreSQL│  │  Redis   │   │  Docker    │
          │          │  │          │   │  Image     │
          └──────────┘  └──────────┘   └─────┬─────┘
                                              │
                                              ▼
                                     ┌──────────────────┐
                                     │   Docker Hub      │
                                     │ rezabozorgi/      │
                                     │   task-api         │
                                     └────────┬──────────┘
                                              │
                                              ▼
                                ┌───────────────────────────┐
                                │  Kubernetes (AKS)          │
                                │  Deployments + Services    │
                                │  Postgres / Redis / API    │
                                └───────────┬─────────────────┘
                                              │
                                              ▼
                                ┌───────────────────────────┐
                                │  Terraform                 │
                                │  Provisions the AKS cluster│
                                │  and supporting resources  │
                                └───────────┬─────────────────┘
                                              │
                                              ▼
                                ┌───────────────────────────┐
                                │  GitHub Actions (CI/CD)    │
                                │  Lint → Test → Build →     │
                                │  Push → Deploy → Approve   │
                                └───────────────────────────┘
Each layer builds on the previous one: the application is containerized with **Docker**, orchestrated with **Kubernetes**, its cloud infrastructure is provisioned with **Terraform**, and the entire pipeline — from a code push to a running deployment — is automated with **GitHub Actions**.

## Projects

### [Task API — Dockerized REST API](docker/task-api/)

A multi-container REST API (Node.js/Express, PostgreSQL, Redis) demonstrating production-oriented Docker practices: multi-stage builds, non-root containers, health-checked service dependencies, persistent volumes, and automated image builds.

**Stack:** Docker, Docker Compose, PostgreSQL, Redis, Node.js

### [Kubernetes Manifests](k8s/task-api/)

Kubernetes deployment of the Task API stack, including Deployments, Services, Secrets, and a PersistentVolumeClaim for PostgreSQL. Covers real-world debugging scenarios such as missing environment variables and PostgreSQL data directory initialization on mounted volumes.

**Stack:** Kubernetes, kubectl, Minikube (local development)

### [Terraform — AKS Infrastructure](terraform/03-aks-capstone/)

Infrastructure as Code for provisioning an Azure Kubernetes Service (AKS) cluster, an Azure Container Registry, and supporting resources. Structured in three progressive layers: Azure basics, reusable modules, and a full AKS capstone.

**Stack:** Terraform, Azure (AKS, ACR, Resource Groups)

### [CI/CD Pipeline](.github/workflows/)

Automated GitHub Actions workflows covering the full software delivery lifecycle:

- **`ci-with-tests.yml`** — Runs on every push to `main`. Lints and tests the Task API, then builds and pushes a Docker image to Docker Hub, tagged with both `latest` and the commit SHA. Deployment only proceeds if tests pass.
- **`cd-aks.yml`** — Deploys the latest image to the AKS cluster via `kubectl set image`, then waits for the rollout to complete before reporting success. Triggered manually (`workflow_dispatch`) since the AKS cluster is provisioned on demand to avoid ongoing cloud costs.
- **`deploy-with-approval.yml`** — Demonstrates a manual approval gate using a GitHub Environment with a required reviewer, preventing any deployment to production without explicit human sign-off.

**Stack:** GitHub Actions, Docker Hub, Azure CLI, kubectl

## Notes on Cost Management

The AKS cluster used in this project is provisioned on demand with Terraform and destroyed after each working session to avoid unnecessary Azure charges on a pay-as-you-go subscription. The `cd-aks.yml` workflow is therefore set to manual trigger rather than automatic, so it can be run whenever the cluster is live.

## License

See [LICENSE](LICENSE).
