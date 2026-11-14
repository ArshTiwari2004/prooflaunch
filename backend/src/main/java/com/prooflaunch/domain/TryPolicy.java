package com.prooflaunch.domain;

import java.time.Duration;
import java.time.Instant;

/** Anti-gaming rule #2: feedback is only accepted after a minimum "dwell" time since the try started. */
public final class TryPolicy {

    private TryPolicy() {
    }

    public static long secondsRemaining(Instant startedAt, Instant now, int minSeconds) {
        long elapsed = Duration.between(startedAt, now).getSeconds();
        return Math.max(0L, minSeconds - elapsed);
    }

    public static boolean isEligible(Instant startedAt, Instant now, int minSeconds) {
        return secondsRemaining(startedAt, now, minSeconds) == 0L;
    }
}
