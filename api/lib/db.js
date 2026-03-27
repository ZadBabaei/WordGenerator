const mysql = require('mysql2/promise');

let pool;

function getPool() {
    if (!pool) {
        const dbUrl = process.env.DATABASE_URL;

        if (dbUrl) {
            // PlanetScale / cloud MySQL via connection string
            pool = mysql.createPool({
                uri: dbUrl,
                ssl: { rejectUnauthorized: true },
                waitForConnections: true,
                connectionLimit: 5,
                queueLimit: 0
            });
        } else {
            // Local MySQL fallback
            pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASS || '',
                database: process.env.DB_NAME || 'wrodgn',
                waitForConnections: true,
                connectionLimit: 5,
                queueLimit: 0
            });
        }
    }
    return pool;
}

module.exports = { getPool };
