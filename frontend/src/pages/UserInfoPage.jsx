import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/UserInfo.css";

const UserInfo = () => {
  const location = useLocation();
  const username = new URLSearchParams(location.search).get("username");
  const [user, setUser] = useState(null);
  const [originalInfo, setOriginalInfo] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [error, setError] = useState(null);
  const [isEdit, setIsEdit] = useState({
    firstName: false,
    lastName: false,
    email: false,
  });

  useEffect(() => {
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
          setUser(userData);
          setOriginalInfo(userData);
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

  const handleEdit = (field) => {
    setIsEdit((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSave = async (field, e) => {
    e.preventDefault();

    if (field === "email" && !validateEmail(user.email)) {
      setValidationError("Valid email required");
      return;
    }
    setValidationError(null);
    try {
      const response = await fetch("http://localhost:8080/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
        credentials: "include",
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setOriginalInfo(updatedUser);
        setIsEdit((prev) => ({ ...prev, [field]: false }));
      } else {
        setError("Error updating user info");
      }
    } catch (error) {
      setError("Error updating user info");
    }
  };

  const handleCancel = (field) => {
    setUser((prev) => ({ ...prev, [field]: originalInfo[field] }));
    setIsEdit((prev) => ({ ...prev, [field]: false }));
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-info-page-container">
      <div className="user-info-header">
        <h1>User Info</h1>
      </div>
      <div className="user-info-box">
        <div className="user-info-field-inputs">
          <div className="user-info-field">
            <strong>First Name:</strong>
            {isEdit.firstName ? (
              <div>
                <input
                  type="text"
                  value={user.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />

                <button
                  className="user-edit-button"
                  onClick={(e) => handleSave("firstName", e)}
                >
                  Save
                </button>
                <button
                  className="user-cancel-button"
                  onClick={() => handleCancel("firstName")}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <span>{user.firstName}</span>
                <button
                  className="user-edit-button"
                  onClick={() => handleEdit("firstName")}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="user-info-field">
            <strong>Last Name:</strong>
            {isEdit.lastName ? (
              <div>
                <input
                  type="text"
                  value={user.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
                <button
                  className="user-edit-button"
                  onClick={(e) => handleSave("lastName", e)}
                >
                  Save
                </button>
                <button
                  className="user-cancel-button"
                  onClick={() => handleCancel("lastName")}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <span>{user.lastName}</span>
                <button
                  className="user-edit-button"
                  onClick={() => handleEdit("lastName")}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="user-info-field">
            <strong>Email:</strong>
            {isEdit.email ? (
              <div>
                <input
                  type="email"
                  value={user.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                {validationError && (
                  <div className="email-validation-error">
                    {validationError}
                  </div>
                )}
                <button
                  className="user-edit-button"
                  onClick={(e) => handleSave("email", e)}
                >
                  Save
                </button>
                <button
                  className="user-cancel-button"
                  onClick={() => handleCancel("email")}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <span>{user.email}</span>
                <button
                  className="user-edit-button"
                  onClick={() => handleEdit("email")}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          <div className="user-info-field">
            <strong>Username:</strong>
            <span>{user.username}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
