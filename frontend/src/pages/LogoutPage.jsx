import React, { useEffect } from "react";
import "../styles/LogoutPage.css";
import FetchUser from "../components/FetchUser";
import { useCookies } from "react-cookie";

const LogoutPage = () => {
  const { user, error } = FetchUser();
  const [, , removeCookie] = useCookies(["user"]);

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await fetch("http://localhost:8080/user/logout", {
          method: "POST",
          credentials: "include",
        });
        if (response.ok) {
          removeCookie("user");
          console.log("User logged out successfully.");
        } else {
          console.error("Failed to log out.");
        }
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

    logout();
  }, [removeCookie]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="logout-container">
      <div className="logout-message">
        <h3>
          We hope to see you again soon, <span>{user.firstName}</span>. Goodbye!
        </h3>
      </div>
    </div>
  );
};

export default LogoutPage;
