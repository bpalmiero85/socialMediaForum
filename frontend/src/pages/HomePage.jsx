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

  console.log("user:", user);
  console.log("error:", error);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch("http://localhost:8080/threads", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setThreads(data);
        }
      } catch (error) {
        console.error("Error fetching threads", error);
      }
    };

    fetchThreads();
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user) {
    return <div className="loading-message">Loading...</div>;
  }

  const handleToggleForm = () => {
    setShowForm(!showForm);
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:8080/threads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
        credentials: "include",
      });

      const contentType = response.headers.get("content-type");

      if (
        response.ok &&
        contentType &&
        contentType.includes("application/json")
      ) {
        const newThread = await response.json();
        setThreads([newThread, ...threads]);
        setSuccessMessage("Thread created successfully!");
        setTitle("");
        setContent("");
        setShowForm(false);
      } else {
        const errorText = await response.text();
        console.error(
          "Error creating thread:",
          response.status,
          response.statusText,
          errorText
        );
        setSuccessMessage(`Failed to create post: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error creating thread", error);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h2 className="home-header">Home</h2>
        <p className="home-message">
          Hello, {user.firstName ? user.firstName : "Name unavailable"}! What
          would you like to do?
        </p>
        <button onClick={handleToggleForm} className="create-thread-button">
          {showForm ? "Cancel" : "Create Post"}
        </button>

        {showForm && (
          <form onSubmit={handleCreateThread} className="thread-form">
            <h2 className="create-thread-title">Create Post</h2>
            <div className="thread-description">
              <ol>
                <h3>Express Yourself with Authenticity</h3>
                <li>
                  Be Unique: Your voice matters—share your perspective with the
                  world.
                </li>
                <li>
                  Be Thoughtful: Engage meaningfully, contribute with care, and
                  consider the impact of your words.
                </li>
                <li>
                  Ask a Question: Spark curiosity and inspire discussion by
                  posing questions that challenge conventional thinking.
                </li>
                <p>
                  This is your space to connect, explore, and inspire. Let your
                  creativity and curiosity shine!
                </p>
              </ol>
            </div>
            <label className="thread-input">
              Title:
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>
            <br></br>
            <br></br>
            <label className="thread-input">
              Content:
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
            </label>
            <button
              type="submit"
              className="create-button"
              onClick={handleCreateThread}
            >
              Create!
            </button>
          </form>
        )}

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <div className="thread-list">
          <h3>Recent Threads</h3>
          {threads.map((thread) => (
            <div key={thread.id} className="thread-item">
              <h4>{thread.title}</h4>
              <p>{thread.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
