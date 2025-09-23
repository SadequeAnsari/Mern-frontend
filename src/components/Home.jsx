import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Post = ({ post, onShare, onDelete, onEdit, onBookmark, isAuthor ,  isBookmarked }) => {
  const [menuOpen, setMenuOpen] = useState(false);

    // Bookmark icon and text based on isBookmarked prop
  const bookmarkIcon = isBookmarked ? (
    <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
          </svg>
  ) : (
   <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="15" viewBox="0 0 48 48" fill="none"
      stroke="currentColor">
<path strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2} d="M 15 3 C 12.250484 3 10 5.2504839 10 8 L 10 45 A 1.0001 1.0001 0 0 0 11.609375 45.792969 L 25.904297 34.796875 A 1.0006638 1.0006638 0 1 0 24.683594 33.210938 L 12 42.96875 L 12 8 C 12 6.3315161 13.331516 5 15 5 L 33 5 C 34.668484 5 36 6.3315161 36 8 L 36 42.96875 L 27.681641 36.570312 A 1.0001 1.0001 0 1 0 26.462891 38.15625 L 36.390625 45.792969 A 1.0001 1.0001 0 0 0 38 45 L 38 8 C 38 5.2504839 35.749516 3 33 3 L 15 3 z"></path>
</svg>
  );

  const bookmarkText = isBookmarked ? "Unbookmark" : "Bookmark";
  const bookmarkColor = isBookmarked ? "text-blue-500" : "text-gray-600";


  return (
    <div key={post._id} className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {/* {post.author ? post.author.username[0].toUpperCase() : "A"} \\\\ */}
          {post.author && post.author.username ? post.author.username[0].toUpperCase() : "A"}
        </div>
        <div className="flex-grow">
          <h4 className="font-semibold text-gray-900">
            {/* {post.author ? post.author.username : "Anonymous"}  */}
            {post.author && post.author.username ? post.author.username : "Anonymous"}
          </h4>
          <p className="text-sm text-gray-500">
            {new Date(post.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </p>
        </div>
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-full hover:bg-gray-200 transition"
              aria-label="Post menu"
            >
              <svg
                width="24"
                height="24"
                fill="currentColor"
                className="text-gray-600"
              >
                <circle cy="5" cx="12" r="2" />
                <circle cy="12" cx="12" r="2" />
                <circle cy="19" cx="12" r="2" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    if (onEdit) onEdit(post);
                    setMenuOpen(false);
                  }}
                >
                  Edit
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    if (onDelete) onDelete(post._id);
                    setMenuOpen(false);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-gray-800">{post.content}</p>

      
      {/* Social interaction icons */}
      <div className="flex items-center space-x-4 mt-4">
        {/* Bookmark Icon */}
        <button
          onClick={() => onBookmark(post._id)}
          className={`flex items-center space-x-1 hover:text-blue-500 transition ${bookmarkColor}`}
        >
          {bookmarkIcon}
          <span>{bookmarkText}</span>
        </button>

        {/* Share Icon */}
        <button
          onClick={() => onShare(post)}
          className="flex items-center space-x-1 text-gray-600 hover:text-yellow-500 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M15 8a3 3 0 10-2.977-2.7L5.584 8.412a3.001 3.001 0 000 3.176l6.439 3.189a3 3 0 10.896-1.785L8.216 10.3a3.001 3.001 0 000-2.6z" />
          </svg>
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isBookmarksView, setIsBookmarksView] = useState(false);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const fetchAllPosts = async () => {
    try {
      const postsResponse = await fetch("https://mern-backend-two-mu.vercel.app/posts", {
        method: "GET",
        credentials: "include",
      });

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  const fetchBookmarkedPosts = async () => {
    try {
      const bookmarksResponse = await fetch(
        "https://mern-backend-two-mu.vercel.app/api/bookmarks",
        {
          method: "GET",
          credentials: "include", // if using cookies for auth
        }
      );
      if (bookmarksResponse.ok) {
        const bookmarksData = await bookmarksResponse.json();
        setBookmarkedPosts(bookmarksData);
      } else {
        // handle errors
        const errorData = await bookmarksResponse.json();
        console.error("Failed to fetch bookmarked posts:", errorData.message);
      }
    } catch (error) {
      console.error("Failed to fetch bookmarked posts:", error);
    }
  };

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        const profileResponse = await fetch("https://mern-backend-two-mu.vercel.app/profile", {
          method: "GET",
          credentials: "include",
        });

        if (profileResponse.ok) {
          const data = await profileResponse.json();
          setUser(data.user);
        }

        await fetchAllPosts();
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndPosts();
  }, [navigate]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch("https://mern-backend-two-mu.vercel.app/delete-account", {
          method: "PATCH",
          credentials: "include",
        });

        if (response.ok) {
          alert("Your account has been deleted.");
          navigate("/login");
        } else {
          alert("Failed to delete account. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("An error occurred. Please try again.");
      }
    }
  };

  const handlePostSubmit = async () => {
    if (!postContent.trim()) {
      alert("Post content cannot be empty.");
      return;
    }

    if (user.level === "0") {
      alert("Account not verified. Please verify your email to create posts.");
      setIsPopupOpen(false);
      return;
    }

    try {
      const response = await fetch("https://mern-backend-two-mu.vercel.app/create-post", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: postContent }),
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setPostContent("");
        setIsPopupOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`https://mern-backend-two-mu.vercel.app/posts/${postId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          setPosts(posts.filter((post) => post._id !== postId));
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Failed to delete post.");
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("An error occurred while deleting the post.");
      }
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostContent(post.content);
    setIsEditPopupOpen(true);
  };

  const handleEditPostSubmit = async () => {
    if (!postContent.trim()) {
      alert("Post content cannot be empty.");
      return;
    }

    try {
      const response = await fetch(
        `https://mern-backend-two-mu.vercel.app/posts/${editingPost._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: postContent }),
        }
      );

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(
          posts.map((p) => (p._id === updatedPost._id ? updatedPost : p))
        );
        setPostContent("");
        setEditingPost(null);
        setIsEditPopupOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update post. Please try again.");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("An error occurred while updating the post.");
    }
  };


 const handleBookmarkPost = async (postId) => {
  const isPostBookmarked = bookmarkedPosts.some((bookmark) => bookmark._id === postId);

  if (isPostBookmarked) {
    // Remove bookmark
    try {
      const response = await fetch(`https://mern-backend-two-mu.vercel.app/api/bookmarks/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setBookmarkedPosts(bookmarkedPosts.filter((bookmark) => bookmark._id !== postId));
        alert("Bookmark removed!");
      } else {
        const errorText = await response.text();
        console.error("Failed to remove bookmark:", response.status, errorText);
        alert(`Failed to remove bookmark. Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
      alert("An error occurred while removing the bookmark.");
    }
  } else {
    // Add bookmark
    try {
      const response = await fetch(`https://mern-backend-two-mu.vercel.app/api/bookmarks/${postId}`, { // Corrected URL here
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const postToAdd = posts.find(post => post._id === postId);
        if (postToAdd) {
          setBookmarkedPosts([...bookmarkedPosts, postToAdd]);
          alert("Post bookmarked!");
        } else {
          alert("Post bookmarked successfully, but failed to update the list.");
          fetchBookmarkedPosts();
        }
      } else {
        const errorText = await response.text();
        console.error("Failed to add bookmark:", response.status, errorText);
        alert(`Failed to add bookmark. Server responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error adding bookmark:", error);
      alert("An error occurred while adding the bookmark.");
    }
  }
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

  const handleViewBookmarks = () => {
    setMenuOpen(false);
    setIsBookmarksView(true);
    fetchBookmarkedPosts();
  };

  const handleViewAllPosts = () => {
    setIsBookmarksView(false);
    fetchAllPosts();
  };

  if (loading) {
    return (
      <div className="text-3xl my-[16rem] mx-[30rem]">Loading Profile...</div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      
      <div className="relative flex min-h-screen bg-gray-50 md:flex-row flex-col">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-white shadow-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center py-8 h-full">
          <div className="mb-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-700">
              {user.username[0].toUpperCase()}
            </div>
            <div className="text-center text-2xl font-semibold">
              {user.username}
            </div>
            <div className="text-sm text-gray-500 text-center">
              {user.email}
            </div>
            <button
              className="mt-4 px-2 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile
            </button>
            {parseInt(user.level) < 1 && (
              <button
                className="px-2 py-2 mt-2 bg-purple-500 text-white rounded cursor-pointer hover:bg-purple-600 transition"
                onClick={() => navigate("/verify-email")}
              >
                Get Verified
              </button>
            )}
          </div>

          <nav className="flex mt-55 flex-col gap-2 w-full px-4">
            <button
              className="px-3 py-2 rounded hover:bg-gray-200 transition"
              onClick={() => navigate("/user-profile")}
            >
              Profile
            </button>
            <div className="relative">
              <button
                className="w-full px-3 py-2 rounded hover:bg-gray-200 transition"
                onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
              >
                Settings
              </button>
              {isSettingsMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setIsSettingsMenuOpen(false);
                      navigate("/edit-profile");
                    }}
                  >
                    Edit Profile
                  </button>
                  {parseInt(user.level) >= 2 && (
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setIsSettingsMenuOpen(false);
                        navigate("/user-management");
                      }}
                    >
                      User Management
                    </button>
                  )}
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    onClick={async () => {
                      await fetch(
                        "https://mern-backend-two-mu.vercel.app/logout",
                        {
                          method: "POST",
                          credentials: "include",
                        }
                      );
                      setIsSettingsMenuOpen(false);
                      setUser(null);
                      navigate("/login");
                    }}
                  >
                    Logout
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 bg-red-500 text-white font-bold rounded-b-lg hover:bg-red-600 transition cursor-pointer"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>
      </div>

      <main className="flex-1 flex flex-col relative p-8 overflow-y-auto">
        <div className="absolute top-6 right-8">
          <button
            className="p-2 rounded-full hover:bg-gray-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            <svg
              width="24"
              height="24"
              fill="currentColor"
              className="text-gray-600"
            >
              <circle cy="5" cx="12" r="2" />
              <circle cy="12" cx="12" r="2" />
              <circle cy="19" cx="12" r="2" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/edit-profile");
                }}
              >
                Edit Profile
              </button>
              
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handleViewBookmarks}
              >
                Bookmarks
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                onClick={async () => {
                  await fetch("https://mern-backend-two-mu.vercel.app/logout", {
                    method: "POST",
                    credentials: "include",
                  });
                  setMenuOpen(false);
                  setUser(null);
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Create Post Popup */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Create a new post</h3>
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  &times;
                </button>
              </div>
              <textarea
                className="w-full h-32 p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              ></textarea>
              <div className="flex items-center space-x-4 mb-4">
                <label className="flex items-center px-4 py-2 border rounded cursor-pointer hover:bg-gray-100 transition">
                  <span className="mr-2">萄</span>
                  <span>Photos</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                  />
                </label>
                <label className="flex items-center px-4 py-2 border rounded cursor-pointer hover:bg-gray-100 transition">
                  <span className="mr-2">道</span>
                  <span>Videos</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*"
                    multiple
                  />
                </label>
              </div>
              <button
                className="w-full py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-600 transition"
                onClick={handlePostSubmit}
              >
                Post
              </button>
            </div>
          </div>
        )}

        {/* Edit Post Popup */}
        {isEditPopupOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Edit your post</h3>
                <button
                  onClick={() => setIsEditPopupOpen(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  &times;
                </button>
              </div>
              <textarea
                className="w-full h-32 p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              ></textarea>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded font-bold hover:bg-gray-400 transition"
                  onClick={() => setIsEditPopupOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-600 transition"
                  onClick={handleEditPostSubmit}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Display Posts Section */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {isBookmarksView ? "Bookmarked Posts" : "Recent Posts"}
            </h2>
            {isBookmarksView && (
              <button
                onClick={handleViewAllPosts}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
              >
                View All Posts
              </button>
            )}
          </div>
          {isBookmarksView ? (
            bookmarkedPosts.length > 0 ? (
              bookmarkedPosts.map((post) => (
                <Post
                  key={post._id}
                  post={post}
                  onShare={handleShare}
                  onBookmark={handleBookmarkPost}
                  isAuthor={user && post.author && post.author._id === user._id}
                   isBookmarked={true} 
                />
              ))
            ) : (
              <p className="text-gray-500">You have no bookmarked posts yet.</p>
            )
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <Post
                key={post._id}
                post={post}
                onShare={handleShare}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
                onBookmark={handleBookmarkPost}
                isAuthor={user && post.author && post.author._id === user._id}
                isBookmarked={bookmarkedPosts.some((bookmark) => bookmark._id === post._id)}
              />
            ))
          ) : (
            <p className="text-gray-500">
              No posts to display yet. Be the first to post!
            </p>
          )}
        </div>

        {user.level >= "1" && (
          <button
            className="fixed bottom-8 right-8 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg transition z-50"
            aria-label="Add"
            onClick={() => setIsPopupOpen(true)}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="11" stroke="white" fill="green" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </button>
        )}
      </main>
    </div>
  );
};

export default Home;
