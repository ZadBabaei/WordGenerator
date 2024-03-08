// Load environment variables from .env file
require('dotenv').config();
console.log('Environment variables loaded.');

const cors = require('cors');
const express = require('express');
const mysql = require('mysql2');

// Create an Express application
const app = express();

// Enable CORS for all routes
app.use(cors());
console.log('CORS enabled.');

// Parse JSON bodies
app.use(express.json());

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};
console.log('Database configuration:', dbConfig);
// Create a pool for MySQL connections
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
console.log('MySQL connection pool created.');

// Function to retrieve English words from the database
// Function to retrieve English words from the database
function getEnglishWords(callback) {
    // Modified SQL query to order results randomly
    pool.query("SELECT words FROM eng ORDER BY RAND() LIMIT 10", (error, results) => {
        if (error) {
            console.log('Error fetching words:', error.message);
            callback(null, error);
        } else {
            // Extract words only and send back
            const words = results.map(row => row.words); // Assuming 'words' is the correct column name
            console.log('Words fetched successfully:', words);
            callback(words, null);
        }
    });
}


// Define the route for getting English words
app.get('/words/english', (req, res) => {
    console.log('GET request received for /words/english');
    getEnglishWords((words, error) => {
        if (error) {
                        console.log('Sending error response:', error.message);

            res.status(500).json({ error: error.message });
        } else {
                        console.log('Sending words:', words);
            res.json(words);
        }
    });
});

// Fallback port
const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
