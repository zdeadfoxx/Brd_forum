require('dotenv').config();
const path = require('path');
const app = require('./app');
const { initDB } = require('./db');

const PORT = process.env.API_PORT || 3001;

// Раздаём дашборд из папки public/
const express = require('express');
app.use(express.static(path.join(__dirname, '..', 'public')));

async function start() {
    await initDB();
    app.listen(PORT, () => {
        console.log(`✅ TaaS API:       http://localhost:${PORT}`);
        console.log(`🖥️  Dashboard:      http://localhost:${PORT}/dashboard.html`);
    });
}

start().catch(err => {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
});
