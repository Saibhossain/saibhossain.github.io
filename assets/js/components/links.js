/**
 * links.js - Render social/professional links
 */

/**
 * Render links grid in main content area
 */
function renderLinksGrid(containerId, links) {
  const container = document.getElementById(containerId);
  if (!container || !links) return;
  
  const LINKS = [
    { key: 'email', label: 'Email', icon: '✉️', color: 'var(--accent)' },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0a66c2' },
    { key: 'github', label: 'GitHub', icon: '🐱', color: '#f0f6fc' },
    { key: 'kaggle', label: 'Kaggle', icon: '📊', color: '#20beff' },
    { key: 'orcid', label: 'ORCID', icon: '🆔', color: '#A6CE39' },
    { key: 'scholar', label: 'Scholar', icon: '🎓', color: '#4285f4' }
  ];
  
  let count = 0;
  LINKS.forEach(({ key, label, icon, color }) => {
    const url = links[key];
    if (url && typeof url === 'string' && url.trim() !== '' && !url.includes('your-')) {
      const card = document.createElement('a');
      card.href = url;
      card.className = 'link-card glass-card fade-in-up';
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.style.animationDelay = `${count * 0.05}s`;
      
      card.innerHTML = `
        <div class="link-icon" style="color:${color};background:${color}15">${icon}</div>
        <span class="link-label">${label}</span>
      `;
      container.appendChild(card);
      count++;
    }
  });
  
  if (count === 0 && container.children.length === 0) {
    container.innerHTML = '<p class="text-muted text-center">Add your links in global.json</p>';
  }
}

/**
 * Render minimal footer links (GitHub, LinkedIn, Email)
 */
function renderFooterLinks(containerId, links) {
  const container = document.getElementById(containerId);
  if (!container || !links) return;
  
  const FOOTER_KEYS = ['github', 'linkedin', 'email'];
  const labels = { github: 'GitHub', linkedin: 'LinkedIn', email: 'Email' };
  
  FOOTER_KEYS.forEach(key => {
    const url = links[key];
    if (url && !url.includes('your-')) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = labels[key] || key;
      container.appendChild(a);
    }
  });
}

// Export for module usage (optional)
if (typeof module !== 'undefined') {
  module.exports = { renderLinksGrid, renderFooterLinks };
}