import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function useFetchUser() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const username = searchParams.get("username");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

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

  return { user, error, setUser };
}

export default useFetchUser;
