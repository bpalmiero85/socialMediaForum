package com.example.socialMediaForum.service;



import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;


@Service
public class SessionTrackingService {

    private static final Logger logger = LoggerFactory.getLogger(SessionTrackingService.class);

    private ConcurrentHashMap<String, Long> activeSessions = new ConcurrentHashMap<>();
    private AtomicInteger activeUserCount = new AtomicInteger(0);

    public void addSession(String sessionId, Long userId) {
        activeSessions.put(sessionId, userId);
        int currentCount = activeUserCount.incrementAndGet();
        logger.info("Session added: {} | User ID: {} | Active User Count: {}", sessionId, userId, currentCount);
    }

    public void removeSession(String sessionId, Long userId) {
        Long removedUserId = activeSessions.remove(sessionId);
        if (removedUserId != null && removedUserId.equals(userId)) {
            int currentCount = activeUserCount.decrementAndGet();
            logger.info("Session removed: {} | User ID: {} | Active User Count: {}", sessionId, userId, currentCount);
        } else {
            logger.warn("Failed to remove session: {} | User ID: {}. Session might not exist or user ID mismatch.", sessionId, userId);
        }
    }

    public int getActiveSessions() {
        int currentCount = activeUserCount.get();
        logger.info("Getting Active User Count: {}", currentCount);
        return currentCount;
    }
}


