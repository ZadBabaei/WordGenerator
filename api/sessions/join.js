const { getPool } = require('../lib/db');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const db = getPool();
        const { code, playerName } = req.body;

        if (!code || !playerName) {
            return res.status(400).json({ error: 'Session code and player name are required.' });
        }

        const [sessions] = await db.execute('SELECT * FROM sessions WHERE code = ?', [code.toUpperCase()]);
        if (sessions.length === 0) {
            return res.status(404).json({ error: 'Session not found.' });
        }

        const session = sessions[0];

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
};
