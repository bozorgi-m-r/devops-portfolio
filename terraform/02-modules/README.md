# Session 6 Exercise: Modules

## Step 1 — Read before running anything

Open `local-module/variables.tf`: what inputs does it take, and which ones have no `default` (meaning they're required)?
Open `local-module/outputs.tf`: what does it return?
Open `root/main.tf`: this module is called twice, with different parameters (`dev` and `staging`).

## Step 2 — Run

```bash
cd root
terraform init
terraform plan
terraform apply
terraform output
terraform destroy
```

## Step 3 — A real module from the Registry

Just run `plan`, no need to `apply`. Open `registry.terraform.io/modules/Azure/vnet/azurerm` and compare its defined `variables` with our own `local-module/variables.tf` — what difference do you see in complexity level?
