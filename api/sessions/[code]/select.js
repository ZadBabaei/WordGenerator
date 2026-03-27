const { getPool } = require('../../lib/db');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const db = getPool();
        const { code } = req.query;
        const { playerId, wordIds, language } = req.body;

        if (!playerId || !wordIds || !Array.isArray(wordIds) || !language) {
            return res.status(400).json({ error: 'playerId, wordIds (array), and language are required.' });
        }

        if (!['en', 'fa'].includes(language)) {
            return res.status(400).json({ error: 'Invalid language.' });
        }

        const [sessions] = await db.execute('SELECT id FROM sessions WHERE code = ?', [code.toUpperCase()]);
        if (sessions.length === 0) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        const sessionId = sessions[0].id;

        const [players] = await db.execute(
            'SELECT id FROM session_players WHERE id = ? AND session_id = ?',
            [playerId, sessionId]
        );
        if (players.length === 0) {
            return res.status(403).json({ error: 'Player not in this session.' });
        }

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

        res.json({ message: 'Words selected successfully.', inserted, skipped });

    } catch (error) {
        console.error('Error selecting words:', error.message);
        res.status(500).json({ error: 'Failed to select words.' });
    }
};
