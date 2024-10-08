package com.example.socialMediaForum.controller;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.multipart.MultipartFile;

import com.example.socialMediaForum.model.User;
import com.example.socialMediaForum.service.FileStorageService;
import com.example.socialMediaForum.service.SessionTrackingService;
import com.example.socialMediaForum.service.UserServiceImpl;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.UUID;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserServiceImpl userServiceImpl;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SessionTrackingService sessionTrackingService;

    @Autowired
    private FileStorageService fileStorageService;

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
            return ResponseEntity.status(500).body("An internal server error occurred.");
        }
    }

    @PostMapping("/uploadProfilePicture")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @RequestParam("username") String username) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is missing"));
            }

            User user = userServiceImpl.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            String fileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();
            String filePath = fileStorageService.getUploadDir() + fileName;
            file.transferTo(new File(filePath));

            user.setProfilePicture(fileName);
            userServiceImpl.save(user);

            return ResponseEntity.ok(Map.of("profilePicture", fileName));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "File upload failed: " + e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Server error: " + e.getMessage()));
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

            String redirectUrl = "http://localhost:3000/homepage?username=" + user.getUsername();
            return ResponseEntity.status(302).header("Location", redirectUrl).body(null);

        } catch (Exception e) {
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
                return ResponseEntity.ok("Login successful");
            } else {
                return ResponseEntity.status(401).body("Invalid username or password");
            }
        } catch (Exception e) {
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
                }
            }
            return ResponseEntity.ok("Logged out");
        } catch (Exception e) {
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
            return ResponseEntity.status(500).body("An internal server error occurred.");
        }
    }

    @GetMapping("/active-users")
    public ResponseEntity<Integer> getActiveUsers(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session != null) {
                Long userId = (Long) session.getAttribute("userId");
            }
            int activeUsers = sessionTrackingService.getActiveSessions();
            return ResponseEntity.ok(activeUsers);
        } catch (Exception e) {
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
            return ResponseEntity.status(500).body("An internal server error occurred.");
        }
    }
}
