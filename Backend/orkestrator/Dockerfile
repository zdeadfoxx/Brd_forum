FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 postgresql supervisor openssh-server sudo && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir /run/sshd && \
    useradd -m -s /bin/bash -G sudo dev && \
    echo 'dev:dev' | chpasswd

RUN mkdir -p /var/log/supervisor /opt/app
COPY index.html /opt/app/index.html
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8000 22

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
