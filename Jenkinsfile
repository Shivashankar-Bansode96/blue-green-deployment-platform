pipeline {

    agent {
        label 'windows-devops'
    }

    environment {
        APP_NAME     = "blue-green-app"
        NAMESPACE    = "blue-green"
        IMAGE        = "blue-green-app"
        IMAGE_TAG    = "${BUILD_NUMBER}"
        APP_VERSION  = "v${BUILD_NUMBER}"
        INGRESS_URL  = "http://bluegreen.local/health"
    }

    stages {

        // ============================================================
        // 1. CHECKOUT
        // ============================================================

        stage('Checkout') {
            steps {
                checkout scm
            }
        }


        // ============================================================
        // 2. VERIFY BUILD AGENT
        // ============================================================

        stage('Verify Windows Agent') {
            steps {
                powershell '''
                    Write-Host "=========================================="
                    Write-Host "        VERIFY BUILD AGENT"
                    Write-Host "=========================================="

                    Write-Host ""
                    Write-Host "=== Java ==="
                    java -version

                    Write-Host ""
                    Write-Host "=== Git ==="
                    git --version

                    Write-Host ""
                    Write-Host "=== Docker ==="
                    docker --version

                    Write-Host ""
                    Write-Host "=== kubectl ==="
                    kubectl version --client

                    Write-Host ""
                    Write-Host "=== Argo Rollouts ==="
                    kubectl argo rollouts version

                    Write-Host ""
                    Write-Host "=== Trivy ==="
                    trivy --version

                    Write-Host ""
                    Write-Host "=== Minikube ==="
                    minikube version

                    Write-Host ""
                    Write-Host "=== Kubernetes Context ==="
                    kubectl config current-context
                '''
            }
        }


        // ============================================================
        // 3. BUILD DOCKER IMAGE
        // ============================================================

        stage('Build Docker Image') {
            steps {
                powershell """
                    Write-Host "=========================================="
                    Write-Host "        BUILD DOCKER IMAGE"
                    Write-Host "=========================================="

                    Write-Host "Image       : ${IMAGE}:${IMAGE_TAG}"
                    Write-Host "App Version : ${APP_VERSION}"

                    docker build --no-cache `
                        --build-arg APP_VERSION=${APP_VERSION} `
                        -t ${IMAGE}:${IMAGE_TAG} `
                        ./app
                """
            }
        }


        // ============================================================
        // 4. VERIFY IMAGE VERSION
        // ============================================================

        stage('Verify Image Version') {
            steps {
                powershell """
                    Write-Host "=========================================="
                    Write-Host "        VERIFY IMAGE VERSION"
                    Write-Host "=========================================="

                    docker image inspect ${IMAGE}:${IMAGE_TAG} `
                        --format '{{.Config.Env}}'
                """
            }
        }


        // ============================================================
        // 5. TRIVY SECURITY SCAN
        // ============================================================

        stage('Trivy Security Scan') {
            steps {
                powershell """
                    Write-Host "=========================================="
                    Write-Host "        TRIVY SECURITY SCAN"
                    Write-Host "=========================================="

                    trivy image `
                        --exit-code 1 `
                        --severity HIGH,CRITICAL `
                        --ignore-unfixed `
                        ${IMAGE}:${IMAGE_TAG}
                """
            }
        }


        // ============================================================
        // 6. LOAD IMAGE INTO MINIKUBE
        // ============================================================

        stage('Load Image into Minikube') {
            steps {
                powershell """
                    Write-Host "=========================================="
                    Write-Host "        LOAD IMAGE INTO MINIKUBE"
                    Write-Host "=========================================="

                    Write-Host "Loading ${IMAGE}:${IMAGE_TAG}"

                    minikube image load ${IMAGE}:${IMAGE_TAG}
                """
            }
        }


        // ============================================================
        // 7. DEPLOY KUBERNETES RESOURCES
        // ============================================================

        stage('Deploy Kubernetes Resources') {
            steps {
                powershell """
                    Write-Host "=========================================="
                    Write-Host "        DEPLOY KUBERNETES RESOURCES"
                    Write-Host "=========================================="

                    Write-Host ""
                    Write-Host "Applying namespace..."
                    kubectl apply -f k8s/namespace.yaml

                    Write-Host ""
                    Write-Host "Applying services..."
                    kubectl apply -f k8s/services.yaml

                    Write-Host ""
                    Write-Host "Applying analysis template..."
                    kubectl apply -f k8s/analysis-template.yaml

                    Write-Host ""
                    Write-Host "Applying rollout..."
                    kubectl apply -f k8s/rollout.yaml

                    Write-Host ""
                    Write-Host "Applying ingress..."
                    kubectl apply -f k8s/ingress.yaml
                """
            }
        }


        // ============================================================
        // 8. UPDATE ARGO ROLLOUT
        // ============================================================

        stage('Update Rollout') {
            steps {
                powershell """
                    Write-Host "=========================================="
                    Write-Host "        UPDATE ARGO ROLLOUT"
                    Write-Host "=========================================="

                    Write-Host "Application : ${APP_NAME}"
                    Write-Host "Image       : ${IMAGE}:${IMAGE_TAG}"
                    Write-Host "Version     : ${APP_VERSION}"

                    kubectl argo rollouts set image `
                        ${APP_NAME} `
                        ${APP_NAME}=${IMAGE}:${IMAGE_TAG} `
                        -n ${NAMESPACE}
                """
            }
        }


        // ============================================================
        // 9. WAIT FOR PREVIEW
        // ============================================================

        stage('Check Preview Rollout') {
            steps {
                powershell """
                    Write-Host "=========================================="
                    Write-Host "        CHECK PREVIEW ROLLOUT"
                    Write-Host "=========================================="

                    Start-Sleep -Seconds 10

                    kubectl argo rollouts get rollout `
                        ${APP_NAME} `
                        -n ${NAMESPACE}

                    Write-Host ""
                    Write-Host "=== Pods ==="

                    kubectl get pods `
                        -n ${NAMESPACE} `
                        -o wide
                """
            }
        }


        // ============================================================
        // 10. PROMOTE ROLLOUT
        // ============================================================

        stage('Promote Rollout') {
            steps {
                powershell """
                    Write-Host "=========================================="
                    Write-Host "        PROMOTE ARGO ROLLOUT"
                    Write-Host "=========================================="

                    kubectl argo rollouts promote `
                        ${APP_NAME} `
                        -n ${NAMESPACE}

                    Write-Host ""
                    Write-Host "Waiting for rollout to become Healthy..."

                    kubectl argo rollouts status `
                        ${APP_NAME} `
                        -n ${NAMESPACE} `
                        --timeout 180s
                """
            }
        }


        // ============================================================
        // 11. VERIFY PRODUCTION ING﻿RESS
        // ============================================================

        stage('Verify Production Ingress') {
            steps {
                powershell """
                    Write-Host "=========================================="
                    Write-Host "        VERIFY PRODUCTION INGRESS"
                    Write-Host "=========================================="

                    Write-Host "URL: ${INGRESS_URL}"

                    Start-Sleep -Seconds 5

                    \$response = curl.exe -s `
                        --fail `
                        ${INGRESS_URL}

                    Write-Host ""
                    Write-Host "=== Application Response ==="
                    Write-Host \$response

                    Write-Host ""
                    Write-Host "=== Expected Version ==="
                    Write-Host "${APP_VERSION}"

                    if (\$response -notmatch '"status":"UP"') {
                        Write-Error "Application health check failed."
                        exit 1
                    }

                    if (\$response -notmatch "${APP_VERSION}") {
                        Write-Error "Application version verification failed."
                        exit 1
                    }

                    Write-Host ""
                    Write-Host "Production Ingress verification PASSED."
                """
            }
        }


        // ============================================================
        // 12. FINAL ROLLOUT VERIFICATION
        // ============================================================

        stage('Final Rollout Verification') {
            steps {
                powershell """
                    Write-Host "=========================================="
                    Write-Host "        FINAL ROLLOUT VERIFICATION"
                    Write-Host "=========================================="

                    Write-Host ""
                    Write-Host "=== Rollout ==="

                    kubectl argo rollouts get rollout `
                        ${APP_NAME} `
                        -n ${NAMESPACE}

                    Write-Host ""
                    Write-Host "=== Rollout Status ==="

                    kubectl argo rollouts status `
                        ${APP_NAME} `
                        -n ${NAMESPACE} `
                        --timeout 60s

                    Write-Host ""
                    Write-Host "=== Services ==="

                    kubectl get svc `
                        -n ${NAMESPACE}

                    Write-Host ""
                    Write-Host "=== Pods ==="

                    kubectl get pods `
                        -n ${NAMESPACE} `
                        -o wide

                    Write-Host ""
                    Write-Host "=== Ingress ==="

                    kubectl get ingress `
                        -n ${NAMESPACE}
                """
            }
        }
    }


    // ================================================================
    // POST ACTIONS
    // ================================================================

    post {

        success {
            echo '=========================================='
            echo ' CI/CD PIPELINE COMPLETED SUCCESSFULLY '
            echo '=========================================='
            echo "Application Version: ${APP_VERSION}"
            echo "Docker Image: ${IMAGE}:${IMAGE_TAG}"
            echo "Ingress: ${INGRESS_URL}"
        }

        failure {
            echo '=========================================='
            echo ' CI/CD PIPELINE FAILED '
            echo '=========================================='
            echo 'Check the failed Jenkins stage and Argo Rollouts status.'
        }

        always {
            powershell """
                Write-Host ""
                Write-Host "=========================================="
                Write-Host "        FINAL KUBERNETES STATE"
                Write-Host "=========================================="

                Write-Host ""
                Write-Host "=== Rollout ==="

                kubectl argo rollouts get rollout `
                    ${APP_NAME} `
                    -n ${NAMESPACE}

                Write-Host ""
                Write-Host "=== Pods ==="

                kubectl get pods `
                    -n ${NAMESPACE}

                Write-Host ""
                Write-Host "=== Services ==="

                kubectl get svc `
                    -n ${NAMESPACE}
            """
        }
    }
}