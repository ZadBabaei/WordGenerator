// Session page controller
let pollInterval = null;

function showSessionMessage(text, type = 'info') {
    let msgEl = document.getElementById('sessionMessage');
    if (!msgEl) {
        msgEl = document.createElement('div');
        msgEl.id = 'sessionMessage';
        document.querySelector('.main-container')?.appendChild(msgEl);
    }
    msgEl.textContent = text;
    msgEl.className = `status-message ${type}`;
    setTimeout(() => { msgEl.textContent = ''; msgEl.className = 'status-message'; }, 4000);
}

// Create a new game session
async function handleCreateSession() {
    const nameInput = document.getElementById('name');
    const langSelect = document.getElementById('sessionLang');
    const name = nameInput?.value.trim();
    const language = langSelect?.value || 'en';

    if (!name) {
        showSessionMessage('Please enter your name.', 'error');
        return;
    }

    try {
        // Create session
        const session = await createSession(language);
        sessionStorage.setItem('sessionCode', session.code);

        // Auto-join as the creator
        const joined = await joinSession(session.code, name);
        sessionStorage.setItem('playerId', joined.playerId);

        // Show the room code
        displayRoomCode(session.code);
        showSessionMessage('Session created! Share the code with your friends.', 'success');

        // Start polling for players
        startPolling(session.code);
    } catch (error) {
        console.error('Error creating session:', error);
        showSessionMessage('Failed to create session: ' + error.message, 'error');
    }
}

// Join an existing session
async function handleJoinSession() {
    const nameInput = document.getElementById('joinName');
    const codeInput = document.getElementById('joinCode');
    const name = nameInput?.value.trim();
    const code = codeInput?.value.trim();

    if (!name || !code) {
        showSessionMessage('Please enter your name and session code.', 'error');
        return;
    }

    try {
        const result = await joinSession(code, name);
        sessionStorage.setItem('sessionCode', code.toUpperCase());
        sessionStorage.setItem('playerId', result.playerId);

        displayRoomCode(code.toUpperCase());
        showSessionMessage('Joined session!', 'success');

        // Switch view to show session info
        document.getElementById('joinSection')?.classList.add('hidden');
        document.getElementById('createSection')?.classList.add('hidden');

        startPolling(code.toUpperCase());
    } catch (error) {
        console.error('Error joining session:', error);
        showSessionMessage('Failed to join: ' + error.message, 'error');
    }
}

function displayRoomCode(code) {
    const codeDisplay = document.getElementById('roomCodeDisplay');
    const codeText = document.getElementById('roomCode');
    if (codeDisplay && codeText) {
        codeText.textContent = code;
        codeDisplay.classList.remove('hidden');
    }

    // Hide create/join forms
    document.getElementById('createSection')?.classList.add('hidden');
    document.getElementById('joinSection')?.classList.add('hidden');
}

function startPolling(code) {
    if (pollInterval) clearInterval(pollInterval);

    // Initial fetch
    updatePlayerList(code);

    // Poll every 3 seconds
    pollInterval = setInterval(() => updatePlayerList(code), 3000);
}

async function updatePlayerList(code) {
    try {
        const info = await getSessionInfo(code);
        const playerList = document.getElementById('playerList');
        if (!playerList) return;

        playerList.innerHTML = '';
        info.players.forEach(player => {
            const li = document.createElement('li');
            li.className = 'player-item';
            const status = player.wordsSelected > 0 ? `(${player.wordsSelected} words selected)` : '(waiting)';
            li.innerHTML = `<span class="player-name">${player.name}</span> <span class="player-status">${status}</span>`;
            playerList.appendChild(li);
        });

        // Update player count
        const countEl = document.getElementById('playerCount');
        if (countEl) countEl.textContent = info.players.length;
    } catch (error) {
        console.error('Error polling session:', error);
    }
}

// Go to words page
function goToWords() {
    window.location.href = './Words.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('createBtn')?.addEventListener('click', handleCreateSession);
    document.getElementById('joinBtn')?.addEventListener('click', handleJoinSession);
    document.getElementById('goToWordsBtn')?.addEventListener('click', goToWords);

    // Check if already in a session
    const savedCode = sessionStorage.getItem('sessionCode');
    if (savedCode) {
        displayRoomCode(savedCode);
        startPolling(savedCode);
    }
});
