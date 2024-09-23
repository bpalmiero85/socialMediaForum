package com.example.socialMediaForum.controller;

import com.example.socialMediaForum.model.ForumThread;
import com.example.socialMediaForum.model.Post;
import com.example.socialMediaForum.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/posts")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PostController {

  @Autowired
  private PostService postService;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @GetMapping("/thread/{forumThreadId}")
  public List<Post> getAllPostsByThreadId(@PathVariable Long forumThreadId) {
    return postService.getAllPostsByThreadId(forumThreadId);
  }

  @GetMapping("/{postId}")
  public ResponseEntity<Post> getPostById(@PathVariable Long postId) {
    Optional<Post> post = postService.getPostById(postId);
    return post.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public ResponseEntity<Post> createPost(@RequestBody Post post, @RequestParam String username,
      @RequestParam(required = false) String profilePicture) {
    try {
      Post newPost = postService.createPost(post, username, profilePicture);

      if (newPost.getThread() == null || newPost.getThread().getForumThreadId() == null) {
        return ResponseEntity.badRequest().body(null);
      }

      messagingTemplate.convertAndSend("/topic/comments/" + newPost.getThread().getForumThreadId(), newPost);

      ForumThread updatedThread = newPost.getThread();
      updatedThread.setComments(updatedThread.getComments() + 1);
      messagingTemplate.convertAndSend("/topic/threads", updatedThread);

      return ResponseEntity.ok(newPost);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(null);
    }
  }

  @PutMapping("/{postId}")
  public ResponseEntity<Post> updatePost(@PathVariable Long postId,
      @RequestBody Post postDetails) {
    Post updatedPost = postService.updatePost(postDetails, postId);
    if (updatedPost == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(updatedPost);
  }

  @DeleteMapping("/{postId}")
  public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
    boolean isDeleted = postService.deletePost(postId);
    if (!isDeleted) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.noContent().build();
  }
}
