/**
 * Projects Page Logic - Robust Version
 * Auto-detects correct path for projects.json with fallbacks
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Projects page initializing...');
  
  // Helper: Try multiple paths to find projects.json
  async function fetchProjectsData() {
    const possiblePaths = [
      '../../assets/data/projects.json',  // Standard: pages/projects/ → root → assets/data/
      './assets/data/projects.json',       // If page is at root
      'assets/data/projects.json',         // Alternative relative
      '/assets/data/projects.json'         // Absolute (works on localhost, may fail on GH Pages subfolder)
    ];
    
    for (const path of possiblePaths) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          console.log(`✅ Loaded projects from: ${path}`);
          return await res.json();
        }
      } catch (e) {
        // Try next path
      }
    }
    return null; // All paths failed
  }
  
  // Load global data for footer (same path logic)
  async function fetchGlobalData() {
    const paths = ['../../assets/data/global.json', './assets/data/global.json', 'assets/data/global.json'];
    for (const path of paths) {
      try {
        const res = await fetch(path);
        if (res.ok) return await res.json();
      } catch {}
    }
    return null;
  }
  
  // Load data
  const [globalData, projectsData] = await Promise.all([
    fetchGlobalData(),
    fetchProjectsData()
  ]);
  
  // Render footer links if global loaded
  if (globalData?.links && typeof renderFooterLinks === 'function') {
    renderFooterLinks('footer-links', globalData.links);
  }
  
  // Handle projects data
  if (!projectsData) {
    console.error('❌ Could not load projects.json from any path');
    showEmptyState(`
      Could not load projects. 
      <br><br>
      <strong>Troubleshooting:</strong><br>
      1. Are you running a local server? (Not file://)<br>
      2. Does <code>assets/data/projects.json</code> exist?<br>
      3. Check Console tab for fetch errors<br>
      <br>
      <small>Run: <code>python3 -m http.server 8000</code></small>
    `);
    return;
  }
  
  // Handle both array and object formats
  const projects = Array.isArray(projectsData) ? projectsData : (projectsData.items || []);
  
  if (projects.length === 0) {
    showEmptyState('No projects found. Add entries to <code>assets/data/projects.json</code>');
    return;
  }
  
  // Set page header
  setText('page-title', projectsData.pageTitle || 'Featured Projects');
  setText('page-desc', projectsData.pageDescription || 'Explore my AI projects.');
  
  // Render projects
  const container = document.getElementById('projects-container');
  if (container) {
    renderProjects(container, projects);
    initProjectFilters(projects);
    
    // Animate cards after render
    setTimeout(() => {
      if (typeof initScrollAnimations === 'function') {
        initScrollAnimations('.project-card');
      }
    }, 100);
  }
  
  console.log(`✅ Successfully loaded ${projects.length} projects`);
});

// ===== RENDER FUNCTIONS (Same as before, with small fixes) =====

function renderProjects(container, projects) {
  container.innerHTML = '';
  
  // Auto-detect category from tags if not provided
  const getCategory = (proj) => {
    if (proj.category) return proj.category;
    const tags = (proj.tags || []).map(t => t.toLowerCase());
    if (tags.some(t => t.includes('agent') || t.includes('langgraph'))) return 'agentic';
    if (tags.some(t => t.includes('medical') || t.includes('health'))) return 'medical';
    if (tags.some(t => t.includes('gan') || t.includes('diffusion'))) return 'generative';
    return 'all';
  };
  
  projects.forEach((proj, index) => {
    const category = getCategory(proj);
    
    const tagsHtml = proj.tags?.length
      ? `<div class="project-tags">${proj.tags.map(t => `<span class="tag" data-category="${category}">${escapeHtml(t)}</span>`).join('')}</div>`
      : '';
    
    const highlightsHtml = proj.highlights?.length
      ? `<ul class="highlights-list">${proj.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}</ul>`
      : '';
    
    // Fix image path: if starts with /assets, make it relative for GH Pages
    let imageSrc = proj.image || '';
    if (imageSrc.startsWith('/assets')) {
      // Convert /assets/... to ../../assets/... for subpages
      imageSrc = '../../' + imageSrc.slice(1);
    }
    
    const imageHtml = imageSrc
      ? `<img src="${imageSrc}" alt="${proj.title}" class="project-thumb" loading="lazy" onerror="this.style.display='none'"/>`
      : '';
    
    const card = document.createElement('article');
    card.className = `project-card glass-card fade-in-up project-${category}`;
    card.style.animationDelay = `${index * 0.08}s`;
    card.dataset.category = category;
    
    card.innerHTML = `
      ${imageHtml}
      <div style="padding:0 1.5rem 1.5rem;flex:1;display:flex;flex-direction:column">
        <h3><a href="${proj.url || '#'}" target="_blank" rel="noopener" class="gradient-text">${escapeHtml(proj.title)}</a></h3>
        <p class="text-muted mt-1">${escapeHtml(proj.description)}</p>
        ${tagsHtml}
        ${highlightsHtml}
        <div style="margin-top:auto;padding-top:1rem">
          <a href="${proj.url || '#'}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
            ${proj.url ? 'View Project' : 'Details'} →
          </a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function initProjectFilters(projects) {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.dataset.filter;
      
      cards.forEach(card => {
        const category = card.dataset.category;
        const shouldShow = filter === 'all' || category === filter;
        
        if (shouldShow) {
          card.classList.remove('filtered-out');
          card.classList.add('filtered-in');
          card.style.display = '';
        } else {
          card.classList.remove('filtered-in');
          card.classList.add('filtered-out');
          setTimeout(() => {
            if (card.classList.contains('filtered-out')) card.style.display = 'none';
          }, 400);
        }
      });
    };
  });
}

function showEmptyState(message) {
  const container = document.getElementById('projects-container');
  if (container) {
    container.innerHTML = `
      <div class="glass-card" style="text-align:center;padding:3rem 2rem;grid-column:1/-1">
        <div class="spinner" style="margin:0 auto 1.5rem"></div>
        <p class="text-muted" style="white-space:pre-line">${message}</p>
      </div>
    `;
  }
}

// Safe HTML escape
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}