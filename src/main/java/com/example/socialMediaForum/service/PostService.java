package com.example.socialMediaForum.service;

import com.example.socialMediaForum.model.ForumThread;
import com.example.socialMediaForum.model.Post;
import com.example.socialMediaForum.model.User;
import com.example.socialMediaForum.repositories.ForumThreadRepository;
import com.example.socialMediaForum.repositories.PostRepository;
import com.example.socialMediaForum.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

  @Autowired
  private PostRepository postRepository;

  @Autowired
  private ForumThreadRepository forumThreadRepository;

  @Autowired
  private UserRepository userRepository;

  public List<Post> getAllPostsByThreadId(Long userId) {
    return postRepository.findByUserId(userId);
  }

  public Post createPost(@RequestBody Post post, @RequestParam String username, @RequestParam String profilePicture) {

    ForumThread forumThread = forumThreadRepository.findById(post.getThread().getForumThreadId())
        .orElseThrow(() -> new IllegalArgumentException("Thread not found"));

    User user = userRepository.findByUsername(username);
    if (user == null) {
      throw new IllegalArgumentException("User not found");
    }

    post.setThread(forumThread);
    post.setUser(user);
    post.setProfilePicture(user.getProfilePicture());
    post.setPostCreatedAt(LocalDateTime.now());
    post.setPostLastUpdatedAt(LocalDateTime.now());

    forumThread.setComments(forumThread.getComments() + 1);

    Post savedPost = postRepository.save(post);

    forumThreadRepository.save(forumThread);

    return savedPost;
  }

  public boolean deletePost(Long postId) {
    Optional<Post> optionalPost = postRepository.findById(postId);
    if (optionalPost.isPresent()) {
      Post post = optionalPost.get();
      ForumThread forumThread = post.getThread();

      forumThread.setComments(forumThread.getComments() - 1);

      forumThreadRepository.save(forumThread);

      postRepository.delete(post);
      return true;
    }
    return false;
  }

  public Post updatePost(Post postDetails, Long postId) {
    Optional<Post> optionalPost = postRepository.findById(postId);
    if (optionalPost.isPresent()) {
      Post existingPost = optionalPost.get();
      existingPost.setPostContent(postDetails.getPostContent());
      existingPost.setPostLastUpdatedAt(LocalDateTime.now());
      return postRepository.save(existingPost);
    } else {
      return null;
    }
  }

  public Optional<Post> getPostById(Long postId) {
    return postRepository.findById(postId);
  }

  public Post save(Post post) {
    post.setPostCreatedAt(LocalDateTime.now());
    post.setPostLastUpdatedAt(LocalDateTime.now());
    return postRepository.save(post);
  }
}
