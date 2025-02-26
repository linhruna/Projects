//package com.project.ims.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.core.userdetails.User;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.provisioning.InMemoryUserDetailsManager;
//import org.springframework.security.web.SecurityFilterChain;
//
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity(jsr250Enabled = true)
//public class SecurityConfig {
//    @Bean
//    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
////        http.formLogin( (formLogin) -> formLogin.loginProcessingUrl("/login"));
//        http.authorizeHttpRequests( (req) -> req
//                .requestMatchers("api/products/**").permitAll()
//                // .requestMatchers("/api/project/update").hasRole("LEADER")
//                .anyRequest().authenticated()
//        );
////        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
////        http.csrf(CsrfConfigurer::disable);
////        http.headers(headers -> headers.frameOptions(FrameOptionsConfig::disable))
////        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.ALWAYS));
//        return http.build();
//    }
//
//    @Bean
//    public UserDetailsService userDetailsService() {
//        UserDetails admin = User.withUsername("admin")
//                .password("{noop}admin123")
//                .authorities("ROLE_MEMBER")
//                .build();
//        return new InMemoryUserDetailsManager(admin);
//    }
//}
