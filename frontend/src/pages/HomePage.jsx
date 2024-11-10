import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "../styles/HomePage.css";
import useFetchUser from "../components/FetchUser";
import ScrollAnimation from "react-animate-on-scroll";
import ProfilePicture from "../components/ProfilePicture";
import Placeholder from "../placeholders/default-placeholder.png";
import CustomDialog from "../components/CustomDialog";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0 });
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [commentSubscription, setCommentSubscription] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    user?.profilePicture || Placeholder
  );
  const [upvoteCommentSubscription, setUpvoteCommentSubscription] =
    useState(null);
  const [deletedCommentSubscription, setDeletedCommentSubscription] =
    useState(null);
  const [commentCountSubscription, setCommentCountSubscription] =
    useState(null);
  const [commentsByThread, setCommentsByThread] = useState({});

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

      const threadsWithComments = data.map((thread) => ({
        ...thread,
        comments: Array.isArray(thread.comments) ? thread.comments : [],
        commentCount: Array.isArray(thread.comments)
          ? thread.comments.length
          : 0,
      }));

      setThreads(threadsWithComments);
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  useEffect(() => {
    if (user?.profilePicture) {
      setProfilePictureUrl(`${user.profilePicture}?t=${Date.now()}`);
    }
  }, [user?.profilePicture]);

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
        setCommentsByThread((prev) => ({
          ...prev,
          [threadId]: data,
        }));
      } else {
        throw new Error("Error fetching comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const connectWebSocket = () => {
    const socketUrl = "http://localhost:8080/ws";

    const createSocket = () => new SockJS(socketUrl);

    const stompClient = new Client({
      webSocketFactory: createSocket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log("Connected to WebSocket", frame);

        stompClient.subscribe("/topic/comments", (message) => {
          const { forumThreadId, newComment } = JSON.parse(message.body);

          setCommentsByThread((prevComments) => ({
            ...prevComments,
            [forumThreadId]: [
              ...(prevComments[forumThreadId] || []),
              newComment,
            ],
          }));

          setThreads((prevThreads) =>
            prevThreads.map((thread) =>
              thread.forumThreadId === forumThreadId
                ? { ...thread, commentCount: (thread.commentCount || 0) + 1 }
                : thread
            )
          );
        });

        stompClient.subscribe("/topic/threads/deleted", (message) => {
          const deletedThreadId = JSON.parse(message.body);
          setThreads((prevThreads) =>
            prevThreads.filter(
              (thread) => thread.forumThreadId !== deletedThreadId
            )
          );
        });

        stompClient.subscribe("/topic/threads", (message) => {
          const updatedThread = JSON.parse(message.body);
          setThreads((prevThreads) => {
            const threadExists = prevThreads.some(
              (thread) => thread.forumThreadId === updatedThread.forumThreadId
            );
            return threadExists
              ? prevThreads.map((thread) =>
                  thread.forumThreadId === updatedThread.forumThreadId
                    ? updatedThread
                    : thread
                )
              : [updatedThread, ...prevThreads];
          });
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: ", frame.headers["message"]);
        console.error("Additional details: ", frame.body);
      },
      onWebSocketClose: (event) => {
        console.error("WebSocket closed: ", event);
        if (!event.wasClean) {
          console.log("Reconnecting WebSocket...");
          if (!stompClient.connected) {
            stompClient.activate();
          }
        }
      },
      onWebSocketError: (error) => {
        console.error("WebSocket encountered an error: ", error);
      },
    });

    stompClient.activate();
    setStompClient(stompClient);
  };

  useEffect(() => {
    if (stompClient && stompClient.connected) {
      const deletedThreadSubscription = stompClient.subscribe(
        "/topic/threads/deleted",
        (message) => {
          const deletedThreadId = JSON.parse(message.body);
          setThreads((prevThreads) =>
            prevThreads.filter(
              (thread) => thread.forumThreadId !== deletedThreadId
            )
          );
        }
      );
      return () => {
        if (deletedThreadSubscription) {
          deletedThreadSubscription.unsubscribe();
        }
      };
    }
  }, [stompClient]);

  const handleThreadClick = (thread) => {
    if (selectedThread?.forumThreadId !== thread.forumThreadId) {
      setSelectedThread(thread);

      fetchComments(thread.forumThreadId);

      if (stompClient && stompClient.connected) {
        if (commentSubscription) commentSubscription.unsubscribe();
        if (upvoteCommentSubscription) upvoteCommentSubscription.unsubscribe();
        if (deletedCommentSubscription)
          deletedCommentSubscription.unsubscribe();
        if (commentCountSubscription) commentCountSubscription.unsubscribe();

        const newCommentSubscription = stompClient.subscribe(
          `/topic/comments/${thread.forumThreadId}`,
          (message) => {
            const newComment = JSON.parse(message.body);
            setCommentsByThread((prev) => ({
              ...prev,
              [thread.forumThreadId]: [
                ...(prev[thread.forumThreadId] || []),
                newComment,
              ],
            }));
            setThreads((prevThreads) =>
              prevThreads.map((t) =>
                t.forumThreadId === thread.forumThreadId
                  ? { ...t, commentCount: (t.commentCount || 0) + 1 }
                  : t
              )
            );
          }
        );

        const newCommentCountSubscription = stompClient.subscribe(
          `/topic/threads/commentCount`,
          (message) => {
            const { threadId, commentCount } = JSON.parse(message.body);
            setThreads((prevThreads) =>
              prevThreads.map((t) =>
                t.forumThreadId === threadId ? { ...t, commentCount } : t
              )
            );
          }
        );

        const newDeletedCommentSubscription = stompClient.subscribe(
          `/topic/comments/deleted/${thread.forumThreadId}`,
          (message) => {
            const deletedPostId = JSON.parse(message.body);

            setCommentsByThread((prev) => ({
              ...prev,
              [thread.forumThreadId]: (prev[thread.forumThreadId] || []).filter(
                (comment) => comment.postId !== deletedPostId
              ),
            }));

            setThreads((prevThreads) =>
              prevThreads.map((t) =>
                t.forumThreadId === thread.forumThreadId
                  ? {
                      ...t,
                      comments: (t.comments || []).filter(
                        (comment) => comment.postId !== deletedPostId
                      ),
                      commentCount: t.commentCount - 1,
                    }
                  : t
              )
            );
          }
        );

        const newUpvoteCommentSubscription = stompClient.subscribe(
          `/topic/comments/upvoted/${thread.forumThreadId}`,
          (message) => {
            const updatedComment = JSON.parse(message.body);
            setCommentsByThread((prev) => ({
              ...prev,
              [thread.forumThreadId]: prev[thread.forumThreadId].map(
                (comment) =>
                  comment.postId === updatedComment.postId
                    ? updatedComment
                    : comment
              ),
            }));
          }
        );

        setCommentSubscription(newCommentSubscription);
        setCommentCountSubscription(newCommentCountSubscription);
        setDeletedCommentSubscription(newDeletedCommentSubscription);
        setUpvoteCommentSubscription(newUpvoteCommentSubscription);
      }
    }
  };

  const handleCreateComment = async (e, forumThreadId) => {
    e.preventDefault();

    if (!user || !user.username || !commentContent.trim() || !forumThreadId) {
      console.error("Missing user, content, or forumThreadId");
      return;
    }

    console.log("Posting comment to thread:", forumThreadId);

    try {
      const response = await fetch(
        `http://localhost:8080/posts?threadId=${encodeURIComponent(
          forumThreadId
        )}&username=${encodeURIComponent(user.username)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postContent: commentContent }),
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Error creating comment.");
      const newComment = await response.json();

      setCommentContent("");

      setCommentsByThread((prevComments) => ({
        ...prevComments,
        [forumThreadId]: [...(prevComments[forumThreadId] || []), newComment],
      }));

      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.forumThreadId === forumThreadId
            ? { ...thread, commentCount: (thread.commentCount || 0) + 1 }
            : thread
        )
      );
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const handleDeleteThread = async (forumThreadId) => {
    if (!forumThreadId) {
      console.error("No forumThreadId found for deleting thread.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/threads/${forumThreadId}?username=${encodeURIComponent(
          user.username
        )}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error deleting thread.");
      }

      console.log(
        `Thread with forumThreadId ${forumThreadId} successfully deleted.`
      );
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };

  const showDialog = (event, threadId) => {
    const rect = event.target.getBoundingClientRect();
    setDialogPosition({ top: rect.bottom + window.scrollY, left: rect.left });
    setSelectedThreadId(threadId);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteThread(selectedThreadId);
    setIsDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
  };

  const handleUpvoteComment = async (postId) => {
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

      const updatedComment = await response.json();

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.postId === updatedComment.postId ? updatedComment : comment
        )
      );

      console.log(`Comment with postId ${postId} successfully upvoted.`);
    } catch (error) {
      console.error("Error upvoting comment:", error);
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

  const handleUpvoteThread = async (forumThreadId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/threads/${forumThreadId}/upvotes`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Error upvoting thread.");
      }
    } catch (error) {
      console.error("Error upvoting thread:", error);
    }
  };

  const handleDeleteComment = async (postId) => {
    if (!user || !user.username) {
      console.error("User not available. Please log in.");
      return;
    }

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

      setSelectedThread((prevThread) => ({
        ...prevThread,
        comments: Array.isArray(prevThread.comments)
          ? prevThread.comments.filter((comment) => comment.postId !== postId)
          : [],
      }));

      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.forumThreadId === selectedThread.forumThreadId
            ? {
                ...thread,
                comments: thread.comments.filter(
                  (comment) => comment.postId !== postId
                ),
                commentCount: thread.commentCount - 1,
              }
            : thread
        )
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
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
                className={`thread-item ${
                  selectedThread?.forumThreadId === thread.forumThreadId
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleThreadClick(thread)}
              >
                <h4 className="thread-title">{thread.title}</h4>
                <div className="thread-user-info">
                  {thread.user?.profilePicture ? (
                    <img
                      src={`http://localhost:8080/uploads/${thread.user.profilePicture}`}
                      alt={`${thread.user.username}'s profile`}
                      className="profile-picture-small"
                    />
                  ) : (
                    <img
                      src={Placeholder}
                      alt="default"
                      className="profile-picture-small"
                    />
                  )}
                  <p className="comment-username">{thread.user?.username}</p>
                </div>
                <p className="thread-created-at">{thread.createdAt}</p>
                <p className="thread-content">{thread.content}</p>

                {user?.username === thread.user?.username && (
                  <button
                    className="delete-comment-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      showDialog(e, thread.forumThreadId);
                    }}
                  >
                    Delete
                  </button>
                )}
                <div>
                  <button
                    className="like-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpvoteThread(thread.forumThreadId);
                    }}
                  >
                    👍 Like
                  </button>
                </div>
                <span className="post-likes">{thread.threadUpvotes} Likes</span>
                <p className="thread-comments">
                  Comments:{" "}
                  {commentsByThread[thread.forumThreadId]?.length ||
                    thread.commentCount}
                </p>

                {selectedThread?.forumThreadId === thread.forumThreadId && (
                  <div className="thread-details">
                    <h3 className="comments-header">Comments:</h3>
                    <div className="comment-list">
                      {(commentsByThread[thread.forumThreadId] || []).map(
                        (comment) => (
                          <div key={comment.postId} className="comment-item">
                            <div className="comment-user-info">
                              {comment.user?.profilePicture ? (
                                <img
                                  src={`http://localhost:8080/uploads/${comment.user.profilePicture}`}
                                  alt={`${comment.user.username}'s profile`}
                                  className="profile-picture-small"
                                />
                              ) : (
                                <img
                                  src={Placeholder}
                                  alt="default"
                                  className="profile-picture-small"
                                />
                              )}
                              <span>{comment.user.username}</span>
                            </div>
                            <p>{comment.postContent}</p>
                            <div className="like-container">
                              <button
                                className="like-button"
                                onClick={() =>
                                  handleUpvoteComment(comment.postId)
                                }
                              >
                                👍 Like
                              </button>
                              <span className="post-likes">
                                {comment.postUpvotes} Likes
                              </span>
                            </div>
                            <p className="comment-created-at">
                              {comment.postCreatedAt}
                            </p>
                            {user?.username === comment.user?.username && (
                              <button
                                className="delete-comment-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComment(comment.postId);
                                }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                    <form
                      onSubmit={(e) =>
                        handleCreateComment(e, selectedThread.forumThreadId)
                      }
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

        {isDialogOpen && (
          <CustomDialog
            position={dialogPosition}
            message="Are you sure you want to delete this post?"
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
