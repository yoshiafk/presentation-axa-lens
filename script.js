// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Apple-Enhanced Navbar with Dark Theme
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        navbar.style.backdropFilter = 'blur(40px)';
        navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        navbar.style.transform = 'translateY(0)';
    } else {
        navbar.style.background = 'rgba(0, 0, 0, 0.8)';
        navbar.style.backdropFilter = 'blur(20px)';
        navbar.style.borderBottom = '1px solid transparent';
        navbar.style.transform = 'translateY(0)';
    }
});

// Google-style Confetti Physics System
class ConfettiParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 15;
        this.vy = (Math.random() - 0.5) * 15 - 5;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 15;
        this.size = Math.random() * 8 + 4;
        this.gravity = 0.2;
        this.drag = 0.98;
        this.life = 1.0;
        this.decay = Math.random() * 0.015 + 0.005;
        this.shape = Math.floor(Math.random() * 4); // 0: circle, 1: square, 2: triangle, 3: rectangle
        this.color = this.getRandomColor();
    }

    getRandomColor() {
        const colors = [
            '#0A84FF', '#409CFF', '#64D2FF', '#30D158', 
            '#59E87B', '#BF5AF2', '#FF9F0A', '#FF453A', '#FFD60A'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.vy += this.gravity;
        this.vx *= this.drag;
        this.vy *= this.drag;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.life -= this.decay;
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;

        switch(this.shape) {
            case 0: // Circle
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 1: // Square
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                break;
            case 2: // Triangle
                ctx.beginPath();
                ctx.moveTo(0, -this.size / 2);
                ctx.lineTo(-this.size / 2, this.size / 2);
                ctx.lineTo(this.size / 2, this.size / 2);
                ctx.closePath();
                ctx.fill();
                break;
            case 3: // Rectangle
                ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
                break;
        }
        ctx.restore();
    }
}

class ConfettiSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    }

    burst(x, y, count = 120) {
        if (!this.canvas) this.createCanvas();
        
        // Create burst with staggered explosions
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const particle = new ConfettiParticle(x, y);
                this.particles.push(particle);
            }, Math.random() * 50);
        }
        
        this.animate();
    }

    animate() {
        if (this.animationId) return;
        
        const loop = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.particles = this.particles.filter(particle => {
                const alive = particle.update();
                if (alive) particle.draw(this.ctx);
                return alive;
            });

            if (this.particles.length > 0) {
                this.animationId = requestAnimationFrame(loop);
            } else {
                this.stop();
            }
        };
        
        this.animationId = requestAnimationFrame(loop);
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.canvas) {
            document.body.removeChild(this.canvas);
            this.canvas = null;
            this.ctx = null;
        }
    }
}

// Screen flash effect
function createScreenFlash() {
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = 'rgba(255, 255, 255, 0.8)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '9998';
    flash.style.opacity = '1';
    flash.style.transition = 'opacity 0.3s ease-out';
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.style.opacity = '0';
        setTimeout(() => {
            if (flash.parentNode) {
                document.body.removeChild(flash);
            }
        }, 300);
    }, 50);
}

// Impact ripple effect
function createImpactRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.style.position = 'fixed';
    ripple.style.left = x - 25 + 'px';
    ripple.style.top = y - 25 + 'px';
    ripple.style.width = '50px';
    ripple.style.height = '50px';
    ripple.style.border = '3px solid #0A84FF';
    ripple.style.borderRadius = '50%';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '9997';
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '1';
    ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
        ripple.style.transform = 'scale(8)';
        ripple.style.opacity = '0';
        setTimeout(() => {
            if (ripple.parentNode) {
                document.body.removeChild(ripple);
            }
        }, 600);
    }, 10);
}

// Enhanced Demo Button with Surprise Elements
const confettiSystem = new ConfettiSystem();

document.addEventListener('DOMContentLoaded', function() {
    const demoButton = document.getElementById('demo-button');
    const surprisePanel = document.getElementById('surprise-panel');
    const closeSurprise = document.getElementById('close-surprise');
    
    if (demoButton) {
        demoButton.addEventListener('click', function(e) {
            const rect = demoButton.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            
            // Create visual effects
            createScreenFlash();
            createImpactRipple(x, y);
            confettiSystem.burst(x, y, 120);
            
            // Show surprise panel after delay
            setTimeout(() => {
                if (surprisePanel) {
                    surprisePanel.classList.remove('hidden');
                }
            }, 1000);
        });
    }
    
    if (closeSurprise) {
        closeSurprise.addEventListener('click', function() {
            if (surprisePanel) {
                surprisePanel.classList.add('hidden');
            }
        });
    }
});

// Apple-style scroll progress indicator
const createScrollProgress = () => {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #007AFF, #00C7BE);
        z-index: 9999;
        transition: width 0.1s ease-out;
        box-shadow: 0 0 10px rgba(0, 122, 255, 0.5);
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
    });
};

// Apple-style subtle scroll effect for sections (without blur)
const createSmoothScrollEffect = () => {
    const sections = document.querySelectorAll('section');
    let isScrolling = false;
    
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                sections.forEach((section, index) => {
                    const rect = section.getBoundingClientRect();
                    const centerY = window.innerHeight / 2;
                    const distance = Math.abs(rect.top + rect.height / 2 - centerY);
                    const maxDistance = window.innerHeight;
                    const proximity = 1 - Math.min(distance / maxDistance, 1);
                    
                    // Apply subtle transform based on proximity (no blur)
                    const scale = 1 + (proximity * 0.01);
                    
                    section.style.transform = `scale(${scale})`;
                    // Clean, no blur effects for better readability
                });
                isScrolling = false;
            });
        }
        isScrolling = true;
    });
};

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections for animation
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Apple-style enhancements
    createScrollProgress();
    createSmoothScrollEffect();
    
    const animatedElements = document.querySelectorAll('.tech-card, .feature-card, .performance-card, .arch-layer, .timeline-item, .impact-card, .showcase-item');
    
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(60px) scale(0.95)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
    
    // Apple-style staggered grid animations
    const grids = document.querySelectorAll('.features-grid, .tech-grid, .performance-grid, .arch-components');
    grids.forEach(grid => {
        const items = grid.children;
        Array.from(items).forEach((item, index) => {
            item.style.animationDelay = `${index * 0.15}s`;
            item.classList.add('grid-item-entrance');
        });
    });
    
    // Apple-style phone mockup floating animation
    const phoneMockups = document.querySelectorAll('.phone-mockup, .phone-frame, .hero-visual');
    phoneMockups.forEach(mockup => {
        mockup.style.animation = 'appleFLoating 6s ease-in-out infinite';
    });
    
    // Apple-style card tilt effects
    const interactiveCards = document.querySelectorAll('.tech-card, .feature-card, .performance-card, .impact-card');
    interactiveCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px) scale(1.05)`;
            card.style.boxShadow = '0 25px 80px rgba(0, 122, 255, 0.3), 0 12px 32px rgba(0, 0, 0, 0.4)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    });
});

// Counter animation for performance metrics
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .metric-value');
    
    counters.forEach(counter => {
        const target = counter.textContent;
        const isPercentage = target.includes('%');
        const isTime = target.includes('s') || target.includes('min');
        const isMultiplier = target.includes('x');
        const isRange = target.includes('<') || target.includes('+');
        
        if (!isTime && !isMultiplier && !isRange) {
            const numericValue = parseInt(target.replace(/[^\d]/g, ''));
            if (!isNaN(numericValue) && numericValue > 0) {
                animateCounter(counter, numericValue, isPercentage);
            }
        }
    });
}

function animateCounter(element, target, isPercentage) {
    let current = 0;
    const increment = target / 60; // 60 frames for smooth animation
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + (isPercentage ? '%' : '');
    }, 16); // ~60fps
}

// Trigger counter animation when performance section is visible
const performanceSection = document.querySelector('.performance-section');
if (performanceSection) {
    const performanceObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(animateCounters, 500); // Delay for better effect
                performanceObserver.disconnect(); // Only animate once
            }
        });
    }, { threshold: 0.3 });
    
    performanceObserver.observe(performanceSection);
}

// Button click handlers
document.addEventListener('DOMContentLoaded', function() {
    // Demo button functionality - Just confetti effect
    const demoButton = document.getElementById('demo-button');
    
    if (demoButton) {
        demoButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Create confetti effect
            createConfettiExplosion();
            
            // Animate button
            this.classList.add('activated');
            this.innerHTML = '<i class="fas fa-magic"></i> Demo Requested!';
            
            // Reset button after animation
            setTimeout(() => {
                this.classList.remove('activated');
                this.innerHTML = '<i class="fas fa-play"></i> Request Demo';
            }, 2000);
        });
    }
    
    // Other existing demo buttons (fallback)
    const otherDemoButtons = document.querySelectorAll('.btn-primary:not(#demo-button)');
    otherDemoButtons.forEach(btn => {
        if (btn.textContent.includes('Demo')) {
            btn.addEventListener('click', function() {
                alert('Demo functionality would showcase the AXA Lens app in action!\n\nThis would typically:\n• Show live document scanning\n• Demonstrate OCR accuracy\n• Display the passport verification flow\n• Show policy generation process');
            });
        }
    });
    
    // Download POC button
    const downloadButtons = document.querySelectorAll('.btn-secondary');
    downloadButtons.forEach(btn => {
        if (btn.textContent.includes('Download POC')) {
            btn.addEventListener('click', function() {
                alert('POC Download Information:\n\nFile: axa-lens-v3.9.5-form-fixes-poc.apk\nSize: 61.2MB\nVersion: 3.9.5+22\nBuild: Release (Production Ready)\n\nIncludes:\n✅ AI-powered document scanning\n✅ Form field fixes\n✅ Professional glassmorphism UI\n✅ 100+ Indonesian airports\n✅ Complete passport verification\n\nContact development team for download link.');
            });
        }
    });
    
    // Approve Pilot Launch button
    const pilotButtons = document.querySelectorAll('button');
    pilotButtons.forEach(btn => {
        if (btn.textContent.includes('Approve Pilot')) {
            btn.addEventListener('click', function() {
                alert('Pilot Launch Approval Process:\n\n1. Stakeholder sign-off required\n2. Select pilot user group (100-500 users)\n3. Define success metrics\n4. Set timeline (30-day pilot period)\n5. Prepare support infrastructure\n\nExpected Timeline:\n• Week 1-2: Pilot group setup\n• Week 3-4: Active testing\n• Week 5: Analysis and optimization\n• Week 6: Go/No-go decision for full launch\n\nContact: Development team ready for immediate deployment');
            });
        }
    });
    
    // Technical Specs download
    const specsButtons = document.querySelectorAll('button');
    specsButtons.forEach(btn => {
        if (btn.textContent.includes('Technical Specs')) {
            btn.addEventListener('click', function() {
                alert('Technical Specifications Document:\n\n📋 Architecture Overview\n📋 API Documentation\n📋 Security Specifications\n📋 Performance Benchmarks\n📋 Integration Guidelines\n📋 Deployment Requirements\n📋 Scalability Metrics\n📋 Compliance Certifications\n\nFormat: PDF, 50+ pages\nAccess: Requires stakeholder approval\n\nContact development team for access.');
            });
        }
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        const rate = scrolled * -0.3;
        heroVisual.style.transform = `translateY(${rate}px)`;
    }
});

// Dynamic typing effect for hero title (optional enhancement)
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        }
    }
    typing();
}

// Progressive enhancement: Add more interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to tech cards
    const techCards = document.querySelectorAll('.tech-card');
    techCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px) scale(1)';
        });
    });
    
    // Add click ripple effect to buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn-primary, .btn-secondary {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Performance monitoring (for demonstration)
if (typeof performance !== 'undefined') {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`🚀 AXA Lens Presentation loaded in ${loadTime}ms`);
            
            // Show performance badge (optional)
            if (loadTime < 3000) {
                console.log('⚡ Fast loading performance achieved!');
            }
        }, 100);
    });
}

// Enhanced Google-style confetti explosion effect
function createConfettiExplosion() {
    const colors = ['#007AFF', '#00C7BE', '#FF1721', '#FFD700', '#FF6B6B', '#00D4AA', '#34C759', '#FF9500', '#AF52DE', '#FF2D92'];
    const confettiCount = 120;
    const buttonRect = document.getElementById('demo-button').getBoundingClientRect();
    const centerX = buttonRect.left + buttonRect.width / 2;
    const centerY = buttonRect.top + buttonRect.height / 2;
    
    // Create multiple bursts for more realistic effect
    for (let burst = 0; burst < 3; burst++) {
        setTimeout(() => {
            for (let i = 0; i < confettiCount / 3; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'google-confetti';
                
                // Random shape and size
                const shapes = ['circle', 'square', 'triangle', 'rectangle'];
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                const size = Math.random() * 8 + 6; // 6-14px
                
                confetti.style.position = 'fixed';
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.zIndex = '9999';
                confetti.style.pointerEvents = 'none';
                
                // Shape styling
                switch (shape) {
                    case 'circle':
                        confetti.style.borderRadius = '50%';
                        break;
                    case 'triangle':
                        confetti.style.width = '0';
                        confetti.style.height = '0';
                        confetti.style.borderLeft = `${size/2}px solid transparent`;
                        confetti.style.borderRight = `${size/2}px solid transparent`;
                        confetti.style.borderBottom = `${size}px solid ${confetti.style.background}`;
                        confetti.style.background = 'transparent';
                        break;
                    case 'rectangle':
                        confetti.style.width = size * 1.5 + 'px';
                        confetti.style.height = size * 0.7 + 'px';
                        break;
                    default: // square
                        confetti.style.borderRadius = '2px';
                        break;
                }
                
                // Physics-based initial position and velocity
                const angle = (Math.random() * 360) * (Math.PI / 180);
                const velocity = Math.random() * 15 + 10; // Initial speed
                const gravity = 0.5;
                const dragCoefficient = 0.98;
                
                let x = centerX;
                let y = centerY;
                let vx = Math.cos(angle) * velocity;
                let vy = Math.sin(angle) * velocity - Math.random() * 10; // Upward bias
                let rotation = 0;
                let rotationSpeed = (Math.random() - 0.5) * 20;
                let opacity = 1;
                
                confetti.style.left = x + 'px';
                confetti.style.top = y + 'px';
                
                document.body.appendChild(confetti);
                
                // Physics animation loop
                const animateParticle = () => {
                    // Apply physics
                    vy += gravity; // Gravity
                    vx *= dragCoefficient; // Air resistance
                    vy *= dragCoefficient;
                    
                    x += vx;
                    y += vy;
                    rotation += rotationSpeed;
                    
                    // Fade out as it falls
                    if (y > window.innerHeight * 0.7) {
                        opacity -= 0.02;
                    }
                    
                    // Apply transforms
                    confetti.style.left = x + 'px';
                    confetti.style.top = y + 'px';
                    confetti.style.transform = `rotate(${rotation}deg)`;
                    confetti.style.opacity = opacity;
                    
                    // Continue animation or remove
                    if (y < window.innerHeight + 100 && opacity > 0 && x > -100 && x < window.innerWidth + 100) {
                        requestAnimationFrame(animateParticle);
                    } else {
                        if (confetti.parentNode) {
                            confetti.parentNode.removeChild(confetti);
                        }
                    }
                };
                
                requestAnimationFrame(animateParticle);
            }
        }, burst * 150); // Staggered bursts
    }
    
    // Add realistic sound effect (visual feedback)
    createImpactRipple(centerX, centerY);
    
    // Screen flash effect
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.background = 'radial-gradient(circle at ' + centerX + 'px ' + centerY + 'px, rgba(0, 122, 255, 0.15) 0%, transparent 50%)';
    flash.style.pointerEvents = 'none';
    flash.style.zIndex = '9998';
    flash.style.animation = 'flashEffect 0.4s ease-out';
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
        }
    }, 400);
}

// Create impact ripple effect at button location
function createImpactRipple(x, y) {
    for (let i = 0; i < 3; i++) {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = (x - 50) + 'px';
        ripple.style.top = (y - 50) + 'px';
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        ripple.style.border = '2px solid rgba(0, 122, 255, 0.6)';
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9997';
        ripple.style.animation = `rippleExpand 1s ease-out ${i * 0.1}s`;
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 1000 + (i * 100));
    }
}

// Add flash effect CSS
const flashStyle = document.createElement('style');
flashStyle.textContent = `
    @keyframes flashEffect {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(flashStyle);