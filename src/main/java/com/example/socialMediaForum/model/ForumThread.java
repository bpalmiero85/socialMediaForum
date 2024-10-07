package com.example.socialMediaForum.model;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
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

  @ManyToOne
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  private int threadUpvotes;

  private int comments;

  private String title;

  private String content;

  private LocalDateTime createdAt;

  private LocalDateTime lastUpdatedAt;

  @Column(name = "profile_picture")
  private String profilePicture;

  @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference
  private List<Post> posts;

}
