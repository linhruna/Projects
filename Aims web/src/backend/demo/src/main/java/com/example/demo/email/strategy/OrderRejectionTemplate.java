package com.example.demo.email.strategy;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;
import org.springframework.stereotype.Component;

/**
 * Email template strategy for order rejection emails.
 */
@Component
public class OrderRejectionTemplate extends AbstractEmailTemplateStrategy {

    @Override
    public String getTemplateType() {
        return "ORDER_REJECTION";
    }

    @Override
    public String getSubject(InvoiceResponseDTO invoice) {
        return "AIMS Store - Đơn hàng #" + getShortOrderId(invoice) + " đã bị từ chối";
    }

    @Override
    public String buildContent(InvoiceResponseDTO invoice, String baseUrl) {
        StringBuilder sb = new StringBuilder();

        // Header
        sb.append(buildHeader("Đơn hàng bị từ chối", "#ef4444"));

        // Content
        sb.append("<div style='background: #fef2f2; padding: 20px; margin-top: 20px; border-radius: 10px;'>");
        sb.append("<p>Xin chào <strong>").append(getCustomerName(invoice)).append("</strong>,</p>");
        sb.append("<p>Chúng tôi rất tiếc phải thông báo rằng đơn hàng <strong>#")
                .append(getShortOrderId(invoice))
                .append("</strong> của bạn đã bị từ chối.</p>");

        if (invoice.getRejectionReason() != null) {
            sb.append("<p><strong>Lý do:</strong> ").append(invoice.getRejectionReason()).append("</p>");
        }

        sb.append("<p>Số tiền <strong>").append(currencyFormat.format(invoice.getAmount())).append(
                "</strong> sẽ được hoàn trả về phương thức thanh toán của bạn trong vòng 3-5 ngày làm việc.</p>");
        sb.append("</div>");

        // Action button
        String orderToken = getOrderToken(invoice);
        sb.append("<div style='text-align: center; margin-top: 30px;'>");
        sb.append(buildActionButton(baseUrl + "/order/public/" + orderToken, "Xem chi tiết",
                "linear-gradient(135deg, #A7C7E7, #7EA8D1)"));
        sb.append("</div>");

        // Footer
        sb.append(buildFooter());

        return sb.toString();
    }
}
