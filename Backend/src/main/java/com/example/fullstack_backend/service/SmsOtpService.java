package com.example.fullstack_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class SmsOtpService {

    private static final Logger logger = LoggerFactory.getLogger(SmsOtpService.class);

    @Value("${otp.sms.provider:log}")
    private String smsProvider;

    @Value("${otp.sms.allow-log-fallback:false}")
    private boolean allowLogFallback;

    @Value("${otp.sms.default-country-code:+94}")
    private String defaultCountryCode;

    @Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${twilio.phone-number:}")
    private String twilioPhoneNumber;

    public void sendLoginOtp(String username, String phoneNumber, String otpCode) {
        if ("twilio".equalsIgnoreCase(smsProvider)) {
            sendViaTwilio(username, phoneNumber, otpCode);
            return;
        }

        if (!"log".equalsIgnoreCase(smsProvider)) {
            throw new IllegalStateException("Unsupported OTP SMS provider: " + smsProvider);
        }

        if (!allowLogFallback) {
            throw new IllegalStateException(
                    "OTP SMS is in LOG mode. Set OTP_SMS_PROVIDER=twilio and configure Twilio credentials");
        }

        // Development fallback: does not send SMS, only logs OTP.
        logger.warn("OTP SMS provider is LOG mode. No real text message will be sent.");
        logger.info("DEV OTP generated. username={}, phone={}, otp={}",
                username,
                maskPhoneNumber(phoneNumber),
                otpCode);
    }

    private void sendViaTwilio(String username, String phoneNumber, String otpCode) {
        validateTwilioConfig();

        String normalizedTo = normalizePhoneNumber(phoneNumber);
        String messageBody = "Your UNI360 verification code is " + otpCode + ". It expires in 5 minutes.";

        try {
            Twilio.init(twilioAccountSid, twilioAuthToken);

            Message message = Message.creator(
                    new PhoneNumber(normalizedTo),
                    new PhoneNumber(twilioPhoneNumber),
                    messageBody)
                    .create();

            logger.info("OTP SMS sent successfully. sid={}, username={}, phone={}",
                    message.getSid(),
                    username,
                    maskPhoneNumber(normalizedTo));
        } catch (Exception ex) {
            logger.error("Failed to send OTP SMS to {}: {}", maskPhoneNumber(normalizedTo), ex.getMessage());
            throw new IllegalStateException("Failed to send OTP SMS. Check Twilio credentials and phone format", ex);
        }
    }

    private void validateTwilioConfig() {
        if (isBlank(twilioAccountSid) || isBlank(twilioAuthToken) || isBlank(twilioPhoneNumber)) {
            throw new IllegalStateException(
                    "Twilio SMS is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER");
        }
    }

    private String normalizePhoneNumber(String phoneNumber) {
        if (isBlank(phoneNumber)) {
            throw new IllegalArgumentException("Phone number is required for OTP SMS");
        }

        String cleaned = phoneNumber.replaceAll("\\s+", "").replaceAll("-", "");

        if (cleaned.startsWith("0")) {
            String country = defaultCountryCode == null ? "+94" : defaultCountryCode.trim();
            if (!country.startsWith("+")) {
                country = "+" + country;
            }
            cleaned = country + cleaned.substring(1);
        }

        if (!cleaned.matches("^\\+[1-9]\\d{7,14}$")) {
            throw new IllegalArgumentException(
                    "Phone number format is invalid. Use E.164 format (example: +94771234567)");
        }
        return cleaned;
    }

    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 4) {
            return "****";
        }
        String lastFour = phoneNumber.substring(phoneNumber.length() - 4);
        return "******" + lastFour;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
