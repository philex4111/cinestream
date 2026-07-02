package com.cinestream.plugins

import com.cinestream.models.ApiError
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*

fun Application.configureStatusPages() {
    install(StatusPages) {

        // Catch-all for unhandled exceptions
        exception<Throwable> { call, cause ->
            call.application.log.error("Unhandled error", cause)
            call.respond(
                HttpStatusCode.InternalServerError,
                ApiError("Something went wrong: ${cause.message}")
            )
        }

        // 401 — missing or invalid JWT
        status(HttpStatusCode.Unauthorized) { call, _ ->
            call.respond(
                HttpStatusCode.Unauthorized,
                ApiError("Authentication required")
            )
        }

        // 403 — authenticated but not allowed
        status(HttpStatusCode.Forbidden) { call, _ ->
            call.respond(
                HttpStatusCode.Forbidden,
                ApiError("You don't have permission to do that")
            )
        }

        // 404 — route not found
        status(HttpStatusCode.NotFound) { call, _ ->
            call.respond(
                HttpStatusCode.NotFound,
                ApiError("Resource not found: ${call.request.local.uri}")
            )
        }

        // 400 — bad request (e.g. malformed JSON body)
        exception<io.ktor.server.plugins.BadRequestException> { call, cause ->
            call.respond(
                HttpStatusCode.BadRequest,
                ApiError("Bad request: ${cause.message}")
            )
        }

        // 405 — method not allowed
        status(HttpStatusCode.MethodNotAllowed) { call, _ ->
            call.respond(
                HttpStatusCode.MethodNotAllowed,
                ApiError("Method not allowed")
            )
        }
    }
}