const express = require('express');
const router = express.Router();
const db = require('../db').promise;

// Generate a random 6-character alphanumeric code
function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded I,O,0,1 to avoid confusion
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// POST /api/sessions - Create a new session
router.post('/', async (req, res) => {
    try {
        const { language = 'en' } = req.body;

        if (!['en', 'fa'].includes(language)) {
            return res.status(400).json({ error: 'Invalid language. Use "en" or "fa".' });
        }

        // Generate unique code (retry if collision)
        let code;
        let attempts = 0;
        while (attempts < 10) {
            code = generateCode();
            const [existing] = await db.execute('SELECT id FROM sessions WHERE code = ?', [code]);
            if (existing.length === 0) break;
            attempts++;
        }

        if (attempts >= 10) {
            return res.status(500).json({ error: 'Failed to generate unique session code.' });
        }

        const [result] = await db.execute(
            'INSERT INTO sessions (code, language) VALUES (?, ?)',
            [code, language]
        );

        res.status(201).json({
            code,
            sessionId: result.insertId,
            language
        });

    } catch (error) {
        console.error('Error creating session:', error.message);
        res.status(500).json({ error: 'Failed to create session.' });
    }
});

// POST /api/sessions/join - Join an existing session
router.post('/join', async (req, res) => {
    try {
        const { code, playerName } = req.body;

        if (!code || !playerName) {
            return res.status(400).json({ error: 'Session code and player name are required.' });
        }

        // Find session
        const [sessions] = await db.execute('SELECT * FROM sessions WHERE code = ?', [code.toUpperCase()]);
        if (sessions.length === 0) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        const session = sessions[0];

        // Add player
        const [result] = await db.execute(
            'INSERT INTO session_players (session_id, player_name) VALUES (?, ?)',
            [session.id, playerName]
        );

        res.status(201).json({
            playerId: result.insertId,
            session: {
                code: session.code,
                language: session.language,
                createdAt: session.created_at
            }
        });

    } catch (error) {
        console.error('Error joining session:', error.message);
        res.status(500).json({ error: 'Failed to join session.' });
    }
});

// GET /api/sessions/:code - Get session info with player list
router.get('/:code', async (req, res) => {
    try {
        const { code } = req.params;

        const [sessions] = await db.execute('SELECT * FROM sessions WHERE code = ?', [code.toUpperCase()]);
        if (sessions.length === 0) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        const session = sessions[0];

        // Get players
        const [players] = await db.execute(
            'SELECT id, player_name, joined_at FROM session_players WHERE session_id = ? ORDER BY joined_at',
            [session.id]
        );

        // Get word selection counts per player
        const [selections] = await db.execute(
            `SELECT player_id, COUNT(*) as word_count
             FROM selected_words WHERE session_id = ?
             GROUP BY player_id`,
            [session.id]
        );

        const selectionMap = {};
        selections.forEach(s => { selectionMap[s.player_id] = s.word_count; });

        const playersWithStatus = players.map(p => ({
            id: p.id,
            name: p.player_name,
            joinedAt: p.joined_at,
            wordsSelected: selectionMap[p.id] || 0
        }));

        res.json({
            code: session.code,
            language: session.language,
            createdAt: session.created_at,
            players: playersWithStatus
        });

    } catch (error) {
        console.error('Error fetching session:', error.message);
        res.status(500).json({ error: 'Failed to fetch session info.' });
    }
});

// POST /api/sessions/:code/select - Commit selected words
router.post('/:code/select', async (req, res) => {
    try {
        const { code } = req.params;
        const { playerId, wordIds, language } = req.body;

        if (!playerId || !wordIds || !Array.isArray(wordIds) || !language) {
            return res.status(400).json({ error: 'playerId, wordIds (array), and language are required.' });
        }

        if (!['en', 'fa'].includes(language)) {
            return res.status(400).json({ error: 'Invalid language.' });
        }

        // Verify session
        const [sessions] = await db.execute('SELECT id FROM sessions WHERE code = ?', [code.toUpperCase()]);
        if (sessions.length === 0) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        const sessionId = sessions[0].id;

        // Verify player belongs to session
        const [players] = await db.execute(
            'SELECT id FROM session_players WHERE id = ? AND session_id = ?',
            [playerId, sessionId]
        );
        if (players.length === 0) {
            return res.status(403).json({ error: 'Player not in this session.' });
        }

        // Insert selected words (skip duplicates gracefully)
        let inserted = 0;
        let skipped = 0;
        for (const wordId of wordIds) {
            try {
                await db.execute(
                    'INSERT INTO selected_words (session_id, player_id, word_id, language) VALUES (?, ?, ?, ?)',
                    [sessionId, playerId, wordId, language]
                );
                inserted++;
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    skipped++;
                } else {
                    throw err;
                }
            }
        }

        res.json({
            message: 'Words selected successfully.',
            inserted,
            skipped
        });

    } catch (error) {
        console.error('Error selecting words:', error.message);
        res.status(500).json({ error: 'Failed to select words.' });
    }
});

module.exports = router;
