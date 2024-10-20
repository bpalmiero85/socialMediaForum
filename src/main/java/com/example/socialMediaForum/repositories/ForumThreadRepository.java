package com.example.socialMediaForum.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.socialMediaForum.model.ForumThread;
import java.util.List;

public interface ForumThreadRepository extends JpaRepository<ForumThread, Long> {
  // List<ForumThread> findByThread_ForumThreadId(Long forumThreadId);
  List<ForumThread> findByUser_Id(Long userId);
}
