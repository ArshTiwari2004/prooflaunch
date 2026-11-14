package com.prooflaunch.domain;

import java.time.Duration;

/**
 * Anti-gaming rule #1: a brand-new account is worth a fraction of an established one.
 * Weight ramps linearly from MIN (day 0) to MAX (day RAMP_DAYS and beyond).
 */
public final class TrustWeight {

    public static final double MIN = 0.25;
    public static final double MAX = 1.0;
    public static final int RAMP_DAYS = 14;

    private TrustWeight() {
    }

    public static double forAccountAge(Duration age) {
        if (age == null || age.isNegative()) {
            return MIN;
        }
        double days = age.toSeconds() / 86_400.0;
        double ramp = Math.min(days, RAMP_DAYS) / RAMP_DAYS;
        double weight = MIN + (MAX - MIN) * ramp;
        return Math.round(weight * 1000.0) / 1000.0;
    }
}
