import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/UserInfo.css";
import useFetchUser from "../components/FetchUser";

const UserInfo = () => {
  const location = useLocation();
  const { user, error, setUser } = useFetchUser();
  const [originalInfo, setOriginalInfo] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isEdit, setIsEdit] = useState({
    firstName: false,
    lastName: false,
    email: false,
  });

  if (user && !originalInfo) {
    setOriginalInfo(user);
  }

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
        console.log("User data updated successfully:", updatedUser); // Debug log
      } else {
        setError("Error updating user info");
      }
    } catch (error) {
      setError("Error updating user info");
    }
  };

  const handleDeleteUser = async () => {
    if (!user || !user.id) {
      console.error("User ID not available for deletion");
      return;
    }

    try {
      console.log("Attempting to delete user with ID:", user.id);
      const response = await fetch(`http://localhost:8080/user/${user.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error deleting profile.");
      }

      console.log("User deleted successfully.");

      const logoutResponse = await fetch("http://localhost:8080/user/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!logoutResponse.ok) {
        throw new Error("Error logging out.");
      }

      alert("Profile deleted successfully.");
      window.location.href = "/register";
    } catch (error) {
      console.error("Error deleting user:", error.message);
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
      {user.profilePicture && (
        <img
          src={`http://localhost:8080/uploads/${user.profilePicture}`}
          alt="User profile"
          className="profile-picture-info"
        />
      )}

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
            <span>
              {user.profilePicture && (
                <img
                  src={`http://localhost:8080/uploads/${user.profilePicture}`}
                  alt="User profile"
                  className="profile-picture-small"
                />
              )}
              {user.username}
            </span>
          </div>
        </div>
      </div>
      {user?.username && user?.id && (
        <button className="delete-profile" onClick={handleDeleteUser}>
          Delete Profile
        </button>
      )}
    </div>
  );
};

export default UserInfo;
