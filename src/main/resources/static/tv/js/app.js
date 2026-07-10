/* ============================================================
   CineStream TV — Legacy ES5 JavaScript
   Optimized for LG NetCast 4.0
   ============================================================ */

var TVApp = {
    currentIndex: 0,
    posters: [],
    API_BASE: '/api',

    init: function() {
        console.log("TV App Initializing...");
        this.loadTrending();
        this.setupEventListeners();
    },

    loadTrending: function() {
        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', this.API_BASE + '/tmdb/trending?time=day', true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                self.renderPosters(data.results);
            }
        };
        xhr.send();
    },

    renderPosters: function(items) {
        var grid = document.getElementById('poster-grid');
        var html = '';

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var title = item.title || item.name;
            var imgPath = item.poster_path ? 'https://image.tmdb.org/t/p/w342' + item.poster_path : '';

            html += '<div class="poster" id="poster-' + i + '" data-id="' + item.id + '" data-type="' + (item.media_type || 'movie') + '">' +
                    '<img src="' + imgPath + '">' +
                    '<div class="poster-title">' + title + '</div>' +
                    '</div>';
        }

        grid.innerHTML = html;
        this.posters = document.getElementsByClassName('poster');
        this.updateFocus();
    },

    setupEventListeners: function() {
        var self = this;
        document.onkeydown = function(e) {
            var keyCode = e.keyCode || e.which;
            console.log("Key pressed: " + keyCode);

            switch(keyCode) {
                case 37: // Left
                    if (self.currentIndex > 0) {
                        self.currentIndex--;
                        self.updateFocus();
                    }
                    break;
                case 39: // Right
                    if (self.currentIndex < self.posters.length - 1) {
                        self.currentIndex++;
                        self.updateFocus();
                    }
                    break;
                case 13: // Enter
                    self.playSelection();
                    break;
                case 461: // Return (LG NetCast)
                case 8:   // Backspace (Browser)
                    e.preventDefault();
                    // Handle back navigation
                    break;
            }
        };
    },

    updateFocus: function() {
        if (!this.posters.length) return;

        // Remove focus from all
        for (var i = 0; i < this.posters.length; i++) {
            this.posters[i].className = "poster";
        }

        // Add focus to current
        var current = this.posters[this.currentIndex];
        current.className = "poster focused";

        // Auto-scroll the row
        var grid = document.getElementById('poster-grid');
        var offset = current.offsetLeft - 64; // Adjust for container margin
        grid.style.transform = 'translateX(-' + offset + 'px)';

        // Update Hero with current selection
        this.updateHero(this.currentIndex);
    },

    updateHero: function(index) {
        // Placeholder for updating background/title when browsing
    },

    playSelection: function() {
        var current = this.posters[this.currentIndex];
        var id = current.getAttribute('data-id');
        var type = current.getAttribute('data-type');
        window.location.href = 'player.html?id=' + id + '&type=' + type;
    }
};

window.onload = function() {
    TVApp.init();
};
