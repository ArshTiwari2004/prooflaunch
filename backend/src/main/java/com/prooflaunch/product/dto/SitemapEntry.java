package com.prooflaunch.product.dto;

import java.time.Instant;

public record SitemapEntry(String slug, Instant updatedAt) {
}
