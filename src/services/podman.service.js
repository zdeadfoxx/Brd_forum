const Docker = require('dockerode');

const socketPath = process.env.PODMAN_SOCKET || '/var/run/podman/podman.sock';
const docker = new Docker({ socketPath });

const baseDomain = process.env.BASE_DOMAIN || 'taas.test';

async function deployClientEnv(clientId) {
    const containerName = `client-${clientId}`;
    const domain = `client${clientId}.${baseDomain}`;

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
                NetworkMode: 'demo-net'
            }
        });

        await container.start();

        return {
            containerId: container.id,
            containerName,
            domain,
            url: `http://${domain}`,
            existed: false
        };
    } catch (error) {
        const message = error.message || '';

        // Podman/Docker: "the container name \"client-004\" is already in use ..."
        if (message.includes('is already in use')) {
            // Попробуем вернуть информацию о уже существующем контейнере
            const existing = docker.getContainer(containerName);
            let existingInfo = null;

            try {
                const data = await existing.inspect();
                existingInfo = {
                    id: data.Id,
                    state: data.State?.Status,
                    startedAt: data.State?.StartedAt
                };
            } catch (inspectError) {
                // если inspect сам упал — просто логируем
                console.error('[TaaS] Failed to inspect existing container:', inspectError.message);
            }

            return {
                containerId: existingInfo?.id || null,
                containerName,
                domain,
                url: `http://${domain}`,
                existed: true,
                existingInfo
            };
        }

        // Все остальные ошибки пробрасываем наверх
        throw error;
    }
}

async function removeClientEnv(clientId) {
    const containerName = `client-${clientId}`;
    const container = docker.getContainer(containerName);

    await container.stop();
    await container.remove();

    return {
        containerName,
        removed: true
    };
}

module.exports = {
    deployClientEnv,
    removeClientEnv
};
