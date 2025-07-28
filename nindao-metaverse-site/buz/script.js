class BuzzSimulator {
    constructor() {
        this.selectedGif = null;
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
        
        this.init();
    }

    init() {
        this.setupElements();
        this.loadGifs();
        this.setupEventListeners();
    }

    setupElements() {
        this.elements = {
            tweetText: document.getElementById('tweetText'),
            charCount: document.getElementById('charCount'),
            gifGrid: document.getElementById('gifGrid'),
            selectedMedia: document.getElementById('selectedMedia'),
            selectedGif: document.getElementById('selectedGif'),
            buzzBtn: document.getElementById('buzzBtn'),
            composer: document.getElementById('composer'),
            results: document.getElementById('results'),
            resultText: document.getElementById('resultText'),
            resultMedia: document.getElementById('resultMedia'),
            resultGif: document.getElementById('resultGif'),
            likes: document.getElementById('likes'),
            retweets: document.getElementById('retweets'),
            views: document.getElementById('views'),
            rankBadge: document.getElementById('rankBadge'),
            rankMessage: document.getElementById('rankMessage'),
            reactionArea: document.getElementById('reactionArea'),
            reactionGif: document.getElementById('reactionGif'),
            shareBtn: document.getElementById('shareBtn'),
            retryBtn: document.getElementById('retryBtn')
        };
    }

    loadGifs() {
        this.elements.gifGrid.innerHTML = '';
        
        this.gifFiles.forEach((gifPath, index) => {
            const img = document.createElement('img');
            img.src = gifPath;
            img.className = 'gif-item';
            img.alt = `GIF ${index + 1}`;
            img.addEventListener('click', () => this.selectGif(gifPath, img));
            this.elements.gifGrid.appendChild(img);
        });
    }

    selectGif(gifPath, imgElement) {
        // Remove previous selection
        document.querySelectorAll('.gif-item').forEach(img => {
            img.classList.remove('selected');
        });
        
        // Select new GIF
        imgElement.classList.add('selected');
        this.selectedGif = gifPath;
        
        // Show selected GIF
        this.elements.selectedGif.src = gifPath;
        this.elements.selectedMedia.style.display = 'block';
        
        this.updateBuzzButton();
    }

    setupEventListeners() {
        this.elements.tweetText.addEventListener('input', () => {
            this.updateCharCount();
            this.updateBuzzButton();
        });

        this.elements.buzzBtn.addEventListener('click', () => {
            this.analyzeBuzz();
        });

        this.elements.retryBtn.addEventListener('click', () => {
            this.reset();
        });

        this.elements.shareBtn.addEventListener('click', () => {
            this.shareToX();
        });
    }

    updateCharCount() {
        const length = this.elements.tweetText.value.length;
        this.elements.charCount.textContent = `${length}/140`;
        
        if (length > 120) {
            this.elements.charCount.style.color = '#E0245E';
        } else if (length > 100) {
            this.elements.charCount.style.color = '#FFAD1F';
        } else {
            this.elements.charCount.style.color = '#71767b';
        }
    }

    updateBuzzButton() {
        const hasText = this.elements.tweetText.value.trim().length > 0;
        const hasGif = this.selectedGif !== null;
        
        this.elements.buzzBtn.disabled = !(hasText && hasGif);
    }

    analyzeBuzz() {
        // Hide composer, show results
        this.elements.composer.style.display = 'none';
        this.elements.results.style.display = 'block';
        
        // Set result content
        this.elements.resultText.textContent = this.elements.tweetText.value;
        this.elements.resultGif.src = this.selectedGif;
        this.elements.resultMedia.style.display = 'block';
        
        // Generate random metrics
        const likes = this.randomBetween(1, 10000);
        const retweets = this.randomBetween(0, 1000);
        const views = this.randomBetween(100, 100000);
        
        // Animate counters
        this.animateCounter(this.elements.likes, likes, 1000);
        this.animateCounter(this.elements.retweets, retweets, 1200);
        this.animateCounter(this.elements.views, views, 1400);
        
        // Calculate and show rank
        setTimeout(() => {
            this.calculateRank(likes, retweets, views);
        }, 1600);
    }

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    animateCounter(element, target, duration) {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start).toLocaleString();
            }
        }, 16);
    }

    calculateRank(likes, retweets, views) {
        const buzzScore = (likes * 1) + (retweets * 10) + (views * 0.01);
        
        let rank, message, className;
        
        if (buzzScore < 500) {
            rank = '無風';
            message = 'その投稿、界隈の空気読みすぎて無風！でも継続が力なり 🥷';
            className = 'no-buzz';
        } else if (buzzScore < 2000) {
            rank = '小バズ';
            message = '静かなる戦士…だがその一言が刺さる！ 🎯';
            className = 'small-buzz';
        } else if (buzzScore < 8000) {
            rank = '中バズ';
            message = 'これは"尊いDAO愛"が伝わる投稿ですね… 💎';
            className = 'medium-buzz';
        } else if (buzzScore < 20000) {
            rank = '大バズ';
            message = '爆バズ！やっちゃったな！界隈がざわつく予感 🔥';
            className = 'big-buzz';
        } else {
            rank = '炎上級';
            message = 'これは…完全にバイラル！！Web3界隈震撼レベル 🌪️';
            className = 'viral';
        }
        
        this.elements.rankBadge.textContent = rank;
        this.elements.rankBadge.className = `rank-badge ${className}`;
        this.elements.rankMessage.textContent = message;
        
        // Show reaction GIF
        this.showReactionGif();
    }

    showReactionGif() {
        const randomGif = this.gifFiles[Math.floor(Math.random() * this.gifFiles.length)];
        this.elements.reactionGif.src = randomGif;
        this.elements.reactionArea.style.display = 'block';
    }

    shareToX() {
        const tweetText = this.elements.tweetText.value;
        const likes = this.elements.likes.textContent;
        const retweets = this.elements.retweets.textContent;
        const views = this.elements.views.textContent;
        const rank = this.elements.rankBadge.textContent;
        
        const shareText = `${tweetText}

📊 バズシム診断結果:
${rank} (❤️${likes} 🔄${retweets} 👁️${views})

#バズシムX #NINJADAO #バズ診断
        
🎮 あなたもバズ診断してみる？
https://your-domain.com`;

        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(tweetUrl, '_blank');
    }

    reset() {
        // Hide results, show composer
        this.elements.results.style.display = 'none';
        this.elements.composer.style.display = 'flex';
        
        // Reset form
        this.elements.tweetText.value = '';
        this.updateCharCount();
        
        // Reset GIF selection
        document.querySelectorAll('.gif-item').forEach(img => {
            img.classList.remove('selected');
        });
        
        this.selectedGif = null;
        this.elements.selectedMedia.style.display = 'none';
        this.updateBuzzButton();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BuzzSimulator();
});