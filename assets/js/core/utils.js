/**
 * Utility Functions
 * Reusable helpers for the portfolio
 */

/**
 * Fetch and parse JSON with error handling
 * @param {string} path - Path to JSON file (relative to data folder)
 * @returns {Promise<Object|null>} Parsed JSON or null on error
 */
async function fetchJSON(path) {
  try {
    const config = window.PORTFOLIO_CONFIG;
    const url = `${config.basePath}${config.assets.data}/${path}`;
    
    const response = await fetch(url, {
      cache: 'force-cache',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[Utils] Failed to load ${path}:`, error);
    return null;
  }
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Safe text setter with element existence check
 * @param {string} id - Element ID
 * @param {string} text - Text to set
 * @param {string} fallback - Fallback text if element not found
 */
function setText(id, text, fallback = '') {
  const el = document.getElementById(id);
  if (el && text) {
    el.textContent = text;
    return true;
  }
  if (el && fallback) el.textContent = fallback;
  return !!el;
}

/**
 * Render a list of items using a template function
 * @param {string} containerId - Target container ID
 * @param {Array} items - Array of items to render
 * @param {Function} templateFn - Function that returns HTML string for each item
 */
function renderList(containerId, items, templateFn) {
  const container = document.getElementById(containerId);
  if (!container || !Array.isArray(items) || typeof templateFn !== 'function') {
    console.warn(`[Utils] Invalid renderList params: ${containerId}`);
    return;
  }
  
  container.innerHTML = items
    .filter(item => item !== null && item !== undefined)
    .map(templateFn)
    .join('');
}

/**
 * Load HTML snippet into element (for header/footer includes)
 * @param {string} elementId - Target element ID
 * @param {string} filename - Filename in includes folder
 */
async function loadSnippet(elementId, filename) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  try {
    const config = window.PORTFOLIO_CONFIG;
    const url = `${config.basePath}${config.assets.includes}/${filename}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    el.innerHTML = await response.text();
    
    // Re-initialize nav after loading header
    if (filename === 'header.html' && typeof initNav === 'function') {
      setTimeout(initNav, 50);
    }
  } catch (error) {
    console.error(`[Utils] Failed to load ${filename}:`, error);
    el.innerHTML = `<p class="text-muted" style="text-align:center;padding:1rem">Navigation loading...</p>`;
  }
}

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 250) {
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

/**
 * Throttle function for scroll/resize events
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 200) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if element is in viewport
 * @param {Element} el - Element to check
 * @param {number} offset - Offset from viewport edge
 * @returns {boolean} Is element visible
 */
function isInViewport(el, offset = 0) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.bottom >= -offset
  );
}

/**
 * Initialize scroll animations using Intersection Observer
 * @param {string} selector - CSS selector for elements to animate
 * @param {Object} options - Observer options
 */
function initScrollAnimations(selector = '.fade-in-up', options = {}) {
  if (!window.PORTFOLIO_CONFIG.features.enableScrollAnimations) return;
  if (!('IntersectionObserver' in window)) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    ...options
  });
  
  document.querySelectorAll(selector).forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
    observer.observe(el);
  });
}

// Export for module usage (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchJSON, escapeHtml, setText, renderList, loadSnippet,
    debounce, throttle, isInViewport, initScrollAnimations
  };
}