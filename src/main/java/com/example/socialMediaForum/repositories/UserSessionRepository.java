package com.example.socialMediaForum.repositories;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.socialMediaForum.model.UserSession;

public interface UserSessionRepository extends JpaRepository<UserSession, String> {
  
}

