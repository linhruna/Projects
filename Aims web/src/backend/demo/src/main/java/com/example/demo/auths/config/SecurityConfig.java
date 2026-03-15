package com.example.demo.auths.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import com.example.demo.auths.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final AuthenticationProvider authenticationProvider;
        private final CorsConfigurationSource corsConfigurationSource;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                                .csrf(AbstractHttpConfigurer::disable)
                                .authorizeHttpRequests(auth -> auth

                                                // 1. AUTH - Explicitly allow POST for login
                                                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                                                .requestMatchers("/api/auth/**").permitAll()

                                                // EMAIL TEST - Temporary for testing (remove in production)
                                                .requestMatchers("/api/email/**").permitAll()

                                                // 2. PRODUCT
                                                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/products/**")
                                                .hasAnyRole("ADMIN", "MANAGER_PRODUCT")
                                                .requestMatchers(HttpMethod.PUT, "/api/products/**")
                                                .hasAnyRole("ADMIN", "MANAGER_PRODUCT")
                                                .requestMatchers(HttpMethod.DELETE, "/api/products/**")
                                                .hasAnyRole("ADMIN", "MANAGER_PRODUCT")

                                                // 3. SECTION
                                                .requestMatchers(HttpMethod.GET, "/api/sections/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/sections/**")
                                                .hasAnyRole("ADMIN", "MANAGER_PRODUCT")
                                                .requestMatchers(HttpMethod.PUT, "/api/sections/**")
                                                .hasAnyRole("ADMIN", "MANAGER_PRODUCT")
                                                .requestMatchers(HttpMethod.DELETE, "/api/sections/**")
                                                .hasAnyRole("ADMIN", "MANAGER_PRODUCT")

                                                // 4. AUTHOR
                                                .requestMatchers(HttpMethod.GET, "/api/authors/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/authors/**")
                                                .hasAnyRole("ADMIN", "MANAGER_PRODUCT")
                                                .requestMatchers(HttpMethod.PUT, "/api/authors/**")
                                                .hasAnyRole("ADMIN", "MANAGER_PRODUCT")
                                                .requestMatchers(HttpMethod.DELETE, "/api/authors/**")
                                                .hasAnyRole("ADMIN", "MANAGER_PRODUCT")

                                                // 5. USER - /me endpoints for authenticated users, others require ADMIN
                                                .requestMatchers("/api/users/me", "/api/users/me/**").authenticated()

                                                // FIXED: Explicitly match identifying both base path and sub-paths to
                                                // avoid matcher issues
                                                // FIXED: Use hasAnyAuthority to support both "ROLE_ADMIN" (Spring
                                                // default) and "ADMIN" (raw)
                                                .requestMatchers("/api/users", "/api/users/**")
                                                .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                                                // 6. PAYMENT - Allow all for payment processing
                                                .requestMatchers("/api/payment/**").permitAll()

                                                // 7. SHIPPING - Allow all for shipping fee calculation
                                                .requestMatchers("/api/shipping/**").permitAll()

                                                // 8. INVOICE - Allow all for order processing
                                                .requestMatchers("/api/invoices/**").permitAll()

                                                // 8. PRODUCT HISTORY - Allow GET for all, POST/DELETE for authenticated
                                                // users
                                                .requestMatchers(HttpMethod.GET, "/api/product-history/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/product-history/**")
                                                .hasAnyRole("ADMIN", "MANAGER_PRODUCT")
                                                .requestMatchers(HttpMethod.DELETE, "/api/product-history/**")
                                                .hasAnyRole("ADMIN", "MANAGER_PRODUCT")

                                                // Allow error page
                                                .requestMatchers("/error").permitAll()

                                                // 9. Others
                                                .anyRequest().authenticated())
                                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}
