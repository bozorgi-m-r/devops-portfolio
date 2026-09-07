terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "rg-tf-capstone"
  location = var.location
}

resource "azurerm_container_registry" "acr" {
  name                = "acrtfcapstone${random_string.suffix.result}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "random_string" "suffix" {
  length  = 6
  special = false
  upper   = false
}

# Using the official AKS module from the Registry instead of writing
# azurerm_kubernetes_cluster from scratch
module "aks" {
  source  = "Azure/aks/azurerm"
  version = "~> 8.0"

  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  cluster_name        = "aks-tf-capstone"
  prefix              = "tfcapstone"

  agents_count = var.node_count
  agents_size  = var.node_vm_size

  network_plugin = "azure"
}

output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "aks_cluster_name" {
  value = module.aks.aks_name
}

output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}
