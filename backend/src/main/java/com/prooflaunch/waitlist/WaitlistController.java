package com.prooflaunch.waitlist;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Early-access list for paid plans. Idempotent: joining twice is not an error. */
@RestController
@RequestMapping("/api/waitlist")
public class WaitlistController {

    public record JoinRequest(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Pattern(regexp = "^pro$", message = "unknown plan") String plan) {
    }

    private final WaitlistRepository repository;

    public WaitlistController(WaitlistRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Transactional
    public void join(@Valid @RequestBody JoinRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (!repository.existsByEmailAndPlan(email, request.plan())) {
            WaitlistEntry entry = new WaitlistEntry();
            entry.setEmail(email);
            entry.setPlan(request.plan());
            repository.save(entry);
        }
    }
}
