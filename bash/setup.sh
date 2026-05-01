#!/bin/bash
set -e

echo "🚀 TaaS Platform — Setup Script"
echo "================================"

# ── 1. Проверка прав ─────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
   echo "❌ Этот скрипт нужно запускать от root или через sudo"
   exit 1
fi

# ── 2. Установка Node.js v20 и npm ───────────────────────
echo "🟢 1. Установка Node.js v20 и npm..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 20 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js уже установлен: $(node -v)"
fi

# ── 3. Установка Podman ──────────────────────────────────
echo "🐘 2. Установка Podman..."
apt-get update -qq
apt-get install -y podman podman-docker

# ── 4. Включение Podman socket (rootful API) ─────────────
echo "🔌 3. Включение API-сокета Podman..."
systemctl enable --now podman.socket

# ── 5. Создание сети demo-net с фиксом CNI ───────────────
echo "🕸️ 4. Создание сети demo-net..."
podman network rm demo-net 2>/dev/null || true
podman network create demo-net

NET_CONFIG="/etc/containers/networks/demo-net.json"
if [ -f "$NET_CONFIG" ]; then
    sed -i 's/"cniVersion"[[:space:]]*:[[:space:]]*"1.0.0"/"cniVersion": "0.4.0"/g' "$NET_CONFIG"
    sed -i 's/"network_interface_version"[[:space:]]*:[[:space:]]*"1.0.0"/"network_interface_version": "0.4.0"/g' "$NET_CONFIG" 2>/dev/null || true
    echo "✅ Файл сети пропатчен: $NET_CONFIG"
fi

# ── 6. Запуск Traefik v3 (только если не существует) ─────
echo "🚦 5. Настройка Traefik v3..."
if ! podman ps -a --format '{{.Names}}' | grep -q "^traefik$"; then
    podman run -d \
      --name traefik \
      --network demo-net \
      --restart unless-stopped \
      -p 80:80 \
      -p 8080:8080 \
      -v /var/run/podman/podman.sock:/var/run/podman/podman.sock:ro \
      docker.io/library/traefik:v3.0 \
      --api.insecure=true \
      --providers.docker=true \
      --providers.docker.endpoint=unix:///var/run/podman/podman.sock \
      --providers.docker.exposedbydefault=false
    echo "✅ Контейнер traefik создан"
else
    echo "✅ Контейнер traefik уже существует"
fi

# ── 7. Настройка прав на сокет для Node.js ───────────────
echo "🔒 6. Настройка прав на сокет Podman..."
chmod 666 /var/run/podman/podman.sock

# ── 8. Группа podman для пользователя ────────────────────
echo "👥 7. Настройка группы podman..."
USERNAME="${SUDO_USER:-$(whoami)}"
if ! getent group podman > /dev/null 2>&1; then
    groupadd podman
fi
if ! groups "$USERNAME" | grep -q '\bpodman\b'; then
    usermod -a -G podman "$USERNAME"
    echo "⚠️ Пользователь $USERNAME добавлен в группу podman. Требуется перезайти в сессию."
fi

# ── 9. Backend dependencies ──────────────────────────────
echo "📦 8. Установка зависимостей бэкенда..."
if [ -f "package.json" ]; then
    rm -rf node_modules package-lock.json
    npm install --production
    echo "✅ Зависимости установлены"
else
    echo "⚠️ package.json не найден в текущей директории. Пропускаем npm install."
fi

echo ""
echo "🎉 Setup завершён!"
echo "💡 Далее:"
echo "   1. Перезайди в терминал или выполни: newgrp podman"
echo "   2. Запусти контейнеры: ./start-containers.sh"
echo "   3. Запусти бэкенд: npm start"
echo "🔗 Traefik dashboard: http://localhost:8080"