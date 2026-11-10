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

    // 5. Blog Posts & Publications
    const blogsContainer = document.getElementById('blogs-container');
    if (blogsContainer && data.blogPosts) {
      blogsContainer.innerHTML = data.blogPosts
        .map((post, index) => {
          const isFeatured = post.featured || index === 0;
          const imageSrc = post.image ? resolveAssetPath(post.image) : '';
          const linkText = post.linkText || (post.url && post.url.includes('.pdf') ? 'Read Publication (PDF) →' : 'Read Article →');

          // If featured with image, render rich 2-column hero card
          if (isFeatured && imageSrc) {
            return `
              <article class="card-featured-blog glass-card">
                <div class="blog-thumb-col">
                  <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="blog-thumb-wrap" aria-label="Open ${escapeHtml(post.title)} in PDF">
                    <img src="${imageSrc}" alt="${escapeHtml(post.title)} Article Preview" class="blog-thumb" loading="lazy" />
                    <div class="blog-thumb-overlay">
                      <span class="blog-thumb-badge">AFOMP Publication • Pages ${escapeHtml(post.pages || '32–35')}</span>
                      <span class="blog-thumb-action">Read Full PDF ↗</span>
                    </div>
                  </a>
                </div>

                <div class="blog-content-col">
                  <div class="blog-header-row">
                    ${post.publisher_logo ? `
                      <div class="publisher-logo-box" title="${escapeHtml(post.publisher || 'AFOMP')}">
                        <img src="${post.publisher_logo}" alt="${escapeHtml(post.publisher || 'Publisher Logo')}" class="publisher-logo" onerror="this.parentElement.style.display='none'" />
                      </div>
                    ` : ''}
                    <div class="blog-badges">
                      <span class="badge-pill badge-primary">${escapeHtml(post.date)}</span>
                      <span class="badge-pill">${escapeHtml(post.readTime)}</span>
                      ${post.pages ? `<span class="badge-pill badge-outline">Pages ${escapeHtml(post.pages)}</span>` : ''}
                    </div>
                  </div>

                  <h3 class="featured-blog-title">
                    <a href="${post.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.title)}</a>
                  </h3>

                  <div class="featured-blog-body">
                    ${formatSnippet(post.snippet)}
                  </div>

                  <div class="blog-actions-row">
                    <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                      <span>${escapeHtml(linkText)}</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                    <a href="${imageSrc}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" title="Inspect Page 35 Preview">
                      <span>Page 35 Preview</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </a>
                  </div>
                </div>
              </article>
            `;
          }

          // Standard cards for other blog posts
          return `
            <div class="card glass-card blog-card-standard">
              <div class="card-meta-row">
                <span class="card-meta">${escapeHtml(post.date)} &bull; ${escapeHtml(post.readTime)}</span>
                ${post.publisher ? `<span class="card-publisher-tag">${escapeHtml(post.publisher)}</span>` : ''}
              </div>
              <h4 class="card-title">
                <a href="${post.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(post.title)}</a>
              </h4>
              <div class="card-desc">${formatSnippet(post.snippet)}</div>
              <div class="card-footer-action">
                <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline">
                  ${escapeHtml(linkText)}
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

/**
 * Resolves relative asset paths for pages inside /pages/about/
 */
function resolveAssetPath(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('../../')) return path;
  if (path.startsWith('../')) return '../' + path;
  if (path.startsWith('assets/')) return '../../' + path;
  return '../../' + path;
}

/**
 * Formats blog snippet paragraphs and bullet points nicely
 */
function formatSnippet(snippet) {
  if (!snippet) return '';
  const lines = snippet.split('\n').map(l => l.trim()).filter(Boolean);
  let html = '';
  let inList = false;

  lines.forEach(line => {
    if (line.startsWith('•') || line.startsWith('-')) {
      if (!inList) {
        html += '<ul class="blog-snippet-list">';
        inList = true;
      }
      const rawContent = line.replace(/^[•\-]\s*/, '');
      const colonIdx = rawContent.indexOf(':');
      if (colonIdx !== -1) {
        const title = rawContent.substring(0, colonIdx);
        const rest = rawContent.substring(colonIdx + 1);
        html += `<li><strong>${escapeHtml(title)}:</strong> ${escapeHtml(rest.trim())}</li>`;
      } else {
        html += `<li>${escapeHtml(rawContent)}</li>`;
      }
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      // If it looks like an outro or reflection, give it an outro class
      const isOutro = /building and designing|writing this overview|in summary/i.test(line);
      const cls = isOutro ? 'blog-snippet-outro' : 'blog-snippet-intro';
      html += `<p class="${cls}">${escapeHtml(line)}</p>`;
    }
  });

  if (inList) html += '</ul>';
  return html;
}