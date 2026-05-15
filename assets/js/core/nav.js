/**
 * nav.js - Simplified header/footer loader
 * Works for both root and subpages without complex path logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Set footer year immediately (no waiting for fetch)
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  
  // Detect if we're in a subpage (e.g., /pages/projects/)
  const isSubpage = window.location.pathname.includes('/pages/');
  
  // Calculate relative path prefix
  // Root: ./includes/  |  Subpage: ../../includes/
  const prefix = isSubpage ? '../../' : './';
  
  // Load header and footer in parallel
  try {
    const [headerRes, footerRes] = await Promise.all([
      fetch(`${prefix}includes/header.html`),
      fetch(`${prefix}includes/footer.html`)
    ]);
    
    // Inject header if successful
    if (headerRes.ok) {
      const headerHtml = await headerRes.text();
      document.getElementById('header-placeholder').innerHTML = headerHtml;
      initNavInteractions(); // Initialize mobile menu after header loads
    } else {
      console.warn('Header not loaded:', headerRes.status);
      document.getElementById('header-placeholder').innerHTML = '<nav class="nav"><div class="container"><a href="/" class="nav-logo">SH</a></div></nav>';
    }
    
    // Inject footer if successful
    if (footerRes.ok) {
      const footerHtml = await footerRes.text();
      document.getElementById('footer-placeholder').innerHTML = footerHtml;
      // Render footer links if global data is available
      if (window.__globalData?.links) {
        renderFooterLinks('footer-links', window.__globalData.links);
      }
    } else {
      console.warn('Footer not loaded:', footerRes.status);
    }
    
    // Highlight active nav item
    highlightActiveNav();
    
  } catch (error) {
    console.error('Failed to load header/footer:', error);
    // Fallback minimal nav
    document.getElementById('header-placeholder').innerHTML = `
      <nav class="nav"><div class="container"><a href="/" class="nav-logo">SH</a></div></nav>
    `;
  }
});

/**
 * Initialize nav interactions (mobile toggle, etc.)
 * Called after header is injected into DOM
 */
function initNavInteractions() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  
  if (!toggle || !menu) return;
  
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !expanded);
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
  });
  
  // Close menu when clicking a link
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
      menu.classList.remove('active');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
}

/**
 * Highlight active navigation link based on current URL
 */
function highlightActiveNav() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll('.nav-links a');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Handle root
    if (href === '/' && (currentPath === '/' || currentPath.endsWith('/index.html'))) {
      link.classList.add('active');
      return;
    }
    
    // Handle subpages - normalize both paths for comparison
    const normalizedHref = href.replace('/index.html', '').replace('pages/', '');
    const normalizedPath = currentPath.replace('/index.html', '').replace('pages/', '');
    
    if (normalizedPath.includes(normalizedHref) && normalizedHref !== '/') {
      link.classList.add('active');
    }
  });
}

// Make functions globally available for inline scripts
window.initNavInteractions = initNavInteractions;
window.highlightActiveNav = highlightActiveNav;