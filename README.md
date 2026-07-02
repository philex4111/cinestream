# 🎬 CineStream

A full-stack movie and TV streaming platform built with **Kotlin + Ktor** on the backend and **vanilla HTML/JS** on the frontend. Fetches metadata from TMDB, proxies it server-side to keep API keys hidden, and streams video via VidSrc embeds.

---

## ✨ Features

- 🔐 JWT authentication (register, login, protected routes)
- 🎥 TMDB proxy — all API calls go through the Ktor server, key never exposed to the client
- 📺 Multi-provider video streaming via VidSrc embed URLs
- 📋 Personal watchlist (add/remove, JWT-protected)
- 🔍 Real-time search with debounce
- 🗂️ Browse by genre, type (movie/TV), and sort order
- 🧩 TV episode browser with season selector and episode search
- 🚦 Rate limiting per endpoint (auth, TMDB proxy, stream)
- 🗄️ SQLite for local dev, PostgreSQL for production (HikariCP connection pooling)
- 🎨 Cinematic dark UI — Bebas Neue display font, crimson accent, skeleton loaders

---

## 🗂️ Project Structure

```
cinestream/
├── src/
│   └── main/
│       ├── kotlin/com/cinestream/
│       │   ├── Application.kt          # Entry point (EngineMain)
│       │   ├── models/
│       │   │   └── User.kt             # Exposed table definitions + data classes
│       │   ├── plugins/
│       │   │   ├── Auth.kt             # JWT install + validation
│       │   │   ├── Database.kt         # HikariCP + Exposed + auto-migration
│       │   │   ├── HTTP.kt             # CORS, default headers
│       │   │   ├── RateLimiting.kt     # Per-endpoint rate limiters
│       │   │   ├── Routing.kt          # Route mounting + static file serving
│       │   │   ├── Serialization.kt    # kotlinx.json content negotiation
│       │   │   └── StatusPages.kt      # Global JSON error responses
│       │   └── routes/
│       │       ├── AuthRoutes.kt       # POST /api/auth/register, /login
│       │       ├── HealthRoutes.kt     # GET /health
│       │       ├── StreamRoutes.kt     # GET /api/stream/movie/{id}, /tv/{id}/...
│       │       ├── TmdbRoutes.kt       # TMDB proxy routes
│       │       ├── UserRoutes.kt       # GET/PUT /api/user/me, /username, /password
│       │       └── WatchlistRoutes.kt  # GET/POST/DELETE /api/watchlist
│       └── resources/
│           ├── application.conf        # Ktor HOCON config
│           ├── logback.xml             # Logging config
│           └── static/                 # Frontend (HTML/CSS/JS)
│               ├── index.html          # Homepage — hero + sliders
│               ├── browse.html         # Genre/type/sort filter grid
│               ├── detail.html         # Movie/TV detail + episodes
│               ├── watch.html          # Fullscreen player + episodes panel
│               ├── search.html         # Real-time search
│               ├── login.html
│               ├── register.html
│               ├── watchlist.html
│               ├── css/main.css        # Design system
│               └── js/
│                   ├── api.js          # All /api/* fetch calls
│                   ├── auth.js         # Token storage + navbar auth state
│                   └── components.js   # Reusable UI builders
├── .env.example
├── .gitignore
├── build.gradle.kts
├── gradle.properties
└── settings.gradle.kts
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| JDK  | 21 (Eclipse Temurin recommended) |
| Gradle | Wrapper included — no install needed |
| TMDB Account | Free at [themoviedb.org](https://www.themoviedb.org/signup) |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/cinestream.git
cd cinestream
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Required
TMDB_READ_ACCESS_TOKEN=your_tmdb_read_access_token   # long Bearer JWT from TMDB
JWT_SECRET=your_minimum_32_character_random_secret

# Optional — SQLite is used by default if these are omitted
DB_URL=jdbc:postgresql://localhost:5432/cinestream
DB_DRIVER=org.postgresql.Driver
PORT=8080
```

> **Where to get TMDB keys:** [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
> Use the **Read Access Token** (long JWT string) for `TMDB_READ_ACCESS_TOKEN`.

### 3. Add env vars to IntelliJ Run Configuration

Go to **Run → Edit Configurations → Environment variables** and add:

```
JWT_SECRET=your_secret;TMDB_READ_ACCESS_TOKEN=your_token
```

### 4. Build

```bash
# Windows
.\gradlew.bat build

# Mac/Linux
./gradlew build
```

### 5. Run

```bash
# Dev (Gradle wrapper)
.\gradlew.bat run        # Windows
./gradlew run            # Mac/Linux

# Or run the fat JAR directly
java -jar build/libs/cinestream-all.jar
```

Server starts at **http://localhost:8080**

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |

### User
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/me` | ✅ | Get profile |
| PUT | `/api/user/username` | ✅ | Change username |
| PUT | `/api/user/password` | ✅ | Change password |

### TMDB Proxy
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tmdb/trending?time=week` | Trending movies & TV |
| GET | `/api/tmdb/movie/popular?page=1` | Popular movies |
| GET | `/api/tmdb/tv/popular?page=1` | Popular TV shows |
| GET | `/api/tmdb/movie/{id}` | Movie details + credits + videos |
| GET | `/api/tmdb/tv/{id}` | TV details + credits + videos |
| GET | `/api/tmdb/tv/{id}/season/{n}` | Season episode list |
| GET | `/api/tmdb/movie/{id}/similar` | Similar movies |
| GET | `/api/tmdb/tv/{id}/similar` | Similar TV shows |
| GET | `/api/tmdb/search?query=batman&type=multi` | Search |
| GET | `/api/tmdb/genre/{type}/list` | Genre list |

### Stream
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stream/movie/{tmdbId}` | Get movie embed URLs (3 providers) |
| GET | `/api/stream/tv/{tmdbId}/season/{s}/episode/{e}` | Get TV episode embed URLs |

### Watchlist (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/watchlist` | Get saved items |
| POST | `/api/watchlist` | Add item `{ tmdbId, mediaType }` |
| DELETE | `/api/watchlist/{tmdbId}?type=movie` | Remove item |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server + DB status check |

---

## 🗃️ Database

SQLite is used by default — no setup required, a `cinestream.db` file is created automatically on first run.

To switch to PostgreSQL for production, set in your environment:

```env
DB_URL=jdbc:postgresql://localhost:5432/cinestream
DB_DRIVER=org.postgresql.Driver
```

Tables are auto-created via Exposed's `SchemaUtils.create()` on startup.

---

## 🏗️ Tech Stack

**Backend**
- [Kotlin](https://kotlinlang.org/) + [Ktor 2.3.12](https://ktor.io/)
- [Exposed ORM 0.50.1](https://github.com/JetBrains/Exposed)
- [HikariCP](https://github.com/brettwooldridge/HikariCP) — connection pooling
- [java-jwt](https://github.com/auth0/java-jwt) — JWT signing
- [jbcrypt](https://www.mindrot.org/projects/jBCrypt/) — password hashing
- SQLite (dev) / PostgreSQL (prod)

**Frontend**
- Vanilla HTML, CSS, JavaScript (ES modules)
- [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) + [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts
- No framework dependencies

**External APIs**
- [TMDB](https://www.themoviedb.org/) — movie/TV metadata
- [VidSrc](https://vidsrc.xyz/) — video embed provider

---

## 🔒 Security Notes

- TMDB API key/token is never sent to the browser — all TMDB calls are proxied through Ktor
- Passwords are hashed with bcrypt before storage
- JWTs expire after 7 days
- Rate limiting: auth (10 req/min), TMDB proxy (60 req/min), stream (30 req/min)
- Never commit `.env` to version control — it is listed in `.gitignore`

---

## 📦 Deployment

Build a fat JAR:

```bash
.\gradlew.bat shadowJar     # Windows
./gradlew shadowJar         # Mac/Linux
```

Output: `build/libs/cinestream-all.jar`

Run on any server with JDK 21:

```bash
java -jar cinestream-all.jar
```

Set all environment variables on your host (Railway, Render, VPS, etc.) and switch `DB_URL`/`DB_DRIVER` to PostgreSQL.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.