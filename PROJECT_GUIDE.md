# Project Guide: Fullstack Todo App Deployment

This document explains how the project works end to end, how the main parts connect, and what has been completed so far. It is meant to be the single guide for understanding the application, the deployment flow, and the current progress.

## 1. Project Overview

This project is a full-stack Todo application built with:

- Frontend: Next.js
- Backend: Express.js + TypeScript
- Database: MongoDB
- CI/CD: Jenkins
- Containerization: Docker
- Orchestration: Kubernetes

The goal is to keep the application fully containerized and deployable through Kubernetes, with Jenkins handling the automated build and deployment flow.

## 2. How the Project Works

The project is designed as a connected pipeline from code to production-style deployment.

### Flow

1. Source code lives in the frontend, backend, Docker, Jenkins, and Kubernetes folders.
2. Jenkins runs the pipeline defined in `Jenkinsfile`.
3. The pipeline installs dependencies, validates the code, builds Docker images, and pushes them to Docker Hub.
4. Jenkins applies the Kubernetes manifests from `k8s/`.
5. The frontend serves the UI and forwards API calls through `/api/...`.
6. The backend receives the API requests, performs CRUD operations, and stores data in MongoDB.

## 3. Application Interconnection

The important part of this project is how the pieces talk to each other.

### Frontend to Backend

The Next.js app contains an API proxy route at `frontend/app/api/[...path]/route.ts`. That route forwards requests from the browser to the backend service.

This means the browser can call the frontend origin, and the frontend passes the request to the backend internally.

In practice:

- Browser calls `/api/todos`
- Next.js proxy forwards the request to the backend service
- Backend processes the request and returns the response

This keeps the frontend and backend connected without exposing the backend directly to the user.

### Backend to MongoDB

The backend application in `backend/src/app.ts` connects to MongoDB using the `MONGODB_URI` environment variable.

The backend exposes CRUD routes for todos:

- `GET /api/todos`
- `POST /api/todos`
- `PUT /api/todos/:id`
- `DELETE /api/todos/:id`

It also includes a health endpoint:

- `GET /api/health`

The backend reads and writes todo records from MongoDB through Mongoose.

### Kubernetes Services

The Kubernetes services define how traffic moves inside the cluster.

- `frontend-service` exposes the frontend on NodePort `30080`
- `backend-service` exposes the backend inside the cluster on port `5000`
- MongoDB is exposed through a service for internal communication

## 4. Jenkins Setup

Jenkins is run from Docker using the custom image in `docker/jenkins.Dockerfile`.

That image installs the tools needed for the pipeline:

- Git
- Node.js
- npm
- Docker
- kubectl
- Required Jenkins plugins

The Jenkins sandbox is started with Docker Compose in `jenkins_sandbox_home/docker-compose.yaml`.

The reason for this setup is to give Jenkins everything it needs to:

- checkout the repository
- build the frontend and backend
- build Docker images
- push images to Docker Hub
- deploy manifests to Kubernetes

## 5. Pipeline Stages

The pipeline in `Jenkinsfile` is organized into clear stages.

### Checkout

Jenkins pulls the repository and resolves a short Git commit-based image tag.

### Agent Debug Info

This stage prints the agent name, labels, and available tools so the environment can be verified.

### Preflight

This stage checks that the required tools are installed on the Jenkins agent.

### Install

Jenkins installs frontend and backend dependencies with npm.

### Validate

Validation runs in parallel:

- Frontend lint
- Backend build
- Frontend build

### Build Images

Jenkins builds Docker images for:

- Backend
- Frontend

### Push Images

The built images are pushed to Docker Hub using Jenkins credentials.

### Deploy to Kubernetes

Jenkins uses kubeconfig credentials to:

- confirm cluster access
- ensure the namespace exists
- apply the Kubernetes manifests
- update deployment images
- wait for rollout completion

## 6. Docker Images

The project uses separate Dockerfiles for each part of the system.

### Backend image

`docker/backend.Dockerfile` builds the Node.js backend into a runtime container.

### Frontend image

`docker/frontend.Dockerfile` builds the Next.js app into a production container.

### Jenkins image

`docker/jenkins.Dockerfile` creates the Jenkins environment with the tools required for CI/CD.

## 7. Kubernetes Layout

The Kubernetes manifests are organized by resource type for easier maintenance.

### Namespace

All application resources run in the `todo-app` namespace.

### Deployments

The deployment files define the runtime pods for:

- frontend
- backend
- mongodb

### Services

The service files define how the workloads are reached inside and outside the cluster.

### ConfigMaps and Secrets

- ConfigMaps store non-sensitive app configuration
- Secrets store sensitive MongoDB credentials

### Volumes

Persistent storage is set up for MongoDB through a PersistentVolume and PersistentVolumeClaim.

### Ingress

Ingress is prepared for routing traffic into the cluster when external access is needed.

### Kustomization

`k8s/kustomization.yaml` acts as the single entry point for applying the full stack.

## 8. Current Progress Completed So Far

Today’s progress is focused on the deployment workflow and project automation.

### Completed work

- Set up Jenkins using a Docker Compose file
- Wrote the Jenkins pipeline
- Ran the pipeline through the main stages
- Verified the build and deployment flow
- Successfully deployed the application

## 9. How to Run the Project

### Build and push images

From the project root:

```bash
docker build -f docker/backend.Dockerfile -t mekin2024/todo-backend:latest .
docker build -f docker/frontend.Dockerfile -t mekin2024/todo-frontend:latest .
docker push mekin2024/todo-backend:latest
docker push mekin2024/todo-frontend:latest
```

### Apply Kubernetes manifests

```bash
kubectl apply -k k8s/
```

### Check the application

```bash
kubectl get all -n todo-app
kubectl get pods -n todo-app
```

### Open the app

For Minikube, use:

```bash
minikube service frontend-service -n todo-app --url
```

Or open the NodePort directly:

```bash
echo "http://$(minikube ip):30080"
```

## 10. What This Guide Means

This project is now structured so that each part supports the next one:

- React/Next.js provides the UI
- The API proxy forwards requests to the backend
- Express handles the business logic and CRUD operations
- MongoDB stores the data
- Docker packages each service
- Jenkins automates build and deployment
- Kubernetes runs the whole system together

That is the main interconnection of the project, and this file should be used as the central guide for understanding it.