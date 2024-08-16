package com.example.socialMediaForum.model;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Getter
@Setter
@Entity
public class ForumThread {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long forumThreadId;

  private int comments;

  private String title;

  private String content;

  private LocalDateTime createdAt;

  private LocalDateTime lastUpdatedAt;

  @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference
  private List<Post> posts;


}
