// Database schema setup script
// Run: node scripts/setup-db.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    console.log('Connected to database. Creating tables...\n');

    // Table 1: English words with difficulty
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS words_en (
            id INT AUTO_INCREMENT PRIMARY KEY,
            word VARCHAR(100) NOT NULL UNIQUE,
            difficulty ENUM('easy', 'moderate', 'hard') NOT NULL,
            INDEX idx_difficulty (difficulty)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('Created table: words_en');

    // Table 2: Farsi words with difficulty
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS words_fa (
            id INT AUTO_INCREMENT PRIMARY KEY,
            word VARCHAR(200) NOT NULL UNIQUE,
            difficulty ENUM('easy', 'moderate', 'hard') NOT NULL,
            INDEX idx_difficulty (difficulty)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('Created table: words_fa');

    // Table 3: Game sessions
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(6) NOT NULL UNIQUE,
            language ENUM('en', 'fa') NOT NULL DEFAULT 'en',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_code (code)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('Created table: sessions');

    // Table 4: Players in sessions
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS session_players (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            player_name VARCHAR(100) NOT NULL,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('Created table: session_players');

    // Table 5: Selected words (prevents duplicates across players in same session)
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS selected_words (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id INT NOT NULL,
            player_id INT NOT NULL,
            word_id INT NOT NULL,
            language ENUM('en', 'fa') NOT NULL,
            selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
            FOREIGN KEY (player_id) REFERENCES session_players(id) ON DELETE CASCADE,
            UNIQUE KEY unique_session_word (session_id, word_id, language)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    console.log('Created table: selected_words');

    console.log('\nAll tables created successfully!');
    await connection.end();
}

setupDatabase().catch(err => {
    console.error('Setup failed:', err.message);
    process.exit(1);
});
