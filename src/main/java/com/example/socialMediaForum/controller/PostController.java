package com.example.socialMediaForum.controller;

import com.example.socialMediaForum.model.ForumThread;
import com.example.socialMediaForum.model.Post;
import com.example.socialMediaForum.service.PostService;
import com.example.socialMediaForum.service.ThreadService;
import com.example.socialMediaForum.service.UserService;

import com.example.socialMediaForum.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

  @Autowired
  private ThreadService threadService;

  @Autowired
  private UserService userService;

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
  public ResponseEntity<Post> createComment(@RequestParam Long threadId,
      @RequestParam String username,
      @RequestBody Post post) {

    ForumThread thread = threadService.getThreadById(threadId).orElse(null);
    if (thread == null) {
      return ResponseEntity.badRequest().build();
    }

    User user = userService.findByUsername(username);
    if (user == null) {
      return ResponseEntity.badRequest().build();
    }

    post.setUser(user);
    post.setThread(thread);

    Post savedPost = postService.save(post);

    messagingTemplate.convertAndSend("/topic/comments/" + threadId, savedPost);

    int updatedCommentCount = postService.getAllPostsByThreadId(threadId).size();
    messagingTemplate.convertAndSend("/topic/comments/count/" + threadId, updatedCommentCount);

    return ResponseEntity.ok(savedPost);
  }

  @PostMapping("/{postId}/upvotes")
  public ResponseEntity<Post> upvotePost(@PathVariable Long postId) {
    Optional<Post> optionalPost = postService.getPostById(postId);

    if (optionalPost.isPresent()) {
      Post post = optionalPost.get();
      post.setPostUpvotes(post.getPostUpvotes() + 1);

      Post updatedPost = postService.saveWithoutUpdatingTimeStamp(post);

      messagingTemplate.convertAndSend("/topic/comments/upvoted/" + post.getThread().getForumThreadId(), updatedPost);

      return ResponseEntity.ok(updatedPost);
    }
    return ResponseEntity.notFound().build();
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
  public ResponseEntity<Void> deletePost(@PathVariable Long postId, @RequestParam String username) {
    Optional<Post> optionalPost = postService.getPostById(postId);
    if (optionalPost.isPresent()) {
      Post post = optionalPost.get();
      ForumThread forumThread = post.getThread();

      if (!post.getUser().getUsername().equals(username)) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
      }

      postService.deletePost(postId);

      messagingTemplate.convertAndSend("/topic/threads", forumThread);

      messagingTemplate.convertAndSend("/topic/comments/deleted/" + forumThread.getForumThreadId(), postId);

      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.badRequest().build();
  }
}
