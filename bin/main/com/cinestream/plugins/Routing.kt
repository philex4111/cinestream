package com.cinestream.plugins

import com.cinestream.routes.authRoutes
import com.cinestream.routes.healthRoutes
import com.cinestream.routes.streamRoutes
import com.cinestream.routes.tmdbRoutes
import com.cinestream.routes.userRoutes
import com.cinestream.routes.watchlistRoutes
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.plugins.ratelimit.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    routing {
        // Health check — outside /api, no prefix, for load balancers
        healthRoutes()

        // Serve the frontend from resources/static
        staticResources("/", "static") {
            default("index.html")
        }

        // API routes
        route("/api") {
            rateLimit(RateLimitName("auth")) {
                authRoutes()
            }
            rateLimit(RateLimitName("tmdb")) {
                tmdbRoutes()
            }
            rateLimit(RateLimitName("stream")) {
                streamRoutes()
            }
            userRoutes()
            watchlistRoutes()
        }
    }
}