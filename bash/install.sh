#!/bin/bash
# Останавливаем скрипт при любой ошибке
set -e

echo "🟢 1. Установка Node.js v20 и npm..."
# Добавляем репозиторий NodeSource для 20-й версии
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
# Устанавливаем Node.js (npm устанавливается вместе с ним автоматически)
sudo apt-get install -y nodejs

# Проверяем установку
NODE_VER=$(node -v)
NPM_VER=$(npm -v)
echo "✅ Установлен Node.js: $NODE_VER, npm: v$NPM_VER"

echo "🐘 1. Обновление пакетов и установка Podman..."
sudo apt-get update
sudo apt-get install -y podman

echo "🔌 2. Включение API-сокета Podman (rootful)..."
sudo systemctl enable --now podman.socket

echo "🕸️ 3. Создание сети demo-net..."
# Удаляем сеть, если она уже существовала (чтобы скрипт можно было запускать много раз)
sudo podman network rm demo-net 2>/dev/null || true
sudo podman network create demo-net

echo "🔧 4. Фикс бага cniVersion (замена 1.0.0 на 0.4.0)..."
# Конфигурация сети в Debian/Kali обычно лежит здесь:
NET_CONFIG="/etc/containers/networks/demo-net.json"

if [ -f "$NET_CONFIG" ]; then
    # Используем sed для замены версии прямо в файле
    sudo sed -i 's/"1.0.0"/"0.4.0"/g' "$NET_CONFIG"
    
    # И на всякий случай заменяем версию интерфейса, если используется новый Netavark
    sudo sed -i 's/"network_interface_version": "1.0.0"/"network_interface_version": "0.4.0"/g' "$NET_CONFIG"
    
    echo "✅ Файл $NET_CONFIG успешно пропатчен."
else
    echo "⚠️ Файл конфигурации не найден. Возможно, версия Podman использует другой сетевой стек."
fi

echo "🚦 5. Запуск маршрутизатора Traefik v3..."
# Удаляем старый Traefik, если он есть
sudo podman rm -f traefik 2>/dev/null || true

sudo podman run -d \
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

echo "🎉 ГОТОВО! Инфраструктура TaaS успешно развернута на новом устройстве."
echo "Проверь дашборд Traefik по адресу: http://localhost:8080"
