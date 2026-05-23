package com.tecniservice.gestionservicio.config;

import com.tecniservice.gestionservicio.model.User;
import com.tecniservice.gestionservicio.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new User(null, "admin", "admin123", "Administrador Principal", "ADMIN"));
                repository.save(new User(null, "tecnico1", "pass123", "Juan Pérez", "TECHNICIAN"));
                repository.save(new User(null, "tecnico2", "pass456", "Maria Garcia", "TECHNICIAN"));
                System.out.println("Usuarios base creados en la base de datos.");
            }
        };
    }
}
