package com.example.demo.auths.config;

import com.example.demo.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserRepository userRepository;

    // 1. UserDetailsService (Cách Spring tìm User từ DB)
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .map(user -> {
                    // Check if user is active (not blocked)
                    if (!user.isActive()) {
                        throw new UsernameNotFoundException("Tài khoản đã bị chặn: " + username);
                    }
                    // Thêm prefix "ROLE_" và cả role gốc để đảm bảo tương thích
                    // FIXED: Added both ROLE_ADMIN and ADMIN to support both checking styles
                    // (hasRole vs hasAuthority)
                    var authorities = new java.util.ArrayList<org.springframework.security.core.GrantedAuthority>();
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
                    authorities.add(new SimpleGrantedAuthority(user.getRole().name()));

                    return new org.springframework.security.core.userdetails.User(
                            user.getEmail(),
                            user.getPassword(),
                            user.isActive(), // enabled
                            true, // accountNonExpired
                            true, // credentialsNonExpired
                            true, // accountNonLocked
                            authorities);
                })
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    // 2. AuthenticationProvider (Được dùng trong SecurityConfig)
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // 3. AuthenticationManager (Dùng trong AuthService)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // 4. Mã hóa mật khẩu
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}