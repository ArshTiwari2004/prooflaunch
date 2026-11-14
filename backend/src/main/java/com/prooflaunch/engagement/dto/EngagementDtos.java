package com.prooflaunch.engagement.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class EngagementDtos {

    private EngagementDtos() {
    }

    /** Returned after every upvote/try action so the UI can update without refetching. */
    public record EngagementResult(boolean upvoted, int upvoteCount, int tryStartedCount, int tryCount,
                                   double avgRating, double score) {
    }

    public record TryStartResponse(String websiteUrl, int minSeconds, String status, long secondsRemaining) {
    }

    public record TryCompleteRequest(
            @Min(1) @Max(5) int rating,
            @NotBlank @Size(min = 10, max = 1000, message = "must be between 10 and 1000 characters") String feedback) {
    }

    public record FeedbackView(Long id, String author, int rating, String feedback, Instant completedAt) {
    }

    /** What the signed-in (or anonymous) viewer can currently do on one product. */
    public record ViewerState(boolean authenticated, boolean owner, boolean upvoted, String tryStatus,
                              long secondsRemaining, Integer rating) {
        public static ViewerState anonymous() {
            return new ViewerState(false, false, false, "NONE", 0L, null);
        }
    }
}
