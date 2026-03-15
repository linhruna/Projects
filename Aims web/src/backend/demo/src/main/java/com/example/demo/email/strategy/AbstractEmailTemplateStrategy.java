package com.example.demo.email.strategy;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Abstract base class for email template strategies.
 * Provides common formatting utilities and HTML structure.
 */
public abstract class AbstractEmailTemplateStrategy implements EmailTemplateStrategy {

    protected final NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(Locale.of("vi", "VN"));
    protected final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    /**
     * Get the short order ID for display
     */
    protected String getShortOrderId(InvoiceResponseDTO invoice) {
        return invoice.getId().substring(0, 8).toUpperCase();
    }

    /**
     * Get the order access token for email links
     */
    protected String getOrderToken(InvoiceResponseDTO invoice) {
        return invoice.getOrderAccessToken() != null ? invoice.getOrderAccessToken() : invoice.getId();
    }

    /**
     * Get the customer name from delivery info
     */
    protected String getCustomerName(InvoiceResponseDTO invoice) {
        return invoice.getDeliveryInfo() != null ? invoice.getDeliveryInfo().getReceiveName() : "Quý khách";
    }

    /**
     * Build the standard email header
     */
    protected String buildHeader(String title, String headerColor) {
        return String.format(
                "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>" +
                        "<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>"
                        +
                        "<div style='background: %s; padding: 20px; border-radius: 10px; text-align: center;'>" +
                        "<h1 style='color: white; margin: 0;'>AIMS Store</h1>" +
                        "<p style='color: white; margin: 5px 0;'>%s</p>" +
                        "</div>",
                headerColor, title);
    }

    /**
     * Build the standard email footer
     */
    protected String buildFooter() {
        return "<div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;'>" +
                "<p style='color: #666; font-size: 12px;'>AIMS Store - An Internet Media Store</p>" +
                "<p style='color: #666; font-size: 12px;'>Email này được gửi tự động, vui lòng không trả lời.</p>" +
                "</div>" +
                "</body></html>";
    }

    /**
     * Build action button HTML
     */
    protected String buildActionButton(String url, String text, String bgColor) {
        return String.format(
                "<a href='%s' style='display: inline-block; background: %s; color: white; " +
                        "padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 5px;'>%s</a>",
                url, bgColor, text);
    }
}
