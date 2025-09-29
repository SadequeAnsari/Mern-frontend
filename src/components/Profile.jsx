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
                    // const errorData = await response.json();
                    // setError(errorData.message || 'Failed to fetch user profile.');

                    // *** CRITICAL CHANGE HERE ***
                    // Check if response is not ok (e.g., 404, 500)
                    // If the server returns HTML instead of JSON, .json() will throw the SyntaxError.
                    // Instead, read the text, or just assume a generic failure if the server is broken.
                    
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

    // Since this is a view-only profile, we'll keep the Post component interactions simple.
    // Full logic for bookmarking/sharing should be added here if needed.
    const noOp = () => alert('Feature disabled in public profile view.');


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
                            onShare={noOp} // No-op for sharing/bookmarking in this simple view
                            onBookmark={noOp}
                            onDelete={null} // Don't show delete button
                            onEdit={null}   // Don't show edit button
                            isAuthor={false} // User is not viewing their own profile in this context
                            isBookmarked={false} 
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