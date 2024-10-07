import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "../styles/HomePage.css";
import useFetchUser from "../components/FetchUser";
import ScrollAnimation from "react-animate-on-scroll";
import ProfilePicture from "../components/ProfilePicture";
import Placeholder from "../placeholders/default-placeholder.png";

const HomePage = () => {
  const { user, error } = useFetchUser();
  const [isPictureUploaded, setIsPictureUploaded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [stompClient, setStompClient] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [commentSubscription, setCommentSubscription] = useState(null);

  useEffect(() => {
    fetchThreads();
    connectWebSocket();

    return () => {
      if (stompClient) stompClient.deactivate();
    };
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await fetch("http://localhost:8080/threads", {
        credentials: "include",
      });

      const data = await response.json();
      setThreads(data);
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  const fetchComments = async (threadId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/posts/thread/${threadId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        throw new Error("Error fetching comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const connectWebSocket = () => {
    const socketUrl = "http://localhost:8080/ws";
    const socket = new SockJS(socketUrl);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log("Connected to WebSocket", frame);

        stompClient.subscribe("/topic/threads", (message) => {
          const updatedThread = JSON.parse(message.body);

          setThreads((prevThreads) => {
            const threadExists = prevThreads.some(
              (thread) => thread.forumThreadId === updatedThread.forumThreadId
            );
            if (threadExists) {
              return prevThreads.map((thread) =>
                thread.forumThreadId === updatedThread.forumThreadId
                  ? updatedThread
                  : thread
              );
            } else {
              return [updatedThread, ...prevThreads];
            }
          });
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: ", frame.headers["message"]);
        console.error("Additional details: ", frame.body);
      },
      onWebSocketClose: (event) => {
        console.error("WebSocket closed: ", event);
      },
    });

    stompClient.activate();
    setStompClient(stompClient);

    
  };

  

  const handleThreadClick = (thread) => {
    if (stompClient && stompClient.connected) {
      if (commentSubscription) {
        commentSubscription.unsubscribe();
      }
    }

    setSelectedThread(thread);
    fetchComments(thread.forumThreadId);

    if (stompClient && stompClient.connected) {
      const subscription = stompClient.subscribe(
        `/topic/comments/${thread.forumThreadId}`,
        (message) => {
          const newComment = JSON.parse(message.body);
          setComments((prevComments) => {
            if (
              !prevComments.some(
                (comment) => comment.postId === newComment.postId
              )
            ) {
              return [newComment, ...prevComments];
            }
            return prevComments;
          });
        }
      );
      setCommentSubscription(subscription);

      const deletedSubscription = stompClient.subscribe(
        `/topic/comments/deleted/${thread.forumThreadId}`,
        (message) => {
          const deletedPostId = JSON.parse(message.body);
          setComments((prevComments) =>
            prevComments.filter((comment) => comment.postId !== deletedPostId)
          );
        }
      );
      setCommentSubscription(deletedSubscription);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();

    if (!user || !user.username) {
      console.error("User not available. Please log in.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/threads?username=${encodeURIComponent(
          user.username
        )}&profilePicture=${encodeURIComponent(user.profilePicture || "")}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${errorText}`);
      }

      const newThread = await response.json();
      setThreads((prevThreads) => {
        if (
          prevThreads.some(
            (thread) => thread.forumThreadId === newThread.forumThreadId
          )
        ) {
          return prevThreads;
        }
        return [newThread, ...prevThreads];
      });
      setTitle("");
      setContent("");
      setShowForm(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();

    if (!user || !user.username) {
      console.error("User not available. Please log in.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/posts?username=${encodeURIComponent(
          user.username
        )}&profilePicture=${encodeURIComponent(user.profilePicture || "")}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postContent: commentContent,
            thread: { forumThreadId: selectedThread.forumThreadId },
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error creating comment.");
      }

      const newComment = await response.json();

      setComments([newComment, ...comments]);

      setCommentContent("");
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const handleDeleteComment = async (postId) => {
    if (!user || !user.username) {
      console.error("User not available. Please log in.");
      return;
    }

    console.log("Deleting comment with postId:", postId);

    try {
      const response = await fetch(
        `http://localhost:8080/posts/${postId}?username=${encodeURIComponent(
          user.username
        )}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error deleting comment.");
      }

      setComments((prevComments) =>
        prevComments.filter((comment) => comment.postId !== postId)
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleUpvoteComment = async (postId) => {
    if (!postId) {
      console.error("No postId found for upvoting comment.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/posts/${postId}/upvotes`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error upvoting comment.");
      }

      console.log(`Comment with postId ${postId} successfully upvoted.`);
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleUpvoteThread = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/threads/${forumThreadId}/upvotes`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error liking post.");
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <ScrollAnimation animateIn="fadeIn">
            <span>H</span>
            <span>O</span>
            <span>M</span>
            <span>E</span>
          </ScrollAnimation>
        </div>

        <div className="home-message">
          <ScrollAnimation animateIn="bounceIn">
            <p>
              Hello, {user?.firstName ? user.firstName : "Guest"}! What would
              you like to do?
            </p>
          </ScrollAnimation>
        </div>

        <ProfilePicture
          onUpload={() => setIsPictureUploaded(true)}
          isPictureUploaded={isPictureUploaded}
          setIsPictureUploaded={setIsPictureUploaded}
          setCroppingStatus={setIsCropping}
        />

        {!isCropping && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="create-thread-button"
          >
            Create Post
          </button>
        )}

        {showForm && (
          <form onSubmit={handleCreateThread} className="thread-form">
            <h2 className="create-thread-title">Create Post</h2>
            <label className="thread-input">
              Title:
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>
            <label className="thread-input">
              Content:
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="create-button">
              Post
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="cancel-thread-button"
            >
              Cancel
            </button>
          </form>
        )}

        {!showForm && threads.length > 0 && (
          <div className="thread-list">
            <h3>Recent Posts:</h3>

            {threads.map((thread) => (
              <div
                key={thread.forumThreadId}
                className="thread-item"
                onClick={() => handleThreadClick(thread)}
              >
                <h4 className="thread-title">{thread.title}</h4>
                <div className="thread-user-info">
                  {thread.user?.profilePicture ? (
                    <img
                      src={`http://localhost:8080/uploads/${thread.user.profilePicture}`}
                      alt="User profile pic"
                      className="profile-picture-small"
                    />
                  ) : (
                    <img
                      src={Placeholder}
                      alt="No Pic"
                      className="profile-picture-small"
                    />
                  )}
                  <p className="thread-username">
                    {thread.user?.username || "Unknown User"}
                  </p>
                </div>
                <p className="thread-created-at">{thread.createdAt}</p>
                <p className="thread-content">{thread.content}</p>
                <button className="like-button"
                    onClick={() => handleUpvoteThread(thread.forumThreadId)}
                  >
                    👍 Like
                  </button>
                <span className="post-likes">{thread.threadUpvotes} Likes</span>
                <p className="thread-comments">Comments: {thread.comments}</p>

                {selectedThread?.forumThreadId === thread.forumThreadId && (
                  <div className="thread-details">
                    <h3 className="comments-header">Comments:</h3>
                    <div className="comment-list">
                      {comments.map((comment) => (
                        <div key={comment.postId} className="comment-item">
                          <p>{comment.postContent}</p>
                          <button className="like-button"
                            onClick={() => handleUpvoteComment(comment.postId)}
                          >
                           👍 Like
                          </button>
                          <span className="post-likes">{comment.postUpvotes} Likes</span>
                          <div className="thread-user-info">
                            {comment.user?.profilePicture ? (
                              <img
                                src={`http://localhost:8080/uploads/${comment.user.profilePicture}`}
                                alt="User profile"
                                className="profile-picture-small"
                              />
                            ) : (
                              <img
                                src={Placeholder}
                                alt="No Pic"
                                className="profile-picture-small"
                              />
                            )}
                            <p className="comment-username">
                              {comment.user?.username || "Unknown User"}
                            </p>
                          </div>
                          <p className="comment-created-at">
                            {comment.postCreatedAt}
                          </p>

                          {user?.username === comment.user?.username && (
                            <button
                              className="delete-comment-button"
                              onClick={() =>
                                handleDeleteComment(comment.postId)
                              }
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <form
                      onSubmit={handleCreateComment}
                      className="comment-form"
                    >
                      <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        required
                        placeholder="Add a comment..."
                      ></textarea>
                      <button type="submit" className="create-comment-button">
                        Comment
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
