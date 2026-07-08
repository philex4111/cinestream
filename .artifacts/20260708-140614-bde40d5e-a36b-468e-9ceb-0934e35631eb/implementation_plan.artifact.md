# Railway Deployment Preparation

This plan prepares the CineStream project for deployment on Railway. It includes adding production-necessary plugins (X-Forwarded-Headers), improving database connection robustness, and adding required Railway configuration files.

## Proposed Changes

### Configuration & Infrastructure

#### [NEW] [Procfile](file:///C:/Users/ADMIN/Desktop/cinestream/Procfile)
- Defines the entry point for Railway/Heroku.
```
web: java -jar build/libs/cinestream-all.jar
```

#### [NEW] [system.properties](file:///C:/Users/ADMIN/Desktop/cinestream/system.properties)
- Specifies Java 21 for the build environment.
```properties
java.runtime.version=21
```

---

### Backend Enhancements

#### [HTTP.kt](file:///C:/Users/ADMIN/Desktop/cinestream/src/main/kotlin/com/cinestream/plugins/HTTP.kt)
- Install `XForwardedHeaders` to correctly identify client IPs behind Railway's proxy. This is critical for accurate rate limiting.

#### [Database.kt](file:///C:/Users/ADMIN/Desktop/cinestream/src/main/kotlin/com/cinestream/plugins/Database.kt)
- Add logic to auto-prefix the database URL with `jdbc:` if it's missing (common when copying Railway's `DATABASE_URL`).
- Improve Postgres detection for pool size configuration.

---

## Verification Plan

### Automated Tests
- Run `./gradlew build` to ensure the project still compiles and tests pass.
- Run `./gradlew shadowJar` to verify the fat JAR is generated with the expected name.

### Manual Verification
- **Local Dry Run**:
    - Set dummy environment variables (`JWT_SECRET`, `TMDB_READ_ACCESS_TOKEN`).
    - Run `java -jar build/libs/cinestream-all.jar` locally to ensure the JAR is fully self-contained and starts up.
- **Check Configuration**:
    - Verify `application.conf` properly maps all required env vars.
