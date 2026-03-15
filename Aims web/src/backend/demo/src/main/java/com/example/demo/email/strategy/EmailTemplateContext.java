package com.example.demo.email.strategy;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Context class for Email Template Strategy Pattern.
 * This class is responsible for selecting the appropriate email template
 * strategy
 * based on the template type.
 */
@Component
public class EmailTemplateContext {

    private final Map<String, EmailTemplateStrategy> templates;
    private final List<EmailTemplateStrategy> templateList;

    public EmailTemplateContext(List<EmailTemplateStrategy> templates) {
        this.templateList = templates;
        this.templates = templates.stream()
                .collect(Collectors.toMap(
                        t -> t.getTemplateType().toUpperCase(Locale.ENGLISH),
                        t -> t,
                        (existing, replacement) -> existing));
    }

    /**
     * Get a specific email template strategy by type
     * 
     * @param templateType the template type identifier (e.g., "ORDER_CONFIRMATION")
     * @return the email template strategy
     * @throws IllegalArgumentException if template type is not supported
     */
    public EmailTemplateStrategy getTemplate(String templateType) {
        String key = templateType == null ? "" : templateType.toUpperCase(Locale.ENGLISH);
        EmailTemplateStrategy template = templates.get(key);

        if (template == null) {
            throw new IllegalArgumentException("Unsupported email template type: " + templateType);
        }

        return template;
    }

    /**
     * Check if a template type is supported
     * 
     * @param templateType the template type identifier
     * @return true if the template type is supported
     */
    public boolean isSupported(String templateType) {
        String key = templateType == null ? "" : templateType.toUpperCase(Locale.ENGLISH);
        return templates.containsKey(key);
    }

    /**
     * Get all available template types
     * 
     * @return list of template type names
     */
    public List<String> getAvailableTemplates() {
        return templateList.stream()
                .map(EmailTemplateStrategy::getTemplateType)
                .collect(Collectors.toList());
    }
}
