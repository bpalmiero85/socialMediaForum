package com.example.socialMediaForum.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Entity
public class ForumThread {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long forumThreadId;

  private String title;

  private String content;

  private LocalDateTime createdAt;

  private LocalDateTime lastUpdatedAt;

  @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Post> posts;

  public Long getForumThreadId() {
    return forumThreadId;
  }


}
