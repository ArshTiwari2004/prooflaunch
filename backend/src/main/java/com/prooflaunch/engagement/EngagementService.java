package com.prooflaunch.engagement;

import com.prooflaunch.common.ApiException;
import com.prooflaunch.config.AppProperties;
import com.prooflaunch.domain.TrustWeight;
import com.prooflaunch.domain.TryPolicy;
import com.prooflaunch.engagement.dto.EngagementDtos.EngagementResult;
import com.prooflaunch.engagement.dto.EngagementDtos.FeedbackView;
import com.prooflaunch.engagement.dto.EngagementDtos.TryCompleteRequest;
import com.prooflaunch.engagement.dto.EngagementDtos.TryStartResponse;
import com.prooflaunch.engagement.dto.EngagementDtos.ViewerState;
import com.prooflaunch.product.Product;
import com.prooflaunch.product.ProductRepository;
import com.prooflaunch.user.User;
import com.prooflaunch.user.UserRepository;
import io.micrometer.core.instrument.MeterRegistry;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The heart of the USP: upvotes (cheap, low weight) and Verified Tries (effortful, high weight).
 * Every mutating method first takes a row lock on the product, then recomputes its score.
 */
@Service
public class EngagementService {

    private final ProductRepository products;
    private final UserRepository users;
    private final VoteRepository votes;
    private final ProductTryRepository tries;
    private final ScoreService scores;
    private final Clock clock;
    private final AppProperties props;
    private final MeterRegistry meters;

    public EngagementService(ProductRepository products, UserRepository users, VoteRepository votes,
                             ProductTryRepository tries, ScoreService scores, Clock clock,
                             AppProperties props, MeterRegistry meters) {
        this.products = products;
        this.users = users;
        this.votes = votes;
        this.tries = tries;
        this.scores = scores;
        this.clock = clock;
        this.props = props;
        this.meters = meters;
    }

    // ------------------------------------------------------------------ upvotes

    @Transactional
    public EngagementResult upvote(long userId, long productId) {
        Product product = lockProduct(productId);
        assertNotOwner(product, userId);
        if (!votes.existsByUserIdAndProductId(userId, productId)) {
            User user = loadUser(userId);
            Vote vote = new Vote();
            vote.setUser(user);
            vote.setProduct(product);
            vote.setWeight(trustOf(user));
            votes.save(vote);
            meters.counter("prooflaunch.upvotes").increment();
        }
        scores.recompute(product);
        return result(product, true);
    }

    @Transactional
    public EngagementResult removeUpvote(long userId, long productId) {
        Product product = lockProduct(productId);
        votes.deleteByUserAndProduct(userId, productId);
        scores.recompute(product);
        return result(product, false);
    }

    // ------------------------------------------------------------------ verified tries

    @Transactional
    public TryStartResponse startTry(long userId, long productId) {
        Product product = lockProduct(productId);
        assertNotOwner(product, userId);
        Instant now = clock.instant();
        ProductTry attempt = tries.findByUserIdAndProductId(userId, productId).orElse(null);
        if (attempt == null) {
            attempt = new ProductTry();
            attempt.setUser(loadUser(userId));
            attempt.setProduct(product);
            attempt.setStatus(TryStatus.STARTED);
            attempt.setStartedAt(now);
            tries.save(attempt);
            scores.recompute(product);
            meters.counter("prooflaunch.tries.started").increment();
        }
        int min = props.engagement().minTrySeconds();
        long remaining = attempt.getStatus() == TryStatus.COMPLETED
                ? 0L : TryPolicy.secondsRemaining(attempt.getStartedAt(), now, min);
        return new TryStartResponse(product.getWebsiteUrl(), min, attempt.getStatus().name(), remaining);
    }

    @Transactional
    public EngagementResult completeTry(long userId, long productId, TryCompleteRequest req) {
        Product product = lockProduct(productId);
        assertNotOwner(product, userId);
        ProductTry attempt = tries.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> ApiException.conflict("TRY_NOT_STARTED", "Start a try first, then come back with your feedback."));
        if (attempt.getStatus() == TryStatus.COMPLETED) {
            throw ApiException.conflict("TRY_ALREADY_COMPLETED", "You have already submitted feedback for this product.");
        }
        Instant now = clock.instant();
        long remaining = TryPolicy.secondsRemaining(attempt.getStartedAt(), now, props.engagement().minTrySeconds());
        if (remaining > 0) {
            throw ApiException.unprocessable("TRY_TOO_EARLY",
                    "Spend a little more time with the product first. " + remaining + "s left.");
        }
        User user = loadUser(userId);
        attempt.setRating(req.rating());
        attempt.setFeedback(req.feedback().trim());
        attempt.setCompletedAt(now);
        attempt.setWeight(trustOf(user));
        attempt.setStatus(TryStatus.COMPLETED);
        tries.save(attempt);
        scores.recompute(product);
        meters.counter("prooflaunch.tries.completed").increment();
        return result(product, votes.existsByUserIdAndProductId(userId, productId));
    }

    // ------------------------------------------------------------------ reads

    @Transactional(readOnly = true)
    public ViewerState viewerState(Long userId, long productId) {
        if (userId == null) {
            return ViewerState.anonymous();
        }
        Product product = products.findById(productId)
                .orElseThrow(() -> ApiException.notFound("PRODUCT_NOT_FOUND", "Product not found."));
        boolean owner = product.getMaker().getId().equals(userId);
        boolean upvoted = votes.existsByUserIdAndProductId(userId, productId);
        ProductTry attempt = tries.findByUserIdAndProductId(userId, productId).orElse(null);
        if (attempt == null) {
            return new ViewerState(true, owner, upvoted, "NONE", 0L, null);
        }
        long remaining = attempt.getStatus() == TryStatus.COMPLETED ? 0L
                : TryPolicy.secondsRemaining(attempt.getStartedAt(), clock.instant(), props.engagement().minTrySeconds());
        return new ViewerState(true, owner, upvoted, attempt.getStatus().name(), remaining, attempt.getRating());
    }

    @Transactional(readOnly = true)
    public com.prooflaunch.common.PageResponse<FeedbackView> feedback(long productId, int page, int size) {
        Page<ProductTry> result = tries.findByProductIdAndStatusOrderByCompletedAtDesc(
                productId, TryStatus.COMPLETED, PageRequest.of(page, size));
        var content = result.getContent().stream()
                .map(t -> new FeedbackView(t.getId(), t.getUser().getDisplayName(), t.getRating(), t.getFeedback(), t.getCompletedAt()))
                .toList();
        return com.prooflaunch.common.PageResponse.of(result, content);
    }

    // ------------------------------------------------------------------ helpers

    private Product lockProduct(long productId) {
        return products.findByIdForUpdate(productId)
                .orElseThrow(() -> ApiException.notFound("PRODUCT_NOT_FOUND", "Product not found."));
    }

    private User loadUser(long userId) {
        return users.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("UNKNOWN_USER", "Your session is no longer valid."));
    }

    private void assertNotOwner(Product product, long userId) {
        if (product.getMaker().getId().equals(userId)) {
            throw ApiException.forbidden("OWN_PRODUCT", "You can't vote on or try your own product.");
        }
    }

    private double trustOf(User user) {
        return TrustWeight.forAccountAge(Duration.between(user.getCreatedAt(), clock.instant()));
    }

    private EngagementResult result(Product p, boolean upvoted) {
        return new EngagementResult(upvoted, p.getUpvoteCount(), p.getTryStartedCount(), p.getTryCount(),
                p.getAvgRating(), p.getScore());
    }
}
