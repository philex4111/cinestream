/* CineStream TV: ES5/XHR remote adapter over the same /api TMDB contract as the web app. */
var CineStreamTV = {
    api: '/api', rows: [], data: [], row: 0, col: 0, area: 'cards', nav: 1, heroAction: 0, heroItems: [], heroIndex: 0,
    init: function () { this.bind(); this.load(); },
    bind: function () {
        var self = this;
        document.onkeydown = function (e) {
            e = e || window.event; var k = e.keyCode || e.which;
            if (k === 37) self.left(); else if (k === 39) self.right(); else if (k === 38) self.up(); else if (k === 40) self.down();
            else if (k === 13) self.enter(); else if (k === 461 || k === 8) { e.preventDefault(); self.back(); }
        };
        document.getElementById('hero-play').onclick = function (e) { e.preventDefault(); self.goWatch(); };
        document.getElementById('hero-info').onclick = function (e) { e.preventDefault(); self.goDetail(); };
    },
    load: function () {
        var self = this, done = 0, sources = [
            ['/tmdb/trending?time=day', 'section-trending'], ['/tmdb/movie/popular?page=1', 'section-movies'], ['/tmdb/tv/popular?page=1', 'section-tv']
        ];
        for (var i = 0; i < sources.length; i++) (function (source, index) {
            self.get(source[0], function (payload) { self.renderRow(source[1], payload.results || [], index); done++; self.ready(done); }, function () { self.renderRow(source[1], [], index); done++; self.status('Unable to load some CineStream content.', true); self.ready(done); });
        }(sources[i], i));
    },
    get: function (path, yes, no) {
        var xhr = new XMLHttpRequest(); xhr.open('GET', this.api + path, true);
        xhr.onreadystatechange = function () { if (xhr.readyState !== 4) return; if (xhr.status >= 200 && xhr.status < 300) { try { yes(JSON.parse(xhr.responseText)); } catch (x) { no(); } } else no(); };
        xhr.send();
    },
    ready: function (done) {
        if (done !== 3) return;
        this.rows = document.getElementsByClassName('tv-section');
        this.heroItems = (this.data[0] || []).filter(function (item) { return item.backdrop_path; }).slice(0, 8);
        if (!this.heroItems.length) this.heroItems = (this.data[1] || []).filter(function (item) { return item.backdrop_path; }).slice(0, 8);
        if (!this.heroItems.length) { this.status('No content is available right now.', true); return; }
        this.makeDots(); this.showHero(this.heroItems[0]); this.status(''); this.focusCards();
    },
    renderRow: function (id, items, index) {
        this.data[index] = items; var slider = document.getElementById(id).getElementsByClassName('tv-slider')[0], html = '';
        for (var i = 0; i < items.length; i++) {
            var item = items[i], title = this.escape(item.title || item.name || 'Untitled'), image = item.backdrop_path ? 'https://image.tmdb.org/t/p/w342' + item.backdrop_path : '';
            html += '<article class="card tv-card" data-index="' + i + '"><img class="card-poster" src="' + image + '" alt="' + title + '"><div class="card-overlay"><div class="card-overlay-title">' + title + '</div></div></article>';
        }
        slider.innerHTML = html || '<div style="color:var(--grey-2);padding:20px">No titles available.</div>';
    },
    left: function () {
        if (this.area === 'nav') { if (this.nav > 0) { this.nav--; this.focusNav(); } return; }
        if (this.area === 'hero') { this.heroAction = 0; this.focusHero(); return; }
        if (this.col > 0) { this.col--; this.focusCards(); } else { this.area = 'nav'; this.nav = 1; this.focusNav(); }
    },
    right: function () {
        if (this.area === 'nav') { var links = this.links(); if (this.nav < links.length - 1) { this.nav++; this.focusNav(); } return; }
        if (this.area === 'hero') { this.heroAction = 1; this.focusHero(); return; }
        var list = this.data[this.row] || []; if (this.col < list.length - 1) { this.col++; this.focusCards(); }
    },
    up: function () {
        if (this.area === 'nav') return;
        if (this.area === 'hero') return;
        if (this.row === 0) { this.area = 'hero'; this.heroAction = 0; this.focusHero(); } else { this.row--; this.clamp(); this.focusCards(); }
    },
    down: function () {
        if (this.area === 'nav') return;
        if (this.area === 'hero') { this.area = 'cards'; this.focusCards(); return; }
        if (this.row < this.data.length - 1) { this.row++; this.clamp(); this.focusCards(); }
    },
    enter: function () {
        if (this.area === 'nav') { var link = this.links()[this.nav]; if (link) window.location.href = link.href; }
        else if (this.area === 'hero') { if (this.heroAction === 0) this.goWatch(); else this.goDetail(); }
        else this.goDetail();
    },
    back: function () { if (this.area === 'nav') { this.area = 'cards'; this.focusCards(); } else { this.area = 'nav'; this.nav = 1; this.focusNav(); } },
    clamp: function () { var max = (this.data[this.row] || []).length - 1; if (this.col > max) this.col = Math.max(0, max); },
    clear: function () {
        var cards = document.getElementsByClassName('tv-card'), links = this.links(), buttons = [document.getElementById('hero-play'), document.getElementById('hero-info')];
        for (var i = 0; i < cards.length; i++) cards[i].className = 'card tv-card';
        for (i = 0; i < links.length; i++) links[i].className = links[i].className.replace(' tv-nav-focused', '');
        for (i = 0; i < buttons.length; i++) buttons[i].className = buttons[i].className.replace(' tv-focused', '');
    },
    focusCards: function () {
        this.clear(); var section = this.rows[this.row]; if (!section) return; var cards = section.getElementsByClassName('tv-card'), card = cards[this.col]; if (!card) return;
        card.className += ' tv-focused'; this.scroll(section.getElementsByClassName('tv-slider')[0], card); this.showHero((this.data[this.row] || [])[this.col]);
    },
    focusNav: function () { this.clear(); var link = this.links()[this.nav]; if (link) link.className += ' tv-nav-focused'; },
    focusHero: function () { this.clear(); var b = this.heroAction === 0 ? document.getElementById('hero-play') : document.getElementById('hero-info'); b.className += ' tv-focused'; },
    scroll: function (slider, card) { var x = Math.max(0, card.offsetLeft - 12); slider.scrollLeft = x; },
    links: function () { return document.getElementById('tv-navbar').getElementsByTagName('a'); },
    showHero: function (item) {
        if (!item) return; this.current = item;
        var title = item.title || item.name || 'Untitled', year = (item.release_date || item.first_air_date || '').substring(0, 4), type = item.media_type || (item.first_air_date ? 'tv' : 'movie'), rating = item.vote_average ? item.vote_average.toFixed(1) : '–';
        document.getElementById('hero-title').innerHTML = this.escape(title);
        document.getElementById('hero-overview').innerHTML = this.escape((item.overview || 'Discover your next great watch on CineStream.').substring(0, 220));
        document.getElementById('hero-meta').innerHTML = '<span class="rating">★ ' + rating + '</span><span class="dot"></span><span>' + (year || 'New') + '</span><span class="dot"></span><span>' + (type === 'tv' ? 'TV Series' : 'Movie') + '</span>';
        document.getElementById('hero-backdrop').style.backgroundImage = item.backdrop_path ? "url('https://image.tmdb.org/t/p/w1280" + item.backdrop_path + "')" : '';
        document.getElementById('hero-play').href = '/watch.html?id=' + item.id + '&type=' + type;
        document.getElementById('hero-info').href = '/detail.html?id=' + item.id + '&type=' + type;
        this.heroIndex = this.heroItems.indexOf(item); this.updateDots();
    },
    makeDots: function () {
        var self = this, dots = document.getElementById('hero-dots'), html = '';
        for (var i = 0; i < this.heroItems.length; i++) html += '<button class="hero-dot" data-index="' + i + '"></button>';
        dots.innerHTML = html; var buttons = dots.getElementsByTagName('button');
        for (i = 0; i < buttons.length; i++) (function (n) { buttons[n].onclick = function () { self.showHero(self.heroItems[n]); }; }(i));
    },
    updateDots: function () { var dots = document.getElementById('hero-dots').getElementsByClassName('hero-dot'); for (var i = 0; i < dots.length; i++) dots[i].className = i === this.heroIndex ? 'hero-dot active' : 'hero-dot'; },
    goWatch: function () { if (this.current) window.location.href = document.getElementById('hero-play').href; },
    goDetail: function () { if (this.current) window.location.href = document.getElementById('hero-info').href; },
    status: function (message, error) { var s = document.getElementById('tv-status'); s.innerHTML = message; s.className = message ? 'tv-status' + (error ? ' error' : '') : 'tv-status hidden'; },
    escape: function (value) { return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
};
window.onload = function () { CineStreamTV.init(); };
