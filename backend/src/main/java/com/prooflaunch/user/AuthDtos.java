package com.prooflaunch.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 2, max = 60) String displayName,
            @NotBlank @Size(min = 10, max = 72, message = "must be between 10 and 72 characters") String password) {
    }

    public record LoginRequest(
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(max = 72) String password) {
    }

    public record UserView(Long id, String displayName, String email) {
        public static UserView of(User u) {
            return new UserView(u.getId(), u.getDisplayName(), u.getEmail());
        }
    }

    public record AuthResponse(String token, UserView user) {
    }
}
