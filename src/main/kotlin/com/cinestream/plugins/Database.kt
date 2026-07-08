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
    var dbUrl = System.getenv("DB_URL") ?: "jdbc:sqlite:./cinestream.db"
    val dbDriver = System.getenv("DB_DRIVER") ?: "org.sqlite.JDBC"

    // Fix for Railway: ensure Postgres URLs have the jdbc: prefix
    if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
        dbUrl = "jdbc:" + dbUrl
    }

    val hikariConfig = HikariConfig().apply {
        jdbcUrl = dbUrl
        driverClassName = dbDriver
        maximumPoolSize = 10
        // SQLite needs single connection; Postgres can use more
        if (dbUrl.contains("sqlite")) {
            maximumPoolSize = 1
        } else if (dbUrl.contains("postgresql") || dbUrl.contains("postgres")) {
            maximumPoolSize = 10
        }
    }

    val dataSource = HikariDataSource(hikariConfig)
    Database.connect(dataSource)

    // Auto-create tables on startup
    transaction {
        SchemaUtils.create(Users, Watchlist)
    }

    log.info("Database connected: $dbUrl")
}
