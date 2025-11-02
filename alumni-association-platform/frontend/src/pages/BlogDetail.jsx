import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogAPI } from '../utils/api';
import useAuthStore from '../store/authStore';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  const hasLiked = useMemo(() => {
    if (!blog || !user) return false;
    return (blog.likes || []).some(l => {
      const likeUserId = l.user?._id || l.user;
      const currentUserId = user._id || user.id;
      return likeUserId === currentUserId;
    });
  }, [blog, user]);

  const isAuthor = user && blog && (blog.author?._id === user._id || blog.author === user._id);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await blogAPI.getBlogById(id);
      setBlog(res.data);
    } catch (err) {
      setError('Failed to load blog post');
      console.error('Blog fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/blogs/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await blogAPI.deleteBlog(id);
        navigate(-1);
      } catch (err) {
        setError('Failed to delete blog post');
        console.error('Blog delete error:', err);
      }
    }
  };

  const onToggleLike = async () => {
    try {
      const res = await blogAPI.toggleLike(id);
      setBlog(res.data.blog || res.data);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const onAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      setSubmitting(true);
      const res = await blogAPI.addComment(id, comment.trim());
      setBlog(res.data.blog || res.data);
      setComment('');
    } catch (err) {
      console.error('Add comment failed', err);
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const onAddReply = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      setReplySubmitting(true);
      const res = await blogAPI.addReply(id, commentId, replyText.trim());
      setBlog(res.data.blog || res.data);
      setReplyText('');
      setReplyOpenId(null);
    } catch (err) {
      console.error('Add reply failed', err);
      alert('Failed to add reply');
    } finally {
      setReplySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The blog post you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <button onClick={() => navigate(-1)} className="text-sm text-gray-600 hover:text-gray-900 mb-4">← Back</button>
            </div>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{blog.title}</h1>
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <span>By {blog.author?.name || 'Unknown'}</span>
                  <span>•</span>
                  <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
                  {blog.views !== undefined && (
                    <>
                      <span>•</span>
                      <span>{blog.views} views</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{blog.likes?.length || 0} likes</span>
                  {blog.readTime && (
                    <>
                      <span>•</span>
                      <span>{blog.readTime} min read</span>
                    </>
                  )}
                </div>
              </div>
              {isAuthor && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={handleEdit}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Featured Image */}
          {blog.imageUrl?.url && (
            <div className="w-full h-64 bg-gray-200">
              <img
                src={blog.imageUrl.url}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {blog.excerpt && (
              <div className="mb-6">
                <p className="text-lg text-gray-700 italic border-l-4 border-blue-500 pl-4">
                  {blog.excerpt}
                </p>
              </div>
            )}
            
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {blog.content}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={onToggleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                    hasLiked
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{hasLiked ? 'Liked' : 'Like'}</span>
                  <span>({blog.likes?.length || 0})</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {blog.allowComments !== false && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments ({blog.comments?.length || 0})</h2>

                <form onSubmit={onAddComment} className="mb-6">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Write a comment..."
                  />
                  <div className="mt-2 flex justify-end">
                    <button 
                      disabled={submitting || !comment.trim()} 
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {(blog.comments || []).map((cmt) => (
                    <div key={cmt._id} className="border border-gray-200 rounded p-3">
                      <div className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">{cmt.user?.name || 'User'}</span>
                        <span className="ml-2">{new Date(cmt.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-gray-800">{cmt.content}</div>
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            setReplyOpenId(replyOpenId === cmt._id ? null : cmt._id);
                            setReplyText('');
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {replyOpenId === cmt._id ? 'Cancel' : 'Reply'}
                        </button>
                      </div>
                      {replyOpenId === cmt._id && (
                        <div className="mt-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="Write a reply..."
                          />
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => onAddReply(cmt._id)}
                              disabled={replySubmitting || !replyText.trim()}
                              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              {replySubmitting ? 'Replying...' : 'Reply'}
                            </button>
                          </div>
                        </div>
                      )}
                      {Array.isArray(cmt.replies) && cmt.replies.length > 0 && (
                        <div className="mt-3 pl-4 border-l">
                          {cmt.replies.map((rep) => (
                            <div key={rep._id} className="mt-2">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">{rep.user?.name || 'User'}</span>
                                <span className="ml-2">{new Date(rep.createdAt).toLocaleString()}</span>
                              </div>
                              <div className="text-gray-800">{rep.content}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!blog.comments || blog.comments.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
