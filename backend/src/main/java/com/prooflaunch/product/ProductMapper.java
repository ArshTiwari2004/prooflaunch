package com.prooflaunch.product;

import com.prooflaunch.domain.MakerVerification;
import com.prooflaunch.domain.ScoreCalculator;
import com.prooflaunch.product.dto.ProductDetail;
import com.prooflaunch.product.dto.ProductSummary;
import org.springframework.stereotype.Component;

/** Entity -> DTO. Must be called inside a transaction (lazy category/maker are touched). */
@Component
public class ProductMapper {

    public ProductSummary summary(Product p, boolean viewerUpvoted, boolean viewerTried) {
        return new ProductSummary(
                p.getId(), p.getSlug(), p.getName(), p.getTagline(), p.getLogoUrl(),
                p.getCategory().getSlug(), p.getCategory().getName(),
                p.getMaker().getDisplayName(),
                MakerVerification.isVerified(p.getMaker().getEmail(), p.getWebsiteUrl()),
                p.getUpvoteCount(), p.getTryStartedCount(), p.getTryCount(),
                p.getAvgRating(), p.getUpvotePoints(), p.getTryPoints(), p.getScore(),
                ScoreCalculator.earnedDofollow(p.getTryCount(), p.getAvgRating()),
                p.getLaunchDate(), viewerUpvoted, viewerTried);
    }

    public ProductDetail detail(Product p, boolean viewerUpvoted, boolean viewerTried) {
        return new ProductDetail(summary(p, viewerUpvoted, viewerTried), p.getDescription(), p.getWebsiteUrl(), p.getCreatedAt());
    }
}
