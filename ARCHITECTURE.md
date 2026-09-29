# Architecture Documentation

## System Components

### Developer and GitHub
The developer pushes application and Kubernetes changes to GitHub. Jenkins uses the repository as its SCM source.

### Jenkins
Jenkins runs on the Windows DevOps agent and executes the CI/CD workflow:

```text
Checkout
  -> Docker Build
  -> Version Verification
  -> Trivy Scan
  -> Minikube Image Load
  -> Kubernetes Deployment
  -> Argo Rollout Update
  -> Preview Analysis
  -> Promotion
  -> Production Validation
```

### Kubernetes / Minikube
Minikube provides the local Kubernetes cluster. The `blue-green` namespace contains the application rollout, services, analysis template and ingress.

### Argo Rollouts
Argo Rollouts controls the Blue-Green release. It manages the active and preview services, ReplicaSets, promotion state and AnalysisRuns.

### AnalysisTemplate
The AnalysisTemplate queries the preview service health endpoint and expects:

```text
status == UP
```

### NGINX Ingress
NGINX exposes:

```text
http://bluegreen.local
```

Production health endpoint:

```text
http://bluegreen.local/health
```

## Traffic Flow

```text
Client
  |
  v
NGINX Ingress
  |
  v
blue-green-active Service
  |
  v
Active ReplicaSet
  |
  v
Active Pods
```

Preview traffic is isolated through:

```text
blue-green-preview Service
        |
        v
Preview Pods
        |
        v
AnalysisTemplate
```

## State Transition

```text
                 Before
                   |
                   v
             +-----------+
             | Active v8 |
             +-----------+
                   |
             Production
               traffic

                   |
             New deployment
                   |
                   v

       +-----------------------+
       |                       |
       v                       v
   Active v8              Preview v9
       |                       |
       |                  Health check
       |                       |
       |                 +-----+-----+
       |                 |           |
       |               PASS         FAIL
       |                 |           |
       |                 v           v
       |              Promote      Block
       |                 |
       +-----------------+
                   |
                   v
             Active v9
```

## Failure Behavior

If `/health` returns `DOWN`, the AnalysisRun fails and the preview release is not promoted. The active version continues receiving production traffic.

## Design Principles

- Immutable versioned images
- Build-number based release identification
- Security scanning before deployment
- Preview-before-production
- Health-gated promotion
- Production endpoint verification
- Non-root container execution
- Kubernetes resource constraints
