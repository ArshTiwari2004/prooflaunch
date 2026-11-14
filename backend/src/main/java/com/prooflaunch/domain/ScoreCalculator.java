package com.prooflaunch.domain;

/**
 * The public, explainable ranking formula ("Proof Score"):
 *
 *   score = upvotePoints + tryPoints
 *   upvotePoints = sum(trust weight of each upvote)
 *   tryPoints    = 4 x sum(trust weight of each verified try rated >= 3 stars)
 *
 * A verified try is worth four fully-trusted upvotes because it costs the voter real effort.
 */
public final class ScoreCalculator {

    public static final double TRY_MULTIPLIER = 4.0;
    public static final int MIN_POSITIVE_RATING = 3;

    /** Earned (not bought) dofollow backlink thresholds. */
    public static final int EARNED_LINK_MIN_TRIES = 3;
    public static final double EARNED_LINK_MIN_AVG_RATING = 3.5;

    private ScoreCalculator() {
    }

    public static double tryPoints(double positiveTryWeightSum) {
        return round2(positiveTryWeightSum * TRY_MULTIPLIER);
    }

    public static double total(double upvotePoints, double tryPoints) {
        return round2(upvotePoints + tryPoints);
    }

    public static boolean earnedDofollow(int completedTries, double avgRating) {
        return completedTries >= EARNED_LINK_MIN_TRIES && avgRating >= EARNED_LINK_MIN_AVG_RATING;
    }

    public static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
