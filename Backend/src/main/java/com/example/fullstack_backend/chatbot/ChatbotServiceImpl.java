package com.example.fullstack_backend.chatbot;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.fullstack_backend.chatbot.dto.ChatbotRequest;
import com.example.fullstack_backend.chatbot.dto.ChatbotResponse;
import com.example.fullstack_backend.exception.ResourceNotFoundException;
import com.example.fullstack_backend.model.Booking;
import com.example.fullstack_backend.model.Booking.BookingStatus;
import com.example.fullstack_backend.model.CampusResource;
import com.example.fullstack_backend.model.Role;
import com.example.fullstack_backend.model.User;
import com.example.fullstack_backend.repository.BookingRepository;
import com.example.fullstack_backend.repository.CampusResourceRepository;
import com.example.fullstack_backend.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatbotServiceImpl implements ChatbotService {

    private static final Logger logger = LoggerFactory.getLogger(ChatbotServiceImpl.class);

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");
    private static final Set<String> MODEL_NOT_FOUND_CACHE = ConcurrentHashMap.newKeySet();

    private final CampusResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Value("${gemini.api.key:AIzaSyD0eX_JMTqbW48P5THylJdMgvVjckwQXOI}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${gemini.fallback.models:gemini-1.5-flash-latest,gemini-1.5-flash,gemini-2.0-flash}")
    private String geminiFallbackModels;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public ChatbotResponse ask(String username, ChatbotRequest request) {
        String question = request.getQuestion().trim();
        String normalized = question.toLowerCase(Locale.ROOT);

        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                return buildGeminiResponse(username, question, normalized);
            } catch (Exception ex) {
                logger.warn("Gemini response failed, using local AI fallback: {}", ex.getMessage());
                return buildRuleBasedResponse(username, normalized, true);
            }
        }

        return buildRuleBasedResponse(username, normalized, false);
    }

    private ChatbotResponse buildRuleBasedResponse(String username, String normalized, boolean geminiFallback) {
        if (normalized.contains("resource") || normalized.contains("all resources") || normalized.contains("facility")) {
            return buildResourcesResponse();
        }

        if (normalized.contains("booking") || normalized.contains("my bookings") || normalized.contains("booked")) {
            return buildBookingDetailsResponse(username);
        }

        if (normalized.contains("available") || normalized.contains("time slot") || normalized.contains("availability") || normalized.contains("slot")) {
            return buildAvailabilityResponse(normalized);
        }

        if (isGreeting(normalized)) {
            return ChatbotResponse.builder()
                    .intent("greeting")
                    .answer("Hi. Welcome to UNI 360 AI Assistant. I can help with resources, booking details, and available time slots.")
                    .followUpQuestion("What would you like to check first?")
                    .suggestions(getDefaultSuggestions())
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        return ChatbotResponse.builder()
                .intent("general")
                .answer("UNI 360 AI Assistant here. I can help with campus resources, booking details, and available time slots.")
            .followUpQuestion("Would you like to check all resources, your booking details, or available time slots?")
                .suggestions(getDefaultSuggestions())
                .timestamp(LocalDateTime.now())
                .build();
    }

    private ChatbotResponse buildGeminiResponse(String username, String question, String normalizedQuestion) throws Exception {
        String intent = detectIntent(normalizedQuestion);

        String resourcesContext = "Not requested in this question.";
        String bookingContext = "Not requested in this question.";
        String availabilityContext = "Not requested in this question.";

        if ("resources".equals(intent)) {
            resourcesContext = buildResourcesResponse().getAnswer();
        } else if ("bookings".equals(intent)) {
            bookingContext = buildBookingDetailsResponse(username).getAnswer();
        } else if ("availability".equals(intent)) {
            availabilityContext = buildAvailabilityResponse(normalizedQuestion).getAnswer();
        }

        String prompt = "You are UNI360 Smart Campus assistant. "
            + "Answer clearly and concisely in plain text. "
            + "If the user asks about unavailable data, say what is needed next.\n\n"
            + "User question:\n" + question + "\n\n"
            + "Context - Resources:\n" + resourcesContext + "\n\n"
            + "Context - Bookings:\n" + bookingContext + "\n\n"
            + "Context - Availability:\n" + availabilityContext + "\n\n"
            + "Respond with practical details and short follow-up guidance.";

        Map<String, Object> body = Map.of(
            "contents", List.of(Map.of(
                "parts", List.of(Map.of("text", prompt))
            ))
        );

        String requestJson = objectMapper.writeValueAsString(body);
        String answer = callGeminiWithFallbackModels(requestJson);

        return ChatbotResponse.builder()
            .intent(intent)
            .answer("[Gemini AI] " + answer)
            .followUpQuestion("Generated by Gemini AI. Would you like me to check resources, booking details, or available time slots next?")
            .suggestions(getDefaultSuggestions())
            .timestamp(LocalDateTime.now())
            .build();
    }

    private String callGeminiWithFallbackModels(String requestJson) throws Exception {
        List<String> models = new ArrayList<>();
        if (geminiModel != null && !geminiModel.isBlank()) {
            models.add(geminiModel.trim());
        }

        Arrays.stream(geminiFallbackModels.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .filter(s -> !models.contains(s))
                .forEach(models::add);

        String lastError = "Gemini API request failed";
        for (String model : models) {
            if (MODEL_NOT_FOUND_CACHE.contains(model)) {
                continue;
            }

            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + model + ":generateContent?key=" + geminiApiKey;

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (httpResponse.statusCode() >= 200 && httpResponse.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(httpResponse.body());
                JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                    return "Gemini AI could not generate a response right now.";
                }
                return textNode.asText();
            }

            if (httpResponse.statusCode() == 404) {
                MODEL_NOT_FOUND_CACHE.add(model);
            }

            lastError = "Gemini API failed for model '" + model + "' with status " + httpResponse.statusCode();
            logger.warn(lastError);
        }

        throw new IllegalStateException(lastError);
    }

    private String detectIntent(String normalized) {
            if (isGreeting(normalized)) {
                return "greeting";
            }

        if (normalized.contains("resource") || normalized.contains("all resources") || normalized.contains("facility")) {
            return "resources";
        }

        if (normalized.contains("booking") || normalized.contains("my bookings") || normalized.contains("booked")) {
            return "bookings";
        }

        if (normalized.contains("available") || normalized.contains("time slot") || normalized.contains("availability") || normalized.contains("slot")) {
            return "availability";
        }

        return "general";
    }

    private boolean isGreeting(String normalized) {
        return normalized.matches("^(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$")
                || normalized.equals("hi")
                || normalized.equals("hello")
                || normalized.equals("hey");
    }

    @Override
    public List<String> getDefaultSuggestions() {
        return List.of(
                "Show all active resources",
                "Show my latest booking details",
                "Available time slots for Library tomorrow"
        );
    }

    private ChatbotResponse buildResourcesResponse() {
        List<CampusResource> resources = resourceRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(CampusResource::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();

        if (resources.isEmpty()) {
            return ChatbotResponse.builder()
                    .intent("resources")
                    .answer("No resources are currently available in the system.")
                    .followUpQuestion("Please ask an admin to add resources, then ask me again.")
                    .suggestions(getDefaultSuggestions())
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        StringBuilder answer = new StringBuilder("Here are the available campus resources:\n");
        resources.stream().limit(12).forEach(r -> answer
                .append("- ")
                .append(r.getName())
                .append(" | Type: ")
                .append(r.getType())
                .append(" | Capacity: ")
                .append(r.getCapacity())
                .append(" | Location: ")
                .append(r.getLocation())
                .append(" | Status: ")
                .append(r.getStatus())
                .append("\n"));

        if (resources.size() > 12) {
            answer.append("...and ").append(resources.size() - 12).append(" more resources.");
        }

        return ChatbotResponse.builder()
                .intent("resources")
                .answer(answer.toString().trim())
                .followUpQuestion("Do you want available time slots for any specific resource?")
                .suggestions(List.of(
                        "Available time slots for Library today",
                        "Available time slots for Computer Lab tomorrow"
                ))
                .timestamp(LocalDateTime.now())
                .build();
    }

    private ChatbotResponse buildBookingDetailsResponse(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        boolean elevatedAccess = user.getRole() == Role.ADMIN || user.getRole() == Role.MANAGER;

        List<Booking> bookings = elevatedAccess
                ? bookingRepository.findTop10ByOrderByCreatedAtDesc()
                : bookingRepository.findTop10ByUserIdOrderByCreatedAtDesc(username);

        if (bookings.isEmpty()) {
            return ChatbotResponse.builder()
                    .intent("bookings")
                    .answer(elevatedAccess
                            ? "No booking records were found yet."
                            : "You do not have any booking records yet.")
                    .followUpQuestion("Would you like to view all resources and create a booking?")
                    .suggestions(List.of("Show all active resources"))
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        StringBuilder answer = new StringBuilder(
                elevatedAccess
                        ? "Latest booking details across the system:\n"
                        : "Your latest booking details:\n");

        for (Booking booking : bookings) {
            answer.append("- Booking #")
                    .append(booking.getId())
                    .append(" | Resource: ")
                    .append(booking.getResourceId())
                    .append(" | Start: ")
                    .append(booking.getStartTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                    .append(" | End: ")
                    .append(booking.getEndTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                    .append(" | Status: ")
                    .append(booking.getStatus())
                    .append("\n");
        }

        return ChatbotResponse.builder()
                .intent("bookings")
                .answer(answer.toString().trim())
                .followUpQuestion("Do you want available slots for any resource to make a new booking?")
                .suggestions(List.of(
                        "Available time slots for Library today",
                        "Show all active resources"
                ))
                .timestamp(LocalDateTime.now())
                .build();
    }

    private ChatbotResponse buildAvailabilityResponse(String normalizedQuestion) {
        LocalDate date = extractDate(normalizedQuestion);
        List<CampusResource> resources = resourceRepository.findAll();

        Optional<CampusResource> matchedResource = findResourceFromQuestion(normalizedQuestion, resources);

        if (matchedResource.isEmpty()) {
            String sampleResources = resources.stream()
                    .limit(4)
                    .map(CampusResource::getName)
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("Library, Computer Lab");

            return ChatbotResponse.builder()
                    .intent("availability")
                    .answer("I can check available time slots, but I need a resource name.")
                    .followUpQuestion("Please ask like: 'Available time slots for " + sampleResources + " today'.")
                    .suggestions(List.of(
                            "Available time slots for Library today",
                            "Available time slots for Computer Lab tomorrow"
                    ))
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        CampusResource resource = matchedResource.get();
        String resourceId = String.valueOf(resource.getId());

        List<Booking> approvedBookings = bookingRepository.findByStatus(BookingStatus.APPROVED)
                .stream()
                .filter(b -> resourceId.equals(b.getResourceId()) || resource.getName().equalsIgnoreCase(b.getResourceId()))
                .filter(b -> b.getStartTime().toLocalDate().equals(date) || b.getEndTime().toLocalDate().equals(date))
                .sorted(Comparator.comparing(Booking::getStartTime))
                .toList();

        LocalDateTime dayStart = LocalDateTime.of(date, LocalTime.of(8, 0));
        LocalDateTime dayEnd = LocalDateTime.of(date, LocalTime.of(18, 0));

        List<String> availableSlots = new ArrayList<>();
        LocalDateTime cursor = dayStart;
        while (cursor.isBefore(dayEnd)) {
            LocalDateTime slotStart = cursor;
            LocalDateTime slotEnd = cursor.plusHours(1);
            boolean overlaps = approvedBookings.stream().anyMatch(b ->
                    b.getStartTime().isBefore(slotEnd) && b.getEndTime().isAfter(slotStart));
            if (!overlaps) {
                availableSlots.add(slotStart.toLocalTime().format(TIME_FMT) + " - " + slotEnd.toLocalTime().format(TIME_FMT));
            }
            cursor = slotEnd;
        }

        StringBuilder answer = new StringBuilder();
        answer.append("Available time slots for ")
                .append(resource.getName())
                .append(" on ")
                .append(date.format(DATE_FMT))
                .append(":\n");

        if (availableSlots.isEmpty()) {
            answer.append("- No free slots in working hours (08:00-18:00).\n");
        } else {
            availableSlots.forEach(slot -> answer.append("- ").append(slot).append("\n"));
        }

        if (!approvedBookings.isEmpty()) {
            answer.append("Booked slots:\n");
            approvedBookings.forEach(b -> answer
                    .append("- ")
                    .append(b.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                    .append(" - ")
                    .append(b.getEndTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                    .append("\n"));
        }

        return ChatbotResponse.builder()
                .intent("availability")
                .answer(answer.toString().trim())
                .followUpQuestion("Do you want booking details as well?")
                .suggestions(List.of(
                        "Show my latest booking details",
                        "Available time slots for " + resource.getName() + " tomorrow"
                ))
                .timestamp(LocalDateTime.now())
                .build();
    }

    private Optional<CampusResource> findResourceFromQuestion(String normalizedQuestion, List<CampusResource> resources) {
        Pattern numberPattern = Pattern.compile("\\b(\\d+)\\b");
        Matcher matcher = numberPattern.matcher(normalizedQuestion);
        while (matcher.find()) {
            String found = matcher.group(1);
            Optional<CampusResource> byId = resources.stream()
                    .filter(r -> String.valueOf(r.getId()).equals(found))
                    .findFirst();
            if (byId.isPresent()) {
                return byId;
            }
        }

        return resources.stream()
                .filter(r -> normalizedQuestion.contains(r.getName().toLowerCase(Locale.ROOT)))
                .findFirst();
    }

    private LocalDate extractDate(String normalizedQuestion) {
        if (normalizedQuestion.contains("tomorrow")) {
            return LocalDate.now().plusDays(1);
        }

        Pattern datePattern = Pattern.compile("\\b(\\d{4}-\\d{2}-\\d{2})\\b");
        Matcher matcher = datePattern.matcher(normalizedQuestion);
        if (matcher.find()) {
            try {
                return LocalDate.parse(matcher.group(1));
            } catch (Exception ignored) {
                return LocalDate.now();
            }
        }

        return LocalDate.now();
    }
}
