# Docker Files

This folder contains Dockerfiles for both services.

## Build commands (from `docker/`)

Build both images from the `docker/` folder using the app folders as the build contexts:

```bash
docker build -f frontend.Dockerfile -t mekin2024/todo-frontend:latest ../frontend
docker build -f backend.Dockerfile -t mekin2024/todo-backend:latest ../backend
```

## Run locally (optional)

- Frontend: `docker run -p 3000:3000 mekin2024/todo-frontend:latest`
- Backend: `docker run -p 5000:5000 --env-file backend/.env mekin2024/todo-backend:latest`
