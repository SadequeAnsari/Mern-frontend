import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [emailOrUserid, setEmailOrUserid] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("https://mern-backend-two-mu.vercel.app/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUserid, password }),
      credentials: "include", // to send/receive cookies
    });
    const data = await response.json();
    if (response.ok) {
      setMessage(data.message);
      navigate("/"); // Redirect to Home on success
    } else {
      setMessage(data.message);
      alert(data.message);
    }
  };

  return (
    <div className="flex justify-center p-4 min-h-screen">
      <div className="rounded-2xl w-full max-w-sm mt-10 sm:mt-20 p-6 sm:p-10 text-black bg-indigo-50 shadow-2xl h-fit self-center">
        <h1 className="text-3xl tracking-tighter text-center mb-3">
          Login <span className="text-green-500 font-semibold">Account!</span>
        </h1>
        <hr className="border-black" />
        <div className="mt-5 flex justify-center text-black">
          <form onSubmit={handleSubmit} className="w-full">
            <input
              className="w-full px-5 py-2 mt-2 border-2 border-black rounded-lg bg-transparent"
              type="text"
              name="emailOrUserid"
              placeholder="Email or User ID"
              value={emailOrUserid}
              onChange={(e) => setEmailOrUserid(e.target.value)}
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
              className="px-5 py-2 border-2 border-green-500 bg-green-500 rounded-lg mt-5 text-white w-full text-lg font-medium cursor-pointer"
              type="submit"
              value="Login"
            />
            <p className="text-center mt-2 text-red-500">{message}</p>
            <Link
              to="/signup"
              className="block text-center text-blue-500 mt-5 underline underline-offset-2 text-base"
            >
              Create An Account?
            </Link>
            <Link
              to="/forgot-password"
              className="block text-center text-red-500 mt-2 underline underline-offset-2 text-base"
            >
              Forgot Password?
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
