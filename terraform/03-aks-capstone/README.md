# Capstone: AKS with Terraform + Deploying the Previous Project

## Step 1 — Read before running

In `main.tf`: where is the AKS module (`Azure/aks/azurerm`) called? Which values come from `variables.tf`/`terraform.tfvars` (`node_count`, `node_vm_size`) to keep cost minimal? Why is `azurerm_container_registry` created alongside AKS? (Because AKS needs a place to pull images from.)

## Step 2 — Bring it up

```bash
az login
terraform init
terraform plan
terraform apply     # takes a few minutes
```

## Step 3 — Connect kubectl

```bash
az aks get-credentials \
  --resource-group $(terraform output -raw resource_group_name) \
  --name $(terraform output -raw aks_cluster_name)
kubectl get nodes
```

## Step 4 — Push the image and deploy

Simpler option: use the existing image on Docker Hub (`rezabozorgi/secure-app:v1`) — no need for ACR, just apply the previous Kubernetes manifests directly:
```bash
kubectl apply -f ../../k8s-training-files/session-13-capstone/
kubectl get pods -w
kubectl get svc app-service
```

More realistic option (closer to a real company setup): push the image to the ACR created by this `main.tf`, and update the manifest to use `acr_login_server`:
```bash
az acr login --name $(terraform output -raw acr_login_server | cut -d. -f1)
docker tag rezabozorgi/secure-app:v1 $(terraform output -raw acr_login_server)/secure-app:v1
docker push $(terraform output -raw acr_login_server)/secure-app:v1
```

## Step 5 — Debug without opening the code

Introduce a deliberate error (e.g. a wrong image tag in the manifest) and diagnose it using only `kubectl describe pod` and `kubectl logs` — the same skill practiced in the Kubernetes debugging session, this time on a real cloud cluster.

## Step 6 — Clean up (don't forget, or you'll keep paying)

```bash
kubectl delete -f ../../k8s-training-files/session-13-capstone/
terraform destroy
```

If `destroy` gets stuck on something (e.g. a LoadBalancer that Kubernetes created on its own, which Terraform doesn't know about), delete it first with `kubectl delete svc app-service`, then run `terraform destroy` again.
