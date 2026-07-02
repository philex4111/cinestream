package com.cinestream.routes

import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.selectAll
import com.cinestream.models.Users
import io.ktor.server.application.call

@Serializable
data class HealthResponse(
    val status: String,
    val database: String,
    val version: String = "1.0.0"
)

fun Route.healthRoutes() {
    get("/health") {
        val dbStatus = try {
            transaction { Users.selectAll().limit(1).toList() }
            "connected"
        } catch (e: Exception) {
            "unreachable: ${e.message}"
        }

        val isHealthy = dbStatus == "connected"

        call.respond(
            if (isHealthy) HttpStatusCode.OK else HttpStatusCode.ServiceUnavailable,
            HealthResponse(
                status   = if (isHealthy) "ok" else "degraded",
                database = dbStatus
            )
        )
    }
}