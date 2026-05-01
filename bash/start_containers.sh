#!/bin/bash
set -e

echo "🚀 TaaS Platform — Container Manager"
echo "====================================="

# Конфигурация
DB_NAME="taas-db"
DB_IMAGE="postgres:15-alpine"
DB_USER="taas_admin"
DB_PASS="${DB_PASSWORD:-taas_secure_pass_2024}"  # Лучше вынести в .env
DB_NAME_REAL="taas_platform"
NETWORK="demo-net"
POSTGRES_PORT=5432

# ── 1. Проверка сети ─────────────────────────────────────
if ! podman network ls --format '{{.Name}}' | grep -q "^${NETWORK}$"; then
    echo "⚠️ Сеть $NETWORK не найдена. Создаём..."
    podman network create "$NETWORK"
fi

# ── 2. PostgreSQL контейнер ──────────────────────────────
echo "🐘 Проверка контейнера $DB_NAME..."

if ! podman ps -a --format '{{.Names}}' | grep -q "^${DB_NAME}$"; then
    echo "🔨 Создаём контейнер $DB_NAME..."
    podman run -d \
      --name "$DB_NAME" \
      --network "$NETWORK" \
      --restart unless-stopped \
      -e POSTGRES_USER="$DB_USER" \
      -e POSTGRES_PASSWORD="$DB_PASS" \
      -e POSTGRES_DB="$DB_NAME_REAL" \
      -v "${DB_NAME}_data:/var/lib/postgresql/data" \
      "$DB_IMAGE" \
      -c max_connections=200
    echo "✅ Контейнер $DB_NAME создан"
else
    echo "✅ Контейнер $DB_NAME уже существует"
fi

# ── 3. Запуск контейнеров ────────────────────────────────
echo "▶ Запускаем контейнеры..."

for container in "$DB_NAME" "traefik"; do
    STATUS=$(podman ps -a --filter name="^${container}$" --format '{{.Status}}' 2>/dev/null || echo "")
    if [[ "$STATUS" == *"Up"* ]]; then
        echo "✅ $container уже запущен"
    else
        echo "🚀 Запускаем $container..."
        podman start "$container"
    fi
done

# ── 4. Ожидание готовности PostgreSQL ────────────────────
echo "⏳ Ожидание готовности PostgreSQL..."
TIMEOUT=30
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    if podman exec "$DB_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME_REAL" &>/dev/null; then
        echo "✅ PostgreSQL готова (за $ELAPSED сек)"
        break
    fi
    sleep 2
    ELAPSED=$((ELAPSED + 2))
    echo -n "."
done

if ! podman exec "$DB_NAME" pg_isready -U "$DB_USER" -d "$DB_NAME_REAL" &>/dev/null; then
    echo ""
    echo "❌ Ошибка: PostgreSQL не готова за $TIMEOUT секунд"
    echo "💡 Проверь логи: podman logs $DB_NAME"
    exit 1
fi

# ── 5. Вывод информации ──────────────────────────────────
echo ""
echo "📊 Статус контейнеров:"
podman ps --filter name="^($DB_NAME|traefik)$" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔗 Полезные ссылки:"
echo "   • Traefik dashboard: http://localhost:8080"
echo "   • PostgreSQL: localhost:$POSTGRES_PORT (user: $DB_USER)"
echo ""
echo "🛠️ Полезные команды:"
echo "   • Логи БД:          podman logs $DB_NAME"
echo "   • Логи Traefik:     podman logs traefik"
echo "   • Остановить всё:   podman stop $DB_NAME traefik"
echo "   • Удалить БД (⚠️):  podman rm -f $DB_NAME && podman volume rm ${DB_NAME}_data"