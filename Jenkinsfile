pipeline {

    agent {
        label 'windows-devops'
    }

    environment {
        APP_NAME  = "blue-green-app"
        NAMESPACE = "blue-green"
        IMAGE     = "blue-green-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
        APP_VERSION = "v${BUILD_NUMBER}"
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

                    Write-Host "=== Argo Rollouts ==="
                    kubectl argo rollouts version

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
                    Write-Host "Building ${IMAGE}:${IMAGE_TAG}"
                    Write-Host "Application Version: ${APP_VERSION}"

                    docker build --no-cache `
                        --build-arg APP_VERSION=${APP_VERSION} `
                        -t ${IMAGE}:${IMAGE_TAG} ./app
                """
            }
        }

        stage('Verify Image Version') {
            steps {
                powershell """
                    Write-Host "=== Docker Image Environment ==="

                    docker image inspect ${IMAGE}:${IMAGE_TAG} `
                        --format '{{.Config.Env}}'
                """
            }
        }

        stage('Trivy Security Scan') {
            steps {
                powershell """
                    Write-Host "=== Trivy Security Scan ==="

                    trivy image `
                        --exit-code 1 `
                        --severity HIGH,CRITICAL `
                        --ignore-unfixed `
                        ${IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Load Image into Minikube') {
            steps {
                powershell """
                    Write-Host "Loading ${IMAGE}:${IMAGE_TAG} into Minikube"

                    minikube image load ${IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy Kubernetes Resources') {
            steps {
                powershell """
                    Write-Host "=== Applying Kubernetes Resources ==="

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
                    Write-Host "=== Updating Argo Rollout ==="
                    Write-Host "Image: ${IMAGE}:${IMAGE_TAG}"

                    kubectl argo rollouts set image `
                        ${APP_NAME} `
                        ${APP_NAME}=${IMAGE}:${IMAGE_TAG} `
                        -n ${NAMESPACE}
                """
            }
        }

        stage('Check Rollout') {
            steps {
                powershell """
                    Write-Host "=== Rollout Status ==="

                    kubectl argo rollouts get rollout `
                        ${APP_NAME} `
                        -n ${NAMESPACE}

                    Write-Host "=== Pods ==="

                    kubectl get pods `
                        -n ${NAMESPACE} `
                        -o wide
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
                Write-Host "=== Final Rollout Status ==="

                kubectl argo rollouts get rollout `
                    ${APP_NAME} `
                    -n ${NAMESPACE}

                Write-Host "=== Final Pods ==="

                kubectl get pods `
                    -n ${NAMESPACE}
            """
        }
    }
}