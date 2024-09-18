package com.example.socialMediaForum.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import com.example.socialMediaForum.model.Post;
import com.example.socialMediaForum.model.ForumThread;

@Controller
public class WebSocketController {

  @MessageMapping("/comments/{threadId}")
  @SendTo("/topic/comments/{threadId}")
  public Post sendComment(@DestinationVariable String threadId, Post comment) {
    return comment;
  }

  @MessageMapping("/threads")
  @SendTo("/topic/threads")
  public ForumThread sendThread(ForumThread thread) {
    return thread;
  }
}