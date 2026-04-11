FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 postgresql supervisor && \
    rm -rf /var/lib/apt/lists/*
RUN mkdir -p /var/log/supervisor /opt/app
COPY index.html /opt/app/index.html
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
EXPOSE 8000
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
