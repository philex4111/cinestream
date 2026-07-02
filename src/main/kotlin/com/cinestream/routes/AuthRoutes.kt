package com.cinestream.routes

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.cinestream.models.*
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.mindrot.jbcrypt.BCrypt
import java.util.Date

fun Route.authRoutes() {
    val jwtSecret   = application.environment.config.property("jwt.secret").getString()
    val jwtIssuer   = application.environment.config.property("jwt.issuer").getString()
    val jwtAudience = application.environment.config.property("jwt.audience").getString()

    route("/auth") {
        post("/register") {
            val req = call.receive<RegisterRequest>()

            val exists = transaction {
                Users.select { Users.email eq req.email }.singleOrNull()
            }
            if (exists != null) {
                call.respond(HttpStatusCode.Conflict, ApiError("Email already registered"))
                return@post
            }

            val hashed = BCrypt.hashpw(req.password, BCrypt.gensalt())
            val userId = transaction {
                Users.insert {
                    it[email]    = req.email
                    it[username] = req.username
                    it[password] = hashed
                } get Users.id
            }

            val token = buildToken(userId, jwtSecret, jwtIssuer, jwtAudience)
            call.respond(HttpStatusCode.Created, AuthResponse(token, req.username))
        }

        post("/login") {
            val req = call.receive<LoginRequest>()

            val user = transaction {
                Users.select { Users.email eq req.email }.singleOrNull()
            } ?: run {
                call.respond(HttpStatusCode.Unauthorized, ApiError("Invalid credentials"))
                return@post
            }

            if (!BCrypt.checkpw(req.password, user[Users.password])) {
                call.respond(HttpStatusCode.Unauthorized, ApiError("Invalid credentials"))
                return@post
            }

            val token = buildToken(user[Users.id], jwtSecret, jwtIssuer, jwtAudience)
            call.respond(AuthResponse(token, user[Users.username]))
        }
    }
}

private fun buildToken(userId: Int, secret: String, issuer: String, audience: String): String =
    JWT.create()
        .withIssuer(issuer)
        .withAudience(audience)
        .withClaim("userId", userId)
        .withExpiresAt(Date(System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000L)) // 7 days
        .sign(Algorithm.HMAC256(secret))
