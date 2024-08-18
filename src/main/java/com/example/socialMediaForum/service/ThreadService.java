package com.example.socialMediaForum.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.example.socialMediaForum.model.ForumThread;
import com.example.socialMediaForum.model.User;
import com.example.socialMediaForum.repositories.ForumThreadRepository;
import com.example.socialMediaForum.repositories.UserRepository;

@Service
public class ThreadService {
  @Autowired
  private ForumThreadRepository forumThreadRepository;

  @Autowired
  private UserRepository userRepository;

  public List<ForumThread> getAllThreads() {
    return forumThreadRepository.findAll();
  }

  public boolean deleteForumThread(Long forumThreadId) {
    Optional<ForumThread> optionalForumThread = forumThreadRepository.findById(forumThreadId);
    if (optionalForumThread.isPresent()) {
      forumThreadRepository.delete(optionalForumThread.get());
      return true;
    }
    return false;
  }

  public ForumThread createThread(ForumThread forumThread, String username) {
    User user = userRepository.findByUsername(username);
    forumThread.setUser(user);
    forumThread.setCreatedAt(LocalDateTime.now());
    return forumThreadRepository.save(forumThread);
  }

  public ForumThread updateForumThread(ForumThread forumThreadDetails, Long forumThreadId) {
    Optional<ForumThread> optionalThread = forumThreadRepository.findById(forumThreadId);
    if (optionalThread.isPresent()) {
      ForumThread existingForumThread = optionalThread.get();
      existingForumThread.setTitle(forumThreadDetails.getTitle());
      existingForumThread.setContent(forumThreadDetails.getContent());
      existingForumThread.setLastUpdatedAt(LocalDateTime.now());

      return forumThreadRepository.save(existingForumThread);
    } else {
      try {
        throw new Exception("Post not found with id " + forumThreadId);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    return forumThreadDetails;

  }

  public ForumThread getThreadById(Long forumThreadId) {
    Optional<ForumThread> thread = forumThreadRepository.findById(forumThreadId);
    return thread.orElse(null);
  }

  public ForumThread save(ForumThread forumThread) {
    forumThread.setCreatedAt(LocalDateTime.now());
    return forumThreadRepository.save(forumThread);
  }

}
