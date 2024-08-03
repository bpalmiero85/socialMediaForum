package com.example.socialMediaForum.service;

import com.example.socialMediaForum.model.Post;
import com.example.socialMediaForum.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

  @Autowired
  private PostRepository postRepository;

  public List<Post> getAllPostsByThreadId(Long threadId) {
    return postRepository.findByThread_ForumThreadId(threadId);
  }

  public Post createPost(Post post) {
    post.setPostCreatedAt(LocalDateTime.now());
    return postRepository.save(post);
  }

  public boolean deletePost(Long postId) {
    Optional<Post> optionalPost = postRepository.findById(postId);
    if(optionalPost.isPresent()){
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

  public Post upvotePost(Long postId) {
    Optional<Post> optionalPost = postRepository.findById(postId);
    if (optionalPost.isPresent()) {
      Post post = optionalPost.get();
      post.setUpvotes(post.getUpvotes() + 1);
      return postRepository.save(post);
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
