# ==============================================================================
# OpenBalancer Mesh Proxy Dockerfile (Mesh Context)
# Supported Architectures: linux/amd64, linux/arm64 (linux/arm64/v8)
# Maintained by INCONTROL PLUS EOOD (https://openbalancer.com)
# ==============================================================================

FROM python:3.12-alpine AS runtime

LABEL org.opencontainers.image.title="OpenBalancer Mesh Proxy" \
      org.opencontainers.image.description="Turnkey AI Service Mesh & High-Throughput TLS Proxy with Distributed Observability" \
      org.opencontainers.image.url="https://openbalancer.com" \
      org.opencontainers.image.documentation="https://openbalancer.com/docs" \
      org.opencontainers.image.source="https://github.com/incontrolplus/openbalancer" \
      org.opencontainers.image.vendor="INCONTROL PLUS EOOD" \
      org.opencontainers.image.licenses="MIT" \
      maintainer="INCONTROL PLUS EOOD <support@openbalancer.com>"

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8888 \
    HOST=0.0.0.0 \
    CONFIG_PATH=/app/config/config.json

RUN apk add --no-cache curl openssl ca-certificates && \
    addgroup -g 10001 -S openbalancer && \
    adduser -u 10001 -S openbalancer -G openbalancer

WORKDIR /app

RUN mkdir -p /app/config /app/certs && \
    chown -R openbalancer:openbalancer /app

COPY --chown=openbalancer:openbalancer ../core/openbalancer.py /app/openbalancer.py
COPY --chown=openbalancer:openbalancer config.json /app/config/config.json

USER openbalancer

EXPOSE 8888

HEALTHCHECK --interval=5s --timeout=3s --start-period=3s --retries=3 \
  CMD curl -k -f https://localhost:8888/openbalancer/status 2>/dev/null || curl -f http://localhost:8888/openbalancer/status 2>/dev/null || exit 1

STOPSIGNAL SIGTERM

ENTRYPOINT ["python3", "/app/openbalancer.py"]
CMD ["start", "-c", "/app/config/config.json"]
