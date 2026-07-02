package com.cinestream.models

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime
import kotlinx.serialization.Serializable

// Exposed Table definitions
object Users : Table("users") {
    val id       = integer("id").autoIncrement()
    val email    = varchar("email", 255).uniqueIndex()
    val username = varchar("username", 100).uniqueIndex()
    val password = varchar("password", 255)  // bcrypt hash
    val createdAt = datetime("created_at").defaultExpression(
        org.jetbrains.exposed.sql.javatime.CurrentDateTime
    )
    override val primaryKey = PrimaryKey(id)
}

object Watchlist : Table("watchlist") {
    val id      = integer("id").autoIncrement()
    val userId  = integer("user_id").references(Users.id)
    val tmdbId  = integer("tmdb_id")          // TMDB movie/show ID
    val mediaType = varchar("media_type", 10) // "movie" or "tv"
    val addedAt = datetime("added_at").defaultExpression(
        org.jetbrains.exposed.sql.javatime.CurrentDateTime
    )
    override val primaryKey = PrimaryKey(id)
    init { uniqueIndex(userId, tmdbId, mediaType) }
}

// Data classes for request/response serialization

@Serializable
data class RegisterRequest(val email: String, val username: String, val password: String)

@Serializable
data class LoginRequest(val email: String, val password: String)

@Serializable
data class AuthResponse(val token: String, val username: String)

@Serializable
data class WatchlistEntry(val tmdbId: Int, val mediaType: String)

@Serializable
data class ApiError(val error: String)
