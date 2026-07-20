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
                    sh '''
                        echo ${PASS} | docker login -u ${USER} --password-stdin
                        
                        # ለሶስት ጊዜ ለመላክ ይሞክራል፣ ካልተሳካ ለ30 ሰከንድ ታግሶ እንደገና ይሞክራል
                        for i in {1..3}; do
                            docker push ${BACKEND_IMAGE} && docker push ${FRONTEND_IMAGE} && break || sleep 30
                        done
                    '''
                }
            }
        }

       stage('Deploy to Kubernetes') {
    steps {
        sh 'kubectl apply -f k8s/mongo-deployment.yaml --insecure-skip-tls-verify'
        sh 'kubectl apply -f k8s/backend-deploy.yaml --insecure-skip-tls-verify'
        sh 'kubectl apply -f k8s/frontend-deploy.yaml --insecure-skip-tls-verify'
        sh 'kubectl rollout restart deployment/backend-deploy --insecure-skip-tls-verify'
        sh 'kubectl rollout restart deployment/frontend-deploy --insecure-skip-tls-verify'
    }
}
        }
    }
}
