package com.tecniservice.gestionservicio.controller;

import com.tecniservice.gestionservicio.model.User;
import com.tecniservice.gestionservicio.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> user = userRepository.findByUsername(username);

        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return ResponseEntity.ok(Map.of(
                "message", "Login successful", 
                "username", user.get().getUsername(),
                "fullName", user.get().getFullName(),
                "role", user.get().getRole(),
                "token", "fake-jwt-token"
            ));
        }

        return ResponseEntity.status(401).body(Map.of("message", "Credenciales incorrectas"));
    }
}
