import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Post from "./Post"; 

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
      const postsResponse = await fetch(
        "https://mern-backend-two-mu.vercel.app/posts",
        {
          method: "GET",
          // This line is CRITICAL for sending the authentication cookie
          credentials: "include", 
        }
      );

      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

   // 🔑 NEW FUNCTION: Fetch user details to set state after refresh
  const fetchUserData = async () => {
      try {
          setLoading(true);
          // Use the now-fixed endpoint
          const userResponse = await fetch("https://mern-backend-two-mu.vercel.app/user", {
              method: "GET",
              credentials: "include", // CRITICAL to send the cookie
          });

          if (userResponse.ok) {
              const userData = await userResponse.json();
              setUser(userData);
          } else {
              // User not logged in (401), set to null
              setUser(null);
          }
      } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
      } finally {
          setLoading(false); // Set loading to false once user status is determined
      }
  };

  // 🔑 UPDATED useEffects:
  useEffect(() => {
      fetchUserData();
  }, []); // 1. Run only on mount to load user data


  useEffect(() => {
      // 2. Only fetch posts if the initial loading (for user data) is complete.
      if (!loading) {
          fetchAllPosts();
      }
  }, [loading]); // Fetch posts only after the loading state is resolved.


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
        const profileResponse = await fetch(
          "https://mern-backend-two-mu.vercel.app/profile",
          {
            method: "GET",
            credentials: "include",
          }
        );

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
        const response = await fetch(
          "https://mern-backend-two-mu.vercel.app/delete-account",
          {
            method: "PATCH",
            credentials: "include",
          }
        );

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

  const handlePostSubmit = async (statusCode) => {
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
      const response = await fetch(
        "https://mern-backend-two-mu.vercel.app/create-post",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: postContent , statusCode: statusCode }),
        }
      );

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
        const response = await fetch(
          `https://mern-backend-two-mu.vercel.app/posts/${postId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

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
     if (post.statusCode === '3' && !post.isRepost) { 
        alert("Withdrawn posts cannot be edited.");
        return;
    }
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


const handleWithdrawPost = async (postId) => {
    if (window.confirm("Are you sure you want to withdraw this post? It will no longer be visible as 'Published' but will remain online with a withdrawal watermark.")) {
      try {
        const response = await fetch(
          `https://mern-backend-two-mu.vercel.app/posts/${postId}/withdraw`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const updatedPost = await response.json();
          // Update the local state with the new post (statusCode: '3')
          setPosts(
            posts.map((p) => (p._id === updatedPost._id ? updatedPost : p))
          );
          alert("Post successfully withdrawn!");
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Failed to withdraw post. Please try again.");
        }
      } catch (error) {
        console.error("Error withdrawing post:", error);
        alert("An error occurred while withdrawing the post.");
      }
    }
  };


  if (loading) {
    return (
      <div className="text-3xl my-[16rem] mx-[30rem]">
        Loading Please wait...
      </div>
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
              <div className="text-sm text-gray-500 text-center">
                Level: {user.level}
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
              <svg xmlns="http://www.w3.org/2000/svg" className=" mr-25 self-center h-9 w-7 absolute" viewBox="0 0 640 640"><path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z"/></svg>
              <button
                className="px-3 py-2 rounded hover:bg-gray-200 transition"
                onClick={() => navigate("/user-profile")}
              >
                Profile
              </button>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className=" ml-12 self-center h-9 w-7 absolute" viewBox="0 0 640 640"><path d="M259.1 73.5C262.1 58.7 275.2 48 290.4 48L350.2 48C365.4 48 378.5 58.7 381.5 73.5L396 143.5C410.1 149.5 423.3 157.2 435.3 166.3L503.1 143.8C517.5 139 533.3 145 540.9 158.2L570.8 210C578.4 223.2 575.7 239.8 564.3 249.9L511 297.3C511.9 304.7 512.3 312.3 512.3 320C512.3 327.7 511.8 335.3 511 342.7L564.4 390.2C575.8 400.3 578.4 417 570.9 430.1L541 481.9C533.4 495 517.6 501.1 503.2 496.3L435.4 473.8C423.3 482.9 410.1 490.5 396.1 496.6L381.7 566.5C378.6 581.4 365.5 592 350.4 592L290.6 592C275.4 592 262.3 581.3 259.3 566.5L244.9 496.6C230.8 490.6 217.7 482.9 205.6 473.8L137.5 496.3C123.1 501.1 107.3 495.1 99.7 481.9L69.8 430.1C62.2 416.9 64.9 400.3 76.3 390.2L129.7 342.7C128.8 335.3 128.4 327.7 128.4 320C128.4 312.3 128.9 304.7 129.7 297.3L76.3 249.8C64.9 239.7 62.3 223 69.8 209.9L99.7 158.1C107.3 144.9 123.1 138.9 137.5 143.7L205.3 166.2C217.4 157.1 230.6 149.5 244.6 143.4L259.1 73.5zM320.3 400C364.5 399.8 400.2 363.9 400 319.7C399.8 275.5 363.9 239.8 319.7 240C275.5 240.2 239.8 276.1 240 320.3C240.2 364.5 276.1 400.2 320.3 400z"/></svg>
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
            <div className="absolute text-center right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
              
              <svg xmlns="http://www.w3.org/2000/svg" className=" ml-3.5 h-10 w-5.5 absolute" viewBox="0 0 640 640"><path d="M256.1 312C322.4 312 376.1 258.3 376.1 192C376.1 125.7 322.4 72 256.1 72C189.8 72 136.1 125.7 136.1 192C136.1 258.3 189.8 312 256.1 312zM226.4 368C127.9 368 48.1 447.8 48.1 546.3C48.1 562.7 61.4 576 77.8 576L274.3 576L285.2 521.5C289.5 499.8 300.2 479.9 315.8 464.3L383.1 397C355.1 378.7 321.7 368.1 285.7 368.1L226.3 368.1zM332.3 530.9L320.4 590.5C320.2 591.4 320.1 592.4 320.1 593.4C320.1 601.4 326.6 608 334.7 608C335.7 608 336.6 607.9 337.6 607.7L397.2 595.8C409.6 593.3 421 587.2 429.9 578.3L548.8 459.4L468.8 379.4L349.9 498.3C341 507.2 334.9 518.6 332.4 531zM600.1 407.9C622.2 385.8 622.2 350 600.1 327.9C578 305.8 542.2 305.8 520.1 327.9L491.3 356.7L571.3 436.7L600.1 407.9z"/></svg>
              <button
                className="block w-full px-4 py-2 hover:bg-gray-100"
                onClick={() => { 
                  setMenuOpen(false);
                  navigate("/edit-profile");
                }}
              >
                Edit Profile
              </button>

                <svg xmlns="http://www.w3.org/2000/svg" className=" ml-3.5 h-10 w-5.5 absolute" viewBox="0 0 640 640"><path d="M192 64C156.7 64 128 92.7 128 128L128 544C128 555.5 134.2 566.2 144.2 571.8C154.2 577.4 166.5 577.3 176.4 571.4L320 485.3L463.5 571.4C473.4 577.3 485.7 577.5 495.7 571.8C505.7 566.1 512 555.5 512 544L512 128C512 92.7 483.3 64 448 64L192 64z"/></svg>
              <button
                className="block w-full  px-4 py-2 hover:bg-gray-100"
                onClick={handleViewBookmarks}
              >
                Bookmarks
              </button>
              <svg xmlns="http://www.w3.org/2000/svg" className=" text-red-500 ml-4 h-10 w-6 absolute" fill="currentColor" viewBox="0 0 640 640"><path d="M224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160zM566.6 342.6C579.1 330.1 579.1 309.8 566.6 297.3L438.6 169.3C426.1 156.8 405.8 156.8 393.3 169.3C380.8 181.8 380.8 202.1 393.3 214.6L466.7 288L256 288C238.3 288 224 302.3 224 320C224 337.7 238.3 352 256 352L466.7 352L393.3 425.4C380.8 437.9 380.8 458.2 393.3 470.7C405.8 483.2 426.1 483.2 438.6 470.7L566.6 342.7z"/></svg>
              <button
                className="block w-full  px-4 py-2 text-red-600 hover:bg-gray-100"
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
                  
                  <span>Photos</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                  />
                </label>
                <label className="flex items-center px-4 py-2 border rounded cursor-pointer hover:bg-gray-100 transition">
                  {/* <span className="mr-2">道</span> */}
                  <span>Videos</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*"
                    multiple
                  />
                </label>
              </div>
              {/* MODIFIED: Replaced single button with two options */}
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded font-bold hover:bg-gray-700 transition"
                  onClick={() => handlePostSubmit('0')} // '0' for Draft
                >
                  Save as Draft
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-600 transition"
                  onClick={() => handlePostSubmit('1')} // '1' for Publish
                >
                  Publish
                </button>
              </div>
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
                  userLevel={user.level}
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
                // statusCode={post.statusCode}
                onShare={handleShare}
                onDelete={handleDeletePost}
                onEdit={handleEditPost}
                onBookmark={handleBookmarkPost}
                onWithdraw={handleWithdrawPost}
                isAuthor={user && post.author && post.author._id === user._id}
                isBookmarked={bookmarkedPosts.some(
                  (bookmark) => bookmark._id === post._id
                )}
                userLevel={user.level}
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