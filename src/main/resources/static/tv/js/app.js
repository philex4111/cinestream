/* CineStream TV - ES5/XHR compatible with LG NetCast 4.0. */

var TVApp = {
    apiBase: "/api",
    rows: [],
    itemsByRow: [],
    focusedRow: 0,
    focusedIndex: 0,
    focusArea: "content",
    navIndex: 0,
    heroButton: 0,
    heroItem: null,

    init: function () {
        this.bindEvents();
        this.loadContent();
    },

    bindEvents: function () {
        var self = this;

        document.onkeydown = function (event) {
            event = event || window.event;
            var key = event.keyCode || event.which;

            if (key === 37) self.moveLeft();
            else if (key === 39) self.moveRight();
            else if (key === 38) self.moveUp();
            else if (key === 40) self.moveDown();
            else if (key === 13) self.activate();
            else if (key === 461 || key === 8) {
                event.preventDefault();
                self.goBack();
            }
        };

        document.getElementById("hero-play").onclick = function () {
            self.playCurrent();
        };

        document.getElementById("hero-info").onclick = function () {
            self.showStatus("Use Play to start watching this title.", false);
        };

        var nav = document.getElementsByClassName("nav-item");
        for (var i = 0; i < nav.length; i++) {
            (function (index) {
                nav[index].onclick = function () {
                    self.focusArea = "nav";
                    self.navIndex = index;
                    self.updateNavFocus();
                    self.activate();
                };
            }(i));
        }
    },

    loadContent: function () {
        var self = this;
        var requests = [
            { path: "/tmdb/trending?time=day", rowId: "row-trending", index: 0 },
            { path: "/tmdb/movie/popular?page=1", rowId: "row-movies", index: 1 },
            { path: "/tmdb/tv/popular?page=1", rowId: "row-series", index: 2 }
        ];

        var finished = 0;

        for (var i = 0; i < requests.length; i++) {
            (function (request) {
                self.request(
                    request.path,
                    function (data) {
                        self.renderRow(request.rowId, data.results || [], request.index);
                        finished++;
                        self.finishLoading(finished);
                    },
                    function () {
                        self.renderRow(request.rowId, [], request.index);
                        finished++;
                        self.showStatus("Some content could not be loaded. Check your connection.", true);
                        self.finishLoading(finished);
                    }
                );
            }(requests[i]));
        }
    },

    finishLoading: function (finished) {
        if (finished !== 3) return;

        this.rows = document.getElementsByClassName("media-row");

        if (!this.heroItem) {
            this.showStatus("No titles are available right now.", true);
            return;
        }

        this.showStatus("", false);
        this.updateContentFocus();
    },

    request: function (path, success, failure) {
        var xhr = new XMLHttpRequest();

        xhr.open("GET", this.apiBase + path, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    success(JSON.parse(xhr.responseText));
                } catch (error) {
                    failure();
                }
            } else {
                failure();
            }
        };

        xhr.send();
    },

    renderRow: function (rowId, items, rowIndex) {
        var row = document.getElementById(rowId);
        var track = row.getElementsByClassName("poster-row")[0];
        var html = "";

        this.itemsByRow[rowIndex] = items;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var title = this.escapeHtml(item.title || item.name || "Untitled");
            var image = item.backdrop_path
                ? "https://image.tmdb.org/t/p/w342" + item.backdrop_path
                : "";

            html +=
                '<div class="poster" data-index="' + i + '" ' +
                'style="background-image:url(\'' + image + '\')">' +
                '<span class="poster-title">' + title + "</span>" +
                "</div>";
        }

        if (!html) {
            html = '<div class="poster"><span class="poster-title">Nothing available</span></div>';
        }

        track.innerHTML = html;

        var self = this;
        var posters = track.getElementsByClassName("poster");

        for (var p = 0; p < posters.length; p++) {
            (function (posterIndex) {
                posters[posterIndex].onclick = function () {
                    if (!self.itemsByRow[rowIndex][posterIndex]) return;

                    self.focusArea = "content";
                    self.focusedRow = rowIndex;
                    self.focusedIndex = posterIndex;
                    self.updateContentFocus();
                };
            }(p));
        }
    },

    moveLeft: function () {
        if (this.focusArea === "nav") return;

        if (this.focusArea === "hero") {
            this.heroButton = 0;
            this.updateHeroFocus();
            return;
        }

        if (this.focusedIndex > 0) {
            this.focusedIndex--;
            this.updateContentFocus();
        } else {
            this.focusArea = "nav";
            this.navIndex = 0;
            this.updateNavFocus();
        }
    },

    moveRight: function () {
        if (this.focusArea === "nav") {
            this.focusArea = "content";
            this.updateContentFocus();
            return;
        }

        if (this.focusArea === "hero") {
            this.heroButton = 1;
            this.updateHeroFocus();
            return;
        }

        var items = this.itemsByRow[this.focusedRow] || [];

        if (this.focusedIndex < items.length - 1) {
            this.focusedIndex++;
            this.updateContentFocus();
        }
    },

    moveUp: function () {
        if (this.focusArea === "nav") {
            if (this.navIndex > 0) {
                this.navIndex--;
                this.updateNavFocus();
            }
            return;
        }

        if (this.focusArea === "hero") return;

        if (this.focusedRow === 0) {
            this.focusArea = "hero";
            this.heroButton = 0;
            this.updateHeroFocus();
        } else {
            this.focusedRow--;
            this.clampFocusedIndex();
            this.updateContentFocus();
        }
    },

    moveDown: function () {
        if (this.focusArea === "nav") {
            if (this.navIndex < 3) {
                this.navIndex++;
                this.updateNavFocus();
            }
            return;
        }

        if (this.focusArea === "hero") {
            this.focusArea = "content";
            this.updateContentFocus();
            return;
        }

        if (this.focusedRow < this.itemsByRow.length - 1) {
            this.focusedRow++;
            this.clampFocusedIndex();
            this.updateContentFocus();
        }
    },

    activate: function () {
        if (this.focusArea === "hero") {
            if (this.heroButton === 0) this.playCurrent();
            else this.showStatus("Use Play to start watching this title.", false);
            return;
        }

        if (this.focusArea === "content") {
            this.playCurrent();
            return;
        }

        if (this.navIndex === 0) {
            this.focusArea = "content";
            this.focusedRow = 0;
            this.focusedIndex = 0;
            this.updateContentFocus();
        } else if (this.navIndex === 1) {
            this.showStatus("Search is not available in the TV version yet.", false);
        } else if (this.navIndex === 2) {
            this.focusArea = "content";
            this.focusedRow = 1;
            this.focusedIndex = 0;
            this.updateContentFocus();
        } else if (this.navIndex === 3) {
            this.focusArea = "content";
            this.focusedRow = 2;
            this.focusedIndex = 0;
            this.updateContentFocus();
        }
    },

    goBack: function () {
        if (this.focusArea === "nav") {
            this.focusArea = "content";
            this.updateContentFocus();
        } else {
            this.focusArea = "nav";
            this.navIndex = 0;
            this.updateNavFocus();
        }
    },

    clampFocusedIndex: function () {
        var items = this.itemsByRow[this.focusedRow] || [];

        if (this.focusedIndex >= items.length) {
            this.focusedIndex = Math.max(0, items.length - 1);
        }
    },

    updateContentFocus: function () {
        this.clearAllFocus();

        var row = this.rows[this.focusedRow];
        if (!row) return;

        var posters = row.getElementsByClassName("poster");
        var current = posters[this.focusedIndex];

        if (!current) return;

        current.className = "poster focused";
        this.scrollRow(row, current);

        var item = (this.itemsByRow[this.focusedRow] || [])[this.focusedIndex];
        this.updateHero(item);
    },

    updateHeroFocus: function () {
        this.clearAllFocus();

        var buttons = [
            document.getElementById("hero-play"),
            document.getElementById("hero-info")
        ];

        buttons[this.heroButton].className += " focused";
    },

    updateNavFocus: function () {
        this.clearAllFocus();

        var nav = document.getElementsByClassName("nav-item");

        for (var i = 0; i < nav.length; i++) {
            nav[i].className = i === this.navIndex
                ? "nav-item focused"
                : "nav-item";
        }

        document.getElementsByClassName("side-nav")[0].className = "side-nav expanded";
    },

    clearAllFocus: function () {
        var posters = document.getElementsByClassName("poster");

        for (var i = 0; i < posters.length; i++) {
            posters[i].className = "poster";
        }

        var buttons = [
            document.getElementById("hero-play"),
            document.getElementById("hero-info")
        ];

        for (var b = 0; b < buttons.length; b++) {
            buttons[b].className = buttons[b].className.replace(" focused", "");
        }

        var nav = document.getElementsByClassName("nav-item");

        for (var n = 0; n < nav.length; n++) {
            nav[n].className = n === 0 ? "nav-item active" : "nav-item";
        }

        document.getElementsByClassName("side-nav")[0].className = "side-nav";
    },

    scrollRow: function (row, current) {
        var track = row.getElementsByClassName("poster-row")[0];
        var viewport = row.getElementsByClassName("row-viewport")[0];
        var target = current.offsetLeft - 12;
        var maxScroll = Math.max(0, track.scrollWidth - viewport.clientWidth + 8);

        if (target < 0) target = 0;
        if (target > maxScroll) target = maxScroll;

        track.style.transform = "translateX(-" + target + "px)";
    },

    updateHero: function (item) {
        if (!item) return;

        this.heroItem = item;

        var title = item.title || item.name || "Untitled";
        var year = (item.release_date || item.first_air_date || "").substring(0, 4);
        var score = item.vote_average ? Math.round(item.vote_average * 10) : 0;
        var type = item.media_type === "tv" || item.first_air_date ? "Series" : "Movie";

        document.getElementById("hero-title").innerHTML = this.escapeHtml(title);
        document.getElementById("hero-overview").innerHTML = this.escapeHtml(
            (item.overview || "Discover something great to watch tonight.").substring(0, 220)
        );

        document.getElementById("hero-meta").innerHTML =
            '<span class="match">' + score + '% Match</span>' +
            '<span class="meta-divider">|</span>' +
            "<span>" + (year || "New") + "</span>" +
            '<span class="meta-divider">|</span>' +
            "<span>" + type + "</span>";

        if (item.backdrop_path) {
            document.getElementById("hero").style.backgroundImage =
                "url('https://image.tmdb.org/t/p/w1280" + item.backdrop_path + "')";
        }
    },

    playCurrent: function () {
        var item = this.heroItem;

        if (!item) return;

        var type = item.media_type || (item.first_air_date ? "tv" : "movie");

        window.location.href =
            "player.html?id=" + item.id + "&type=" + type;
    },

    showStatus: function (message, isError) {
        var status = document.getElementById("status-message");

        if (!message) {
            status.className = "status-message hidden";
            return;
        }

        status.innerHTML = message;
        status.className = "status-message" + (isError ? " error" : "");
    },

    escapeHtml: function (value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }
};

window.onload = function () {
    TVApp.init();
};