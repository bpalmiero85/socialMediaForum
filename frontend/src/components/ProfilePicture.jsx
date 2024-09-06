import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useFetchUser from "./FetchUser";
import Cropper from "react-easy-crop";
import "../styles/HomePage.css";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImg = async (imageSrc, crop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(crop.width / 2, crop.height / 2, crop.width / 2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/png");
  });
};

const ProfilePicture = ({
  onUpload,
  isPictureUploaded,
  setIsPictureUploaded,
  setCroppingStatus,

}) => {
  const { user, error } = useFetchUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || null
  );
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setIsCropping(true);
      setCroppingStatus(true);
    } else {
      console.error("No file selected");
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropAndUpload = useCallback(async () => {
    if (!selectedFile || !user) {
      console.error("No file selected or user not loaded");
      return;
    }
  
    try {
      const croppedImage = await getCroppedImg(
        URL.createObjectURL(selectedFile),
        croppedAreaPixels
      );
  
      const formData = new FormData();
      formData.append("file", croppedImage);
      formData.append("username", user.username);
  
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
      setIsPictureUploaded(true);
      onUpload();  // Call this to trigger changes in the parent (HomePage)
      setIsCropping(false);
      setCroppingStatus(false);
    } catch (e) {
      console.error("Error cropping or uploading image:", e);
    }
  }, [croppedAreaPixels, selectedFile, user, onUpload, setCroppingStatus]);

  return (
    <div className="profile-picture-container">
      {error && <p>{error}</p>}
      {user ? (
        <>
          <div className="profile-picture">
            {profilePicture ? (
              <img
                src={`http://localhost:8080/uploads/${profilePicture}`}
                alt="Profile Picture"
                className="profile-picture"
              />
            ) : (
              <p></p>
            )}
          </div>
          
          {profilePicture && !isCropping && (
            <div className="update-pic-container">
              <button onClick={handleFileSelect} className="update-pic-button">
                Update Profile Picture
              </button>
            </div>
          )}

          {!profilePicture && !isCropping && (
            <button onClick={handleFileSelect} className="upload-button">
              Upload Profile Picture
            </button>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: "none" }}
          />
          {isCropping && selectedFile && (
            <>
              <div className="crop-container">
                <Cropper
                  image={URL.createObjectURL(selectedFile)}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <button onClick={handleCropAndUpload} className="crop-button">
                Crop & Save
              </button>
            </>
          )}
        </>
      ) : (
        <p>Loading user...</p>
      )}
    </div>
  );
};

export default ProfilePicture;

