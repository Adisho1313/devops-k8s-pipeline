pipeline {
  agent any

  parameters {
    string(name: 'DOCKERHUB_CREDENTIALS_ID', defaultValue: 'dockerhub-creds', description: 'Jenkins credentials ID for Docker Hub username/password')
    string(name: 'AWS_CREDENTIALS_ID', defaultValue: 'aws-creds', description: 'Jenkins credentials ID for AWS access key ID and secret access key')
    string(name: 'AWS_REGION', defaultValue: 'eu-north-1', description: 'AWS region that hosts the EKS cluster')
    string(name: 'EKS_CLUSTER_NAME', defaultValue: 'todo-app-eks', description: 'AWS EKS cluster name to target for deployment')
  }

  options {
    skipDefaultCheckout(true)
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    REGISTRY = 'docker.io'
    DOCKERHUB_NAMESPACE = 'mekin2024'
    BACKEND_IMAGE = "${REGISTRY}/${DOCKERHUB_NAMESPACE}/todo-backend"
    FRONTEND_IMAGE = "${REGISTRY}/${DOCKERHUB_NAMESPACE}/todo-frontend"
    IMAGE_TAG = 'local'
    K8S_NAMESPACE = 'todo-app'
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.IMAGE_TAG = sh(returnStdout: true, script: 'git rev-parse --short=7 HEAD').trim()
          echo "Image tag resolved to ${env.IMAGE_TAG}"
        }
      }
    }

    stage('Agent Debug Info') {
      steps {
        script {
          echo "NODE_NAME=${env.NODE_NAME}"
          echo "NODE_LABELS=${env.NODE_LABELS}"
          echo "BRANCH_NAME=${env.BRANCH_NAME}"
          echo "GIT_BRANCH=${env.GIT_BRANCH}"
        }
      }
    }

    stage('Preflight') {
      steps {
        script {
          def missing = []
          ['git', 'node', 'npm', 'docker', 'kubectl', 'aws'].each { tool ->
            if (sh(script: "command -v ${tool} >/dev/null 2>&1", returnStatus: true) != 0) {
              missing << tool
            }
          }

          if (!missing.isEmpty()) {
            error("Missing tools: ${missing.join(', ')}")
          }
        }
      }
    }

    stage('Install') {
      steps {
        sh '''
          set -euo pipefail

          npm ci --prefix frontend || npm install --prefix frontend
          npm ci --prefix backend || npm install --prefix backend
        '''
      }
    }

    stage('Validate') {
      parallel {
        stage('Frontend lint') {
          steps {
            sh 'npm run lint --prefix frontend'
          }
        }
        stage('Backend build') {
          steps {
            sh 'npm run build --prefix backend'
          }
        }
        stage('Frontend build') {
          steps {
            sh 'npm run build --prefix frontend'
          }
        }
      }
    }

    stage('Build Images') {
      steps {
        sh '''
          set -euo pipefail
          docker build -f docker/backend.Dockerfile -t ${BACKEND_IMAGE}:${IMAGE_TAG} .
          docker build -f docker/frontend.Dockerfile -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .
        '''
      }
    }

    stage('Push Images') {
      steps {
        withCredentials([
          usernamePassword(credentialsId: params.DOCKERHUB_CREDENTIALS_ID,
          usernameVariable: 'DOCKERHUB_USER',
          passwordVariable: 'DOCKERHUB_TOKEN')
        ]) {
          sh '''
            set -euo pipefail
            echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USER" --password-stdin

            docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
            docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}

            docker logout
          '''
        }
      }
    }
    stage('Deploy to EKS') {
  steps {
    withCredentials([
      usernamePassword(
        credentialsId: params.AWS_CREDENTIALS_ID,
        usernameVariable: 'AWS_ACCESS_KEY_ID',
        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
      )
    ]) {

      script {
        sh '''
          set -euo pipefail

          export AWS_DEFAULT_REGION="$AWS_REGION"
          export AWS_REGION="$AWS_REGION"
          export KUBECONFIG=\$WORKSPACE/.kubeconfig

          echo "Step 1: AWS identity"
          aws sts get-caller-identity

          echo "Step 2: kubeconfig"
          aws eks update-kubeconfig \
            --region "$AWS_REGION" \
            --name "$EKS_CLUSTER_NAME" \
            --kubeconfig \$KUBECONFIG

          echo "Step 3: cluster check"
          kubectl get nodes

          echo "Step 4: namespace"
          kubectl create namespace "$K8S_NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

          echo "Step 5: deploy"
          kubectl apply -k k8s/ --validate=false

          echo "Step 6: update images"
          kubectl set image deployment/backend backend="$BACKEND_IMAGE:$IMAGE_TAG" -n "$K8S_NAMESPACE"
          kubectl set image deployment/frontend frontend="$FRONTEND_IMAGE:$IMAGE_TAG" -n "$K8S_NAMESPACE"

          echo "Step 7: rollout"
          kubectl rollout status deployment/backend -n "$K8S_NAMESPACE"
          kubectl rollout status deployment/frontend -n "$K8S_NAMESPACE"

          echo "Deployment complete"
          INGRESS_HOST=$(kubectl get ingress todo-app-ingress -n "$K8S_NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)
          INGRESS_IP=$(kubectl get ingress todo-app-ingress -n "$K8S_NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || true)
          INGRESS_ENDPOINT=${INGRESS_HOST:-$INGRESS_IP}

          if [ -n "$INGRESS_ENDPOINT" ]; then
            echo "Open the application at: http://${INGRESS_ENDPOINT}/"
            echo "API base URL: http://${INGRESS_ENDPOINT}/api"
          else
            echo "Ingress endpoint is not ready yet. Check it with: kubectl get ingress todo-app-ingress -n $K8S_NAMESPACE"
          fi
        '''
      }
    }
  }
}
  }

  post {
    always {
      deleteDir()
    }
  }
}