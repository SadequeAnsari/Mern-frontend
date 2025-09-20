import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [userToVerify, setUserToVerify] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://mern-backend-topaz.vercel.app/api/users", {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 403) {
        navigate("/");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch users:", errorData.message);
        navigate("/");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("https://mern-backend-topaz.vercel.app/profile", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching current user profile:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, [navigate]);

  const handleLevelChange = async (userId, newLevel) => {
    try {
      const response = await fetch(
        `https://mern-backend-topaz.vercel.app/api/users/${userId}/level`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            level: newLevel,
          }),
        }
      );

      if (response.ok) {
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, level: newLevel } : user
          )
        );
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update user level.");
      }
    } catch (error) {
      console.error("Error updating user level:", error);
      alert("An error occurred while updating the user level.");
    } finally {
      setEditingUserId(null);
    }
  };

  const handleCheckCode = async () => {
    setMessage("");
    setUserToVerify(null);
    try {
      const response = await fetch(
        "https://mern-backend-topaz.vercel.app/api/verification/check-code",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            verificationCode,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage({
          text: data.message,
          type: "success",
        });
        setUserToVerify(data.user);
      } else {
        setMessage({
          text: data.message || "Verification failed.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error checking verification code:", error);
      setMessage({
        text: "An error occurred during code check.",
        type: "error",
      });
    }
  };

  const handleVerificationAction = async (action) => {
    setMessage("");
    try {
      const response = await fetch(
        "https://mern-backend-topaz.vercel.app/api/verification/action",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userToVerify._id,
            action,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage({
          text: data.message,
          type: "success",
        });
        setUserToVerify(null); // Clear the profile view
        setVerificationCode(""); // Clear the code input
        fetchUsers(); // Refresh the main user list
      } else {
        setMessage({
          text: data.message || `Failed to ${action} user.`,
          type: "error",
        });
      }
    } catch (error) {
      console.error(`Error during ${action} action:`, error);
      setMessage({
        text: `An error occurred while trying to ${action} the user.`,
        type: "error",
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading user data...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {currentUser && parseInt(currentUser.level) >= 5 && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">
            User Verification (Level 5+)
          </h2>
          {message.text && (
            <div
              className={`p-4 mb-4 text-center rounded-md ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCheckCode}
              className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
            >
              Check Code
            </button>
          </div>

          {userToVerify && (
            <div className="mt-6 p-4 border border-gray-300 rounded-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                User to Verify:
              </h3>
              <p>
                <strong>Username:</strong> {userToVerify.username}
              </p>
              <p>
                <strong>Email:</strong> {userToVerify.email}
              </p>
              <p>
                <strong>Current Level:</strong> {userToVerify.level}
              </p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleVerificationAction("verify")}
                  className="py-2 px-6 bg-green-500 text-white rounded-md font-semibold hover:bg-green-600"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleVerificationAction("reject")}
                  className="py-2 px-6 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
