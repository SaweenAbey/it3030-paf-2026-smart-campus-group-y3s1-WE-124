package com.example.demo.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${JWT_SECRET:dGhpc2lzYXZlcnlsb25nc2VjcmV0a2V5Zm9yand0YXV0aGVudGljYXRpb25zcHJpbmdib290YXBwbGljYXRpb24=}")
    private String jwtSecret;

    private Key getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUserId(String token) {
        return getClaims(token).getSubject();
    }

    public String extractRole(String token) {
        try {
            Claims claims = getClaims(token);

            // Try direct "role" field first
            String role = claims.get("role", String.class);
            if (role != null) return role;

            // Try "authorities" field (your team's format)
            Object authorities = claims.get("authorities");
            if (authorities instanceof List<?> list && !list.isEmpty()) {
                Object first = list.get(0);
                if (first instanceof Map<?, ?> map) {
                    Object authority = map.get("authority");
                    if (authority != null) {
                        // Strip ROLE_ prefix if present
                        String auth = authority.toString();
                        return auth.startsWith("ROLE_")
                                ? auth.substring(5) : auth;
                    }
                }
                // Simple string authority
                if (first instanceof String str) {
                    return str.startsWith("ROLE_")
                            ? str.substring(5) : str;
                }
            }

            return null;
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}