package com.prooflaunch.product;

import com.prooflaunch.product.dto.SitemapEntry;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Leaderboard query. categoryId = 0 means "all categories"; q is a pre-built lower-case LIKE pattern
     * ("%" matches everything). Sentinels instead of NULLs avoid PostgreSQL's untyped-NULL-parameter pitfall.
     */
    @EntityGraph(attributePaths = {"category", "maker"})
    @Query("""
            select p from Product p
            where p.launchDate >= :since
              and (:categoryId = 0L or p.category.id = :categoryId)
              and (lower(p.name) like :q or lower(p.tagline) like :q)
            """)
    Page<Product> search(@Param("since") LocalDate since,
                         @Param("categoryId") long categoryId,
                         @Param("q") String q,
                         Pageable pageable);

    @EntityGraph(attributePaths = {"category", "maker"})
    Optional<Product> findBySlug(String slug);

    @EntityGraph(attributePaths = {"category", "maker"})
    Optional<Product> findWithAssociationsById(Long id);

    @EntityGraph(attributePaths = {"category", "maker"})
    List<Product> findByMakerIdOrderByCreatedAtDesc(Long makerId);

    Optional<Product> findByWebsiteUrl(String websiteUrl);

    boolean existsBySlug(String slug);

    long countByMakerIdAndCreatedAtAfter(Long makerId, Instant after);

    /** Row lock: serialises concurrent votes/tries on ONE product so recomputed counters can't be lost. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    @Query("select new com.prooflaunch.product.dto.SitemapEntry(p.slug, p.updatedAt) from Product p order by p.updatedAt desc")
    List<SitemapEntry> findSitemap(Pageable pageable);
}
