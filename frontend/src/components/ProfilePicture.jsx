import React, { useState, useEffect } from "react";
import useFetchUser from "./FetchUser";

const ProfilePicture = () => {
  const { user, error, setUser } = useFetchUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);

  const handleFileChange = (e) => {
    if(e.target.files.length > 0){
      setSelectedFile(e.target.files[0]);
    } else {
      console.error("No file selected");
    }
  };

  const handleUploadPhoto = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("username", user.username);

    try {
      const response = await fetch(
        "http://localhost:8080/user/uploadProfilePicture",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Profile picture uploaded successfully", data);

      
      setProfilePicture(data.profilePicture);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  return (
    <div className="profile-picture-container">
      {error && <p>{error}</p>}
      {user ? (
        <>
          <div className="profile-picture">
            {profilePicture ? (
              <img
                src={``}
                alt="Profile"
                className="profile-picture"
                style={{ width: "350px", height: "350px", objectFit: "cover" }}
              />
            ) : (
              <p>No profile picture uploaded</p>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button onClick={handleUploadPhoto}>Upload Profile Picture</button>
        </>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
};

export default ProfilePicture;
