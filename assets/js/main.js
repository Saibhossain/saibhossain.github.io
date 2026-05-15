/**
 * Main JavaScript - MD Saib Hossain Portfolio
 * Handles scroll animations, progress bars, and interactive elements
 */

(function() {
  'use strict';

  // ===== CONFIGURATION =====
  const CONFIG = {
    scrollOffset: 100, // Pixels from top to trigger animations
    scrollDebounce: 100, // Debounce time for scroll events
    progressAnimationDuration: 1200, // ms for progress bar animation
    heroFadeThreshold: 300 // Pixels scrolled to start fading hero
  };

  // ===== STATE =====
  let isScrolling = false;
  let scrollTimeout;
  const animatedElements = new Set();

  // ===== DOM ELEMENTS =====
  const elements = {
    hero: null,
    heroName: null,
    heroImage: null,
    heroTagline: null,
    aboutSection: null,
    researchSection: null,
    projectsSection: null,
    startupSection: null,
    collabSection: null,
    progressBars: [],
    scrollRevealElements: [],
    researchLinks: []
  };

  // ===== INITIALIZATION =====
  function init() {
    cacheElements();
    setupEventListeners();
    initLetterAnimation();
    initScrollAnimations();
    initProgressBarAnimation();
    initResearchModals();
    
    // Initial check for visible elements
    checkScrollAnimations();
  }

  // Cache DOM references for performance
  function cacheElements() {
    elements.hero = document.getElementById('hero');
    elements.heroName = document.getElementById('animated-name');
    elements.heroImage = document.querySelector('.profile-pic');
    elements.heroTagline = document.querySelector('.hero-tagline');
    elements.aboutSection = document.getElementById('about');
    elements.researchSection = document.getElementById('research');
    elements.projectsSection = document.getElementById('projects');
    elements.startupSection = document.getElementById('startup');
    elements.collabSection = document.getElementById('collaborate');
    
    // Progress bars
    elements.progressBars = document.querySelectorAll('.progress-fill');
    
    // Scroll reveal elements
    elements.scrollRevealElements = document.querySelectorAll(
      '.scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-up, .scroll-reveal-center, .scroll-fade-target'
    );
    
    // Research modal links
    elements.researchLinks = document.querySelectorAll('.research-link');
  }

  // ===== EVENT LISTENERS =====
  function setupEventListeners() {
    // Scroll handler with debounce
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Resize handler for recalculation
    window.addEventListener('resize', debounce(checkScrollAnimations, 150));
    
    // Intersection Observer for modern browsers
    if ('IntersectionObserver' in window) {
      setupIntersectionObserver();
    }
    
    // Research link clicks
    elements.researchLinks.forEach(link => {
      link.addEventListener('click', handleResearchLinkClick);
    });
  }

  // ===== SCROLL HANDLING =====
  function handleScroll() {
    if (isScrolling) return;
    
    isScrolling = true;
    
    // Debounce scroll events
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      checkScrollAnimations();
      handleHeroFade();
    }, CONFIG.scrollDebounce);
  }

  // Fade hero elements on scroll
  function handleHeroFade() {
    const scrollY = window.scrollY;
    const fadeProgress = Math.min(scrollY / CONFIG.heroFadeThreshold, 1);
    
    if (elements.heroName) {
      elements.heroName.style.opacity = 1 - fadeProgress;
      elements.heroName.style.transform = `translateY(${-20 * fadeProgress}px)`;
    }
    
    if (elements.heroImage?.closest('.hero-image-wrapper')) {
      const wrapper = elements.heroImage.closest('.hero-image-wrapper');
      wrapper.style.opacity = 1 - fadeProgress;
      wrapper.style.transform = `translateY(${-15 * fadeProgress}px)`;
    }
    
    if (elements.heroTagline) {
      elements.heroTagline.style.opacity = Math.max(0, 1 - fadeProgress * 1.5);
    }
  }

  // ===== INTERSECTION OBSERVER SETUP =====
  function setupIntersectionObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15 // Trigger when 15% of element is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          
          // Handle scroll reveal elements
          if (target.classList.contains('scroll-reveal-left') ||
              target.classList.contains('scroll-reveal-right') ||
              target.classList.contains('scroll-reveal-up') ||
              target.classList.contains('scroll-reveal-center') ||
              target.classList.contains('scroll-fade-target')) {
            target.classList.add('is-visible');
            animatedElements.add(target);
          }
          
          // Handle progress bars
          if (target.classList.contains('project-card')) {
            animateProgressBarsInCard(target);
          }
          
          // Stop observing once animated
          if (!target.dataset.persistent) {
            observer.unobserve(target);
          }
        }
      });
    }, observerOptions);

    // Observe all scroll-reveal elements
    elements.scrollRevealElements.forEach(el => {
      if (!animatedElements.has(el)) {
        observer.observe(el);
      }
    });

    // Observe project cards for progress bars
    document.querySelectorAll('.project-card').forEach(card => {
      observer.observe(card);
    });
  }

  // Fallback scroll animation checker (for older browsers)
  function checkScrollAnimations() {
    if ('IntersectionObserver' in window) return; // Skip if using Observer
    
    const scrollY = window.scrollY + window.innerHeight * 0.85;
    
    elements.scrollRevealElements.forEach(el => {
      if (animatedElements.has(el)) return;
      
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + window.scrollY;
      
      if (scrollY > elementTop) {
        el.classList.add('is-visible');
        animatedElements.add(el);
        
        // Animate progress bars if in project card
        if (el.classList.contains('project-card')) {
          animateProgressBarsInCard(el);
        }
      }
    });
  }

  // ===== PROGRESS BAR ANIMATION =====
  function initProgressBarAnimation() {
    // Set CSS variable for target width
    elements.progressBars.forEach(bar => {
      const targetWidth = bar.dataset.progress || '75';
      bar.style.setProperty('--target-width', `${targetWidth}%`);
    });
  }

  function animateProgressBarsInCard(card) {
    const bars = card.querySelectorAll('.progress-fill');
    bars.forEach(bar => {
      // Trigger reflow to restart animation
      bar.classList.remove('animate');
      void bar.offsetWidth; // Force reflow
      bar.classList.add('animate');
    });
  }

  // ===== LETTER-BY-LETTER ANIMATION =====
  function initLetterAnimation() {
    const letters = document.querySelectorAll('.letter');
    
    letters.forEach((letter, index) => {
      // Add slight random variation for natural feel
      const delay = parseFloat(letter.dataset.index) * 50 + Math.random() * 30;
      letter.style.animationDelay = `${delay}ms`;
    });
  }

  // ===== RESEARCH MODAL HANDLING =====
  function initResearchModals() {
    // Create modal container if not exists
    let modal = document.getElementById('research-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'research-modal';
      modal.className = 'modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="modal-content glass-card">
          <button class="modal-close" aria-label="Close modal">&times;</button>
          <div class="modal-body"></div>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Close modal on click outside or close button
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
          closeModal(modal);
        }
      });
      
      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
          closeModal(modal);
        }
      });
    }
  }

  function handleResearchLinkClick(e) {
    e.preventDefault();
    const link = e.currentTarget;
    const modalId = link.dataset.modal;
    const modal = document.getElementById('research-modal');
    
    if (!modal) return;
    
    // Load content based on modal ID
    const content = getResearchContent(modalId);
    modal.querySelector('.modal-body').innerHTML = content;
    
    // Show modal
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    
    // Focus trap for accessibility
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function getResearchContent(modalId) {
    const content = {
      'research-1': `
        <h3>Prompt Injection is an Authorization Problem</h3>
        <p class="modal-meta"><strong>Venue:</strong> NeurIPS (Submitted) • <strong>Status:</strong> Under Review</p>
        <p><strong>Abstract:</strong> This work proposes a novel security framework for LLM agents using cryptographic context validation to prevent prompt injection attacks and ensure workflow integrity in agentic systems.</p>
        <p><strong>Key Contributions:</strong></p>
        <ul>
          <li>Cryptographic provenance tracking for agent context</li>
          <li>Authorization-based prompt validation layer</li>
          <li>Formal security guarantees for multi-agent workflows</li>
          <li>Empirical evaluation against 12 injection attack vectors</li>
        </ul>
        <p><strong>Technologies:</strong> Python, PyTorch, Cryptographic Hashing, LangGraph</p>
        <a href="#" class="btn btn-outline" style="margin-top:1rem">View Preprint (Coming Soon)</a>
      `,
      'research-2': `
        <h3>COAST: Clinical Oncology Architecture for Survival Translation</h3>
        <p class="modal-meta"><strong>Venue:</strong> Q1 Journal (In Preparation) • <strong>Funding:</strong> UIU Research Grant</p>
        <p><strong>Abstract:</strong> COAST presents a system architecture for clinically deployable survival prediction models that integrate deep learning-based imaging features with structured clinical data using the Cox Proportional Hazards framework.</p>
        <p><strong>Key Features:</strong></p>
        <ul>
          <li>End-to-end pipeline from CT scan to risk score</li>
          <li>Interpretable feature importance via SHAP values</li>
          <li>Clinical validation with oncologist-in-the-loop evaluation</li>
          <li>Deployment-ready Docker container with FHIR API</li>
        </ul>
        <p><strong>Impact:</strong> Enables precision oncology decisions with 23% improvement in C-index over baseline models.</p>
        <a href="#" class="btn btn-outline" style="margin-top:1rem">Contact for Manuscript</a>
      `
    };
    
    return content[modalId] || '<p>Content loading...</p>';
  }

  function closeModal(modal) {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // ===== UTILITY FUNCTIONS =====
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ===== PUBLIC API (for external use) =====
  window.PortfolioAnimations = {
    // Manually trigger animation check
    refresh: checkScrollAnimations,
    
    // Animate specific element
    reveal: (element) => {
      if (element?.classList) {
        element.classList.add('is-visible');
      }
    },
    
    // Pause all animations (for reduced motion preference)
    pause: () => {
      document.documentElement.classList.add('reduce-motion');
    },
    
    // Resume animations
    resume: () => {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  // ===== INIT ON DOM READY =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
