package com.prooflaunch.domain;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

/** Only public https websites may be listed (blocks javascript:, http:, localhost, raw IPs, credentials in URL). */
public final class UrlRules {

    private static final Pattern IPV4 = Pattern.compile("^\\d{1,3}(\\.\\d{1,3}){3}$");

    private UrlRules() {
    }

    public static Optional<URI> parseAcceptable(String raw) {
        if (raw == null) {
            return Optional.empty();
        }
        try {
            URI uri = new URI(raw.trim());
            if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getUserInfo() != null) {
                return Optional.empty();
            }
            String host = uri.getHost();
            if (host == null) {
                return Optional.empty();
            }
            host = host.toLowerCase(Locale.ROOT);
            boolean bad = !host.contains(".")
                    || host.equals("localhost")
                    || host.endsWith(".local")
                    || host.endsWith(".internal")
                    || host.startsWith("[")
                    || IPV4.matcher(host).matches();
            return bad ? Optional.empty() : Optional.of(uri);
        } catch (URISyntaxException e) {
            return Optional.empty();
        }
    }

    public static boolean isAcceptable(String raw) {
        return parseAcceptable(raw).isPresent();
    }

    /** Canonical form used for duplicate detection: lower-case host, no fragment, no trailing slash. */
    public static String normalize(String raw) {
        URI uri = parseAcceptable(raw).orElseThrow(() -> new IllegalArgumentException("Unacceptable URL"));
        String path = uri.getRawPath() == null ? "" : uri.getRawPath();
        while (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        int port = uri.getPort();
        String portPart = (port == -1 || port == 443) ? "" : ":" + port;
        String query = uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery();
        return "https://" + uri.getHost().toLowerCase(Locale.ROOT) + portPart + path + query;
    }
}
