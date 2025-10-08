/**
 * AXA Lens - Interactive JavaScript
 * Apple-inspired smooth animations and interactions
 */

class AXALensApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupScrollAnimations();
    this.setupNavigation();
    this.setupParallax();
    this.setupIntersectionObserver();
    this.setupMobileMenu();
    this.setupSmoothScrolling();
    this.setupPerformanceOptimizations();
  }

  // Smooth scrolling for navigation links
  setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // Navigation scroll effect
  setupNavigation() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      
      // Add/remove background blur effect
      if (currentScrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.9)';
        navbar.style.backdropFilter = 'blur(20px) saturate(180%)';
      } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.8)';
        navbar.style.backdropFilter = 'blur(20px) saturate(180%)';
      }

      // Hide/show navbar on scroll
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        navbar.style.transform = 'translateY(-100%)';
      } else {
        navbar.style.transform = 'translateY(0)';
      }

      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  // Parallax effect for background orbs
  setupParallax() {
    const orbs = document.querySelectorAll('.gradient-orb');
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * 0.5;

      orbs.forEach((orb, index) => {
        const speed = 0.2 + (index * 0.1);
        orb.style.transform = `translateY(${parallax * speed}px) rotate(${scrolled * 0.05}deg)`;
      });
    }, { passive: true });
  }

  // Intersection Observer for scroll animations
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Special animation for feature cards
          if (entry.target.classList.contains('feature-card')) {
            this.animateFeatureCard(entry.target);
          }
          
          // Special animation for tech items
          if (entry.target.classList.contains('tech-item')) {
            this.animateTechItem(entry.target);
          }
          
          // Special animation for screenshot items
          if (entry.target.classList.contains('screenshot-item')) {
            this.animateScreenshot(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observe all animatable elements
    const animatableElements = document.querySelectorAll(`
      .feature-card,
      .tech-item,
      .screenshot-item,
      .stat-card,
      .arch-layer,
      .hero-device,
      .section-header,
      .value-card,
      .showcase-item,
      .workflow-step,
      .main-screenshot
    `);

    animatableElements.forEach(el => {
      observer.observe(el);
    });
  }

  // Feature card animation
  animateFeatureCard(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, Math.random() * 200);
  }

  // Tech item animation
  animateTechItem(item) {
    item.style.opacity = '0';
    item.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
      item.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      item.style.opacity = '1';
      item.style.transform = 'scale(1)';
    }, Math.random() * 100);
  }

  // Screenshot animation
  animateScreenshot(screenshot) {
    screenshot.style.opacity = '0';
    screenshot.style.transform = 'translateY(40px) scale(0.95)';
    
    setTimeout(() => {
      screenshot.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      screenshot.style.opacity = '1';
      screenshot.style.transform = 'translateY(0) scale(1)';
    }, Math.random() * 300);
  }

  // Mobile menu functionality
  setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    let isMenuOpen = false;

    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
          navLinks.style.display = 'flex';
          navLinks.style.position = 'absolute';
          navLinks.style.top = '100%';
          navLinks.style.left = '0';
          navLinks.style.right = '0';
          navLinks.style.background = 'rgba(255, 255, 255, 0.95)';
          navLinks.style.backdropFilter = 'blur(20px)';
          navLinks.style.flexDirection = 'column';
          navLinks.style.padding = '20px';
          navLinks.style.borderRadius = '0 0 16px 16px';
          navLinks.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
          
          menuToggle.classList.add('active');
        } else {
          navLinks.style.display = 'none';
          menuToggle.classList.remove('active');
        }
      });

      // Close menu when clicking on links
      navLinks.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
          isMenuOpen = false;
          navLinks.style.display = 'none';
          menuToggle.classList.remove('active');
        }
      });
    }
  }

  // Screenshot modal/lightbox
  setupScreenshotModal() {
    const screenshots = document.querySelectorAll('.screenshot-frame img');
    
    screenshots.forEach(img => {
      img.addEventListener('click', (e) => {
        this.openScreenshotModal(e.target);
      });
      
      // Add cursor pointer
      img.style.cursor = 'pointer';
    });
  }

  openScreenshotModal(img) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'screenshot-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <button class="modal-close">&times;</button>
          <img src="${img.src}" alt="${img.alt}">
          <div class="modal-caption">${img.alt}</div>
        </div>
      </div>
    `;

    // Add modal styles
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(10px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      text-align: center;
    `;

    const modalImg = modal.querySelector('img');
    modalImg.style.cssText = `
      max-width: 100%;
      max-height: 80vh;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    `;

    const modalClose = modal.querySelector('.modal-close');
    modalClose.style.cssText = `
      position: absolute;
      top: -40px;
      right: 0;
      background: none;
      border: none;
      font-size: 30px;
      color: white;
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease;
    `;

    const modalCaption = modal.querySelector('.modal-caption');
    modalCaption.style.cssText = `
      color: white;
      margin-top: 20px;
      font-size: 1.1rem;
      font-weight: 500;
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Animate in
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);

    // Close modal functionality
    const closeModal = () => {
      modal.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
      }, 300);
    };

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.className === 'modal-overlay') {
        closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escapeHandler);
      }
    });
  }

  // Scroll animations for elements
  setupScrollAnimations() {
    // Hero stats counter animation
    this.setupStatsCounter();
    
    // Feature cards stagger animation
    this.setupFeatureCardsAnimation();
    
    // Technology items reveal
    this.setupTechAnimation();
  }

  setupStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateNumber(entry.target);
          observer.unobserve(entry.target);
        }
      });
    });

    statNumbers.forEach(stat => observer.observe(stat));
  }

  animateNumber(element) {
    const finalValue = element.textContent;
    const isPercentage = finalValue.includes('%');
    const isPlus = finalValue.includes('+');
    const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
    
    let currentValue = 0;
    const increment = numericValue / 50; // 50 steps
    const duration = 2000; // 2 seconds
    const stepTime = duration / 50;

    const timer = setInterval(() => {
      currentValue += increment;
      
      if (currentValue >= numericValue) {
        currentValue = numericValue;
        clearInterval(timer);
      }
      
      let displayValue = Math.floor(currentValue).toString();
      if (isPlus) displayValue += '+';
      if (isPercentage) displayValue += '%';
      
      element.textContent = displayValue;
    }, stepTime);
  }

  setupFeatureCardsAnimation() {
    const cards = document.querySelectorAll('.feature-card');
    
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(50px)';
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, index * 150);
            observer.unobserve(entry.target);
          }
        });
      });
      
      observer.observe(card);
    });
  }

  setupTechAnimation() {
    const layers = document.querySelectorAll('.arch-layer');
    
    layers.forEach((layer, index) => {
      layer.style.opacity = '0';
      layer.style.transform = 'translateX(-50px)';
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              layer.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
              layer.style.opacity = '1';
              layer.style.transform = 'translateX(0)';
            }, index * 200);
            observer.unobserve(entry.target);
          }
        });
      });
      
      observer.observe(layer);
    });
  }

  // Performance optimizations
  setupPerformanceOptimizations() {
    // Lazy load images
    this.setupLazyLoading();
    
    // Throttle scroll events
    this.setupScrollThrottling();
    
    // Preload critical images
    this.preloadCriticalImages();
  }

  setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.style.transition = 'opacity 0.3s ease';
            img.style.opacity = '0';
            
            img.onload = () => {
              img.style.opacity = '1';
            };
            
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  setupScrollThrottling() {
    let ticking = false;
    
    const updateScrollEffects = () => {
      // Update any scroll-based effects here
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  preloadCriticalImages() {
    const criticalImages = [
      'app_icon.png',
      'captures/Home Screen.png'
    ];

    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }
}

// Enhanced button interactions
class ButtonEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.setupButtonEffects();
    this.setupHoverEffects();
  }

  setupButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      // Ripple effect on click
      button.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        `;
        
        button.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });

    // Add ripple animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setupHoverEffects() {
    const cards = document.querySelectorAll('.feature-card, .stat-card');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
      
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AXALensApp();
  new ButtonEnhancer();
  
  // Add loading animation
  const loader = document.createElement('div');
  loader.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: opacity 0.5s ease;
    ">
      <div style="
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #00008f, #1e3dff);
        border-radius: 12px;
        animation: spin 1s linear infinite;
      "></div>
    </div>
  `;
  
  const spinStyle = document.createElement('style');
  spinStyle.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(spinStyle);
  
  document.body.appendChild(loader);
  
  // Hide loader after page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.remove();
      }, 500);
    }, 1000);
  });
});

// Add enhanced CSS for interactive effects
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
  .mobile-menu-toggle.active span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }
  
  .mobile-menu-toggle.active span:nth-child(2) {
    opacity: 0;
  }
  
  .mobile-menu-toggle.active span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
  }
  
  .feature-card:hover::after {
    content: '';
    position: absolute;
    top: var(--mouse-y, 50%);
    left: var(--mouse-x, 50%);
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(0, 0, 143, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 0;
  }
  
  .feature-card > * {
    position: relative;
    z-index: 1;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .feature-card:hover::after {
      display: none;
    }
  }
`;
document.head.appendChild(enhancedStyles);