const express = require('express');
const router = express.Router();

const {
    deployClientEnv,
    removeClientEnv
} = require('../services/podman.service');

router.post('/environments', async (req, res) => {
    const { clientId } = req.body;

    if (!clientId) {
        return res.status(400).json({
            error: 'clientId is required'
        });
    }

    try {
        const result = await deployClientEnv(clientId);

        if (result.existed) {
            return res.status(409).json({
                error: 'Environment already exists',
                containerName: result.containerName,
                url: result.url,
                existingInfo: result.existingInfo
            });
        }

        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to deploy environment',
            details: error.message
        });
    }
});

router.delete('/environments/:clientId', async (req, res) => {
    const { clientId } = req.params;

    try {
        const result = await removeClientEnv(clientId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to remove environment',
            details: error.message
        });
    }
});

module.exports = router;
