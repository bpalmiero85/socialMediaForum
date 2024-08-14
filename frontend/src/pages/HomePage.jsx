import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import useFetchUser from "../components/FetchUser";

const HomePage = () => {
  const { user, error } = useFetchUser();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");

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

  const handleToggleForm = () => {
    setShowForm(!showForm);
  };

  const handleThreadClick = (thread) => {
    setSelectedThread(thread);
    fetchComments(thread.id);  
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch(`http://localhost:8080/threads`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, content }),
            credentials: "include",
        });

        const textResponse = await response.text(); 
        console.log("Raw response:", textResponse); 

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const newThread = JSON.parse(textResponse); 
            setThreads([newThread, ...threads]);
            setSuccessMessage("Post created successfully!");
            setTitle("");
            setContent("");
            setShowForm(false);
        } else {
            throw new Error("Expected JSON, got something else");
        }
    } catch (error) {
        console.error("Error creating post:", error);
    }
};


  const fetchComments = async (threadId) => {
    try {
      const response = await fetch(`http://localhost:8080/posts/thread/${threadId}`, {
        credentials: "include",
      });
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
      const response = await fetch(`http://localhost:8080/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postContent: commentContent,
          thread: selectedThread,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const newComment = await response.json();
        setComments([newComment, ...comments]);
        setCommentContent("");
      } else {
        throw new Error("Expected JSON, got something else");
      }
    } catch (error) {
      console.error("Error creating comment", error);
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h2 className="home-header">Home</h2>
        <div className="home-message">
        <p>
          Hello, {user?.firstName ? user.firstName : "Guest"}! What would you like to do?
        </p>
        </div>
        <button onClick={handleToggleForm} className="create-thread-button">
          {showForm ? "Cancel" : "Create Post"}
        </button>

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
          </form>
        )}

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <div className="thread-list">
          <h3>Recent Threads</h3>
          {threads.map((thread) => (
            <div
              key={thread.id}
              className="thread-item"
              onClick={() => handleThreadClick(thread)}
            >
              <h4>{thread.title}</h4>
              <p>{thread.content}</p>
            </div>
          ))}
        </div>

        {selectedThread && (
          <div className="thread-details">
            <h3 className="comments-header">Comments:</h3>
            <div className="comment-list">
              {comments.map((comment) => (
                <div key={comment.postId} className="comment-item">
                  <p>{comment.postContent}</p>
                  <p>{user.username}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleCreateComment} className="comment-form">
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
    </div>
  );
};

export default HomePage;
