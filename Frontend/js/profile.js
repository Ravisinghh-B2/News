import { getFrom, showToast, saveTo } from './utils.js';
import { getSavedArticles, deleteSavedArticle, updateProfile, changePassword } from './api.js';

export async function initProfile() {
    const user = getFrom('user');
    if (!user || !user.token) {
        window.location.href = 'auth.html';
        return;
    }

    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const sections = {
        'account': document.getElementById('account-tab'),
        'saved': document.getElementById('saved-tab')
    };

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            Object.keys(sections).forEach(key => {
                sections[key].classList.add('hide');
            });
            sections[tab].classList.remove('hide');

            if (tab === 'saved') {
                loadSavedArticles();
            }
        });
    });

    // Populate user info
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-initial').textContent = user.username[0].toUpperCase();
    document.getElementById('profile-email').textContent = `@${user.username}`;

    document.getElementById('edit-name').value = user.name;
    document.getElementById('edit-username').value = user.username;
    document.getElementById('edit-email').value = user.email;

    const editProfileForm = document.getElementById('edit-profile-form');
    const changePasswordForm = document.getElementById('change-password-form');

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const profileData = {
                name: document.getElementById('edit-name').value,
                username: document.getElementById('edit-username').value,
                email: document.getElementById('edit-email').value
            };

            try {
                const updated = await updateProfile(profileData, user.token);
                if (updated.message) {
                    showToast(updated.message, 'success');
                } else {
                    showToast('Profile updated successfully', 'success');
                    const savedUser = { ...user, ...updated };
                    saveTo('user', savedUser);
                }
            } catch (err) {
                showToast('Failed to update profile', 'error');
            }
        });
    }

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (newPassword !== confirmPassword) {
                return showToast('New passwords do not match', 'error');
            }

            try {
                const result = await changePassword(currentPassword, newPassword, user.token);
                if (result.message) {
                    showToast(result.message, 'success');
                    changePasswordForm.reset();
                } else {
                    showToast('Password update failed', 'error');
                }
            } catch (err) {
                showToast(err.message || 'Failed to change password', 'error');
            }
        });
    }

    // Load saved articles initially if focused
    if (window.location.hash === '#saved') {
        tabBtns[1].click();
    }
}

async function loadSavedArticles() {
    const grid = document.getElementById('saved-news-grid');
    const user = getFrom('user');

    grid.innerHTML = '<p>Loading your saved articles...</p>';

    try {
        const articles = await getSavedArticles(user.token);
        if (articles.length === 0) {
            grid.innerHTML = '<p>No saved articles yet.</p>';
            return;
        }

        grid.innerHTML = '';
        articles.forEach(article => {
            const card = createSavedCard(article);
            grid.appendChild(card);
        });
    } catch (error) {
        showToast('Error loading saved articles', 'error');
    }
}

function createSavedCard(article) {
    const div = document.createElement('div');
    div.className = 'news-card';
    div.innerHTML = `
        <div class="img-wrapper">
            <img src="${article.imageUrl}" alt="News Image">
        </div>
        <div class="news-content">
            <h3 class="news-title">${article.title}</h3>
            <p class="news-description">${article.description || 'No description'}</p>
            <div class="news-footer">
                <span class="news-source">${article.source}</span>
                <button type="button" class="btn delete-btn" aria-label="Remove saved article">
                    <i class="fas fa-trash" aria-hidden="true"></i>
                </button>
            </div>
        </div>
    `;

    div.querySelector('.delete-btn').addEventListener('click', async () => {
        const user = getFrom('user');
        try {
            await deleteSavedArticle(article._id, user.token);
            showToast('Article removed', 'success');
            div.remove();
        } catch (error) {
            showToast('Delete failed', 'error');
        }
    });

    return div;
}
