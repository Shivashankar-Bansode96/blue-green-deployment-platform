# Project Documentation

## Project Goal

Build a practical CI/CD platform demonstrating safe Blue-Green application releases using Jenkins, Kubernetes and Argo Rollouts.

## Successful Deployment Scenario

```text
Code Push
  -> Jenkins
  -> Docker Build
  -> Trivy Scan
  -> Preview Deployment
  -> Health Analysis = UP
  -> Promotion
  -> NGINX
  -> Production
```

## Failed Deployment Scenario

```text
Broken Application
  -> Preview
  -> Health Analysis = DOWN
  -> Promotion Blocked
  -> Existing Active Version Remains
```

## Jenkins Stages

```text
Checkout
Verify Windows Agent
Build Docker Image
Verify Image Version
Trivy Security Scan
Load Image into Minikube
Deploy Kubernetes Resources
Update Rollout
Check Preview Rollout
Promote Rollout
Verify Production Ingress
Final Rollout Verification
```

## Portfolio Project Entry

**Blue-Green Deployment Platform | Jenkins, Docker, Kubernetes, Argo Rollouts, NGINX, Trivy**

- Built an automated Jenkins CI/CD pipeline for containerized Blue-Green deployments on Kubernetes.
- Integrated Trivy security scanning to block HIGH/CRITICAL image vulnerabilities before deployment.
- Implemented Argo Rollouts preview environments with automated pre-promotion health analysis.
- Configured NGINX Ingress and production endpoint validation to verify application health and deployed version.
- Demonstrated failed-release protection by blocking promotion of an intentionally unhealthy application version.

## LinkedIn Project Description

Built an end-to-end Blue-Green Deployment Platform using Jenkins, Docker, Kubernetes, Argo Rollouts, NGINX Ingress, Minikube and Trivy. The pipeline automates image build, security scanning, preview deployment, health analysis, promotion and production validation. Implemented version-based releases and failure protection so unhealthy preview deployments are prevented from becoming active.

## Interview Talking Points

### CI/CD
Designed a Jenkins pipeline that automates build, security scan, deployment, promotion and production validation.

### Security
Integrated Trivy into CI/CD to detect HIGH and CRITICAL container vulnerabilities.

### Kubernetes
Used Kubernetes and Minikube to run application workloads and manage services, pods and ingress.

### Blue-Green Deployment
Used Argo Rollouts to maintain separate active and preview versions and control production promotion.

### Release Safety
Added pre-promotion health analysis so an unhealthy preview version cannot become active.

### Validation
Added production endpoint and application-version checks after promotion.
