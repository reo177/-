// アニメーション設定を読み込み
let animationConfig = {};

async function loadAnimationConfig() {
    try {
        const response = await fetch('animations.json');
        animationConfig = await response.json();
    } catch (error) {
        console.log('Using default animation config');
        animationConfig = {
            particles: { count: 50, speed: 2, size: 3, colors: ["#8B0000", "#0066ff", "#00ff00", "#ff6b6b"] },
            typing: { speed: 100, deleteSpeed: 50, pauseTime: 2000 },
            scroll: { threshold: 0.1, rootMargin: "0px" },
            glitch: { duration: 200, interval: 3000 },
            pulse: { duration: 2, scale: 1.1 }
        };
    }
    initAnimations();
}

// パーティクルシステム
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.config = animationConfig.particles || { count: 50, speed: 2, size: 3, colors: ["#8B0000", "#0066ff", "#00ff00", "#ff6b6b"] };
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        for (let i = 0; i < this.config.count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.config.speed,
                vy: (Math.random() - 0.5) * this.config.speed,
                size: Math.random() * this.config.size + 1,
                color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
                opacity: Math.random()
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((particle, i) => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;

            // パーティクル間の線
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = particle.x - p2.x;
                const dy = particle.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = particle.color;
                    this.ctx.globalAlpha = (150 - distance) / 150 * 0.3;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                    this.ctx.globalAlpha = 1;
                }
            });
        });

        requestAnimationFrame(() => this.animate());
    }
}

// タイピングアニメーション
class TypingAnimation {
    constructor(element, texts, config) {
        this.element = element;
        this.texts = texts;
        this.config = config || animationConfig.typing || { speed: 100, deleteSpeed: 50, pauseTime: 2000 };
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.element.classList.add('typing-text');
        this.type();
    }

    type() {
        const currentText = this.texts[this.currentTextIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
            
            if (this.currentCharIndex === 0) {
                this.isDeleting = false;
                this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
                setTimeout(() => this.type(), this.config.pauseTime);
                return;
            }
            setTimeout(() => this.type(), this.config.deleteSpeed);
        } else {
            this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
            
            if (this.currentCharIndex === currentText.length) {
                this.isDeleting = true;
                setTimeout(() => this.type(), this.config.pauseTime);
                return;
            }
            setTimeout(() => this.type(), this.config.speed);
        }
    }
}

// スクロールアニメーション
function initScrollAnimations() {
    const observerOptions = {
        threshold: animationConfig.scroll?.threshold || 0.1,
        rootMargin: animationConfig.scroll?.rootMargin || "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// グリッチエフェクト
function addGlitchEffect(element) {
    const config = animationConfig.glitch || { duration: 200, interval: 3000 };
    
    setInterval(() => {
        element.classList.add('glitch-effect');
        element.setAttribute('data-text', element.textContent);
        
        setTimeout(() => {
            element.classList.remove('glitch-effect');
        }, config.duration);
    }, config.interval);
}

// マウス追従エフェクト
function initMouseFollower() {
    const follower = document.createElement('div');
    follower.className = 'mouse-follower';
    document.body.appendChild(follower);

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
}

// リップルエフェクト
function addRippleEffect(element) {
    element.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 1000);
    });
}

// パララックス効果
function initParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// カウントアップアニメーション
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// 3Dカード効果
function init3DCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// テキストアニメーション（文字ごと）
function animateText(element) {
    const text = element.textContent;
    element.textContent = '';
    element.style.opacity = '1';
    
    text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.opacity = '0';
        span.style.animation = `fadeInChar 0.5s ease forwards ${index * 0.05}s`;
        element.appendChild(span);
    });
}

// CSSアニメーションを動的に追加
function addTextAnimationCSS() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInChar {
            to {
                opacity: 1;
                transform: translateY(0);
            }
            from {
                opacity: 0;
                transform: translateY(20px);
            }
        }
    `;
    document.head.appendChild(style);
}

// 初期化関数
function initAnimations() {
    // パーティクルシステム
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        new ParticleSystem(canvas);
    }

    // タイピングアニメーション
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        new TypingAnimation(subtitle, [
            'Developer | Creator | Executive',
            'Bot Developer | Programmer',
            'Server Administrator',
            'TAOG Executive'
        ]);
    }

    // スクロールアニメーション
    initScrollAnimations();

    // グリッチエフェクト（タイトル）
    const title = document.querySelector('header h1');
    if (title) {
        addGlitchEffect(title);
    }

    // マウス追従
    initMouseFollower();

    // リップルエフェクト（カード）
    document.querySelectorAll('.card').forEach(card => {
        addRippleEffect(card);
    });

    // パララックス
    initParallax();

    // 3Dカード
    init3DCards();

    // テキストアニメーション
    addTextAnimationCSS();
    document.querySelectorAll('section h2').forEach(h2 => {
        animateText(h2);
    });

    // バッジにホバーアニメーション
    document.querySelectorAll('.badge').forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.3) rotate(360deg)';
            this.style.transition = 'transform 0.5s ease';
        });
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });

    // ナビゲーションアニメーション
    document.querySelectorAll('nav a').forEach((link, index) => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.1)';
            this.style.transition = 'all 0.3s ease';
        });
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // セクションにフェードインクラスを追加
    document.querySelectorAll('section').forEach((section, index) => {
        section.classList.add('fade-in');
        section.style.animationDelay = `${index * 0.1}s`;
    });

    // リンクにアニメーション
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = 20;
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(0, 255, 0, 0.5)';
            ripple.style.pointerEvents = 'none';
            ripple.style.animation = 'ripple 0.6s ease-out';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// ページロード時に実行
document.addEventListener('DOMContentLoaded', () => {
    loadAnimationConfig();
});
