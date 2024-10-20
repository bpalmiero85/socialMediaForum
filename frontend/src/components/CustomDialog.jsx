import React from "react";
import "../styles/CustomDialog.css";

const CustomDialog = ({ onConfirm, onCancel, position }) => {
  return (
    <div className="custom-dialog"
         style={{ top: position.top, left: position.left }}
         >
          <p>Are you sure you want to delete this post?</p>
          <button className="confirm-button" onClick={onConfirm}>Yes</button>
          <button className="cancel-button" onClick={onCancel}>No</button>
         </div>
  );
};

export default CustomDialog;