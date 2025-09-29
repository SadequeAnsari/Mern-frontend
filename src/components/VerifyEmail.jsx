import React, { useState, useEffect } from "react";

const VerifyEmail = () => {
  const [message, setMessage] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [level5Users, setLevel5Users] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH LEVEL 5 USERS ---
  useEffect(() => {
    const fetchLevel5Users = async () => {
      try {
        const response = await fetch(
          // Uses the specific API endpoint for level 5 users
          "https://mern-backend-two-mu.vercel.app/api/users/level/5",
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();

          setLevel5Users(data); // Directly set the fetched level 5 users

        } else {
          setMessage({
            text: "Failed to fetch the list of verifiers.",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Error fetching level 5 users:", error);
        setMessage({
          text: "An error occurred while fetching verifiers. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchLevel5Users();
  }, []);

  // --- 2. HANDLER TO REQUEST CODE ---
  const handleRequestCode = async (verifierId) => {
    setMessage("");
    setGeneratedCode("");
    try {
      const response = await fetch(
        "https://mern-backend-two-mu.vercel.app/api/verification/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ verifierId }),
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok) {
        setGeneratedCode(data.code);
        setMessage({
          text: "Verification code generated successfully! Show this code to the verifier.",
          type: "success",
        });
      } else {
        setMessage({ text: data.message || "Failed to generate code.", type: "error" });
      }
    } catch (error) {
      setMessage({
        text: "Network error occurred during code generation.",
        type: "error",
      });
    }
  };

  // --- 3. RENDERING ---
  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
        Request Verification from a Level 5 User
      </h2>

      {loading ? (
        <p className="text-center text-blue-500">Loading verifiers...</p>
      ) : level5Users.length > 0 ? (
        <ul className="space-y-4">
          {level5Users.map((user) => (
            <li
              key={user._id}
              className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
            >
              <span className="font-semibold text-gray-700">
                {user.username} ({user.email})
              </span>
              <button
                onClick={() => handleRequestCode(user._id)}
                className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors shadow-md"
              >
                Request Code
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-red-500 font-medium p-4 border border-red-200 bg-red-50 rounded-lg">
          No Level 5 verifiers found. Please check your database or try again later.
        </p>
      )}

      {/* Message Display */}
      {message && (
        <div
          className={`mt-6 p-4 rounded-md ${
            message.type === "error"
              ? "bg-red-100 text-red-700 border border-red-400"
              : "bg-green-100 text-green-700 border border-green-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Generated Code Display */}
      {generatedCode && (
        <div className="text-center mt-6 p-5 bg-blue-50 border-t-4 border-blue-500 rounded-b-lg">
          <p className="text-lg font-bold text-gray-800">
            Your Verification Code:
          </p>
          <code className="block mt-2 p-3 bg-blue-100 rounded-md text-2xl font-mono text-blue-800 select-all shadow-inner">
            {generatedCode}
          </code>
          <p className="text-sm text-gray-500 mt-2">
            Show this code to the Level 5 Verifier.
          </p>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;