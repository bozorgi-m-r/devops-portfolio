variable "location" {
  description = "Azure region"
  type        = string
  default     = "australiaeast"
}

variable "node_count" {
  description = "Number of AKS nodes — kept at the minimum for this exercise"
  type        = number
  default     = 1
}

variable "node_vm_size" {
  description = "VM size for each node — smallest option to minimize cost"
  type        = string
  default     = "Standard_B2s"
}
