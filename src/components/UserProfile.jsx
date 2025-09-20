import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user profile from backend
    const fetchProfile = async () => {
      try {
        const response = await fetch("https://mern-backend-two-mu.vercel.app/profile", {
          method: "GET",
          credentials: "include", // send cookies
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        // Optionally log the error
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Optional: return null or a redirect loader
    return null;
  }

  return (
    <div>
      {/* Profile Info */}
      <div className="max-w-md mx-auto mt-20 p-8 bg-white border rounded shadow">
        <h2 className="text-2xl font-bold mb-4">{user.username}'s Profile</h2>
        <p>
          <strong>User ID:</strong> {user.userid}
        </p>
        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Phone:</strong> {user.phone}
        </p>
      </div>
    </div>
  );
};

export default UserProfile;
