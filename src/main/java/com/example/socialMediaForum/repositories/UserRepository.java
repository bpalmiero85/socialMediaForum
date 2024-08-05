package com.example.socialMediaForum.repositories;

import com.example.socialMediaForum.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  User findByUsername(String username);

  User findByEmail(String email);

  User findByVerificationCode(String code);
}
