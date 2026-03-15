package com.example.demo.email.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import jakarta.mail.internet.MimeMessage;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for testing email functionality.
 * This endpoint should be removed or secured in production.
 */
@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@Slf4j
public class EmailTestController {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:aims@example.com}")
    private String fromEmail;

    /**
     * Test endpoint to send a simple email.
     * Usage: POST /api/email/test?to=recipient@example.com
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> sendTestEmail(@RequestParam String to) {
        Map<String, Object> response = new HashMap<>();

        try {
            log.info("Attempting to send test email to: {}", to);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("🧪 AIMS Store - Test Email");

            String htmlContent = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
                            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                            .header { background: linear-gradient(135deg, #10B981 0%, #047857 100%); color: white; padding: 30px; text-align: center; }
                            .header h1 { margin: 0; font-size: 24px; }
                            .content { padding: 30px; }
                            .success-icon { font-size: 48px; margin-bottom: 10px; }
                            .message { color: #374151; line-height: 1.6; }
                            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <div class="success-icon">✅</div>
                                <h1>Email Test Successful!</h1>
                            </div>
                            <div class="content">
                                <p class="message">
                                    Congratulations! Your email configuration is working correctly.
                                </p>
                                <p class="message">
                                    <strong>From:</strong> %s<br>
                                    <strong>To:</strong> %s<br>
                                    <strong>Time:</strong> %s
                                </p>
                                <p class="message">
                                    This is a test email from AIMS Store application.
                                </p>
                            </div>
                            <div class="footer">
                                AIMS Store - An Internet Media Store
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    .formatted(fromEmail, to, java.time.LocalDateTime.now().toString());

            helper.setText(htmlContent, true);

            mailSender.send(message);

            log.info("Test email sent successfully to: {}", to);

            response.put("success", true);
            response.put("message", "Email sent successfully!");
            response.put("from", fromEmail);
            response.put("to", to);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to send test email to {}: {}", to, e.getMessage(), e);

            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("errorType", e.getClass().getSimpleName());

            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Check email configuration status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getEmailStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("configured", true);
        status.put("fromEmail", fromEmail);
        status.put("smtpHost", "smtp.gmail.com");
        status.put("smtpPort", 587);
        return ResponseEntity.ok(status);
    }
}
