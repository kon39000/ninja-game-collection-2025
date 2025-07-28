class NinjaStealth {
    constructor() {
        // Game constants
        this.TILE_SIZE = 30;
        this.CANVAS_WIDTH = 600;
        this.CANVAS_HEIGHT = 480;
        this.GRID_WIDTH = Math.floor(this.CANVAS_WIDTH / this.TILE_SIZE);
        this.GRID_HEIGHT = Math.floor(this.CANVAS_HEIGHT / this.TILE_SIZE);
        
        // Game state
        this.gameState = 'start'; // start, playing, paused, gameOver, stageCleared
        this.currentStage = 1;
        this.maxStage = 5;
        this.gameRunning = false;
        this.isPaused = false;
        
        // Player state
        this.player = {
            x: 1,
            y: 1,
            pixelX: 1 * this.TILE_SIZE,
            pixelY: 1 * this.TILE_SIZE,
            moving: false,
            hidden: false,
            crouching: false,
            stealthLevel: 100,
            detectionCount: 0,
            maxDetections: 1,
            gif: null,
            lastMove: Date.now()
        };
        
        // Mission objectives
        this.treasures = [];
        this.treasuresCollected = 0;
        this.totalTreasures = 0;
        this.exitReached = false;
        
        // Abilities
        this.abilities = {
            smokeBomb: { count: 1, cooldown: 0, duration: 3000 },
            clone: { count: 1, cooldown: 0, duration: 5000 },
            invisibility: { count: 0, cooldown: 0, duration: 3000 }
        };
        
        // Enemies
        this.enemies = [];
        this.alertLevel = 'normal'; // normal, alert, high
        
        // Stage data and map
        this.currentMap = [];
        this.exitPosition = { x: 0, y: 0 };
        
        // Graphics
        this.ninjaGifs = {};
        this.effects = [];
        this.particles = [];
        
        // Canvas contexts
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        
        // Timing
        this.lastTime = 0;
        this.startTime = 0;
        this.stageStartTime = 0;
        
        // Input handling
        this.keys = {};
        this.touchControls = {
            movement: { x: 0, y: 0 },
            abilities: { smoke: false, clone: false, invisibility: false },
            actions: { crouch: false, hide: false }
        };
        
        this.init();
    }
    
    async init() {
        await this.loadNinjaGifs();
        this.setupElements();
        this.setupEventListeners();
        this.setupMobileControls();
        this.loadProgress();
        this.showStartScreen();
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
        
        // Assign player ninja
        this.player.gif = this.ninjaGifs['ninja_gif/gif.gif'];
    }
    
    setupElements() {
        this.elements = {
            startScreen: document.getElementById('startScreen'),
            startMissionBtn: document.getElementById('startMissionBtn'),
            tutorialBtn: document.getElementById('tutorialBtn'),
            
            currentStage: document.getElementById('currentStage'),
            treasuresCollected: document.getElementById('treasuresCollected'),
            totalTreasures: document.getElementById('totalTreasures'),
            missionStatus: document.getElementById('missionStatus'),
            
            stealthBar: document.getElementById('stealthBar'),
            stealthValue: document.getElementById('stealthValue'),
            ninjaState: document.getElementById('ninjaState'),
            movementMode: document.getElementById('movementMode'),
            
            smokeBombCount: document.getElementById('smokeBombCount'),
            cloneCount: document.getElementById('cloneCount'),
            invisibilityCount: document.getElementById('invisibilityCount'),
            
            alertLevel: document.getElementById('alertLevel'),
            enemyCount: document.getElementById('enemyCount'),
            
            gameOverOverlay: document.getElementById('gameOverOverlay'),
            pauseOverlay: document.getElementById('pauseOverlay'),
            stageClearOverlay: document.getElementById('stageClearOverlay'),
            
            gameOverTitle: document.getElementById('gameOverTitle'),
            finalStage: document.getElementById('finalStage'),
            finalTreasures: document.getElementById('finalTreasures'),
            finalRank: document.getElementById('finalRank'),
            finalTime: document.getElementById('finalTime'),
            
            clearRank: document.getElementById('clearRank'),
            clearDetections: document.getElementById('clearDetections'),
            clearTime: document.getElementById('clearTime'),
            
            retryBtn: document.getElementById('retryBtn'),
            stageSelectBtn: document.getElementById('stageSelectBtn'),
            nextStageBtn: document.getElementById('nextStageBtn'),
            replayStageBtn: document.getElementById('replayStageBtn'),
            resumeBtn: document.getElementById('resumeBtn'),
            
            pauseBtn: document.getElementById('pauseBtn'),
            restartBtn: document.getElementById('restartBtn'),
            helpBtn: document.getElementById('helpBtn'),
            
            helpModal: document.getElementById('helpModal'),
            closeHelp: document.getElementById('closeHelp'),
            
            // Mobile controls
            mobileControls: document.getElementById('mobileControls'),
            smokeBombBtn: document.getElementById('smokeBombBtn'),
            cloneBtn: document.getElementById('cloneBtn'),
            invisibilityBtn: document.getElementById('invisibilityBtn'),
            sneakBtn: document.getElementById('sneakBtn'),
            hideBtn: document.getElementById('hideBtn'),
            runBtn: document.getElementById('runBtn'),
            upBtn: document.getElementById('upBtn'),
            downBtn: document.getElementById('downBtn'),
            leftBtn: document.getElementById('leftBtn'),
            rightBtn: document.getElementById('rightBtn')
        };
    }
    
    setupEventListeners() {
        // Start screen
        this.elements.startMissionBtn.addEventListener('click', () => this.startMission());
        this.elements.tutorialBtn.addEventListener('click', () => this.showHelp());
        
        // Stage selection
        document.querySelectorAll('.stage-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!btn.classList.contains('locked')) {
                    const stage = parseInt(e.target.closest('.stage-btn').dataset.stage);
                    this.selectStage(stage);
                }
            });
        });
        
        // Game controls
        this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.elements.restartBtn.addEventListener('click', () => this.restartStage());
        this.elements.helpBtn.addEventListener('click', () => this.showHelp());
        
        // Modal controls
        this.elements.retryBtn.addEventListener('click', () => this.restartStage());
        this.elements.stageSelectBtn.addEventListener('click', () => this.showStartScreen());
        this.elements.nextStageBtn.addEventListener('click', () => this.nextStage());
        this.elements.replayStageBtn.addEventListener('click', () => this.restartStage());
        this.elements.resumeBtn.addEventListener('click', () => this.togglePause());
        this.elements.closeHelp.addEventListener('click', () => this.hideHelp());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    setupMobileControls() {
        // Auto-detect mobile devices
        const isMobile = this.detectMobile();
        
        if (isMobile) {
            this.elements.mobileControls.style.display = 'flex';
            this.enableMobileOptimizations();
        }
        
        // Ability buttons
        this.elements.smokeBombBtn.addEventListener('click', () => this.useAbility('smokeBomb'));
        this.elements.cloneBtn.addEventListener('click', () => this.useAbility('clone'));
        this.elements.invisibilityBtn.addEventListener('click', () => this.useAbility('invisibility'));
        
        // Movement mode buttons
        this.elements.sneakBtn.addEventListener('click', () => this.toggleCrouch());
        this.elements.hideBtn.addEventListener('click', () => this.toggleHide());
        this.elements.runBtn.addEventListener('click', () => this.setNormalMovement());
        
        // Directional pad
        this.elements.upBtn.addEventListener('click', () => this.movePlayer(0, -1));
        this.elements.downBtn.addEventListener('click', () => this.movePlayer(0, 1));
        this.elements.leftBtn.addEventListener('click', () => this.movePlayer(-1, 0));
        this.elements.rightBtn.addEventListener('click', () => this.movePlayer(1, 0));
        
        // Touch optimization
        this.setupTouchOptimization();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               'ontouchstart' in window ||
               navigator.maxTouchPoints > 0;
    }
    
    enableMobileOptimizations() {
        // Adjust tile size and canvas size for different screen sizes
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        if (screenWidth < 480) {
            // Small mobile
            this.TILE_SIZE = 20;
            this.CANVAS_WIDTH = 400;
            this.CANVAS_HEIGHT = 320;
        } else if (screenWidth < 768) {
            // Large mobile
            this.TILE_SIZE = 24;
            this.CANVAS_WIDTH = 480;
            this.CANVAS_HEIGHT = 384;
        } else if (screenWidth < 1024) {
            // Tablet
            this.TILE_SIZE = 28;
            this.CANVAS_WIDTH = 560;
            this.CANVAS_HEIGHT = 448;
        }
        
        // Update canvas dimensions
        this.canvas.width = this.CANVAS_WIDTH;
        this.canvas.height = this.CANVAS_HEIGHT;
        
        // Recalculate grid dimensions
        this.GRID_WIDTH = Math.floor(this.CANVAS_WIDTH / this.TILE_SIZE);
        this.GRID_HEIGHT = Math.floor(this.CANVAS_HEIGHT / this.TILE_SIZE);
        
        // Adjust game difficulty for mobile
        if (screenWidth < 768) {
            this.adjustMobileDifficulty();
        }
        
        // Add orientation change handler
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
    }
    
    adjustMobileDifficulty() {
        // Reduce enemy vision range slightly for mobile
        if (this.enemies.length > 0) {
            this.enemies.forEach(enemy => {
                enemy.visionRange = Math.max(2, enemy.visionRange - 1);
                enemy.moveInterval += 200; // Slower enemy movement
            });
        }
    }
    
    handleOrientationChange() {
        // Recalculate dimensions on orientation change
        const isMobile = this.detectMobile();
        if (isMobile) {
            this.enableMobileOptimizations();
            
            // Show orientation hint for better experience
            if (window.innerHeight < window.innerWidth && window.innerWidth < 768) {
                this.showOrientationHint();
            }
        }
    }
    
    showOrientationHint() {
        // Create a temporary hint for landscape mode
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            text-align: center;
            font-family: inherit;
            border: 2px solid rgba(135, 206, 235, 0.5);
        `;
        hint.innerHTML = `
            <h3>📱 画面向きのヒント</h3>
            <p>縦向きでのプレイを推奨します</p>
        `;
        
        document.body.appendChild(hint);
        
        setTimeout(() => {
            if (hint.parentNode) {
                hint.parentNode.removeChild(hint);
            }
        }, 3000);
    }
    
    setupTouchOptimization() {
        const touchButtons = document.querySelectorAll('.touch-btn, .dpad-btn');
        
        touchButtons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.classList.add('active');
                this.addHapticFeedback();
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('active');
            });
            
            btn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                btn.classList.remove('active');
            });
        });
        
        // Canvas touch gestures
        this.setupCanvasTouchGestures();
    }
    
    addHapticFeedback() {
        // Provide haptic feedback on supported devices
        if ('vibrate' in navigator) {
            navigator.vibrate(50); // Short vibration
        }
    }
    
    setupCanvasTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let isDragging = false;
        let longPressTimer = null;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchStartTime = Date.now();
            isDragging = false;
            
            // Long press for hide action
            longPressTimer = setTimeout(() => {
                if (!isDragging) {
                    this.toggleHide();
                    this.addHapticFeedback();
                }
            }, 500);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - touchStartX);
            const deltaY = Math.abs(touch.clientY - touchStartY);
            
            if (deltaX > 15 || deltaY > 15) {
                isDragging = true;
                if (longPressTimer) {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            
            if (!this.gameRunning || this.isPaused) return;
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - touchStartX;
            const deltaY = touch.clientY - touchStartY;
            const touchDuration = Date.now() - touchStartTime;
            
            const swipeThreshold = 50;
            
            if (!isDragging && touchDuration < 200) {
                // Quick tap - toggle crouch
                this.toggleCrouch();
                return;
            }
            
            if (isDragging) {
                // Determine swipe direction
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (Math.abs(deltaX) > swipeThreshold) {
                        if (deltaX > 0) {
                            this.movePlayer(1, 0); // Right
                        } else {
                            this.movePlayer(-1, 0); // Left
                        }
                    }
                } else {
                    // Vertical swipe
                    if (Math.abs(deltaY) > swipeThreshold) {
                        if (deltaY > 0) {
                            this.movePlayer(0, 1); // Down
                        } else {
                            this.movePlayer(0, -1); // Up
                        }
                    }
                }
            }
        });
        
        // Double tap for ability use
        let lastTapTime = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            const currentTime = Date.now();
            if (currentTime - lastTapTime < 300) {
                // Double tap detected - use smoke bomb
                this.useAbility('smokeBomb');
                this.addHapticFeedback();
            }
            lastTapTime = currentTime;
        });
    }
    
    handleKeyDown(e) {
        if (this.gameState !== 'playing') return;
        
        this.keys[e.code] = true;
        
        switch (e.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.movePlayer(0, -1);
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.movePlayer(0, 1);
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.movePlayer(-1, 0);
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.movePlayer(1, 0);
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.player.crouching = true;
                break;
            case 'Space':
                e.preventDefault();
                this.toggleHide();
                break;
            case 'Digit1':
                this.useAbility('smokeBomb');
                break;
            case 'Digit2':
                this.useAbility('clone');
                break;
            case 'Digit3':
                this.useAbility('invisibility');
                break;
            case 'KeyP':
                this.togglePause();
                break;
        }
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
        
        switch (e.code) {
            case 'ShiftLeft':
            case 'ShiftRight':
                this.player.crouching = false;
                break;
        }
    }
    
    startMission() {
        this.currentStage = 1;
        this.startStage(this.currentStage);
    }
    
    selectStage(stage) {
        this.currentStage = stage;
        this.startStage(stage);
    }
    
    startStage(stageNumber) {
        this.gameState = 'playing';
        this.gameRunning = true;
        this.isPaused = false;
        this.currentStage = stageNumber;
        this.stageStartTime = Date.now();
        
        this.resetPlayer();
        this.loadStage(stageNumber);
        this.hideStartScreen();
        this.updateUI();
        this.gameLoop();
    }
    
    resetPlayer() {
        this.player.x = 1;
        this.player.y = 1;
        this.player.pixelX = 1 * this.TILE_SIZE;
        this.player.pixelY = 1 * this.TILE_SIZE;
        this.player.moving = false;
        this.player.hidden = false;
        this.player.crouching = false;
        this.player.stealthLevel = 100;
        this.player.detectionCount = 0;
        this.player.lastMove = Date.now();
        
        // Reset abilities based on stage
        this.abilities.smokeBomb.count = 1;
        this.abilities.clone.count = 1;
        this.abilities.invisibility.count = this.currentStage >= 5 ? 1 : 0;
        
        this.treasuresCollected = 0;
        this.exitReached = false;
        this.alertLevel = 'normal';
        this.effects = [];
        this.particles = [];
    }
    
    loadStage(stageNumber) {
        // Stage configurations
        const stages = {
            1: {
                name: '修行の館',
                map: this.generateStage1(),
                enemies: 1,
                treasures: 1,
                exit: { x: 18, y: 14 }
            },
            2: {
                name: '庭園の忍び込み',
                map: this.generateStage2(),
                enemies: 2,
                treasures: 2,
                exit: { x: 8, y: 14 }
            },
            3: {
                name: '倉庫の宝',
                map: this.generateStage3(),
                enemies: 3,
                treasures: 3,
                exit: { x: 18, y: 8 }
            },
            4: {
                name: '屋敷の奥座敷',
                map: this.generateStage4(),
                enemies: 3,
                treasures: 4,
                exit: { x: 2, y: 14 }
            },
            5: {
                name: '城の天守閣',
                map: this.generateStage5(),
                enemies: 5,
                treasures: 5,
                exit: { x: 12, y: 2 }
            }
        };
        
        const stage = stages[stageNumber];
        this.currentMap = stage.map;
        this.exitPosition = stage.exit;
        this.totalTreasures = stage.treasures;
        
        this.generateTreasures(stage.treasures);
        this.generateEnemies(stage.enemies, stageNumber);
    }
    
    generateStage1() {
        // Simple tutorial stage - 8x8 area in larger grid
        const map = this.createEmptyMap();
        
        // Create walls around perimeter
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            map[0][x] = 'wall';
            map[this.GRID_HEIGHT - 1][x] = 'wall';
        }
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            map[y][0] = 'wall';
            map[y][this.GRID_WIDTH - 1] = 'wall';
        }
        
        // Add some obstacles
        map[5][8] = 'box';
        map[7][12] = 'box';
        map[3][15] = 'box';
        
        return map;
    }
    
    generateStage2() {
        const map = this.createEmptyMap();
        
        // Create perimeter walls
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            map[0][x] = 'wall';
            map[this.GRID_HEIGHT - 1][x] = 'wall';
        }
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            map[y][0] = 'wall';
            map[y][this.GRID_WIDTH - 1] = 'wall';
        }
        
        // Add garden obstacles (bushes and trees)
        for (let i = 0; i < 8; i++) {
            const x = Math.floor(Math.random() * (this.GRID_WIDTH - 4)) + 2;
            const y = Math.floor(Math.random() * (this.GRID_HEIGHT - 4)) + 2;
            if (map[y][x] === 'floor') {
                map[y][x] = 'bush';
            }
        }
        
        return map;
    }
    
    generateStage3() {
        const map = this.createEmptyMap();
        
        // Create perimeter walls
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            map[0][x] = 'wall';
            map[this.GRID_HEIGHT - 1][x] = 'wall';
        }
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            map[y][0] = 'wall';
            map[y][this.GRID_WIDTH - 1] = 'wall';
        }
        
        // Add warehouse boxes
        for (let i = 0; i < 15; i++) {
            const x = Math.floor(Math.random() * (this.GRID_WIDTH - 4)) + 2;
            const y = Math.floor(Math.random() * (this.GRID_HEIGHT - 4)) + 2;
            if (map[y][x] === 'floor' && !(x === 1 && y === 1)) {
                map[y][x] = 'box';
            }
        }
        
        return map;
    }
    
    generateStage4() {
        const map = this.createEmptyMap();
        
        // Create complex room structure
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            map[0][x] = 'wall';
            map[this.GRID_HEIGHT - 1][x] = 'wall';
        }
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            map[y][0] = 'wall';
            map[y][this.GRID_WIDTH - 1] = 'wall';
        }
        
        // Add internal walls to create rooms
        for (let y = 5; y < 10; y++) {
            map[y][8] = 'wall';
            map[y][12] = 'wall';
        }
        for (let x = 5; x < 15; x++) {
            map[8][x] = 'wall';
        }
        
        // Add doors (gaps in walls)
        map[7][8] = 'floor';
        map[8][10] = 'floor';
        map[7][12] = 'floor';
        
        // Add furniture
        map[3][5] = 'box';
        map[12][6] = 'box';
        map[6][15] = 'box';
        map[11][3] = 'box';
        
        return map;
    }
    
    generateStage5() {
        const map = this.createEmptyMap();
        
        // Create castle layout
        for (let x = 0; x < this.GRID_WIDTH; x++) {
            map[0][x] = 'wall';
            map[this.GRID_HEIGHT - 1][x] = 'wall';
        }
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            map[y][0] = 'wall';
            map[y][this.GRID_WIDTH - 1] = 'wall';
        }
        
        // Create multiple rooms and corridors
        for (let y = 3; y < 13; y++) {
            map[y][6] = 'wall';
            map[y][14] = 'wall';
        }
        for (let x = 3; x < 17; x++) {
            map[6][x] = 'wall';
            map[10][x] = 'wall';
        }
        
        // Add doors
        map[5][6] = 'floor';
        map[8][6] = 'floor';
        map[6][9] = 'floor';
        map[10][11] = 'floor';
        map[5][14] = 'floor';
        map[11][14] = 'floor';
        
        // Add obstacles
        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * (this.GRID_WIDTH - 4)) + 2;
            const y = Math.floor(Math.random() * (this.GRID_HEIGHT - 4)) + 2;
            if (map[y][x] === 'floor' && !(x === 1 && y === 1) && !(x === this.exitPosition.x && y === this.exitPosition.y)) {
                map[y][x] = Math.random() < 0.5 ? 'box' : 'pillar';
            }
        }
        
        return map;
    }
    
    createEmptyMap() {
        const map = [];
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            map[y] = [];
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                map[y][x] = 'floor';
            }
        }
        return map;
    }
    
    generateTreasures(count) {
        this.treasures = [];
        
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (this.GRID_WIDTH - 4)) + 2;
                y = Math.floor(Math.random() * (this.GRID_HEIGHT - 4)) + 2;
            } while (
                this.currentMap[y][x] !== 'floor' ||
                (x === 1 && y === 1) ||
                (x === this.exitPosition.x && y === this.exitPosition.y) ||
                this.treasures.some(t => t.x === x && t.y === y)
            );
            
            this.treasures.push({
                x: x,
                y: y,
                collected: false,
                type: ['💎', '💰', '👑', '🏺', '⚱️'][i % 5]
            });
        }
    }
    
    generateEnemies(count, stageNumber) {
        this.enemies = [];
        
        console.log(`Generating ${count} enemies for stage ${stageNumber}`);
        
        for (let i = 0; i < count; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (this.GRID_WIDTH - 6)) + 3;
                y = Math.floor(Math.random() * (this.GRID_HEIGHT - 6)) + 3;
            } while (
                this.currentMap[y][x] !== 'floor' ||
                this.isNearPlayer(x, y, 4) ||
                this.treasures.some(t => Math.abs(t.x - x) < 2 && Math.abs(t.y - y) < 2)
            );
            
            // Different AI types based on stage
            const aiTypes = ['patrol', 'guard', 'random'];
            let aiType = aiTypes[i % aiTypes.length];
            
            // Stage 4 and 5 have more unpredictable enemies
            if (stageNumber >= 4 && Math.random() < 0.3) {
                aiType = 'random';
            }
            
            const enemy = {
                x: x,
                y: y,
                pixelX: x * this.TILE_SIZE,
                pixelY: y * this.TILE_SIZE,
                direction: Math.floor(Math.random() * 4), // 0=north, 1=east, 2=south, 3=west
                state: 'normal', // normal, alert, chasing
                alertTimer: 0,
                lastMove: Date.now(),
                moveInterval: 1500 + Math.random() * 1000,
                visionRange: 3 + (stageNumber > 3 ? 1 : 0),
                hearingRange: 2,
                aiType: aiType,
                patrolPath: this.generatePatrolPath(x, y),
                patrolIndex: 0,
                gif: this.ninjaGifs[`ninja_gif/gif (${Math.floor(Math.random() * 6) + 8}).gif`]
            };
            
            console.log(`Enemy ${i + 1} created at position (${x}, ${y}) with vision range ${enemy.visionRange}`);
            this.enemies.push(enemy);
        }
        
        console.log(`Total enemies created: ${this.enemies.length}`);
    }
    
    generatePatrolPath(startX, startY) {
        const path = [{ x: startX, y: startY }];
        const pathLength = 3 + Math.floor(Math.random() * 3);
        
        let currentX = startX;
        let currentY = startY;
        
        for (let i = 1; i < pathLength; i++) {
            const directions = [
                { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
            ];
            
            let validMoves = directions.filter(dir => {
                const newX = currentX + dir.x * 2;
                const newY = currentY + dir.y * 2;
                return this.isValidPosition(newX, newY) && this.currentMap[newY][newX] === 'floor';
            });
            
            if (validMoves.length > 0) {
                const move = validMoves[Math.floor(Math.random() * validMoves.length)];
                currentX += move.x * 2;
                currentY += move.y * 2;
                path.push({ x: currentX, y: currentY });
            }
        }
        
        return path;
    }
    
    isNearPlayer(x, y, distance) {
        return Math.abs(x - this.player.x) < distance && Math.abs(y - this.player.y) < distance;
    }
    
    isValidPosition(x, y) {
        return x >= 0 && x < this.GRID_WIDTH && y >= 0 && y < this.GRID_HEIGHT;
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (!this.isPaused && this.gameState === 'playing') {
            this.updateGame(deltaTime);
        }
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updateGame(deltaTime) {
        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateEffects(deltaTime);
        this.updateParticles(deltaTime);
        this.checkCollisions();
        this.checkVision();
        this.checkWinCondition();
        this.updateUI();
    }
    
    updatePlayer(deltaTime) {
        // Update stealth level based on movement
        const now = Date.now();
        const timeSinceLastMove = now - this.player.lastMove;
        
        if (this.player.moving) {
            if (this.player.crouching) {
                this.player.stealthLevel = Math.min(100, this.player.stealthLevel + 0.5);
            } else {
                this.player.stealthLevel = Math.max(0, this.player.stealthLevel - 1);
            }
        } else {
            // Recover stealth when not moving
            this.player.stealthLevel = Math.min(100, this.player.stealthLevel + 0.2);
        }
        
        // Reset moving flag
        this.player.moving = false;
        
        // Update pixel position for smooth movement
        this.player.pixelX = this.player.x * this.TILE_SIZE;
        this.player.pixelY = this.player.y * this.TILE_SIZE;
    }
    
    updateEnemies(deltaTime) {
        const now = Date.now();
        
        this.enemies.forEach(enemy => {
            if (now - enemy.lastMove >= enemy.moveInterval) {
                this.moveEnemy(enemy);
                enemy.lastMove = now;
            }
            
            // Update alert timer
            if (enemy.alertTimer > 0) {
                enemy.alertTimer -= deltaTime;
                if (enemy.alertTimer <= 0) {
                    enemy.state = 'normal';
                }
            }
            
            // Update pixel position
            enemy.pixelX = enemy.x * this.TILE_SIZE;
            enemy.pixelY = enemy.y * this.TILE_SIZE;
        });
    }
    
    moveEnemy(enemy) {
        let newX = enemy.x;
        let newY = enemy.y;
        
        switch (enemy.aiType) {
            case 'patrol':
                const target = enemy.patrolPath[enemy.patrolIndex];
                if (enemy.x === target.x && enemy.y === target.y) {
                    enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolPath.length;
                }
                
                const nextTarget = enemy.patrolPath[enemy.patrolIndex];
                if (nextTarget.x > enemy.x) newX++;
                else if (nextTarget.x < enemy.x) newX--;
                else if (nextTarget.y > enemy.y) newY++;
                else if (nextTarget.y < enemy.y) newY--;
                break;
                
            case 'guard':
                // Look around (change direction)
                if (Math.random() < 0.3) {
                    enemy.direction = (enemy.direction + 1) % 4;
                }
                break;
                
            case 'random':
                const directions = [
                    { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }
                ];
                const randomDir = directions[Math.floor(Math.random() * 4)];
                newX += randomDir.x;
                newY += randomDir.y;
                enemy.direction = directions.indexOf(randomDir);
                break;
        }
        
        // Check if new position is valid
        if (this.isValidPosition(newX, newY) && this.currentMap[newY][newX] === 'floor') {
            enemy.x = newX;
            enemy.y = newY;
        } else if (enemy.aiType === 'patrol') {
            // If patrol enemy hits obstacle, reverse direction
            enemy.patrolIndex = (enemy.patrolIndex + enemy.patrolPath.length - 1) % enemy.patrolPath.length;
        }
    }
    
    updateEffects(deltaTime) {
        this.effects = this.effects.filter(effect => {
            effect.duration -= deltaTime;
            
            // Update specific effect properties
            switch (effect.type) {
                case 'soundWave':
                    if (effect.radius < effect.maxRadius) {
                        effect.radius += (effect.maxRadius / (effect.duration / deltaTime)) * deltaTime / 1000;
                    }
                    break;
                    
                case 'exclamation':
                case 'questionMark':
                    // Bounce animation
                    const progress = 1 - (effect.duration / 3000);
                    effect.bounceHeight = Math.sin(progress * Math.PI * 4) * 5;
                    break;
                    
                case 'detectionLine':
                    // Fade out intensity
                    effect.intensity = effect.duration / 2000;
                    break;
                    
                case 'screenFlash':
                    // Keep intensity constant, let drawing handle fade
                    break;
            }
            
            return effect.duration > 0;
        });
    }
    
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx * deltaTime / 1000;
            particle.y += particle.vy * deltaTime / 1000;
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
        });
    }
    
    checkCollisions() {
        // Check treasure collection
        this.treasures.forEach(treasure => {
            if (!treasure.collected && 
                this.player.x === treasure.x && 
                this.player.y === treasure.y) {
                treasure.collected = true;
                this.treasuresCollected++;
                this.createPickupEffect(treasure.x, treasure.y);
            }
        });
        
        // Check exit
        if (this.player.x === this.exitPosition.x && 
            this.player.y === this.exitPosition.y && 
            this.treasuresCollected === this.totalTreasures) {
            this.exitReached = true;
        }
    }
    
    checkVision() {
        let detected = false;
        let detectedBy = null;
        
        this.enemies.forEach(enemy => {
            if (this.isPlayerInVision(enemy)) {
                // デバッグ用: 検出条件を緩和（必ず検出されるように）
                if (!this.player.hidden) {
                    // Check if this is a new detection
                    if (enemy.state !== 'chasing') {
                        detected = true;
                        detectedBy = enemy;
                        enemy.state = 'chasing';
                        enemy.alertTimer = 8000;
                        enemy.lastDetectionTime = Date.now();
                        console.log('Player detected!', {
                            playerStealth: this.player.stealthLevel,
                            playerHidden: this.player.hidden,
                            enemyPosition: {x: enemy.x, y: enemy.y},
                            playerPosition: {x: this.player.x, y: this.player.y}
                        });
                    }
                }
            }
            
            // Check hearing
            if (this.isPlayerHeard(enemy)) {
                if (!this.player.crouching && this.player.moving && enemy.state === 'normal') {
                    enemy.state = 'alert';
                    enemy.alertTimer = 3000;
                    this.createSoundDetectionEffect(enemy);
                }
            }
        });
        
        if (detected) {
            this.player.detectionCount++;
            this.onPlayerDetected(detectedBy);
            
            // Game over immediately when detected
            setTimeout(() => {
                this.gameOver();
            }, 1500); // Short delay to show detection effects
        }
        
        // Update alert level
        const alertEnemies = this.enemies.filter(e => e.state === 'alert' || e.state === 'chasing').length;
        if (alertEnemies === 0) {
            this.alertLevel = 'normal';
        } else if (alertEnemies <= 2) {
            this.alertLevel = 'alert';
        } else {
            this.alertLevel = 'high';
        }
    }
    
    onPlayerDetected(enemy) {
        // Visual effects
        this.createDetectionEffect();
        this.createDetectionAlert(enemy);
        this.screenFlash();
        
        // Audio feedback (simulated)
        this.playDetectionSound();
        
        // Haptic feedback
        this.addStrongHapticFeedback();
        
        // Temporarily reduce stealth
        this.player.stealthLevel = Math.max(0, this.player.stealthLevel - 30);
        
        // Show detection UI
        this.showDetectionWarning();
    }
    
    createDetectionAlert(enemy) {
        // Create visual alert line from enemy to player
        this.effects.push({
            type: 'detectionLine',
            fromX: enemy.x,
            fromY: enemy.y,
            toX: this.player.x,
            toY: this.player.y,
            duration: 2000,
            intensity: 1.0
        });
        
        // Create exclamation mark over enemy
        this.effects.push({
            type: 'exclamation',
            x: enemy.x,
            y: enemy.y,
            duration: 3000,
            bounceHeight: 0
        });
    }
    
    createSoundDetectionEffect(enemy) {
        // Create sound wave effect
        this.effects.push({
            type: 'soundWave',
            x: this.player.x,
            y: this.player.y,
            radius: 0,
            maxRadius: 3,
            duration: 1500
        });
        
        // Create question mark over enemy
        this.effects.push({
            type: 'questionMark',
            x: enemy.x,
            y: enemy.y,
            duration: 2000,
            bounceHeight: 0
        });
    }
    
    screenFlash() {
        // Create screen flash effect
        this.effects.push({
            type: 'screenFlash',
            duration: 300,
            intensity: 0.8,
            color: 'rgba(255, 107, 107, 0.6)'
        });
    }
    
    playDetectionSound() {
        // Audio context for detection sound (simple beep simulation)
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            } catch (e) {
                console.log('Audio not supported');
            }
        }
    }
    
    addStrongHapticFeedback() {
        // Stronger haptic feedback for detection
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]); // Pattern vibration
        }
    }
    
    showDetectionWarning() {
        // Create temporary warning message
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 107, 107, 0.95);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 200;
            font-weight: bold;
            font-size: 1.2rem;
            text-align: center;
            border: 2px solid #FF0000;
            box-shadow: 0 0 20px rgba(255, 107, 107, 0.8);
            animation: detectionPulse 0.5s ease-in-out;
        `;
        warning.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 5px;">💀</div>
            <div>発見された！</div>
            <div style="font-size: 0.9rem; margin-top: 5px;">ミッション失敗...</div>
        `;
        
        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes detectionPulse {
                0% { transform: translateX(-50%) scale(0.8); opacity: 0; }
                50% { transform: translateX(-50%) scale(1.1); opacity: 1; }
                100% { transform: translateX(-50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(warning);
        
        setTimeout(() => {
            if (warning.parentNode) {
                warning.style.animation = 'detectionPulse 0.3s ease-in-out reverse';
                setTimeout(() => {
                    if (warning.parentNode) {
                        warning.parentNode.removeChild(warning);
                    }
                }, 300);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 2500);
    }
    
    isPlayerInVision(enemy) {
        const dx = this.player.x - enemy.x;
        const dy = this.player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // デバッグ用: 視界範囲を拡大
        if (distance > 5) return false; // 視界範囲を5タイルに拡大
        
        // デバッグ用: 360度視界（方向制限を無効化）
        console.log('Enemy vision check:', {
            enemyPos: {x: enemy.x, y: enemy.y},
            playerPos: {x: this.player.x, y: this.player.y},
            distance: distance,
            visionRange: enemy.visionRange
        });
        
        return true; // 簡単にテストするため、距離内なら必ず見える
    }
    
    isPlayerHeard(enemy) {
        const distance = Math.abs(this.player.x - enemy.x) + Math.abs(this.player.y - enemy.y);
        return distance <= enemy.hearingRange;
    }
    
    checkWinCondition() {
        if (this.exitReached) {
            this.stageCleared();
        }
    }
    
    movePlayer(dx, dy) {
        if (this.gameState !== 'playing' || this.isPaused) return;
        
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        if (this.isValidPosition(newX, newY) && this.currentMap[newY][newX] === 'floor') {
            this.player.x = newX;
            this.player.y = newY;
            this.player.moving = true;
            this.player.lastMove = Date.now();
            this.player.hidden = false; // Moving breaks hiding
        }
    }
    
    toggleCrouch() {
        this.player.crouching = !this.player.crouching;
    }
    
    toggleHide() {
        // Can only hide behind obstacles
        const hideSpots = [
            { x: this.player.x - 1, y: this.player.y },
            { x: this.player.x + 1, y: this.player.y },
            { x: this.player.x, y: this.player.y - 1 },
            { x: this.player.x, y: this.player.y + 1 }
        ];
        
        const canHide = hideSpots.some(spot => {
            if (this.isValidPosition(spot.x, spot.y)) {
                const tile = this.currentMap[spot.y][spot.x];
                return tile === 'wall' || tile === 'box' || tile === 'bush' || tile === 'pillar';
            }
            return false;
        });
        
        if (canHide) {
            this.player.hidden = !this.player.hidden;
        }
    }
    
    setNormalMovement() {
        this.player.crouching = false;
        this.player.hidden = false;
    }
    
    useAbility(abilityName) {
        const ability = this.abilities[abilityName];
        
        if (ability.count > 0 && ability.cooldown <= 0) {
            ability.count--;
            ability.cooldown = 10000; // 10 second cooldown
            
            switch (abilityName) {
                case 'smokeBomb':
                    this.createSmokeEffect();
                    break;
                case 'clone':
                    this.createCloneEffect();
                    break;
                case 'invisibility':
                    this.activateInvisibility();
                    break;
            }
        }
    }
    
    createSmokeEffect() {
        this.effects.push({
            type: 'smoke',
            x: this.player.x,
            y: this.player.y,
            duration: this.abilities.smokeBomb.duration,
            radius: 3
        });
        
        // Create smoke particles
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.player.pixelX + Math.random() * this.TILE_SIZE,
                y: this.player.pixelY + Math.random() * this.TILE_SIZE,
                vx: (Math.random() - 0.5) * 50,
                vy: (Math.random() - 0.5) * 50,
                size: Math.random() * 10 + 5,
                color: 'rgba(100, 100, 100, 0.7)',
                life: 3000,
                maxLife: 3000,
                alpha: 0.7
            });
        }
    }
    
    createCloneEffect() {
        this.effects.push({
            type: 'clone',
            x: this.player.x + (Math.random() < 0.5 ? -2 : 2),
            y: this.player.y + (Math.random() < 0.5 ? -2 : 2),
            duration: this.abilities.clone.duration
        });
    }
    
    activateInvisibility() {
        this.effects.push({
            type: 'invisibility',
            duration: this.abilities.invisibility.duration
        });
        
        this.player.stealthLevel = 100;
    }
    
    createPickupEffect(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x * this.TILE_SIZE + Math.random() * this.TILE_SIZE,
                y: y * this.TILE_SIZE + Math.random() * this.TILE_SIZE,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100 - 50,
                size: Math.random() * 5 + 3,
                color: 'rgba(255, 215, 0, 1)',
                life: 1500,
                maxLife: 1500,
                alpha: 1
            });
        }
    }
    
    createDetectionEffect() {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.player.pixelX + Math.random() * this.TILE_SIZE,
                y: this.player.pixelY + Math.random() * this.TILE_SIZE,
                vx: (Math.random() - 0.5) * 80,
                vy: (Math.random() - 0.5) * 80,
                size: Math.random() * 8 + 4,
                color: 'rgba(255, 107, 107, 1)',
                life: 2000,
                maxLife: 2000,
                alpha: 1
            });
        }
    }
    
    render() {
        this.clearCanvas();
        this.drawMap();
        this.drawTreasures();
        this.drawEnemies();
        this.drawPlayer();
        this.drawEffects();
        this.drawParticles();
        this.drawUI();
        this.updateMinimap();
    }
    
    clearCanvas() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawMap() {
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                const tile = this.currentMap[y][x];
                this.drawTile(x, y, tile);
            }
        }
        
        // Draw exit
        this.drawTile(this.exitPosition.x, this.exitPosition.y, 'exit');
    }
    
    drawTile(x, y, type) {
        const pixelX = x * this.TILE_SIZE;
        const pixelY = y * this.TILE_SIZE;
        
        switch (type) {
            case 'floor':
                this.ctx.fillStyle = '#1a1a2e';
                this.ctx.fillRect(pixelX, pixelY, this.TILE_SIZE, this.TILE_SIZE);
                break;
            case 'wall':
                this.ctx.fillStyle = '#2F4F4F';
                this.ctx.fillRect(pixelX, pixelY, this.TILE_SIZE, this.TILE_SIZE);
                this.ctx.strokeStyle = '#4682B4';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(pixelX, pixelY, this.TILE_SIZE, this.TILE_SIZE);
                break;
            case 'box':
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(pixelX + 2, pixelY + 2, this.TILE_SIZE - 4, this.TILE_SIZE - 4);
                this.ctx.strokeStyle = '#A0522D';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(pixelX + 2, pixelY + 2, this.TILE_SIZE - 4, this.TILE_SIZE - 4);
                break;
            case 'bush':
                this.ctx.fillStyle = '#228B22';
                this.ctx.beginPath();
                this.ctx.arc(pixelX + this.TILE_SIZE/2, pixelY + this.TILE_SIZE/2, this.TILE_SIZE/3, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'pillar':
                this.ctx.fillStyle = '#696969';
                this.ctx.beginPath();
                this.ctx.arc(pixelX + this.TILE_SIZE/2, pixelY + this.TILE_SIZE/2, this.TILE_SIZE/2.5, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            case 'exit':
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(pixelX + 4, pixelY + 4, this.TILE_SIZE - 8, this.TILE_SIZE - 8);
                this.ctx.fillStyle = '#FFA500';
                this.ctx.font = `${this.TILE_SIZE * 0.7}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText('🚪', pixelX + this.TILE_SIZE/2, pixelY + this.TILE_SIZE * 0.75);
                break;
        }
    }
    
    drawTreasures() {
        this.treasures.forEach(treasure => {
            if (!treasure.collected) {
                const pixelX = treasure.x * this.TILE_SIZE;
                const pixelY = treasure.y * this.TILE_SIZE;
                
                this.ctx.font = `${this.TILE_SIZE * 0.8}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(treasure.type, pixelX + this.TILE_SIZE/2, pixelY + this.TILE_SIZE * 0.75);
                
                // Add glow effect
                this.ctx.shadowColor = '#FFD700';
                this.ctx.shadowBlur = 10;
                this.ctx.fillText(treasure.type, pixelX + this.TILE_SIZE/2, pixelY + this.TILE_SIZE * 0.75);
                this.ctx.shadowBlur = 0;
            }
        });
    }
    
    drawEnemies() {
        this.enemies.forEach(enemy => {
            const pixelX = enemy.pixelX;
            const pixelY = enemy.pixelY;
            
            // Draw enemy with state-based coloring
            this.ctx.save();
            
            if (enemy.state === 'chasing') {
                // Red tint for chasing enemies
                this.ctx.filter = 'hue-rotate(0deg) saturate(150%) brightness(120%)';
            } else if (enemy.state === 'alert') {
                // Yellow tint for alert enemies
                this.ctx.filter = 'hue-rotate(45deg) saturate(120%) brightness(110%)';
            }
            
            if (enemy.gif && enemy.gif.complete) {
                this.ctx.drawImage(enemy.gif, pixelX, pixelY, this.TILE_SIZE, this.TILE_SIZE);
            } else {
                let color = '#87CEEB';
                if (enemy.state === 'chasing') color = '#FF6B6B';
                else if (enemy.state === 'alert') color = '#FFD700';
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(pixelX + 2, pixelY + 2, this.TILE_SIZE - 4, this.TILE_SIZE - 4);
            }
            
            this.ctx.restore();
            
            // Draw vision cone
            this.drawVisionCone(enemy);
            
            // Draw state indicators
            if (enemy.state === 'chasing') {
                this.ctx.fillStyle = '#FF6B6B';
                this.ctx.font = `bold ${this.TILE_SIZE * 0.6}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText('!', pixelX + this.TILE_SIZE/2, pixelY - 8);
                
                // Add pulsing glow effect
                this.ctx.shadowColor = '#FF6B6B';
                this.ctx.shadowBlur = 15;
                this.ctx.fillText('!', pixelX + this.TILE_SIZE/2, pixelY - 8);
                this.ctx.shadowBlur = 0;
                
            } else if (enemy.state === 'alert') {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.font = `${this.TILE_SIZE * 0.5}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText('?', pixelX + this.TILE_SIZE/2, pixelY - 5);
            }
        });
    }
    
    drawVisionCone(enemy) {
        const centerX = enemy.pixelX + this.TILE_SIZE / 2;
        const centerY = enemy.pixelY + this.TILE_SIZE / 2;
        const range = enemy.visionRange * this.TILE_SIZE;
        
        // Direction vectors
        const directions = [
            { x: 0, y: -1 }, // North
            { x: 1, y: 0 },  // East
            { x: 0, y: 1 },  // South
            { x: -1, y: 0 }  // West
        ];
        
        const dir = directions[enemy.direction];
        const angle = Math.atan2(dir.y, dir.x);
        const coneAngle = Math.PI / 3; // 60 degrees each side
        
        this.ctx.save();
        
        // Different opacity and color based on enemy state
        let alpha = 0.15;
        let color = '#FFD700';
        
        if (enemy.state === 'chasing') {
            alpha = 0.35;
            color = '#FF6B6B';
        } else if (enemy.state === 'alert') {
            alpha = 0.25;
            color = '#FFA500';
        }
        
        this.ctx.globalAlpha = alpha;
        this.ctx.fillStyle = color;
        
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.arc(centerX, centerY, range, angle - coneAngle, angle + coneAngle);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add border for better visibility
        this.ctx.globalAlpha = alpha * 2;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawPlayer() {
        const pixelX = this.player.pixelX;
        const pixelY = this.player.pixelY;
        
        // Check if invisible
        const isInvisible = this.effects.some(effect => effect.type === 'invisibility');
        
        this.ctx.save();
        
        if (isInvisible) {
            this.ctx.globalAlpha = 0.3;
        } else if (this.player.hidden) {
            this.ctx.globalAlpha = 0.6;
        }
        
        if (this.player.gif && this.player.gif.complete) {
            this.ctx.drawImage(this.player.gif, pixelX, pixelY, this.TILE_SIZE, this.TILE_SIZE);
        } else {
            this.ctx.fillStyle = this.player.crouching ? '#4682B4' : '#87CEEB';
            this.ctx.fillRect(pixelX + 2, pixelY + 2, this.TILE_SIZE - 4, this.TILE_SIZE - 4);
        }
        
        // Draw status indicators
        if (this.player.crouching) {
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.font = `${this.TILE_SIZE * 0.4}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🤫', pixelX + this.TILE_SIZE/2, pixelY - 2);
        }
        
        if (this.player.hidden) {
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.font = `${this.TILE_SIZE * 0.4}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🫥', pixelX + this.TILE_SIZE/2, pixelY + this.TILE_SIZE + 10);
        }
        
        this.ctx.restore();
    }
    
    drawEffects() {
        this.effects.forEach(effect => {
            switch (effect.type) {
                case 'smoke':
                    this.ctx.save();
                    this.ctx.globalAlpha = 0.7;
                    this.ctx.fillStyle = '#808080';
                    this.ctx.beginPath();
                    this.ctx.arc(
                        effect.x * this.TILE_SIZE + this.TILE_SIZE/2,
                        effect.y * this.TILE_SIZE + this.TILE_SIZE/2,
                        effect.radius * this.TILE_SIZE,
                        0, Math.PI * 2
                    );
                    this.ctx.fill();
                    this.ctx.restore();
                    break;
                    
                case 'clone':
                    this.ctx.save();
                    this.ctx.globalAlpha = 0.5;
                    if (this.player.gif && this.player.gif.complete) {
                        this.ctx.drawImage(
                            this.player.gif,
                            effect.x * this.TILE_SIZE,
                            effect.y * this.TILE_SIZE,
                            this.TILE_SIZE,
                            this.TILE_SIZE
                        );
                    } else {
                        this.ctx.fillStyle = '#87CEEB';
                        this.ctx.fillRect(
                            effect.x * this.TILE_SIZE + 2,
                            effect.y * this.TILE_SIZE + 2,
                            this.TILE_SIZE - 4,
                            this.TILE_SIZE - 4
                        );
                    }
                    this.ctx.restore();
                    break;
                    
                case 'detectionLine':
                    this.ctx.save();
                    this.ctx.globalAlpha = effect.intensity;
                    this.ctx.strokeStyle = '#FF6B6B';
                    this.ctx.lineWidth = 3;
                    this.ctx.setLineDash([5, 5]);
                    this.ctx.beginPath();
                    this.ctx.moveTo(
                        effect.fromX * this.TILE_SIZE + this.TILE_SIZE/2,
                        effect.fromY * this.TILE_SIZE + this.TILE_SIZE/2
                    );
                    this.ctx.lineTo(
                        effect.toX * this.TILE_SIZE + this.TILE_SIZE/2,
                        effect.toY * this.TILE_SIZE + this.TILE_SIZE/2
                    );
                    this.ctx.stroke();
                    this.ctx.restore();
                    break;
                    
                case 'exclamation':
                    this.ctx.save();
                    const exclamationY = effect.y * this.TILE_SIZE - 15 + effect.bounceHeight;
                    this.ctx.fillStyle = '#FF6B6B';
                    this.ctx.font = `bold ${this.TILE_SIZE * 0.8}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(
                        '!',
                        effect.x * this.TILE_SIZE + this.TILE_SIZE/2,
                        exclamationY
                    );
                    // Add glow effect
                    this.ctx.shadowColor = '#FF6B6B';
                    this.ctx.shadowBlur = 10;
                    this.ctx.fillText(
                        '!',
                        effect.x * this.TILE_SIZE + this.TILE_SIZE/2,
                        exclamationY
                    );
                    this.ctx.restore();
                    break;
                    
                case 'questionMark':
                    this.ctx.save();
                    const questionY = effect.y * this.TILE_SIZE - 15 + effect.bounceHeight;
                    this.ctx.fillStyle = '#FFD700';
                    this.ctx.font = `bold ${this.TILE_SIZE * 0.7}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(
                        '?',
                        effect.x * this.TILE_SIZE + this.TILE_SIZE/2,
                        questionY
                    );
                    this.ctx.restore();
                    break;
                    
                case 'soundWave':
                    this.ctx.save();
                    this.ctx.globalAlpha = 0.5;
                    this.ctx.strokeStyle = '#87CEEB';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(
                        effect.x * this.TILE_SIZE + this.TILE_SIZE/2,
                        effect.y * this.TILE_SIZE + this.TILE_SIZE/2,
                        effect.radius * this.TILE_SIZE,
                        0, Math.PI * 2
                    );
                    this.ctx.stroke();
                    this.ctx.restore();
                    break;
                    
                case 'screenFlash':
                    this.ctx.save();
                    this.ctx.globalAlpha = effect.intensity * (effect.duration / 300);
                    this.ctx.fillStyle = effect.color;
                    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                    this.ctx.restore();
                    break;
            }
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    drawUI() {
        // Draw grid overlay for development
        if (false) { // Set to true for debugging
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            
            for (let x = 0; x <= this.GRID_WIDTH; x++) {
                this.ctx.beginPath();
                this.ctx.moveTo(x * this.TILE_SIZE, 0);
                this.ctx.lineTo(x * this.TILE_SIZE, this.canvas.height);
                this.ctx.stroke();
            }
            
            for (let y = 0; y <= this.GRID_HEIGHT; y++) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y * this.TILE_SIZE);
                this.ctx.lineTo(this.canvas.width, y * this.TILE_SIZE);
                this.ctx.stroke();
            }
        }
    }
    
    updateMinimap() {
        const ctx = this.minimapCtx;
        const scale = 6; // Each grid cell is 6x6 pixels on minimap
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);
        
        // Draw map
        for (let y = 0; y < this.GRID_HEIGHT; y++) {
            for (let x = 0; x < this.GRID_WIDTH; x++) {
                const tile = this.currentMap[y][x];
                const pixelX = x * scale;
                const pixelY = y * scale;
                
                switch (tile) {
                    case 'wall':
                        ctx.fillStyle = '#4682B4';
                        ctx.fillRect(pixelX, pixelY, scale, scale);
                        break;
                    case 'box':
                    case 'bush':
                    case 'pillar':
                        ctx.fillStyle = '#8B4513';
                        ctx.fillRect(pixelX, pixelY, scale, scale);
                        break;
                }
            }
        }
        
        // Draw exit
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.exitPosition.x * scale, this.exitPosition.y * scale, scale, scale);
        
        // Draw treasures
        this.treasures.forEach(treasure => {
            if (!treasure.collected) {
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(treasure.x * scale + 1, treasure.y * scale + 1, scale - 2, scale - 2);
            }
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            ctx.fillStyle = enemy.state === 'alert' ? '#FF6B6B' : '#87CEEB';
            ctx.fillRect(enemy.x * scale + 1, enemy.y * scale + 1, scale - 2, scale - 2);
        });
        
        // Draw player
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.player.x * scale + 1, this.player.y * scale + 1, scale - 2, scale - 2);
    }
    
    updateUI() {
        // Mission status
        this.elements.currentStage.textContent = this.currentStage;
        this.elements.treasuresCollected.textContent = this.treasuresCollected;
        this.elements.totalTreasures.textContent = this.totalTreasures;
        
        // Update mission status
        let status = '潜入中';
        if (this.treasuresCollected === this.totalTreasures) {
            status = '脱出準備';
        } else if (this.alertLevel === 'high') {
            status = '厳戒態勢';
        } else if (this.alertLevel === 'alert') {
            status = '警戒中';
        }
        this.elements.missionStatus.textContent = status;
        
        // Ninja status
        this.elements.stealthBar.style.width = `${this.player.stealthLevel}%`;
        this.elements.stealthValue.textContent = `${Math.round(this.player.stealthLevel)}%`;
        
        let state = '隠密中';
        if (this.player.hidden) state = '隠れ中';
        else if (this.player.crouching) state = 'しゃがみ';
        else if (this.player.moving) state = '移動中';
        this.elements.ninjaState.textContent = state;
        
        this.elements.movementMode.textContent = this.player.crouching ? 'しゃがみ' : '通常';
        
        // Abilities
        this.elements.smokeBombCount.textContent = this.abilities.smokeBomb.count;
        this.elements.cloneCount.textContent = this.abilities.clone.count;
        this.elements.invisibilityCount.textContent = this.abilities.invisibility.count;
        
        // Enemy status
        const alertLevelText = { normal: '平常', alert: '警戒', high: '厳戒' };
        this.elements.alertLevel.textContent = alertLevelText[this.alertLevel];
        this.elements.alertLevel.className = `alert-value ${this.alertLevel}`;
        this.elements.enemyCount.textContent = this.enemies.length;
        
        // Update stage progress
        document.querySelectorAll('.stage-item').forEach((item, index) => {
            const stage = index + 1;
            item.classList.remove('current');
            if (stage === this.currentStage) {
                item.classList.add('current');
            }
        });
    }
    
    stageCleared() {
        this.gameState = 'stageCleared';
        this.gameRunning = false;
        
        const clearTime = Date.now() - this.stageStartTime;
        const rank = this.calculateRank();
        
        this.elements.clearRank.textContent = rank;
        this.elements.clearDetections.textContent = this.player.detectionCount;
        this.elements.clearTime.textContent = this.formatTime(clearTime);
        
        this.showStageClear();
        this.saveProgress();
    }
    
    calculateRank() {
        if (this.player.detectionCount === 0) return 'S';
        if (this.player.detectionCount === 1) return 'A';
        if (this.player.detectionCount === 2) return 'B';
        return 'C';
    }
    
    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.gameRunning = false;
        
        const gameTime = Date.now() - this.stageStartTime;
        
        this.elements.gameOverTitle.textContent = '🥷 ミッション失敗';
        this.elements.finalStage.textContent = this.currentStage;
        this.elements.finalTreasures.textContent = this.treasuresCollected;
        this.elements.finalRank.textContent = 'F';
        this.elements.finalTime.textContent = this.formatTime(gameTime);
        
        this.showGameOver();
    }
    
    nextStage() {
        if (this.currentStage < this.maxStage) {
            this.currentStage++;
            this.hideStageClear();
            this.startStage(this.currentStage);
        } else {
            // Game completed
            this.elements.gameOverTitle.textContent = '🎉 全ミッション完了！';
            this.hideStageClear();
            this.showGameOver();
        }
    }
    
    restartStage() {
        this.hideGameOver();
        this.hideStageClear();
        this.startStage(this.currentStage);
    }
    
    togglePause() {
        if (this.gameState !== 'playing') return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.showPause();
        } else {
            this.hidePause();
        }
    }
    
    showStartScreen() {
        this.gameState = 'start';
        this.gameRunning = false;
        this.elements.startScreen.style.display = 'flex';
        this.hideGameOver();
        this.hidePause();
        this.hideStageClear();
        this.updateStageButtons();
    }
    
    hideStartScreen() {
        this.elements.startScreen.style.display = 'none';
    }
    
    showGameOver() {
        this.elements.gameOverOverlay.style.display = 'flex';
    }
    
    hideGameOver() {
        this.elements.gameOverOverlay.style.display = 'none';
    }
    
    showPause() {
        this.elements.pauseOverlay.style.display = 'flex';
    }
    
    hidePause() {
        this.elements.pauseOverlay.style.display = 'none';
    }
    
    showStageClear() {
        this.elements.stageClearOverlay.style.display = 'flex';
    }
    
    hideStageClear() {
        this.elements.stageClearOverlay.style.display = 'none';
    }
    
    showHelp() {
        this.elements.helpModal.classList.add('show');
    }
    
    hideHelp() {
        this.elements.helpModal.classList.remove('show');
    }
    
    updateStageButtons() {
        const savedProgress = this.loadProgress();
        document.querySelectorAll('.stage-btn').forEach((btn, index) => {
            const stage = index + 1;
            if (stage <= savedProgress.maxUnlockedStage) {
                btn.classList.remove('locked');
                btn.classList.add('unlocked');
            } else {
                btn.classList.add('locked');
                btn.classList.remove('unlocked');
            }
        });
    }
    
    saveProgress() {
        const progress = this.loadProgress();
        
        if (this.currentStage >= progress.maxUnlockedStage) {
            progress.maxUnlockedStage = Math.min(this.currentStage + 1, this.maxStage);
        }
        
        progress.stageStats[this.currentStage] = {
            completed: true,
            bestRank: this.calculateRank(),
            bestTime: Date.now() - this.stageStartTime,
            detections: this.player.detectionCount
        };
        
        localStorage.setItem('ninjaStealth_progress', JSON.stringify(progress));
    }
    
    loadProgress() {
        const defaultProgress = {
            maxUnlockedStage: 1,
            stageStats: {}
        };
        
        const saved = localStorage.getItem('ninjaStealth_progress');
        return saved ? { ...defaultProgress, ...JSON.parse(saved) } : defaultProgress;
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new NinjaStealth();
});