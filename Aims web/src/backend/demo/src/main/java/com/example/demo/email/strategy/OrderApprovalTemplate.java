package com.example.demo.email.strategy;

import com.example.demo.orders.dto.response.InvoiceResponseDTO;
import org.springframework.stereotype.Component;

/**
 * Email template strategy for order approval emails.
 */
@Component
public class OrderApprovalTemplate extends AbstractEmailTemplateStrategy {

    @Override
    public String getTemplateType() {
        return "ORDER_APPROVAL";
    }

    @Override
    public String getSubject(InvoiceResponseDTO invoice) {
        return "AIMS Store - Đơn hàng #" + getShortOrderId(invoice) + " đã được duyệt";
    }

    @Override
    public String buildContent(InvoiceResponseDTO invoice, String baseUrl) {
        StringBuilder sb = new StringBuilder();

        // Header
        sb.append(buildHeader("Đơn hàng đã được duyệt!", "linear-gradient(135deg, #22c55e, #16a34a)"));

        // Content
        sb.append("<div style='background: #f0fdf4; padding: 20px; margin-top: 20px; border-radius: 10px;'>");
        sb.append("<p>Xin chào <strong>").append(getCustomerName(invoice)).append("</strong>,</p>");
        sb.append("<p>Đơn hàng <strong>#").append(getShortOrderId(invoice))
                .append("</strong> của bạn đã được duyệt và đang được chuẩn bị giao hàng.</p>");
        sb.append("<p>Chúng tôi sẽ liên hệ với bạn khi đơn hàng được giao.</p>");
        sb.append("</div>");

        // Action button
        String orderToken = getOrderToken(invoice);
        sb.append("<div style='text-align: center; margin-top: 30px;'>");
        sb.append(buildActionButton(baseUrl + "/order/public/" + orderToken, "Xem đơn hàng",
                "linear-gradient(135deg, #A7C7E7, #7EA8D1)"));
        sb.append("</div>");

        // Footer
        sb.append(buildFooter());

        return sb.toString();
    }
}
