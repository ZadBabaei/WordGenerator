// Word generation page controller
let currentLanguage = 'en';
let currentWords = []; // [{id, word, difficulty}]

function getSessionCode() {
    return document.getElementById('sessionCode')?.value.trim() || sessionStorage.getItem('sessionCode') || '';
}

function getLanguage() {
    return currentLanguage;
}

// Fetch words from API for each difficulty level based on user input
async function handleGenerateClick() {
    const easyCount = parseInt(document.getElementById('easyCount')?.value) || 0;
    const moderateCount = parseInt(document.getElementById('moderateCount')?.value) || 0;
    const hardCount = parseInt(document.getElementById('hardCount')?.value) || 0;
    const total = easyCount + moderateCount + hardCount;

    if (total === 0) {
        showMessage('Please select at least 1 word.', 'error');
        return;
    }

    const lang = getLanguage();
    const sessionCode = getSessionCode();
    const wordListContainer = document.querySelector('.word-list');
    wordListContainer.innerHTML = '<p class="loading">Loading words...</p>';

    try {
        let useSession = sessionCode;

        // If session code is provided, verify it exists first
        if (useSession) {
            try {
                await getSessionInfo(useSession);
            } catch (e) {
                showMessage('Session not found. Generating without session.', 'error');
                useSession = '';
            }
        }

        const requests = [];
        if (easyCount > 0) requests.push(fetchWords(lang, 'easy', easyCount, useSession));
        if (moderateCount > 0) requests.push(fetchWords(lang, 'moderate', moderateCount, useSession));
        if (hardCount > 0) requests.push(fetchWords(lang, 'hard', hardCount, useSession));

        const results = await Promise.all(requests);
        currentWords = results.flat();

        // Shuffle combined results
        currentWords.sort(() => Math.random() - 0.5);

        updateWordListDisplay(currentWords);
    } catch (error) {
        console.error('Error generating words:', error);
        showMessage('Failed to generate words. Is the server running?', 'error');
        wordListContainer.innerHTML = '<p class="error-text">Failed to load words. Please try again.</p>';
    }
}

function updateWordListDisplay(words) {
    const wordListContainer = document.querySelector('.word-list');
    wordListContainer.innerHTML = '';

    if (words.length === 0) {
        wordListContainer.innerHTML = '<p>No words available. Try different settings.</p>';
        return;
    }

    words.forEach((wordObj, index) => {
        const wordElement = document.createElement('div');
        wordElement.className = `word difficulty-${wordObj.difficulty}`;
        const wordText = typeof wordObj === 'string' ? wordObj : wordObj.word;
        wordElement.textContent = `${index + 1}. ${wordText}`;
        wordListContainer.appendChild(wordElement);
    });
}

// Reload with same settings
function handleReloadClick() {
    handleGenerateClick();
}

// Commit selected words to session
async function handleSelectClick() {
    const sessionCode = getSessionCode();
    const playerId = sessionStorage.getItem('playerId');

    if (!sessionCode || !playerId) {
        showMessage('Join a session first to lock in your words.', 'error');
        return;
    }

    if (currentWords.length === 0) {
        showMessage('Generate words first.', 'error');
        return;
    }

    const wordIds = currentWords.map(w => w.id).filter(Boolean);
    if (wordIds.length === 0) {
        showMessage('No valid words to select.', 'error');
        return;
    }

    try {
        const result = await selectWords(sessionCode, parseInt(playerId), wordIds, getLanguage());
        showMessage(`Words locked in! (${result.inserted} new, ${result.skipped} already taken)`, 'success');
    } catch (error) {
        console.error('Error selecting words:', error);
        showMessage('Failed to lock in words: ' + error.message, 'error');
    }
}

function showMessage(text, type = 'info') {
    let msgEl = document.getElementById('statusMessage');
    if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.id = 'statusMessage';
        document.querySelector('.buttons')?.after(msgEl);
    }
    msgEl.textContent = text;
    msgEl.className = `status-message ${type}`;
    setTimeout(() => { msgEl.textContent = ''; msgEl.className = 'status-message'; }, 4000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate');
    const reloadButton = document.getElementById('reload');
    const selectButton = document.getElementById('select');
    const englishSelector = document.getElementById('eng');
    const farsiSelector = document.getElementById('farsi');

    generateButton?.addEventListener('click', handleGenerateClick);
    reloadButton?.addEventListener('click', handleReloadClick);
    selectButton?.addEventListener('click', handleSelectClick);

    // Language toggle
    englishSelector?.addEventListener('click', function () {
        currentLanguage = 'en';
        this.classList.add('active-language');
        farsiSelector?.classList.remove('active-language');
        document.body.classList.remove('rtl');
    });

    farsiSelector?.addEventListener('click', function () {
        currentLanguage = 'fa';
        this.classList.add('active-language');
        englishSelector?.classList.remove('active-language');
        document.body.classList.add('rtl');
    });

    // Pre-fill session code from sessionStorage
    const savedCode = sessionStorage.getItem('sessionCode');
    const sessionCodeInput = document.getElementById('sessionCode');
    if (savedCode && sessionCodeInput) {
        sessionCodeInput.value = savedCode;
    }

    // Set default language
    englishSelector?.classList.add('active-language');
});
