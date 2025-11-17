# CRUD Application - React + FastAPI + DynamoDB

A full-stack CRUD application with automated deployment to AWS.

**Repository:** https://github.com/YogeshAbnave/terraform-crud

## 🏗 Architecture

- **Frontend:** React (Vite) + NGINX
- **Backend:** FastAPI (Python) + Uvicorn
- **Database:** AWS DynamoDB
- **Infrastructure:** AWS EC2 (Ubuntu)
- **CI/CD:** GitHub Actions

## 📋 Prerequisites

- Python 3.11+
- Node.js 20+
- AWS Account with credentials configured
- Terraform installed
- Git & GitHub account

## ⚙️ Configuration

**Important:** This project is configured for AWS region **`ap-south-1`** (Mumbai, India).

If you want to use a different region:
1. Update `terraform/variables.tf` - change `aws_region` default value
2. Update `.github/workflows/deploy.yml` - change `AWS_REGION` environment variable
3. Ensure both match to avoid deployment errors

## 🚀 Quick Start

### Local Development

```powershell
# First time setup
.\run-local.ps1 -Setup

# Run backend (Terminal 1)
.\run-local.ps1 -Backend

# Run frontend (Terminal 2)
.\run-local.ps1 -Frontend
```

Access: `http://localhost:3000`

### AWS Deployment

⚠️ **IMPORTANT:** Deploy infrastructure BEFORE pushing code to GitHub!

```powershell
# Step 1: Deploy Terraform infrastructure (REQUIRED FIRST)
cd terraform
terraform init
terraform apply

# Step 2: Get GitHub secrets and add them to your repository
cd ..
.\scripts\get-secrets.ps1

# Add these secrets to GitHub:
# https://github.com/YOUR_USERNAME/terraform-crud/settings/secrets/actions
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY  
# - EC2_PRIVATE_KEY (copy the ENTIRE private key including BEGIN/END lines)

# Step 3: Push code to GitHub (triggers auto-deployment)
git add .
git commit -m "Deploy application"
git push origin main
```

📖 **Having issues with SSH authentication?** See [GITHUB-SECRETS-SETUP.md](GITHUB-SECRETS-SETUP.md)

Or use the automated script:
```powershell
.\deploy.ps1 -All
```

**Why this order matters:**
- The GitHub Actions workflow expects the ALB and ASG to exist
- Terraform creates these resources
- Without them, the deployment will fail with "LoadBalancerNotFound" error

## 📁 Project Structure

```
terraform-crud/
├── frontend/              # React application
│   ├── src/
│   │   ├── pages/        # List, Create, Edit pages
│   │   ├── services/     # API client
│   │   └── App.jsx
│   └── package.json
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── main.py       # FastAPI app
│   │   ├── crud.py       # DynamoDB operations
│   │   └── models.py     # Pydantic models
│   └── requirements.txt
├── terraform/             # Infrastructure as Code
│   ├── ec2.tf            # EC2 + SSH keys
│   ├── dynamodb.tf       # DynamoDB table
│   ├── variables.tf
│   └── outputs.tf
├── .github/workflows/
│   └── deploy.yml        # CI/CD pipeline
├── run-local.ps1         # Local development script
├── deploy.ps1            # Deployment script
└── README.md
```

## 🔧 Local Development Commands

```powershell
# Setup (first time only)
.\run-local.ps1 -Setup

# Run backend only
.\run-local.ps1 -Backend

# Run frontend only
.\run-local.ps1 -Frontend

# Show instructions for running both
.\run-local.ps1 -Both
```

## ☁️ Deployment Commands

```powershell
# Deploy infrastructure
.\deploy.ps1 -Deploy

# Show GitHub secrets
.\deploy.ps1 -Secrets

# Push code to GitHub
.\deploy.ps1 -Push

# Complete deployment
.\deploy.ps1 -All

# Destroy infrastructure
.\deploy.ps1 -Destroy
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | API root |
| GET | `/api/health` | Health check |
| POST | `/api/items` | Create item |
| GET | `/api/items` | List all items |
| GET | `/api/items/{id}` | Get item by ID |
| PUT | `/api/items/{id}` | Update item |
| DELETE | `/api/items/{id}` | Delete item |

## 🔍 Troubleshooting

### Backend Issues

Check if DynamoDB table exists:
```powershell
aws dynamodb describe-table --table-name app-data-table --region ap-south-1
```

Check AWS credentials:
```powershell
aws sts get-caller-identity
```

### Frontend Issues

Clear node_modules and reinstall:
```powershell
cd frontend
Remove-Item -Recurse node_modules
npm install
```

### Deployment Issues

Check GitHub Actions logs:
```
https://github.com/YogeshAbnave/terraform-crud/actions
```

SSH into EC2:
```powershell
ssh -i .ssh/crud-app-key ubuntu@<EC2_IP>
sudo systemctl status fastapi
sudo systemctl status nginx
```

## 🧹 Cleanup

```powershell
.\deploy.ps1 -Destroy
```

## 📚 Tech Stack

- **Frontend:** React 18, Vite, Axios, React Router
- **Backend:** FastAPI, Boto3, Pydantic, Uvicorn
- **Database:** AWS DynamoDB
- **Infrastructure:** Terraform, AWS EC2, NGINX
- **CI/CD:** GitHub Actions

## 🎯 Features

- ✅ Full CRUD operations
- ✅ Responsive UI
- ✅ Real-time updates
- ✅ Auto-deployment via GitHub Actions
- ✅ Infrastructure as Code
- ✅ Automated SSH key generation
- ✅ Health checks

## 📄 License

MIT License

---

**Need help?** Check `QUICKSTART.md` for detailed instructions.
