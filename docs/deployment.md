# 🚀 Production Deployment & Orchestration Guide

OpenBalancer can be deployed across Docker, Kubernetes, Bare-Metal Linux, or Systemd.

---

## 1. Quick Start via Docker
```bash
docker run -d \
  --name openbalancer \
  -p 8088:8088 \
  -v $(pwd)/config.json:/app/config.json:ro \
  ghcr.io/incontrolplus/openbalancer:latest
```

---

## 2. Linux Systemd Service Setup

Create `/etc/systemd/system/openbalancer.service`:
```ini
[Unit]
Description=OpenBalancer Async Load Balancer
After=network.target

[Service]
Type=simple
User=openbalancer
Group=openbalancer
WorkingDirectory=/opt/openbalancer
ExecStart=/usr/bin/python3 /opt/openbalancer/openbalancer.py /opt/openbalancer/config.json
Restart=always
RestartSec=3s
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now openbalancer
sudo systemctl status openbalancer
```

---

## 3. Kubernetes Deployment Example

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: openbalancer
  labels:
    app: openbalancer
spec:
  replicas: 2
  selector:
    matchLabels:
      app: openbalancer
  template:
    metadata:
      labels:
        app: openbalancer
    spec:
      containers:
      - name: openbalancer
        image: ghcr.io/incontrolplus/openbalancer:latest
        ports:
        - containerPort: 8088
        livenessProbe:
          httpGet:
            path: /openbalancer/status
            port: 8088
          initialDelaySeconds: 5
          periodSeconds: 10
```
