package com.prooflaunch.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProductRequest(
        @NotBlank @Size(min = 3, max = 80) String name,
        @NotBlank @Size(min = 10, max = 140) String tagline,
        @Size(max = 4000) String description,
        @NotBlank @Size(max = 500) @Pattern(regexp = "^https://.+", message = "must start with https://") String websiteUrl,
        @Size(max = 500) @Pattern(regexp = "^(https://.+)?$", message = "must start with https://") String logoUrl,
        @NotNull Long categoryId) {
}
