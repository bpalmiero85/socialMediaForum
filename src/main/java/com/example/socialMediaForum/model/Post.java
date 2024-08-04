package com.example.socialMediaForum.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;

import lombok.Setter;

@Getter
@Setter
@Entity
public class Post {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long postId;

  @ManyToOne
  @JoinColumn(name = "forum_thread_id", nullable = false)
  @JsonBackReference
  private ForumThread thread;

  private String postContent;

  private LocalDateTime postCreatedAt;

  private LocalDateTime postLastUpdatedAt;

  private int upvotes;

}
