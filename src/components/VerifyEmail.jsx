import React, { useState, useEffect } from "react";

const VerifyEmail = () => {
  const [message, setMessage] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [level5Users, setLevel5Users] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevel5Users = async () => {
      try {
        const response = await fetch(
          "https://mern-backend-two-mu.vercel.app/api/users/level/5",
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setLevel5Users(data);
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

  const handleRequestCode = async (verifierId) => {
    setMessage("");
    setGeneratedCode("");
    try {
      const response = await fetch(
        "https://mern-backend-two-mu.vercel.app/api/verification/request",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            verifierId,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setGeneratedCode(data.code);
        setMessage({
          text: data.message,
          type: "success",
        });
      } else {
        setMessage({
          text: data.message || "Failed to request verification code.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error during code request:", error);
      setMessage({
        text: "An error occurred. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col items-center mt-0 p-8">
      <div className="bg-white p-8 rounded-lg shadow-xl border w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Request Account Verification
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

        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Select a Verifier
        </h3>
        {loading ? (
          <p className="text-center text-gray-500">Loading verifiers...</p>
        ) : level5Users.length > 0 ? (
          <ul className="space-y-3">
            {level5Users.map((user) => (
              <li
                key={user._id}
                className="flex items-center justify-between p-3 bg-gray-100 rounded-md shadow-sm"
              >
                <span className="font-medium text-gray-800">
                  {user.username} ({user.email})
                </span>
                <button
                  onClick={() => handleRequestCode(user._id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
                >
                  Generate Code
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">
            No Level 5 verifiers found.
          </p>
        )}

        {generatedCode && (
          <div className="text-center mt-6">
            <p className="text-lg font-semibold text-gray-800">
              Your Verification Code:
            </p>
            <code className="block mt-2 p-3 bg-gray-200 rounded-md text-xl font-mono text-blue-800 select-all">
              {generatedCode}
            </code>
            <p className="text-sm text-gray-500 mt-2">
              Please share this code with the verifier you selected.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
