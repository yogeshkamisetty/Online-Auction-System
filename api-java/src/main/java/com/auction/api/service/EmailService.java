package com.auction.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${resend.api.key:}")
    private String resendApiKey;

    public void sendEmail(String to, String subject, String html) {
        if (resendApiKey == null || resendApiKey.isEmpty()) {
            System.out.println("\n================== [EMAIL SIMULATION] ==================");
            System.out.println("To:      " + to);
            System.out.println("Subject: " + subject);
            System.out.println("Body:");
            System.out.println(html);
            System.out.println("========================================================\n");
            return;
        }

        // Resend integration could be done using a REST client (e.g. WebClient or RestTemplate)
        // For simulation, we will log it.
        System.out.println("[Resend Integration API Key Provided]: Email to " + to + " queued (Simulated).");
    }
}
