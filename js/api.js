// Shared API helper for all frontend pages
const API_BASE = '/api';

async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
}

// Fetch random words by language, difficulty, and count
// Returns: [{id, word, difficulty}]
async function fetchWords(lang, difficulty, count, sessionCode) {
    const params = new URLSearchParams();
    if (difficulty) params.set('difficulty', difficulty);
    if (count) params.set('count', count.toString());
    if (sessionCode) params.set('sessionCode', sessionCode);

    return apiRequest(`/words/${lang}?${params.toString()}`);
}

// Create a new game session
// Returns: {code, sessionId, language}
async function createSession(language) {
    return apiRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify({ language })
    });
}

// Join an existing session
// Returns: {playerId, session: {code, language, createdAt}}
async function joinSession(code, playerName) {
    return apiRequest('/sessions/join', {
        method: 'POST',
        body: JSON.stringify({ code: code.toUpperCase(), playerName })
    });
}

// Get session info with player list
// Returns: {code, language, createdAt, players: [{id, name, joinedAt, wordsSelected}]}
async function getSessionInfo(code) {
    return apiRequest(`/sessions/${code.toUpperCase()}`);
}

// Commit selected words to prevent duplicates
// Returns: {message, inserted, skipped}
async function selectWords(code, playerId, wordIds, language) {
    return apiRequest(`/sessions/${code.toUpperCase()}/select`, {
        method: 'POST',
        body: JSON.stringify({ playerId, wordIds, language })
    });
}
