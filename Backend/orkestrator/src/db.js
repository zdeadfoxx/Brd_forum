const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS environments (
                client_id VARCHAR(50) PRIMARY KEY,
                container_name VARCHAR(100) NOT NULL,
                url VARCHAR(255) NOT NULL,
                ssh_port INTEGER,
                status VARCHAR(20) DEFAULT 'running',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('📦 База данных PostgreSQL готова');
    } catch (err) {
        console.error('❌ Ошибка инициализации БД:', err.message);
    }
}

module.exports = { pool, initDB };
