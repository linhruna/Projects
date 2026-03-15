package com.example.demo.email.impl;

import com.example.demo.email.EmailService;
import com.example.demo.email.strategy.EmailTemplateContext;
import com.example.demo.email.strategy.EmailTemplateStrategy;
import com.example.demo.orders.dto.response.InvoiceResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * Email Service implementation using Strategy Pattern for templates.
 * Delegates template generation to appropriate strategies via
 * EmailTemplateContext.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

        private final JavaMailSender mailSender;
        private final EmailTemplateContext emailTemplateContext;

        @Value("${spring.mail.username:aims@example.com}")
        private String fromEmail;

        @Value("${app.base-url:http://localhost:3000}")
        private String baseUrl;

        @Override
        public void sendOrderConfirmation(InvoiceResponseDTO invoice) {
                sendOrderEmail(invoice, "ORDER_CONFIRMATION");
        }

        @Override
        public void sendOrderRejection(InvoiceResponseDTO invoice) {
                sendOrderEmail(invoice, "ORDER_REJECTION");
        }

        @Override
        public void sendOrderApproval(InvoiceResponseDTO invoice) {
                sendOrderEmail(invoice, "ORDER_APPROVAL");
        }

        @Override
        public void sendOrderCancellation(InvoiceResponseDTO invoice) {
                sendOrderEmail(invoice, "ORDER_CANCELLATION");
        }

        /**
         * Generic method to send order email using template strategy
         */
        private void sendOrderEmail(InvoiceResponseDTO invoice, String templateType) {
                if (invoice.getDeliveryInfo() == null || invoice.getDeliveryInfo().getEmail() == null) {
                        log.warn("Cannot send {} email - no email address for invoice: {}", templateType,
                                        invoice.getId());
                        return;
                }

                try {
                        // Get the appropriate template strategy
                        EmailTemplateStrategy template = emailTemplateContext.getTemplate(templateType);

                        MimeMessage message = mailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                        helper.setFrom(fromEmail);
                        helper.setTo(invoice.getDeliveryInfo().getEmail());
                        helper.setSubject(template.getSubject(invoice));

                        String htmlContent = template.buildContent(invoice, baseUrl);
                        helper.setText(htmlContent, true);

                        mailSender.send(message);
                        log.info("{} email sent to: {}", templateType, invoice.getDeliveryInfo().getEmail());
                } catch (MessagingException e) {
                        log.error("Failed to send {} email", templateType, e);
                }
        }

        @Override
        public void sendUserNotification(String email, String userName, String subject, String message) {
                try {
                        MimeMessage mimeMessage = mailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

                        helper.setFrom(fromEmail);
                        helper.setTo(email);
                        helper.setSubject("AIMS Store - " + subject);

                        String htmlContent = buildUserNotificationEmail(userName, subject, message);
                        helper.setText(htmlContent, true);

                        mailSender.send(mimeMessage);
                        log.info("User notification email sent to: {}", email);
                } catch (MessagingException e) {
                        log.error("Failed to send user notification email", e);
                }
        }

        /**
         * Build user notification email - kept simple as it's a generic notification
         */
        private String buildUserNotificationEmail(String userName, String subject, String message) {
                StringBuilder sb = new StringBuilder();
                sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'></head>" +
                                "<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>");

                // Header
                sb.append("<div style='background: linear-gradient(135deg, #A7C7E7, #C8B6FF); " +
                                "padding: 20px; border-radius: 10px; text-align: center;'>");
                sb.append("<h1 style='color: white; margin: 0;'>AIMS Store</h1>");
                sb.append("<p style='color: white; margin: 5px 0;'>").append(subject).append("</p>");
                sb.append("</div>");

                // Content
                sb.append("<div style='background: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 10px;'>");
                sb.append("<p>Xin chào <strong>").append(userName).append("</strong>,</p>");
                sb.append("<p>").append(message.replace("\n", "<br>")).append("</p>");
                sb.append("</div>");

                // Footer
                sb.append("<div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;'>");
                sb.append("<p style='color: #666; font-size: 12px;'>AIMS Store - An Internet Media Store</p>");
                sb.append("<p style='color: #666; font-size: 12px;'>Email này được gửi tự động, vui lòng không trả lời.</p>");
                sb.append("</div>");

                sb.append("</body></html>");
                return sb.toString();
        }
}
