document.addEventListener('DOMContentLoaded', async () => {
  const DATA_URL = '../../assets/data/about.json?v=' + new Date().getTime();

  try {
    let data;

    if (typeof fetchJSON === 'function') {
      data = await fetchJSON(DATA_URL);
    } else {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      data = await response.json();
    }

    if (!data) throw new Error("Data object is empty or undefined.");

    // 1. Hero Section
    const nameEl = document.getElementById('hero-name');
    const roleEl = document.getElementById('hero-role');
    if (nameEl) {
      nameEl.textContent = data.name;
      nameEl.classList.remove('loading-pulse');
    }
    if (roleEl) {
      roleEl.textContent = data.role;
      roleEl.classList.remove('loading-pulse');
    }

    // 2. Biography
    const bioContainer = document.getElementById('bio-container');
    if (bioContainer && data.biography) {
      bioContainer.innerHTML = data.biography
        .map(para => `<p>${escapeHtml(para)}</p>`)
        .join('');
    }

    // 3. Professional Aims
    const aimsContainer = document.getElementById('aims-container');
    if (aimsContainer && data.aims) {
      aimsContainer.innerHTML = data.aims
        .map(aim => `
          <div class="aim-item glass-card">
            <h4>${escapeHtml(aim.title)}</h4>
            <p>${escapeHtml(aim.description)}</p>
          </div>
        `).join('');
    }

    // 4. Awards & Honors
    const awardsContainer = document.getElementById('awards-container');
    if (awardsContainer && data.awards) {
      awardsContainer.innerHTML = data.awards
        .map(award => `
          <div class="list-item">
            <div class="list-date">${escapeHtml(award.date)}</div>
            <div class="list-content">
              <h4>${escapeHtml(award.title)}</h4>
              <div class="list-issuer">${escapeHtml(award.issuer)}</div>
              <p class="list-desc">${escapeHtml(award.description)}</p>
            </div>
          </div>
        `).join('');
    }

    // 5. Blog Posts
    const blogsContainer = document.getElementById('blogs-container');
    if (blogsContainer && data.blogPosts) {
      blogsContainer.innerHTML = data.blogPosts
        .map((post, index) => {
          const isFirst = index === 0;
          const highlightClass = isFirst ? 'card-highlight' : '';
          const linkText = isFirst ? 'Read on Medium →' : 'Read Article →';
          return `
            <div class="card glass-card ${highlightClass}">
              <div class="card-meta">${escapeHtml(post.date)} &bull; ${escapeHtml(post.readTime)}</div>
              <h4 class="card-title">
                <a href="${post.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.title)}</a>
              </h4>
              <p class="card-desc">${escapeHtml(post.snippet)}</p>
              <div style="margin-top: 1.5rem;">
                <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm ${isFirst ? 'btn-primary' : 'btn-outline'}">
                  ${linkText}
                </a>
              </div>
            </div>
          `;
        }).join('');
    }

    // 6. Hobbies
    const hobbiesContainer = document.getElementById('hobbies-container');
    if (hobbiesContainer && data.hobbies) {
      hobbiesContainer.innerHTML = data.hobbies
        .map(hobby => `
          <div class="card glass-card" style="text-align: center; align-items: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">${hobby.icon}</div>
            <h4 class="card-title gradient-text" style="margin-bottom: 0.5rem;">${escapeHtml(hobby.name)}</h4>
            <p class="card-desc" style="text-align: center;">${escapeHtml(hobby.description)}</p>
          </div>
        `).join('');
    }

    // 7. Navigation CTAs
    const navContainer = document.getElementById('nav-container');
    if (navContainer && data.navigation) {
      navContainer.innerHTML = data.navigation
        .map(nav => `
          <a href="${nav.url}" class="nav-card glass-card">
            <span class="nav-icon">${nav.icon}</span>
            <h4>${escapeHtml(nav.title)} &rarr;</h4>
            <p>${escapeHtml(nav.description)}</p>
          </a>
        `).join('');
    }

  } catch (error) {
    console.error("Failed to load about.json data:", error);
  }
});

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}