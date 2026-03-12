package com.example.fullstack_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
@CrossOrigin(origins = "*")
public class StudentController {

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to Student Dashboard",
                "role", "STUDENT",
                "access", "Student-level access"
        ));
    }

    @GetMapping("/courses")
    public ResponseEntity<Map<String, Object>> getMyCourses() {
        return ResponseEntity.ok(Map.of(
                "message", "My enrolled courses",
                "info", "View your enrolled courses here"
        ));
    }

    @GetMapping("/grades")
    public ResponseEntity<Map<String, Object>> getMyGrades() {
        return ResponseEntity.ok(Map.of(
                "message", "My grades",
                "info", "View your grades here"
        ));
    }
}
