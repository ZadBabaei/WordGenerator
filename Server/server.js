// Load environment variables from .env file
require('dotenv').config();

const path = require('path');
const cors = require('cors');
const express = require('express');
const pool = require('./db');
const wordsRouter = require('./routes/words');
const sessionsRouter = require('./routes/sessions');

// Create an Express application
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve frontend static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Mount API routes
app.use('/api/words', wordsRouter);
app.use('/api/sessions', sessionsRouter);

// Legacy endpoint (keep for backward compatibility)
app.get('/words/english', (req, res) => {
    pool.query("SELECT words FROM eng ORDER BY RAND() LIMIT 10", (error, results) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            const words = results.map(row => row.words);
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
