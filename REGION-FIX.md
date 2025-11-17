# Region Mismatch Fix

## Problem Identified

Your GitHub Actions workflow was failing because of a **region mismatch**:

- **Terraform Infrastructure:** Deployed in `ap-south-1` (Mumbai, India)
- **GitHub Actions Workflow:** Looking in `ap-south-1` (N. Virginia, USA)

### Error Messages
```
❌ ERROR: No running instances found in ASG 'crud-app-asg'
LoadBalancerNotFound: Load balancers '[crud-app-alb]' not found
```

## Root Cause

The workflow was searching for your infrastructure in the wrong AWS region:

```yaml
env:
  AWS_REGION: ap-south-1  # ❌ Wrong region!
```

But your Terraform configuration uses:

```terraform
variable "aws_region" {
  default = "ap-south-1"  # ✅ Correct region
}
```

## Fix Applied

Updated `.github/workflows/deploy.yml`:

```yaml
env:
  AWS_REGION: ap-south-1  # ✅ Now matches Terraform
```

## Verification

Your ASG exists and is configured correctly:
- **Name:** `crud-app-asg`
- **Region:** `ap-south-1`
- **Desired Capacity:** 2 instances
- **Min/Max:** 2-4 instances
- **Availability Zones:** ap-south-1a, ap-south-1b

## Next Steps

### 1. Verify Infrastructure

Run the check script to confirm everything is in the correct region:

```powershell
.\scripts\check-infrastructure.ps1
```

This will verify:
- ✅ VPC exists in ap-south-1
- ✅ ALB exists in ap-south-1
- ✅ ASG exists in ap-south-1
- ✅ EC2 instances are running
- ✅ DynamoDB table exists

### 2. Configure GitHub Secrets

Make sure you have these secrets configured in your GitHub repository:

```powershell
.\scripts\get-secrets.ps1
```

Required secrets:
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `EC2_PRIVATE_KEY` - SSH key for EC2 instances

Add them at: `https://github.com/YOUR_USERNAME/terraform-crud/settings/secrets/actions`

### 3. Push to GitHub

Now that the region is fixed, push your code:

```powershell
git add .
git commit -m "Fix region mismatch in GitHub Actions"
git push origin main
```

The workflow should now:
1. ✅ Find your ASG in ap-south-1
2. ✅ Discover running EC2 instances
3. ✅ Deploy code to instances
4. ✅ Query ALB DNS in ap-south-1
5. ✅ Run health checks successfully

## Why This Happened

Common causes of region mismatches:

1. **Copy-paste from examples** - Many AWS tutorials use `ap-south-1` as the default
2. **AWS CLI default region** - Your local AWS CLI might be configured for a different region
3. **Multiple AWS accounts/regions** - Working across different regions for different projects

## Prevention

To avoid this in the future:

### 1. Use Terraform Outputs

Instead of hardcoding the region, you could make the workflow read it from Terraform:

```yaml
- name: Get AWS Region
  run: |
    cd terraform
    AWS_REGION=$(terraform output -raw aws_region)
    echo "AWS_REGION=$AWS_REGION" >> $GITHUB_ENV
```

### 2. Centralize Configuration

Keep region configuration in one place (Terraform variables) and reference it everywhere.

### 3. Add Region Validation

Add a check in your workflow to verify it's looking in the right region:

```yaml
- name: Verify Region
  run: |
    echo "Looking for resources in: $AWS_REGION"
    aws ec2 describe-regions --region-names $AWS_REGION
```

## Testing the Fix

After pushing, monitor your GitHub Actions:

1. Go to: `https://github.com/YOUR_USERNAME/terraform-crud/actions`
2. Watch the workflow run
3. Verify it finds your instances in ap-south-1
4. Check the deployment summary for the ALB DNS

## Expected Output

With the fix, you should see:

```
✅ Found instances: <IP1> <IP2>
✅ ALB DNS: crud-app-alb-XXXXXXXXX.ap-south-1.elb.amazonaws.com
✅ Deployment successful!
```

## Additional Notes

### Region-Specific Resources

Remember that these AWS resources are region-specific:
- VPCs
- Subnets
- Security Groups
- Load Balancers
- Auto Scaling Groups
- EC2 Instances
- DynamoDB tables (with region-specific endpoints)

### Cross-Region Considerations

If you ever need to deploy to multiple regions:
1. Create separate Terraform workspaces per region
2. Use region-specific GitHub Actions workflows
3. Consider using AWS Global Accelerator for multi-region routing

## Summary

✅ **Fixed:** GitHub Actions workflow now uses `ap-south-1`  
✅ **Matches:** Terraform infrastructure region  
✅ **Ready:** Push to GitHub to trigger successful deployment  

The region mismatch was the root cause of both the LoadBalancerNotFound and ASG instance errors.
