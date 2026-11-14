package com.prooflaunch.product;

import com.prooflaunch.category.Category;
import com.prooflaunch.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String slug;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, length = 140)
    private String tagline;

    @Column(length = 4000)
    private String description;

    @Column(name = "website_url", nullable = false, unique = true, length = 500)
    private String websiteUrl;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "maker_id", nullable = false)
    private User maker;

    @Column(name = "launch_date", nullable = false)
    private LocalDate launchDate;

    // ---- denormalised read model, always recomputed from votes/tries by ScoreService ----
    @Column(name = "upvote_count", nullable = false)
    private int upvoteCount;

    @Column(name = "try_started_count", nullable = false)
    private int tryStartedCount;

    @Column(name = "try_count", nullable = false)
    private int tryCount;

    @Column(name = "avg_rating", nullable = false)
    private double avgRating;

    @Column(name = "upvote_points", nullable = false)
    private double upvotePoints;

    @Column(name = "try_points", nullable = false)
    private double tryPoints;

    @Column(nullable = false)
    private double score;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
