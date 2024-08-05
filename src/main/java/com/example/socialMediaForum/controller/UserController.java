package com.example.socialMediaForum.controller;


import jakarta.persistence.Column;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.socialMediaForum.model.User;
import com.example.socialMediaForum.service.SessionTrackingService;
import com.example.socialMediaForum.service.UserServiceImpl;

import java.io.UnsupportedEncodingException;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserServiceImpl userServiceImpl;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SessionTrackingService sessionTrackingService;

    @PostMapping("/register")
    public ResponseEntity<String> signup(HttpServletRequest request, @RequestBody User user)
            throws UnsupportedEncodingException {
        try {
            if (user.getUsername() == null || user.getUsername().isEmpty() ||
                    user.getPassword() == null || user.getPassword().isEmpty() ||
                    user.getEmail() == null || user.getEmail().isEmpty() ||
                    user.getFirstName() == null || user.getFirstName().isEmpty() ||
                    user.getLastName() == null || user.getLastName().isEmpty()) {
                return ResponseEntity.badRequest().body("All fields must be provided");
            }
            if (userServiceImpl.findByUsername(user.getUsername()) != null) {
                return ResponseEntity.badRequest().body("Username already exists");
            }
            if (userServiceImpl.findByEmail(user.getEmail()) != null) {
                return ResponseEntity.badRequest().body("Email already exists");
            }
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setVerificationCode(UUID.randomUUID().toString());
            userServiceImpl.save(user);

            String siteURL = "http://localhost:8080";
            userServiceImpl.sendVerificationEmail(user, siteURL);

            return ResponseEntity.ok("Please check your email to verify your account.");
        } catch (Exception e) {
            logger.error("Error during user registration: ", e);
            return ResponseEntity.status(500).body("An internal server error occurred.");
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyUser(HttpServletRequest request, @RequestParam("code") String code) {
        try {
            User user = userServiceImpl.findByVerificationCode(code);
            if (user == null || user.isEnabled()) {
                return ResponseEntity.badRequest().body("Invalid verification code or account already verified.");
            }
            user.setEnabled(true);
            user.setVerificationCode(null);
            userServiceImpl.save(user);

            HttpSession session = request.getSession(true);
            session.setAttribute("userId", user.getId());
            sessionTrackingService.addSession(session.getId(), user.getId());

            logger.info("User verified and logged in: {}", user.getId());

            String redirectUrl = "http://localhost:3000/welcome?username=" + user.getUsername();
            return ResponseEntity.status(302).header("Location", redirectUrl).build();

        } catch (Exception e) {
            logger.error("Error during user verification: ", e);
            return ResponseEntity.status(500).body("An internal server error occurred.");
        }
    }

    @GetMapping("/verify-status")
    public ResponseEntity<?> checkVerificationStatus(@RequestParam("username") String username) {
        try {
            User user = userServiceImpl.findByUsername(username);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error checking verification status: ", e);
            return ResponseEntity.status(500).body("An internal server error occurred.");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(HttpServletRequest request, @RequestBody User loginUser) {
        try {
            if (loginUser.getUsername() == null || loginUser.getUsername().isEmpty() ||
                    loginUser.getPassword() == null || loginUser.getPassword().isEmpty()) {
                return ResponseEntity.badRequest().body("Username and password must be provided");
            }

            User user = userServiceImpl.findByUsername(loginUser.getUsername());
            if (user != null && !user.isEnabled()) {
                return ResponseEntity.status(403).body("Account not verified. Please check your email.");
            }

            if (userServiceImpl.verifyUserCredentials(loginUser.getUsername(), loginUser.getPassword())) {
                HttpSession session = request.getSession(true);
                session.setAttribute("userId", user.getId());
                sessionTrackingService.addSession(session.getId(), user.getId());
                logger.info("User logged in: {}", user.getId());
                return ResponseEntity.ok("Login successful");
            } else {
                return ResponseEntity.status(401).body("Invalid username or password");
            }
        } catch (Exception e) {
            logger.error("Error during login: ", e);
            return ResponseEntity.status(500).body("An internal server error occurred.");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                Long userId = (Long) session.getAttribute("userId");
                if (userId != null) {
                    sessionTrackingService.removeSession(session.getId(), userId);
                    session.invalidate();
                    logger.info("User logged out: {}", userId);
                } else {
                    logger.warn("User ID not found in session: {}", session.getId());
                }
            } else {
                logger.warn("No session found for logout.");
            }
            return ResponseEntity.ok("Logged out");
        } catch (Exception e) {
            logger.error("Error during logout: ", e);
            return ResponseEntity.status(500).body("An internal server error occurred.");
        }
    }

    @GetMapping("/userinfo")
    public ResponseEntity<?> userInfo(@RequestParam(required = false) String username) {
        try {
            if (username == null || username.isEmpty()) {
                return ResponseEntity.badRequest().body("Username parameter is missing");
            }
            User user = userServiceImpl.findByUsername(username);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            logger.error("Error fetching user info: ", e);
            return ResponseEntity.status(500).body("An internal server error occurred.");
        }
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody User user) {
        try {
            if (user.getUsername() == null || user.getUsername().isEmpty() ||
                    user.getEmail() == null || user.getEmail().isEmpty() ||
                    user.getFirstName() == null || user.getFirstName().isEmpty() ||
                    user.getLastName() == null || user.getLastName().isEmpty()) {
                return ResponseEntity.badRequest().body("All fields must be provided");
            }
            User existingUser = userServiceImpl.findByUsername(user.getUsername());
            if (existingUser == null) {
                return ResponseEntity.notFound().build();
            }
            existingUser.setFirstName(user.getFirstName());
            existingUser.setLastName(user.getLastName());
            existingUser.setEmail(user.getEmail());
            userServiceImpl.save(existingUser);
            return ResponseEntity.ok(existingUser);
        } catch (Exception e) {
            logger.error("Error updating user: ", e);
            return ResponseEntity.status(500).body("An internal server error occurred.");
        }
    }

    @GetMapping("/active-users")
    public ResponseEntity<Integer> getActiveUsers(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                Long userId = (Long) session.getAttribute("userId");
                logger.info("Fetch active user: username = {}", userId);
            }
            int activeUsers = sessionTrackingService.getActiveSessions();
            logger.info("Active users count: {}", activeUsers);
            return ResponseEntity.ok(activeUsers);
        } catch (Exception e) {
            logger.error("Error fetching active users: ", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUserById(@PathVariable Long id) {
        try {
            User user = userServiceImpl.findUserById(id);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            userServiceImpl.deleteUserById(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting user: ", e);
            return ResponseEntity.status(500).body("An internal server error occurred.");
        }
    }
}
