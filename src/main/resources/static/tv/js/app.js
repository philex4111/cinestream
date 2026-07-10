/* CineStream TV: ES5 Focus Engine - Advanced Site Parity */
var TVApp = {
    zone: 'rail', // 'nav', 'hero', 'rail', 'tab'
    navIdx: 1, heroIdx: 0, railIdx: 0, cardIdx: 0, tabIdx: 0,
    rails: ['top10', 'trending', 'movies', 'tv'],
    data: {},
    api: '/api',
    heroTimer: null,
    heroItems: [],
    currentTab: 'movie',

    init: function() {
        this.bindKeys();
        this.loadContent();
        this.startHeroCycle();
    },

    bindKeys: function() {
        var self = this;
        document.onkeydown = function(e) {
            var k = e.keyCode || e.which;
            if (k === 37) self.move('left');
            else if (k === 39) self.move('right');
            else if (k === 38) self.move('up');
            else if (k === 40) self.move('down');
            else if (k === 13) self.enter();
            else if (k === 461 || k === 8) { e.preventDefault(); self.back(); }
            self.stopHeroCycle();
        };
    },

    loadContent: function() {
        var self = this, loaded = 0;
        var sources = [
            ['/tmdb/trending?time=day', 'top10'],
            ['/tmdb/trending?time=week', 'trending_all'],
            ['/tmdb/movie/popular', 'movies'],
            ['/tmdb/tv/popular', 'tv']
        ];

        for (var i = 0; i < sources.length; i++) {
            (function(src, key) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', self.api + src, true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var results = JSON.parse(xhr.responseText).results;
                        self.data[key] = results;
                        if (key === 'trending_all') {
                            self.heroItems = results.slice(0, 8);
                            self.renderHeroDots();
                            self.filterTrending();
                        } else {
                            self.renderRail(key, results);
                        }
                        loaded++;
                        if (loaded === 4) { self.status(''); self.updateFocus(); self.setHero(self.heroItems[0]); }
                    }
                };
                xhr.send();
            })(sources[i][0], sources[i][1]);
        }
    },

    filterTrending: function() {
        var all = this.data['trending_all'] || [], filtered = [];
        for (var i = 0; i < all.length; i++) {
            if (this.currentTab === 'movie' && (all[i].media_type === 'movie' || !all[i].media_type)) filtered.push(all[i]);
            if (this.currentTab === 'tv' && all[i].media_type === 'tv') filtered.push(all[i]);
        }
        this.data['trending'] = filtered;
        this.renderRail('trending', filtered);
    },

    renderRail: function(key, items) {
        var slider = document.getElementById('slider-' + key);
        if (!slider) return;
        var html = '';
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var img = item.poster_path ? 'https://image.tmdb.org/t/p/w342' + item.poster_path : '';
            html += '<div class="tv-card" id="card-' + key + '-' + i + '">' +
                    '<img class="card-poster" src="' + img + '">' +
                    '<div class="card-overlay"><div class="card-overlay-title">' + (item.title || item.name) + '</div></div>' +
                    '</div>';
        }
        slider.innerHTML = html;
    },

    renderHeroDots: function() {
        var dots = document.getElementById('hero-dots');
        if (!dots) return;
        var html = '';
        for (var i = 0; i < this.heroItems.length; i++) html += '<div class="hero-dot" id="dot-' + i + '"></div>';
        dots.innerHTML = html;
    },

    setHero: function(item) {
        if (!item) return;
        document.getElementById('hero-title').innerHTML = item.title || item.name;
        document.getElementById('hero-overview').innerHTML = (item.overview || "").substring(0, 220) + "...";
        var year = (item.release_date || item.first_air_date || '').substring(0, 4);
        var rate = item.vote_average ? '★ ' + item.vote_average.toFixed(1) : '–';
        document.getElementById('hero-meta').innerHTML = '<span style="color:#E50914;font-weight:700;">' + rate + '</span><span class="dot"></span><span>' + year + '</span>';
        if (item.backdrop_path) document.getElementById('hero').style.backgroundImage = "url('https://image.tmdb.org/t/p/w1280" + item.backdrop_path + "')";
        var dots = document.getElementsByClassName('hero-dot');
        for(var i=0; i<dots.length; i++) dots[i].className = 'hero-dot';
        var activeDot = document.getElementById('dot-' + this.heroIdx);
        if (activeDot) activeDot.className = 'hero-dot active';
    },

    startHeroCycle: function() {
        var self = this;
        this.heroTimer = setInterval(function() {
            if (self.zone !== 'hero' && self.heroItems.length > 0) {
                self.heroIdx = (self.heroIdx + 1) % self.heroItems.length;
                self.setHero(self.heroItems[self.heroIdx]);
            }
        }, 7000);
    },

    stopHeroCycle: function() { clearInterval(this.heroTimer); this.startHeroCycle(); },

    move: function(dir) {
        if (this.zone === 'nav') {
            if (dir === 'right' && this.navIdx < 4) this.navIdx++;
            else if (dir === 'left' && this.navIdx > 0) this.navIdx--;
            else if (dir === 'down') this.zone = 'hero';
        }
        else if (this.zone === 'hero') {
            if (dir === 'up') this.zone = 'nav';
            else if (dir === 'down') { this.zone = 'rail'; this.railIdx = 0; this.cardIdx = 0; }
            else if (dir === 'right' && this.heroIdx < 1) this.heroIdx++;
            else if (dir === 'left' && this.heroIdx > 0) this.heroIdx--;
        }
        else if (this.zone === 'tab') {
            if (dir === 'up') { this.zone = 'rail'; this.railIdx = 0; }
            else if (dir === 'down') { this.zone = 'rail'; this.railIdx = 1; this.cardIdx = 0; }
            else if (dir === 'right' && this.tabIdx < 1) this.tabIdx++;
            else if (dir === 'left' && this.tabIdx > 0) this.tabIdx--;
        }
        else if (this.zone === 'rail') {
            if (dir === 'up') {
                if (this.railIdx === 1) this.zone = 'tab';
                else if (this.railIdx > 0) { this.railIdx--; this.cardIdx = 0; }
                else this.zone = 'hero';
            }
            else if (dir === 'down') {
                if (this.railIdx === 0) this.zone = 'tab';
                else if (this.railIdx < this.rails.length - 1) { this.railIdx++; this.cardIdx = 0; }
            }
            else if (dir === 'right') {
                var max = (this.data[this.rails[this.railIdx]] || []).length - 1;
                if (this.cardIdx < max) this.cardIdx++;
            }
            else if (dir === 'left') {
                if (this.cardIdx > 0) this.cardIdx--;
                else { this.zone = 'nav'; this.navIdx = 0; }
            }
        }
        this.updateFocus();
    },

    updateFocus: function() {
        var all = document.querySelectorAll('.tv-focused, .tv-nav-focused');
        for(var i=0; i<all.length; i++) { all[i].classList.remove('tv-focused'); all[i].classList.remove('tv-nav-focused'); }

        var scroller = document.querySelector('.tv-rails-container');
        var hero = document.getElementById('hero');

        if (this.zone === 'nav') {
            var navItems = document.querySelectorAll('.tv-nav-item, .navbar-logo');
            if (navItems[this.navIdx]) navItems[this.navIdx].classList.add('tv-nav-focused');
            hero.style.transform = 'translateY(0)';
            scroller.style.transform = 'translateY(0)';
        }
        else if (this.zone === 'hero') {
            var btns = document.querySelectorAll('.hero-actions .btn');
            if (btns[this.heroIdx]) btns[this.heroIdx].classList.add('tv-focused');
            hero.style.transform = 'translateY(0)';
            scroller.style.transform = 'translateY(0)';
        }
        else if (this.zone === 'tab') {
            var tabs = document.querySelectorAll('.tab-tv');
            if (tabs[this.tabIdx]) tabs[this.tabIdx].classList.add('tv-nav-focused');
            hero.style.transform = 'translateY(-150px)';
            scroller.style.transform = 'translateY(-150px)';
        }
        else if (this.zone === 'rail') {
            var key = this.rails[this.railIdx];
            var card = document.getElementById('card-' + key + '-' + this.cardIdx);
            if (card) {
                card.classList.add('tv-focused');
                var slider = document.getElementById('slider-' + key);
                slider.style.transform = 'translateX(-' + (this.cardIdx * 220) + 'px)';

                // Shift whole content up. Each rail is 280px high.
                var yShift = (this.railIdx * 280) + 250;
                hero.style.transform = 'translateY(-' + Math.min(yShift, 450) + 'px)';
                scroller.style.transform = 'translateY(-' + yShift + 'px)';

                var item = this.data[key][this.cardIdx];
                if (item) this.setHero(item);
            }
        }
    },

    enter: function() {
        if (this.zone === 'nav') window.location.href = document.querySelectorAll('.tv-nav-item, .navbar-logo')[this.navIdx].getAttribute('href');
        else if (this.zone === 'tab') {
            var tabs = document.querySelectorAll('.tab-tv');
            this.currentTab = tabs[this.tabIdx].getAttribute('data-tab');
            for(var i=0; i<tabs.length; i++) tabs[i].className = 'tab-tv';
            tabs[this.tabIdx].className = 'tab-tv active';
            this.filterTrending();
        } else {
            var item = this.zone === 'hero' ? this.heroItems[this.heroIdx] : this.data[this.rails[this.railIdx]][this.cardIdx];
            if (item) window.location.href = 'detail.html?id=' + item.id + '&type=' + (item.media_type || (item.first_air_date ? 'tv' : 'movie'));
        }
    },

    back: function() { if (this.zone !== 'nav') { this.zone = 'nav'; this.navIdx = 1; this.updateFocus(); } else window.location.href = 'index.html'; },
    status: function(m) { var el = document.getElementById('tv-status'); if (el) { el.innerHTML = m; el.className = m ? 'tv-status' : 'tv-status hidden'; } }
};
window.onload = function() { TVApp.init(); };
