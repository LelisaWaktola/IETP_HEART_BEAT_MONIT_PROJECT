package com.heartmonitor.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartmonitor.entity.Measurement;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketHandler extends TextWebSocketHandler {

    private static final CopyOnWriteArrayList<WebSocketSession> sessions =
            new CopyOnWriteArrayList<>();

    private final ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session)
            throws Exception {

        sessions.add(session);
        log.info("WebSocket connected: {}", session.getId());
    }

    @Override
    public void afterConnectionClosed(
            WebSocketSession session,
            CloseStatus status
    ) throws Exception {

        sessions.remove(session);
        log.info("WebSocket disconnected: {}", session.getId());
    }

    public void sendAlert(Measurement measurement) {

        try {
            String message =
                    objectMapper.writeValueAsString(measurement);

            TextMessage textMessage =
                    new TextMessage(message);

            for (WebSocketSession session : sessions) {

                if (session.isOpen()) {
                    session.sendMessage(textMessage);
                }
            }

        } catch (IOException e) {
            log.error("Error sending alert", e);
        }
    }
}