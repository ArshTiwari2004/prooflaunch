package com.prooflaunch.domain;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.Locale;

/** Leaderboard windows. All dates are UTC so a "day" is the same for everyone. */
public enum LaunchPeriod {
    TODAY, WEEK, MONTH, ALL;

    public static LaunchPeriod parse(String raw) {
        if (raw == null) {
            return WEEK;
        }
        try {
            return valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return WEEK;
        }
    }

    public LocalDate since(LocalDate today) {
        return switch (this) {
            case TODAY -> today;
            case WEEK -> today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case MONTH -> today.withDayOfMonth(1);
            case ALL -> LocalDate.of(1970, 1, 1);
        };
    }
}
