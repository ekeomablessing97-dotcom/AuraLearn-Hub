document.addEventListener('DOMContentLoaded', () => {
    const lessonsGrid = document.getElementById('lessons-grid');
    const filterChips = document.querySelectorAll('.filter-chip');
    let allLessons = [];

    // Fetch and render lessons catalog
    function fetchCatalog() {
        fetch('/api/lessons')
            .then(res => res.json())
            .then(lessons => {
                allLessons = lessons;
                renderLessons(lessons);
            });
    }

    function renderLessons(lessonsToRender) {
        lessonsGrid.innerHTML = '';
        if (lessonsToRender.length === 0) {
            lessonsGrid.innerHTML = '<p>No lessons found in this category.</p>';
            return;
        }

        lessonsToRender.forEach(lesson => {
            const card = document.createElement('div');
            card.className = 'card lesson-card';
            card.innerHTML = `
                <div>
                    <span class="badge">${lesson.subject} • ${lesson.level}</span>
                    <h4 style="margin: 0.3rem 0; color: var(--primary-dark);">${lesson.title}</h4>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${lesson.summary}</p>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <span style="font-size: 0.75rem; color: var(--accent-blue); font-weight: 600;">${lesson.is_pro_locked ? '🔒 Pro Video & Notes' : 'Free Preview'}</span>
                    <button class="btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Start Lesson &rarr;</button>
                </div>
            `;
            card.addEventListener('click', () => {
                window.location.href = `/lesson/${lesson.id}`;
            });
            lessonsGrid.appendChild(card);
        });
    }

    // Category filter logic
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const cat = chip.getAttribute('data-category');
            if (cat === 'all') {
                renderLessons(allLessons);
            } else {
                renderLessons(allLessons.filter(l => l.category === cat));
            }
        });
    });

    // AI Detective handler
    const askBtn = document.getElementById('ask-detective-btn');
    const queryInput = document.getElementById('detective-query');
    const responseBox = document.getElementById('detective-response');

    askBtn.addEventListener('click', () => {
        const query = queryInput.value.trim();
        if (!query) return;
        responseBox.style.display = 'block';
        responseBox.textContent = 'AuraLearn AI is analyzing your question...';

        fetch('/api/detective', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query, topic: 'general' })
        })
        .then(res => res.json())
        .then(data => {
            responseBox.textContent = data.advice;
        });
    });

    // PWA Install Prompt Handler
    let deferredPrompt;
    const installBanner = document.getElementById('install-banner');
    const installActionBtn = document.getElementById('install-action-btn');
    const installDismissBtn = document.getElementById('install-dismiss-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBanner.style.display = 'block';
    });

    installActionBtn.addEventListener('click', () => {
        installBanner.style.display = 'none';
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                deferredPrompt = null;
            });
        }
    });

    installDismissBtn.addEventListener('click', () => {
        installBanner.style.display = 'none';
    });

    // Register Service Worker for PWA support
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/static/sw.js');
    }

    fetchCatalog();
});