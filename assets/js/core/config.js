/**
 * Global Configuration
 * Centralized settings for the portfolio
 */
window.PORTFOLIO_CONFIG = {
  // Paths (auto-adjust for GitHub Pages subdirectory)
  basePath: window.location.hostname === 'localhost' ? '' : '/your-repo-name',
  
  assets: {
    css: '../../assets/css',
    js: '../../assets/js',
    data: '../../assets/data',
    images: '../../assets/images',
    includes: '../../includes'
  },
  
  // Page routes
  pages: {
    home: '/',
    about: '../../pages/about/',
    research: '../../pages/research/',
    projects: '../../pages/projects/',
    experience: '../../pages/experience/',
    volunteering: '../../pages/volunteering/',
    startup: '../../pages/startup/',
    contact: '../../pages/contact/'
  },
  
  // Features
  features: {
    enableParticles: false, // Set true to enable canvas particles
    enableScrollAnimations: true,
    enableLazyLoading: true,
    enableAnalytics: false
  },
  
  // Animation settings
  animations: {
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    staggerDelay: 100
  },
  
  // Performance
  performance: {
    cacheDuration: 86400, // 24 hours in seconds
    prefetchLinks: true
  }
};

// Auto-detect if running on GitHub Pages
if (window.location.hostname.includes('github.io')) {
  const repo = window.location.pathname.split('/')[1];
  if (repo && repo !== '') {
    window.PORTFOLIO_CONFIG.basePath = `/${repo}`;
  }
}