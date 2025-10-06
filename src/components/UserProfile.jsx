
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";


const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]); // New state for posts
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  

  // A default/placeholder image for users without one
  const defaultProfileImage = 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png';

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    const fetchProfileData = async () => {
      let fetchedUser = null;
      setLoading(true);
      try {
        // 1. Fetch user profile from backend
        const profileResponse = await fetch("https://mern-backend-two-mu.vercel.app/profile", {
          method: "GET",
          credentials: "include", // send cookies
        });

        if (profileResponse.ok) {
          const data = await profileResponse.json();
          fetchedUser = {
            ...data.user,
            // Ensure a profile image is available for display
            profileImage: data.user.profileImage || defaultProfileImage
          };
          setUser(fetchedUser);

          // 2. Fetch user's posts using the new route
          if (fetchedUser) {
            const postsResponse = await fetch(`https://mern-backend-two-mu.vercel.app/posts/user/${fetchedUser._id}`,
              { method: 'GET', credentials: 'include' });

            
            if (postsResponse.ok) {
              const postsData = await postsResponse.json();
              setUserPosts(postsData);
            } else {
               console.error("Failed to fetch user posts.");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [navigate]); // navigate is stable, but added for completeness

  // Redirect if not logged in after loading
  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (!user) {
    return null; 
  }

  // Helper to format date
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 sm:p-8">
      {/* Back Button */}
      <button 
        onClick={goBack} 
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-150"
      >
        &larr; Back
      </button>

      {/* Profile Card (User Details and Image) */}
      <div className="bg-white border rounded shadow-lg p-6 mb-8">
        <div className="flex items-center space-x-6">
          <img 
            className="w-24 h-24 object-cover rounded-full border-4 border-indigo-300" 
            src={user.profileImage} 
            alt={`${user.username}'s Profile`} 
          />
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">{user.username}</h2>
            <p className="text-xl text-indigo-600 font-medium">
              <span className="font-normal text-gray-500">User ID:</span> {user.userid || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-4">
          <p className="mt-2 text-gray-700">
            <strong className="text-gray-900">Email:</strong> {user.email}
          </p>
          <p className="mt-2 text-gray-700">
            <strong className="text-gray-900">Phone:</strong> {user.phone || 'N/A'}
          </p>
          <p className="mt-2 text-gray-700">
            <strong className="text-gray-900">Account Level:</strong> {user.level}
          </p>
        </div>
      </div>

      {/* User Posts Section */}
      <div className="mt-10">
        <h3 className="text-2xl font-bold mb-4 border-b pb-2 text-gray-800">
          {user.username}'s Posts ({userPosts.length})
        </h3>
        {userPosts.length > 0 ? (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <div key={post._id} className="p-4 bg-gray-50 border rounded shadow-sm hover:shadow-md transition">
                <p className="text-gray-700 leading-relaxed">{post.content}</p>
                <p className="text-sm text-gray-400 mt-2">Posted on: {formatDate(post.createdAt)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No posts found for this user.</p>
        )}


       
      </div>
    </div>
  );
};

export default UserProfile;