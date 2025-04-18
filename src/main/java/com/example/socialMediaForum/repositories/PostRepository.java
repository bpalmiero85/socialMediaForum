package com.example.socialMediaForum.repositories;

import com.example.socialMediaForum.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserId(Long userId);
    List<Post> findByThread_ForumThreadId(Long forumThreadId);
}
