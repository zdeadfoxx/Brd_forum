const Docker = require('dockerode');
const { pool } = require('../db');

// Настройки подключения к сокету Podman
const socketPath = process.env.PODMAN_SOCKET || '/run/podman/podman.sock';
const docker = new Docker({ socketPath });
const baseDomain = process.env.BASE_DOMAIN || 'localhost';

/**
 * Создание среды (Mode B: Blank Sandbox) с опциональным внедрением SSH ключа
 */
async function deployClientEnv(clientId, repoUrl = null, branch = 'main', sshPublicKey = null) {
    const containerName = `client-${clientId}`;
    const domain = `client${clientId}.${baseDomain}`;

    // 1. Проверка на существование контейнера
    try {
        const existing = docker.getContainer(containerName);
        await existing.inspect();
        console.log(`⚠️ Container ${containerName} already exists.`);
        return { existed: true, message: "Environment already exists", clientId };
    } catch (e) {
        if (e.statusCode !== 404) throw e; // Ошибка не "не найдено" - пробрасываем дальше
    }

    let container;
    try {
        // 2. Создание контейнера
        container = await docker.createContainer({
            Image: 'localhost/demo-env',
            name: containerName,
            Hostname: containerName,
            Labels: {
                'traefik.enable': 'true',
                [`traefik.http.routers.${containerName}.rule`]: `Host(\`${domain}\`)`,
                [`traefik.http.services.${containerName}.loadbalancer.server.port`]: '8000'
            },
            HostConfig: {
                NetworkMode: 'demo-net',
                PortBindings: { 
                    '22/tcp': [{ HostIp: '0.0.0.0', HostPort: '' }] // Динамический порт
                },
                Memory: 512 * 1024 * 1024, // 512 MB
                NanoCpus: 1000000000       // 1 CPU core
            },
            OpenStdin: true,
            Tty: true
        });

        // 3. Запуск контейнера
        await container.start();
        console.log(`🚀 Container ${containerName} started.`);

        // 4. Логика внедрения SSH ключа (если передан)
        if (sshPublicKey && sshPublicKey.trim().length > 0) {
            console.log(`🔑 [SSH KEY] Starting injection for ${clientId}...`);
            
            // Небольшая пауза, чтобы supervisord успел запустить sshd и создать пользователя
            await new Promise(r => setTimeout(r, 2000));

            try {
                // Команда создает директорию и использует tee для безопасной записи ключа
                // Мы передаем ключ через stdin, чтобы избежать проблем с экранированием кавычек
                const execOptions = {
                    Cmd: ['sh', '-c', 'mkdir -p /workspace/.ssh && tee /workspace/.ssh/authorized_keys && chmod 700 /workspace/.ssh && chmod 600 /workspace/.ssh/authorized_keys && chown -R dev:dev /workspace/.ssh'],
                    AttachStdin: true,
                    AttachStdout: true,
                    AttachStderr: true,
                    User: 'root' // Выполняем от root для гарантированных прав
                };

                const exec = await container.exec(execOptions);
                const stream = await exec.start({ hijack: true, stdin: true });

                // Записываем ключ в stdin процесса
                stream.write(sshPublicKey + '\n');
                stream.end();

                // Ждем завершения выполнения команды
                await new Promise((resolve, reject) => {
                    let output = '';
                    stream.on('data', (chunk) => output += chunk.toString());
                    stream.on('end', () => {
                        console.log(`✅ [SSH KEY] Injection successful for ${clientId}. Output: ${output.trim()}`);
                        resolve();
                    });
                    stream.on('error', reject);
                });

            } catch (keyErr) {
                console.error(`❌ [SSH KEY] Failed to inject key for ${clientId}:`, keyErr.message);
                // Не прерываем деплой, так как вход по паролю 'dev' всё ещё работает
            }
        } else {
            console.log(`ℹ️ [SSH KEY] No key provided for ${clientId}, using password auth only.`);
        }

        // 5. Получение динамического SSH порта
        const inspectData = await container.inspect();
        const sshPort = inspectData.NetworkSettings.Ports['22/tcp'][0].HostPort;
        const url = `http://${domain}`;

        // 6. Сохранение в БД
        const query = `
            INSERT INTO environments (client_id, container_name, url, ssh_port, status, ssh_public_key) 
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (client_id) DO UPDATE SET
                container_name = EXCLUDED.container_name,
                url = EXCLUDED.url,
                ssh_port = EXCLUDED.ssh_port,
                status = 'running',
                ssh_public_key = EXCLUDED.ssh_public_key,
                created_at = NOW()
            RETURNING *`;
        
        const values = [clientId, containerName, url, sshPort, 'running', sshPublicKey];
        const result = await pool.query(query, values);

        return { 
            success: true, 
            clientId, 
            containerName, 
            url, 
            sshPort, 
            sshPublicKey: sshPublicKey || null, // Возвращаем ключ фронтенду для модального окна
            existed: false 
        };

    } catch (err) {
        console.error(`💥 Deployment error for ${clientId}:`, err);
        // Чистка при критической ошибке создания
        if (container) {
            try { await container.remove({ force: true }); } catch (e) {}
        }
        throw err;
    }
}

/**
 * Удаление среды
 */
async function removeClientEnv(clientId) {
    const containerName = `client-${clientId}`;
    console.log(`🗑 Attempting to remove environment: ${clientId} (${containerName})`);

    try {
        const container = docker.getContainer(containerName);
        
        // Проверяем существование
        let containerExists = false;
        try {
            await container.inspect();
            containerExists = true;
        } catch (inspectErr) {
            if (inspectErr.statusCode === 404) {
                console.log(`⚠️ Container ${containerName} not found in Podman. Cleaning DB only.`);
                containerExists = false;
            } else {
                throw inspectErr;
            }
        }

        if (containerExists) {
            // Останавливаем
            try {
                await container.stop({ t: 5 });
                console.log(`⏹ Container ${containerName} stopped.`);
            } catch (stopErr) {
                if (!stopErr.message.includes('is not running')) {
                    console.warn(`⚠️ Stop warning: ${stopErr.message}`);
                }
            }

            // Удаляем
            await container.remove({ force: true, v: true });
            console.log(`🧹 Container ${containerName} removed from disk.`);
        }

        // Чистим БД
        const dbResult = await pool.query(`DELETE FROM environments WHERE client_id = $1`, [clientId]);
        
        if (dbResult.rowCount > 0) {
            console.log(`🗄 Record for ${clientId} deleted from DB.`);
        }

        return { success: true, message: `Environment ${clientId} successfully removed` };

    } catch (err) {
        console.error(`❌ Critical error removing ${clientId}:`, err);
        throw new Error(`Failed to remove environment: ${err.message}`);
    }
}

module.exports = { deployClientEnv, removeClientEnv };