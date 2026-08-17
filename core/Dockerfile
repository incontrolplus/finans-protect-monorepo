FROM python:3.11-alpine

LABEL maintainer="INCONTROL PLUS EOOD <support@openbalancer.com>"
LABEL org.opencontainers.image.title="OpenBalancer"
LABEL org.opencontainers.image.description="Intelligent AI & API Load Balancer and Reverse Proxy"
LABEL org.opencontainers.image.url="https://openbalancer.com"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY openbalancer.py /app/
COPY config.json /app/

EXPOSE 8088

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8088/openbalancer/status', timeout=2)" || exit 1

ENTRYPOINT ["python3", "openbalancer.py", "/app/config.json"]
