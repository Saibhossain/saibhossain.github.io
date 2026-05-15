/**
 * Skills Bar Renderer
 * Renders animated skill proficiency bars
 */

/**
 * Render skills from data
 * @param {string} containerId - Target container ID
 * @param {Object} skills - Skills object from JSON (category: [{name, level}])
 */
function renderSkills(containerId, skills) {
  const container = document.getElementById(containerId);
  if (!container || !skills || typeof skills !== 'object') return;
  
  container.innerHTML = '';
  
  Object.entries(skills).forEach(([category, items], index) => {
    if (!Array.isArray(items)) return;
    
    const section = document.createElement('div');
    section.className = 'glass-card fade-in-up';
    section.style.animationDelay = `${index * 0.1}s`;
    
    const skillsHtml = items.map((skill, i) => {
      const level = Math.max(0, Math.min(100, skill.level || 0));
      return `
        <div class="skill-item" style="animation-delay: ${i * 0.05}s">
          <div class="skill-name">${escapeHtml(skill.name || 'Unknown')}</div>
          <div class="skill-bar" role="progressbar" aria-valuenow="${level}" aria-valuemin="0" aria-valuemax="100">
            <div class="skill-fill" style="--level: ${level}%"></div>
          </div>
        </div>
      `;
    }).join('');
    
    section.innerHTML = `
      <h4 class="mb-2 gradient-text">${escapeHtml(category)}</h4>
      <div class="skills-grid">${skillsHtml}</div>
    `;
    container.appendChild(section);
  });
}

// Export
if (typeof module !== 'undefined') {
  module.exports = { renderSkills };
}