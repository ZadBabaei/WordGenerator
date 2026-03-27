const { getPool } = require('../lib/db');

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const db = getPool();
        const { language = 'en' } = req.body;

        if (!['en', 'fa'].includes(language)) {
            return res.status(400).json({ error: 'Invalid language. Use "en" or "fa".' });
        }

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

        res.status(201).json({ code, sessionId: result.insertId, language });

    } catch (error) {
        console.error('Error creating session:', error.message);
        res.status(500).json({ error: 'Failed to create session.' });
    }
};
