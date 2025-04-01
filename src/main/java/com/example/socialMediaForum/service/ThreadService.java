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

  @Autowired
  private PostService postService;

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

  public ForumThread createThread(ForumThread forumThread, String username, String profilePicture) {
    User user = userRepository.findByUsername(username);
    if(user == null){
      throw new IllegalArgumentException("User not found");
    }
    forumThread.setUser(user);
    forumThread.setProfilePicture(user.getProfilePicture());
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

  public Optional<ForumThread> getThreadById(Long forumThreadId) {
    return forumThreadRepository.findById(forumThreadId);
  }

  public ForumThread save(ForumThread forumThread) {
    forumThread.setCreatedAt(LocalDateTime.now());
    return forumThreadRepository.save(forumThread);
  }

  public ForumThread saveWithoutUpdatingTimeStamp(ForumThread forumThread) {
    return forumThreadRepository.save(forumThread);
  }

  public List<ForumThread> getAllThreadsWithCommentCounts() {
    List<ForumThread> threads = forumThreadRepository.findAll();

    for(ForumThread thread : threads){
      int commentCount = postService.getAllPostsByThreadId(thread.getForumThreadId()).size();
      thread.setCommentCount(commentCount);
    }

    return threads;
  }

}
