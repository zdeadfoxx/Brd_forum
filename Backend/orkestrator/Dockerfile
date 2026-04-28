FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

# Установка пакетов
RUN apt-get update && \
    apt-get install -y --no-install-recommends git openssh-server supervisor sudo python3 ca-certificates vim nano && \
    rm -rf /var/lib/apt/lists/*

# Настройка пользователя и папок
RUN mkdir -p /workspace /var/log/supervisor /run/sshd && \
    useradd -m -s /bin/bash -G sudo dev && \
    echo 'dev:dev' | chpasswd && \
    ssh-keygen -A && \
    usermod -d /workspace dev && \
    chown -R dev:dev /workspace

# Копирование конфига supervisord
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# --- НОВОЕ: Принудительная настройка цветного промпта для всех ---
# Мы добавляем настройки прямо в /etc/bash.bashrc, чтобы они были у всех
RUN echo 'force_color_prompt=yes' >> /etc/bash.bashrc && \
    echo 'PS1="${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ "' >> /etc/bash.bashrc
# \u = user (зеленый), \h = host (зеленый), \w = path (синий)

EXPOSE 22 8000

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]