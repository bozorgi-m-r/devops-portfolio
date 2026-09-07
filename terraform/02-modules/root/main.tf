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

module "network_dev" {
  source           = "../local-module"
  environment_name = "tf06-dev"
  address_space    = "10.20.0.0/16"
}

module "network_staging" {
  source           = "../local-module"
  environment_name = "tf06-staging"
  address_space    = "10.21.0.0/16"
}

output "dev_vnet_id" {
  value = module.network_dev.vnet_id
}

output "staging_vnet_id" {
  value = module.network_staging.vnet_id
}
