import React, { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    const response = await fetch("https://mern-backend-topaz.vercel.app/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    setMessage(data.message);
    if (response.ok) {
      alert("Your OTP is: " + data.otp);
      setStep(2);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    const response = await fetch("https://mern-backend-topaz.vercel.app/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    const data = await response.json();
    setMessage(data.message);
    if (response.ok) setStep(3);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-indigo-50 p-4">
      <div className="rounded-2xl w-full max-w-md p-8 text-black bg-white shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-3">Forgot Password</h1>
        <hr className="border-black mb-6" />
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-black rounded-lg bg-transparent"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
            >
              Send OTP
            </button>
            <Link
              to="/login"
              className="block text-center text-blue-500 mt-5 underline underline-offset-2 text-base"
            >
              Back to Login
            </Link>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-black rounded-lg bg-transparent"
            />
            <input
              type="password"
              name="newPassword"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-black rounded-lg bg-transparent"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Reset Password
            </button>
          </form>
        )}
        {step === 3 && (
          <div className="mt-4 text-green-700 text-center">
            Password reset successful! You can now login with your new password.
            <Link
              to="/login"
              className="block text-center text-blue-500 mt-2 underline underline-offset-2 text-base"
            >
              Go to Login
            </Link>
          </div>
        )}
        {message && (
          <div
            className={`mt-4 text-center ${
              message.includes("success") ? "text-green-700" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
