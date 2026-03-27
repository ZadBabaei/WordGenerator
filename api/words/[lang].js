const { getPool } = require('../lib/db');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const db = getPool();
        const { lang } = req.query;
        const { difficulty, count = 10, sessionCode } = req.query;

        if (!['en', 'fa'].includes(lang)) {
            return res.status(400).json({ error: 'Invalid language. Use "en" or "fa".' });
        }

        const validDifficulties = ['easy', 'moderate', 'hard'];
        if (difficulty && !validDifficulties.includes(difficulty)) {
            return res.status(400).json({ error: 'Invalid difficulty. Use "easy", "moderate", or "hard".' });
        }

        const wordCount = Math.min(Math.max(parseInt(count) || 10, 1), 50);
        const table = lang === 'en' ? 'words_en' : 'words_fa';

        let query = '';
        let params = [];

        if (sessionCode) {
            const [sessions] = await db.execute('SELECT id FROM sessions WHERE code = ?', [sessionCode]);
            if (sessions.length === 0) {
                return res.status(404).json({ error: 'Session not found.' });
            }

            const sessionId = sessions[0].id;

            if (difficulty) {
                query = `SELECT id, word, difficulty FROM ${table}
                    WHERE difficulty = ?
                    AND id NOT IN (SELECT word_id FROM selected_words WHERE session_id = ? AND language = ?)
                    ORDER BY RAND() LIMIT ?`;
                params = [difficulty, sessionId, lang, wordCount];
            } else {
                query = `SELECT id, word, difficulty FROM ${table}
                    WHERE id NOT IN (SELECT word_id FROM selected_words WHERE session_id = ? AND language = ?)
                    ORDER BY RAND() LIMIT ?`;
                params = [sessionId, lang, wordCount];
            }
        } else {
            if (difficulty) {
                query = `SELECT id, word, difficulty FROM ${table} WHERE difficulty = ? ORDER BY RAND() LIMIT ?`;
                params = [difficulty, wordCount];
            } else {
                query = `SELECT id, word, difficulty FROM ${table} ORDER BY RAND() LIMIT ?`;
                params = [wordCount];
            }
        }

        const [words] = await db.query(query, params);
        res.json(words);

    } catch (error) {
        console.error('Error fetching words:', error.message);
        res.status(500).json({ error: 'Failed to fetch words.' });
    }
};
