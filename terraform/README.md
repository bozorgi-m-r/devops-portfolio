# Terraform — Infrastructure as Code

This folder is the Terraform layer of the [devops-portfolio](../) monorepo — the third layer after [Docker](../docker) and [Kubernetes](../k8s).

## What it builds

| Folder | What it creates | Provider |
|---|---|---|
| `01-azure-basics/` | Resource Group + Virtual Network + Subnet | azurerm |
| `02-modules/` | Reusable network module, called twice (dev/staging environments) | azurerm |
| `03-aks-capstone/` | AKS Cluster + Azure Container Registry, using the official `Azure/aks/azurerm` module | azurerm |

## Design decisions

- **Module over from-scratch resources:** `03-aks-capstone` uses the official Terraform Registry module for AKS instead of writing `azurerm_kubernetes_cluster` from scratch — the same approach used by real teams in production.
- **Implicit dependencies:** Resources reference each other directly (e.g. `resource_group_name = azurerm_resource_group.main.name`) instead of hardcoding names, so Terraform can build a correct dependency graph.
- **Cost-minimized:** Node size and count (`Standard_B2s`, 1 node) are intentionally kept small — this project is for demonstrating skills, not a production workload.

## Running any of these

```bash
cd 01-azure-basics    # or 02-modules/root, or 03-aks-capstone
az login
terraform init
terraform plan
terraform apply
```

Always run `terraform destroy` after testing to avoid ongoing cloud costs.

## Related layers

- [Docker layer](../docker) — Task API (Express + PostgreSQL + Redis)
- [Kubernetes layer](../k8s) — the same API deployed via Kubernetes manifests
