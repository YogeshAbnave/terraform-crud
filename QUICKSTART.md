# 🚀 Quick Start Guide

## Local Development (2 commands)

```powershell
# Setup
.\run-local.ps1 -Setup

# Run (in 2 terminals)
.\run-local.ps1 -Backend    # Terminal 1
.\run-local.ps1 -Frontend   # Terminal 2
```

Access: `http://localhost:3000`

---

## AWS Deployment (3 commands)

```powershell
# 1. Deploy infrastructure
.\deploy.ps1 -Deploy

# 2. Get secrets and add to GitHub
.\deploy.ps1 -Secrets

# 3. Push code
.\deploy.ps1 -Push
```

Or run all at once:
```powershell
.\deploy.ps1 -All
```

---

## What Each Script Does

### `run-local.ps1` - Local Development

| Command | What it does |
|---------|--------------|
| `-Setup` | Installs all dependencies (first time only) |
| `-Backend` | Runs FastAPI server on port 8000 |
| `-Frontend` | Runs React dev server on port 3000 |
| `-Both` | Shows instructions for running both |

### `deploy.ps1` - AWS Deployment

| Command | What it does |
|---------|--------------|
| `-Deploy` | Creates EC2, DynamoDB, generates SSH keys |
| `-Secrets` | Shows GitHub secrets to copy |
| `-Push` | Pushes code and triggers auto-deployment |
| `-All` | Runs all steps with prompts |
| `-Destroy` | Deletes all AWS resources |

---

## Troubleshooting

### Local Development

**Backend won't start:**
```powershell
# Check AWS credentials
aws sts get-caller-identity

# Check DynamoDB table
aws dynamodb describe-table --table-name app-data-table --region ap-south-1

# If table missing, create it
cd terraform
terraform apply
```

**Frontend can't connect:**
- Make sure backend is running on port 8000
- Check browser console for errors

### AWS Deployment

**Terraform fails:**
```powershell
# Check AWS credentials
aws configure

# Re-run
.\deploy.ps1 -Deploy
```

**GitHub Actions fails:**
- Verify both secrets are added to GitHub
- Check EC2 instance is running
- View logs: `https://github.com/YogeshAbnave/terraform-crud/actions`

**Application not loading:**
```powershell
# SSH into EC2
ssh -i .ssh/crud-app-key ubuntu@<EC2_IP>

# Check services
sudo systemctl status fastapi
sudo systemctl status nginx

# View logs
sudo journalctl -u fastapi -f
```

---

## Cleanup

```powershell
.\deploy.ps1 -Destroy
```

---

**Total Time:**
- Local setup: ~2 minutes
- AWS deployment: ~5 minutes

🎉 That's it!
