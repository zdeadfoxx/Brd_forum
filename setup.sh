#!/bin/bash
set -e  # Прерывать выполнение при ошибках

echo "🔧 Установка зависимостей TaaS..."

# Проверяем, установлен ли Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 14+."
    exit 1
fi

# Проверяем, установлен ли npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm не найден."
    exit 1
fi

# Удаляем старые зависимости
echo "🗑️  Удаляем старые зависимости..."
rm -rf node_modules package-lock.json

# Устанавливаем package.json для бэкенда
echo "📝 Создаём package.json для бэкенда..."
cat > package.json << 'EOF'
{
  "name": "taas-backend",
  "version": "1.0.0",
  "description": "TaaS Backend Server",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "pg": "^8.11.3",
    "dockerode": "^3.3.5",
    "dotenv": "^16.3.1"
  },
  "keywords": [
    "taas",
    "devops",
    "containers",
    "podman"
  ],
  "author": "Bondarenko Daniil",
  "license": "MIT"
}
EOF

# Устанавливаем зависимости
echo "📦 Устанавливаем npm-зависимости..."
npm install

# Создаём группу podman, если не существует
if ! getent group podman > /dev/null 2>&1; then
    echo "👥 Создаём группу podman..."
    sudo groupadd podman
fi

# Добавляем текущего пользователя в группу podman
USERNAME=$(whoami)
if ! groups $USERNAME | grep -q podman; then
    echo "👤 Добавляем пользователя $USERNAME в группу podman..."
    sudo usermod -a -G podman $USERNAME
fi

# Выставляем права на сокет Podman
echo "🔒 Настраиваем права на сокет Podman..."
sudo chmod 666 /var/run/podman/podman.sock

echo "✅ Установка зависимостей завершена!"
echo "💡 Запустите 'source ~/.bashrc' или перезапустите терминал, чтобы обновить группу пользователя."
echo "🚀 Затем запустите сервер: sudo npm start"
