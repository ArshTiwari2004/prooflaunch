package com.prooflaunch.category;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CategoryController {

    public record CategoryView(Long id, String slug, String name) {
    }

    private final CategoryRepository categories;

    public CategoryController(CategoryRepository categories) {
        this.categories = categories;
    }

    @GetMapping("/api/categories")
    public List<CategoryView> list() {
        return categories.findAllByOrderBySortOrderAsc().stream()
                .map(c -> new CategoryView(c.getId(), c.getSlug(), c.getName()))
                .toList();
    }
}
