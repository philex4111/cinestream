package com.cinestream.routes

import com.cinestream.models.ApiError
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

private val streamClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json { ignoreUnknownKeys = true })
    }
}

private const val TMDB_BASE = "https://api.themoviedb.org/3"

@Serializable
data class StreamSource(
    val provider: String,
    val embedUrl: String,
    val quality: String = "HD",
    val kind: String = "trailer"
)

@Serializable
data class StreamResponse(
    val tmdbId: Int,
    val mediaType: String,
    val sources: List<StreamSource>
)

@Serializable
private data class TmdbVideosResponse(
    val results: List<TmdbVideo> = emptyList()
)

@Serializable
private data class TmdbVideo(
    val key: String,
    val name: String = "",
    val site: String = "",
    val type: String = "",
    val official: Boolean = false,
    @SerialName("published_at") val publishedAt: String = ""
)

fun Route.streamRoutes() {
    val config = application.environment.config
    val bearerToken = config.propertyOrNull("tmdb.readAccessToken")?.getString()
    val apiKey = config.propertyOrNull("tmdb.apiKey")?.getString()
    val movieTemplate = config.propertyOrNull("stream.licensedMovieTemplate")?.getString()
    val tvTemplate = config.propertyOrNull("stream.licensedTvTemplate")?.getString()

    fun HttpRequestBuilder.tmdbAuth() {
        if (bearerToken != null) header(HttpHeaders.Authorization, "Bearer $bearerToken")
    }

    fun tmdbUrl(path: String): String {
        val apiKeyParam = if (bearerToken == null && apiKey != null) "?api_key=$apiKey" else ""
        return "$TMDB_BASE$path$apiKeyParam"
    }

    route("/stream") {
        get("/movie/{tmdbId}") {
            val tmdbId = call.parameters["tmdbId"]?.toIntOrNull()
                ?: return@get call.respond(HttpStatusCode.BadRequest, ApiError("Invalid movie ID"))

            val sources = buildList {
                addAll(templateSource(movieTemplate, "Licensed Provider", tmdbId, null, null))
                addAll(tmdbVideoSources(tmdbUrl("/movie/$tmdbId/videos")) { tmdbAuth() })
            }

            call.respond(StreamResponse(tmdbId = tmdbId, mediaType = "movie", sources = sources))
        }

        get("/tv/{tmdbId}/season/{season}/episode/{episode}") {
            val tmdbId = call.parameters["tmdbId"]?.toIntOrNull()
            val season = call.parameters["season"]?.toIntOrNull()
            val episode = call.parameters["episode"]?.toIntOrNull()

            if (tmdbId == null || season == null || episode == null) {
                call.respond(HttpStatusCode.BadRequest, ApiError("Invalid parameters"))
                return@get
            }

            val episodeVideos = tmdbVideoSources(
                tmdbUrl("/tv/$tmdbId/season/$season/episode/$episode/videos")
            ) { tmdbAuth() }
            val showVideos = if (episodeVideos.isEmpty()) {
                tmdbVideoSources(tmdbUrl("/tv/$tmdbId/videos")) { tmdbAuth() }
            } else {
                emptyList()
            }

            val sources = buildList {
                addAll(templateSource(tvTemplate, "Licensed Provider", tmdbId, season, episode))
                addAll(episodeVideos)
                addAll(showVideos)
            }

            call.respond(StreamResponse(tmdbId = tmdbId, mediaType = "tv", sources = sources))
        }
    }
}

private fun templateSource(
    template: String?,
    provider: String,
    tmdbId: Int,
    season: Int?,
    episode: Int?
): List<StreamSource> {
    if (template.isNullOrBlank()) return emptyList()

    val embedUrl = template
        .replace("{tmdbId}", tmdbId.toString())
        .replace("{season}", season?.toString() ?: "")
        .replace("{episode}", episode?.toString() ?: "")

    return listOf(StreamSource(provider = provider, embedUrl = embedUrl, kind = "licensed"))
}

private suspend fun tmdbVideoSources(
    url: String,
    block: HttpRequestBuilder.() -> Unit
): List<StreamSource> {
    return try {
        val response: HttpResponse = streamClient.get(url) { block() }
        if (!response.status.isSuccess()) return emptyList()

        Json { ignoreUnknownKeys = true }
            .decodeFromString<TmdbVideosResponse>(response.bodyAsText())
            .results
            .filter { it.site.equals("YouTube", ignoreCase = true) }
            .sortedWith(
                compareByDescending<TmdbVideo> { it.official }
                    .thenBy { videoRank(it.type) }
                    .thenByDescending { it.publishedAt }
            )
            .take(5)
            .map {
                StreamSource(
                    provider = "YouTube",
                    embedUrl = "https://www.youtube.com/embed/${it.key}",
                    quality = "Official",
                    kind = it.type.ifBlank { "video" }
                )
            }
    } catch (_: Exception) {
        emptyList()
    }
}

private fun videoRank(type: String): Int = when (type.lowercase()) {
    "trailer" -> 0
    "teaser" -> 1
    "clip" -> 2
    else -> 3
}
