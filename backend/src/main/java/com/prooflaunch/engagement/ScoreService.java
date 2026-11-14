package com.prooflaunch.engagement;

import com.prooflaunch.domain.ScoreCalculator;
import com.prooflaunch.engagement.ProductTryRepository.TryAggregate;
import com.prooflaunch.engagement.VoteRepository.VoteAggregate;
import com.prooflaunch.product.Product;
import org.springframework.stereotype.Service;

/**
 * Recomputes a product's denormalised counters from the source-of-truth tables.
 * Recompute-from-scratch (instead of +1/-1) makes the numbers self-healing and impossible to drift.
 * Callers hold a row lock on the product, so concurrent actions are serialised.
 */
@Service
public class ScoreService {

    private final VoteRepository votes;
    private final ProductTryRepository tries;

    public ScoreService(VoteRepository votes, ProductTryRepository tries) {
        this.votes = votes;
        this.tries = tries;
    }

    public void recompute(Product p) {
        VoteAggregate v = votes.aggregate(p.getId());
        TryAggregate t = tries.aggregateCompleted(p.getId(), TryStatus.COMPLETED);

        double upvotePoints = ScoreCalculator.round2(v.getPts() == null ? 0.0 : v.getPts());
        double tryPoints = ScoreCalculator.tryPoints(t.getPts() == null ? 0.0 : t.getPts());

        p.setUpvoteCount(v.getCnt() == null ? 0 : v.getCnt().intValue());
        p.setTryStartedCount((int) tries.countByProductId(p.getId()));
        p.setTryCount(t.getCnt() == null ? 0 : t.getCnt().intValue());
        p.setAvgRating(ScoreCalculator.round2(t.getAvgRating() == null ? 0.0 : t.getAvgRating()));
        p.setUpvotePoints(upvotePoints);
        p.setTryPoints(tryPoints);
        p.setScore(ScoreCalculator.total(upvotePoints, tryPoints));
    }
}
