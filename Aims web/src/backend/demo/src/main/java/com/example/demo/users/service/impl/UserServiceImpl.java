package com.example.demo.users.service.impl;

import com.example.demo.email.EmailService;
import com.example.demo.users.converter.UserConverter;
import com.example.demo.users.dto.request.ChangePasswordRequest;
import com.example.demo.users.dto.request.ResetPasswordRequest;
import com.example.demo.users.dto.request.UserRequest;
import com.example.demo.users.dto.response.UserResponse;
import com.example.demo.users.entity.User;
import com.example.demo.users.repository.UserRepository;
import com.example.demo.users.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserConverter userConverter;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // --- CRUD: CREATE (Tạo mới User) ---
    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại: " + request.getEmail());
        }

        User user = userConverter.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setId(UUID.randomUUID().toString());
        user.setCreatedAt(LocalDate.now());
        user.setCreatedBy("ADMIN_SYSTEM");
        user.setActive(true);

        user = userRepository.save(user);

        // Send welcome email when user is CREATED
        log.info("Sending welcome email to new user: {}", user.getEmail());
        sendUserNotificationEmail(user, "Chào mừng bạn đến với AIMS Store",
                "Tài khoản của bạn đã được tạo thành công!\n\n" +
                        "Thông tin tài khoản:\n" +
                        "- Email: " + user.getEmail() + "\n" +
                        "- Vai trò: " + user.getRole().name() + "\n\n" +
                        "Bạn có thể đăng nhập ngay để bắt đầu sử dụng dịch vụ.");

        return userConverter.toResponse(user);
    }

    // --- CRUD: READ (Đọc danh sách User) ---
    @Override
    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(userConverter::toResponse)
                .collect(Collectors.toList());
    }

    // --- CRUD: READ (Đọc User theo ID) ---
    @Override
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));
        return userConverter.toResponse(user);
    }

    // --- CRUD: UPDATE (Cập nhật User) ---
    @Override
    @Transactional
    public UserResponse updateUser(String id, UserRequest request) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User để cập nhật với ID: " + id));

        Optional<User> userByEmail = userRepository.findByEmail(request.getEmail());
        if (userByEmail.isPresent() && !userByEmail.get().getId().equals(id)) {
            throw new RuntimeException("Email đã tồn tại với User khác: " + request.getEmail());
        }

        User updatedUser = userConverter.toEntity(existingUser, request);

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            updatedUser.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        updatedUser = userRepository.save(updatedUser);

        // Send notification email when user is EDITED
        log.info("Sending update notification email to: {}", updatedUser.getEmail());
        sendUserNotificationEmail(updatedUser, "Thông tin tài khoản đã được cập nhật",
                "Thông tin tài khoản của bạn đã được quản trị viên cập nhật.\n\n" +
                        "Thông tin mới:\n" +
                        "- Tên: " + updatedUser.getName() + "\n" +
                        "- Email: " + updatedUser.getEmail() + "\n" +
                        "- Vai trò: " + updatedUser.getRole().name() + "\n\n" +
                        "Nếu bạn không yêu cầu thay đổi này, vui lòng liên hệ support ngay.");

        return userConverter.toResponse(updatedUser);
    }

    // --- CRUD: DELETE (Xóa User - Xóa mềm) ---
    @Override
    @Transactional
    public void deactivateUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User để xóa với ID: " + id));

        user.setActive(false);
        userRepository.save(user);

        // Send deactivation email
        log.info("Sending deactivation email to: {}", user.getEmail());
        sendUserNotificationEmail(user, "Tài khoản của bạn đã bị vô hiệu hóa",
                "Tài khoản của bạn đã bị quản trị viên vô hiệu hóa. Vui lòng liên hệ support nếu cần hỗ trợ.");
    }

    // --- CRUD: HARD DELETE (Xóa User - Xóa vĩnh viễn) ---
    @Override
    @Transactional
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User để xóa với ID: " + id));

        // Store email before deletion for notification
        String userEmail = user.getEmail();
        String userName = user.getName();

        // Permanently delete from database
        userRepository.delete(user);

        // Send notification email when user is DELETED
        log.info("Sending deletion notification email to: {}", userEmail);
        try {
            emailService.sendUserNotification(userEmail, userName,
                    "Tài khoản của bạn đã bị xóa",
                    "Tài khoản của bạn đã bị quản trị viên xóa vĩnh viễn khỏi hệ thống.\n\n" +
                            "Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ support ngay.");
            log.info("Deletion email sent successfully to: {}", userEmail);
        } catch (Exception e) {
            log.error("Failed to send deletion email to {}: {}", userEmail, e.getMessage());
        }
    }

    // --- Activate User ---
    @Override
    @Transactional
    public UserResponse activateUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));

        user.setActive(true);
        user = userRepository.save(user);

        log.info("Sending activation email to: {}", user.getEmail());
        sendUserNotificationEmail(user, "Tài khoản của bạn đã được kích hoạt",
                "Tài khoản của bạn đã được quản trị viên kích hoạt trở lại. Bạn có thể đăng nhập bình thường.");

        return userConverter.toResponse(user);
    }

    // --- Block User ---
    @Override
    @Transactional
    public UserResponse blockUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));

        user.setActive(false);
        user = userRepository.save(user);

        // Send notification email when user is BLOCKED
        log.info("Sending block notification email to: {}", user.getEmail());
        sendUserNotificationEmail(user, "Tài khoản của bạn đã bị chặn",
                "Tài khoản của bạn đã bị quản trị viên chặn.\n\n" +
                        "Lý do: Vi phạm chính sách sử dụng.\n\n" +
                        "Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ support để được hỗ trợ.");

        return userConverter.toResponse(user);
    }

    // --- Unblock User ---
    @Override
    @Transactional
    public UserResponse unblockUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));

        user.setActive(true);
        user = userRepository.save(user);

        log.info("Sending unblock notification email to: {}", user.getEmail());
        sendUserNotificationEmail(user, "Tài khoản của bạn đã được bỏ chặn",
                "Tài khoản của bạn đã được quản trị viên bỏ chặn. Bạn có thể đăng nhập và sử dụng bình thường.");

        return userConverter.toResponse(user);
    }

    // --- Reset Password (Admin) ---
    @Override
    @Transactional
    public void resetPassword(String id, ResetPasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Send notification email when password is RESET
        log.info("Sending password reset notification email to: {}", user.getEmail());
        sendUserNotificationEmail(user, "Mật khẩu của bạn đã được đặt lại",
                "Mật khẩu tài khoản của bạn đã được quản trị viên đặt lại.\n\n" +
                        "Mật khẩu mới: " + request.getNewPassword() + "\n\n" +
                        "⚠️ Vui lòng đăng nhập và đổi mật khẩu ngay để bảo mật tài khoản.");
    }

    // --- Change Password (User) ---
    @Override
    @Transactional
    public void changePassword(String id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với ID: " + id));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        // Verify password confirmation
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Xác nhận mật khẩu không khớp");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Sending password change notification email to: {}", user.getEmail());
        sendUserNotificationEmail(user, "Mật khẩu đã được thay đổi",
                "Mật khẩu tài khoản của bạn đã được thay đổi thành công.\n\n" +
                        "Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ support ngay.");
    }

    // --- Get Current User by Email ---
    @Override
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User với email: " + email));
        return userConverter.toResponse(user);
    }

    // --- Helper method to send email notifications ---
    private void sendUserNotificationEmail(User user, String subject, String message) {
        log.info("========================================");
        log.info("SENDING USER NOTIFICATION EMAIL");
        log.info("To: {}", user.getEmail());
        log.info("Subject: {}", subject);
        log.info("========================================");

        try {
            emailService.sendUserNotification(user.getEmail(), user.getName(), subject, message);
            log.info("✅ EMAIL SENT SUCCESSFULLY to {}", user.getEmail());
        } catch (Exception e) {
            log.error("❌ FAILED TO SEND EMAIL to {}", user.getEmail());
            log.error("Error: {}", e.getMessage(), e);
        }
    }
}