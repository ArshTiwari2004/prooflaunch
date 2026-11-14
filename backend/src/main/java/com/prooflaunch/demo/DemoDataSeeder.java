package com.prooflaunch.demo;

import com.prooflaunch.category.Category;
import com.prooflaunch.category.CategoryRepository;
import com.prooflaunch.domain.Slugs;
import com.prooflaunch.engagement.ProductTry;
import com.prooflaunch.engagement.ProductTryRepository;
import com.prooflaunch.engagement.ScoreService;
import com.prooflaunch.engagement.TryStatus;
import com.prooflaunch.engagement.Vote;
import com.prooflaunch.engagement.VoteRepository;
import com.prooflaunch.product.Product;
import com.prooflaunch.product.ProductRepository;
import com.prooflaunch.user.User;
import com.prooflaunch.user.UserRepository;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Loads fictional demo data ONLY when the "demo" profile is active (SPRING_PROFILES_ACTIVE=demo).
 * All demo accounts use the password "DemoPass#2026". Never enable this in production.
 */
@Component
@Profile("demo")
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final String PASSWORD = "DemoPass#2026";

    private record Seed(String name, String tagline, String description, String site, String category, int daysAgo, int upvoters, int triers) {
    }

    private final UserRepository users;
    private final ProductRepository products;
    private final CategoryRepository categories;
    private final VoteRepository votes;
    private final ProductTryRepository tries;
    private final ScoreService scores;
    private final PasswordEncoder encoder;
    private final TransactionTemplate tx;
    private final Clock clock;

    public DemoDataSeeder(UserRepository users, ProductRepository products, CategoryRepository categories,
                          VoteRepository votes, ProductTryRepository tries, ScoreService scores,
                          PasswordEncoder encoder, TransactionTemplate tx, Clock clock) {
        this.users = users;
        this.products = products;
        this.categories = categories;
        this.votes = votes;
        this.tries = tries;
        this.scores = scores;
        this.encoder = encoder;
        this.tx = tx;
        this.clock = clock;
    }

    @Override
    public void run(String... args) {
        if (products.count() > 0) {
            return;
        }
        tx.executeWithoutResult(status -> seed());
        log.info("Demo data loaded. Log in as maker@demo.prooflaunch.dev / {}", PASSWORD);
    }

    private void seed() {
        Instant now = clock.instant();
        String hash = encoder.encode(PASSWORD);

        User maker = newUser("maker@demo.prooflaunch.dev", "Demo Maker", hash, now.minus(Duration.ofDays(60)));
        List<User> crowd = new ArrayList<>();
        String[] names = {"Aarav", "Maya", "Liam", "Sofia", "Kenji", "Zara", "Noah", "Ines", "Omar", "Priya", "Luca", "Mei"};
        for (int i = 0; i < names.length; i++) {
            crowd.add(newUser("user" + (i + 1) + "@demo.prooflaunch.dev", names[i], hash, now.minus(Duration.ofDays(30 + i))));
        }

        Map<String, String> comments = Map.of(
                "good", "Set it up in two minutes and it did exactly what the tagline promises. Clean UI.",
                "ok", "Solid idea. Onboarding could explain the first step a bit better, but it works.");

        List<Seed> seeds = List.of(
                new Seed("QuillBoard", "A markdown whiteboard that keeps your notes linked", "Sketch ideas as cards, link them, and export everything as plain markdown. Built for people who think in diagrams but publish in text.", "https://quillboard.example", "productivity", 0, 11, 6),
                new Seed("PingPatrol", "Uptime monitoring that tells you why, not just when", "Checks your endpoints every 30 seconds, groups incidents, and writes the first draft of your status update.", "https://pingpatrol.example", "developer-tools", 0, 9, 5),
                new Seed("Tidyroom", "Declutter your home with a 10-minute daily plan", "Tell it your rooms and time budget; get one small, specific task per day with before/after tracking.", "https://tidyroom.example", "health-fitness", 1, 8, 3),
                new Seed("LedgerLeaf", "Freelancer invoicing with automatic payment reminders", "Create an invoice in 30 seconds, send a link, and let polite reminders chase the payment for you.", "https://ledgerleaf.example", "finance", 2, 10, 2),
                new Seed("Palettify", "Generate accessible colour systems from one brand colour", "Outputs WCAG-checked light and dark palettes plus ready-to-paste CSS variables and Figma tokens.", "https://palettify.example", "design", 2, 7, 4),
                new Seed("StudyLoop", "Turn lecture notes into spaced-repetition flashcards", "Paste notes or upload a PDF; get a deck scheduled for the best review times.", "https://studyloop.example", "education", 3, 6, 1),
                new Seed("CronBuddy", "Human-friendly scheduler for background jobs", "Write 'every weekday at 9' instead of cron syntax. Open source, self-hostable, with run history.", "https://cronbuddy.example", "open-source", 4, 5, 2),
                new Seed("Echolytics", "Privacy-first web analytics in one tiny script", "No cookies, no personal data, 1 KB script. Clear dashboards for founders who just want the numbers.", "https://echolytics.example", "analytics", 5, 9, 3));

        for (Seed s : seeds) {
            Category category = categories.findBySlug(s.category()).orElseThrow();
            Product p = new Product();
            p.setName(s.name());
            p.setSlug(Slugs.slugify(s.name()));
            p.setTagline(s.tagline());
            p.setDescription(s.description());
            p.setWebsiteUrl(s.site());
            p.setCategory(category);
            p.setMaker(maker);
            p.setLaunchDate(LocalDate.now(clock).minusDays(s.daysAgo()));
            products.save(p);

            for (int i = 0; i < s.upvoters(); i++) {
                Vote v = new Vote();
                v.setUser(crowd.get(i % crowd.size()));
                v.setProduct(p);
                v.setWeight(1.0);
                votes.save(v);
            }
            for (int i = 0; i < s.triers(); i++) {
                ProductTry t = new ProductTry();
                t.setUser(crowd.get((crowd.size() - 1 - i) % crowd.size()));
                t.setProduct(p);
                t.setStatus(TryStatus.COMPLETED);
                t.setStartedAt(now.minus(Duration.ofHours(5)));
                t.setCompletedAt(now.minus(Duration.ofHours(4)));
                t.setRating(i % 4 == 3 ? 3 : (i % 2 == 0 ? 5 : 4));
                t.setFeedback(i % 3 == 0 ? comments.get("ok") : comments.get("good"));
                t.setWeight(1.0);
                tries.save(t);
            }
            scores.recompute(p);
        }
    }

    private User newUser(String email, String name, String hash, Instant createdAt) {
        User u = new User();
        u.setEmail(email);
        u.setDisplayName(name);
        u.setPasswordHash(hash);
        u.setCreatedAt(createdAt);
        return users.save(u);
    }
}
