package com.prooflaunch.domain;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;
import java.util.Set;

/** A maker is "verified" when their (non free-mail) email domain matches the product website. */
public final class MakerVerification {

    private static final Set<String> FREE_PROVIDERS = Set.of(
            "gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "live.com", "yahoo.com",
            "icloud.com", "proton.me", "protonmail.com", "aol.com", "gmx.com");

    private MakerVerification() {
    }

    public static boolean isVerified(String email, String websiteUrl) {
        if (email == null || websiteUrl == null) {
            return false;
        }
        int at = email.lastIndexOf('@');
        if (at < 0 || at == email.length() - 1) {
            return false;
        }
        String domain = email.substring(at + 1).toLowerCase(Locale.ROOT);
        if (FREE_PROVIDERS.contains(domain)) {
            return false;
        }
        String host;
        try {
            host = new URI(websiteUrl).getHost();
        } catch (URISyntaxException e) {
            return false;
        }
        if (host == null) {
            return false;
        }
        host = host.toLowerCase(Locale.ROOT);
        if (host.startsWith("www.")) {
            host = host.substring(4);
        }
        return host.equals(domain) || host.endsWith("." + domain);
    }
}
