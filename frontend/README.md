# 🚀 AWS-K8s-Jenkins-CI-CD

## 📌 Overview

This is a full-stack DevOps learning project focused on building a complete CI/CD workflow with modern cloud-native tools.

The project uses:

- ⚡ Next.js (frontend)
- 🛠️ Express.js (backend API)
- 🍃 MongoDB (database)
- 🐳 Docker Compose (local database orchestration)
- ☸️ Kubernetes (deployment manifests)
- 🔧 Jenkins (planned CI/CD automation)
- ☁️ AWS (planned cloud deployment)

> 🎯 Goal: learn practical DevOps by building and deploying a real full-stack app end to end.

---

## 🎯 Project Goals

- Understand full-stack app architecture
- Integrate frontend and backend APIs
- Use Docker-based local infrastructure
- Build CI/CD with Jenkins
- Deploy workloads with Kubernetes
- Prepare for AWS deployment workflows

---

## 🏗️ Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js |
| Backend | Express.js |
| Database | MongoDB + Mongoose |
| Containers | Docker / Docker Compose |
| Orchestration | Kubernetes |
| CI/CD | Jenkins |
| Cloud | AWS (EKS / EC2 - planned) |
| Version Control | Git & GitHub |

---

## 📁 Project Structure

```bash
.
├── app/                    # Next.js App Router frontend
├── backend/                # Express API + MongoDB integration
│   ├── app.js
│   ├── package.json
│   └── .env.example
├── public/
├── volumes/                # Kubernetes volume manifests
├── docker-compose.yml      # MongoDB + mongo-express services
├── package.json            # Frontend scripts/deps
└── README.md
```

---

## 🧩 Application Architecture

```text
Next.js Frontend (localhost:3000)
          |
          | HTTP /api/todos
          v
Express API (localhost:5000)
          |
          | Mongoose
          v
MongoDB (Docker Compose, localhost:27017)
```

---

## 🐳 Local Database with Docker Compose

The project uses Docker Compose to run MongoDB locally.

Services:

- `mongodb` on port `27017`
- `mongo-express` on port `8081`

Default local credentials used by backend:

- username: set via `MONGO_ROOT_USERNAME`
- password: set via `MONGO_ROOT_PASSWORD`
- db: set via `MONGO_DATABASE`

Backend connection URI example:

`mongodb://<username>:<password>@localhost:27017/<database>?authSource=admin`

> ⚠️ Do not commit real credentials. Keep secrets only in local `.env` files or a secret manager.

---

## ▶️ Run the Project Locally

### 1) Start MongoDB containers

From project root:

- `docker compose up -d`

### 2) Run backend API

From `backend` folder:

- `npm install`
- `npm run dev`

### 3) Run frontend

From project root:

- `pnpm install`
- `pnpm dev`

Frontend: http://localhost:3000  
API: http://localhost:5000/api/todos  
Mongo Express: http://localhost:8081

---

## 🔄 CI/CD Pipeline Flow (Planned)

```text
GitHub Push
     ↓
Jenkins Trigger
     ↓
Build & Test
     ↓
Build Docker Images
     ↓
Push Images (DockerHub / ECR)
     ↓
Deploy to Kubernetes (AWS EKS)
```

---

## ☸️ Kubernetes Notes

Current manifests in this repo are focused on storage examples under `volumes/`.

Planned next step:

- Add full deployment/service manifests for Next.js + Express app

---

## ☁️ AWS Deployment (Planned)

Planned cloud stack:

- AWS EKS or EC2
- DockerHub or AWS ECR
- Load balancer / ingress for public access

---

## 🚀 Current Status

- [x] Frontend + backend integration
- [x] CRUD todo API
- [x] MongoDB database with Docker Compose
- [ ] Dockerfiles for frontend/backend
- [ ] Jenkins pipeline
- [ ] Full Kubernetes app deployment manifests
- [ ] AWS deployment

---

## 📸 Future Improvements

- Add JWT authentication
- Add input rate limiting and better API validation
- Add Helm charts
- Add monitoring (Prometheus + Grafana)
- Add Terraform for IaC

---

## 👨‍💻 Author

**Mekin Jemal**  
Full-stack & DevOps Engineer (Learning Path 🚀)

---

## ⭐ Purpose

This repository is built for hands-on DevOps learning: from coding to containerization, automation, orchestration, and cloud deployment.
