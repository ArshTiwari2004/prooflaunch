package com.prooflaunch.product;

import com.prooflaunch.category.Category;
import com.prooflaunch.category.CategoryRepository;
import com.prooflaunch.common.ApiException;
import com.prooflaunch.common.PageResponse;
import com.prooflaunch.config.AppProperties;
import com.prooflaunch.domain.LaunchPeriod;
import com.prooflaunch.domain.Slugs;
import com.prooflaunch.domain.UrlRules;
import com.prooflaunch.engagement.ProductTryRepository;
import com.prooflaunch.engagement.TryStatus;
import com.prooflaunch.engagement.VoteRepository;
import com.prooflaunch.product.dto.ProductDetail;
import com.prooflaunch.product.dto.ProductRequest;
import com.prooflaunch.product.dto.ProductSummary;
import com.prooflaunch.product.dto.SitemapEntry;
import com.prooflaunch.user.User;
import com.prooflaunch.user.UserRepository;
import io.micrometer.core.instrument.MeterRegistry;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private static final Pattern LIKE_META = Pattern.compile("[%_\\\\]");

    private final ProductRepository products;
    private final CategoryRepository categories;
    private final UserRepository users;
    private final VoteRepository votes;
    private final ProductTryRepository tries;
    private final ProductMapper mapper;
    private final AppProperties props;
    private final Clock clock;
    private final MeterRegistry meters;

    public ProductService(ProductRepository products, CategoryRepository categories, UserRepository users,
                          VoteRepository votes, ProductTryRepository tries, ProductMapper mapper,
                          AppProperties props, Clock clock, MeterRegistry meters) {
        this.products = products;
        this.categories = categories;
        this.users = users;
        this.votes = votes;
        this.tries = tries;
        this.mapper = mapper;
        this.props = props;
        this.clock = clock;
        this.meters = meters;
    }

    // ------------------------------------------------------------------ reads

    @Transactional(readOnly = true)
    public PageResponse<ProductSummary> list(String period, String categorySlug, String q, int page, int size, Long viewerId) {
        LocalDate since = LaunchPeriod.parse(period).since(LocalDate.now(clock));

        long categoryId = 0L;
        if (categorySlug != null && !categorySlug.isBlank()) {
            categoryId = categories.findBySlug(categorySlug.trim()).map(Category::getId).orElse(-1L);
        }
        String like = "%" + sanitizeQuery(q) + "%";

        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Order.desc("score"), Sort.Order.desc("createdAt")));
        Page<Product> result = products.search(since, categoryId, like, pageable);
        return PageResponse.of(result, toSummaries(result.getContent(), viewerId));
    }

    @Transactional(readOnly = true)
    public ProductDetail getBySlug(String slug, Long viewerId) {
        Product p = products.findBySlug(slug)
                .orElseThrow(() -> ApiException.notFound("PRODUCT_NOT_FOUND", "Product not found."));
        return mapper.detail(p, viewerHasUpvoted(viewerId, p.getId()), viewerHasTried(viewerId, p.getId()));
    }

    @Transactional(readOnly = true)
    public List<ProductSummary> mine(long userId) {
        return toSummaries(products.findByMakerIdOrderByCreatedAtDesc(userId), userId);
    }

    @Transactional(readOnly = true)
    public List<SitemapEntry> sitemap() {
        return products.findSitemap(PageRequest.of(0, 5000));
    }

    // ------------------------------------------------------------------ writes

    @Transactional
    public ProductDetail create(long userId, ProductRequest req) {
        User maker = users.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("UNKNOWN_USER", "Your session is no longer valid."));

        long recent = products.countByMakerIdAndCreatedAtAfter(userId, clock.instant().minus(Duration.ofHours(24)));
        if (recent >= props.engagement().maxLaunchesPerDay()) {
            throw ApiException.tooMany("LAUNCH_LIMIT",
                    "You can launch at most " + props.engagement().maxLaunchesPerDay() + " products per 24 hours.");
        }

        String url = requireValidUrl(req.websiteUrl());
        if (products.findByWebsiteUrl(url).isPresent()) {
            throw ApiException.conflict("DUPLICATE_PRODUCT", "A product with this website is already listed.");
        }
        Category category = categories.findById(req.categoryId())
                .orElseThrow(() -> ApiException.badRequest("INVALID_CATEGORY", "Unknown category."));

        Product p = new Product();
        applyEditableFields(p, req, url, category);
        p.setMaker(maker);
        p.setSlug(uniqueSlug(req.name()));
        p.setLaunchDate(LocalDate.now(clock));
        products.save(p);
        meters.counter("prooflaunch.products.created").increment();
        return mapper.detail(p, false, false);
    }

    @Transactional
    public ProductDetail update(long userId, long productId, ProductRequest req) {
        Product p = products.findWithAssociationsById(productId)
                .orElseThrow(() -> ApiException.notFound("PRODUCT_NOT_FOUND", "Product not found."));
        requireOwner(p, userId);

        String url = requireValidUrl(req.websiteUrl());
        products.findByWebsiteUrl(url).ifPresent(other -> {
            if (!other.getId().equals(p.getId())) {
                throw ApiException.conflict("DUPLICATE_PRODUCT", "A product with this website is already listed.");
            }
        });
        Category category = categories.findById(req.categoryId())
                .orElseThrow(() -> ApiException.badRequest("INVALID_CATEGORY", "Unknown category."));

        applyEditableFields(p, req, url, category);
        return mapper.detail(p, viewerHasUpvoted(userId, p.getId()), viewerHasTried(userId, p.getId()));
    }

    @Transactional
    public void delete(long userId, long productId) {
        Product p = products.findWithAssociationsById(productId)
                .orElseThrow(() -> ApiException.notFound("PRODUCT_NOT_FOUND", "Product not found."));
        requireOwner(p, userId);
        products.delete(p); // votes + tries are removed by ON DELETE CASCADE
    }

    // ------------------------------------------------------------------ helpers

    private void applyEditableFields(Product p, ProductRequest req, String normalizedUrl, Category category) {
        p.setName(req.name().trim());
        p.setTagline(req.tagline().trim());
        p.setDescription(req.description() == null || req.description().isBlank() ? null : req.description().trim());
        p.setWebsiteUrl(normalizedUrl);
        p.setLogoUrl(req.logoUrl() == null || req.logoUrl().isBlank() ? null : req.logoUrl().trim());
        p.setCategory(category);
    }

    private String requireValidUrl(String raw) {
        if (!UrlRules.isAcceptable(raw)) {
            throw ApiException.badRequest("INVALID_URL", "Website must be a public https:// URL.");
        }
        return UrlRules.normalize(raw);
    }

    private void requireOwner(Product p, long userId) {
        if (!p.getMaker().getId().equals(userId)) {
            throw ApiException.forbidden("NOT_OWNER", "Only the maker can change this product.");
        }
    }

    private String uniqueSlug(String name) {
        String base = Slugs.slugify(name);
        String candidate = base;
        for (int i = 0; i < 10 && products.existsBySlug(candidate); i++) {
            candidate = base + "-" + Slugs.randomSuffix(4);
        }
        return candidate;
    }

    private static String sanitizeQuery(String q) {
        if (q == null) {
            return "";
        }
        String cleaned = LIKE_META.matcher(q).replaceAll(" ").trim().toLowerCase(Locale.ROOT);
        return cleaned.length() > 80 ? cleaned.substring(0, 80) : cleaned;
    }

    private List<ProductSummary> toSummaries(List<Product> list, Long viewerId) {
        if (list.isEmpty()) {
            return List.of();
        }
        List<Long> ids = list.stream().map(Product::getId).toList();
        Set<Long> upvoted = viewerId == null ? Set.of() : Set.copyOf(votes.findVotedProductIds(viewerId, ids));
        Set<Long> tried = viewerId == null ? Set.of()
                : Set.copyOf(tries.findProductIdsByUserAndStatus(viewerId, TryStatus.COMPLETED, ids));
        return list.stream()
                .map(p -> mapper.summary(p, upvoted.contains(p.getId()), tried.contains(p.getId())))
                .toList();
    }

    private boolean viewerHasUpvoted(Long viewerId, Long productId) {
        return viewerId != null && votes.existsByUserIdAndProductId(viewerId, productId);
    }

    private boolean viewerHasTried(Long viewerId, Long productId) {
        if (viewerId == null) {
            return false;
        }
        Collection<Long> ids = List.of(productId);
        return !tries.findProductIdsByUserAndStatus(viewerId, TryStatus.COMPLETED, ids).isEmpty();
    }
}
