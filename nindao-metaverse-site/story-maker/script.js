class NinjaStoryMaker {
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

        this.currentStory = {
            id: null,
            title: '',
            scenes: [],
            created: null,
            updated: null
        };

        this.selectedSceneIndex = -1;
        this.previewIndex = 0;
        this.isAutoPlaying = false;
        this.autoPlayInterval = null;
        
        // Mobile touch support
        this.isDragging = false;
        this.dragData = null;
        this.touchStartPos = null;

        this.templates = {
            training: {
                title: '忍者の修行',
                scenes: [
                    { gif: 'ninja_gif/gif.gif', text: '修行を始める若い忍者' },
                    { gif: 'ninja_gif/gif (1).gif', text: '基本的な型を練習する' },
                    { gif: 'ninja_gif/gif (2).gif', text: '困難な課題に挑戦' },
                    { gif: 'ninja_gif/gif (3).gif', text: 'ついに技を習得した！' }
                ]
            },
            mission: {
                title: '忍者の任務',
                scenes: [
                    { gif: 'ninja_gif/gif (4).gif', text: '秘密の任務を受ける' },
                    { gif: 'ninja_gif/gif (5).gif', text: '敵の城に潜入開始' },
                    { gif: 'ninja_gif/gif (6).gif', text: '激しい戦いが始まる' },
                    { gif: 'ninja_gif/gif (7).gif', text: '任務を見事に完了' }
                ]
            },
            daily: {
                title: '忍者の日常',
                scenes: [
                    { gif: 'ninja_gif/gif (8).gif', text: '朝の瞑想から一日が始まる' },
                    { gif: 'ninja_gif/gif (9).gif', text: '日中は様々な訓練' },
                    { gif: 'ninja_gif/gif (10).gif', text: '仲間との交流も大切' },
                    { gif: 'ninja_gif/gif (11).gif', text: '夜は静かに一日を振り返る' }
                ]
            }
        };

        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadGifLibrary();
        this.loadSavedStories();
        this.updateUI();
    }

    setupElements() {
        this.elements = {
            // Header controls
            newStoryBtn: document.getElementById('newStoryBtn'),
            loadStoryBtn: document.getElementById('loadStoryBtn'),
            saveStoryBtn: document.getElementById('saveStoryBtn'),
            
            // Story info
            storyTitle: document.getElementById('storyTitle'),
            sceneCount: document.getElementById('sceneCount'),
            textCount: document.getElementById('textCount'),
            
            // GIF library
            gifLibrary: document.getElementById('gifLibrary'),
            
            // Storyboard
            storyboard: document.getElementById('storyboard'),
            
            // Text editor
            textEditor: document.getElementById('textEditor'),
            selectedGif: document.getElementById('selectedGif'),
            sceneNumber: document.getElementById('sceneNumber'),
            sceneText: document.getElementById('sceneText'),
            currentTextLength: document.getElementById('currentTextLength'),
            
            // Controls
            previewBtn: document.getElementById('previewBtn'),
            exportBtn: document.getElementById('exportBtn'),
            clearBtn: document.getElementById('clearBtn'),
            
            // Templates
            templateBtns: document.querySelectorAll('.template-btn'),
            
            // Modals
            previewModal: document.getElementById('previewModal'),
            closePreview: document.getElementById('closePreview'),
            previewGif: document.getElementById('previewGif'),
            previewText: document.getElementById('previewText'),
            sceneIndicator: document.getElementById('sceneIndicator'),
            prevScene: document.getElementById('prevScene'),
            nextScene: document.getElementById('nextScene'),
            autoPlayBtn: document.getElementById('autoPlayBtn'),
            playSpeed: document.getElementById('playSpeed'),
            
            loadModal: document.getElementById('loadModal'),
            closeLoad: document.getElementById('closeLoad'),
            storyList: document.getElementById('storyList'),
            
            // Help modal
            helpBtn: document.getElementById('helpBtn'),
            helpModal: document.getElementById('helpModal'),
            closeHelp: document.getElementById('closeHelp'),
            
            // Saved stories
            savedStories: document.getElementById('savedStories'),
            
            // Notification
            notification: document.getElementById('notification'),
            notificationText: document.getElementById('notificationText')
        };
    }

    setupEventListeners() {
        // Header controls
        this.elements.newStoryBtn.addEventListener('click', () => this.newStory());
        this.elements.loadStoryBtn.addEventListener('click', () => this.showLoadModal());
        this.elements.saveStoryBtn.addEventListener('click', () => this.saveStory());
        
        // Story title
        this.elements.storyTitle.addEventListener('input', (e) => {
            this.currentStory.title = e.target.value;
            this.updateUI();
        });
        
        // Text editor
        this.elements.sceneText.addEventListener('input', (e) => {
            if (this.selectedSceneIndex >= 0) {
                this.currentStory.scenes[this.selectedSceneIndex].text = e.target.value;
                this.updateSceneText();
                this.updateUI();
            }
        });
        
        // Controls
        this.elements.previewBtn.addEventListener('click', () => this.showPreview());
        this.elements.exportBtn.addEventListener('click', () => this.exportStory());
        this.elements.clearBtn.addEventListener('click', () => this.clearStory());
        
        // Templates
        this.elements.templateBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateKey = e.target.dataset.template;
                this.loadTemplate(templateKey);
            });
        });
        
        // Preview modal
        this.elements.closePreview.addEventListener('click', () => this.hidePreview());
        this.elements.prevScene.addEventListener('click', () => this.prevPreviewScene());
        this.elements.nextScene.addEventListener('click', () => this.nextPreviewScene());
        this.elements.autoPlayBtn.addEventListener('click', () => this.toggleAutoPlay());
        
        // Load modal
        this.elements.closeLoad.addEventListener('click', () => this.hideLoadModal());
        
        // Help modal
        this.elements.helpBtn.addEventListener('click', () => this.showHelpModal());
        this.elements.closeHelp.addEventListener('click', () => this.hideHelpModal());
        
        // Storyboard drag and drop
        this.elements.storyboard.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.elements.storyboard.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveStory();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.newStory();
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.hidePreview();
                this.hideLoadModal();
                this.hideHelpModal();
            }
        });
    }

    loadGifLibrary() {
        this.elements.gifLibrary.innerHTML = '';
        
        this.gifFiles.forEach((gifPath, index) => {
            const img = document.createElement('img');
            img.src = gifPath;
            img.className = 'gif-item';
            img.draggable = true;
            img.alt = `Ninja GIF ${index + 1}`;
            img.dataset.gifPath = gifPath;
            
            // Drag events
            img.addEventListener('dragstart', (e) => this.handleDragStart(e));
            img.addEventListener('dragend', (e) => this.handleDragEnd(e));
            
            // Touch events for mobile
            img.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            img.addEventListener('touchmove', (e) => this.handleTouchMove(e));
            img.addEventListener('touchend', (e) => this.handleTouchEnd(e));
            
            // Click event for mobile as fallback
            img.addEventListener('click', (e) => this.handleMobileClick(e));
            
            this.elements.gifLibrary.appendChild(img);
        });
    }

    handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.gifPath);
        e.target.classList.add('dragging');
        
        // Add touch support
        if (e.type === 'touchstart') {
            e.preventDefault();
            this.isDragging = true;
            this.dragData = e.target.dataset.gifPath;
        }
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        this.elements.storyboard.classList.add('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.elements.storyboard.classList.remove('drag-over');
        
        const gifPath = e.dataTransfer.getData('text/plain');
        if (gifPath) {
            this.addScene(gifPath);
        }
    }

    addScene(gifPath, text = '') {
        if (this.currentStory.scenes.length >= 20) {
            this.showNotification('最大20シーンまでしか作成できません', 'warning');
            return;
        }

        const scene = {
            id: Date.now(),
            gif: gifPath,
            text: text
        };

        this.currentStory.scenes.push(scene);
        this.renderStoryboard();
        this.updateUI();
        this.showNotification('シーンを追加しました', 'success');
    }

    removeScene(index) {
        this.currentStory.scenes.splice(index, 1);
        if (this.selectedSceneIndex >= this.currentStory.scenes.length) {
            this.selectedSceneIndex = -1;
            this.hideTextEditor();
        }
        this.renderStoryboard();
        this.updateUI();
        this.showNotification('シーンを削除しました', 'success');
    }

    selectScene(index) {
        this.selectedSceneIndex = index;
        this.showTextEditor();
        this.updateSceneSelection();
    }

    showTextEditor() {
        if (this.selectedSceneIndex >= 0 && this.selectedSceneIndex < this.currentStory.scenes.length) {
            const scene = this.currentStory.scenes[this.selectedSceneIndex];
            this.elements.textEditor.style.display = 'block';
            this.elements.selectedGif.src = scene.gif;
            this.elements.sceneNumber.textContent = `シーン #${this.selectedSceneIndex + 1}`;
            this.elements.sceneText.value = scene.text || '';
            this.updateTextCounter();
        }
    }

    hideTextEditor() {
        this.elements.textEditor.style.display = 'none';
    }

    updateSceneText() {
        this.updateTextCounter();
        this.renderStoryboard();
    }

    updateTextCounter() {
        const length = this.elements.sceneText.value.length;
        this.elements.currentTextLength.textContent = length;
        this.elements.currentTextLength.style.color = length > 80 ? '#ff6b6b' : '#4ecdc4';
    }

    renderStoryboard() {
        const storyboard = this.elements.storyboard;
        storyboard.innerHTML = '';

        if (this.currentStory.scenes.length === 0) {
            storyboard.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📜</div>
                    <p>左のライブラリからGIFをドラッグして<br>物語を作り始めよう！</p>
                </div>
            `;
            return;
        }

        this.currentStory.scenes.forEach((scene, index) => {
            const sceneCard = document.createElement('div');
            sceneCard.className = 'scene-card';
            if (index === this.selectedSceneIndex) {
                sceneCard.classList.add('selected');
            }

            sceneCard.innerHTML = `
                <div class="scene-number">${index + 1}</div>
                <img src="${scene.gif}" alt="Scene ${index + 1}" class="scene-gif">
                <div class="scene-text">${scene.text || 'テキストなし'}</div>
                <button class="delete-scene" onclick="storyMaker.removeScene(${index})">×</button>
            `;

            sceneCard.addEventListener('click', () => this.selectScene(index));
            storyboard.appendChild(sceneCard);
        });

        // Add drop zone
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.innerHTML = '📁<br>ここにGIFを<br>ドロップ';
        storyboard.appendChild(dropZone);
    }

    updateSceneSelection() {
        const sceneCards = document.querySelectorAll('.scene-card');
        sceneCards.forEach((card, index) => {
            card.classList.toggle('selected', index === this.selectedSceneIndex);
        });
    }

    updateUI() {
        // Scene count
        this.elements.sceneCount.textContent = this.currentStory.scenes.length;
        
        // Text count
        const totalText = this.currentStory.scenes.reduce((total, scene) => total + (scene.text || '').length, 0);
        this.elements.textCount.textContent = totalText;
        
        // Enable/disable buttons
        this.elements.previewBtn.disabled = this.currentStory.scenes.length === 0;
        this.elements.exportBtn.disabled = this.currentStory.scenes.length === 0;
        this.elements.saveStoryBtn.disabled = this.currentStory.scenes.length === 0 || !this.currentStory.title.trim();
    }

    newStory() {
        if (this.currentStory.scenes.length > 0) {
            if (!confirm('現在の物語は失われます。新しい物語を作成しますか？')) {
                return;
            }
        }

        this.currentStory = {
            id: null,
            title: '',
            scenes: [],
            created: null,
            updated: null
        };

        this.selectedSceneIndex = -1;
        this.elements.storyTitle.value = '';
        this.hideTextEditor();
        this.renderStoryboard();
        this.updateUI();
        this.showNotification('新しい物語を開始しました', 'success');
    }

    saveStory() {
        if (!this.currentStory.title.trim()) {
            this.showNotification('物語のタイトルを入力してください', 'warning');
            this.elements.storyTitle.focus();
            return;
        }

        if (this.currentStory.scenes.length === 0) {
            this.showNotification('少なくとも1つのシーンを追加してください', 'warning');
            return;
        }

        const now = new Date().toISOString();
        
        if (!this.currentStory.id) {
            this.currentStory.id = 'story_' + Date.now();
            this.currentStory.created = now;
        }
        
        this.currentStory.updated = now;

        // Save to localStorage
        const savedStories = this.getSavedStories();
        const existingIndex = savedStories.findIndex(story => story.id === this.currentStory.id);
        
        if (existingIndex >= 0) {
            savedStories[existingIndex] = { ...this.currentStory };
        } else {
            savedStories.push({ ...this.currentStory });
        }

        localStorage.setItem('ninjaStories', JSON.stringify(savedStories));
        this.loadSavedStories();
        this.showNotification('物語を保存しました', 'success');
    }

    loadTemplate(templateKey) {
        const template = this.templates[templateKey];
        if (!template) return;

        if (this.currentStory.scenes.length > 0) {
            if (!confirm('現在の物語は失われます。テンプレートを読み込みますか？')) {
                return;
            }
        }

        this.currentStory = {
            id: null,
            title: template.title,
            scenes: template.scenes.map(scene => ({
                id: Date.now() + Math.random(),
                gif: scene.gif,
                text: scene.text
            })),
            created: null,
            updated: null
        };

        this.elements.storyTitle.value = this.currentStory.title;
        this.selectedSceneIndex = -1;
        this.hideTextEditor();
        this.renderStoryboard();
        this.updateUI();
        this.showNotification(`テンプレート「${template.title}」を読み込みました`, 'success');
    }

    getSavedStories() {
        const saved = localStorage.getItem('ninjaStories');
        return saved ? JSON.parse(saved) : [];
    }

    loadSavedStories() {
        const savedStories = this.getSavedStories();
        
        // Update sidebar
        const savedStoriesEl = this.elements.savedStories;
        savedStoriesEl.innerHTML = '';

        if (savedStories.length === 0) {
            savedStoriesEl.innerHTML = '<p style="color: #888; text-align: center;">保存済みの物語はありません</p>';
            return;
        }

        savedStories.reverse().slice(0, 5).forEach(story => {
            const item = document.createElement('div');
            item.className = 'story-item';
            item.innerHTML = `
                <div style="font-weight: bold;">${story.title}</div>
                <div style="font-size: 0.8rem; color: #888;">
                    ${story.scenes.length}シーン - ${new Date(story.updated).toLocaleDateString()}
                </div>
            `;
            item.addEventListener('click', () => this.loadStory(story.id));
            savedStoriesEl.appendChild(item);
        });
    }

    showLoadModal() {
        const savedStories = this.getSavedStories();
        const storyList = this.elements.storyList;
        storyList.innerHTML = '';

        if (savedStories.length === 0) {
            storyList.innerHTML = '<p style="text-align: center; color: #888;">保存済みの物語はありません</p>';
        } else {
            savedStories.reverse().forEach(story => {
                const item = document.createElement('div');
                item.className = 'story-list-item';
                item.innerHTML = `
                    <h4>${story.title}</h4>
                    <p>${story.scenes.length}シーン - ${new Date(story.updated).toLocaleString()}</p>
                `;
                item.addEventListener('click', () => {
                    this.loadStory(story.id);
                    this.hideLoadModal();
                });
                storyList.appendChild(item);
            });
        }

        this.elements.loadModal.classList.add('show');
    }

    hideLoadModal() {
        this.elements.loadModal.classList.remove('show');
    }

    loadStory(storyId) {
        const savedStories = this.getSavedStories();
        const story = savedStories.find(s => s.id === storyId);
        
        if (!story) {
            this.showNotification('物語が見つかりません', 'error');
            return;
        }

        if (this.currentStory.scenes.length > 0) {
            if (!confirm('現在の物語は失われます。この物語を読み込みますか？')) {
                return;
            }
        }

        this.currentStory = { ...story };
        this.elements.storyTitle.value = this.currentStory.title;
        this.selectedSceneIndex = -1;
        this.hideTextEditor();
        this.renderStoryboard();
        this.updateUI();
        this.showNotification(`「${story.title}」を読み込みました`, 'success');
    }

    clearStory() {
        if (this.currentStory.scenes.length === 0) return;

        if (confirm('すべてのシーンをクリアしますか？この操作は取り消せません。')) {
            this.currentStory.scenes = [];
            this.selectedSceneIndex = -1;
            this.hideTextEditor();
            this.renderStoryboard();
            this.updateUI();
            this.showNotification('物語をクリアしました', 'success');
        }
    }

    showPreview() {
        if (this.currentStory.scenes.length === 0) return;

        this.previewIndex = 0;
        this.updatePreviewScene();
        this.elements.previewModal.classList.add('show');
    }

    hidePreview() {
        this.elements.previewModal.classList.remove('show');
        this.stopAutoPlay();
    }

    updatePreviewScene() {
        if (this.currentStory.scenes.length === 0) return;

        const scene = this.currentStory.scenes[this.previewIndex];
        this.elements.previewGif.src = scene.gif;
        this.elements.previewText.textContent = scene.text || 'テキストなし';
        this.elements.sceneIndicator.textContent = `${this.previewIndex + 1} / ${this.currentStory.scenes.length}`;
        
        this.elements.prevScene.disabled = this.previewIndex === 0;
        this.elements.nextScene.disabled = this.previewIndex === this.currentStory.scenes.length - 1;
    }

    prevPreviewScene() {
        if (this.previewIndex > 0) {
            this.previewIndex--;
            this.updatePreviewScene();
        }
    }

    nextPreviewScene() {
        if (this.previewIndex < this.currentStory.scenes.length - 1) {
            this.previewIndex++;
            this.updatePreviewScene();
        }
    }

    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    startAutoPlay() {
        this.isAutoPlaying = true;
        this.elements.autoPlayBtn.textContent = '⏸️ 停止';
        
        const speed = parseInt(this.elements.playSpeed.value);
        this.autoPlayInterval = setInterval(() => {
            if (this.previewIndex < this.currentStory.scenes.length - 1) {
                this.nextPreviewScene();
            } else {
                this.previewIndex = 0;
                this.updatePreviewScene();
            }
        }, speed);
    }

    stopAutoPlay() {
        this.isAutoPlaying = false;
        this.elements.autoPlayBtn.textContent = '🔄 自動再生';
        
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    exportStory() {
        if (this.currentStory.scenes.length === 0) {
            this.showNotification('エクスポートするシーンがありません', 'warning');
            return;
        }

        const html = this.generateStoryHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.currentStory.title || 'ninja_story'}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        this.showNotification('物語をエクスポートしました', 'success');
    }

    generateStoryHTML() {
        const scenes = this.currentStory.scenes.map(scene => `
            <div class="story-scene">
                <img src="${scene.gif}" alt="Scene" style="width: 300px; height: 300px; object-fit: cover; border-radius: 10px;">
                <p style="margin: 15px 0; font-size: 1.2rem; line-height: 1.6;">${scene.text || ''}</p>
            </div>
        `).join('');

        return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.currentStory.title}</title>
    <style>
        body { 
            font-family: 'Segoe UI', sans-serif; 
            background: linear-gradient(135deg, #1a1a2e, #16213e); 
            color: white; 
            margin: 0; 
            padding: 20px; 
        }
        .story-container { 
            max-width: 800px; 
            margin: 0 auto; 
            text-align: center; 
        }
        .story-title { 
            font-size: 2.5rem; 
            color: #ffd700; 
            margin-bottom: 30px; 
        }
        .story-scene { 
            margin: 40px 0; 
            padding: 30px; 
            background: rgba(255,255,255,0.1); 
            border-radius: 15px; 
            backdrop-filter: blur(10px); 
        }
        .navigation { 
            position: fixed; 
            bottom: 20px; 
            left: 50%; 
            transform: translateX(-50%); 
            background: rgba(0,0,0,0.8); 
            padding: 10px 20px; 
            border-radius: 20px; 
        }
        .nav-btn { 
            background: #4ecdc4; 
            border: none; 
            padding: 8px 16px; 
            margin: 0 5px; 
            border-radius: 15px; 
            color: white; 
            cursor: pointer; 
        }
    </style>
</head>
<body>
    <div class="story-container">
        <h1 class="story-title">${this.currentStory.title}</h1>
        <div class="story-content">
            ${scenes}
        </div>
        <div class="navigation">
            <button class="nav-btn" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">↑ トップ</button>
            <button class="nav-btn" onclick="window.close()">✕ 閉じる</button>
        </div>
    </div>
    <script>
        // Smooth scrolling between scenes
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                window.scrollBy({top: 400, behavior: 'smooth'});
            } else if (e.key === 'ArrowUp') {
                window.scrollBy({top: -400, behavior: 'smooth'});
            }
        });
    </script>
</body>
</html>
        `;
    }

    showHelpModal() {
        this.elements.helpModal.classList.add('show');
    }

    hideHelpModal() {
        this.elements.helpModal.classList.remove('show');
    }

    // Mobile touch event handlers
    handleTouchStart(e) {
        this.isDragging = true;
        this.dragData = e.target.dataset.gifPath;
        this.touchStartPos = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
        e.target.classList.add('dragging');
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        // Visual feedback during drag
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - this.touchStartPos.x);
        const deltaY = Math.abs(touch.clientY - this.touchStartPos.y);
        
        // If moved more than 10px, show drag state
        if (deltaX > 10 || deltaY > 10) {
            e.target.style.opacity = '0.5';
        }
    }

    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        e.target.classList.remove('dragging');
        e.target.style.opacity = '';
        
        // Find element at touch position
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Check if dropped on storyboard
        if (elementBelow && (elementBelow.closest('.storyboard') || elementBelow.closest('.drop-zone'))) {
            this.addScene(this.dragData);
        }
        
        this.isDragging = false;
        this.dragData = null;
        this.touchStartPos = null;
    }

    handleMobileClick(e) {
        // Fallback for devices that don't support drag and drop
        if ('ontouchstart' in window) {
            e.preventDefault();
            const gifPath = e.target.dataset.gifPath;
            
            // Show confirmation for mobile users
            if (confirm('このGIFをストーリーに追加しますか？')) {
                this.addScene(gifPath);
            }
        }
    }

    showNotification(message, type = 'info') {
        this.elements.notificationText.textContent = message;
        this.elements.notification.className = `notification ${type}`;
        this.elements.notification.classList.add('show');

        setTimeout(() => {
            this.elements.notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the story maker
let storyMaker;
document.addEventListener('DOMContentLoaded', () => {
    storyMaker = new NinjaStoryMaker();
});