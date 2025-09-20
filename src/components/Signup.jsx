import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    const response = await fetch("https://mern-backend-two-mu.vercel.app/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, phone, email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      setMessage(data.message);
      alert(data.message);
      navigate("/set-userid");
    } else {
      setMessage(data.message);
      alert(data.message);
    }
  };

  return (
    <div className="flex justify-center min-h-screen">
      <div className="rounded-2xl w-full max-w-sm md:max-w-md p-6 sm:p-10 mt-10 md:mt-5 pb-5 text-black bg-indigo-50 shadow-2xl h-fit self-center">
        <h1 className="text-3xl tracking-tighter text-center mb-3">
          Create Your{" "}
          <span className="text-green-500 font-semibold">Account!</span>
        </h1>
        <hr className="border-black" />
        <div className="mt-5 flex justify-center text-black">
          <form onSubmit={handleSubmit} className="w-full">
            <input
              className="w-full px-5 py-2 mt-2 border-2 border-black rounded-lg bg-transparent"
              type="text"
              name="username"
              placeholder="User Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <br />
            <input
              className="w-full px-5 py-2 mt-2 border-2 border-black rounded-lg bg-transparent"
              type="text"
              name="phone"
              placeholder="Mobile No."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <br />
            <input
              className="w-full px-5 py-2 mt-2 border-2 border-black rounded-lg bg-transparent"
              type="text"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <br />
            <input
              className="w-full px-5 py-2 mt-2 border-2 border-black rounded-lg bg-transparent"
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <br />
            <input
              className="w-full px-5 py-2 mt-2 border-2 border-black rounded-lg bg-transparent"
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <br />
            <input
              className="px-5 py-2 border-2 border-green-500 bg-green-500 rounded-lg mt-5 text-white w-full text-lg font-medium cursor-pointer"
              type="submit"
              value="Create Account"
            />
            <Link
              to="/login"
              className="block text-center text-blue-500 mt-5 underline underline-offset-2 text-base"
            >
              Login?
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
