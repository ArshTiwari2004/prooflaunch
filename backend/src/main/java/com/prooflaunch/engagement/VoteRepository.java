package com.prooflaunch.engagement;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    interface VoteAggregate {
        Long getCnt();

        Double getPts();
    }

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    @Modifying
    @Query("delete from Vote v where v.user.id = :userId and v.product.id = :productId")
    int deleteByUserAndProduct(@Param("userId") Long userId, @Param("productId") Long productId);

    @Query("select count(v) as cnt, coalesce(sum(v.weight), 0.0) as pts from Vote v where v.product.id = :productId")
    VoteAggregate aggregate(@Param("productId") Long productId);

    @Query("select v.product.id from Vote v where v.user.id = :userId and v.product.id in :productIds")
    List<Long> findVotedProductIds(@Param("userId") Long userId, @Param("productIds") Collection<Long> productIds);
}
