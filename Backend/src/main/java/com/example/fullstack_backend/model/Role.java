package com.example.fullstack_backend.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    ADMIN,      
    TEACHER,    
    STUDENT,    
    TECHNICIAN, 
    MANAGER;

    @JsonCreator
    public static Role fromValue(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim().toUpperCase();
        if ("TUTOR".equals(normalized)) {
            return TEACHER;
        }

        return Role.valueOf(normalized);
    }
}
