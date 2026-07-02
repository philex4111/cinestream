package com.cinestream.routes

import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.http.*
import io.ktor.server.application.call
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

        // GET /api/stream/movie/{tmdbId}
        get("/movie/{tmdbId}") {
            val tmdbId = call.parameters["tmdbId"]?.toIntOrNull()
                ?: return@get call.respond(
                    HttpStatusCode.BadRequest,
                    com.cinestream.models.ApiError("Invalid movie ID")
                )

            call.respond(
                StreamResponse(
                    tmdbId    = tmdbId,
                    mediaType = "movie",
                    sources   = movieSources(tmdbId)
                )
            )
        }

        // GET /api/stream/tv/{tmdbId}/season/{season}/episode/{episode}
        get("/tv/{tmdbId}/season/{season}/episode/{episode}") {
            val tmdbId  = call.parameters["tmdbId"]?.toIntOrNull()
            val season  = call.parameters["season"]?.toIntOrNull()
            val episode = call.parameters["episode"]?.toIntOrNull()

            if (tmdbId == null || season == null || episode == null) {
                call.respond(HttpStatusCode.BadRequest, com.cinestream.models.ApiError("Invalid parameters"))
                return@get
            }

            call.respond(
                StreamResponse(
                    tmdbId    = tmdbId,
                    mediaType = "tv",
                    sources   = tvSources(tmdbId, season, episode)
                )
            )
        }
    }
}

private fun movieSources(tmdbId: Int): List<StreamSource> = listOf(
    StreamSource(
        provider = "VidSrc",
        embedUrl = "https://vidsrc.xyz/embed/movie/$tmdbId"
    ),
    StreamSource(
        provider = "VidSrc2",
        embedUrl = "https://vidsrc.to/embed/movie/$tmdbId"
    ),
    StreamSource(
        provider = "SuperEmbed",
        embedUrl = "https://multiembed.mov/?video_id=$tmdbId&tmdb=1"
    )
)

private fun tvSources(tmdbId: Int, season: Int, episode: Int): List<StreamSource> = listOf(
    StreamSource(
        provider = "VidSrc",
        embedUrl = "https://vidsrc.xyz/embed/tv/$tmdbId/$season/$episode"
    ),
    StreamSource(
        provider = "VidSrc2",
        embedUrl = "https://vidsrc.to/embed/tv?tmdb=$tmdbId&season=$season&episode=$episode"
    ),
    StreamSource(
        provider = "SuperEmbed",
        embedUrl = "https://multiembed.mov/?video_id=$tmdbId&tmdb=1&s=$season&e=$episode"
    )
)