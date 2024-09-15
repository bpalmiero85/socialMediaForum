package com.example.socialMediaForum.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.socialMediaForum.model.ForumThread;
import com.example.socialMediaForum.service.ThreadService;

@RestController
@RequestMapping("/threads")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ForumThreadController {
  @Autowired
  private ThreadService threadService;

  @GetMapping(produces = "application/json")
  public ResponseEntity<List<ForumThread>> getAllThreads() {
    List<ForumThread> threads = threadService.getAllThreads();
    return ResponseEntity.ok().body(threads);
  }

  @GetMapping("/{forumThreadId}")
  public ResponseEntity<ForumThread> getThreadById(@PathVariable Long forumThreadId) {
    ForumThread forumThread = threadService.getThreadById(forumThreadId);
    if (forumThread == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(forumThread);
  }

  @PostMapping(produces = "application/json")
  public ResponseEntity<?> createThread(@RequestBody ForumThread forumThread, @RequestParam String username, @RequestParam(required = false) String profilePicture) {
    try {
      if (forumThread == null || forumThread.getTitle() == null || forumThread.getContent() == null) {
        return ResponseEntity.badRequest().body("Title and content must be provided");
      }
      ForumThread savedThread = threadService.createThread(forumThread, username, profilePicture != null ? profilePicture : "");
      return ResponseEntity.ok(savedThread);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("An internal server error occurred.");
    }
  }

  @PutMapping("/{forumThreadId}")
  public ResponseEntity<ForumThread> updateThread(@PathVariable Long forumThreadId,
      @RequestBody ForumThread forumThreadDetails) {
    ForumThread updatedThread = threadService.updateForumThread(forumThreadDetails, forumThreadId);
    if (updatedThread == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(updatedThread);
  }

  @DeleteMapping("/{forumThreadId}")
  public ResponseEntity<Void> deleteThread(@PathVariable Long forumThreadId) {
    boolean isDeleted = threadService.deleteForumThread(forumThreadId);
    if (!isDeleted) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.noContent().build();
  }
}
