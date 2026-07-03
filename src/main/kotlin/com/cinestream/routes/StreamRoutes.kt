package com.cinestream.routes

import io.ktor.http.*
import io.ktor.server.application.call
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable

@Serializable
data class StreamSource(
    val provider: String,
    val embedUrl: String,
    val quality: String = "HD"
)

@Serializable
data class StreamResponse(
    val tmdbId: Int,
    val mediaType: String,
    val sources: List<StreamSource>
)

fun Route.streamRoutes() {
    route("/stream") {

        // GET /api/stream/movie/{tmdbId}?imdbId=tt1234567
        get("/movie/{tmdbId}") {
            val tmdbId = call.parameters["tmdbId"]?.toIntOrNull()
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    com.cinestream.models.ApiError("Invalid movie ID")
                )
            val imdbId = call.request.queryParameters["imdbId"]

            call.respond(
                StreamResponse(
                    tmdbId    = tmdbId,
                    mediaType = "movie",
                    sources   = movieSources(tmdbId, imdbId)
                )
            )
        }

        // GET /api/stream/tv/{tmdbId}/season/{season}/episode/{episode}?imdbId=tt1234567
        get("/tv/{tmdbId}/season/{season}/episode/{episode}") {
            val tmdbId  = call.parameters["tmdbId"]?.toIntOrNull()
            val season  = call.parameters["season"]?.toIntOrNull()
            val episode = call.parameters["episode"]?.toIntOrNull()

            if (tmdbId == null || season == null || episode == null) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    com.cinestream.models.ApiError("Invalid parameters")
                )
                return@get
            }
            val imdbId = call.request.queryParameters["imdbId"]

            call.respond(
                StreamResponse(
                    tmdbId    = tmdbId,
                    mediaType = "tv",
                    sources   = tvSources(tmdbId, season, episode, imdbId)
                )
            )
        }
    }
}

private fun movieSources(tmdbId: Int, imdbId: String?): List<StreamSource> = buildList {
    // ── VidSrc v2 (IMDB-based, best quality) ───────────────
    if (imdbId != null) {
        add(StreamSource(
            provider = "VidSrc v2",
            embedUrl = "https://v2.vidsrc.me/embed/$imdbId/",
            quality  = "1080p"
        ))
    }
    // ── TMDB-based domains (live mirrors) ──────────────────
    add(StreamSource(provider = "VidSrc",         embedUrl = "https://vidsrc-me.ru/embed/movie?tmdb=$tmdbId",    quality = "1080p"))
    add(StreamSource(provider = "VidSrc 2",       embedUrl = "https://vidsrc-me.su/embed/movie?tmdb=$tmdbId",    quality = "1080p"))
    add(StreamSource(provider = "VidSrc 3",       embedUrl = "https://vidsrc-embed.ru/embed/movie?tmdb=$tmdbId", quality = "1080p"))
    add(StreamSource(provider = "VidSrc 4",       embedUrl = "https://vidsrc-embed.su/embed/movie?tmdb=$tmdbId", quality = "1080p"))
    add(StreamSource(provider = "VidSrc 5",       embedUrl = "https://vsrc.su/embed/movie?tmdb=$tmdbId",         quality = "1080p"))
    add(StreamSource(provider = "VidSrc 6",       embedUrl = "https://vidsrcme.su/embed/movie?tmdb=$tmdbId",     quality = "1080p"))
    add(StreamSource(provider = "VidSrc 7",       embedUrl = "https://vidsrcme.ru/embed/movie?tmdb=$tmdbId",     quality = "1080p"))
    add(StreamSource(provider = "VidSrc Classic", embedUrl = "https://vidsrc.me/embed/movie?tmdb=$tmdbId",       quality = "HD"))
    add(StreamSource(provider = "VidSrc.bz",      embedUrl = "https://vidsrc.bz/embed/movie?tmdb=$tmdbId",       quality = "HD"))
    add(StreamSource(provider = "VidSrc.gd",      embedUrl = "https://vidsrc.gd/embed/movie?tmdb=$tmdbId",       quality = "HD"))
    add(StreamSource(provider = "VidSrc.do",      embedUrl = "https://vidsrc.do/embed/movie?tmdb=$tmdbId",       quality = "HD"))
    add(StreamSource(provider = "VidSrc.tw",      embedUrl = "https://vidsrc.tw/embed/movie?tmdb=$tmdbId",       quality = "HD"))
}

private fun tvSources(tmdbId: Int, season: Int, episode: Int, imdbId: String?): List<StreamSource> = buildList {
    // ── VidSrc v2 (IMDB-based, best quality) ───────────────
    if (imdbId != null) {
        add(StreamSource(
            provider = "VidSrc v2",
            embedUrl = "https://v2.vidsrc.me/embed/$imdbId/$season-$episode/",
            quality  = "1080p"
        ))
    }
    // ── TMDB-based domains (live mirrors) ──────────────────
    add(StreamSource(provider = "VidSrc",         embedUrl = "https://vidsrc-me.ru/embed/tv?tmdb=$tmdbId&season=$season&episode=$episode",    quality = "1080p"))
    add(StreamSource(provider = "VidSrc 2",       embedUrl = "https://vidsrc-me.su/embed/tv?tmdb=$tmdbId&season=$season&episode=$episode",    quality = "1080p"))
    add(StreamSource(provider = "VidSrc 3",       embedUrl = "https://vidsrc-embed.ru/embed/tv?tmdb=$tmdbId&season=$season&episode=$episode", quality = "1080p"))
    add(StreamSource(provider = "VidSrc 4",       embedUrl = "https://vidsrc-embed.su/embed/tv?tmdb=$tmdbId&season=$season&episode=$episode", quality = "1080p"))
    add(StreamSource(provider = "VidSrc 5",       embedUrl = "https://vsrc.su/embed/tv?tmdb=$tmdbId&season=$season&episode=$episode",         quality = "1080p"))
    add(StreamSource(provider = "VidSrc 6",       embedUrl = "https://vidsrcme.su/embed/tv?tmdb=$tmdbId&season=$season&episode=$episode",     quality = "1080p"))
    add(StreamSource(provider = "VidSrc 7",       embedUrl = "https://vidsrcme.ru/embed/tv?tmdb=$tmdbId&season=$season&episode=$episode",     quality = "1080p"))
    add(StreamSource(provider = "VidSrc Classic", embedUrl = "https://vidsrc.me/embed/tv?tmdb=$tmdbId&season=$season&episode=$episode",       quality = "HD"))
    add(StreamSource(provider = "VidSrc.bz",      embedUrl = "https://vidsrc.bz/embed/tv?tmdb=$tmdbId&season=$season&episode=$episode",       quality = "HD"))
    add(StreamSource(provider = "VidSrc.gd",      embedUrl = "https://vidsrc.gd/embed/tv?tmdb=$tmdbId&season=$season&episode=$episode",       quality = "HD"))
    add(StreamSource(provider = "VidSrc.do",      embedUrl = "https://vidsrc.do/embed/tv?tmdb=$tmdbId&season=$season&episode=$episode",       quality = "HD"))
    add(StreamSource(provider = "VidSrc.tw",      embedUrl = "https://vidsrc.tw/embed/tv?tmdb=$tmdbId&season=$season&episode=$episode",       quality = "HD"))
}