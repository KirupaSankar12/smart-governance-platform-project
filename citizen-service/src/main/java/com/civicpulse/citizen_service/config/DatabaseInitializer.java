package com.civicpulse.citizen_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            // Dynamically find and drop any unique constraints on citizens(phone_number)
            jdbcTemplate.execute(
                "DO $$ DECLARE r RECORD; BEGIN " +
                "FOR r IN (SELECT constraint_name FROM information_schema.constraint_column_usage WHERE table_name = 'citizens' AND column_name = 'phone_number') LOOP " +
                "  EXECUTE 'ALTER TABLE citizens DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name); " +
                "END LOOP; " +
                "END $$;"
            );
            log.info("Successfully checked and dropped unique constraint on phone_number in citizens table.");
        } catch (Exception e) {
            log.warn("Note during database startup: {}", e.getMessage());
        }
    }
}
