# saibhossain.github.io


```bash

    portfolio/
    ├── index.html                    # Home/Landing page
    │
    ├── assets/
    │   ├── css/
    │   │   ├── base.css              # CSS variables, resets, utilities (shared)
    │   │   ├── components.css        # Reusable UI: cards, buttons, nav (shared)
    │   │   ├── layout.css            # Grid, containers, responsive (shared)
    │   │   └── animations.css        # Animations (shared)
    │   │
    │   ├── js/
    │   │   ├── core/
    │   │   │   ├── config.js         # Global config: paths, settings
    │   │   │   ├── utils.js          # Helpers: fetchJSON, escapeHtml, render
    │   │   │   └── nav.js            # Navigation logic (shared)
    │   │   └── components/
    │   │       ├── links.js          # Link card renderer (shared)
    │   │       └── skills.js         # Skill bar renderer (shared)
    │   │
    │   ├── data/
    │   │   ├── global.json           # Shared: name, links, skills, meta
    │   │   ├── about.json            # About page content
    │   │   ├── research.json         # Research page content
    │   │   ├── projects.json         # Projects page content
    │   │   ├── experience.json       # Experience page content
    │   │   ├── volunteering.json     # Volunteering page content
    │   │   ├── startup.json          # Startup page content
    │   │   └── contact.json          # Contact page content
    │   │
    │   └── images/
    │       ├── profile.webp
    │       ├── profile.jpg           # Fallback
    │       ├── favicon.svg
    │       └── og-image.png
    │
    ├── pages/
    │   ├── about/
    │   │   ├── index.html
    │   │   ├── styles.css            # Page-specific overrides (optional)
    │   │   └── script.js             # Page-specific logic (optional)
    │   │
    │   ├── research/
    │   │   ├── index.html
    │   │   ├── styles.css
    │   │   └── script.js
    │   │
    │   ├── projects/
    │   │   ├── index.html
    │   │   ├── styles.css
    │   │   └── script.js
    │   │
    │   ├── experience/
    │   │   ├── index.html
    │   │   ├── styles.css
    │   │   └── script.js
    │   │
    │   ├── volunteering/
    │   │   ├── index.html
    │   │   ├── styles.css
    │   │   └── script.js
    │   │
    │   ├── startup/
    │   │   ├── index.html
    │   │   ├── styles.css
    │   │   └── script.js
    │   │
    │   └── contact/
    │       ├── index.html
    │       ├── styles.css
    │       └── script.js
    │
    ├── includes/
    │   ├── header.html               # Reusable nav header (loaded via JS)
    │   ├── footer.html               # Reusable footer (loaded via JS)
    │   └── meta.html                 # Reusable meta tags snippet
    │
    ├── .github/
    │   └── workflows/
    │       └── deploy.yml            # Auto-deploy to GitHub Pages
    │
    ├── CNAME                         # Custom domain (optional)
    ├── README.md                     # Setup instructions
    ├── .gitignore
    └── package.json                  # Optional: build scripts
    
```






