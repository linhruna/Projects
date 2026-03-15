package com.example.demo.email.strategy;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;
import org.springframework.stereotype.Component;

/**
 * Email template strategy for order confirmation emails.
 */
@Component
public class OrderConfirmationTemplate extends AbstractEmailTemplateStrategy {

    @Override
    public String getTemplateType() {
        return "ORDER_CONFIRMATION";
    }

    @Override
    public String getSubject(InvoiceResponseDTO invoice) {
        return "AIMS Store - Xác nhận đơn hàng #" + getShortOrderId(invoice);
    }

    @Override
    public String buildContent(InvoiceResponseDTO invoice, String baseUrl) {
        StringBuilder sb = new StringBuilder();

        // Header
        sb.append(buildHeader("Xác nhận đơn hàng", "linear-gradient(135deg, #A7C7E7, #C8B6FF)"));

        // Order Info
        sb.append("<div style='background: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 10px;'>");
        sb.append("<h2 style='color: #333;'>Thông tin đơn hàng</h2>");
        sb.append("<p><strong>Mã đơn hàng:</strong> #").append(getShortOrderId(invoice)).append("</p>");
        sb.append("<p><strong>Ngày đặt:</strong> ")
                .append(invoice.getCreateAt() != null ? invoice.getCreateAt().format(dateFormatter) : "N/A")
                .append("</p>");
        sb.append("<p><strong>Trạng thái:</strong> <span style='color: #f59e0b;'>Đang chờ xử lý</span></p>");
        sb.append("<p><strong>Tổng tiền:</strong> ").append(currencyFormat.format(invoice.getAmount())).append("</p>");
        sb.append("</div>");

        // Delivery Info
        if (invoice.getDeliveryInfo() != null) {
            sb.append("<div style='background: #f9f9f9; padding: 20px; margin-top: 20px; border-radius: 10px;'>");
            sb.append("<h2 style='color: #333;'>Thông tin giao hàng</h2>");
            sb.append("<p><strong>Người nhận:</strong> ").append(invoice.getDeliveryInfo().getReceiveName())
                    .append("</p>");
            sb.append("<p><strong>Số điện thoại:</strong> ").append(invoice.getDeliveryInfo().getPhoneNumber())
                    .append("</p>");
            sb.append("<p><strong>Địa chỉ:</strong> ").append(invoice.getDeliveryInfo().getDetailAddress())
                    .append("</p>");
            sb.append("<p><strong>Tỉnh/Thành phố:</strong> ").append(invoice.getDeliveryInfo().getCity())
                    .append("</p>");
            sb.append("</div>");
        }

        // Transaction Info
        if (invoice.getTransactionId() != null) {
            sb.append("<div style='background: #e8f5e9; padding: 20px; margin-top: 20px; border-radius: 10px;'>");
            sb.append("<h2 style='color: #2e7d32;'>Thông tin giao dịch</h2>");
            sb.append("<p><strong>Mã giao dịch:</strong> ").append(invoice.getTransactionId()).append("</p>");
            sb.append("<p><strong>Nội dung:</strong> ").append(invoice.getTransactionContent()).append("</p>");
            sb.append("<p><strong>Thời gian:</strong> ")
                    .append(invoice.getTransactionDateTime() != null
                            ? invoice.getTransactionDateTime().format(dateFormatter)
                            : "N/A")
                    .append("</p>");
            sb.append("</div>");
        }

        // Action Links
        String orderToken = getOrderToken(invoice);
        sb.append("<div style='text-align: center; margin-top: 30px;'>");
        sb.append(buildActionButton(baseUrl + "/order/public/" + orderToken, "Xem đơn hàng",
                "linear-gradient(135deg, #A7C7E7, #7EA8D1)"));
        sb.append(buildActionButton(baseUrl + "/order/public/" + orderToken + "/cancel", "Hủy đơn hàng", "#ef4444"));
        sb.append("</div>");

        // Footer
        sb.append(buildFooter());

        return sb.toString();
    }
}
