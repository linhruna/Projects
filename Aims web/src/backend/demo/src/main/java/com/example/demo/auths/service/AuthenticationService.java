package com.example.demo.auths.service;


import com.example.demo.auths.dto.request.LoginRequest;
import com.example.demo.auths.dto.response.AuthenticationResponse;

public interface AuthenticationService {

    AuthenticationResponse login(LoginRequest request);

}
