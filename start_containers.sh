#!/bin/bash
set -e # Прерывать выполнение при ошибках

echo "🔍 Проверяем статус контейнеров..."

# Получаем статус контейнеров
DB_STATUS=$(sudo podman ps -a --filter name=taas-db --format "{{.Status}}")
TRAEFIK_STATUS=$(sudo podman ps -a --filter name=traefik --format "{{.Status}}")

echo "Статус taas-db: $DB_STATUS"
echo "Статус traefik: $TRAEFIK_STATUS"

# Запускаем контейнеры, если они не в статусе Up
if [[ "$DB_STATUS" != *"Up"* ]]; then
    echo "🚀 Запускаем контейнер taas-db..."
    sudo podman start taas-db
else
    echo "✅ Контейнер taas-db уже запущен."
fi

if [[ "$TRAEFIK_STATUS" != *"Up"* ]]; then
    echo "🚀 Запускаем контейнер traefik..."
    sudo podman start traefik
else
    echo "✅ Контейнер traefik уже запущен."
fi

echo "⏳ Ждём, пока PostgreSQL будет готова принимать подключения..."
# Ждём готовности PostgreSQL с таймаутом (например, 30 секунд)
timeout 30 bash -c 'until sudo podman exec taas-db pg_isready -U taas_admin -d taas_platform > /dev/null 2>&1; do sleep 2; done'

# Проверяем результат timeout
if sudo podman exec taas-db pg_isready -U taas_admin -d taas_platform > /dev/null 2>&1; then
    echo "✅ PostgreSQL готова принимать подключения."
else
    echo "❌ Ошибка: PostgreSQL не стала готова в течение 30 секунд."
    exit 1
fi

echo "🎉 Все контейнеры запущены и готовы!"

# Если нужно сразу запустить Node.js (опционально)
# echo "🎬 Запускаем Node.js оркестратор..."
# sudo npm start

