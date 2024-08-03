package com.example.socialMediaForum.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.socialMediaForum.model.Post;

public interface PostRepository extends JpaRepository<Post, Long> {
  
}
