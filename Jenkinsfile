pipeline {

    agent {
        label 'windows-devops'
    }

    environment {
        APP_NAME  = "blue-green-app"
        NAMESPACE = "blue-green"
        IMAGE     = "blue-green-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Windows Agent') {
            steps {
                powershell '''
                    Write-Host "=== Java ==="
                    java -version

                    Write-Host "=== Git ==="
                    git --version

                    Write-Host "=== Docker ==="
                    docker --version

                    Write-Host "=== kubectl ==="
                    kubectl version --client

                    Write-Host "=== Trivy ==="
                    trivy --version

                    Write-Host "=== Minikube ==="
                    minikube version

                    Write-Host "=== Kubernetes Context ==="
                    kubectl config current-context
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                powershell """
                    docker build --no-cache -t ${IMAGE}:${IMAGE_TAG} ./app
                """
            }
        }

        stage('Trivy Security Scan') {
            steps {
                powershell """
                    trivy image --exit-code 1 --severity HIGH,CRITICAL --ignore-unfixed ${IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Load Image into Minikube') {
            steps {
                powershell """
                    minikube image load ${IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy Kubernetes Resources') {
            steps {
                powershell """
                    kubectl apply -f k8s/namespace.yaml
                    kubectl apply -f k8s/services.yaml
                    kubectl apply -f k8s/analysis-template.yaml
                    kubectl apply -f k8s/rollout.yaml
                    kubectl apply -f k8s/ingress.yaml
                """
            }
        }

        stage('Update Rollout') {
            steps {
                powershell """
                    kubectl -n ${NAMESPACE} set image rollout/${APP_NAME} ${APP_NAME}=${IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Check Rollout') {
            steps {
                powershell """
                    kubectl get rollout ${APP_NAME} -n ${NAMESPACE}
                    kubectl get pods -n ${NAMESPACE}
                """
            }
        }
    }

    post {

        success {
            echo 'CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check the failed stage and Argo Rollouts status.'
        }

        always {
            powershell """
                kubectl get rollout -n ${NAMESPACE}
                kubectl get pods -n ${NAMESPACE}
            """
        }
    }
}