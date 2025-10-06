import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Post from './Post';

const Profile = ({ currentUserId }) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
    

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `https://mern-backend-two-mu.vercel.app/profile/${userId}`,
                    {
                        method: 'GET',
                        credentials: 'include',
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setProfile(data.userProfile);
                    setPosts(data.posts);
                } else {
              
                    const responseText = await response.text();
                    try {
                        // Attempt to parse as JSON if we think it should be JSON (e.g., for 404/403 errors)
                        const errorData = JSON.parse(responseText);
                        setError(errorData.message || 'Failed to fetch user profile with known error.');
                    } catch {
                        // If parsing as JSON fails (it's HTML/Plain Text), show a generic message
                        setError(`Failed to load profile. Server responded with status ${response.status}.`);
                        // Optional: console.error("Non-JSON Response:", responseText);
                    }
                }
                
            } catch (err) {
                // console.error("Fetch error:", err);
                // setError('An unexpected error occurred.');

                 console.error("Fetch error:", err);
                // This catch block handles network errors AND the SyntaxError from bad JSON.
                setError('A network or parsing error occurred. Check your server connection/URL.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const handleBack = () => {
        navigate(-1); // Go back to the previous page
    };


const handleShare = (post) => {
    navigator.clipboard
      .writeText(`${window.location.origin}/posts/${post._id}`)
      .then(() => {
        alert("Post link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        alert("Failed to copy link.");
      });
  };

  const handleBookmarkPost = async (postId) => {
    const isPostBookmarked = bookmarkedPosts.some(
      (bookmark) => bookmark._id === postId
    );

    if (isPostBookmarked) {
      // Remove bookmark
      try {
        const response = await fetch(
          `https://mern-backend-two-mu.vercel.app/api/bookmarks/${postId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (response.ok) {
          setBookmarkedPosts(
            bookmarkedPosts.filter((bookmark) => bookmark._id !== postId)
          );
          alert("Bookmark removed!");
        } else {
          const errorText = await response.text();
          console.error(
            "Failed to remove bookmark:",
            response.status,
            errorText
          );
          alert(
            `Failed to remove bookmark. Server responded with status: ${response.status}`
          );
        }
      } catch (error) {
        console.error("Error removing bookmark:", error);
        alert("An error occurred while removing the bookmark.");
      }
    } else {
      // Add bookmark
      try {
        const response = await fetch(
          `https://mern-backend-two-mu.vercel.app/api/bookmarks/${postId}`,
          {
            // Corrected URL here
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ postId }),
          }
        );

        if (response.ok) {
          const postToAdd = posts.find((post) => post._id === postId);
          if (postToAdd) {
            setBookmarkedPosts([...bookmarkedPosts, postToAdd]);
            alert("Post bookmarked!");
          } else {
            alert(
              "Post bookmarked successfully, but failed to update the list."
            );
            fetchBookmarkedPosts();
          }
        } else {
          const errorText = await response.text();
          console.error("Failed to add bookmark:", response.status, errorText);
          alert(
            `Failed to add bookmark. Server responded with status: ${response.status}`
          );
        }
      } catch (error) {
        console.error("Error adding bookmark:", error);
        alert("An error occurred while adding the bookmark.");
      }
    }
  };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl font-semibold">Loading profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600 bg-red-100 rounded-lg">
                <p>{error}</p>
                <button
                    onClick={handleBack}
                    className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-8 text-center">
                <p className="text-xl text-gray-700">Profile not found.</p>
            </div>
        );
    }


    return (
        <div className="container mx-auto p-8 max-w-4xl">
            {/* Header and Profile Card */}
            <div className="mb-8 p-6 bg-white shadow-xl rounded-lg border-t-4 border-blue-500">
                <button
                    onClick={handleBack}
                    className="mb-4 text-blue-500 hover:text-blue-700 flex items-center"
                >
                    &larr; Back
                </button>
                <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                        {profile.username[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            {profile.username}
                        </h1>
                        <p className="text-lg text-gray-600">{profile.email}</p>
                        <p className="text-sm text-gray-500">
                            User Level: {profile.level}
                        </p>
                    </div>
                </div>
            </div>

            {/* Posts Section */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                {posts.length} Posts by {profile.username}
            </h2>

            <div className="space-y-6">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Post
                            key={post._id}
                            post={post}
                            onShare={handleShare}
                            onBookmark={handleBookmarkPost}
                            onDelete={null} // Don't show delete button
                            onEdit={null}   // Don't show edit button
                            isAuthor={false} // User is not viewing their own profile in this context
                            isBookmarked={bookmarkedPosts.some(
                  (bookmark) => bookmark._id === post._id
                )}
                        />
                    ))
                ) : (
                    <div className="text-center p-10 bg-gray-100 rounded-lg">
                        <p className="text-gray-500">
                            This user hasn't created any posts yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;