package com.example.fullstack_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/teacher")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
@CrossOrigin(origins = "*")
public class TeacherController {

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(Map.of(
                "message", "Welcome to Teacher Dashboard",
                "role", "TEACHER",
                "access", "Teacher-level access"
        ));
    }

    @GetMapping("/courses")
    public ResponseEntity<Map<String, Object>> getCourses() {
        return ResponseEntity.ok(Map.of(
                "message", "Teacher courses",
                "info", "You can manage your courses here"
        ));
    }

    @GetMapping("/students")
    public ResponseEntity<Map<String, Object>> getStudents() {
        return ResponseEntity.ok(Map.of(
                "message", "Student management",
                "info", "You can view and manage students in your courses"
        ));
    }
}
