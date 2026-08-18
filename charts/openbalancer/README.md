# 🚀 OpenBalancer Helm Chart

[![Artifact HUB](https://img.shields.io/badge/ArtifactHub-openbalancer-blue?logo=artifacthub)](https://openbalancer.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Engineered by INCONTROL PLUS](https://img.shields.io/badge/Maintained_by-INCONTROL_PLUS_EOOD-blue)](https://openbalancer.com)

Production-grade Kubernetes Helm Chart for **OpenBalancer** — the enterprise AI, LLM, and API Load Balancer engineered by **INCONTROL PLUS EOOD** (`openbalancer.com`).

---

## 🌟 Features

* ⚡ **Model-Aware LLM Routing**: Intelligently dispatch inference requests (`llama3`, `qwen`, `mistral`, etc.) to dedicated GPU backend pools.
* 🛡️ **Built-in Circuit Breaking & Fallbacks**: Automated failover to healthy secondary nodes when upstreams time out or fail.
* 🔄 **Zero-Downtime Hot-Reloading**: Real-time configuration watcher reloads routes dynamically without restarting pods.
* 📊 **Enterprise Prometheus Telemetry**: Built-in metrics scraping endpoints (`/metrics`) and native Grafana dashboard integration.
* 📈 **Horizontal Pod Autoscaling (HPA)**: Automated scaling based on CPU and memory utilization thresholds.
* 🔒 **Hardened Security**: Unprivileged non-root user execution, read-only root filesystems, dropped capabilities, and token authentication.

---

## 📋 Prerequisites

* Kubernetes **v1.22+**
* Helm **v3.8.0+**
* (Optional) **Metrics Server** for Horizontal Pod Autoscaling
* (Optional) **Prometheus Operator** or **Prometheus** for telemetry scraping
* (Optional) **Ingress Controller** (e.g. `ingress-nginx`) & **cert-manager** for TLS termination

---

## 🚀 Quick Start

### 1. Install from Local Chart Source

```bash
# Clone the repository
git clone https://github.com/incontrol-plus/openbalancer.git
cd openbalancer

# Install chart into 'openbalancer' namespace
helm install openbalancer ./charts/openbalancer \
  --create-namespace \
  --namespace openbalancer
```

### 2. Verify Deployment

```bash
# Check pod rollout status
kubectl get pods -n openbalancer -l app.kubernetes.io/name=openbalancer

# Verify service endpoints
kubectl get svc -n openbalancer openbalancer

# Check live logs
kubectl logs -n openbalancer -l app.kubernetes.io/name=openbalancer -f
```

---

## ⚙️ Configuration & Customization

### Using Custom Values File

Create a custom `my-values.yaml`:

```yaml
replicaCount: 3

image:
  repository: ghcr.io/incontrolplus/openbalancer
  tag: "1.4.2"
  pullPolicy: IfNotPresent

resources:
  limits:
    cpu: 2000m
    memory: 1Gi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 15
  targetCPUUtilizationPercentage: 70

config:
  data:
    model_routing:
      llama3: "http://vllm-llama3-service.ai.svc.cluster.local:8000"
      qwen: "http://vllm-qwen-service.ai.svc.cluster.local:8000"
      mistral: "http://tgi-mistral-service.ai.svc.cluster.local:8000"
    default_backend: "http://default-ai-service.ai.svc.cluster.local:8000"
    fallback_pool:
      - "http://failover-ai-service.ai.svc.cluster.local:8000"
    rate_limit:
      enabled: true
      requests_per_minute: 5000
      burst: 200
      whitelist:
        - "10.0.0.0/8"
        - "172.16.0.0/12"
    auth:
      enabled: true
      api_keys:
        - "sk-openbalancer-production-secret-key-1"
        - "sk-openbalancer-production-secret-key-2"

ingress:
  enabled: true
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/proxy-body-size: "64m"
  hosts:
    - host: api.openbalancer.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: openbalancer-tls-cert
      hosts:
        - api.openbalancer.com
```

Apply the configuration:

```bash
helm upgrade --install openbalancer ./charts/openbalancer \
  -f my-values.yaml \
  --namespace openbalancer
```

---

## 📊 Parameters Catalog

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `replicaCount` | `int` | `2` | Number of OpenBalancer replicas (ignored if HPA enabled) |
| `image.repository` | `string` | `ghcr.io/incontrolplus/openbalancer` | Container image repository |
| `image.tag` | `string` | `latest` | Image tag (defaults to `Chart.appVersion`) |
| `image.pullPolicy` | `string` | `IfNotPresent` | Image pull policy |
| `serviceAccount.create` | `bool` | `true` | Enable ServiceAccount creation |
| `serviceAccount.automount` | `bool` | `true` | Automount ServiceAccount API tokens |
| `podAnnotations` | `object` | `{prometheus.io/scrape: "true", ...}` | Prometheus scraping annotations |
| `podSecurityContext` | `object` | `{runAsNonRoot: true, runAsUser: 10001}` | Pod-level security context |
| `securityContext` | `object` | `{readOnlyRootFilesystem: true, ...}` | Container-level security context |
| `service.type` | `string` | `ClusterIP` | Kubernetes Service type (`ClusterIP`, `NodePort`, `LoadBalancer`) |
| `service.port` | `int` | `8888` | OpenBalancer Service port |
| `service.targetPort` | `int` | `8888` | OpenBalancer container target port |
| `ingress.enabled` | `bool` | `false` | Enable Kubernetes Ingress resource |
| `ingress.className` | `string` | `""` | Ingress controller class name |
| `ingress.hosts` | `list` | `[{host: openbalancer.local, ...}]` | Ingress routing hostnames and paths |
| `ingress.tls` | `list` | `[]` | Ingress TLS secret configurations |
| `resources.limits` | `object` | `{cpu: 1000m, memory: 512Mi}` | CPU and memory resource limits |
| `resources.requests` | `object` | `{cpu: 100m, memory: 128Mi}` | CPU and memory resource requests |
| `autoscaling.enabled` | `bool` | `true` | Enable Horizontal Pod Autoscaler |
| `autoscaling.minReplicas` | `int` | `2` | Minimum HPA replica count |
| `autoscaling.maxReplicas` | `int` | `10` | Maximum HPA replica count |
| `autoscaling.targetCPUUtilizationPercentage` | `int` | `75` | Target CPU utilization % for scaling |
| `autoscaling.targetMemoryUtilizationPercentage` | `int` | `80` | Target Memory utilization % for scaling |
| `config.configMapName` | `string` | `""` | Optional external ConfigMap name |
| `config.mountPath` | `string` | `/app/config` | Configuration mount directory |
| `config.fileName` | `string` | `config.json` | Configuration file name |
| `config.data.model_routing` | `object` | `{llama3: "...", ...}` | Model-to-upstream URL mappings |
| `config.data.default_backend` | `string` | `"http://mock-ai-default:8000"` | Fallback upstream URL |
| `config.data.fallback_pool` | `list` | `["http://..."]` | Ordered list of failover backends |
| `config.data.rate_limit.enabled` | `bool` | `true` | Enable IP-based token bucket rate limiter |
| `config.data.auth.enabled` | `bool` | `false` | Enable Bearer API key authentication |

---

## 🔄 Zero-Downtime Route Hot-Reloading

OpenBalancer watches its configuration file mounted from Kubernetes ConfigMaps. When routes or backends change in `values.yaml`:

```bash
helm upgrade openbalancer ./charts/openbalancer -f my-values.yaml -n openbalancer
```

1. Helm updates the `ConfigMap`.
2. The `checksum/config` annotation triggers rolling updates when needed, or OpenBalancer's in-process asynchronous file watcher dynamically reloads routes in sub-second time without terminating active in-flight requests.

---

## 📈 Prometheus & Observability Integration

OpenBalancer provides native Prometheus metrics out-of-the-box.

### Scrape Configuration

If using Prometheus Operator, you can point your `PodMonitor` or `ServiceMonitor` to:
* Port: `8888` (or `http`)
* Path: `/metrics`
* Interval: `5s`

Import the official Grafana Dashboard from `telemetry/grafana-openbalancer-dashboard.json` (`UID: openbalancer-cluster-overview`) to monitor:
* Real-time cluster RPS and throughput breakdown.
* P99 routing and upstream latency.
* Circuit breaker trips and node health status.
* Token metrics (`openbalancer_llm_prompt_tokens_total`, `openbalancer_llm_completion_tokens_total`) and estimated USD cost.

---

## 🧹 Uninstallation

To remove OpenBalancer and all associated resources:

```bash
helm uninstall openbalancer -n openbalancer
kubectl delete namespace openbalancer
```

---

## 🏢 Enterprise Support

Engineered and backed by **INCONTROL PLUS EOOD** (UIC 204882190).
* Official Website: [https://openbalancer.com](https://openbalancer.com)
* Technical Support: `enterprise@openbalancer.com`
