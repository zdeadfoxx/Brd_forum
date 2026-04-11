const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/podman/podman.sock' });

async function removeClientEnv(clientId) {
    const containerName = `client-${clientId}`;
    console.log(`Поиск контейнера ${containerName}...`);

    try {
        const container = docker.getContainer(containerName);
        await container.remove({ force: true });
        console.log(`✅ Среда ${containerName} удалена.`);
    } catch (err) {
        if (err.statusCode === 404) {
            console.log(`⚠️ Среда уже удалена.`);
        } else {
            console.error("❌ Ошибка:", err.message);
        }
    }
}

removeClientEnv("004");
