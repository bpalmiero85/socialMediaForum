package com.example.socialMediaForum.model;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class UserSession {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private String sessionId;

  private Long userId;

  private LocalDateTime lastAccessed;
}
