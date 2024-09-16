package com.example.socialMediaForum.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import com.example.socialMediaForum.model.Post;
import com.example.socialMediaForum.model.ForumThread;

@Controller
public class WebSocketController {

  @MessageMapping("/comments")
  @SendTo("/topic/comments")
  public Post sendComment(Post comment) {
    return comment;
  }

  @MessageMapping("/threads")
  @SendTo("/topic/threads")
  public ForumThread sendThread(ForumThread thread) {
    return thread;
  }
}
