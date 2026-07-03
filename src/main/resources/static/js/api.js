/* ============================================================
   CineStream — API Module
   All calls go through /api/* (proxied by Ktor)
   TMDB images are fetched directly from TMDB CDN
   ============================================================ */

const BASE = '/api';
export const IMG_BASE   = 'https://image.tmdb.org/t/p';
export const IMG_W500   = `${IMG_BASE}/w500`;
export const IMG_W780   = `${IMG_BASE}/w780`;
export const IMG_ORIG   = `${IMG_BASE}/original`;
export const IMG_W185   = `${IMG_BASE}/w185`;

/* ── Internal fetch helper ─────────────────────────────────── */
async function req(path, options = {}) {
    const token = auth.getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, { ...options, headers });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw Object.assign(new Error(err.error || 'Request failed'), { status: res.status });
    }
    return res.json();
}

/* ── Auth ──────────────────────────────────────────────────── */
export const authApi = {
    register: (email, username, password) =>
        req('/auth/register', { method: 'POST', body: JSON.stringify({ email, username, password }) }),

    login: (email, password) =>
        req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
};

/* ── User ──────────────────────────────────────────────────── */
export const userApi = {
    me: () => req('/user/me'),

    changeUsername: (username) =>
        req('/user/username', { method: 'PUT', body: JSON.stringify({ username }) }),

    changePassword: (currentPassword, newPassword) =>
        req('/user/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
};

/* ── TMDB proxy ────────────────────────────────────────────── */
export const tmdb = {
    trending:            (time = 'week')        => req(`/tmdb/trending?time=${time}`),
    popularMovies:       (page = 1)             => req(`/tmdb/movie/popular?page=${page}`),
    popularTV:           (page = 1)             => req(`/tmdb/tv/popular?page=${page}`),
    movie:               (id)                   => req(`/tmdb/movie/${id}`),
    tv:                  (id)                   => req(`/tmdb/tv/${id}`),
    tvSeason:            (id, season)           => req(`/tmdb/tv/${id}/season/${season}`),
    similarMovies:       (id, page = 1)         => req(`/tmdb/movie/${id}/similar?page=${page}`),
    similarTV:           (id, page = 1)         => req(`/tmdb/tv/${id}/similar?page=${page}`),
    recommendedMovies:   (id, page = 1)         => req(`/tmdb/movie/${id}/recommendations?page=${page}`),
    search:              (query, page = 1, type = 'multi') =>
        req(`/tmdb/search?query=${encodeURIComponent(query)}&page=${page}&type=${type}`),
    genreList:           (type = 'movie')       => req(`/tmdb/genre/${type}/list`),
};

/* ── Stream (VidSrc embed URLs) ────────────────────────────── */
export const streamApi = {
    movie: (tmdbId, imdbId = '')  => req(`/stream/movie/${tmdbId}${imdbId ? '?imdbId=' + imdbId : ''}`),
    tv:    (tmdbId, season, episode, imdbId = '') =>
        req(`/stream/tv/${tmdbId}/season/${season}/episode/${episode}${imdbId ? '?imdbId=' + imdbId : ''}`),
};

/* ── Watchlist ─────────────────────────────────────────────── */
export const watchlistApi = {
    get:    ()                             => req('/watchlist'),
    add:    (tmdbId, mediaType)            => req('/watchlist', { method: 'POST', body: JSON.stringify({ tmdbId, mediaType }) }),
    remove: (tmdbId, mediaType)            => req(`/watchlist/${tmdbId}?type=${mediaType}`, { method: 'DELETE' }),
};

/* ── Health ────────────────────────────────────────────────── */
export const healthApi = {
    check: () => fetch('/health').then(r => r.json()),
};

/* ── Image helpers ─────────────────────────────────────────── */
export function posterUrl(path, size = IMG_W500) {
    return path ? `${size}${path}` : null;
}
export function backdropUrl(path, size = IMG_ORIG) {
    return path ? `${size}${path}` : null;
}
export function profileUrl(path) {
    return path ? `${IMG_W185}${path}` : null;
}