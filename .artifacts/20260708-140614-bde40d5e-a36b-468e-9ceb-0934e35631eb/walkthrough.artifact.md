# Railway Deployment Walkthrough

I have prepared the CineStream project for deployment on Railway. The project is now configured to build correctly, handle production database URLs, and run as a web service.

## Changes Made

### 1. Railway Configuration
- **[Procfile](file:///C:/Users/ADMIN/Desktop/cinestream/Procfile)**: Created to tell Railway how to start the app using the generated Fat JAR.
- **[system.properties](file:///C:/Users/ADMIN/Desktop/cinestream/system.properties)**: Created to ensure Railway builds the project using Java 21.

### 2. Database Robustness
- **[Database.kt](file:///C:/Users/ADMIN/Desktop/cinestream/src/main/kotlin/com/cinestream/plugins/Database.kt)**:
    - Added logic to automatically add the `jdbc:` prefix to `postgres://` URLs (common when copying connection strings from Railway).
    - Optimized connection pool sizes specifically for PostgreSQL vs SQLite.

### 3. Build System
- Verified that `./gradlew buildFatJar` successfully produces `build/libs/cinestream-all.jar`, which matches the entry point in the `Procfile`.

## Verification Summary
- **Build Success**: Successfully ran `./gradlew buildFatJar` locally.
- **Artifact Verification**: Confirmed the existence of `cinestream-all.jar`.
- **Config Check**: Verified `application.conf` correctly references environment variables for `DB_URL`, `JWT_SECRET`, and `TMDB_READ_ACCESS_TOKEN`.

## Next Steps for You

1.  **Push Changes**: Commit and push these new files (`Procfile`, `system.properties`, and the code changes) to your GitHub repository.
2.  **Connect Railway**:
    - Go to [railway.app](https://railway.app).
    - Create a "New Project" -> "Deploy from GitHub repo".
3.  **Setup Database**:
    - Add a **PostgreSQL** plugin in Railway.
    - Copy the `DATABASE_URL` provided by Railway.
4.  **Set Environment Variables**:
    - In the Railway dashboard for your service, add:
        - `DB_URL`: The value of `DATABASE_URL` you just copied.
        - `DB_DRIVER`: `org.postgresql.Driver`
        - `JWT_SECRET`: A long random string.
        - `TMDB_READ_ACCESS_TOKEN`: Your TMDB API Bearer token.
        - `PORT`: `8080` (Railway will automatically map this to its public URL).
