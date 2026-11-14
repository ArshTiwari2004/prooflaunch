package com.prooflaunch.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Fixed-window limiter (per client IP) for credential and waitlist endpoints to slow brute-force and signup spam.
 * In-memory on purpose (single instance, zero extra infra); swap for Redis/Bucket4j when scaling horizontally.
 */
public class RateLimitFilter extends OncePerRequestFilter {

    private record Window(long minute, int count) {
    }

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final int limitPerMinute;
    private final Clock clock;

    public RateLimitFilter(int limitPerMinute, Clock clock) {
        this.limitPerMinute = limitPerMinute;
        this.clock = clock;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return !("POST".equals(request.getMethod()) && (uri.startsWith("/api/auth/") || uri.equals("/api/waitlist")));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        long minute = clock.millis() / 60_000L;
        Window w = windows.compute(request.getRemoteAddr(),
                (ip, old) -> (old == null || old.minute() != minute) ? new Window(minute, 1) : new Window(minute, old.count() + 1));
        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(e -> e.getValue().minute() != minute);
        }
        if (w.count() > limitPerMinute) {
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.setContentType("application/problem+json");
            response.getWriter().write("{\"title\":\"RATE_LIMITED\",\"status\":429,\"code\":\"RATE_LIMITED\","
                    + "\"detail\":\"Too many attempts. Please wait a minute and try again.\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
