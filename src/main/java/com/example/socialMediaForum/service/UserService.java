package com.example.socialMediaForum.service;

import com.example.socialMediaForum.model.User;

public interface UserService {
  User findByUsername(String username);

  User findUserById(Long id);

  User save(User user);

  boolean verifyUserCredentials(String username, String password);

  void deleteUserById(Long id);
}
