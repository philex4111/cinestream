package com.cinestream.plugins

import com.cinestream.models.Users
import com.cinestream.models.Watchlist
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.server.application.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

fun Application.configureDatabase() {
    val rawDbUrl = System.getenv("DB_URL") ?: "jdbc:sqlite:./cinestream.db"
    val dbDriver = System.getenv("DB_DRIVER") ?: "org.sqlite.JDBC"

    // Fix for Railway: parse postgresql:// URLs and reconstruct as a valid JDBC URL.
    // Railway provides URLs in the form:
    //   postgresql://user:password@host:port/database
    // The PostgreSQL JDBC driver cannot parse credentials embedded in the host
    // portion of the URL, so we extract them and move them to query parameters:
    //   jdbc:postgresql://host:port/database?user=user&password=password
    val dbUrl = if (rawDbUrl.startsWith("postgres://") || rawDbUrl.startsWith("postgresql://")) {
        val withoutScheme = rawDbUrl.removePrefix("postgres://").removePrefix("postgresql://")

        // Split userinfo from the host/path portion: "user:pass@host:port/db"
        val atIndex = withoutScheme.indexOf('@')
        val userInfo = if (atIndex >= 0) withoutScheme.substring(0, atIndex) else ""
        val hostAndPath = if (atIndex >= 0) withoutScheme.substring(atIndex + 1) else withoutScheme

        // Parse user and password from userinfo
        val user = if (userInfo.contains(':')) userInfo.substringBefore(':') else userInfo
        val password = if (userInfo.contains(':')) userInfo.substringAfter(':') else ""

        // Parse host, port, and database from the remainder
        val slashIndex = hostAndPath.indexOf('/')
        val hostPort = if (slashIndex >= 0) hostAndPath.substring(0, slashIndex) else hostAndPath
        val database = if (slashIndex >= 0) hostAndPath.substring(slashIndex + 1) else ""

        val host = if (hostPort.contains(':')) hostPort.substringBefore(':') else hostPort
        val port = if (hostPort.contains(':')) hostPort.substringAfter(':') else "5432"

        // Build the JDBC URL with credentials as query parameters
        val queryParams = buildString {
            if (user.isNotEmpty()) append("user=$user")
            if (password.isNotEmpty()) {
                if (isNotEmpty()) append("&")
                append("password=$password")
            }
        }
        val base = "jdbc:postgresql://$host:$port/$database"
        if (queryParams.isNotEmpty()) "$base?$queryParams" else base
    } else {
        rawDbUrl
    }

    val hikariConfig = HikariConfig().apply {
        jdbcUrl = dbUrl
        driverClassName = dbDriver
        // SQLite requires a single connection; PostgreSQL can use a pool
        maximumPoolSize = if (dbUrl.contains("sqlite")) 1 else 10
    }

    val dataSource = HikariDataSource(hikariConfig)
    Database.connect(dataSource)

    // Auto-create tables on startup
    transaction {
        SchemaUtils.create(Users, Watchlist)
    }

    log.info("Database connected: ${dbUrl.replace(Regex("password=[^&]+"), "password=***")}")
}
