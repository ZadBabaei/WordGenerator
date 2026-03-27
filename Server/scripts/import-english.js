// Import English words from CSV into words_en table with OpenAI difficulty classification
// Run: node scripts/import-english.js
// Requires: OPENAI_API_KEY in .env
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fs = require('fs');
const mysql = require('mysql2/promise');

const CACHE_FILE = path.join(__dirname, 'english-difficulty-cache.json');
const CSV_PATH = path.join(__dirname, '..', '..', 'asset', 'English Words.csv');

async function classifyWithOpenAI(words) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    const prompt = `You are classifying English words for a party guessing/charades game.
Classify each word as:
- "easy": Very common everyday words that are simple to describe, act out, or guess (e.g., "dog", "car", "house", "eat", "run")
- "moderate": Somewhat common words that require a bit more thought to describe or guess (e.g., "administration", "agreement", "particular")
- "hard": Uncommon, abstract, or difficult-to-act-out words (e.g., "sovereignty", "ubiquitous", "philosophy")

Words to classify:
${words.join(', ')}

Respond with ONLY a JSON object mapping each word to its difficulty. Example: {"dog": "easy", "philosophy": "hard"}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('OpenAI API error:', err);
        return null;
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

function fallbackDifficulty(word) {
    const len = word.length;
    if (len <= 5) return 'easy';
    if (len <= 8) return 'moderate';
    return 'hard';
}

async function importEnglishWords() {
    // Read CSV
    const raw = fs.readFileSync(CSV_PATH, 'utf-8');
    const words = raw.split('\n')
        .map(line => line.trim())
        .filter(w => w.length > 0);

    console.log(`Read ${words.length} words from CSV.`);

    // Load or create cache
    let cache = {};
    if (fs.existsSync(CACHE_FILE)) {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        console.log(`Loaded ${Object.keys(cache).length} cached classifications.`);
    }

    // Find words that need classification
    const unclassified = words.filter(w => !cache[w]);
    console.log(`${unclassified.length} words need classification.`);

    if (unclassified.length > 0) {
        const BATCH_SIZE = 50;
        const batches = [];
        for (let i = 0; i < unclassified.length; i += BATCH_SIZE) {
            batches.push(unclassified.slice(i, i + BATCH_SIZE));
        }

        console.log(`Classifying in ${batches.length} batches...`);

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`  Batch ${i + 1}/${batches.length} (${batch.length} words)...`);

            const result = await classifyWithOpenAI(batch);
            if (result) {
                Object.assign(cache, result);
            } else {
                // Fallback for this batch
                console.log('  Using fallback (word length heuristic)...');
                batch.forEach(w => { cache[w] = fallbackDifficulty(w); });
            }

            // Save cache after each batch
            fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

            // Rate limit pause
            if (i < batches.length - 1) {
                await new Promise(r => setTimeout(r, 500));
            }
        }
    }

    // Connect to DB
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    console.log('\nInserting words into database...');

    let inserted = 0, skipped = 0;
    for (const word of words) {
        const difficulty = cache[word] || fallbackDifficulty(word);
        // Validate difficulty value
        const validDifficulty = ['easy', 'moderate', 'hard'].includes(difficulty) ? difficulty : fallbackDifficulty(word);

        try {
            await connection.execute(
                'INSERT INTO words_en (word, difficulty) VALUES (?, ?) ON DUPLICATE KEY UPDATE difficulty = VALUES(difficulty)',
                [word, validDifficulty]
            );
            inserted++;
        } catch (err) {
            console.error(`  Error inserting "${word}":`, err.message);
            skipped++;
        }
    }

    // Show distribution
    const [rows] = await connection.execute(
        'SELECT difficulty, COUNT(*) as count FROM words_en GROUP BY difficulty'
    );
    console.log('\nDifficulty distribution:');
    rows.forEach(r => console.log(`  ${r.difficulty}: ${r.count}`));

    console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}`);
    await connection.end();
}

importEnglishWords().catch(err => {
    console.error('Import failed:', err.message);
    process.exit(1);
});
