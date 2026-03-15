package com.example.demo.email.strategy;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;
import org.springframework.stereotype.Component;

/**
 * Email template strategy for order cancellation emails.
 */
@Component
public class OrderCancellationTemplate extends AbstractEmailTemplateStrategy {

    @Override
    public String getTemplateType() {
        return "ORDER_CANCELLATION";
    }

    @Override
    public String getSubject(InvoiceResponseDTO invoice) {
        return "AIMS Store - Đơn hàng #" + getShortOrderId(invoice) + " đã được hủy";
    }

    @Override
    public String buildContent(InvoiceResponseDTO invoice, String baseUrl) {
        StringBuilder sb = new StringBuilder();

        // Header
        sb.append(buildHeader("Xác nhận hủy đơn hàng", "#6b7280"));

        // Content
        sb.append("<div style='background: #f3f4f6; padding: 20px; margin-top: 20px; border-radius: 10px;'>");
        sb.append("<p>Xin chào <strong>").append(getCustomerName(invoice)).append("</strong>,</p>");
        sb.append("<p>Đơn hàng <strong>#").append(getShortOrderId(invoice))
                .append("</strong> đã được hủy theo yêu cầu của bạn.</p>");

        if (invoice.getCancellationReason() != null) {
            sb.append("<p><strong>Lý do:</strong> ").append(invoice.getCancellationReason()).append("</p>");
        }

        sb.append("<p>Số tiền <strong>").append(currencyFormat.format(invoice.getAmount())).append(
                "</strong> sẽ được hoàn trả về phương thức thanh toán của bạn trong vòng 3-5 ngày làm việc.</p>");
        sb.append("</div>");

        // Action button
        sb.append("<div style='text-align: center; margin-top: 30px;'>");
        sb.append(buildActionButton(baseUrl, "Tiếp tục mua sắm", "linear-gradient(135deg, #A7C7E7, #7EA8D1)"));
        sb.append("</div>");

        // Footer
        sb.append(buildFooter());

        return sb.toString();
    }
}
