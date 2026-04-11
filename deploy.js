const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/podman/podman.sock' });

async function deployClientEnv(clientId) {
    const containerName = `client-${clientId}`;
    const domain = `client${clientId}.taas.local`;

    console.log(`[1/3] Создание среды ${containerName}...`);
    try {
        const container = await docker.createContainer({
            Image: 'localhost/demo-env',
            name: containerName,
            Labels: {
                "traefik.enable": "true",
                [`traefik.http.routers.${containerName}.rule`]: `Host(\`${domain}\`)`,
                [`traefik.http.services.${containerName}.loadbalancer.server.port`]: "8000"
            },
            HostConfig: { NetworkMode: 'demo-net' }
        });
        console.log(`[2/3] Запуск среды...`);
        await container.start();
        console.log(`[3/3] ✅ Успех! Проверь: http://${domain}`);
    } catch (err) {
        console.error("❌ Ошибка:", err.message);
    }
}
deployClientEnv("004");
