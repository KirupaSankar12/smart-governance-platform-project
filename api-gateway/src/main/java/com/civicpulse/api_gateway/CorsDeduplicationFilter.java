package com.civicpulse.api_gateway;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collection;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class CorsDeduplicationFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        chain.doFilter(request, response);

        if (response instanceof HttpServletResponse httpResponse) {
            deduplicateHeader(httpResponse, "Access-Control-Allow-Origin");
            deduplicateHeader(httpResponse, "Access-Control-Allow-Credentials");
            deduplicateHeader(httpResponse, "Access-Control-Allow-Methods");
            deduplicateHeader(httpResponse, "Access-Control-Allow-Headers");
        }
    }

    private void deduplicateHeader(HttpServletResponse response, String headerName) {
        Collection<String> headers = response.getHeaders(headerName);
        if (headers != null && !headers.isEmpty()) {
            String firstVal = headers.iterator().next();
            if (firstVal != null && firstVal.contains(",")) {
                firstVal = firstVal.split(",")[0].trim();
            }
            response.setHeader(headerName, firstVal);
        }
    }
}
