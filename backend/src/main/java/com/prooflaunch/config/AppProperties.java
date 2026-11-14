package com.prooflaunch.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Cors cors, Engagement engagement, RateLimit rateLimit) {

    public record Jwt(String secret, long expirationMinutes) {
    }

    public record Cors(List<String> allowedOrigins) {
    }

    public record Engagement(int minTrySeconds, int maxLaunchesPerDay) {
    }

    public record RateLimit(int authPerMinute) {
    }
}
