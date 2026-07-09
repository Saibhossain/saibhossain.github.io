/**
 * Experience Page JS
 * Fetches experience.json database and dynamically renders a filterable, premium timeline layout.
 */
document.addEventListener('DOMContentLoaded', async () => {
  const DATA_URL = '../../assets/data/experience.json?v=' + new Date().getTime();
  let experienceData = null;
  let activeFilter = 'all';

  try {
    // 1. Fetch JSON Data
    if (typeof fetchJSON === 'function') {
      experienceData = await fetchJSON(DATA_URL);
    } else {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      experienceData = await response.json();
    }

    if (!experienceData) throw new Error("Experience data is empty or undefined.");

    // 2. Render Hero Title and Subtitle
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');
    if (titleEl && experienceData.page_title) {
      titleEl.textContent = experienceData.page_title;
      titleEl.classList.remove('loading-pulse');
    }
    if (subtitleEl && experienceData.page_subtitle) {
      subtitleEl.textContent = experienceData.page_subtitle;
      subtitleEl.classList.remove('loading-pulse');
    }

    // 3. Setup Filters
    renderFilters();

    // 4. Initial Timeline Render
    renderTimeline();

  } catch (error) {
    console.error("Failed to load experience database:", error);
    const container = document.getElementById('timeline-container');
    if (container) {
      container.innerHTML = `
        <div style="color: #ef4444; text-align: center; padding: 2rem; background: rgba(239, 68, 68, 0.1); border-radius: 12px; margin: 2rem auto; max-width: 600px;">
          <strong>Error loading experience:</strong><br/>
          ${error.message}
        </div>
      `;
    }
  }

  // --- RENDERING FUNCTIONS ---

  function renderFilters() {
    const filterBar = document.getElementById('filter-bar');
    if (!filterBar || !experienceData.categories) return;

    filterBar.innerHTML = experienceData.categories.map(cat => `
      <button class="filter-btn ${cat.id === activeFilter ? 'active' : ''}" data-filter="${cat.id}">
        ${escapeHtml(cat.label)}
      </button>
    `).join('');

    // Filter click listeners
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        if (filter === activeFilter) return;

        activeFilter = filter;
        
        // Update active class
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Re-render timeline with transition
        const container = document.getElementById('timeline-container');
        if (container) {
          container.style.opacity = 0;
          setTimeout(() => {
            renderTimeline();
            container.style.opacity = 1;
          }, 200);
        }
      });
    });
  }

  function renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container || !experienceData.timeline) return;

    // Filter items
    const filteredTimeline = experienceData.timeline.filter(item => {
      if (activeFilter === 'all') return true;
      return item.category === activeFilter;
    });

    if (filteredTimeline.length === 0) {
      container.innerHTML = `<p class="text-center text-muted" style="padding: 3rem 0;">No experience entries found in this category.</p>`;
      return;
    }

    container.innerHTML = filteredTimeline.map((item, index) => {
      // Map custom bullet tag colors from skills_legend if matched, otherwise use defaults
      const skillsHtml = item.skills && item.skills.length > 0
        ? item.skills.map(skill => {
            const color = (experienceData.skills_legend && experienceData.skills_legend[skill]) || 'var(--border-color)';
            return `<span class="skill-tag" style="--skill-border: ${color}">${escapeHtml(skill)}</span>`;
          }).join('')
        : '';

      const responsibilitiesHtml = item.key_responsibilities && item.key_responsibilities.length > 0
        ? `<div class="responsibilities-section">
            <h5 style="color: #cbd5e1; margin-bottom: 0.75rem; font-size: 0.95rem; font-weight: 600;">Key Responsibilities</h5>
            <ul class="resp-list">
              ${item.key_responsibilities.map(resp => `<li class="resp-item">${escapeHtml(resp)}</li>`).join('')}
            </ul>
           </div>`
        : '';

      const achievementsHtml = item.achievements && item.achievements.length > 0
        ? `<div class="achievements-section" style="margin-top: 1.25rem; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 1rem;">
            <h5 style="color: #60a5fa; margin-bottom: 0.5rem; font-size: 0.95rem; font-weight: 600;">Key Accomplishments</h5>
            <ul class="achievements-list" style="margin: 0; padding-left: 1.25rem; color: #94a3b8; font-size: 0.9rem; line-height: 1.6;">
              ${item.achievements.map(ach => `<li>${escapeHtml(ach)}</li>`).join('')}
            </ul>
           </div>`
        : '';

      return `
        <div class="timeline-item fade-in-up" style="animation-delay: ${index * 0.1}s">
          <!-- Timeline point node -->
          <div class="timeline-node">
            <div class="node-glow"></div>
            <span class="node-icon">${item.category === 'engineering' ? '💻' : '🔬'}</span>
          </div>

          <!-- Date side column -->
          <div class="timeline-date-col">
            <div class="date-badge">${escapeHtml(item.start_date)} — ${escapeHtml(item.end_date)}</div>
            <div class="duration-tag">${escapeHtml(item.duration)}</div>
          </div>

          <!-- Content card column -->
          <div class="timeline-card-col">
            <div class="card glass-card">
              <div class="card-header">
                <div>
                  <h3 class="role-title">${escapeHtml(item.title)}</h3>
                  <h4 class="company-name gradient-text">${escapeHtml(item.company)}</h4>
                </div>
                <div style="text-align: right;">
                  <span class="location-badge">📍 ${escapeHtml(item.location)}</span>
                  <span class="job-type-badge">${escapeHtml(item.job_type)}</span>
                </div>
              </div>

              <p class="description-text">${escapeHtml(item.description)}</p>

              ${responsibilitiesHtml}
              ${achievementsHtml}

              <!-- Skill Tags Container -->
              <div class="skills-container" style="margin-top: 1.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${skillsHtml}
              </div>

              <!-- View details / redirects link -->
              ${item.link ? `
                <div class="card-footer" style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">
                  <a href="${item.link}" class="btn btn-sm btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.85rem;">
                    View Research Projects &rarr;
                  </a>
                </div>
              ` : ''}

            </div>
          </div>
        </div>
      `;
    }).join('');
  }

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

});