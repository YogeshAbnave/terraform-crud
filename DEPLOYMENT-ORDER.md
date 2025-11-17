# Deployment Order Guide

## ⚠️ Common Error: LoadBalancerNotFound

If you see this error in GitHub Actions:

```
An error occurred (LoadBalancerNotFound) when calling the DescribeLoadBalancers operation: 
Load balancers '[crud-app-alb]' not found
```

**Cause:** You pushed code to GitHub before deploying the Terraform infrastructure.

## ✅ Correct Deployment Order

### Step 1: Deploy Infrastructure FIRST

```powershell
cd terraform-crud/terraform
terraform init
terraform apply
```

This creates:
- VPC and networking
- Application Load Balancer (ALB)
- Auto Scaling Group (ASG)
- EC2 instances
- DynamoDB table
- Security groups
- IAM roles

**Wait for Terraform to complete** (takes ~5-10 minutes)

### Step 2: Configure GitHub Secrets

```powershell
cd ..
.\scripts\get-secrets.ps1
```

Or manually get them:

```powershell
cd terraform
terraform output
```

Add these secrets to GitHub:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `EC2_PRIVATE_KEY`

Go to: `https://github.com/YOUR_USERNAME/terraform-crud/settings/secrets/actions`

### Step 3: Push Code to GitHub

```powershell
git add .
git commit -m "Deploy application"
git push origin main
```

This triggers the GitHub Actions workflow, which will:
1. Build the frontend
2. Find running EC2 instances in the ASG
3. Deploy code to all instances
4. Query the ALB DNS (now it exists!)
5. Run health checks

## 🔄 What Happens If You Skip Step 1?

The GitHub Actions workflow will:
- ✅ Build your code successfully
- ❌ Fail when trying to find ASG instances (none exist)
- ❌ Fail when trying to query the ALB (doesn't exist)

## 🛠 How to Fix If You Already Pushed

1. Deploy the infrastructure:
   ```powershell
   cd terraform-crud/terraform
   terraform apply
   ```

2. Re-run the failed GitHub Actions workflow:
   - Go to: `https://github.com/YOUR_USERNAME/terraform-crud/actions`
   - Click on the failed workflow
   - Click "Re-run all jobs"

## 📊 Deployment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Terraform Apply                                          │
│    Creates: VPC, ALB, ASG, EC2, DynamoDB, Security Groups   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Configure GitHub Secrets                                 │
│    Add: AWS credentials, EC2 SSH key                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Push Code to GitHub                                      │
│    Triggers: GitHub Actions workflow                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. GitHub Actions Deploys Code                              │
│    - Finds EC2 instances in ASG ✅                          │
│    - Deploys code via SSH ✅                                │
│    - Queries ALB DNS ✅                                     │
│    - Runs health checks ✅                                  │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Quick Commands

**Full deployment (recommended):**
```powershell
.\deploy.ps1 -All
```

**Manual step-by-step:**
```powershell
.\deploy.ps1 -Deploy   # Step 1
.\deploy.ps1 -Secrets  # Step 2
.\deploy.ps1 -Push     # Step 3
```

## 🔍 Verify Infrastructure Exists

Before pushing to GitHub, verify:

```powershell
# Check ALB
aws elbv2 describe-load-balancers --names crud-app-alb

# Check ASG
aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names crud-app-asg

# Check running instances
aws ec2 describe-instances --filters "Name=tag:aws:autoscaling:groupName,Values=crud-app-asg" "Name=instance-state-name,Values=running"
```

If any of these commands return "not found", run `terraform apply` first.

## 💡 Pro Tip

The updated GitHub Actions workflow now handles missing infrastructure gracefully:
- It won't fail completely if the ALB doesn't exist
- It will show a warning and provide instructions
- It will still deploy code to instances if they exist

But it's still best practice to deploy infrastructure first!
