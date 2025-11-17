# 🎯 Complete Manual AWS Setup Guide
## Application Load Balancer + Auto Scaling + Multi-Tier Architecture

This guide will help you manually create a production-ready architecture with ALB and Auto Scaling using AWS Console.

---

## 📋 Prerequisites

- AWS Account with admin access
- Your application code ready
- DynamoDB table already created (app-data-table)
- Basic understanding of AWS services

---

## 🏗️ Architecture We'll Build

```
Internet
    ↓
Application Load Balancer (ALB)
    ↓
┌─────────────────────────────────────┐
│ Public Subnet 1    Public Subnet 2  │
│  Frontend ASG       Frontend ASG    │
│  (2-4 instances)   (2-4 instances)  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Private Subnet 1   Private Subnet 2 │
│  Backend ASG        Backend ASG     │
│  (2-4 instances)   (2-4 instances)  │
└─────────────────────────────────────┘
    ↓
DynamoDB Table
```

---

## 📝 Table of Contents

1. [Create Additional Subnets](#step-1-create-additional-subnets)
2. [Create NAT Gateway](#step-2-create-nat-gateway)
3. [Create AMI from Existing Instance](#step-3-create-ami-from-existing-instance)
4. [Create Launch Templates](#step-4-create-launch-templates)
5. [Create Target Groups](#step-5-create-target-groups)
6. [Create Application Load Balancer](#step-6-create-application-load-balancer)
7. [Create Auto Scaling Groups](#step-7-create-auto-scaling-groups)
8. [Configure Auto Scaling Policies](#step-8-configure-auto-scaling-policies)
9. [Test and Verify](#step-9-test-and-verify)

---

## STEP 1: Create Additional Subnets

### 1.1 Create Second Public Subnet

1. **Go to VPC Console:**
   - URL: https://console.aws.amazon.com/vpc/
   - Region: ap-south-1

2. **Click "Subnets" in left sidebar**

3. **Click "Create subnet" button (orange)**

4. **Fill in details:**
   - **VPC ID:** Select `crud-app-vpc`
   - **Subnet name:** `crud-app-public-subnet-2`
   - **Availability Zone:** `ap-south-1b` (different from subnet 1)
   - **IPv4 CIDR block:** `10.0.2.0/24`

5. **Click "Create subnet"**

6. **Enable Auto-assign Public IP:**
   - Select the new subnet
   - Click "Actions" → "Edit subnet settings"
   - Check "Enable auto-assign public IPv4 address"
   - Click "Save"

7. **Associate with Route Table:**
   - Select the subnet
   - Click "Route table" tab
   - Click "Edit route table association"
   - Select `crud-app-public-rt`
   - Click "Save"

---

### 1.2 Create First Private Subnet

1. **Click "Create subnet"**

2. **Fill in details:**
   - **VPC ID:** `crud-app-vpc`
   - **Subnet name:** `crud-app-private-subnet-1`
   - **Availability Zone:** `ap-south-1a`
   - **IPv4 CIDR block:** `10.0.10.0/24`

3. **Click "Create subnet"**

---

### 1.3 Create Second Private Subnet

1. **Click "Create subnet"**

2. **Fill in details:**
   - **VPC ID:** `crud-app-vpc`
   - **Subnet name:** `crud-app-private-subnet-2`
   - **Availability Zone:** `ap-south-1b`
   - **IPv4 CIDR block:** `10.0.11.0/24`

3. **Click "Create subnet"**

---

## STEP 2: Create NAT Gateway

### 2.1 Allocate Elastic IP

1. **Go to VPC Console → Elastic IPs**

2. **Click "Allocate Elastic IP address"**

3. **Settings:**
   - **Network Border Group:** ap-south-1
   - **Public IPv4 address pool:** Amazon's pool

4. **Click "Allocate"**

5. **Note the Elastic IP** (you'll need it)

---

### 2.2 Create NAT Gateway

1. **Go to VPC Console → NAT Gateways**

2. **Click "Create NAT gateway"**

3. **Fill in details:**
   - **Name:** `crud-app-nat-gateway`
   - **Subnet:** Select `crud-app-public-subnet` (first public subnet)
   - **Connectivity type:** Public
   - **Elastic IP allocation ID:** Select the EIP you just created

4. **Click "Create NAT gateway"**

5. **Wait 2-3 minutes** for status to become "Available"

---

### 2.3 Create Private Route Table

1. **Go to VPC Console → Route Tables**

2. **Click "Create route table"**

3. **Fill in details:**
   - **Name:** `crud-app-private-rt`
   - **VPC:** `crud-app-vpc`

4. **Click "Create route table"**

5. **Add route to NAT Gateway:**
   - Select the new route table
   - Click "Routes" tab
   - Click "Edit routes"
   - Click "Add route"
   - **Destination:** `0.0.0.0/0`
   - **Target:** NAT Gateway → Select `crud-app-nat-gateway`
   - Click "Save changes"

6. **Associate with Private Subnets:**
   - Click "Subnet associations" tab
   - Click "Edit subnet associations"
   - Select both private subnets:
     - `crud-app-private-subnet-1`
     - `crud-app-private-subnet-2`
   - Click "Save associations"

---

## STEP 3: Create AMI from Existing Instance

### 3.1 Create Image from Current EC2

1. **Go to EC2 Console:**
   - URL: https://console.aws.amazon.com/ec2/

2. **Click "Instances" in left sidebar**

3. **Select your instance:** `crud-app-server`

4. **Click "Actions" → "Image and templates" → "Create image"**

5. **Fill in details:**
   - **Image name:** `crud-app-base-image`
   - **Image description:** `Base image with NGINX and Python configured`
   - **No reboot:** Leave unchecked (recommended)

6. **Click "Create image"**

7. **Go to "AMIs" in left sidebar**

8. **Wait for Status** to change from "pending" to "available" (~5 minutes)

9. **Note the AMI ID** (e.g., ami-0123456789abcdef0)

---

## STEP 4: Create Launch Templates

### 4.1 Create Frontend Launch Template

1. **Go to EC2 Console → Launch Templates**

2. **Click "Create launch template"**

3. **Template name and description:**
   - **Launch template name:** `crud-app-frontend-template`
   - **Template version description:** `Frontend with NGINX`
   - **Auto Scaling guidance:** Check the box

4. **Application and OS Images (AMI):**
   - Click "My AMIs"
   - Select `crud-app-base-image`

5. **Instance type:**
   - Select `t2.micro`

6. **Key pair:**
   - Select `crud-app-key`

7. **Network settings:**
   - **Don't include in launch template** (we'll set this in ASG)

8. **Security groups:**
   - Select `crud-app-sg`

9. **Advanced details:**
   - **IAM instance profile:** Select `crud-app-ec2-profile`
   
   - **User data:** Paste this:
   ```bash
   #!/bin/bash
   # Frontend setup
   sudo systemctl restart nginx
   sudo systemctl enable nginx
   ```

10. **Click "Create launch template"**

---

### 4.2 Create Backend Launch Template

1. **Click "Create launch template"**

2. **Template name and description:**
   - **Launch template name:** `crud-app-backend-template`
   - **Template version description:** `Backend with FastAPI`
   - **Auto Scaling guidance:** Check the box

3. **Application and OS Images (AMI):**
   - Click "My AMIs"
   - Select `crud-app-base-image`

4. **Instance type:**
   - Select `t2.micro`

5. **Key pair:**
   - Select `crud-app-key`

6. **Security groups:**
   - Select `crud-app-sg`

7. **Advanced details:**
   - **IAM instance profile:** `crud-app-ec2-profile`
   
   - **User data:** Paste this:
   ```bash
   #!/bin/bash
   # Backend setup
   cd /var/www/backend
   sudo systemctl restart fastapi
   sudo systemctl enable fastapi
   ```

8. **Click "Create launch template"**

---

## STEP 5: Create Target Groups

### 5.1 Create Frontend Target Group

1. **Go to EC2 Console → Target Groups**

2. **Click "Create target group"**

3. **Basic configuration:**
   - **Choose a target type:** Instances
   - **Target group name:** `crud-app-frontend-tg`
   - **Protocol:** HTTP
   - **Port:** 80
   - **VPC:** `crud-app-vpc`
   - **Protocol version:** HTTP1

4. **Health checks:**
   - **Health check protocol:** HTTP
   - **Health check path:** `/`
   - **Advanced health check settings:**
     - **Healthy threshold:** 2
     - **Unhealthy threshold:** 2
     - **Timeout:** 5 seconds
     - **Interval:** 30 seconds
     - **Success codes:** 200

5. **Click "Next"**

6. **Register targets:**
   - Skip this (Auto Scaling will register instances)
   - Click "Create target group"

---

### 5.2 Create Backend Target Group

1. **Click "Create target group"**

2. **Basic configuration:**
   - **Choose a target type:** Instances
   - **Target group name:** `crud-app-backend-tg`
   - **Protocol:** HTTP
   - **Port:** 8000
   - **VPC:** `crud-app-vpc`

3. **Health checks:**
   - **Health check protocol:** HTTP
   - **Health check path:** `/api/health`
   - **Advanced health check settings:**
     - **Healthy threshold:** 2
     - **Unhealthy threshold:** 2
     - **Timeout:** 5 seconds
     - **Interval:** 30 seconds
     - **Success codes:** 200

4. **Click "Next"**

5. **Click "Create target group"**

---

## STEP 6: Create Application Load Balancer

### 6.1 Create ALB

1. **Go to EC2 Console → Load Balancers**

2. **Click "Create load balancer"**

3. **Select "Application Load Balancer"**

4. **Click "Create"**

5. **Basic configuration:**
   - **Load balancer name:** `crud-app-alb`
   - **Scheme:** Internet-facing
   - **IP address type:** IPv4

6. **Network mapping:**
   - **VPC:** `crud-app-vpc`
   - **Mappings:** Select BOTH availability zones:
     - ✅ ap-south-1a → `crud-app-public-subnet`
     - ✅ ap-south-1b → `crud-app-public-subnet-2`

7. **Security groups:**
   - Remove default
   - Select `crud-app-sg`

8. **Listeners and routing:**
   - **Protocol:** HTTP
   - **Port:** 80
   - **Default action:** Forward to `crud-app-frontend-tg`

9. **Click "Create load balancer"**

10. **Wait 2-3 minutes** for state to become "Active"

11. **Note the DNS name** (e.g., crud-app-alb-123456789.ap-south-1.elb.amazonaws.com)

---

### 6.2 Add Backend Listener Rule

1. **Select your ALB** (`crud-app-alb`)

2. **Click "Listeners" tab**

3. **Click on the HTTP:80 listener**

4. **Click "Manage rules"**

5. **Click "Add rule" (+ icon at top)**

6. **Add condition:**
   - Click "Add condition"
   - Select "Path"
   - Enter `/api*`
   - Click checkmark

7. **Add action:**
   - Select "Forward to"
   - **Target group:** `crud-app-backend-tg`

8. **Set priority:** 1

9. **Click "Save"**

---

## STEP 7: Create Auto Scaling Groups

### 7.1 Create Frontend Auto Scaling Group

1. **Go to EC2 Console → Auto Scaling Groups**

2. **Click "Create Auto Scaling group"**

3. **Step 1: Choose launch template**
   - **Auto Scaling group name:** `crud-app-frontend-asg`
   - **Launch template:** `crud-app-frontend-template`
   - Click "Next"

4. **Step 2: Choose instance launch options**
   - **VPC:** `crud-app-vpc`
   - **Availability Zones and subnets:** Select:
     - ✅ `crud-app-public-subnet` (ap-south-1a)
     - ✅ `crud-app-public-subnet-2` (ap-south-1b)
   - Click "Next"

5. **Step 3: Configure advanced options**
   - **Load balancing:** Attach to an existing load balancer
   - **Choose from your load balancer target groups**
   - Select `crud-app-frontend-tg`
   - **Health checks:**
     - ✅ Turn on Elastic Load Balancing health checks
     - **Health check grace period:** 300 seconds
   - Click "Next"

6. **Step 4: Configure group size and scaling**
   - **Desired capacity:** 2
   - **Minimum capacity:** 2
   - **Maximum capacity:** 4
   - **Scaling policies:** Target tracking scaling policy
   - **Metric type:** Average CPU utilization
   - **Target value:** 70
   - Click "Next"

7. **Step 5: Add notifications**
   - Skip (click "Next")

8. **Step 6: Add tags**
   - **Key:** Name
   - **Value:** frontend-asg-instance
   - Click "Next"

9. **Step 7: Review**
   - Review all settings
   - Click "Create Auto Scaling group"

---

### 7.2 Create Backend Auto Scaling Group

1. **Click "Create Auto Scaling group"**

2. **Step 1: Choose launch template**
   - **Auto Scaling group name:** `crud-app-backend-asg`
   - **Launch template:** `crud-app-backend-template`
   - Click "Next"

3. **Step 2: Choose instance launch options**
   - **VPC:** `crud-app-vpc`
   - **Availability Zones and subnets:** Select:
     - ✅ `crud-app-private-subnet-1` (ap-south-1a)
     - ✅ `crud-app-private-subnet-2` (ap-south-1b)
   - Click "Next"

4. **Step 3: Configure advanced options**
   - **Load balancing:** Attach to an existing load balancer
   - Select `crud-app-backend-tg`
   - **Health checks:**
     - ✅ Turn on Elastic Load Balancing health checks
     - **Health check grace period:** 300 seconds
   - Click "Next"

5. **Step 4: Configure group size and scaling**
   - **Desired capacity:** 2
   - **Minimum capacity:** 2
   - **Maximum capacity:** 4
   - **Scaling policies:** Target tracking scaling policy
   - **Metric type:** Average CPU utilization
   - **Target value:** 70
   - Click "Next"

6. **Step 5-7:** Skip notifications, add tags, review

7. **Click "Create Auto Scaling group"**

---

## STEP 8: Configure Auto Scaling Policies

### 8.1 Add Scale-Out Policy (Frontend)

1. **Go to Auto Scaling Groups**

2. **Select `crud-app-frontend-asg`**

3. **Click "Automatic scaling" tab**

4. **Click "Create dynamic scaling policy"**

5. **Policy details:**
   - **Policy type:** Simple scaling
   - **Scaling policy name:** `frontend-scale-out`
   - **CloudWatch alarm:** Create new alarm
     - **Metric:** CPUUtilization
     - **Threshold:** Greater than 70
     - **Period:** 2 minutes
   - **Take the action:** Add 1 capacity units
   - **Wait:** 300 seconds

6. **Click "Create"**

---

### 8.2 Add Scale-In Policy (Frontend)

1. **Click "Create dynamic scaling policy"**

2. **Policy details:**
   - **Policy type:** Simple scaling
   - **Scaling policy name:** `frontend-scale-in`
   - **CloudWatch alarm:** Create new alarm
     - **Metric:** CPUUtilization
     - **Threshold:** Less than 30
     - **Period:** 2 minutes
   - **Take the action:** Remove 1 capacity units
   - **Wait:** 300 seconds

3. **Click "Create"**

---

### 8.3 Repeat for Backend ASG

Repeat steps 8.1 and 8.2 for `crud-app-backend-asg`

---

## STEP 9: Test and Verify

### 9.1 Check ALB Health

1. **Go to EC2 → Load Balancers**

2. **Select `crud-app-alb`**

3. **Copy DNS name**

4. **Open in browser:**
   ```
   http://crud-app-alb-123456789.ap-south-1.elb.amazonaws.com
   ```

5. **You should see your application!**

---

### 9.2 Check Target Health

1. **Go to EC2 → Target Groups**

2. **Select `crud-app-frontend-tg`**

3. **Click "Targets" tab**

4. **Verify:** All instances show "healthy"

5. **Repeat for `crud-app-backend-tg`**

---

### 9.3 Check Auto Scaling

1. **Go to EC2 → Auto Scaling Groups**

2. **Select `crud-app-frontend-asg`**

3. **Click "Activity" tab**

4. **Verify:** Instances are launching

5. **Click "Instance management" tab**

6. **Verify:** 2 instances running

---

### 9.4 Test API

```bash
# Test frontend
curl http://YOUR-ALB-DNS-NAME/

# Test backend
curl http://YOUR-ALB-DNS-NAME/api/health

# Test CRUD
curl http://YOUR-ALB-DNS-NAME/api/items
```

---

## 🎉 Congratulations!

You've successfully created:
- ✅ Application Load Balancer
- ✅ 2 Auto Scaling Groups (Frontend + Backend)
- ✅ 4 Subnets (2 Public + 2 Private)
- ✅ NAT Gateway
- ✅ Target Groups with health checks
- ✅ Auto Scaling Policies

---

## 📊 View Your Resources

| Resource | Console Link |
|----------|--------------|
| **Load Balancers** | https://console.aws.amazon.com/ec2/home?region=ap-south-1#LoadBalancers: |
| **Auto Scaling Groups** | https://console.aws.amazon.com/ec2/home?region=ap-south-1#AutoScalingGroups: |
| **Target Groups** | https://console.aws.amazon.com/ec2/home?region=ap-south-1#TargetGroups: |
| **Instances** | https://console.aws.amazon.com/ec2/home?region=ap-south-1#Instances: |
| **Subnets** | https://console.aws.amazon.com/vpc/home?region=ap-south-1#subnets: |

---

## 💰 Cost Estimate

- **ALB:** ~$16/month
- **NAT Gateway:** ~$32/month
- **EC2 Instances (4 x t2.micro):** ~$30/month
- **Data Transfer:** ~$10/month
- **Total:** ~$88/month

---

## 🧹 Cleanup (When Done)

1. Delete Auto Scaling Groups
2. Delete Load Balancer
3. Delete Target Groups
4. Delete NAT Gateway
5. Release Elastic IP
6. Delete Launch Templates
7. Terminate EC2 Instances
8. Delete Subnets
9. Delete Route Tables

---

**Need help?** Each step is detailed with exact clicks and values. Follow in order! 🚀
