package com.prooflaunch.product;

import com.prooflaunch.product.dto.ProductSummary;
import java.time.Duration;
import java.util.Locale;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** Embeddable "proof score" badge makers can put on their own site. Only numbers are rendered, so no escaping risk. */
@RestController
public class BadgeController {

    private final ProductService service;

    public BadgeController(ProductService service) {
        this.service = service;
    }

    @GetMapping(value = "/api/products/{slug}/badge.svg", produces = "image/svg+xml")
    public ResponseEntity<String> badge(@PathVariable String slug) {
        ProductSummary p = service.getBySlug(slug, null).product();
        String right = String.format(Locale.ROOT, "proof %.1f  |  %d verified %s",
                p.score(), p.tryCount(), p.tryCount() == 1 ? "try" : "tries");
        int leftWidth = 98;
        int rightWidth = 24 + right.length() * 6;
        int total = leftWidth + rightWidth;
        String svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" + total + "\" height=\"28\" role=\"img\" aria-label=\"prooflaunch " + right + "\">"
                + "<rect width=\"" + total + "\" height=\"28\" rx=\"7\" fill=\"#ffffff\" stroke=\"#e7e5e4\"/>"
                + "<rect x=\"1\" y=\"1\" width=\"" + (leftWidth - 1) + "\" height=\"26\" rx=\"6\" fill=\"#0f5f55\"/>"
                + "<path d=\"M12 14.5l3 3 6-7\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"
                + "<text x=\"28\" y=\"18\" fill=\"#fff\" font-family=\"Verdana,Arial,sans-serif\" font-size=\"11\" font-weight=\"700\">prooflaunch</text>"
                + "<text x=\"" + (leftWidth + 12) + "\" y=\"18\" fill=\"#1c1917\" font-family=\"Verdana,Arial,sans-serif\" font-size=\"11\">" + right + "</text>"
                + "</svg>";
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic())
                .body(svg);
    }
}
