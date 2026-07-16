pipeline {
    agent any

    environment {
        DOCKER_USER = 'adisho1313'
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        BACKEND_IMAGE = "${DOCKER_USER}/fullstack-backend:latest"
        FRONTEND_IMAGE = "${DOCKER_USER}/fullstack-frontend:latest"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                sh "docker build -t ${BACKEND_IMAGE} ./backend"
                sh "docker build -t ${FRONTEND_IMAGE} ./frontend"
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo ${PASS} | docker login -u ${USER} --password-stdin"
                    sh "docker push ${BACKEND_IMAGE}"
                    sh "docker push ${FRONTEND_IMAGE}"
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/mongo-deployment.yaml'
                sh 'kubectl apply -f k8s/backend-deploy.yaml'
                sh 'kubectl apply -f k8s/frontend-deploy.yaml'
                sh "kubectl rollout restart deployment/backend-deploy"
                sh "kubectl rollout restart deployment/frontend-deploy"
            }
        }
    }
}
