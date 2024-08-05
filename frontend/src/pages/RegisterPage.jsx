import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RegisterPage.css";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!firstName) newErrors.firstName = "First Name is required";
    if (!lastName) newErrors.lastName = "Last Name is required";
    if (!email || !emailPattern.test(email))
      newErrors.email = "Valid Email is required";
    if (!username) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";

    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          username,
          password,
        }),
        credentials: "include",
      });

      if (response.ok) {
        navigate(`/verify?username=${username}`);
    
      } else {
        const errorText = await response.text();
        setServerError(errorText);
      }
    } catch (error) {
      console.error("Error signing up", error);
    }
  };

  return (
    <div className="register-background">
      <div className="register-container">
        <div className="register-title">
          <h2>Sign Up</h2>
        </div>
        {serverError && (
          <div className="register-server-error">{serverError}</div>
        )}
        <form onSubmit={handleRegister}>
          <div className="register-fields">
            <div className="register-firstName">
              <label className="register-label">First Name: </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`register-input ${errors.firstName ? "error" : ""}`}
              />
              <div className="register-error-message-container">
                {errors.firstName && (
                  <div className="register-error-message">
                    {errors.firstName}
                  </div>
                )}
              </div>
            </div>
            <div className="register-lastName">
              <label className="register-label">Last Name: </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`register-input ${errors.lastName ? "error" : ""}`}
              />
              <div className="register-error-message-container">
                {errors.lastName && (
                  <div className="register-error-message">{errors.lastName}</div>
                )}
              </div>
            </div>
            <div className="register-email">
              <label className="register-label">Email: </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`register-input ${errors.email ? "error" : ""}`}
              />
              <div className="register-error-message-container">
                {errors.email && (
                  <div className="register-error-message">{errors.email}</div>
                )}
              </div>
            </div>
            <div className="register-username">
              <label className="register-label">Username: </label>
              <input
                type="text"
                value={username}
                minLength="3"
                onChange={(e) => setUsername(e.target.value)}
                className={`register-input ${errors.username ? "error" : ""}`}
              />
              <div className="register-error-message-container">
                {errors.username && (
                  <div className="register-error-message">
                    {errors.username}
                  </div>
                )}
              </div>
            </div>
            <div className="register-password">
              <label className="register-label">Password: </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`register-input ${errors.password ? "error" : ""}`}
              />
              <div className="register-error-message-container">
                {errors.password && (
                  <div className="register-error-message">{errors.password}</div>
                )}
              </div>
            </div>
            <div className="register-buttons">
              <button type="submit" className="register-button">
                Sign Up
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
