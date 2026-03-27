const { getPool } = require('../lib/db');

module.exports = async function handler(req, res) {
    const db = getPool();
    const { code } = req.query;

    if (req.method === 'GET') {
        try {
            const [sessions] = await db.execute('SELECT * FROM sessions WHERE code = ?', [code.toUpperCase()]);
            if (sessions.length === 0) {
                return res.status(404).json({ error: 'Session not found.' });
            }

            const session = sessions[0];

            const [players] = await db.execute(
                'SELECT id, player_name, joined_at FROM session_players WHERE session_id = ? ORDER BY joined_at',
                [session.id]
            );

            const [selections] = await db.execute(
                'SELECT player_id, COUNT(*) as word_count FROM selected_words WHERE session_id = ? GROUP BY player_id',
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
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
};
