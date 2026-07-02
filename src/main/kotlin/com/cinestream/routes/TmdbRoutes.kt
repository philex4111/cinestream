package com.cinestream.routes

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
import kotlinx.serialization.json.Json

private val tmdbClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json { ignoreUnknownKeys = true })
    }
}

private const val TMDB_BASE = "https://api.themoviedb.org/3"

fun Route.tmdbRoutes() {
    val config      = application.environment.config
    val bearerToken = config.propertyOrNull("tmdb.readAccessToken")?.getString()
    val apiKey      = config.propertyOrNull("tmdb.apiKey")?.getString()

    require(bearerToken != null || apiKey != null) {
        "Neither TMDB_READ_ACCESS_TOKEN nor TMDB_API_KEY is set"
    }

    fun HttpRequestBuilder.tmdbAuth() {
        if (bearerToken != null) header(HttpHeaders.Authorization, "Bearer $bearerToken")
    }

    fun tmdbUrl(path: String, vararg params: Pair<String, String?>): String {
        val allParams = buildList {
            if (bearerToken == null && apiKey != null) add("api_key" to apiKey)
            params.forEach { (k, v) -> if (v != null) add(k to v) }
        }
        val qs = allParams.joinToString("&") { (k, v) -> "$k=$v" }
        return if (qs.isEmpty()) "$TMDB_BASE$path" else "$TMDB_BASE$path?$qs"
    }

    route("/tmdb") {
        get("/movie/popular") {
            val page = call.request.queryParameters["page"] ?: "1"
            proxyTmdb(call, tmdbUrl("/movie/popular", "page" to page)) { tmdbAuth() }
        }
        get("/movie/{id}") {
            val id = call.parameters["id"]!!
            proxyTmdb(call, tmdbUrl("/movie/$id", "append_to_response" to "credits,videos")) { tmdbAuth() }
        }
        get("/movie/{id}/similar") {
            val id   = call.parameters["id"]!!
            val page = call.request.queryParameters["page"] ?: "1"
            proxyTmdb(call, tmdbUrl("/movie/$id/similar", "page" to page)) { tmdbAuth() }
        }
        get("/movie/{id}/recommendations") {
            val id   = call.parameters["id"]!!
            val page = call.request.queryParameters["page"] ?: "1"
            proxyTmdb(call, tmdbUrl("/movie/$id/recommendations", "page" to page)) { tmdbAuth() }
        }
        get("/tv/popular") {
            val page = call.request.queryParameters["page"] ?: "1"
            proxyTmdb(call, tmdbUrl("/tv/popular", "page" to page)) { tmdbAuth() }
        }
        get("/tv/{id}") {
            val id = call.parameters["id"]!!
            proxyTmdb(call, tmdbUrl("/tv/$id", "append_to_response" to "credits,videos")) { tmdbAuth() }
        }
        get("/tv/{id}/similar") {
            val id   = call.parameters["id"]!!
            val page = call.request.queryParameters["page"] ?: "1"
            proxyTmdb(call, tmdbUrl("/tv/$id/similar", "page" to page)) { tmdbAuth() }
        }
        get("/tv/{id}/season/{season}") {
            val id     = call.parameters["id"]!!
            val season = call.parameters["season"]!!
            proxyTmdb(call, tmdbUrl("/tv/$id/season/$season")) { tmdbAuth() }
        }
        get("/search") {
            val query = call.request.queryParameters["query"] ?: ""
            val page  = call.request.queryParameters["page"] ?: "1"
            val type  = call.request.queryParameters["type"] ?: "multi"
            proxyTmdb(call, tmdbUrl("/search/$type", "query" to query, "page" to page)) { tmdbAuth() }
        }
        get("/trending") {
            val time = call.request.queryParameters["time"] ?: "week"
            proxyTmdb(call, tmdbUrl("/trending/all/$time")) { tmdbAuth() }
        }
        get("/genre/{type}/list") {
            val type = call.parameters["type"]!!
            proxyTmdb(call, tmdbUrl("/genre/$type/list")) { tmdbAuth() }
        }
    }
}

private suspend fun proxyTmdb(
    call: ApplicationCall,
    url: String,
    block: HttpRequestBuilder.() -> Unit = {}
) {
    try {
        val response: HttpResponse = tmdbClient.get(url) { block() }
        call.respondText(response.bodyAsText(), ContentType.Application.Json, response.status)
    } catch (e: Exception) {
        call.respond(HttpStatusCode.BadGateway, """{"error":"TMDB request failed: ${e.message}"}""")
    }
}