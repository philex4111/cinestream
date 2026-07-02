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
    val dbUrl = environment.config.propertyOrNull("db.url")?.getString()
        ?: "jdbc:sqlite:./cinestream.db"
    val dbDriver = environment.config.propertyOrNull("db.driver")?.getString()
        ?: "org.sqlite.JDBC"

    val hikariConfig = HikariConfig().apply {
        jdbcUrl = dbUrl
        driverClassName = dbDriver
        maximumPoolSize = 10
        // SQLite needs single connection; Postgres can use more
        if (dbUrl.contains("sqlite")) maximumPoolSize = 1
    }

    val dataSource = HikariDataSource(hikariConfig)
    Database.connect(dataSource)

    // Auto-create tables on startup
    transaction {
        SchemaUtils.create(Users, Watchlist)
    }

    log.info("Database connected: $dbUrl")
}
