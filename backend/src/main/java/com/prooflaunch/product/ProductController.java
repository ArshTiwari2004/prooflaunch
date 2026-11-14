package com.prooflaunch.product;

import com.prooflaunch.common.PageResponse;
import com.prooflaunch.product.dto.ProductDetail;
import com.prooflaunch.product.dto.ProductRequest;
import com.prooflaunch.product.dto.ProductSummary;
import com.prooflaunch.product.dto.SitemapEntry;
import com.prooflaunch.security.AuthUser;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/api/products")
    public PageResponse<ProductSummary> list(@RequestParam(defaultValue = "week") String period,
                                             @RequestParam(required = false) String category,
                                             @RequestParam(required = false) String q,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size,
                                             @AuthenticationPrincipal AuthUser viewer) {
        return service.list(period, category, q, Math.max(0, page), Math.min(Math.max(1, size), 50),
                viewer == null ? null : viewer.id());
    }

    @GetMapping("/api/products/{slug}")
    public ProductDetail get(@PathVariable String slug, @AuthenticationPrincipal AuthUser viewer) {
        return service.getBySlug(slug, viewer == null ? null : viewer.id());
    }

    @PostMapping("/api/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDetail create(@Valid @RequestBody ProductRequest req, @AuthenticationPrincipal AuthUser user) {
        return service.create(user.id(), req);
    }

    @PutMapping("/api/products/{id}")
    public ProductDetail update(@PathVariable long id, @Valid @RequestBody ProductRequest req,
                                @AuthenticationPrincipal AuthUser user) {
        return service.update(user.id(), id, req);
    }

    @DeleteMapping("/api/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id, @AuthenticationPrincipal AuthUser user) {
        service.delete(user.id(), id);
    }

    @GetMapping("/api/me/products")
    public List<ProductSummary> mine(@AuthenticationPrincipal AuthUser user) {
        return service.mine(user.id());
    }

    @GetMapping("/api/sitemap")
    public List<SitemapEntry> sitemap() {
        return service.sitemap();
    }
}
