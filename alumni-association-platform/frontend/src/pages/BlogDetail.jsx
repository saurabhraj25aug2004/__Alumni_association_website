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
    return (blog.likes || []).some(l => (l.user?._id || l.user) === user.id);
  }, [blog, user]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await blogAPI.getBlogById(id);
        setBlog(res.data);
      } catch (e) {
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onToggleLike = async () => {
    try {
      const res = await blogAPI.toggleLike(id);
      setBlog(res.data.blog);
    } catch (e) {
      console.error('Like failed', e);
    }
  };

  const onAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      setSubmitting(true);
      const res = await blogAPI.addComment(id, comment.trim());
      setBlog(res.data.blog);
      setComment('');
    } catch (e) {
      console.error('Add comment failed', e);
    } finally {
      setSubmitting(false);
    }
  };

  const onAddReply = async (commentId) => {
    if (!replyText.trim()) return;
    try {
      setReplySubmitting(true);
      const res = await blogAPI.addReply(id, commentId, replyText.trim());
      setBlog(res.data.blog);
      setReplyText('');
      setReplyOpenId(null);
    } catch (e) {
      console.error('Add reply failed', e);
    } finally {
      setReplySubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!blog) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-600 hover:text-gray-900">← Back</button>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span>{blog.author?.name}</span>
          <span className="mx-2">•</span>
          <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
          <span className="mx-2">•</span>
          <span>{blog.readTime || blog.estimatedReadTime} min read</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{blog.title}</h1>
        {blog.imageUrl?.url && (
          <img src={blog.imageUrl.url} alt={blog.title} className="mt-4 w-full rounded" />
        )}
        <p className="mt-6 text-gray-800 whitespace-pre-wrap">{blog.content}</p>

        {/* Reactions */}
        <div className="mt-6 flex items-center space-x-4">
          <button onClick={onToggleLike} className={`px-3 py-1 rounded border ${hasLiked ? 'bg-red-50 border-red-300 text-red-600' : 'bg-gray-50 border-gray-300 text-gray-700'}`}>
            ❤️ {blog.likes?.length || 0}
          </button>
          <div className="text-gray-600">
            💬 {blog.comments?.length || 0}
          </div>
        </div>

        {/* Comments */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments</h2>

          <form onSubmit={onAddComment} className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Write a comment..."
            />
            <div className="mt-2 flex justify-end">
              <button disabled={submitting || !comment.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;


