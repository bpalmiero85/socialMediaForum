import React, { useState, useEffect } from "react";

const ActiveUsers = () => {
  const [activeUsers, setActiveUsers] = useState(0);

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/user/active-users", {
        credentials: "include",
      });
      const data = await response.json();
      console.log("Fetched active users:", data);
      setActiveUsers(data);
    } catch (error) {
      console.error("Error fetching active users:", error);
    }
  };

  useEffect(() => {
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Active Users: {activeUsers}</h2>
    </div>
  );
};

export default ActiveUsers;
