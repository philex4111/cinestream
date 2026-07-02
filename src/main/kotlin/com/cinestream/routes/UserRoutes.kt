package com.cinestream.routes

import com.cinestream.models.ApiError
import com.cinestream.models.Users
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.mindrot.jbcrypt.BCrypt

@Serializable
data class UserProfile(
    val id: Int,
    val email: String,
    val username: String,
    val createdAt: String
)

@Serializable
data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)

@Serializable
data class ChangeUsernameRequest(val username: String)

fun Route.userRoutes() {
    authenticate("auth-jwt") {
        route("/user") {

            // GET /api/user/me
            get("/me") {
                val userId = call.principal<JWTPrincipal>()!!
                    .payload.getClaim("userId").asInt()

                val user = transaction {
                    Users.select { Users.id eq userId }.singleOrNull()
                } ?: return@get call.respond(
                    HttpStatusCode.NotFound,
                    ApiError("User not found")
                )

                call.respond(
                    UserProfile(
                        id        = user[Users.id],
                        email     = user[Users.email],
                        username  = user[Users.username],
                        createdAt = user[Users.createdAt].toString()
                    )
                )
            }

            // PUT /api/user/username
            put("/username") {
                val userId = call.principal<JWTPrincipal>()!!
                    .payload.getClaim("userId").asInt()
                val req = call.receive<ChangeUsernameRequest>()

                if (req.username.isBlank() || req.username.length < 3) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        ApiError("Username must be at least 3 characters")
                    )
                    return@put
                }

                val taken = transaction {
                    Users.select { Users.username eq req.username }.singleOrNull()
                }
                if (taken != null) {
                    call.respond(HttpStatusCode.Conflict, ApiError("Username already taken"))
                    return@put
                }

                transaction {
                    Users.update({ Users.id eq userId }) {
                        it[username] = req.username
                    }
                }
                call.respond(mapOf("message" to "Username updated"))
            }

            // PUT /api/user/password
            put("/password") {
                val userId = call.principal<JWTPrincipal>()!!
                    .payload.getClaim("userId").asInt()
                val req = call.receive<ChangePasswordRequest>()

                if (req.newPassword.length < 8) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        ApiError("New password must be at least 8 characters")
                    )
                    return@put
                }

                val user = transaction {
                    Users.select { Users.id eq userId }.singleOrNull()
                } ?: return@put call.respond(HttpStatusCode.NotFound, ApiError("User not found"))

                if (!BCrypt.checkpw(req.currentPassword, user[Users.password])) {
                    call.respond(HttpStatusCode.Unauthorized, ApiError("Current password is incorrect"))
                    return@put
                }

                transaction {
                    Users.update({ Users.id eq userId }) {
                        it[password] = BCrypt.hashpw(req.newPassword, BCrypt.gensalt())
                    }
                }
                call.respond(mapOf("message" to "Password updated"))
            }
        }
    }
}