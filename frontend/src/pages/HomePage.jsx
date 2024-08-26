import React, { useState, useEffect } from "react";
import "../styles/HomePage.css";
import useFetchUser from "../components/FetchUser";
import ProfilePicture from "../components/ProfilePicture";
import ScrollAnimation from "react-animate-on-scroll";

const HomePage = () => {
  const { user, error } = useFetchUser();
  const [isPictureUploaded, setIsPictureUploaded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showUploadPic, setShowUploadPic] = useState(false);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [showCreateButton, setShowCreateButton] = useState(true);
  const [homeAnimation, setHomeAnimation] = useState([]);


  useEffect(() => {
    fetchThreads();
    triggerHomeAnimation();
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await fetch("http://localhost:8080/threads", {
        credentials: "include",
      });

      const textResponse = await response.text();
      console.log("Raw response:", textResponse);

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = JSON.parse(textResponse);
        setThreads(data);
      } else {
        throw new Error("Expected JSON, got something else");
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  const triggerHomeAnimation = () => {
    const spans = Array.from(document.querySelectorAll(".home-header span"));

    spans.forEach((span, idx) => {
      span.addEventListener("click", (e) => {
        e.target.classList.add("active");
      });

      setTimeout(() => {
        span.classList.add("active");
      }, 750 * (idx + 1));
    });

    setHomeAnimation(spans);
  }

  const handleToggleForm = () => {
    setShowForm(!showForm);
    setShowCreateButton(true);
  };

  const handleToggleUpload = () => {
    setShowUploadPic(true);
  };

  const handlePictureUpload = () => {
    setIsPictureUploaded(true);
    setShowUploadPic(true);
    setShowCreateButton(true);
  };

  const handleThreadClick = (thread) => {
    setSelectedThread(thread);
    fetchComments(thread.forumThreadId);
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8080/threads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, user }),
        credentials: "include",
      });

      const textResponse = await response.text();
      console.log("Raw response:", textResponse);

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const newThread = JSON.parse(textResponse);
        setThreads([newThread, ...threads]);
        setTitle("");
        setContent("");
        setShowForm(false);
        setShowCreateButton(true);
      } else {
        throw new Error("Expected JSON, got something else");
      }
    } catch (error) {
      console.error("Error creating post:", error);
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        setComments(data);
      } else {
        throw new Error("Expected JSON, got something else");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:8080/posts?username=${user.username}`,
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const newComment = await response.json();
        setComments([newComment, ...comments]);
        setCommentContent("");

        setThreads((prevThreads) =>
          prevThreads.map((thread) =>
            thread.forumThreadId === selectedThread.forumThreadId
              ? { ...thread, comments: thread.comments + 1 }
              : thread
          )
        );
      } else {
        throw new Error("Expected JSON, got something else");
      }
    } catch (error) {
      console.error("Error creating comment", error);
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
          <p>
            <ScrollAnimation animateIn="bounceIn">
              Hello, {user?.firstName ? user.firstName : "Guest"}! What would
              you like to do?
            </ScrollAnimation>
          </p>
        </div>

        {!isPictureUploaded && (
          <button onClick={handleToggleUpload} className="upload-pic-button">
            Upload Profile Picture
          </button>
        )}
        {showUploadPic && (
          <div className="home-profile-picture">
          <ProfilePicture onUpload={handlePictureUpload}/>
          </div>
          )}

        {!showForm && !isPictureUploaded && (
          <button onClick={handleToggleForm} className="create-thread-button">
            Create Post
          </button>
        )}

        {isPictureUploaded && showCreateButton && !showForm && (
          <button onClick={handleToggleForm} className="create-thread-button-after">
            Create Post
          </button>
        )}

     

        {showForm && (
          <>
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
              <br />
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
              <button onClick={handleToggleForm} className="cancel-thread-button">
              Cancel
            </button>
            </form>
          </>
        )}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {threads.length > 0 && (
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
                  {user.profilePicture && (  
                    <img
                      src={`http://localhost:8080/uploads/${user.profilePicture}`}
                      alt="User profile"
                      className="profile-picture-small"
                    />
                  )}
                  <p className="thread-username">
                    {thread.user?.username}
                  </p>
                </div>
                <p className="thread-created-at">{thread.createdAt}</p>
                <p className="thread-content">{thread.content}</p>
                <p className="thread-comments">Comments: {thread.comments}</p>

                {selectedThread?.forumThreadId === thread.forumThreadId && (
                  <div className="thread-details">
                    <h3 className="comments-header">Comments:</h3>
                    <div className="comment-list">
                      {comments.map((comment) => (
                        <div key={comment.postId} className="comment-item">
                          <p>{comment.postContent}</p>
                          <div className="thread-user-info"> 
                  {user.profilePicture && (  
                    <img
                      src={`http://localhost:8080/uploads/${user.profilePicture}`}
                      alt="User profile"
                      className="profile-picture-small"
                    />
                  )}
                  <p className="comment-username">
                    {comment.user?.username}
                  </p>
                </div>

                          <p className="comment-created-at">
                            {comment.postCreatedAt}
                          </p>
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
