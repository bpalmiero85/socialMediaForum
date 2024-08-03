package com.example.socialMediaForum.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.socialMediaForum.model.ForumThread;
import com.example.socialMediaForum.service.ThreadService;

@RestController
@RequestMapping("/threads")
public class ForumThreadController {
  @Autowired
  private ThreadService threadService;

  @GetMapping
  public List<ForumThread> getAllThreads() {
    return threadService.getAllThreads();
  }

  @GetMapping("/{forumThreadId}")
  public ResponseEntity<ForumThread> getThreadById(@PathVariable Long forumThreadId) {
    ForumThread forumThread = threadService.getThreadById(forumThreadId);
    if (forumThread == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(forumThread);
  }

  @PostMapping
  public ForumThread createThread(@RequestBody ForumThread forumThread) {
    return threadService.save(forumThread);
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
