output "ec2_public_ip" {
  description = "Public IP of EC2 instance"
  value       = aws_instance.app.public_ip
}

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_instance.app.public_ip}"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_instance.app.public_ip}/api"
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.main.name
}

output "ssh_command" {
  description = "SSH command to connect to EC2"
  value       = "ssh -i .ssh/crud-app-key ubuntu@${aws_instance.app.public_ip}"
}

output "private_key_path" {
  description = "Path to private SSH key"
  value       = local_file.private_key.filename
}

output "github_secrets" {
  description = "GitHub Secrets configuration"
  value = {
    EC2_HOST        = aws_instance.app.public_ip
    EC2_PRIVATE_KEY = "See file: ${local_file.private_key.filename}"
  }
}

# Sensitive output for automation
output "private_key_openssh" {
  description = "Private key in OpenSSH format (sensitive)"
  value       = tls_private_key.ssh.private_key_openssh
  sensitive   = true
}
