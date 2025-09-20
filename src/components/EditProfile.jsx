import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [user, setUser] = useState({ username: "", email: "", phone: "" });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current user profile
    const fetchProfile = async () => {
      const response = await fetch("https://mern-backend-two-mu.vercel.app/profile", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    };
    fetchProfile();
    // navigate('/');
  }, []);

  return (
    <div>
      <main className="flex-1 p-4">
        <div className="max-w-md mx-auto mt-4 md:mt-10 p-6 bg-white border rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updatedUser = {
                userid: formData.get("userid"),
                username: formData.get("username"),
                email: formData.get("email"),
                phone: formData.get("phone"),
              };
              if (!updatedUser.userid.startsWith("@")) {
                alert("User ID must start with @");
                return;
              }
              const response = await fetch("https://mern-backend-two-mu.vercel.app/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(updatedUser),
              });
              if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                alert("Profile updated!");
                navigate("/");
              } else {
                const data = await response.json();
                alert(data.message || "Failed to update profile");
              }
            }}
          >
            <div className="mb-4">
              <label className="block mb-1 font-medium">User ID</label>
              <input
                type="text"
                name="userid"
                defaultValue={user.userid}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <span className="text-xs text-gray-500">
                User ID must start with @
              </span>

              <label className="block mb-1 font-medium">Username</label>
              <input
                type="text"
                name="username"
                defaultValue={user.username}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={user.email}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Phone</label>
              <input
                type="text"
                name="phone"
                defaultValue={user.phone}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
