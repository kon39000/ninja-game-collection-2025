class NinjaReactionGame {
    constructor() {
        this.gifFiles = [
            'ninja_gif/gif.gif',
            'ninja_gif/gif (1).gif',
            'ninja_gif/gif (2).gif',
            'ninja_gif/gif (3).gif',
            'ninja_gif/gif (4).gif',
            'ninja_gif/gif (5).gif',
            'ninja_gif/gif (6).gif',
            'ninja_gif/gif (7).gif',
            'ninja_gif/gif (8).gif',
            'ninja_gif/gif (9).gif',
            'ninja_gif/gif (10).gif',
            'ninja_gif/gif (11).gif',
            'ninja_gif/gif (12).gif',
            'ninja_gif/gif (13).gif',
            'ninja_gif/gif (14).gif',
            'ninja_gif/gif (15).gif',
            'ninja_gif/gif (16).gif',
            'ninja_gif/gif (17).gif'
        ];

        this.gameSettings = {
            easy: { choices: 4, timeLimit: 60 },
            normal: { choices: 6, timeLimit: 90 },
            hard: { choices: 9, timeLimit: 120 }
        };

        this.currentDifficulty = 'easy';
        this.gameState = 'setup'; // setup, playing, paused, finished
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.correctAnswers = 0;
        this.timeLeft = 60;
        this.currentTarget = '';
        this.questionStartTime = 0;
        this.reactionTimes = [];
        this.gameTimer = null;

        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadHighScore();
    }

    setupElements() {
        this.elements = {
            setupScreen: document.getElementById('setupScreen'),
            gameScreen: document.getElementById('gameScreen'),
            resultScreen: document.getElementById('resultScreen'),
            
            difficultyBtns: document.querySelectorAll('.difficulty-btn'),
            startBtn: document.getElementById('startBtn'),
            
            score: document.getElementById('score'),
            timeLeft: document.getElementById('timeLeft'),
            streak: document.getElementById('streak'),
            
            targetGif: document.getElementById('targetGif'),
            choiceGrid: document.getElementById('choiceGrid'),
            
            pauseBtn: document.getElementById('pauseBtn'),
            restartBtn: document.getElementById('restartBtn'),
            
            finalScore: document.getElementById('finalScore'),
            correctAnswers: document.getElementById('correctAnswers'),
            maxStreak: document.getElementById('maxStreak'),
            avgReactionTime: document.getElementById('avgReactionTime'),
            rankBadge: document.getElementById('rankBadge'),
            rankMessage: document.getElementById('rankMessage'),
            
            playAgainBtn: document.getElementById('playAgainBtn'),
            changeDifficultyBtn: document.getElementById('changeDifficultyBtn'),
            
            feedback: document.getElementById('feedback')
        };
    }

    setupEventListeners() {
        // Difficulty selection
        this.elements.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDifficulty = btn.dataset.difficulty;
            });
        });

        // Game controls
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.playAgainBtn.addEventListener('click', () => this.startGame());
        this.elements.changeDifficultyBtn.addEventListener('click', () => this.showSetup());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameState === 'setup') {
                e.preventDefault();
                this.startGame();
            }
            if (e.code === 'Escape' && this.gameState === 'playing') {
                this.togglePause();
            }
        });
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.correctAnswers = 0;
        this.reactionTimes = [];
        this.timeLeft = this.gameSettings[this.currentDifficulty].timeLimit;

        this.showGameScreen();
        this.updateUI();
        this.startTimer();
        this.generateNewQuestion();
    }

    showSetup() {
        this.gameState = 'setup';
        this.elements.setupScreen.style.display = 'block';
        this.elements.gameScreen.style.display = 'none';
        this.elements.resultScreen.style.display = 'none';
    }

    showGameScreen() {
        this.elements.setupScreen.style.display = 'none';
        this.elements.gameScreen.style.display = 'block';
        this.elements.resultScreen.style.display = 'none';
    }

    showResultScreen() {
        this.elements.setupScreen.style.display = 'none';
        this.elements.gameScreen.style.display = 'none';
        this.elements.resultScreen.style.display = 'block';
        this.displayResults();
    }

    startTimer() {
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateUI();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.stopTimer();
            this.elements.pauseBtn.textContent = '▶️ 再開';
            this.showFeedback('⏸️ 一時停止中', 'correct', 2000);
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.startTimer();
            this.elements.pauseBtn.textContent = '⏸️ 一時停止';
        }
    }

    generateNewQuestion() {
        if (this.gameState !== 'playing') return;

        // Select target GIF
        this.currentTarget = this.getRandomGif();
        this.elements.targetGif.src = this.currentTarget;

        // Generate choices
        const choices = this.generateChoices();
        this.displayChoices(choices);

        // Record question start time
        this.questionStartTime = Date.now();
    }

    getRandomGif() {
        return this.gifFiles[Math.floor(Math.random() * this.gifFiles.length)];
    }

    generateChoices() {
        const choiceCount = this.gameSettings[this.currentDifficulty].choices;
        const choices = [this.currentTarget]; // Include correct answer

        // Add random wrong answers
        while (choices.length < choiceCount) {
            const randomGif = this.getRandomGif();
            if (!choices.includes(randomGif)) {
                choices.push(randomGif);
            }
        }

        // Shuffle choices
        return this.shuffleArray(choices);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    displayChoices(choices) {
        const choiceCount = choices.length;
        this.elements.choiceGrid.className = `choice-grid grid-${choiceCount}`;
        this.elements.choiceGrid.innerHTML = '';

        choices.forEach((gifPath, index) => {
            const img = document.createElement('img');
            img.src = gifPath;
            img.className = 'choice-gif';
            img.alt = `Choice ${index + 1}`;
            img.addEventListener('click', () => this.handleChoice(gifPath));
            this.elements.choiceGrid.appendChild(img);
        });
    }

    handleChoice(selectedGif) {
        if (this.gameState !== 'playing') return;

        const reactionTime = (Date.now() - this.questionStartTime) / 1000;
        this.reactionTimes.push(reactionTime);

        if (selectedGif === this.currentTarget) {
            this.handleCorrectAnswer(reactionTime);
        } else {
            this.handleIncorrectAnswer();
        }

        // Generate next question after short delay
        setTimeout(() => {
            if (this.gameState === 'playing') {
                this.generateNewQuestion();
            }
        }, 1000);
    }

    handleCorrectAnswer(reactionTime) {
        this.correctAnswers++;
        this.streak++;
        this.maxStreak = Math.max(this.maxStreak, this.streak);

        // Calculate score
        const baseScore = 100;
        const speedBonus = Math.max(0, Math.floor((3 - reactionTime) * 20)); // Max 50 points for <1s
        const streakBonus = this.streak * 10;
        const totalPoints = baseScore + speedBonus + streakBonus;

        this.score += totalPoints;
        this.updateUI();

        // Show feedback
        const feedback = `🎯 正解！ +${totalPoints}点`;
        this.showFeedback(feedback, 'correct');
    }

    handleIncorrectAnswer() {
        this.streak = 0;
        this.updateUI();

        // Show feedback
        this.showFeedback('❌ 不正解！', 'incorrect');
    }

    showFeedback(message, type, duration = 800) {
        this.elements.feedback.textContent = message;
        this.elements.feedback.className = `feedback ${type} show`;

        setTimeout(() => {
            this.elements.feedback.classList.remove('show');
        }, duration);
    }

    updateUI() {
        this.elements.score.textContent = this.score.toLocaleString();
        this.elements.timeLeft.textContent = this.timeLeft;
        this.elements.streak.textContent = this.streak;
    }

    endGame() {
        this.gameState = 'finished';
        this.stopTimer();
        this.saveHighScore();
        this.showResultScreen();
    }

    restartGame() {
        this.stopTimer();
        this.startGame();
    }

    displayResults() {
        // Final score
        this.elements.finalScore.textContent = this.score.toLocaleString();
        this.elements.correctAnswers.textContent = this.correctAnswers;
        this.elements.maxStreak.textContent = this.maxStreak;

        // Average reaction time
        const avgTime = this.reactionTimes.length > 0 
            ? (this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length).toFixed(2)
            : '0.0';
        this.elements.avgReactionTime.textContent = avgTime;

        // Determine rank
        this.calculateRank();
    }

    calculateRank() {
        let rank, message;

        if (this.score < 500) {
            rank = '見習い忍者';
            message = '修行を続けよ！まだまだ伸び代がある 🥷';
        } else if (this.score < 1500) {
            rank = '中忍';
            message = '良い反射神経だ！さらなる高みを目指せ ⚡';
        } else if (this.score < 3000) {
            rank = '上忍';
            message = '素晴らしい！忍者としての才能を感じる 🌟';
        } else if (this.score < 5000) {
            rank = '影の忍者';
            message = '驚異的な反応速度！真の忍者の域に達している 🔥';
        } else {
            rank = '伝説の忍者';
            message = '完璧！君は忍者界の頂点に立つ者だ！ 👑';
        }

        this.elements.rankBadge.textContent = rank;
        this.elements.rankMessage.textContent = message;
    }

    saveHighScore() {
        const currentHigh = localStorage.getItem('ninjaReactionHighScore') || 0;
        if (this.score > currentHigh) {
            localStorage.setItem('ninjaReactionHighScore', this.score);
        }
    }

    loadHighScore() {
        return localStorage.getItem('ninjaReactionHighScore') || 0;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NinjaReactionGame();
});