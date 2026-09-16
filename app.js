// --- LIVE CLOCK ---
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);
updateClock();

// --- PHOTO UPLOAD (Local Storage Support) ---
const fileUpload = document.getElementById('file-upload');
const profilePic = document.getElementById('profile-pic');

// Load saved image on startup
const savedPic = localStorage.getItem('profilePic');
if (savedPic) {
    profilePic.src = savedPic;
}

fileUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            const dataUrl = evt.target.result;
            profilePic.src = dataUrl;
            localStorage.setItem('profilePic', dataUrl);
        };
        reader.readAsDataURL(file);
    }
});

// --- GAME LOGIC ---
let isPvP = false;
let scores = { p1: 0, p2: 0 };
let pvpState = { p1Choice: null, p2Choice: null };

const CHOICES = {
    rock: '✊',
    paper: '🖐',
    scissors: '✌️'
};

const WIN_MAP = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
};

// UI Elements
const btnPve = document.getElementById('btn-pve');
const btnPvp = document.getElementById('btn-pvp');
const labelP2 = document.getElementById('label-p2');
const displayP1 = document.getElementById('display-p1');
const displayP2 = document.getElementById('display-p2');
const roundResult = document.getElementById('round-result');
const scoreP1El = document.getElementById('score-p1');
const scoreP2El = document.getElementById('score-p2');

// Controls
const p1Actions = document.querySelectorAll('#zone-p1 .btn-action');
const pveControls = document.querySelectorAll('.pve-controls');
const pvpControls = document.querySelectorAll('.pvp-controls');
const readyP1 = document.getElementById('ready-p1');
const readyP2 = document.getElementById('ready-p2');

// Mode Switching
btnPve.addEventListener('click', () => setMode(false));
btnPvp.addEventListener('click', () => setMode(true));

function setMode(pvp) {
    isPvP = pvp;
    btnPve.classList.toggle('active', !isPvP);
    btnPvp.classList.toggle('active', isPvP);
    
    labelP2.textContent = isPvP ? 'PLAYER 2' : 'COMPUTER';
    
    // Toggle controls
    pveControls.forEach(el => el.classList.toggle('hidden', isPvP));
    pvpControls.forEach(el => el.classList.toggle('hidden', !isPvP));

    resetGame();
}

function resetGame() {
    scores = { p1: 0, p2: 0 };
    updateScores();
    resetRound();
    roundResult.textContent = 'INSERT COIN TO START';
}

function resetRound() {
    displayP1.textContent = '?';
    displayP2.textContent = '?';
    displayP1.classList.remove('winner');
    displayP2.classList.remove('winner');
    pvpState = { p1Choice: null, p2Choice: null };
    
    readyP1.textContent = 'WAITING';
    readyP1.className = 'ready-badge';
    readyP2.textContent = 'WAITING';
    readyP2.className = 'ready-badge';
}

// PVE Logic (Clicking buttons)
p1Actions.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (isPvP) return; // Disables mouse click in PvP
        
        const p1Choice = e.target.getAttribute('data-choice');
        playPvE(p1Choice);
    });
});

function playPvE(p1Choice) {
    resetRound();
    const choices = Object.keys(CHOICES);
    const p2Choice = choices[Math.floor(Math.random() * choices.length)];
    
    displayP1.textContent = CHOICES[p1Choice];
    
    // Add small delay for dramatic effect
    roundResult.textContent = 'COMPUTER IS CHOOSING...';
    setTimeout(() => {
        displayP2.textContent = CHOICES[p2Choice];
        resolveWinner(p1Choice, p2Choice);
    }, 500);
}

// PVP Logic (Keyboard)
document.addEventListener('keydown', (e) => {
    if (!isPvP) return;
    
    const key = e.key.toLowerCase();
    
    // Player 1: A, S, D
    if (key === 'a') setPvPChoice('p1', 'rock');
    if (key === 's') setPvPChoice('p1', 'paper');
    if (key === 'd') setPvPChoice('p1', 'scissors');
    
    // Player 2: J, K, L
    if (key === 'j') setPvPChoice('p2', 'rock');
    if (key === 'k') setPvPChoice('p2', 'paper');
    if (key === 'l') setPvPChoice('p2', 'scissors');
});

function setPvPChoice(player, choice) {
    if (pvpState[player + 'Choice']) return; // Already chose this round
    
    pvpState[player + 'Choice'] = choice;
    
    const badge = player === 'p1' ? readyP1 : readyP2;
    badge.textContent = 'READY';
    badge.classList.add('ready');
    
    if (pvpState.p1Choice && pvpState.p2Choice) {
        roundResult.textContent = 'REVEALING...';
        setTimeout(() => {
            displayP1.textContent = CHOICES[pvpState.p1Choice];
            displayP2.textContent = CHOICES[pvpState.p2Choice];
            resolveWinner(pvpState.p1Choice, pvpState.p2Choice);
        }, 800);
    }
}

// Resolve Winner
function resolveWinner(p1Choice, p2Choice) {
    if (p1Choice === p2Choice) {
        roundResult.textContent = 'DRAW!';
    } else if (WIN_MAP[p1Choice] === p2Choice) {
        roundResult.textContent = 'PLAYER 1 WINS!';
        displayP1.classList.add('winner');
        scores.p1++;
    } else {
        roundResult.textContent = isPvP ? 'PLAYER 2 WINS!' : 'COMPUTER WINS!';
        displayP2.classList.add('winner');
        scores.p2++;
    }
    updateScores();
    
    if (isPvP) {
        setTimeout(resetRound, 2000);
    }
}

function updateScores() {
    scoreP1El.textContent = scores.p1;
    scoreP2El.textContent = scores.p2;
}

// Init
setMode(false);
