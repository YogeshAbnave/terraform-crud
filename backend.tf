# Launch Template for Backend
resource "aws_launch_template" "backend" {
  name_prefix   = "backend-lt-"
  image_id      = "ami-02b8269d5e85954ef"
  instance_type = "t3.micro"

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.backend.id]
  }

  user_data = base64encode(<<-EOF
              #!/bin/bash
              yum update -y
              yum install -y nodejs npm
              # Your backend application setup here
              EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "backend-instance"
    }
  }
}

# Auto Scaling Group for Backend
resource "aws_autoscaling_group" "backend" {
  name                      = "backend-asg"
  vpc_zone_identifier       = [aws_subnet.private_1.id, aws_subnet.private_2.id]
  health_check_type         = "EC2"
  health_check_grace_period = 300
  min_size                  = 2
  max_size                  = 4
  desired_capacity          = 2

  launch_template {
    id      = aws_launch_template.backend.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "backend-asg-instance"
    propagate_at_launch = true
  }
}
