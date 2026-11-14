package com.prooflaunch.user;

import com.prooflaunch.common.ApiException;
import com.prooflaunch.security.JwtService;
import com.prooflaunch.user.AuthDtos.AuthResponse;
import com.prooflaunch.user.AuthDtos.LoginRequest;
import com.prooflaunch.user.AuthDtos.RegisterRequest;
import com.prooflaunch.user.AuthDtos.UserView;
import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    /** Used to burn the same CPU time for unknown emails, so response timing doesn't reveal which emails exist. */
    private final String dummyHash;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.dummyHash = encoder.encode("not-a-real-password");
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) {
            throw ApiException.conflict("EMAIL_TAKEN", "An account with this email already exists.");
        }
        User user = new User();
        user.setEmail(email);
        user.setDisplayName(req.displayName().trim());
        user.setPasswordHash(encoder.encode(req.password()));
        users.save(user);
        return new AuthResponse(jwt.issue(user), UserView.of(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase(Locale.ROOT);
        User user = users.findByEmail(email).orElse(null);
        boolean ok = encoder.matches(req.password(), user != null ? user.getPasswordHash() : dummyHash);
        if (user == null || !ok) {
            throw ApiException.unauthorized("BAD_CREDENTIALS", "Invalid email or password.");
        }
        return new AuthResponse(jwt.issue(user), UserView.of(user));
    }

    @Transactional(readOnly = true)
    public UserView me(long userId) {
        return users.findById(userId)
                .map(UserView::of)
                .orElseThrow(() -> ApiException.unauthorized("UNKNOWN_USER", "Your session is no longer valid."));
    }
}
