package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Configuration for async processing.
 * Enables @Async annotation for async email sending via Spring Events.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    // Default async executor is used
    // For production, consider configuring a custom ThreadPoolTaskExecutor
}
