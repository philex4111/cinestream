# Implementation Plan: CineStream TV (LG NetCast 4.0)

This plan outlines the creation of a TV-optimized web interface that will run on legacy LG NetCast 4.0 TVs, reusing the existing Ktor backend logic.

## 1. Project Architecture
- **Location**: The TV front-end will live inside your **IntelliJ (Ktor) Project** under `src/main/resources/static/tv`.
- **Reason**: This allows your Railway server to serve the TV app directly (`/tv/index.html`), avoiding Cross-Origin (CORS) issues and simplifying deployment.

## 2. Technical Stack (Legacy Compatible)
NetCast 4.0 uses an older WebKit engine. We must use:
- **HTML5**: Basic structures.
- **CSS 2.1 / Limited CSS3**: Using absolute positioning and floats where flexbox might fail.
- **Vanilla JavaScript (ES5)**: No `const`, `let`, or `arrow functions`. Use `var` and `function` for maximum compatibility.

## 3. Core Components to Create

### A. Ktor Static File Handler
- Update `Application.kt` in the IntelliJ project to serve files from the `static` folder.
- Endpoint: `https://cinestream254.up.railway.app/tv`

### B. The Focus Engine (`tv/app.js`)
Since there is no mouse on a TV, we need a custom script to:
- Track which movie poster is currently "Selected."
- Listen for Remote Control key codes (Up, Down, Left, Right, Enter).
- Move the `focus` class to the next/previous element.
- Auto-scroll the page when the selection moves off-screen.

### C. TV-Optimized UI (`tv/index.html` & `tv/style.css`)
- **Resolution**: Optimized for 1280x720.
- **Layout**:
  - Large posters (fewer per row than the phone).
  - Overscan protection (5% margin on all sides).
  - Highly visible selection border (e.g., thick Crimson border around the focused poster).

### D. Media Player (`tv/player.html`)
- Integrate the VidSrc/2Embed iFrames.
- Handle the "Back" key on the remote to return to the catalog.

## 4. Key Mapping for NetCast
We will implement a global listener for these codes:
- **37**: Left
- **38**: Up
- **39**: Right
- **40**: Down
- **13**: OK (Enter)
- **461**: Return (Back)

## 5. Implementation Phases

| Phase | Task | Description |
| :--- | :--- | :--- |
| **Phase 1** | Ktor Setup | Add `static` content support to your backend. |
| **Phase 2** | UI Scaffold | Create the HTML/CSS with dummy posters to test the "look." |
| **Phase 3** | Navigation | Write the ES5 JS engine for remote control movement. |
| **Phase 4** | API Binding | Connect JS to your `/api/tmdb/trending` endpoint. |
| **Phase 5** | Player | Build the video launch logic. |

## 6. Verification Plan
- **Browser Test**: Open the Railway URL in Chrome on your PC using only the keyboard (Arrow keys) to simulate a TV.
- **TV Test**: Open the LG TV web browser and navigate to the URL.
