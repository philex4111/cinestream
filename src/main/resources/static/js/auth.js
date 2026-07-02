/* ============================================================
   CineStream — Auth Module
   Manages JWT token + user state in localStorage
   Import this before api.js — api.js reads auth.getToken()
   ============================================================ */

const TOKEN_KEY    = 'cs_token';
const USERNAME_KEY = 'cs_username';

export const auth = {
    /* ── Store after login/register ── */
    save(token, username) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USERNAME_KEY, username);
        window.dispatchEvent(new Event('auth:change'));
    },

    /* ── Clear on logout ── */
    clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USERNAME_KEY);
        window.dispatchEvent(new Event('auth:change'));
    },

    getToken()    { return localStorage.getItem(TOKEN_KEY); },
    getUsername() { return localStorage.getItem(USERNAME_KEY); },
    isLoggedIn()  { return !!localStorage.getItem(TOKEN_KEY); },

    /* ── Redirect to login if not authenticated ── */
    requireAuth(redirectBack = true) {
        if (!this.isLoggedIn()) {
            const dest = redirectBack
                ? `/login.html?next=${encodeURIComponent(location.pathname + location.search)}`
                : '/login.html';
            location.href = dest;
            return false;
        }
        return true;
    },

    /* ── Redirect logged-in users away from auth pages ── */
    redirectIfLoggedIn(dest = '/') {
        if (this.isLoggedIn()) { location.href = dest; return true; }
        return false;
    },
};

/* ── Make auth globally available (api.js reads window.auth) ── */
window.auth = auth;

/* ── Update navbar UI whenever auth state changes ── */
window.addEventListener('auth:change', updateNavAuth);
document.addEventListener('DOMContentLoaded', updateNavAuth);

function updateNavAuth() {
    const userMenu    = document.getElementById('user-menu');
    const loginBtn    = document.getElementById('nav-login-btn');
    const userAvatar  = document.getElementById('user-avatar');
    const usernameEl  = document.getElementById('nav-username');

    if (!userMenu && !loginBtn) return; // navbar not on this page

    if (auth.isLoggedIn()) {
        if (loginBtn)   loginBtn.classList.add('hidden');
        if (userMenu)   userMenu.classList.remove('hidden');
        if (userAvatar) userAvatar.textContent = (auth.getUsername() || 'U')[0].toUpperCase();
        if (usernameEl) usernameEl.textContent = auth.getUsername() || '';
    } else {
        if (loginBtn)  loginBtn.classList.remove('hidden');
        if (userMenu)  userMenu.classList.add('hidden');
    }
}

/* ── Logout handler — attach to any element with id="logout-btn" ── */
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.clear();
            location.href = '/';
        });
    }

    // Toggle user dropdown
    const avatarBtn = document.getElementById('user-avatar');
    const dropdown  = document.getElementById('user-dropdown');
    if (avatarBtn && dropdown) {
        avatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });
        document.addEventListener('click', () => dropdown.classList.remove('open'));
    }
});