package com.auction.api.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class AuctionWebSocketHandler extends TextWebSocketHandler {

    private final Map<String, Set<WebSocketSession>> auctionRooms = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        System.out.println("WebSocket connection established: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            Map<?, ?> payload = objectMapper.readValue(message.getPayload(), Map.class);
            String action = (String) payload.get("action");
            String auctionId = (String) payload.get("auctionId");

            if (action == null || auctionId == null) {
                return;
            }

            if ("join".equalsIgnoreCase(action)) {
                auctionRooms.computeIfAbsent(auctionId, k -> new CopyOnWriteArraySet<>()).add(session);
                System.out.println("Session " + session.getId() + " joined auction room: " + auctionId);
            } else if ("leave".equalsIgnoreCase(action)) {
                Set<WebSocketSession> sessions = auctionRooms.get(auctionId);
                if (sessions != null) {
                    sessions.remove(session);
                }
                System.out.println("Session " + session.getId() + " left auction room: " + auctionId);
            }
        } catch (Exception e) {
            System.err.println("Error parsing WebSocket text message: " + e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        // Clean up session from all rooms
        auctionRooms.values().forEach(sessions -> sessions.remove(session));
        System.out.println("WebSocket connection closed: " + session.getId());
    }

    public void broadcastToRoom(String auctionId, String event, Object data) {
        Set<WebSocketSession> sessions = auctionRooms.get(auctionId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", event);
            payload.put("data", data);
            String json = objectMapper.writeValueAsString(payload);
            TextMessage message = new TextMessage(json);

            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    try {
                        session.sendMessage(message);
                    } catch (IOException e) {
                        System.err.println("Failed to send message to session " + session.getId() + ": " + e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to serialize broadcast payload: " + e.getMessage());
        }
    }
}
