class NinjaTetris {
    constructor() {
        // Game constants
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.CELL_SIZE = 30;
        
        // Game state
        this.board = [];
        this.currentPiece = null;
        this.nextPieces = [];
        this.holdPiece = null;
        this.canHold = true;
        
        // Game stats
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Line clear stats
        this.singleLines = 0;
        this.doubleLines = 0;
        this.tripleLines = 0;
        this.tetrisLines = 0;
        
        // Timing
        this.dropTime = 0;
        this.dropInterval = 1000; // ms
        this.lastTime = 0;
        
        // Canvas contexts
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas1 = document.getElementById('next1Canvas');
        this.nextCtx1 = this.nextCanvas1.getContext('2d');
        this.nextCanvas2 = document.getElementById('next2Canvas');
        this.nextCtx2 = this.nextCanvas2.getContext('2d');
        this.nextCanvas3 = document.getElementById('next3Canvas');
        this.nextCtx3 = this.nextCanvas3.getContext('2d');
        this.holdCanvas = document.getElementById('holdCanvas');
        this.holdCtx = this.holdCanvas.getContext('2d');
        
        // Ninja GIFs
        this.ninjaGifs = {};
        this.loadNinjaGifs();
        
        // Tetrimino definitions
        this.pieces = {
            I: {
                shape: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: '#00FFFF',
                gifs: ['ninja_gif/gif.gif', 'ninja_gif/gif (1).gif']
            },
            O: {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#FFFF00',
                gifs: ['ninja_gif/gif (2).gif', 'ninja_gif/gif (3).gif']
            },
            T: {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#800080',
                gifs: ['ninja_gif/gif (4).gif', 'ninja_gif/gif (5).gif']
            },
            S: {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ],
                color: '#00FF00',
                gifs: ['ninja_gif/gif (6).gif', 'ninja_gif/gif (7).gif']
            },
            Z: {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ],
                color: '#FF0000',
                gifs: ['ninja_gif/gif (8).gif', 'ninja_gif/gif (9).gif']
            },
            J: {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#0000FF',
                gifs: ['ninja_gif/gif (10).gif', 'ninja_gif/gif (11).gif']
            },
            L: {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: '#FFA500',
                gifs: ['ninja_gif/gif (12).gif', 'ninja_gif/gif (13).gif']
            }
        };
        
        this.pieceTypes = Object.keys(this.pieces);
        
        this.init();
    }
    
    async loadNinjaGifs() {
        const gifPaths = [
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
        
        for (const path of gifPaths) {
            const img = new Image();
            img.src = path;
            this.ninjaGifs[path] = img;
        }
    }
    
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadHighScore();
        this.showStartScreen();
    }
    
    setupElements() {
        this.elements = {
            startScreen: document.getElementById('startScreen'),
            startGameBtn: document.getElementById('startGameBtn'),
            howToPlayBtn: document.getElementById('howToPlayBtn'),
            
            currentScore: document.getElementById('currentScore'),
            highScore: document.getElementById('highScore'),
            displayHighScore: document.getElementById('displayHighScore'),
            currentLevel: document.getElementById('currentLevel'),
            linesCleared: document.getElementById('linesCleared'),
            
            singleLines: document.getElementById('singleLines'),
            doubleLines: document.getElementById('doubleLines'),
            tripleLines: document.getElementById('tripleLines'),
            tetrisLines: document.getElementById('tetrisLines'),
            
            gameOverOverlay: document.getElementById('gameOverOverlay'),
            pauseOverlay: document.getElementById('pauseOverlay'),
            
            finalScore: document.getElementById('finalScore'),
            finalLevel: document.getElementById('finalLevel'),
            finalLines: document.getElementById('finalLines'),
            
            restartBtn: document.getElementById('restartBtn'),
            menuBtn: document.getElementById('menuBtn'),
            resumeBtn: document.getElementById('resumeBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            restartGameBtn: document.getElementById('restartGameBtn'),
            helpBtn: document.getElementById('helpBtn'),
            
            helpModal: document.getElementById('helpModal'),
            closeHelp: document.getElementById('closeHelp'),
            
            // Mobile controls
            mobileControls: document.getElementById('mobileControls'),
            leftBtn: document.getElementById('leftBtn'),
            rightBtn: document.getElementById('rightBtn'),
            downBtn: document.getElementById('downBtn'),
            rotateBtn: document.getElementById('rotateBtn'),
            holdBtn: document.getElementById('holdBtn'),
            hardDropBtn: document.getElementById('hardDropBtn')
        };
    }
    
    setupEventListeners() {
        // Start screen
        this.elements.startGameBtn.addEventListener('click', () => this.startGame());
        this.elements.howToPlayBtn.addEventListener('click', () => this.showHelp());
        
        // Game controls
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.restartGameBtn.addEventListener('click', () => this.restartGame());
        this.elements.helpBtn.addEventListener('click', () => this.showHelp());
        
        // Modal controls
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.menuBtn.addEventListener('click', () => this.showStartScreen());
        this.elements.resumeBtn.addEventListener('click', () => this.togglePause());
        this.elements.closeHelp.addEventListener('click', () => this.hideHelp());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Mobile controls
        this.setupMobileControls();
        
        // Touch controls for game canvas
        this.setupTouchControls();
        
        // Mode selector
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
    
    setupMobileControls() {
        // Auto-detect mobile devices
        const isMobile = this.detectMobile();
        
        if (isMobile) {
            this.elements.mobileControls.style.display = 'flex';
            this.enableMobileOptimizations();
        }
        
        // Button event listeners with touch optimization
        this.addTouchOptimizedListener(this.elements.leftBtn, () => this.movePiece(-1, 0));
        this.addTouchOptimizedListener(this.elements.rightBtn, () => this.movePiece(1, 0));
        this.addTouchOptimizedListener(this.elements.downBtn, () => this.movePiece(0, 1));
        this.addTouchOptimizedListener(this.elements.rotateBtn, () => this.rotatePiece());
        this.addTouchOptimizedListener(this.elements.holdBtn, () => this.holdCurrentPiece());
        this.addTouchOptimizedListener(this.elements.hardDropBtn, () => this.hardDrop());
        
        // Long press for continuous movement
        this.setupLongPressControls();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               'ontouchstart' in window ||
               navigator.maxTouchPoints > 0;
    }
    
    enableMobileOptimizations() {
        // Disable context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Prevent zoom on double tap
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
        
        // Optimize canvas for mobile performance
        this.CELL_SIZE = window.innerWidth < 480 ? 18 : 24;
        
        // Adjust drop interval for mobile
        this.dropInterval = Math.max(this.dropInterval, 800); // Slower for touch
    }
    
    addTouchOptimizedListener(element, callback) {
        // Add both touch and click events for maximum compatibility
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            element.classList.add('active');
            callback();
        });
        
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
            element.classList.remove('active');
        });
        
        element.addEventListener('click', callback);
    }
    
    setupLongPressControls() {
        let longPressTimer = null;
        let isLongPress = false;
        
        const startLongPress = (element, action) => {
            longPressTimer = setTimeout(() => {
                isLongPress = true;
                const interval = setInterval(() => {
                    if (element.matches(':active')) {
                        action();
                    } else {
                        clearInterval(interval);
                    }
                }, 100); // Repeat every 100ms
            }, 300); // Start after 300ms
        };
        
        const endLongPress = () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            isLongPress = false;
        };
        
        // Apply long press to movement buttons
        [this.elements.leftBtn, this.elements.rightBtn, this.elements.downBtn].forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                const action = btn === this.elements.leftBtn ? () => this.movePiece(-1, 0) :
                              btn === this.elements.rightBtn ? () => this.movePiece(1, 0) :
                              () => this.movePiece(0, 1);
                startLongPress(btn, action);
            });
            
            btn.addEventListener('touchend', endLongPress);
            btn.addEventListener('touchcancel', endLongPress);
        });
    }
    
    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let isDragging = false;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
            isDragging = false;
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStartX);
            const deltaY = Math.abs(touch.clientY - touchStartY);
            
            if (deltaX > 10 || deltaY > 10) {
                isDragging = true;
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.gamePaused) return;
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const touchDuration = Date.now() - touchStartTime;
            
            const swipeThreshold = 40;
            const tapThreshold = 20;
            
            if (!isDragging && touchDuration < 300) {
                // Quick tap - rotate
                this.rotatePiece();
                return;
            }
            
            // Determine gesture type
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > swipeThreshold) {
                    if (deltaX > 0) {
                        this.movePiece(1, 0); // Right
                    } else {
                        this.movePiece(-1, 0); // Left
                    }
                }
            } else {
                // Vertical swipe
                if (deltaY > swipeThreshold) {
                    this.hardDrop(); // Down swipe
                } else if (deltaY < -swipeThreshold) {
                    this.rotatePiece(); // Up swipe
                }
            }
        });
        
        // Handle multi-touch for hold
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                this.holdCurrentPiece();
            }
        });
    }
    
    handleKeyDown(e) {
        if (!this.gameRunning || this.gamePaused) return;
        
        switch (e.code) {
            case 'KeyA':
            case 'ArrowLeft':
                this.movePiece(-1, 0);
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.movePiece(1, 0);
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.movePiece(0, 1);
                break;
            case 'KeyW':
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case 'KeyQ':
                this.rotatePiece(true); // Counter-clockwise
                break;
            case 'Space':
                e.preventDefault();
                this.hardDrop();
                break;
            case 'KeyC':
                this.holdCurrentPiece();
                break;
            case 'KeyP':
                this.togglePause();
                break;
        }
    }
    
    startGame() {
        this.hideStartScreen();
        this.resetGame();
        this.gameRunning = true;
        this.gamePaused = false;
        this.initBoard();
        this.generateNextPieces();
        this.spawnNewPiece();
        this.updateDisplay();
        this.gameLoop();
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.singleLines = 0;
        this.doubleLines = 0;
        this.tripleLines = 0;
        this.tetrisLines = 0;
        this.dropInterval = 1000;
        this.holdPiece = null;
        this.canHold = true;
        this.nextPieces = [];
        this.hideGameOver();
        this.hidePause();
    }
    
    initBoard() {
        this.board = [];
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                this.board[y][x] = 0;
            }
        }
    }
    
    generateNextPieces() {
        while (this.nextPieces.length < 3) {
            const randomType = this.pieceTypes[Math.floor(Math.random() * this.pieceTypes.length)];
            this.nextPieces.push(this.createPiece(randomType));
        }
    }
    
    createPiece(type) {
        const pieceData = this.pieces[type];
        return {
            type: type,
            shape: pieceData.shape.map(row => [...row]),
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(pieceData.shape[0].length / 2),
            y: 0,
            color: pieceData.color,
            gif: pieceData.gifs[Math.floor(Math.random() * pieceData.gifs.length)]
        };
    }
    
    spawnNewPiece() {
        if (this.nextPieces.length === 0) {
            this.generateNextPieces();
        }
        
        this.currentPiece = this.nextPieces.shift();
        this.generateNextPieces();
        this.canHold = true;
        
        if (this.checkCollision(this.currentPiece)) {
            this.gameOver();
        }
        
        this.drawNextPieces();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        const currentTime = Date.now();
        this.dropTime += currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (!this.gamePaused && this.dropTime >= this.dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
                this.checkLines();
                this.spawnNewPiece();
            }
            this.dropTime = 0;
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return false;
        
        const newPiece = {
            ...this.currentPiece,
            x: this.currentPiece.x + dx,
            y: this.currentPiece.y + dy
        };
        
        if (!this.checkCollision(newPiece)) {
            this.currentPiece.x = newPiece.x;
            this.currentPiece.y = newPiece.y;
            return true;
        }
        
        return false;
    }
    
    rotatePiece(counterClockwise = false) {
        if (!this.currentPiece) return;
        
        const rotated = this.rotateMatrix(this.currentPiece.shape, counterClockwise);
        const newPiece = {
            ...this.currentPiece,
            shape: rotated
        };
        
        if (!this.checkCollision(newPiece)) {
            this.currentPiece.shape = rotated;
        }
    }
    
    rotateMatrix(matrix, counterClockwise = false) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = [];
        
        if (counterClockwise) {
            for (let i = 0; i < cols; i++) {
                rotated[i] = [];
                for (let j = 0; j < rows; j++) {
                    rotated[i][j] = matrix[j][cols - 1 - i];
                }
            }
        } else {
            for (let i = 0; i < cols; i++) {
                rotated[i] = [];
                for (let j = 0; j < rows; j++) {
                    rotated[i][j] = matrix[rows - 1 - j][i];
                }
            }
        }
        
        return rotated;
    }
    
    hardDrop() {
        if (!this.currentPiece) return;
        
        let dropDistance = 0;
        while (this.movePiece(0, 1)) {
            dropDistance++;
        }
        
        this.score += dropDistance * 2;
        this.placePiece();
        this.checkLines();
        this.spawnNewPiece();
    }
    
    holdCurrentPiece() {
        if (!this.currentPiece || !this.canHold) return;
        
        if (this.holdPiece) {
            const temp = this.holdPiece;
            this.holdPiece = this.createPiece(this.currentPiece.type);
            this.currentPiece = temp;
            this.currentPiece.x = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
            this.currentPiece.y = 0;
        } else {
            this.holdPiece = this.createPiece(this.currentPiece.type);
            this.spawnNewPiece();
        }
        
        this.canHold = false;
        this.drawHoldPiece();
    }
    
    checkCollision(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardX = piece.x + x;
                    const boardY = piece.y + y;
                    
                    if (boardX < 0 || boardX >= this.BOARD_WIDTH ||
                        boardY >= this.BOARD_HEIGHT ||
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    placePiece() {
        if (!this.currentPiece) return;
        
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = {
                            color: this.currentPiece.color,
                            gif: this.currentPiece.gif
                        };
                    }
                }
            }
        }
    }
    
    checkLines() {
        const linesToClear = [];
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                linesToClear.push(y);
            }
        }
        
        if (linesToClear.length > 0) {
            this.clearLines(linesToClear);
            this.updateLevel();
        }
    }
    
    clearLines(linesToClear) {
        const linesCount = linesToClear.length;
        
        // Remove cleared lines
        linesToClear.forEach(lineIndex => {
            this.board.splice(lineIndex, 1);
            this.board.unshift(new Array(this.BOARD_WIDTH).fill(0));
        });
        
        // Update stats
        this.lines += linesCount;
        
        switch (linesCount) {
            case 1:
                this.singleLines++;
                this.score += 100 * this.level;
                break;
            case 2:
                this.doubleLines++;
                this.score += 300 * this.level;
                break;
            case 3:
                this.tripleLines++;
                this.score += 500 * this.level;
                break;
            case 4:
                this.tetrisLines++;
                this.score += 800 * this.level;
                break;
        }
        
        this.updateDisplay();
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        }
    }
    
    draw() {
        this.clearCanvas(this.ctx);
        this.drawBoard();
        this.drawCurrentPiece();
        this.drawGhost();
    }
    
    clearCanvas(ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    
    drawBoard() {
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawCell(this.ctx, x, y, this.board[y][x].color, this.board[y][x].gif);
                }
            }
        }
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.CELL_SIZE, 0);
            this.ctx.lineTo(x * this.CELL_SIZE, this.BOARD_HEIGHT * this.CELL_SIZE);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.CELL_SIZE);
            this.ctx.lineTo(this.BOARD_WIDTH * this.CELL_SIZE, y * this.CELL_SIZE);
            this.ctx.stroke();
        }
    }
    
    drawCurrentPiece() {
        if (!this.currentPiece) return;
        
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardX >= 0 && boardX < this.BOARD_WIDTH && boardY >= 0) {
                        this.drawCell(this.ctx, boardX, boardY, this.currentPiece.color, this.currentPiece.gif);
                    }
                }
            }
        }
    }
    
    drawGhost() {
        if (!this.currentPiece) return;
        
        const ghostPiece = { ...this.currentPiece };
        
        while (!this.checkCollision({ ...ghostPiece, y: ghostPiece.y + 1 })) {
            ghostPiece.y++;
        }
        
        if (ghostPiece.y !== this.currentPiece.y) {
            this.ctx.globalAlpha = 0.3;
            
            for (let y = 0; y < ghostPiece.shape.length; y++) {
                for (let x = 0; x < ghostPiece.shape[y].length; x++) {
                    if (ghostPiece.shape[y][x]) {
                        const boardX = ghostPiece.x + x;
                        const boardY = ghostPiece.y + y;
                        
                        if (boardX >= 0 && boardX < this.BOARD_WIDTH && boardY >= 0) {
                            this.drawCell(this.ctx, boardX, boardY, ghostPiece.color);
                        }
                    }
                }
            }
            
            this.ctx.globalAlpha = 1.0;
        }
    }
    
    drawCell(ctx, x, y, color, gifPath = null) {
        const pixelX = x * this.CELL_SIZE;
        const pixelY = y * this.CELL_SIZE;
        
        if (gifPath && this.ninjaGifs[gifPath] && this.ninjaGifs[gifPath].complete) {
            // Draw GIF
            ctx.drawImage(this.ninjaGifs[gifPath], pixelX, pixelY, this.CELL_SIZE, this.CELL_SIZE);
        } else {
            // Fallback to color
            ctx.fillStyle = color;
            ctx.fillRect(pixelX, pixelY, this.CELL_SIZE, this.CELL_SIZE);
        }
        
        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(pixelX, pixelY, this.CELL_SIZE, this.CELL_SIZE);
    }
    
    drawNextPieces() {
        this.clearCanvas(this.nextCtx1);
        this.clearCanvas(this.nextCtx2);
        this.clearCanvas(this.nextCtx3);
        
        const contexts = [this.nextCtx1, this.nextCtx2, this.nextCtx3];
        const cellSizes = [20, 15, 15];
        
        this.nextPieces.forEach((piece, index) => {
            if (index < 3) {
                this.drawPiecePreview(contexts[index], piece, cellSizes[index]);
            }
        });
    }
    
    drawHoldPiece() {
        this.clearCanvas(this.holdCtx);
        
        if (this.holdPiece) {
            this.drawPiecePreview(this.holdCtx, this.holdPiece, 20);
        }
    }
    
    drawPiecePreview(ctx, piece, cellSize) {
        const offsetX = (ctx.canvas.width - piece.shape[0].length * cellSize) / 2;
        const offsetY = (ctx.canvas.height - piece.shape.length * cellSize) / 2;
        
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const pixelX = offsetX + x * cellSize;
                    const pixelY = offsetY + y * cellSize;
                    
                    if (piece.gif && this.ninjaGifs[piece.gif] && this.ninjaGifs[piece.gif].complete) {
                        ctx.drawImage(this.ninjaGifs[piece.gif], pixelX, pixelY, cellSize, cellSize);
                    } else {
                        ctx.fillStyle = piece.color;
                        ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
                    }
                    
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(pixelX, pixelY, cellSize, cellSize);
                }
            }
        }
    }
    
    updateDisplay() {
        this.elements.currentScore.textContent = this.score.toLocaleString();
        this.elements.currentLevel.textContent = this.level;
        this.elements.linesCleared.textContent = this.lines;
        
        this.elements.singleLines.textContent = this.singleLines;
        this.elements.doubleLines.textContent = this.doubleLines;
        this.elements.tripleLines.textContent = this.tripleLines;
        this.elements.tetrisLines.textContent = this.tetrisLines;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.saveHighScore();
        this.showGameOver();
    }
    
    showGameOver() {
        this.elements.finalScore.textContent = this.score.toLocaleString();
        this.elements.finalLevel.textContent = this.level;
        this.elements.finalLines.textContent = this.lines;
        this.elements.gameOverOverlay.style.display = 'flex';
    }
    
    hideGameOver() {
        this.elements.gameOverOverlay.style.display = 'none';
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.showPause();
        } else {
            this.hidePause();
            this.lastTime = Date.now();
        }
    }
    
    showPause() {
        this.elements.pauseOverlay.style.display = 'flex';
    }
    
    hidePause() {
        this.elements.pauseOverlay.style.display = 'none';
    }
    
    restartGame() {
        this.hideGameOver();
        this.hidePause();
        this.startGame();
    }
    
    showStartScreen() {
        this.gameRunning = false;
        this.elements.startScreen.style.display = 'flex';
        this.hideGameOver();
        this.hidePause();
    }
    
    hideStartScreen() {
        this.elements.startScreen.style.display = 'none';
    }
    
    showHelp() {
        this.elements.helpModal.classList.add('show');
    }
    
    hideHelp() {
        this.elements.helpModal.classList.remove('show');
    }
    
    loadHighScore() {
        const saved = localStorage.getItem('ninjaTetrißHighScore') || 0;
        this.elements.highScore.textContent = parseInt(saved).toLocaleString();
        this.elements.displayHighScore.textContent = parseInt(saved).toLocaleString();
    }
    
    saveHighScore() {
        const currentHigh = parseInt(localStorage.getItem('ninjaTetrisHighScore') || 0);
        if (this.score > currentHigh) {
            localStorage.setItem('ninjaTetrisHighScore', this.score);
            this.elements.highScore.textContent = this.score.toLocaleString();
            this.elements.displayHighScore.textContent = this.score.toLocaleString();
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new NinjaTetris();
});