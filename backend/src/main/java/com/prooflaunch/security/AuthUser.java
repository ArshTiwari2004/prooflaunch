package com.prooflaunch.security;

/** The authenticated principal placed in the SecurityContext by the JWT filter. */
public record AuthUser(long id, String email) {
}
