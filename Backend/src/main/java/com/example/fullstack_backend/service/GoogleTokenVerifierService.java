package com.example.fullstack_backend.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@Service
public class GoogleTokenVerifierService {

    @Value("${google.client-id:}")
    private String googleClientId;

    public GoogleIdToken.Payload verify(String idTokenString) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new IllegalStateException("Google client ID is not configured");
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google ID token");
            }

            return idToken.getPayload();
        } catch (GeneralSecurityException | IOException ex) {
            throw new IllegalStateException("Failed to verify Google token", ex);
        }
    }
}
