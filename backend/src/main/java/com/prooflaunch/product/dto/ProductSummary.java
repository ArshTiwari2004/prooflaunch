package com.prooflaunch.product.dto;

import java.time.LocalDate;

public record ProductSummary(
        Long id,
        String slug,
        String name,
        String tagline,
        String logoUrl,
        String categorySlug,
        String categoryName,
        String makerName,
        boolean verifiedMaker,
        int upvoteCount,
        int tryStartedCount,
        int tryCount,
        double avgRating,
        double upvotePoints,
        double tryPoints,
        double score,
        boolean earnedDofollow,
        LocalDate launchDate,
        boolean viewerUpvoted,
        boolean viewerTried) {
}
