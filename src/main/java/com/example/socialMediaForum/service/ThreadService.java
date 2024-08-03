package com.example.socialMediaForum.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;


import com.example.socialMediaForum.repository.ForumThreadRepository;

@Service
public class ThreadService {
  @Autowired
  private ForumThreadRepository threadRepository;

  public List<java.lang.Thread> getAllThreads() {
    return threadRepository.findAll();
  }

}
