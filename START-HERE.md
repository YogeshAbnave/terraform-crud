# 🚀 START HERE

## Welcome to the CRUD Application!

This is a complete full-stack application with automated deployment.

---

## ⚡ Quick Commands

### For Local Development:
```powershell
.\run-local.ps1 -Setup      # First time only
.\run-local.ps1 -Backend    # Terminal 1
.\run-local.ps1 -Frontend   # Terminal 2
```

### For AWS Deployment:
```powershell
.\deploy.ps1 -Deploy        # Step 1: Create infrastructure
.\deploy.ps1 -Secrets       # Step 2: Get GitHub secrets
.\deploy.ps1 -Push          # Step 3: Deploy application
```

---

## 📚 Documentation

| File | What's Inside |
|------|---------------|
| `README.md` | Complete documentation |
| `QUICKSTART.md` | Fast setup guide |
| `PROJECT-STRUCTURE.md` | File organization |
| `ARCHITECTURE.md` | System architecture |

---

## 🎯 Two Master Scripts

### 1. `run-local.ps1` - Local Development

```powershell
# Setup everything (first time)
.\run-local.ps1 -Setup

# Run backend server
.\run-local.ps1 -Backend

# Run frontend server
.\run-local.ps1 -Frontend
```

**What it does:**
- ✅ Checks prerequisites (Python, Node, AWS)
- ✅ Creates Python virtual environment
- ✅ Installs all dependencies
- ✅ Runs backend on port 8000
- ✅ Runs frontend on port 3000

### 2. `deploy.ps1` - AWS Deployment

```powershell
# Deploy infrastructure
.\deploy.ps1 -Deploy

# Show GitHub secrets
.\deploy.ps1 -Secrets

# Push code to GitHub
.\deploy.ps1 -Push

# Or do everything at once
.\deploy.ps1 -All
```

**What it does:**
- ✅ Creates EC2 instance
- ✅ Creates DynamoDB table
- ✅ Generates SSH keys automatically
- ✅ Extracts GitHub secrets
- ✅ Pushes code for auto-deployment

---

## 🏃 Getting Started

### Option 1: Local Development First

1. **Setup:**
   ```powershell
   .\run-local.ps1 -Setup
   ```

2. **Run Backend** (Terminal 1):
   ```powershell
   .\run-local.ps1 -Backend
   ```

3. **Run Frontend** (Terminal 2):
   ```powershell
   .\run-local.ps1 -Frontend
   ```

4. **Open Browser:**
   ```
   http://localhost:3000
   ```

### Option 2: Deploy to AWS Directly

1. **Deploy Infrastructure:**
   ```powershell
   .\deploy.ps1 -Deploy
   ```
   ⏱️ Takes ~5 minutes

2. **Get Secrets:**
   ```powershell
   .\deploy.ps1 -Secrets
   ```
   Copy the 2 values to GitHub Secrets

3. **Push Code:**
   ```powershell
   .\deploy.ps1 -Push
   ```
   GitHub Actions deploys automatically

4. **Access Application:**
   ```
   http://<YOUR_EC2_IP>
   ```

---

## 🆘 Need Help?

### Prerequisites Missing?

**Python:**
```powershell
python --version  # Should be 3.11+
```
Download: https://www.python.org/downloads/

**Node.js:**
```powershell
node --version  # Should be 20+
```
Download: https://nodejs.org/

**AWS CLI:**
```powershell
aws --version
aws configure  # Set up credentials
```
Download: https://aws.amazon.com/cli/

**Terraform:**
```powershell
terraform --version
```
Download: https://www.terraform.io/downloads

### Common Issues

**"Virtual environment not found"**
```powershell
.\run-local.ps1 -Setup
```

**"DynamoDB table not found"**
```powershell
cd terraform
terraform apply
```

**"AWS credentials not configured"**
```powershell
aws configure
```

**"GitHub Actions failing"**
- Check if both secrets are added
- Verify EC2 instance is running
- View logs at: `https://github.com/YogeshAbnave/terraform-crud/actions`

---

## 📁 Project Structure

```
terraform-crud/
├── run-local.ps1          ← Local development
├── deploy.ps1             ← AWS deployment
├── frontend/              ← React app
├── backend/               ← FastAPI app
├── terraform/             ← Infrastructure
└── .github/workflows/     ← CI/CD
```

---

## ✅ Checklist

Before starting:
- [ ] Python 3.11+ installed
- [ ] Node.js 20+ installed
- [ ] AWS CLI installed and configured
- [ ] Terraform installed
- [ ] Git installed
- [ ] GitHub account created

For local development:
- [ ] Run `.\run-local.ps1 -Setup`
- [ ] Run backend in Terminal 1
- [ ] Run frontend in Terminal 2
- [ ] Access `http://localhost:3000`

For AWS deployment:
- [ ] Run `.\deploy.ps1 -Deploy`
- [ ] Run `.\deploy.ps1 -Secrets`
- [ ] Add secrets to GitHub
- [ ] Run `.\deploy.ps1 -Push`
- [ ] Access `http://<EC2_IP>`

---

## 🎉 You're Ready!

Choose your path:
- **Local Development:** `.\run-local.ps1 -Setup`
- **AWS Deployment:** `.\deploy.ps1 -Deploy`

**Questions?** Check `README.md` or `QUICKSTART.md`

---

**Let's build something awesome!** 🚀
