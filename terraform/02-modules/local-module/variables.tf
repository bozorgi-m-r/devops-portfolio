variable "environment_name" {
  description = "Environment name (e.g. dev or staging) — appended to resource names"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "australiaeast"
}

variable "address_space" {
  description = "Network CIDR for this environment"
  type        = string
}
