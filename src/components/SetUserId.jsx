import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SetUserId = () => {
  const [userid, setUserid] = useState("@");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!userid.startsWith("@")) {
      setError("User ID must start with @");
      return;
    }
    if (userid.length < 4) {
      setError("User ID must be at least 4 characters.");
      return;
    }
    setLoading(true);
    const response = await fetch("https://mern-backend-topaz.vercel.app/set-userid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, userid }),
    });
    const data = await response.json();
    setLoading(false);
    if (response.ok) {
      alert("User ID set successfully!");
      navigate("/login");
    } else {
      setError(data.message || "Failed to set User ID.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-indigo-50">
      <div className="rounded-2xl w-full max-w-md p-8 text-black bg-white shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-3">
          Set Your <span className="text-green-500">User ID</span>
        </h1>
        <hr className="border-black mb-6" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="email"
            placeholder="Registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border-2 border-black rounded-lg bg-transparent"
          />
          <input
            type="text"
            name="userid"
            placeholder="User ID (start with @)"
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            required
            className="w-full px-4 py-2 border-2 border-black rounded-lg bg-transparent"
          />
          {error && <div className="text-red-600 text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
          >
            {loading ? "Setting User ID..." : "Set User ID"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetUserId;
