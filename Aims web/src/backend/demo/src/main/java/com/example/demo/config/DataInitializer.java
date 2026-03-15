package com.example.demo.config;

import com.example.demo.users.entity.User;
import com.example.demo.users.enums.Role;
import com.example.demo.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create or ensure Admin user is active
        var existingAdmin = userRepository.findByEmail("admin@aims.com");
        if (existingAdmin.isEmpty()) {
            User admin = new User();
            admin.setId(UUID.randomUUID().toString());
            admin.setName("Admin");
            admin.setEmail("admin@aims.com");
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setRole(Role.ADMIN);
            admin.setCreatedAt(LocalDate.now());
            admin.setCreatedBy("SYSTEM");
            admin.setActive(true);
            userRepository.save(admin);
            log.info("Created admin user: admin@aims.com / 123456");
        } else {
            // Ensure admin is always active and has the correct password
            User admin = existingAdmin.get();
            if (!admin.isActive()) {
                admin.setActive(true);
                admin.setPassword(passwordEncoder.encode("123456"));
                userRepository.save(admin);
                log.info("Reactivated admin user: admin@aims.com / 123456");
            }
        }

        // Create or ensure Product Manager user is active
        var existingPm = userRepository.findByEmail("pm@aims.com");
        if (existingPm.isEmpty()) {
            User pm = new User();
            pm.setId(UUID.randomUUID().toString());
            pm.setName("Product Manager");
            pm.setEmail("pm@aims.com");
            pm.setPassword(passwordEncoder.encode("123456"));
            pm.setRole(Role.MANAGER_PRODUCT);
            pm.setCreatedAt(LocalDate.now());
            pm.setCreatedBy("SYSTEM");
            pm.setActive(true);
            userRepository.save(pm);
            log.info("Created product manager user: pm@aims.com / 123456");
        } else {
            // Ensure PM is always active
            User pm = existingPm.get();
            if (!pm.isActive()) {
                pm.setActive(true);
                pm.setPassword(passwordEncoder.encode("123456"));
                userRepository.save(pm);
                log.info("Reactivated product manager user: pm@aims.com / 123456");
            }
        }
    }
}
