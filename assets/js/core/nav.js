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
  
  // Load global data, header, and footer in parallel
  try {
    const [globalDataRes, headerRes, footerRes] = await Promise.all([
      fetch(`${prefix}assets/data/global.json?v=` + new Date().getTime()).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${prefix}includes/header.html`),
      fetch(`${prefix}includes/footer.html`)
    ]);
    
    if (globalDataRes) {
      window.__globalData = globalDataRes;
    }
    
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
      
      const socialData = window.__globalData?.social || window.__globalData?.links;
      if (socialData) {
        renderFooterSocialLinks('footer-links', socialData);
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
 * Render social links in the footer using SVG icons
 */
function renderFooterSocialLinks(containerId, socialLinks) {
  const container = document.getElementById(containerId);
  if (!container || !socialLinks) return;
  
  const icons = {
    github: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
    researchgate: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.586 0c-.282.002-.553.114-.754.31L12 8.168 5.168.31C4.967.114 4.696.002 4.414 0H0v24h4.484V9.697l5.964 6.786c.4.455 1.104.455 1.504 0l5.964-6.786V24H24V0h-4.414z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    email: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`
  };
  
  container.innerHTML = '';
  
  const platforms = ['github', 'linkedin', 'researchgate', 'youtube', 'facebook', 'email'];
  platforms.forEach(key => {
    let url = socialLinks[key];
    if (url) {
      if (key === 'email' && !url.startsWith('mailto:')) {
        url = `mailto:${url}`;
      }
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.setAttribute('aria-label', key.charAt(0).toUpperCase() + key.slice(1));
      a.innerHTML = icons[key];
      container.appendChild(a);
    }
  });
}

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