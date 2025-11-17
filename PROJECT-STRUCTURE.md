# 📁 Project Structure

## Clean & Organized Structure

```
terraform-crud/
│
├── 🎯 Master Scripts (USE THESE!)
│   ├── run-local.ps1          # Local development
│   └── deploy.ps1             # AWS deployment
│
├── 📱 Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ItemList.jsx   # List all items
│   │   │   ├── CreateItem.jsx # Create new item
│   │   │   └── EditItem.jsx   # Edit existing item
│   │   ├── services/
│   │   │   └── api.js         # Axios API client
│   │   ├── App.jsx            # Main app component
│   │   ├── App.css            # Styles
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── 🐍 Backend (FastAPI + Python)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI application
│   │   ├── crud.py            # DynamoDB operations
│   │   └── models.py          # Pydantic models
│   ├── requirements.txt
│   ├── run.sh                 # Unix run script
│   └── venv/                  # Virtual environment (gitignored)
│
├── ☁️ Terraform (Infrastructure)
│   ├── ec2.tf                 # EC2 instance + SSH keys
│   ├── dynamodb.tf            # DynamoDB table
│   ├── variables.tf           # Input variables
│   ├── outputs.tf             # Output values
│   ├── terraform.tfvars.example
│   ├── scripts/
│   │   └── user_data.sh       # EC2 initialization script
│   └── .ssh/                  # Generated SSH keys (gitignored)
│
├── 🔄 CI/CD
│   └── .github/
│       └── workflows/
│           └── deploy.yml     # GitHub Actions workflow
│
├── 📜 Scripts (Helper scripts)
│   ├── get-secrets.sh         # Extract secrets (Linux/Mac)
│   └── get-secrets.ps1        # Extract secrets (Windows)
│
├── 📚 Documentation
│   ├── README.md              # Main documentation
│   ├── QUICKSTART.md          # Quick start guide
│   ├── PROJECT-STRUCTURE.md   # This file
│   └── ARCHITECTURE.md        # Architecture diagrams
│
└── ⚙️ Configuration
    ├── .gitignore             # Git ignore rules
    ├── main.tf                # Terraform provider config
    ├── variables.tf           # Root variables
    ├── outputs.tf             # Root outputs
    └── backend.tf             # Terraform backend config
```

## 🎯 Key Files Explained

### Master Scripts

| File | Purpose | When to Use |
|------|---------|-------------|
| `run-local.ps1` | Local development | Every day development |
| `deploy.ps1` | AWS deployment | Initial deployment & updates |

### Frontend Files

| File | Purpose |
|------|---------|
| `src/pages/ItemList.jsx` | Displays all items in a grid |
| `src/pages/CreateItem.jsx` | Form to create new items |
| `src/pages/EditItem.jsx` | Form to edit existing items |
| `src/services/api.js` | Axios client for API calls |
| `src/App.jsx` | Main app with routing |
| `vite.config.js` | Vite configuration + proxy |

### Backend Files

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI app + routes |
| `app/crud.py` | DynamoDB CRUD operations |
| `app/models.py` | Pydantic data models |
| `requirements.txt` | Python dependencies |

### Terraform Files

| File | Purpose |
|------|---------|
| `ec2.tf` | EC2 instance, security groups, IAM roles, SSH keys |
| `dynamodb.tf` | DynamoDB table configuration |
| `variables.tf` | Input variables (region, instance type, etc.) |
| `outputs.tf` | Output values (IP, URLs, SSH command) |
| `scripts/user_data.sh` | EC2 initialization (installs NGINX, Python, Node) |

### CI/CD Files

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | GitHub Actions pipeline for auto-deployment |

## 🚫 Gitignored Files/Folders

These are automatically excluded from Git:

```
# Terraform
.terraform/
*.tfstate
*.tfstate.*
*.tfvars
.terraform.lock.hcl

# Python
venv/
__pycache__/
*.pyc

# Node
node_modules/
dist/

# SSH Keys
.ssh/
*.pem
*.key

# Environment
.env
.env.local
```

## 📊 File Count Summary

- **Frontend:** 12 files
- **Backend:** 5 files
- **Terraform:** 7 files
- **CI/CD:** 1 file
- **Scripts:** 4 files
- **Documentation:** 4 files

**Total:** ~33 essential files (excluding dependencies)

## 🎨 Color Legend

- 🎯 = Master scripts (start here!)
- 📱 = Frontend code
- 🐍 = Backend code
- ☁️ = Infrastructure code
- 🔄 = CI/CD automation
- 📜 = Helper scripts
- 📚 = Documentation
- ⚙️ = Configuration

## 🔄 Workflow

```
Development:
run-local.ps1 → Edit code → Test locally → Commit

Deployment:
deploy.ps1 → Add secrets → Push → Auto-deploy
```

---

**Everything is organized and ready to use!** 🚀
