package com.example.socialMediaForum.service;

import com.example.socialMediaForum.model.User;
import com.example.socialMediaForum.repositories.UserRepository;

import java.io.UnsupportedEncodingException;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserServiceImpl implements UserService {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
  private JavaMailSender mailSender;

  private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

  @Override
  public User findByUsername(String username) {
    return userRepository.findByUsername(username);
  }

  @Override
  public User save(User user) {
    return userRepository.save(user);
  }

  @Override
  public User findUserById(Long id) {
    return userRepository.findById(id).orElse(null);
  }

  @Override
  public void deleteUserById(Long id) {
    userRepository.deleteById(id);
  }

  public User updateUser(User user) {
    return userRepository.save(user);
  }

  @Override
  public boolean verifyUserCredentials(String username, String password) {
    User user = findByUsername(username);
    if (user != null && !user.getUsername().isBlank()) {
      return passwordEncoder.matches(password, user.getPassword());
    }
    return false;
  }

  public User findByEmail(String email) {
    return userRepository.findByEmail(email);
  }

  public User findByVerificationCode(String code) {
    return userRepository.findByVerificationCode(code);
  }

  public void sendVerificationEmail(User user, String siteURL) throws UnsupportedEncodingException {
    String subject = "Please verify your registration";
    String senderName = "Brian's App";
    String mailContent = "<p>Dear " + user.getFirstName() + ",</p>";
    mailContent += "<p>Please click the link below to verify your registration:</p>";
    String verifyURL = siteURL + "/user/verify?code=" + user.getVerificationCode() + "&username=" + user.getUsername();
    mailContent += "<h3><a href=\"" + verifyURL + "\">VERIFY</a></h3>";
    mailContent += "<p>Thank you,<br>Brian's Application</p>";

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message);

      helper.setFrom("devtestersemail@gmail.com", senderName);
      helper.setTo(user.getEmail());
      helper.setSubject(subject);
      helper.setText(mailContent, true);

      mailSender.send(message);
    } catch (MessagingException e) {
      logger.error("Error sending email: ", e);
      throw new RuntimeException("Failed to send verification email");
    }
  }

}
