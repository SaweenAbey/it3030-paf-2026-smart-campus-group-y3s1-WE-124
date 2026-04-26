package com.example.fullstack_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailOtpService {

    private static final Logger logger = LoggerFactory.getLogger(EmailOtpService.class);

    @Value("${otp.email.provider:log}")
    private String emailProvider;

    @Value("${otp.email.allow-log-fallback:true}")
    private boolean allowLogFallback;

    @Value("${otp.email.from:no-reply@uni360.local}")
    private String fromAddress;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendLoginOtp(String username, String email, String otpCode) {
        if ("smtp".equalsIgnoreCase(emailProvider)) {
            try {
                sendViaSmtp(username, email, otpCode);
            } catch (IllegalStateException ex) {
                if (!allowLogFallback) {
                    throw ex;
                }
                logger.warn("SMTP OTP delivery unavailable ({}). Falling back to LOG provider for development.", ex.getMessage());
                logOtp(username, email, otpCode);
            }
            return;
        }

        if (!"log".equalsIgnoreCase(emailProvider)) {
            throw new IllegalStateException("Unsupported OTP email provider: " + emailProvider);
        }

        if (!allowLogFallback) {
            throw new IllegalStateException(
                    "OTP email is in LOG mode. Set OTP_EMAIL_PROVIDER=smtp and configure spring.mail settings");
        }

        logOtp(username, email, otpCode);
    }

    public void sendForgotPasswordOtp(String username, String email, String otpCode) {
        if ("smtp".equalsIgnoreCase(emailProvider)) {
            try {
                sendForgotPasswordViaSmtp(username, email, otpCode);
            } catch (IllegalStateException ex) {
                if (!allowLogFallback) {
                    throw ex;
                }
                logger.warn("SMTP Forgot Password OTP delivery unavailable ({}). Falling back to LOG provider for development.", ex.getMessage());
                logForgotPasswordOtp(username, email, otpCode);
            }
            return;
        }

        if (!"log".equalsIgnoreCase(emailProvider)) {
            throw new IllegalStateException("Unsupported OTP email provider: " + emailProvider);
        }

        if (!allowLogFallback) {
            throw new IllegalStateException(
                    "OTP email is in LOG mode. Set OTP_EMAIL_PROVIDER=smtp and configure spring.mail settings");
        }

        logForgotPasswordOtp(username, email, otpCode);
    }

    private void sendForgotPasswordViaSmtp(String username, String email, String otpCode) {
        if (mailSender == null) {
            throw new IllegalStateException("JavaMailSender is not available. Configure spring.mail.* settings");
        }
        validateSmtpConfig();
        if (isBlank(email)) {
            throw new IllegalArgumentException("Email is required for password reset");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(email.trim());
        message.setSubject("UNI360 Password Reset OTP");
        message.setText("Your UNI360 password reset verification code is " + otpCode + ". It expires in 5 minutes.");

        try {
            mailSender.send(message);
            logger.info("Forgot password OTP email sent successfully. username={}, email={}", username, maskEmail(email));
        } catch (MailException ex) {
            String rootMessage = extractRootCauseMessage(ex);
            logger.error("Failed to send forgot password OTP email to {}: {}", maskEmail(email), rootMessage);
            throw new IllegalStateException("Failed to send forgot password OTP email: " + rootMessage, ex);
        }
    }

    private void logForgotPasswordOtp(String username, String email, String otpCode) {
        logger.warn("Forgot Password OTP email provider is LOG mode. No real email will be sent.");
        logger.info("DEV Forgot Password OTP generated. username={}, email={}, otp={}", username, maskEmail(email), otpCode);
    }

    private void sendViaSmtp(String username, String email, String otpCode) {
        if (mailSender == null) {
            throw new IllegalStateException("JavaMailSender is not available. Configure spring.mail.* settings");
        }
        validateSmtpConfig();
        if (isBlank(email)) {
            throw new IllegalArgumentException("Email is required for OTP verification");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(email.trim());
        message.setSubject("UNI360 Login OTP Verification");
        message.setText("Your UNI360 verification code is " + otpCode + ". It expires in 5 minutes.");

        try {
            mailSender.send(message);
            logger.info("OTP email sent successfully. username={}, email={}", username, maskEmail(email));
        } catch (MailException ex) {
            String rootMessage = extractRootCauseMessage(ex);
            logger.error("Failed to send OTP email to {}: {}", maskEmail(email), rootMessage);
            throw new IllegalStateException("Failed to send OTP email: " + rootMessage, ex);
        }
    }

    private void validateSmtpConfig() {
        if (isBlank(mailHost) || mailHost.contains("@")) {
            throw new IllegalStateException("MAIL_HOST is invalid. Use an SMTP server host like smtp.gmail.com");
        }
        if (isBlank(mailUsername)) {
            throw new IllegalStateException("MAIL_USERNAME is missing");
        }
        if (isBlank(mailPassword)) {
            throw new IllegalStateException("MAIL_PASSWORD is missing. For Gmail, use an App Password");
        }
        if (isBlank(fromAddress)) {
            throw new IllegalStateException("OTP_EMAIL_FROM is missing");
        }
    }

    private String extractRootCauseMessage(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null && current.getCause() != current) {
            current = current.getCause();
        }
        return current.getMessage() != null ? current.getMessage() : throwable.getMessage();
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank() || !email.contains("@")) {
            return "***";
        }

        String[] parts = email.split("@", 2);
        String local = parts[0];
        String domain = parts[1];

        String maskedLocal;
        if (local.length() <= 2) {
            maskedLocal = local.charAt(0) + "*";
        } else {
            maskedLocal = local.substring(0, 2) + "***";
        }
        return maskedLocal + "@" + domain;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private void logOtp(String username, String email, String otpCode) {
        logger.warn("OTP email provider is LOG mode. No real email will be sent.");
        logger.info("DEV OTP generated. username={}, email={}, otp={}", username, maskEmail(email), otpCode);
    }
}