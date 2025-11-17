# Troubleshooting Guide

## Common GitHub Actions Errors

### 1. LoadBalancerNotFound

**Error:**
```
An error occurred (LoadBalancerNotFound) when calling the DescribeLoadBalancers operation
```

**Cause:** Terraform infrastructure not deployed yet

**Solution:**
```powershell
cd terraform-crud/terraform
terraform init
terraform apply
```

**Details:** See [REGION-FIX.md](REGION-FIX.md)

---

### 2. No Running Instances Found

**Error:**
```
❌ ERROR: No running instances found in ASG 'crud-app-asg'
```

**Cause:** Auto Scaling Group not created or instances not launched

**Solution:**
```powershell
cd terraform-crud/terraform
terraform apply

# Wait 2-3 minutes for instances to launch
aws ec2 describe-instances \
  --filters "Name=tag:aws:autoscaling:groupName,Values=crud-app-asg" \
  --region ap-south-1
```

---

### 3. Permission Denied (publickey)

**Error:**
```
ubuntu@13.200.242.176: Permission denied (publickey).
Error: Process completed with exit code 255.
```

**Cause:** EC2_PRIVATE_KEY GitHub secret is missing or incorrect

**Solution:**

1. Get the private key:
```powershell
cd terraform-crud
.\scripts\get-secrets.ps1
```

2. Copy the **entire** private key output (including BEGIN/END lines)

3. Add to GitHub:
   - Go to: `https://github.com/YOUR_USERNAME/terraform-crud/settings/secrets/actions`
   - Create secret named: `EC2_PRIVATE_KEY`
   - Paste the entire key

**Details:** See [GITHUB-SECRETS-SETUP.md](GITHUB-SECRETS-SETUP.md)

---

### 4. Region Mismatch

**Error:**
```
Resources not found in us-east-1
```

**Cause:** Workflow looking in wrong AWS region

**Solution:** Verify both files use `ap-south-1`:
- `terraform/variables.tf` → `aws_region = "ap-south-1"`
- `.github/workflows/deploy.yml` → `AWS_REGION: ap-south-1`

**Details:** See [REGION-FIX.md](REGION-FIX.md)

---

### 5. Health Check Failed (502 Bad Gateway)

**Error:**
```
curl: (22) The requested URL returned error: 502
```

**Cause:** Backend services not running or not healthy

**Solutions:**

**A. Wait for services to start**
Services may take 1-2 minutes to fully start after deployment.

**B. Check service status on EC2:**
```powershell
# SSH into instance
ssh -i .ssh/crud-app-key ubuntu@<INSTANCE_IP>

# Check FastAPI service
sudo systemctl status fastapi

# Check NGINX
sudo systemctl status nginx

# View FastAPI logs
sudo journalctl -u fastapi -n 50
```

**C. Manually restart services:**
```bash
sudo systemctl restart fastapi
sudo systemctl restart nginx
```

**D. Check ALB target health:**
```powershell
aws elbv2 describe-target-health \
  --target-group-arn <TARGET_GROUP_ARN> \
  --region ap-south-1
```

---

### 6. Invalid Format Error

**Error:**
```
Error: Invalid format '3.110.173.147'
```

**Cause:** IP address parsing issue in workflow (should be fixed in latest version)

**Solution:** Ensure you're using the latest workflow file with JSON parsing:
```yaml
INSTANCE_IPS=$(echo "$INSTANCE_IPS_JSON" | jq -r 'flatten | join(" ")')
```

---

### 7. AWS Credentials Not Configured

**Error:**
```
Error: Unable to locate credentials
```

**Cause:** AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY missing from GitHub secrets

**Solution:**

1. Get your AWS credentials from AWS Console (IAM → Users → Security credentials)

2. Add to GitHub secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

3. Ensure credentials have permissions for:
   - EC2 (describe instances, key pairs)
   - ELB (describe load balancers, target groups)
   - Auto Scaling (describe groups)
   - DynamoDB (read/write)

---

## Local Development Issues

### Backend Won't Start

**Error:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# source venv/bin/activate    # Linux/Mac
pip install -r requirements.txt
```

---

### Frontend Build Fails

**Error:**
```
npm ERR! code ENOENT
```

**Solution:**
```powershell
cd frontend
Remove-Item -Recurse node_modules
npm install
npm run build
```

---

### DynamoDB Connection Error

**Error:**
```
botocore.exceptions.NoCredentialsError
```

**Solution:**

1. Configure AWS CLI:
```powershell
aws configure
```

2. Or set environment variables:
```powershell
$env:AWS_ACCESS_KEY_ID="your-key"
$env:AWS_SECRET_ACCESS_KEY="your-secret"
$env:AWS_REGION="ap-south-1"
```

---

## Infrastructure Issues

### Terraform Apply Fails

**Error:**
```
Error: Error creating VPC: VpcLimitExceeded
```

**Solution:** Delete unused VPCs or request limit increase from AWS

---

### SSH Key Already Exists

**Error:**
```
Error: InvalidKeyPair.Duplicate: The keypair 'crud-app-key' already exists
```

**Solution:**

**Option 1:** Delete existing key pair:
```powershell
aws ec2 delete-key-pair --key-name crud-app-key --region ap-south-1
terraform apply
```

**Option 2:** Import existing state:
```powershell
terraform import aws_key_pair.deployer crud-app-key
```

---

### Instances Not Launching

**Check ASG status:**
```powershell
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names crud-app-asg \
  --region ap-south-1
```

**Check ASG activity:**
```powershell
aws autoscaling describe-scaling-activities \
  --auto-scaling-group-name crud-app-asg \
  --region ap-south-1 \
  --max-records 10
```

**Common causes:**
- Insufficient capacity in availability zone
- AMI not available in region
- Security group misconfiguration
- Subnet issues

---

## Verification Commands

### Check All Infrastructure

```powershell
# Run the infrastructure check script
.\scripts\check-infrastructure.ps1
```

### Manual Checks

```powershell
# VPC
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=crud-app-vpc" --region ap-south-1

# ALB
aws elbv2 describe-load-balancers --names crud-app-alb --region ap-south-1

# ASG
aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names crud-app-asg --region ap-south-1

# Running Instances
aws ec2 describe-instances \
  --filters "Name=tag:aws:autoscaling:groupName,Values=crud-app-asg" \
            "Name=instance-state-name,Values=running" \
  --region ap-south-1

# DynamoDB Table
aws dynamodb describe-table --table-name app-data-table --region ap-south-1
```

---

## Getting Help

### Check Logs

**GitHub Actions:**
- Go to: `https://github.com/YOUR_USERNAME/terraform-crud/actions`
- Click on failed workflow
- Expand failed step to see detailed logs

**EC2 Instance:**
```bash
# SSH into instance
ssh -i .ssh/crud-app-key ubuntu@<INSTANCE_IP>

# FastAPI logs
sudo journalctl -u fastapi -f

# NGINX logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**Terraform:**
```powershell
cd terraform
terraform show
terraform output
```

### Documentation

- [DEPLOYMENT-ORDER.md](DEPLOYMENT-ORDER.md) - Correct deployment sequence
- [GITHUB-SECRETS-SETUP.md](GITHUB-SECRETS-SETUP.md) - Setting up GitHub secrets
- [REGION-FIX.md](REGION-FIX.md) - Region configuration
- [ISSUE-RESOLVED.md](ISSUE-RESOLVED.md) - Previous issues and fixes

### Quick Fixes

**Reset Everything:**
```powershell
cd terraform-crud/terraform
terraform destroy -auto-approve
terraform apply -auto-approve
```

**Re-run Deployment:**
```powershell
git add .
git commit -m "Retry deployment"
git push origin main
```

**Check GitHub Secrets:**
Go to: `https://github.com/YOUR_USERNAME/terraform-crud/settings/secrets/actions`

Verify all three exist:
- ✅ AWS_ACCESS_KEY_ID
- ✅ AWS_SECRET_ACCESS_KEY
- ✅ EC2_PRIVATE_KEY

---

## Prevention

### Before Deploying

1. ✅ Deploy Terraform infrastructure first
2. ✅ Verify infrastructure exists (`.\scripts\check-infrastructure.ps1`)
3. ✅ Configure all GitHub secrets
4. ✅ Ensure correct region (ap-south-1)
5. ✅ Test locally first (`.\run-local.ps1 -Both`)

### Best Practices

- Always run `terraform plan` before `terraform apply`
- Keep Terraform state backed up
- Don't commit `.ssh/` directory
- Rotate AWS credentials regularly
- Monitor AWS costs
- Use tags for resource organization

---

## Still Having Issues?

1. Check the specific error message above
2. Review the relevant documentation
3. Verify all prerequisites are met
4. Check AWS Console for resource status
5. Review GitHub Actions logs for details
