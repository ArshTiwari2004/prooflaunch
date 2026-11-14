package com.prooflaunch.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class DomainRulesTest {

    // ---- TrustWeight ----
    @Test
    void newAccountsGetMinimumWeight() {
        assertThat(TrustWeight.forAccountAge(Duration.ZERO)).isEqualTo(0.25);
        assertThat(TrustWeight.forAccountAge(Duration.ofDays(-3))).isEqualTo(0.25);
    }

    @Test
    void weightRampsLinearlyAndCapsAtOne() {
        assertThat(TrustWeight.forAccountAge(Duration.ofDays(7))).isEqualTo(0.625);
        assertThat(TrustWeight.forAccountAge(Duration.ofDays(14))).isEqualTo(1.0);
        assertThat(TrustWeight.forAccountAge(Duration.ofDays(400))).isEqualTo(1.0);
    }

    // ---- ScoreCalculator ----
    @Test
    void verifiedTryIsWorthFourFullUpvotes() {
        assertThat(ScoreCalculator.tryPoints(1.0)).isEqualTo(4.0);
        assertThat(ScoreCalculator.total(2.5, ScoreCalculator.tryPoints(0.5))).isEqualTo(4.5);
    }

    @Test
    void dofollowIsEarnedNotBought() {
        assertThat(ScoreCalculator.earnedDofollow(2, 5.0)).isFalse();
        assertThat(ScoreCalculator.earnedDofollow(3, 3.4)).isFalse();
        assertThat(ScoreCalculator.earnedDofollow(3, 3.5)).isTrue();
    }

    // ---- TryPolicy ----
    @Test
    void feedbackIsLockedUntilDwellTimeElapses() {
        Instant start = Instant.parse("2026-11-09T10:00:00Z");
        assertThat(TryPolicy.secondsRemaining(start, start.plusSeconds(10), 45)).isEqualTo(35);
        assertThat(TryPolicy.isEligible(start, start.plusSeconds(44), 45)).isFalse();
        assertThat(TryPolicy.isEligible(start, start.plusSeconds(45), 45)).isTrue();
        assertThat(TryPolicy.secondsRemaining(start, start.plusSeconds(500), 45)).isZero();
    }

    // ---- Slugs ----
    @Test
    void slugifyHandlesAccentsSymbolsAndEmptyInput() {
        assertThat(Slugs.slugify("Café Déjà-Vu!!")).isEqualTo("cafe-deja-vu");
        assertThat(Slugs.slugify("  --Hello   World--  ")).isEqualTo("hello-world");
        assertThat(Slugs.slugify("🚀🚀")).isEqualTo("product");
        assertThat(Slugs.slugify(null)).isEqualTo("product");
        assertThat(Slugs.slugify("a".repeat(200)).length()).isLessThanOrEqualTo(60);
    }

    @Test
    void randomSuffixHasRequestedLength() {
        assertThat(Slugs.randomSuffix(5)).hasSize(5).matches("[a-z2-9]+");
    }

    // ---- UrlRules ----
    @Test
    void onlyPublicHttpsUrlsAreAccepted() {
        assertThat(UrlRules.isAcceptable("https://prooflaunch.dev")).isTrue();
        assertThat(UrlRules.isAcceptable("http://prooflaunch.dev")).isFalse();
        assertThat(UrlRules.isAcceptable("javascript:alert(1)")).isFalse();
        assertThat(UrlRules.isAcceptable("https://localhost:3000")).isFalse();
        assertThat(UrlRules.isAcceptable("https://192.168.1.10")).isFalse();
        assertThat(UrlRules.isAcceptable("https://user:pw@evil.com")).isFalse();
        assertThat(UrlRules.isAcceptable("not a url")).isFalse();
        assertThat(UrlRules.isAcceptable(null)).isFalse();
    }

    @Test
    void normalizeMakesDuplicateDetectionReliable() {
        assertThat(UrlRules.normalize("https://Example.COM/")).isEqualTo("https://example.com");
        assertThat(UrlRules.normalize("https://example.com/app/#top")).isEqualTo("https://example.com/app");
        assertThat(UrlRules.normalize("https://example.com:443/x?a=1")).isEqualTo("https://example.com/x?a=1");
    }

    // ---- MakerVerification ----
    @Test
    void makerIsVerifiedWhenEmailDomainMatchesWebsite() {
        assertThat(MakerVerification.isVerified("me@acme.io", "https://www.acme.io/app")).isTrue();
        assertThat(MakerVerification.isVerified("me@acme.io", "https://app.acme.io")).isTrue();
        assertThat(MakerVerification.isVerified("me@acme.io", "https://notacme.io")).isFalse();
        assertThat(MakerVerification.isVerified("me@gmail.com", "https://gmail.com")).isFalse();
    }

    // ---- LaunchPeriod ----
    @Test
    void periodWindowsAreUtcCalendarBased() {
        LocalDate wednesday = LocalDate.of(2026, 11, 11);
        assertThat(LaunchPeriod.TODAY.since(wednesday)).isEqualTo(wednesday);
        assertThat(LaunchPeriod.WEEK.since(wednesday)).isEqualTo(LocalDate.of(2026, 11, 9));
        assertThat(LaunchPeriod.MONTH.since(wednesday)).isEqualTo(LocalDate.of(2026, 11, 1));
        assertThat(LaunchPeriod.parse("garbage")).isEqualTo(LaunchPeriod.WEEK);
        assertThat(LaunchPeriod.parse("all")).isEqualTo(LaunchPeriod.ALL);
    }
}
