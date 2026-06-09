# Fullstack Todo App (Next.js + Express + MongoDB Atlas on Kubernetes)

This guide shows how to run the app step by step by applying the Kubernetes deployment manifests in this repository.

## 1) Prerequisites

Install and have running:

- Docker
- kubectl
- A Kubernetes cluster. Minikube works for local testing, while EKS is the target for the AWS storage setup.

If using Minikube:

```bash
minikube start
```

---

## 2) Build and publish images (recommended)

The deployment manifests use these images:

- `mekin2024/todo-backend:latest` in `k8s/deployments/backend-deployment.yaml`
- `mekin2024/todo-frontend:latest` in `k8s/deployments/frontend-deployment.yaml`

From project root:

```bash
docker build -f docker/backend.Dockerfile -t mekin2024/todo-backend:latest .
docker build -f docker/frontend.Dockerfile -t mekin2024/todo-frontend:latest .

docker push mekin2024/todo-backend:latest
docker push mekin2024/todo-frontend:latest
```

---

## 3) Configure the backend secret

A template exists at:

- `k8s/secrets/mongodb-secret.example.yaml`

The template already contains the MongoDB Atlas URI used by the backend. Update the value if you want to point at a different cluster.

---

## 4) Apply all Kubernetes resources

From project root:

```bash
kubectl apply -k k8s/
```

---

## 5) Verify deployment status

```bash
kubectl get all -n todo-app
kubectl get pods -n todo-app
```

Wait until pods are `Running`.

---

## 6) Access the app

The frontend Service is exposed as `NodePort` `30080` in `k8s/services/frontend-service.yaml`.

For Minikube:

```bash
minikube service frontend-service -n todo-app --url
```

Or manually:

```bash
echo "http://$(minikube ip):30080"
```

The frontend calls the backend through its own same-origin API proxy at `/api/...`, so the browser does not need to reach the cluster-internal backend service directly.

If you change the frontend host or add an ingress later, the UI should still work as long as the frontend and `/api` stay on the same public address.

---

## 8) Troubleshooting logs

```bash
kubectl logs deploy/backend -n todo-app
kubectl logs deploy/mongodb -n todo-app
kubectl logs deploy/frontend -n todo-app
```

---

## 9) Optional cleanup

```bash
kubectl delete -k k8s/
```

---

## 10) Command reference (logs, debug, expose, operations)

Use these commands as a quick reference while operating the app.

### A) Cluster and namespace checks

```bash
kubectl config current-context
kubectl cluster-info
kubectl get ns
kubectl get all -n todo-app
kubectl get pods -n todo-app -o wide
```

### B) Logs and live log streaming

```bash
# Deployment logs
kubectl logs deploy/backend -n todo-app
kubectl logs deploy/frontend -n todo-app
kubectl logs deploy/mongodb -n todo-app

# Stream logs live
kubectl logs -f deploy/backend -n todo-app

# Last 200 lines with timestamps
kubectl logs --tail=200 --timestamps deploy/backend -n todo-app

# Previous container logs (after restart/crash)
kubectl logs --previous deploy/backend -n todo-app
```

### C) Describe and events (first stop for debugging)

```bash
kubectl describe pod <pod-name> -n todo-app
kubectl describe deploy backend -n todo-app
kubectl describe svc frontend-service -n todo-app

# Recent events in namespace
kubectl get events -n todo-app --sort-by=.metadata.creationTimestamp
```

### D) Exec into running containers

```bash
# Open shell in backend container
kubectl exec -it deploy/backend -n todo-app -- sh

# Open shell in mongodb container
kubectl exec -it deploy/mongodb -n todo-app -- sh
```

### E) Expose / access services

```bash
# Minikube direct service URL (frontend NodePort)
minikube service frontend-service -n todo-app --url

# Local port-forward to backend API
kubectl port-forward svc/backend-service 5000:5000 -n todo-app

# Local port-forward to frontend service
kubectl port-forward svc/frontend-service 3000:3000 -n todo-app

# Local port-forward to MongoDB
kubectl port-forward svc/mongodb-service 27017:27017 -n todo-app
```

### F) Rollout, restart, and scaling

```bash
# Rollout status
kubectl rollout status deploy/backend -n todo-app
kubectl rollout status deploy/frontend -n todo-app

# Restart deployments
kubectl rollout restart deploy/backend -n todo-app
kubectl rollout restart deploy/frontend -n todo-app

# Roll back deployment
kubectl rollout undo deploy/backend -n todo-app

# Scale deployment
kubectl scale deploy/backend --replicas=2 -n todo-app
kubectl scale deploy/frontend --replicas=2 -n todo-app
```

### G) Resource and health checks

```bash
# Resource usage (requires metrics-server)
kubectl top pods -n todo-app
kubectl top nodes

# Watch pod changes in real time
kubectl get pods -n todo-app -w

# Check pod restart counts quickly
kubectl get pods -n todo-app
```

### H) Manifest validation and diff

```bash
# Validate manifests without applying
kubectl apply --dry-run=client -k k8s/

# Show what would change
kubectl diff -k k8s/
```

### I) Secrets and config checks (safe inspection)

```bash
kubectl get secret mongodb-secret -n todo-app
kubectl describe configmap backend-config -n todo-app

# Print secret keys only (not decoded values)
kubectl get secret mongodb-secret -n todo-app -o jsonpath='{.data}'
```

### J) Ingress checks (if enabled)

```bash
kubectl get ingress -n todo-app
kubectl describe ingress todo-app-ingress -n todo-app

# If using Minikube ingress addon
minikube addons enable ingress
```

### K) 3 ways to use ClusterIP services

If `backend-service` is `ClusterIP`, you can still access it from frontend-related flow in these 3 ways:

1) Use Minikube service URL

```bash
kubectl get svc backend-service -n todo-app
minikube service backend-service -n todo-app --url
```

Use the returned URL as your frontend API base URL.

2) Use Kubernetes injected env vars inside the frontend Pod

Kubernetes provides env vars such as:

- `BACKEND_SERVICE_SERVICE_HOST`
- `BACKEND_SERVICE_SERVICE_PORT`

Example internal URL built in container runtime: `http://$BACKEND_SERVICE_SERVICE_HOST:$BACKEND_SERVICE_SERVICE_PORT`

3) Use service DNS name directly

From workloads inside the same namespace:

- `http://backend-service:5000`

Or full DNS:

- `http://backend-service.todo-app.svc.cluster.local:5000`

For browser-side code, prefer an API route/proxy or a public URL; direct ClusterIP/DNS is only reachable from inside the cluster network.


