package com.prooflaunch.engagement;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductTryRepository extends JpaRepository<ProductTry, Long> {

    interface TryAggregate {
        Long getCnt();

        Double getAvgRating();

        Double getPts();
    }

    Optional<ProductTry> findByUserIdAndProductId(Long userId, Long productId);

    long countByProductId(Long productId);

    /** cnt = completed tries, avgRating = their mean rating, pts = trust-weight sum of tries rated >= 3 stars. */
    @Query("""
            select count(t) as cnt,
                   coalesce(avg(t.rating), 0.0) as avgRating,
                   coalesce(sum(case when t.rating >= 3 then t.weight else 0.0 end), 0.0) as pts
            from ProductTry t
            where t.product.id = :productId and t.status = :status
            """)
    TryAggregate aggregateCompleted(@Param("productId") Long productId, @Param("status") TryStatus status);

    @Query("select t.product.id from ProductTry t where t.user.id = :userId and t.status = :status and t.product.id in :productIds")
    List<Long> findProductIdsByUserAndStatus(@Param("userId") Long userId,
                                             @Param("status") TryStatus status,
                                             @Param("productIds") Collection<Long> productIds);

    @EntityGraph(attributePaths = "user")
    Page<ProductTry> findByProductIdAndStatusOrderByCompletedAtDesc(Long productId, TryStatus status, Pageable pageable);
}
