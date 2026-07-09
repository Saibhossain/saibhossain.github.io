document.addEventListener('DOMContentLoaded', async () => {
    // Path to your JSON database
    const DATA_URL = '../../assets/data/about.json?v=' + new Date().getTime();

    try {
        let data;

        // Check if fetchJSON from your utils.js exists, otherwise fallback to standard fetch
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
                .map(para => `<p style="margin-bottom: 1.2rem; color: #94a3b8; line-height: 1.7;">${para}</p>`)
                .join('');
        }

        // 3. Professional Aims
        const aimsContainer = document.getElementById('aims-container');
        if (aimsContainer && data.aims) {
            aimsContainer.innerHTML = data.aims
                .map(aim => `
          <div class="aim-item glass-card">
            <h4 style="margin-bottom: 0.5rem; color: #e2e8f0;">${aim.title}</h4>
            <p style="margin: 0; color: #94a3b8; font-size: 0.95rem;">${aim.description}</p>
          </div>
        `).join('');
        }



        // 5. Awards & Honors
        const awardsContainer = document.getElementById('awards-container');
        if (awardsContainer && data.awards) {
            awardsContainer.innerHTML = data.awards
                .map(award => `
          <div class="list-item">
            <div class="list-date">${award.date}</div>
            <div class="list-content">
              <h4 style="margin: 0 0 0.3rem 0; color: #e2e8f0;">${award.title}</h4>
              <div style="font-size: 0.85rem; color: #60a5fa; margin-bottom: 0.5rem;">${award.issuer}</div>
              <p style="margin: 0; color: #94a3b8; font-size: 0.95rem;">${award.description}</p>
            </div>
          </div>
        `).join('');
        }

        // 6. Blog Posts
        const blogsContainer = document.getElementById('blogs-container');
        if (blogsContainer && data.blogPosts) {
            blogsContainer.innerHTML = data.blogPosts
                .map((post, index) => {
                    const isFirst = index === 0;
                    const highlightClass = isFirst ? 'card-highlight' : '';
                    const linkText = isFirst ? 'Read on Medium →' : 'Read Article →';
                    return `
          <div class="card glass-card ${highlightClass}">
            <div class="card-meta">${post.date} &bull; ${post.readTime}</div>
            <h4 class="card-title" style="margin-bottom: 0.75rem;">
              <a href="${post.url}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: none;">${post.title}</a>
            </h4>
            <p class="card-desc" style="margin-bottom: 1.5rem;">${post.snippet}</p>
            <div style="margin-top: auto;">
              <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="btn btn-sm ${isFirst ? 'btn-primary' : 'btn-outline'}" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                ${linkText}
              </a>
            </div>
          </div>
        `;
                }).join('');
        }

        // 7. Hobbies
        const hobbiesContainer = document.getElementById('hobbies-container');
        if (hobbiesContainer && data.hobbies) {
            hobbiesContainer.innerHTML = data.hobbies
                .map(hobby => `
          <div class="card glass-card" style="text-align: center; align-items: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">${hobby.icon}</div>
            <h4 class="card-title gradient-text" style="margin-bottom: 0.5rem;">${hobby.name}</h4>
            <p class="card-desc" style="text-align: center;">${hobby.description}</p>
          </div>
        `).join('');
        }

        // 8. Navigation CTAs
        const navContainer = document.getElementById('nav-container');
        if (navContainer && data.navigation) {
            navContainer.innerHTML = data.navigation
                .map(nav => `
          <a href="${nav.url}" class="nav-card glass-card">
            <span class="nav-icon">${nav.icon}</span>
            <h4 style="font-size: 1.4rem; margin-bottom: 0.5rem; color: #e2e8f0;">${nav.title} &rarr;</h4>
            <p style="color: #94a3b8; margin: 0; font-size: 0.95rem;">${nav.description}</p>
          </a>
        `).join('');
        }

    } catch (error) {
        console.error("Failed to load about.json data:", error);
        const mainSection = document.getElementById('main');
        if (mainSection) {
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = "color: #ef4444; text-align: center; padding: 2rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; margin: 2rem auto; max-width: 600px;";
            errorMsg.innerHTML = `<strong>Error loading profile data:</strong><br/>${error.message}<br/>Make sure your local server is running and the JSON path is correct.`;
            mainSection.prepend(errorMsg);
        }
    }
});