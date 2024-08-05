import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const [, setCookie] = useCookies(["user"]);

  const validate = () => {
    const newErrors = {};
    if (!username) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
        credentials: "include",
      });

      if (response.ok) {
        setCookie("user", username, { path: "/" });
        navigate(`/homepage?username=${username}`);
      } else {
        const errorText = await response.text();
        setServerError(errorText);
      }
    } catch (error) {
      console.error("Error logging in", error);
    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <div className="login-title">
          <h2>Login</h2>
        </div>
        {serverError && <div className="login-server-error">{serverError}</div>}
        <form onSubmit={handleLogin}>
          <div className="login-fields">
            <div className="login-username">
              <label className="login-label">Username: </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`login-input ${errors.username ? "error" : ""}`}
              />
              <div className="login-error-message-container">
                {errors.username && (
                  <div className="login-error-message">{errors.username}</div>
                )}
              </div>
            </div>
            <div className="login-password">
              <label className="login-label">Password: </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`login-input ${errors.password ? "error" : ""}`}
              />
              <div className="login-error-message-container">
                {errors.password && (
                  <div className="login-error-message">{errors.password}</div>
                )}
              </div>
            </div>
            <div className="login-buttons">
              <button type="submit" className="login-button">
                Login
              </button>
              <button
                type="button"
                className="login-button"
                onClick={handleRegister}
              >
                Sign up
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
