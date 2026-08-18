# ==============================================================================
# OpenBalancer Core Engine — Production Multi-Architecture Dockerfile
# Supported Architectures: linux/amd64, linux/arm64 (linux/arm64/v8)
# Maintained & Engineered by INCONTROL PLUS EOOD (https://openbalancer.com)
# ==============================================================================

FROM python:3.12-alpine AS runtime

# OCI Metadata Annotations
LABEL org.opencontainers.image.title="OpenBalancer Core" \
      org.opencontainers.image.description="High-Throughput Asynchronous AI & API Load Balancer & Reverse Proxy" \
      org.opencontainers.image.url="https://openbalancer.com" \
      org.opencontainers.image.documentation="https://openbalancer.com/docs" \
      org.opencontainers.image.source="https://github.com/incontrolplus/openbalancer" \
      org.opencontainers.image.vendor="INCONTROL PLUS EOOD" \
      org.opencontainers.image.licenses="MIT" \
      maintainer="INCONTROL PLUS EOOD <support@openbalancer.com>"

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8088 \
    HOST=0.0.0.0 \
    CONFIG_PATH=/app/config/config.json

# Install curl and ca-certificates, and create dedicated unprivileged user
RUN apk add --no-cache curl ca-certificates && \
    addgroup -g 10001 -S openbalancer && \
    adduser -u 10001 -S openbalancer -G openbalancer

WORKDIR /app

# Setup default directories
RUN mkdir -p /app/config /app/certs && \
    chown -R openbalancer:openbalancer /app

# Copy application files
COPY --chown=openbalancer:openbalancer core/openbalancer.py /app/openbalancer.py
COPY --chown=openbalancer:openbalancer core/config.json /app/config/config.json

USER openbalancer

EXPOSE 8088

HEALTHCHECK --interval=10s --timeout=3s --start-period=3s --retries=3 \
  CMD curl -k -f http://localhost:8088/openbalancer/status 2>/dev/null || python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8088/openbalancer/status', timeout=2)" || exit 1

STOPSIGNAL SIGTERM

ENTRYPOINT ["python3", "/app/openbalancer.py"]
CMD ["start", "-c", "/app/config/config.json"]
