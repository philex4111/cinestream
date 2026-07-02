package com.cinestream.routes

import com.cinestream.models.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction

@Serializable
data class WatchlistItem(
    val id: Int,
    val tmdbId: Int,
    val mediaType: String,
    val addedAt: String
)

fun Route.watchlistRoutes() {
    authenticate("auth-jwt") {
        route("/watchlist") {
            // GET /api/watchlist — fetch current user's list
            get {
                val userId = call.principal<JWTPrincipal>()!!
                    .payload.getClaim("userId").asInt()

                val items = transaction {
                    Watchlist.select { Watchlist.userId.eq(userId) }
                        .map {
                            WatchlistItem(
                                id        = it[Watchlist.id],
                                tmdbId    = it[Watchlist.tmdbId],
                                mediaType = it[Watchlist.mediaType],
                                addedAt   = it[Watchlist.addedAt].toString()
                            )
                        }
                }
                call.respond(items)
            }

            // POST /api/watchlist — add item
            post {
                val userId = call.principal<JWTPrincipal>()!!
                    .payload.getClaim("userId").asInt()
                val entry = call.receive<WatchlistEntry>()

                transaction {
                    val exists = Watchlist.select { (Watchlist.userId.eq(userId)) and (Watchlist.tmdbId.eq(entry.tmdbId)) and (Watchlist.mediaType.eq(entry.mediaType)) }
                        .limit(1)
                        .any()
                    if (!exists) {
                        Watchlist.insert {
                            it[Watchlist.userId] = userId
                            it[Watchlist.tmdbId] = entry.tmdbId
                            it[Watchlist.mediaType] = entry.mediaType
                        }
                    }
                }
                call.respond(HttpStatusCode.Created, mapOf("message" to "Added to watchlist"))
            }

            // DELETE /api/watchlist/{tmdbId}?type=movie
            delete("/{tmdbId}") {
                val userId    = call.principal<JWTPrincipal>()!!
                    .payload.getClaim("userId").asInt()
                val tmdbId    = call.parameters["tmdbId"]!!.toInt()
                val mediaType = call.request.queryParameters["type"] ?: "movie"

                transaction {
                    Watchlist.deleteWhere {
                        (Watchlist.userId.eq(userId)) and
                        (Watchlist.tmdbId.eq(tmdbId)) and
                        (Watchlist.mediaType.eq(mediaType))
                    }
                }
                call.respond(mapOf("message" to "Removed from watchlist"))
            }
        }
    }
}
