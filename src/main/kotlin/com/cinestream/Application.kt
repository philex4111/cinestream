package com.cinestream

import com.cinestream.plugins.*
import io.ktor.server.application.*
import io.ktor.server.netty.EngineMain

fun main(args: Array<String>): Unit = EngineMain.main(args)

fun Application.module() {
    configureSerialization()
    configureHTTP()
    configureRateLimiting()
    configureStatusPages()
    configureDatabase()
    configureAuth()
    configureRouting()
}
