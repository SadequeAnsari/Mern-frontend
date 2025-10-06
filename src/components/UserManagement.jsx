import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState({});
  const [userToVerify, setUserToVerify] = useState(null);
  const navigate = useNavigate();

  // --- API Handlers ---

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://mern-backend-two-mu.vercel.app/api/users", {
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
      const response = await fetch("https://mern-backend-two-mu.vercel.app/profile", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error("An error occurred while fetching current user:", error);
    }
  };

  const handleLevelChange = async (userId, newLevel) => {
    if (!currentUser || Number(currentUser.level) < 6) {
        alert("You do not have permission to change user levels.");
        return;
    }

    try {
      const response = await fetch(`https://mern-backend-two-mu.vercel.app/api/users/${userId}/level`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ level: newLevel }),
      });

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, level: newLevel } : user
          )
        );
        setEditingUserId(null); // Exit editing mode
      } else {
        const errorData = await response.json();
        alert(`Failed to update level: ${errorData.message}`); // Show backend error
      }
    } catch (error) {
      alert("An error occurred while changing the user level.");
    }
  };
  
  const handleCheckCode = async () => {
    setMessage("");
    setUserToVerify(null);
    try {
      const response = await fetch(
        "https://mern-backend-two-mu.vercel.app/api/verification/check-code",
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
        "https://mern-backend-two-mu.vercel.app/api/verification/action",
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
        setUserToVerify(null);
        setVerificationCode("");
        fetchUsers();
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

  const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);
  
  // --- Rendering Functions ---

  const getLevelOptions = (adminLevel) => {
    switch (adminLevel) {
      case 6:
        return [0, 1, 2, 3, 4, 5];
      case 7:
        return [0, 1, 2, 3, 4, 5, 6];
      case 8:
        return [5, 6, 7];
      case 9: // Super Admin
        return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      default:
        return [];
    }
  };

  const renderLevelEditor = (user) => {
    const options = getLevelOptions(Number(currentUser.level));

    return (
      <div className="flex items-center space-x-2">
        <select
          defaultValue={user.level}
          onChange={(e) => handleLevelChange(user._id, e.target.value)}
          onBlur={() => setEditingUserId(null)}
          className="w-24 p-1 border border-gray-300 rounded-md text-center"
        >
          {options.map((level) => (
            <option key={level} value={level}>
              Level {level}
            </option>
          ))}
        </select>
        <button
          onClick={() => setEditingUserId(null)}
          className="py-1 px-3 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    );
  };

  const renderUserTable = () => (
    <div className="mt-8 bg-white p-6 shadow-xl rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">User List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
              {currentUser && Number(currentUser.level) >= 6 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingUserId === user._id ? (
                    renderLevelEditor(user)
                  ) : (
                    <span className={`font-semibold ${Number(user.level) >= 7 ? "text-red-600" : "text-gray-900"}`}>{user.level}</span>
                  )}
                </td>
                {currentUser && Number(currentUser.level) >= 6 && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingUserId !== user._id && (
                      <button
                        onClick={() => setEditingUserId(user._id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit Level
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (

   <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
    <button
                    onClick={handleBack}
                    className="mb-4 text-3xl text-black-500 hover:text-blue-700 flex items-center"
                >
                    &larr;
                </button>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">User Management Dashboard</h1>
      
      {currentUser && Number(currentUser.level) >= 5 ? (
        <>
          {/* User Verification Tool - RESTRICTED TO EXACTLY LEVEL 5 */}
          {Number(currentUser.level) === 5 && (
            <div className="mt-8 bg-white p-6 shadow-xl rounded-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">
                User Verification Tool
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Enter a user's verification code to confirm their identity and upgrade them to Level 1.
              </p>
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
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-end">
                <div className="flex-grow w-full">
                  <label
                    htmlFor="verificationCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter code here"
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleCheckCode}
                  className="w-full sm:w-auto py-3 px-6 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
                >
                  Check Code
                </button>
              </div>

              {userToVerify && (
                <div className="mt-6 p-4 border border-gray-300 rounded-md bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    User to Verify:
                  </h3>
                  <p><strong>Username:</strong> {userToVerify.username}</p>
                  <p><strong>Email:</strong> {userToVerify.email}</p>
                  <p><strong>Current Level:</strong> {userToVerify.level}</p>
                  <div className="flex justify-start space-x-4 mt-4">
                    <button
                      onClick={() => handleVerificationAction("verify")}
                      className="py-2 px-6 bg-green-500 text-white rounded-md font-semibold hover:bg-green-600 transition-colors"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerificationAction("reject")}
                      className="py-2 px-6 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User List Table and Level Editing - RESTRICTED TO LEVEL 6+ */}
          {Number(currentUser.level) >= 6 && (
            <>
              <p className="text-lg text-gray-600">
                View and manage user access levels according to your permissions.
              </p>
              {renderUserTable()}
            </>
          )}
        </>
      ) : (
        <p className="mt-8 text-xl text-red-500 font-semibold">
          Access Denied: You do not have permission to view this page.
        </p>
      )}
    </div>
  );
};

export default UserManagement;