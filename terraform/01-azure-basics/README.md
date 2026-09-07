# Session 5 Exercise: Azure Provider

Prerequisite: you must be logged in via `az login` with an active subscription (Free Tier or PAYG).

Before running, find in `main.tf`: how does the VNet get `resource_group_name` from the Resource Group (not hardcoded)? This implicit dependency is what tells Terraform it must create the Resource Group first.

```bash
az login
terraform init
terraform plan
terraform apply
az group show --name $(terraform output -raw resource_group_name)
terraform destroy
```

The resources in this session (Resource Group, VNet, Subnet) are all in Azure's free tier — no cost, but always run `destroy` after testing.
