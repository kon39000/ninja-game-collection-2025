// Nindao Metaverse Stamp Rally - Interactive Script
(function() {
    'use strict';

    // DOM Elements
    let gameCards = [];
    let playButtons = [];
    let initialized = false;

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });

    // Main initialization function
    function initializeApp() {
        if (initialized) return;
        
        gameCards = document.querySelectorAll('.game-card');
        playButtons = document.querySelectorAll('.play-btn');
        
        setupGameCards();
        setupPlayButtons();
        setupSmoothScrolling();
        setupAnimationObserver();
        createAdditionalStars();
        
        initialized = true;
    }

    // Enhanced game card interactions
    function setupGameCards() {
        gameCards.forEach((card, index) => {
            // Add dynamic delay for staggered animations
            card.style.setProperty('--animation-delay', `${index * 0.1}s`);
            
            // Enhanced hover effects with sound simulation
            card.addEventListener('mouseenter', function() {
                // Create ripple effect
                createRippleEffect(this);
                
                // Haptic feedback simulation
                if (navigator.vibrate) {
                    navigator.vibrate(20);
                }
            });

            // Card click interaction
            card.addEventListener('click', function(e) {
                if (!e.target.classList.contains('play-btn')) {
                    // Animate card selection
                    animateCardSelection(this);
                }
            });
        });
    }

    // Play button functionality
    function setupPlayButtons() {
        playButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const url = this.dataset.url;
                if (url) {
                    // Create launch animation
                    createLaunchAnimation(this);
                    
                    // Delay opening to show animation
                    setTimeout(() => {
                        window.open(url, '_blank');
                    }, 600);
                    
                    // Haptic feedback
                    if (navigator.vibrate) {
                        navigator.vibrate([50, 30, 50]);
                    }
                }
            });

            // Button hover enhancement
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05) translateY(-2px)';
            });

            button.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) translateY(0)';
            });
        });
    }

    // Smooth scrolling for internal links
    function setupSmoothScrolling() {
        // Add click handler for any internal links
        document.addEventListener('click', function(e) {
            const target = e.target.closest('a[href^="#"]');
            if (target) {
                e.preventDefault();
                const targetId = target.getAttribute('href').slice(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    // Intersection Observer for scroll animations
    function setupAnimationObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.game-card, .feature-item, .section-title');
        animateElements.forEach(el => {
            observer.observe(el);
        });
    }

    // Create ripple effect on card hover
    function createRippleEffect(card) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
            width: 100px;
            height: 100px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: rippleExpand 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        card.style.position = 'relative';
        card.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple && ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // Animate card selection
    function animateCardSelection(card) {
        card.style.transform = 'scale(0.98)';
        card.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            card.style.transform = '';
        }, 100);
    }

    // Launch animation for play buttons
    function createLaunchAnimation(button) {
        // Create launch particles
        for (let i = 0; i < 6; i++) {
            createLaunchParticle(button, i);
        }
        
        // Button animation
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 0 30px var(--glow-primary), 0 0 60px var(--glow-primary)';
        
        setTimeout(() => {
            button.style.transform = '';
            button.style.boxShadow = '';
        }, 600);
    }

    // Create launch particles
    function createLaunchParticle(button, index) {
        const particle = document.createElement('div');
        const angle = (index / 6) * Math.PI * 2;
        const distance = 60 + Math.random() * 40;
        
        particle.style.cssText = `
            position: absolute;
            width: 6px;
            height: 6px;
            background: var(--ninja-gradient);
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: launchParticle 0.8s ease-out;
            pointer-events: none;
            z-index: 1000;
        `;
        
        particle.style.setProperty('--end-x', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--end-y', `${Math.sin(angle) * distance}px`);
        
        button.style.position = 'relative';
        button.appendChild(particle);
        
        setTimeout(() => {
            if (particle && particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 800);
    }

    // Create additional floating stars
    function createAdditionalStars() {
        const starsContainer = document.querySelector('.stars-container');
        if (!starsContainer) return;
        
        // Add more dynamic stars
        for (let i = 0; i < 15; i++) {
            const star = document.createElement('div');
            star.className = 'star dynamic-star';
            star.style.cssText = `
                --delay: ${Math.random() * 5}s;
                --x: ${Math.random() * 100}%;
                --y: ${Math.random() * 100}%;
                --duration: ${3 + Math.random() * 4}s;
            `;
            starsContainer.appendChild(star);
        }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        switch(e.key.toLowerCase()) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                const gameNumber = parseInt(e.key) - 1;
                if (playButtons[gameNumber]) {
                    playButtons[gameNumber].click();
                }
                break;
        }
    });

    // Performance optimization - throttled scroll handler
    let ticking = false;
    function updateScrollEffects() {
        // Add parallax effect to hero
        const hero = document.querySelector('.hero');
        if (hero) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translate3d(0, ${rate}px, 0)`;
        }
        
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    });

    // Mobile orientation handling
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            window.scrollTo(0, 1);
        }, 100);
    });

    // Add CSS animations via JavaScript
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleExpand {
            to {
                transform: translate(-50%, -50%) scale(4);
                opacity: 0;
            }
        }
        
        @keyframes launchParticle {
            to {
                transform: translate(
                    calc(-50% + var(--end-x)), 
                    calc(-50% + var(--end-y))
                ) scale(0);
                opacity: 0;
            }
        }
        
        .animate-in {
            animation: slideInUp 0.6s ease-out forwards;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .dynamic-star {
            animation: twinkleAdvanced var(--duration) ease-in-out infinite var(--delay);
        }
        
        @keyframes twinkleAdvanced {
            0%, 100% { 
                opacity: 0.2; 
                transform: scale(1) rotate(0deg); 
            }
            25% { 
                opacity: 0.8; 
                transform: scale(1.3) rotate(90deg); 
            }
            50% { 
                opacity: 1; 
                transform: scale(1.5) rotate(180deg); 
            }
            75% { 
                opacity: 0.6; 
                transform: scale(1.2) rotate(270deg); 
            }
        }
        
        /* Enhanced responsive animations */
        @media (prefers-reduced-motion: reduce) {
            .star, .dynamic-star {
                animation: none;
            }
            
            .game-card:hover {
                transform: none;
            }
        }
        
        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
            .game-card {
                transition: transform 0.2s ease;
            }
            
            .game-card:active {
                transform: scale(0.98);
            }
        }
    `;
    
    document.head.appendChild(style);

    // Expose public API for debugging
    window.NindaoSite = {
        version: '1.0.0',
        initialized: () => initialized,
        reinitialize: initializeApp
    };

})();