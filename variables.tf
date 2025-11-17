# Variables (optional - for customization)
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "frontend_instance_type" {
  description = "Instance type for frontend servers"
  type        = string
  default     = "t3.micro"
}

variable "backend_instance_type" {
  description = "Instance type for backend servers"
  type        = string
  default     = "t3.micro"
}

variable "frontend_min_size" {
  description = "Minimum number of frontend instances"
  type        = number
  default     = 2
}

variable "frontend_max_size" {
  description = "Maximum number of frontend instances"
  type        = number
  default     = 4
}

variable "backend_min_size" {
  description = "Minimum number of backend instances"
  type        = number
  default     = 2
}

variable "backend_max_size" {
  description = "Maximum number of backend instances"
  type        = number
  default     = 4
}
