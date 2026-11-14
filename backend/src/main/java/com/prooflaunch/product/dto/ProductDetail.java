package com.prooflaunch.product.dto;

import java.time.Instant;

public record ProductDetail(
        ProductSummary product,
        String description,
        String websiteUrl,
        Instant createdAt) {
}
