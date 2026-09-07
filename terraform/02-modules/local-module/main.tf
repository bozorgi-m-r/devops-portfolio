resource "azurerm_resource_group" "this" {
  name     = "rg-${var.environment_name}"
  location = var.location
}

resource "azurerm_virtual_network" "this" {
  name                = "vnet-${var.environment_name}"
  address_space       = [var.address_space]
  location            = azurerm_resource_group.this.location
  resource_group_name = azurerm_resource_group.this.name
}

resource "azurerm_subnet" "this" {
  name                 = "subnet-${var.environment_name}"
  resource_group_name  = azurerm_resource_group.this.name
  virtual_network_name = azurerm_virtual_network.this.name
  address_prefixes     = [cidrsubnet(var.address_space, 8, 1)]
}
