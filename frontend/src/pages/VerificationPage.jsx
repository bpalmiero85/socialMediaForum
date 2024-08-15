import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const VerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setCookie] = useCookies(["user"]);
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username");
  const email = queryParams.get("email");
  const code = queryParams.get("code");

  const [isVerified, setIsVerified] = useState(false);

 
  console.log("location.search:", location.search);
  console.log("Parsed username:", username);
  console.log("Parsed email:", email);
  console.log("Parsed code:", code);

  useEffect(() => {
    const verifyUser = async () => {
      if (!code || !username) {
        console.error("Verification code or username is missing");
        navigate("/error");
        return;
      }
      try {
        console.log("Starting verification process...");
        const response = await fetch(`http://localhost:8080/user/verify?email=${email}&code=${code}&username=${username}`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const user = await response.json();
          console.log("Verification successful", user);
          setCookie("user", user.username, { path: "/" });
          setIsVerified(true);
        } else {
          const errorText = await response.text();
          console.error("Verification error:", errorText);
          setIsVerified(false);
          navigate("/error");
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        alert("Error verifying user:", error);
        setIsVerified(false);
      }
    };

    if (code) {
      verifyUser();
    }
  }, [code, navigate, setCookie, username]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8080/user/verify-status?username=${username}`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const user = await response.json();
          if (user.enabled) {
            setCookie("user", user.username, { path: "/" });
            setIsVerified(true);
          }
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [username, setCookie]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isVerified) {
        navigate(`/`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isVerified, navigate]);

  useEffect(() => {
    if (isVerified) {
      navigate(`/`);
    }
  }, [isVerified, navigate]);

  return (
    <div>
      <h2>Email Verification Required</h2>
      <p>Please check your email and click on the verification link to verify your account.</p>
      {username && <p>Username: {username}</p>}
      {email && <p>Email: {email}</p>}
    </div>
  );
};

export default VerificationPage;
