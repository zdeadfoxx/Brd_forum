const Docker = require('dockerode');
const { pool } = require('../db');

const socketPath = process.env.PODMAN_SOCKET || '/var/run/podman/podman.sock';
const docker = new Docker({ socketPath });
const baseDomain = process.env.BASE_DOMAIN || 'taas.test';

async function deployClientEnv(clientId) {
    const containerName = `client-${clientId}`;
    const domain = `client${clientId}.${baseDomain}`;

    try {
        // Проверяем, есть ли уже такой контейнер
        const existing = docker.getContainer(containerName);
        await existing.inspect();
        return { existed: true, message: "Environment already exists" };
    } catch (e) {
        // Если ошибка 404 (не найден) - создаем новый!
    }

    try {
        const container = await docker.createContainer({
            Image: 'localhost/demo-env',
            name: containerName,
            Labels: {
                'traefik.enable': 'true',
                [`traefik.http.routers.${containerName}.rule`]: `Host(\`${domain}\`)`,
                [`traefik.http.services.${containerName}.loadbalancer.server.port`]: '8000'
            },
            HostConfig: {
                NetworkMode: 'demo-net',
                PortBindings: { '22/tcp': [{ HostIp: '0.0.0.0', HostPort: '' }] },
                Memory: 512 * 1024 * 1024,
                NanoCpus: 1000000000
            }
        });

        await container.start();

        // Узнаем, какой порт выдал Podman
        const inspectData = await container.inspect();
        const sshPort = inspectData.NetworkSettings.Ports['22/tcp'][0].HostPort;
        const url = `http://${domain}`;

        // Пишем в БД
        await pool.query(
            `INSERT INTO environments (client_id, container_name, url, ssh_port, status) 
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (client_id) DO UPDATE SET status = 'running', ssh_port = $4`,
            [clientId, containerName, url, sshPort, 'running']
        );

        return { containerId: container.id, containerName, domain, url, sshPort, existed: false };
    } catch (err) {
        throw new Error(`Podman error: ${err.message}`);
    }
}

async function removeClientEnv(clientId) {
    const containerName = `client-${clientId}`;
    try {
        const container = docker.getContainer(containerName);
        await container.stop();
        await container.remove();
        
        // Удаляем из БД (или можно просто менять статус)
        await pool.query(`DELETE FROM environments WHERE client_id = $1`, [clientId]);
        
        return { success: true, message: `Environment ${clientId} removed` };
    } catch (err) {
        throw new Error(`Remove error: ${err.message}`);
    }
}

module.exports = { deployClientEnv, removeClientEnv };
