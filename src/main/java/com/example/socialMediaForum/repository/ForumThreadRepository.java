package com.example.socialMediaForum.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.socialMediaForum.model.ForumThread;

public interface ForumThreadRepository extends JpaRepository<ForumThread, Long> {


}
