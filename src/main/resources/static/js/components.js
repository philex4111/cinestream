/* ============================================================
   CineStream — Components Module
   Reusable DOM builders: navbar, cards, sliders, toasts, etc.
   ============================================================ */

import { posterUrl, backdropUrl } from './api.js';
import { auth } from './auth.js';

/* ── SVG Icons ─────────────────────────────────────────────── */
export const icons = {
    play:       `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    info:       `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
    plus:       `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
    check:      `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`,
    star:       `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
    chevronL:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`,
    chevronR:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`,
    search:     `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
    user:       `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
    list:       `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>`,
    episodes:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>`,
    settings:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg>`,
    close:      `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    arrowBack:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`,
    home:       `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
    browse:     `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>`,
    heart:      `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
    similar:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>`,
};

/* ── Navbar ────────────────────────────────────────────────── */
export function renderNavbar(activePage = '') {
    return `
  <nav class="navbar" id="navbar">
    <a href="/" class="navbar-logo">
      <div class="logo-icon">${icons.play}</div>
      CineStream
    </a>

    <div class="navbar-links">
      <a href="/"            class="${activePage === 'home'     ? 'active' : ''}">${icons.home} Home</a>
      <a href="/browse.html" class="${activePage === 'browse'   ? 'active' : ''}">${icons.browse} Browse</a>
      <a href="/watchlist.html" class="${activePage === 'watchlist' ? 'active' : ''}">${icons.heart} Watchlist</a>
    </div>

    <div class="navbar-right">
      <!-- Search -->
      <div class="search-wrap" id="search-wrap">
        <button class="search-btn" id="search-toggle" aria-label="Search">${icons.search}</button>
        <input type="text" id="nav-search" placeholder="Search movies, shows..." autocomplete="off" />
      </div>

      <!-- Not logged in -->
      <a href="/login.html" class="btn btn-crimson hidden" id="nav-login-btn" style="padding:7px 18px;font-size:13px;">Sign In</a>

      <!-- Logged in -->
      <div class="user-menu hidden" id="user-menu">
        <div class="user-avatar" id="user-avatar" title="Account">U</div>
        <div class="user-dropdown" id="user-dropdown">
          <div style="padding:10px 12px 6px;">
            <div style="font-size:13px;font-weight:600;" id="nav-username"></div>
            <div style="font-size:12px;color:var(--grey-2);">Member</div>
          </div>
          <div class="divider"></div>
          <a href="/watchlist.html">${icons.heart} My Watchlist</a>
          <div class="divider"></div>
          <button id="logout-btn">${icons.close} Sign Out</button>
        </div>
      </div>
    </div>
  </nav>`;
}

/* ── Navbar scroll effect + search ────────────────────────── */
export function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    // Scroll → solid bg
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Search toggle
    const wrap   = document.getElementById('search-wrap');
    const toggle = document.getElementById('search-toggle');
    const input  = document.getElementById('nav-search');
    if (toggle && wrap && input) {
        toggle.addEventListener('click', () => {
            wrap.classList.toggle('open');
            if (wrap.classList.contains('open')) input.focus();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                location.href = `/search.html?q=${encodeURIComponent(input.value.trim())}`;
            }
            if (e.key === 'Escape') wrap.classList.remove('open');
        });
    }
}

/* ── Movie / TV Card ───────────────────────────────────────── */
export function createCard(item, opts = {}) {
    const { variant = 'default', rank = null } = opts;
    const type    = item.media_type || (item.first_air_date ? 'tv' : 'movie');
    const title   = item.title || item.name || 'Unknown';
    const year    = (item.release_date || item.first_air_date || '').slice(0, 4);
    const rating  = item.vote_average?.toFixed(1) || '–';
    const poster  = posterUrl(item.poster_path);
    const href    = `/${type === 'tv' ? 'tv' : 'movie'}/${item.id}`;

    const isWide  = variant === 'wide' || variant === 'top10';
    const imgPath = isWide ? backdropUrl(item.backdrop_path) : poster;
    const imgUrl  = imgPath || '';

    const cardClass = variant === 'top10' ? 'card card-top10'
        : variant === 'wide'  ? 'card card-wide'
            : 'card';

    const rankHtml = rank !== null
        ? `<div class="card-rank">${rank}</div>` : '';

    const imgHtml = imgUrl
        ? `<img class="card-poster" src="${imgUrl}" alt="${escHtml(title)}" loading="lazy">`
        : `<div class="card-poster-placeholder">${icons.play}</div>`;

    const el = document.createElement('div');
    el.className = cardClass;
    el.dataset.id   = item.id;
    el.dataset.type = type;
    el.innerHTML = `
    ${rankHtml}
    ${imgHtml}
    <div class="card-info">
      <div class="card-title">${escHtml(title)}</div>
      <div class="card-meta">
        <span class="rating">${icons.star} ${rating}</span>
        <span class="dot"></span>
        <span>${year}</span>
        <span class="dot"></span>
        <span>${type === 'tv' ? 'Series' : 'Movie'}</span>
      </div>
    </div>
    <div class="card-overlay">
      <div class="card-overlay-title">${escHtml(title)}</div>
      <div class="card-overlay-actions">
        <button class="card-overlay-btn play" data-id="${item.id}" data-type="${type}">▶ Play</button>
        <button class="card-overlay-btn info" data-id="${item.id}" data-type="${type}">Info</button>
      </div>
    </div>`;

    // Navigate on play click
    el.querySelector('.card-overlay-btn.play')?.addEventListener('click', (e) => {
        e.stopPropagation();
        location.href = `/watch.html?id=${item.id}&type=${type}`;
    });
    // Navigate on info click
    el.querySelector('.card-overlay-btn.info')?.addEventListener('click', (e) => {
        e.stopPropagation();
        location.href = `/detail.html?id=${item.id}&type=${type}`;
    });
    // Card click → detail
    el.addEventListener('click', () => {
        location.href = `/detail.html?id=${item.id}&type=${type}`;
    });

    return el;
}

/* ── Slider Section ────────────────────────────────────────── */
export function createSlider(title, items, opts = {}) {
    const { cardVariant = 'default', tabs = null, onTabChange = null } = opts;

    const section = document.createElement('section');
    section.className = 'section';

    // Tab HTML
    const tabsHtml = tabs ? `
    <div class="section-tabs">
      ${tabs.map((t, i) => `
        <button class="section-tab ${i === 0 ? 'active' : ''}" data-tab="${t.value}">${t.label}</button>
      `).join('')}
    </div>` : '';

    section.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">${escHtml(title)}</h2>
      ${tabsHtml}
    </div>
    <div class="slider-wrap">
      <button class="slider-arrow left" aria-label="Scroll left">${icons.chevronL}</button>
      <div class="slider" id="slider-${slugify(title)}"></div>
      <button class="slider-arrow right" aria-label="Scroll right">${icons.chevronR}</button>
    </div>`;

    const sliderEl = section.querySelector('.slider');

    // Populate cards
    populateSlider(sliderEl, items, cardVariant);

    // Arrow scroll
    const leftBtn  = section.querySelector('.slider-arrow.left');
    const rightBtn = section.querySelector('.slider-arrow.right');
    const scrollAmt = () => sliderEl.clientWidth * 0.75;
    leftBtn.addEventListener('click',  () => sliderEl.scrollBy({ left: -scrollAmt(), behavior: 'smooth' }));
    rightBtn.addEventListener('click', () => sliderEl.scrollBy({ left:  scrollAmt(), behavior: 'smooth' }));

    // Tab switching
    if (tabs && onTabChange) {
        section.querySelectorAll('.section-tab').forEach(btn => {
            btn.addEventListener('click', async () => {
                section.querySelectorAll('.section-tab').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                sliderEl.innerHTML = skeletonCards(6, cardVariant);
                const newItems = await onTabChange(btn.dataset.tab);
                populateSlider(sliderEl, newItems, cardVariant);
            });
        });
    }

    return section;
}

function populateSlider(sliderEl, items, variant) {
    sliderEl.innerHTML = '';
    if (!items?.length) {
        sliderEl.innerHTML = `<p style="color:var(--grey-2);padding:20px;">No results found.</p>`;
        return;
    }
    items.forEach((item, i) => {
        sliderEl.appendChild(createCard(item, { variant, rank: variant === 'top10' ? i + 1 : null }));
    });
}

/* ── Skeleton loaders ──────────────────────────────────────── */
export function skeletonCards(count = 6, variant = 'default') {
    const w = variant === 'top10' ? '220px' : variant === 'wide' ? '260px' : '170px';
    const ar = variant === 'top10' || variant === 'wide' ? '16/9' : '2/3';
    return Array.from({ length: count }, () => `
    <div style="flex-shrink:0;width:${w};border-radius:10px;overflow:hidden;">
      <div class="skeleton" style="width:100%;aspect-ratio:${ar};"></div>
      <div style="padding:10px;">
        <div class="skeleton" style="height:13px;border-radius:4px;margin-bottom:6px;"></div>
        <div class="skeleton" style="height:11px;border-radius:4px;width:60%;"></div>
      </div>
    </div>`).join('');
}

export function skeletonGrid(count = 12) {
    return Array.from({ length: count }, () => `
    <div style="border-radius:10px;overflow:hidden;">
      <div class="skeleton" style="width:100%;aspect-ratio:2/3;"></div>
      <div style="padding:10px;">
        <div class="skeleton" style="height:13px;border-radius:4px;margin-bottom:6px;"></div>
        <div class="skeleton" style="height:11px;border-radius:4px;width:60%;"></div>
      </div>
    </div>`).join('');
}

/* ── Toast notifications ───────────────────────────────────── */
let toastWrap = null;
function getToastWrap() {
    if (!toastWrap) {
        toastWrap = document.createElement('div');
        toastWrap.className = 'toast-wrap';
        document.body.appendChild(toastWrap);
    }
    return toastWrap;
}

export function toast(message, type = 'default', duration = 3500) {
    const wrap = getToastWrap();
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const iconMap = { success: icons.check, error: icons.close, default: icons.info };
    el.innerHTML = `<span style="flex-shrink:0;width:16px;height:16px;">${iconMap[type] || icons.info}</span> ${escHtml(message)}`;
    wrap.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(20px)';
        el.style.transition = '0.3s ease';
        setTimeout(() => el.remove(), 300);
    }, duration);
}

/* ── Watchlist button (toggle) ─────────────────────────────── */
export function createWatchlistBtn(tmdbId, mediaType, inList = false) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary btn-icon';
    btn.title = inList ? 'Remove from Watchlist' : 'Add to Watchlist';
    btn.innerHTML = inList ? icons.check : icons.plus;
    btn.dataset.inList = inList ? '1' : '0';

    btn.addEventListener('click', async () => {
        if (!auth.isLoggedIn()) { location.href = '/login.html'; return; }
        const currently = btn.dataset.inList === '1';
        try {
            const { watchlistApi } = await import('./api.js');
            if (currently) {
                await watchlistApi.remove(tmdbId, mediaType);
                btn.innerHTML = icons.plus;
                btn.title = 'Add to Watchlist';
                btn.dataset.inList = '0';
                toast('Removed from watchlist');
            } else {
                await watchlistApi.add(tmdbId, mediaType);
                btn.innerHTML = icons.check;
                btn.title = 'Remove from Watchlist';
                btn.dataset.inList = '1';
                toast('Added to watchlist', 'success');
            }
        } catch (err) {
            toast(err.message || 'Something went wrong', 'error');
        }
    });

    return btn;
}

/* ── Pagination ────────────────────────────────────────────── */
export function createPagination(currentPage, totalPages, onPageChange) {
    const wrap = document.createElement('div');
    wrap.className = 'pagination';

    const maxVisible = 7;
    let pages = [];

    if (totalPages <= maxVisible) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
        pages = [1];
        const start = Math.max(2, currentPage - 2);
        const end   = Math.min(totalPages - 1, currentPage + 2);
        if (start > 2) pages.push('…');
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages - 1) pages.push('…');
        pages.push(totalPages);
    }

    const addBtn = (label, page, isActive = false, disabled = false) => {
        const btn = document.createElement('button');
        btn.className = `page-btn ${isActive ? 'active' : ''}`;
        btn.textContent = label;
        btn.disabled = disabled || label === '…';
        if (!disabled && label !== '…') {
            btn.addEventListener('click', () => onPageChange(page));
        }
        wrap.appendChild(btn);
    };

    addBtn('‹', currentPage - 1, false, currentPage === 1);
    pages.forEach(p => addBtn(p, p, p === currentPage));
    addBtn('›', currentPage + 1, false, currentPage === totalPages);

    return wrap;
}

/* ── Helpers ───────────────────────────────────────────────── */
export function escHtml(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function formatRuntime(mins) {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
}

export function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}