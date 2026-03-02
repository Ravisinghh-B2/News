import { login, signup } from './api.js';
import { saveTo, getFrom, showToast, initDarkMode } from './utils.js';

export function initAuth() {
  const loginBtn = document.querySelector('.login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const user = getFrom('user');

  if (user && user.token) {
    updateUIForLoggedIn(user);
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      window.location.href = '/auth.html';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
}

export function initAuthPage() {
  initDarkMode();
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const toggles = document.querySelectorAll('.toggle-password');
  const backBtn = document.getElementById('back-btn');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '/';
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.dataset.target;
      const input = document.getElementById(targetId);
      if (input.type === 'password') {
        input.type = 'text';
        toggle.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        toggle.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });
}


async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const data = await login(email, password);
    if (data.token) {
      saveTo('user', data);
      showToast('Welcome back to NewsHub!', 'success');
      setTimeout(() => window.location.href = '/', 1000);
    } else {
      showToast(data.message || 'Login failed', 'error');
    }
  } catch (error) {
    showToast('Server error during login', 'error');
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  if (password !== confirm) {
    return showToast('Passwords do not match', 'error');
  }

  try {
    const data = await signup(name, username, email, password);
    if (data.token) {
      // User requirement: After successful signup, show login form or redirect
      showToast('Account created! Logging you in...', 'success');
      saveTo('user', data);
      setTimeout(() => window.location.href = '/', 1500);
    } else {
      showToast(data.message || 'Signup failed', 'error');
    }
  } catch (error) {
    showToast('Server error during registration', 'error');
  }
}

function updateUIForLoggedIn(user) {
  const authButtons = document.getElementById('auth-buttons');
  const userProfile = document.getElementById('user-profile');

  if (authButtons) authButtons.style.display = 'none';
  if (userProfile) {
    userProfile.style.display = 'flex';
    const profileThumb = userProfile.querySelector('.profile-thumb');
    if (profileThumb && user.username) {
      profileThumb.textContent = user.username[0].toUpperCase();
    }
  }
}

function logout() {
  localStorage.removeItem('user');
  location.href = '/';
}
