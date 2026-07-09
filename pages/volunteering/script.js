// pages/volunteering/script.js

document.addEventListener('DOMContentLoaded', async () => {
  const DATA_URL = '../../assets/data/volunteering.json?v=' + new Date().getTime();
  
  try {
    let data;
    
    // Support global fetchJSON helper if available
    if (typeof fetchJSON === 'function') {
      data = await fetchJSON(DATA_URL);
    } else {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      data = await res.json();
    }
    
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid database format. Expected array.');
    }
    
    // Find featured and standard items
    const featuredItems = data.filter(item => item.type === 'featured');
    const contributions = data.filter(item => item.type === 'contribution');
    
    // 1. Render Featured Events
    const featuredContainer = document.getElementById('featured-container');
    if (featuredContainer && featuredItems.length > 0) {
      featuredContainer.innerHTML = featuredItems.map((featuredItem, index) => {
        const isAlternate = index % 2 === 1;
        const layoutClass = isAlternate ? 'featured-container-alternate' : '';
        
        let imageCaptions = ["Event Photo", "Event Photo"];
        if (featuredItem.organization.includes("Alo Bhubon")) {
          imageCaptions = [
            "Alo Bhubon Trust Joint Cancer Seminar at Nascent Gardenia, Dhaka",
            "Strategic Medical Imaging Procurement Discussions with Rotary Clubs"
          ];
        } else if (featuredItem.organization.includes("National Children")) {
          imageCaptions = [
            "Grassroots Child Rights Human Chain Advocacy in Satkhira",
            "NCTF Committee Press Release and Child Rights Briefing"
          ];
        }
        
        const imagesHtml = featuredItem.images && featuredItem.images.length > 0 
          ? featuredItem.images.map((src, i) => `
              <div class="image-card glass-card">
                <img src="${src}" alt="${escapeHtml(featuredItem.organization)} Photo ${i + 1}" loading="lazy" />
                <div class="image-caption">${imageCaptions[i] || 'Event Photo'}</div>
              </div>
            `).join('')
          : '<p class="text-muted">No event photos available.</p>';
          
        return `
          <div class="featured-item-wrapper ${layoutClass}">
            <div class="featured-info fade-in-up">
              <div class="event-meta">
                <span class="meta-item">
                  <span class="meta-icon">🏢</span>
                  <span>${escapeHtml(featuredItem.organization)}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-icon">📅</span>
                  <span>${escapeHtml(featuredItem.date)}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-icon">📍</span>
                  <span>${escapeHtml(featuredItem.location)}</span>
                </span>
              </div>
              
              <h2 style="font-size: 2.2rem; color: #f8fafc; line-height: 1.25; margin-bottom: 0.5rem;">
                ${escapeHtml(featuredItem.role)}
              </h2>
              <h3 class="gradient-text" style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem; line-height: 1.4;">
                ${escapeHtml(featuredItem.event)}
              </h3>
              
              <p class="text-muted" style="line-height: 1.8; font-size: 1.05rem; margin-bottom: 1.5rem;">
                ${escapeHtml(featuredItem.description)}
              </p>
              
              <div class="collaborators-box">
                <div class="collaborators-title">Joint Collaborators</div>
                <ul class="collaborators-list">
                  ${featuredItem.collaborators.map(c => `<li class="collaborator-tag">${escapeHtml(c)}</li>`).join('')}
                </ul>
              </div>
              
              <div style="margin-top: 1.5rem;">
                <h4 style="color: #f1f5f9; margin-bottom: 1rem; font-size: 1.1rem; font-weight: 600;">Key Initiatives & Contributions</h4>
                <ul class="initiatives-list">
                  ${featuredItem.keyInitiatives.map(ki => `<li class="initiative-item">${escapeHtml(ki)}</li>`).join('')}
                </ul>
              </div>
              
              <div style="margin-top: 2rem; display: flex; flex-wrap: wrap; gap: 1rem;">
                ${featuredItem.referenceUrl ? `
                  <a href="${featuredItem.referenceUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 0.75rem 1.5rem; font-size: 0.95rem;">
                    View Official Site →
                  </a>
                ` : ''}
                ${featuredItem.socialUrl ? `
                  <a href="${featuredItem.socialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="padding: 0.75rem 1.5rem; font-size: 0.95rem; border-color: var(--accent); color: var(--accent);">
                    View Social Media →
                  </a>
                ` : ''}
              </div>
            </div>
            
            <div class="featured-images fade-in-up" style="animation-delay: 0.1s;">
              ${imagesHtml}
            </div>
          </div>
        `;
      }).join('');
    }
    
    // 2. Render Contributions Grid
    const contributionsContainer = document.getElementById('contributions-container');
    if (contributionsContainer && contributions.length > 0) {
      contributionsContainer.innerHTML = contributions.map((c, i) => `
        <article class="glass-card volunteering-card fade-in-up" style="animation-delay: ${(i + 1) * 0.1}s">
          <div class="volunteering-date">${escapeHtml(c.date)}</div>
          <h3>${escapeHtml(c.role)}</h3>
          <h4>${escapeHtml(c.organization)}</h4>
          <p>${escapeHtml(c.description)}</p>
          
          ${c.keyInitiatives && c.keyInitiatives.length > 0 ? `
            <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem; margin-top: auto;">
              <ul class="card-initiatives">
                ${c.keyInitiatives.map(ki => `<li class="card-initiative-item">${escapeHtml(ki)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </article>
      `).join('');
    }
    
  } catch (error) {
    console.error("Failed to load volunteering.json data:", error);
    const featured = document.getElementById('featured-container');
    if (featured) {
      featured.innerHTML = `
        <div style="grid-column: 1 / -1; color: #ef4444; text-align: center; padding: 2rem; background: rgba(239, 68, 68, 0.1); border-radius: 12px;">
          <strong>Error loading volunteering data:</strong><br/>
          ${error.message}
        </div>
      `;
    }
  }
});

// Escape HTML utility to prevent scripts injection
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
