
const express = require('express');
const cors = require('cors');

const environmentsRouter = require('./routes/environments.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok'
    });
});

app.use('/api', environmentsRouter);

module.exports = app;
