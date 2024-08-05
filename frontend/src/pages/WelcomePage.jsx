import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../styles/WelcomePage.css";

const WelcomePage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const username = searchParams.get("username");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Username:", username);
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/user/userinfo?username=${username}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (response.ok) {
          const userData = await response.json();
          console.log("User Data:", userData);
          setUser(userData);
        } else {
          setError("Error fetching user info");
        }
      } catch (error) {
        setError("Error fetching user info");
      }
    };

    if (username) {
      fetchUser();
    }
  }, [username]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="welcome-message">
      <h1 className="welcome-header">
        Welcome, <span>{user.firstName}</span>!
      </h1>
      <div className="welcome-paragraph">
        <p>You now have access to this application.</p>
      </div>
    </div>
  );
};

export default WelcomePage;
