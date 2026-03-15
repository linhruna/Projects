package com.example.demo.auths.service.impl;

import com.example.demo.auths.dto.request.LoginRequest;
import com.example.demo.auths.dto.response.AuthenticationResponse;
import com.example.demo.users.repository.UserRepository;
import com.example.demo.auths.service.AuthenticationService;
import com.example.demo.auths.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthenticationResponse login(LoginRequest request) {

        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Lấy UserDetails (Spring đã tạo sẵn)
        var userDetails =
                (org.springframework.security.core.userdetails.User)
                        authentication.getPrincipal();

        // Sinh JWT từ UserDetails
        String jwtToken = jwtService.generateToken(userDetails);

        // Lấy role từ authority
        String role = userDetails.getAuthorities()
                .iterator()
                .next()
                .getAuthority()
                .replace("ROLE_", "");

        AuthenticationResponse response = new AuthenticationResponse();
        response.setToken(jwtToken);
        response.setRole(role);

        return response;
    }
}

