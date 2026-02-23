const BOTTLE_SVG = `<svg viewBox="0 0 24 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Semi-transparent glass body -->
    <path d="M10 2H14V14C14 18 19 22 19 28V60C19 62 18 63 16 63H8C6 63 5 62 5 60V28C5 22 10 18 10 14V2Z" 
          fill="rgba(18, 56, 38, 0.7)" 
          stroke="rgba(200, 255, 220, 0.4)" 
          stroke-width="0.8"/>
    <!-- Cork -->
    <rect x="10.5" y="0" width="3" height="4" fill="#6e452a" rx="1"/>
    <!-- Glass Highlights / Reflections -->
    <path d="M6 32V56" stroke="rgba(255, 255, 255, 0.3)" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M18 36V48" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.8" stroke-linecap="round"/>
    <!-- Rolled parchment inside -->
    <path d="M9 30L14 55" stroke="rgba(245, 235, 200, 0.9)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M10 32L15 57" stroke="rgba(200, 180, 140, 0.6)" stroke-width="1" stroke-linecap="round"/>
</svg>`;

const MESSAGES_DB = [
    { msg: "The ocean calms the restless soul.", author: "A Wanderer" },
    { msg: "Just breathe. You are exactly where you need to be.", author: "Sarah" },
    { msg: "Let the tides wash away your worries.", author: "Ocean Friend" },
    { msg: "Every wave is a new beginning.", author: "Unknown" },
    { msg: "You're doing great. Keep going.", author: "Max" }
];

class OceanApp {
    constructor() {
        this.state = 'idle'; // idle | breathing | explore
        this.timer = 60;
        this.interval = null;
        this.breathingLoop = null;

        // DOM Elements
        this.startScreen = document.getElementById('start-screen');
        this.breatheScreen = document.getElementById('breathe-screen');
        this.exploreScreen = document.getElementById('explore-screen');
        this.breatheText = document.getElementById('breathe-text');
        this.timerText = document.getElementById('timer');
        this.oceanContainer = document.getElementById('ocean-container');
        this.bottlesContainer = document.getElementById('bottles-container');

        // Modals
        this.readModal = document.getElementById('read-modal');
        this.writeModal = document.getElementById('write-modal');
        this.readMessageEl = document.getElementById('read-message');
        this.readAuthorEl = document.getElementById('read-author');
        this.messageInput = document.getElementById('message-input');
        this.nameInput = document.getElementById('name-input');

        this.bindEvents();
        this.spawnInitialBottles();
    }

    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startBreathing());
        document.getElementById('skip-btn').addEventListener('click', () => this.endBreathing());
        document.getElementById('throw-bottle-btn').addEventListener('click', () => this.openModal('write-modal'));
        document.getElementById('send-bottle-btn').addEventListener('click', () => this.throwBottle());

        // Close modal buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.dataset.target));
        });
    }

    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = msg;
        document.getElementById('toast-container').appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // --- State Transitions ---

    startBreathing() {
        this.state = 'breathing';
        this.switchScreen('breathe-screen');
        this.timer = 60;
        this.timerText.textContent = this.timer;
        document.body.classList.add('breathing-mode');

        this.interval = setInterval(() => {
            this.timer--;
            this.timerText.textContent = this.timer;
            if (this.timer <= 0) {
                this.endBreathing();
            }
        }, 1000);

        this.pulseBreathingCycle();
    }

    endBreathing() {
        this.state = 'explore';
        clearInterval(this.interval);
        clearTimeout(this.breathingLoop);
        this.vibrate('stop');

        // Reset ocean to calm state
        this.oceanContainer.style.transition = 'transform 3s ease-in-out';
        this.oceanContainer.style.transform = 'translateY(5%) scaleY(1)';

        document.body.classList.remove('breathing-mode');
        this.switchScreen('explore-screen');

        this.showToast("The sea is calm. Feel free to explore.");
    }

    pulseBreathingCycle() {
        if (this.state !== 'breathing') return;

        // Phase 1: Inhale (4s)
        this.setWaveState('Breathe In...', 'transform 4s ease-out', 'translateY(-20%) scaleY(1.3)');
        this.vibrate('inhale');

        this.breathingLoop = setTimeout(() => {
            if (this.state !== 'breathing') return;

            // Phase 2: Hold (7s)
            this.setWaveState('Hold...', 'transform 7s linear', 'translateY(-22%) scaleY(1.32)');
            this.vibrate('hold');

            this.breathingLoop = setTimeout(() => {
                if (this.state !== 'breathing') return;

                // Phase 3: Exhale (8s)
                this.setWaveState('Breathe Out...', 'transform 8s ease-in-out', 'translateY(5%) scaleY(1)');
                this.vibrate('exhale');

                this.breathingLoop = setTimeout(() => {
                    // Loop
                    this.pulseBreathingCycle();
                }, 8000);

            }, 7000);

        }, 4000);
    }

    setWaveState(text, transition, transform) {
        this.breatheText.style.opacity = 0;
        setTimeout(() => {
            if (this.state !== 'breathing') return;
            this.breatheText.textContent = text;
            this.breatheText.style.opacity = 1;
        }, 500); // 500ms fade for text

        this.oceanContainer.style.transition = transition;
        this.oceanContainer.style.transform = transform;
    }

    vibrate(type) {
        if (!navigator.vibrate) return;

        if (type === 'inhale') {
            // Smoothly building pulses for 4 seconds
            const pattern = [];
            for (let i = 0; i < 20; i++) { pattern.push(50); pattern.push(150); }
            navigator.vibrate(pattern);
        } else if (type === 'hold') {
            // 7 seconds. A steady slow heartbeat.
            const pattern = [];
            for (let i = 0; i < 7; i++) { pattern.push(30); pattern.push(970); }
            navigator.vibrate(pattern);
        } else if (type === 'exhale') {
            // 8 seconds. Gently fading pulses.
            const pattern = [];
            for (let i = 0; i < 16; i++) { pattern.push(80); pattern.push(420); }
            navigator.vibrate(pattern);
        } else if (type === 'stop') {
            navigator.vibrate(0);
        }
    }

    // --- Message Bottles ---

    spawnInitialBottles() {
        // Randomly scatter 3 bottles
        for (let i = 0; i < 3; i++) {
            const botData = MESSAGES_DB[Math.floor(Math.random() * MESSAGES_DB.length)];
            this.createBottleElement(botData.msg, botData.author);
        }
    }

    createBottleElement(msg, author) {
        const bottle = document.createElement('div');
        bottle.className = 'bottle';
        bottle.innerHTML = BOTTLE_SVG;

        // Random placement in the bottom ocean area
        // left: 10% to 90%, bottom: 5% to 25% (viewport)
        const leftPos = 10 + Math.random() * 80;
        const bottomPos = 5 + Math.random() * 20;

        bottle.style.left = `${leftPos}%`;
        bottle.style.bottom = `${bottomPos}%`;

        // Small random animation delay so they bob uniquely
        bottle.style.animationDelay = `${Math.random() * 2}s`;

        bottle.addEventListener('click', () => {
            this.readMessageEl.textContent = `"${msg}"`;
            this.readAuthorEl.textContent = author ? `- ${author}` : "- Unknown";
            this.openModal('read-modal');
        });

        this.bottlesContainer.appendChild(bottle);
    }

    throwBottle() {
        const msg = this.messageInput.value.trim();
        const author = this.nameInput.value.trim() || 'Anonymous';

        if (!msg) {
            this.showToast("Please write a message first.");
            return;
        }

        // Create new bottle
        this.createBottleElement(msg, author);

        // Reset & Close
        this.messageInput.value = '';
        this.nameInput.value = '';
        this.closeModal('write-modal');
        this.showToast("Your message was cast into the sea.");
    }
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    new OceanApp();
});
