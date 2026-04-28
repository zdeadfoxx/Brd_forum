const express = require('express');
const cors = require('cors');
const { deployClientEnv, removeClientEnv } = require('./services/podman.service');
const { pool } = require('./db');

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'DELETE'],
}));

app.use(express.json({ limit: '1mb' })); // Увеличили лимит для ключей

app.get('/api/environments', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT client_id, container_name, url, ssh_port, status, created_at 
             FROM environments ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[GET /api/environments]', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/environments', async (req, res) => {
    try {
        const { clientId, sshPublicKey } = req.body;

        if (!clientId) {
            return res.status(400).json({ error: 'clientId is required' });
        }

        const newEnv = await deployClientEnv(clientId, null, null, sshPublicKey);
        res.json(newEnv);
    } catch (error) {
        console.error('Deployment error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/environments/:clientId', async (req, res) => {
    const { clientId } = req.params;
    try {
        const result = await removeClientEnv(clientId);
        res.json(result);
    } catch (err) {
        console.error('[DELETE /api/environments]', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;