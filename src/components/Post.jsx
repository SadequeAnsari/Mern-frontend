import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Post = ({
  post,
  onShare,
  onDelete,
  onEdit,
  onBookmark,
  isAuthor,
  isBookmarked,
  userLevel,
  onWithdraw, // <--- NEW PROP for the withdraw action
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();


const handleUsernameClick = (authorId) => {
    if (authorId) { 
        navigate(`/profile/${authorId}`);
    }
  };

// 1. Determine Post Status
  const isPublished = post.statusCode === '2'; // Post is published if status is '1'

// 2. Determine if the current user can delete this post
  // User can delete if: they are the author AND the post is NOT published OR they have admin rights (Level >= 7).
  const canDelete = (!isPublished && isAuthor) || parseInt(userLevel) >= 7;

// 3. Determine if the current user can edit this post (only the author can edit a DRAFT post)
  const canEdit = isAuthor && !isPublished;

// 4. Determine if the 'Withdraw' option should be shown (Author only for PUBLISHED posts)
  const canWithdraw = isAuthor && isPublished; // NEW LOGIC

  // 5. Determine if the three-dots menu should be shown
  const showReportOption = !isAuthor && parseInt(userLevel) >= 1;
  const showThreeDots = userLevel !== "0" && (canEdit || canDelete || canWithdraw || showReportOption); // Include canWithdraw 


 const handleReportPost = () => {
    // Add logic here to handle the reporting of the post
    alert(`Reporting post with ID: ${post._id}`);
    setMenuOpen(false);
  };


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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="20"
      height="15"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M 15 3 C 12.250484 3 10 5.2504839 10 8 L 10 45 A 1.0001 1.0001 0 0 0 11.609375 45.792969 L 25.904297 34.796875 A 1.0006638 1.0006638 0 1 0 24.683594 33.210938 L 12 42.96875 L 12 8 C 12 6.3315161 13.331516 5 15 5 L 33 5 C 34.668484 5 36 6.3315161 36 8 L 36 42.96875 L 27.681641 36.570312 A 1.0001 1.0001 0 1 0 26.462891 38.15625 L 36.390625 45.792969 A 1.0001 1.0001 0 0 0 38 45 L 38 8 C 38 5.2504839 35.749516 3 33 3 L 15 3 z"
      ></path>
    </svg>
  );

  const bookmarkText = isBookmarked ? "Unbookmark" : "Bookmark";
  const bookmarkColor = isBookmarked ? "text-blue-500" : "text-gray-600";

  return (
    <div key={post._id} className="bg-white p-6 rounded-lg shadow-md relative">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {/* {post.author ? post.author.username[0].toUpperCase() : "A"} \\\\ */}
          {post.author && post.author.username
            ? post.author.username[0].toUpperCase()
            : "A"}
        </div>
        <div className="flex-grow">
          <h4 className="font-semibold text-gray-900">

            <button // <--- 4. REPLACE h4 with a clickable button
            onClick={() => 
                // Defensive check to ensure author and ID exist before clicking
                post.author && post.author._id && handleUsernameClick(post.author._id)
            }
            className="font-semibold text-gray-900 hover:text-blue-600 hover:underline cursor-pointer transition duration-150"
            disabled={!post.author || !post.author._id} // Disable if data is missing
          >
            {post.author && post.author.username
              ? post.author.username
              : "Anonymous"}
          </button>
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

            <span className={`ml-4 px-2 py-0.5 text-xs font-medium rounded-full 
             ${isPublished ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-yellow-100 text-yellow-800 border border-yellow-300'}`}>
            {isPublished ? 'Published' : 'Draft'} {/* Updated text to reflect status */}
        </span>
          </p>
        </div>
      {showThreeDots && ( 
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
              
              {/* Option for Author (Edit) - ONLY shown if NOT published */}
              {canEdit && (
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    if (onEdit) onEdit(post);
                    setMenuOpen(false);
                  }}
                >
                  Edit
                </button>
              )}

              {/* NEW: Option for Author (Withdraw) - ONLY shown if IS published */}
              {canWithdraw && (
                <button
                  className="block w-full text-left px-4 py-2 text-yellow-600 hover:bg-gray-100"
                  onClick={() => {
                    if (onWithdraw) onWithdraw(post._id);
                    setMenuOpen(false);
                  }}
                >
                  Withdraw
                </button>
              )}


              {/* Option for Deleting (Author - only Drafts OR Admin) */}
              {canDelete && (
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    if (onDelete) onDelete(post._id);
                    setMenuOpen(false);
                  }}
                >
                  Delete
                </button>
              )}

              {/* Option for Reporting (Level >= 1 and not Author) */}
              {showReportOption && (
                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  onClick={handleReportPost}
                >
                  Report
                </button>
              )}
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

export default Post;