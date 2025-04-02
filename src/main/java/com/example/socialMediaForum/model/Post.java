package com.example.socialMediaForum.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
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
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne
  @JoinColumn(name = "forum_thread_id", nullable = false)
  @JsonBackReference
  private ForumThread thread;

  @Lob
  @Column(columnDefinition = "CLOB")
  private String postContent;

  private LocalDateTime postCreatedAt;

  private LocalDateTime postLastUpdatedAt;

  @Column(name = "profile_picture")
  private String profilePicture;

  private int postUpvotes;

}
