import "../styles/Navbar.css";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import FetchUser from "../components/FetchUser";
import { useCookies } from "react-cookie";

function Navbar() {
  const { user, error } = FetchUser();
  const [, removeCookie] = useCookies(["user"]);
  const location = useLocation();

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    removeCookie("user");
  };

  const showNavLinks = () => {
    switch (location.pathname) {
      case "/homepage":
        return (
          <div className="links-container">
            <Link
              to={`/userinfo?username=${user.username}`}
              className="edit-profile-link"
            >
              Edit Profile
            </Link>
            <Link
              to={`/logout?username=${user.username}`}
              onClick={handleLogout}
            >
              Sign Out
            </Link>
          </div>
        );
      case "/welcome":
        return (
          <div className="links-container">
            <Link
              to={
                user.username
                  ? `/homepage?username=${user.username}`
                  : "/register"
              }
            >
              Home
            </Link>
            <Link
              to={`/userinfo?username=${user.username}`}
              className="edit-profile-link"
            >
              Edit Profile
            </Link>
            <Link
              to={`/logout?username=${user.username}`}
              onClick={handleLogout}
            >
              Sign Out
            </Link>
          </div>
        );
      case "/userinfo":
        return (
          <div className="links-container">
            <Link
              to={
                user.username
                  ? `/homepage?username=${user.username}`
                  : "/register"
              }
            >
              Home
            </Link>
            <Link
              to={`/logout?username=${user.username}`}
              onClick={handleLogout}
            >
              Sign Out
            </Link>
          </div>
        );
      case "/logout":
        return (
          <div className="links-container">
            <Link to="/">Sign In</Link>
          </div>
        );
        case "/verify":
        return (
          <div className="links-container">
            <Link to="/">Sign In</Link>
          </div>
        );
      default:
        return (
          <div className="links-container">
            <Link to="/">Sign In</Link>
          </div>
        );
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-title">My Application</div>
      {showNavLinks()}
    </div>
  );
}

export default Navbar;
