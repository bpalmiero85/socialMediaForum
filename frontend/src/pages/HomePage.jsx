import React from "react";
import "../styles/HomePage.css";
import useFetchUser from "../components/FetchUser";

const HomePage = () => {
  const { user, error } = useFetchUser();

  console.log("user:", user);
  console.log("error:", error);

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
        <p className="home-message">
          Hello, {user.firstName ? user.firstName : "Name unavailable"}! What
          would you like to do?
        </p>
      </div>
    </div>
  );
};

export default HomePage;
