document.addEventListener("DOMContentLoaded", () => {
  // Fetch data from JSON
  fetch("assets/data.json")
    .then(response => response.json())
    .then(data => {
      populatePersonal(data.personal);
      populateProjects(data.projects);
      populateCerts(data.certifications);
      populateSkills(data.skills);
      populateAchievements(data.achievements);
      populateEducation(data.education);
      populateExtras(data.extracurriculars);
      populateLanguages(data.languages);
      populateResearch(data.research_experience); 
    })
    .catch(error => console.error("Error loading CV data:", error));

  function populatePersonal(data) {
    document.getElementById("user-name").textContent = data.name;
    document.getElementById("profile-pic").src = data.image;
    document.getElementById("objective-text").textContent = data.objective;

    const contactDiv = document.getElementById("contact-info");
    contactDiv.innerHTML = `
      <p><i class="fas fa-envelope"></i> ${data.email}</p>
      <p><i class="fas fa-phone"></i> ${data.phone}</p>
      <p><i class="fab fa-github"></i> <a href="${data.github_url}" target="_blank">${data.github_text}</a></p>
      <p><i class="fab fa-linkedin"></i> <a href="${data.linkedin_url}" target="_blank">${data.linkedin_text}</a></p>
      <p><i class="fab fa-facebook"></i> <a href="${data.facebook_url}" target="_blank">${data.facebook_text}</a></p>
      <p><strong>${data.status}</strong></p>
    `;
  }
  function populateResearch(research) {
    const container = document.getElementById("research-container");
    research.forEach(item => {
      const detailsList = item.details.map(detail => `<li>${detail}</li>`).join("");
      container.innerHTML += `
        <div class="card">
          <h3>${item.role} <span style="font-weight:normal; font-size:16px;">| ${item.organization}</span> <span style="float:right; font-size:14px; color:var(--text-light);">${item.duration}</span></h3>
          <p style="font-weight: 600; color: var(--primary-color); margin-top: 5px;">${item.title}</p>
          <ul>${detailsList}</ul>
        </div>
      `;
    });
  }

  function populateProjects(projects) {
    const container = document.getElementById("projects-container");
    projects.forEach(proj => {
      const detailsList = proj.details.map(detail => `<li>${detail}</li>`).join("");
      container.innerHTML += `
        <div class="card">
          <h3><a href="${proj.url}" target="_blank">${proj.title}</a></h3>
          <p>${proj.description}</p>
          <ul>${detailsList}</ul>
        </div>
      `;
    });
  }

  function populateCerts(certs) {
    const container = document.getElementById("certs-container");
    certs.forEach(cert => {
      container.innerHTML += `
        <div class="card">
          <h3><a href="${cert.url}" target="_blank">${cert.title}</a></h3>
          <p>${cert.description}</p>
          <p><em>Skills:</em> ${cert.skills}</p>
        </div>
      `;
    });
  }

  function populateSkills(skills) {
    const container = document.getElementById("skills-container");
    skills.forEach(skill => {
      container.innerHTML += `
        <div class="skill-category">
          <h3>${skill.category}</h3>
          <p>${skill.items}</p>
        </div>
      `;
    });
  }

  function populateAchievements(achievements) {
    const container = document.getElementById("achievements-container");
    achievements.forEach(ach => {
      container.innerHTML += `<li><a href="${ach.url}" target="_blank">${ach.title}</a></li>`;
    });
  }

  function populateEducation(education) {
    const container = document.getElementById("education-container");
    education.forEach(edu => {
      container.innerHTML += `<li><strong>${edu.degree}</strong>, ${edu.institution} — ${edu.details}</li>`;
    });
  }

  function populateExtras(extras) {
    const container = document.getElementById("extra-container");
    extras.forEach(extra => {
      const detailsList = extra.details.map(detail => `<li>${detail}</li>`).join("");
      container.innerHTML += `
        <div class="card">
          <h3>${extra.role} at ${extra.org} (${extra.duration})</h3>
          <ul>${detailsList}</ul>
        </div>
      `;
    });
  }

  function populateLanguages(languages) {
    const container = document.getElementById("languages-container");
    languages.forEach(lang => {
      container.innerHTML += `
        <div class="language-item">
          <strong>${lang.name}</strong>
          <div class="levelskills">
            <span>Read</span><div class="level ${lang.levels.Read}"></div>
            <span>Write</span><div class="level ${lang.levels.Write}"></div>
            <span>Speak</span><div class="level ${lang.levels.Speak}"></div>
            <span>Listen</span><div class="level ${lang.levels.Listen}"></div>
          </div>
        </div>
      `;
    });
  }
});