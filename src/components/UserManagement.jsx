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

  // --- API Handlers ---

  const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };

  const fetchUsers = async () => {
    try {
      // This is the call that retrieves all users.
      // The backend MUST enforce the level 7+ check and return a 403 if the user is unauthorized.
      const response = await fetch("https://mern-backend-two-mu.vercel.app/api/users", {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 403) {
        // Redirect if the current user is not level 7+ (or whatever the backend requires)
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
    // This is the call that allows level 7+ users to increase/decrease levels.
    if (!currentUser || Number(currentUser.level) < 7) {
        alert("You do not have permission to change user levels.");
        return;
    }

    try {
      const response = await fetch(`https://mern-backend-two-mu.vercel.app/api/users/${userId}/level`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ level: newLevel }),
      });

      if (response.ok) {
        // Update the user list locally to reflect the change
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, level: newLevel } : user
          )
        );
        setEditingUserId(null); // Exit editing mode
      } else if (response.status === 403) {
        alert("Permission denied. Your level is not high enough.");
      } else {
        const errorData = await response.json();
        alert(`Failed to update level: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error changing user level:", error);
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


  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, []);

  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading users...</p>
      </div>
    );
  }

  // --- Rendering Functions ---

  const renderLevelInput = (user) => {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min="0"
          max="9"
          value={user.level}
          onChange={(e) =>
            setUsers((prevUsers) =>
              prevUsers.map((u) =>
                u._id === user._id ? { ...u, level: Number(e.target.value) } : u
              )
            )
          }
          className="w-16 p-1 border border-gray-300 rounded-md text-center"
        />
        <button
          onClick={() => handleLevelChange(user._id, user.level)}
          className="py-1 px-3 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
        >
          Save
        </button>
        <button
          onClick={() => setEditingUserId(null)}
          className="py-1 px-3 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  };

  const renderUserTable = () => (
    <div className="mt-8 bg-white p-6 shadow-xl rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
        User List
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingUserId === user._id ? (
                    renderLevelInput(user)
                  ) : (
                    <span
                      className={`font-semibold ${
                        Number(user.level) >= 7 ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {user.level}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {currentUser && Number(currentUser.level) >= 7 && ( // Check for admin privilege
                    <>
                      {editingUserId !== user._id && (
                        <button
                          onClick={() => setEditingUserId(user._id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit Level
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    </div>
    
  );

  return (
    
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
       <button
          onClick={handleBack}
          className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-150"
        >
          &larr; Back
        </button>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
        User Management Dashboard
      </h1>
      
      {/* Conditional rendering based on user level - FIX APPLIED */}
      {currentUser && (Number(currentUser.level) >= 7 || Number(currentUser.level) === 5) ? (
        <>
          {/* User Verification Tool - RESTRICTED TO EXACTLY LEVEL 5 */}
          {Number(currentUser.level) === 5 && (
            <div className="mt-8 bg-white p-6 shadow-xl rounded-lg">
              <p className="text-lg text-gray-600 mb-4">
                Access the User Verification Tool. (Level 5 Only)
              </p>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">
                User Verification Tool
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
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-end">
                <div className="flex-grow w-full">
                  <label
                    htmlFor="verificationCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Enter User's Verification Code
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="e.g., UABC-1234"
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
                  <p>
                    <strong>Username:</strong> {userToVerify.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {userToVerify.email}
                  </p>
                  <p>
                    <strong>Current Level:</strong> {userToVerify.level}
                  </p>
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

          {/* User List Table and Level Editing - RESTRICTED TO LEVEL 7+ */}
          {Number(currentUser.level) >= 7 && (
            <>
              <p className="text-lg text-gray-600">
                Control and modify user access levels. (Admin Level 7+ Required)
              </p>
              {renderUserTable()}
            </>
          )}
          
          {/* Fallback Message for L5 if L7+ content is not shown */}
          {Number(currentUser.level) === 5 && (
            <p className="mt-8 text-lg text-indigo-600 font-semibold">
              {/* Your current access level (5) allows you to use the User Verification Tool, but not the full User List Table or Level Editing features. */}
            </p>
          )}

        </>
      ) : (
        <p className="mt-8 text-xl text-red-500 font-semibold">
          {/* Access Denied: You must be a Level 5 or Level 7+ user to access tools on this page. */}
        </p>
      )}
    </div>
  );
};

export default UserManagement;