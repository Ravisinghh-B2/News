import { updateInterests } from '../api.js';
import { getFrom, saveTo, showToast } from '../utils.js';

export class InterestsPage {
    constructor() {
        this.allInterests = [
            'Artificial Intelligence', 'Machine Learning', 'Space Exploration', 
            'Indian Startups', 'Cybersecurity', 'Electric Vehicles', 
            'Cricket', 'Bollywood', 'Global Economy', 'Environment', 
            'Gadgets', 'Health & Wellness', 'Gaming', 'Politics', 'Science'
        ];
        this.selectedInterests = [];
    }

    async render() {
        const user = getFrom('user');
        if (!user) {
            window.location.href = '/auth.html';
            return;
        }

        const grid = document.getElementById('news-grid');
        const newsSection = document.querySelector('.news-section');
        if (!grid || !newsSection) return;

        // Cleanup
        grid.className = 'news-grid';
        const titleEl = newsSection.querySelector('h2');
        if (titleEl) titleEl.textContent = 'Personalize Your Feed';

        // Set current interests
        this.selectedInterests = user.interests || [];

        grid.innerHTML = `
            <div class="interests-container">
                <p class="lead text-center">Select the topics you care about most to get a custom news experience.</p>
                <div class="interests-grid">
                    ${this.allInterests.map(interest => `
                        <div class="interest-tag ${this.selectedInterests.includes(interest) ? 'active' : ''}" data-interest="${interest}">
                            ${interest}
                        </div>
                    `).join('')}
                </div>
                <div class="interests-actions">
                    <button class="btn primary-btn save-interests-btn">Save My Interests</button>
                    <button class="btn secondary-btn back-home-btn">Go to My Feed</button>
                </div>
            </div>
        `;

        this.initEvents(grid, user);
    }

    initEvents(container, user) {
        // Tag clicks
        container.querySelectorAll('.interest-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const interest = tag.dataset.interest;
                if (this.selectedInterests.includes(interest)) {
                    this.selectedInterests = this.selectedInterests.filter(i => i !== interest);
                    tag.classList.remove('active');
                } else {
                    this.selectedInterests.push(interest);
                    tag.classList.add('active');
                }
            });
        });

        // Save button
        container.querySelector('.save-interests-btn').addEventListener('click', async () => {
            try {
                const btn = container.querySelector('.save-interests-btn');
                btn.textContent = 'Saving...';
                btn.disabled = true;

                const response = await updateInterests(this.selectedInterests, user.token);
                
                // Update local storage
                user.interests = this.selectedInterests;
                saveTo('user', user);

                showToast('Interests updated successfully!', 'success');
                btn.textContent = 'Saved!';
                setTimeout(() => {
                    btn.textContent = 'Save My Interests';
                    btn.disabled = false;
                }, 2000);
            } catch (err) {
                showToast('Failed to update interests', 'error');
                const btn = container.querySelector('.save-interests-btn');
                btn.textContent = 'Save My Interests';
                btn.disabled = false;
            }
        });

        // Back to Home
        container.querySelector('.back-home-btn').addEventListener('click', () => {
            if (window.router) {
                window.router.navigateTo('/');
            } else {
                window.location.href = '/';
            }
        });
    }
}
