package com.example.socialMediaForum.service;

import com.example.socialMediaForum.model.ForumThread;
import com.example.socialMediaForum.model.Post;
import com.example.socialMediaForum.repositories.ForumThreadRepository;
import com.example.socialMediaForum.repositories.PostRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

  @Autowired
  private PostRepository postRepository;

  @Autowired
  private ForumThreadRepository forumThreadRepository;

  public List<Post> getAllPostsByThreadId(Long forumThreadId) {
    return postRepository.findByThreadId(forumThreadId);
  }

  public Post createPost(Post post) {

    ForumThread forumThread = forumThreadRepository.findById(post.getThread().getForumThreadId())
        .orElseThrow(() -> new IllegalArgumentException("Post not found"));

    post.setThread(forumThread);
    post.setPostCreatedAt(LocalDateTime.now());
    post.setPostLastUpdatedAt(LocalDateTime.now());

    Post savedPost = postRepository.save(post);

    forumThread.setComments(forumThread.getComments() + 1);
    forumThreadRepository.save(forumThread);

    return savedPost;
  }

  public boolean deletePost(Long postId) {
    Optional<Post> optionalPost = postRepository.findById(postId);
    if (optionalPost.isPresent()) {
      postRepository.delete(optionalPost.get());
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
    return postRepository.save(post);
  }
}
