import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import useAuthStore from '../../store/authStore';
import Toast from '../../components/Toast';
import ImageUpload from '../../components/ImageUpload';

const Blogs = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, blogId: null, blogTitle: '' });
  const [deleting, setDeleting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    category: 'career',
    status: 'draft'
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const { token, user } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (token) {
      socketService.connect(token);
      const refresh = () => loadData();
      socketService.onEntityCreated('blogs', refresh);
      socketService.onEntityUpdated('blogs', refresh);
      socketService.onEntityDeleted('blogs', refresh);
      return () => {
        socketService.removeListener('blogs:created');
        socketService.removeListener('blogs:updated');
        socketService.removeListener('blogs:deleted');
      };
    }
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [postsRes, myRes] = await Promise.all([
        blogAPI.getAllBlogs(),
        blogAPI.getMyBlogs().catch((err) => {
          console.error('Failed to load my blogs:', err);
          return { data: { blogs: [] } };
        }),
      ]);
      const allBlogs = postsRes.data?.blogs || postsRes.data || [];
      const sortedBlogs = allBlogs.slice().sort((a, b) => {
        const da = new Date(a.publishedAt || a.createdAt).getTime();
        const db = new Date(b.publishedAt || b.createdAt).getTime();
        return db - da;
      });
      setPosts(sortedBlogs);
      
      // Ensure myPosts is always an array and only contains user's posts
      const myBlogsData = myRes.data?.blogs || myRes.data || [];
      const filteredMyBlogs = Array.isArray(myBlogsData) 
        ? myBlogsData.filter(post => {
            // Double-check that it's the user's post
            if (!user || !post.author) return false;
            const postAuthorId = post.author._id || post.author;
            const userId = user._id || user.id;
            return postAuthorId?.toString() === userId?.toString();
          })
        : [];
      setMyPosts(filteredMyBlogs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blogs');
      console.error('Load data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleEdit = (post) => {
    setEditingBlog(post);
    setFormData({
      title: post.title || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      tags: post.tags?.join(', ') || '',
      category: post.category || 'career',
      status: post.status || 'draft'
    });
    setImageFile(null);
    setShowEditForm(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('excerpt', formData.excerpt);
      
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      submitData.append('tags', JSON.stringify(tagsArray));
      
      submitData.append('category', formData.category);
      submitData.append('status', formData.status);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      await blogAPI.updateBlog(editingBlog._id, submitData);
      setShowEditForm(false);
      setEditingBlog(null);
      resetEditForm();
      await loadData();
      showToast('Blog updated successfully', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update blog';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetEditForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      tags: '',
      category: 'career',
      status: 'draft'
    });
    setImageFile(null);
    setEditingBlog(null);
  };

  const handleDelete = (blogId, blogTitle) => {
    setDeleteConfirm({ show: true, blogId, blogTitle });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.blogId) return;

    try {
      setDeleting(true);
      await blogAPI.deleteBlog(deleteConfirm.blogId);
      setDeleteConfirm({ show: false, blogId: null, blogTitle: '' });
      await loadData();
      showToast('Blog deleted successfully', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete blog post';
      showToast(errorMsg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const isMyBlog = (post) => {
    if (!user || !post.author) return false;
    const postAuthorId = post.author._id || post.author;
    const userId = user._id || user.id;
    return postAuthorId?.toString() === userId?.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blogs</h1>
          <p className="text-gray-600 mt-2">Share your insights and read stories from the community</p>
        </div>

        <div className="mb-6 flex gap-3">
          <button 
            onClick={() => navigate('/alumni/blogs/new')} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Write a Blog Post
          </button>
          <button 
            onClick={loadData} 
            className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: '', type: 'success' })}
          />
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        {/* Edit Blog Modal */}
        {showEditForm && editingBlog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Blog Post</h2>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      resetEditForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Excerpt
                    </label>
                    <textarea
                      name="excerpt"
                      rows={3}
                      value={formData.excerpt}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of the blog post"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      name="content"
                      required
                      rows={8}
                      value={formData.content}
                      onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write your blog content here..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleEditChange}
                      placeholder="e.g., technology, career, advice"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleEditChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="career">Career</option>
                        <option value="technology">Technology</option>
                        <option value="industry">Industry</option>
                        <option value="alumni-spotlight">Alumni Spotlight</option>
                        <option value="tips">Tips</option>
                        <option value="news">News</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleEditChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Featured Image
                    </label>
                    <ImageUpload 
                      onImageUpload={(file) => setImageFile(file)} 
                      currentImage={editingBlog.imageUrl?.url}
                      maxSize={5}
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        resetEditForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Update Blog'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete <strong>"{deleteConfirm.blogTitle}"</strong>? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm({ show: false, blogId: null, blogTitle: '' })}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Blog Posts */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Posts</h2>
            <div className="space-y-6">
              {loading ? (
                <div className="text-gray-500">Loading blogs...</div>
              ) : posts.length === 0 ? (
                <div className="text-gray-500 bg-white p-8 rounded-lg shadow text-center">
                  No blog posts found
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post._id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="md:flex">
                      {post.imageUrl?.url && (
                        <div className="md:flex-shrink-0">
                          <img className="h-48 w-full object-cover md:w-48" src={post.imageUrl.url} alt={post.title} />
                        </div>
                      )}
                      <div className="p-6 flex-1">
                        <div className="flex items-center mb-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {post.category || 'general'}
                          </span>
                          {post.readTime && <span className="ml-2 text-sm text-gray-500">{post.readTime}</span>}
                        </div>
                        <h3 
                          onClick={() => navigate(`/blogs/${post._id}`)}
                          className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{post.author?.name || 'Unknown'}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                              </svg>
                              {post.likes?.length || 0}
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                              </svg>
                              {post.comments?.length || 0}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <button 
                            onClick={() => navigate(`/blogs/${post._id}`)}
                            className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                          >
                            Read More →
                          </button>
                          {isMyBlog(post) && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(post)}
                                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm font-medium flex items-center gap-1 transition-colors"
                                title="Edit blog post"
                              >
                                🖊️ Edit
                              </button>
                              <button
                                onClick={() => handleDelete(post._id, post.title)}
                                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-sm font-medium flex items-center gap-1 transition-colors"
                                title="Delete blog post"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Posts */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Posts</h2>
            <div className="bg-white rounded-lg shadow p-6">
              {loading ? (
                <div className="text-gray-500 text-center py-4">Loading...</div>
              ) : myPosts.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  <p>No posts yet</p>
                  <button
                    onClick={() => navigate('/alumni/blogs/new')}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Create your first post →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myPosts.map((post) => (
                    <div key={post._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 
                          onClick={() => navigate(`/blogs/${post._id}`)}
                          className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-blue-600 transition-colors flex-1 pr-2"
                        >
                          {post.title}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{post.excerpt || 'No excerpt'}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-2">
                          <span>{post.views || 0} views</span>
                          <span>•</span>
                          <span>{post.likes?.length || 0} likes</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(post)} 
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                          title="Edit blog post"
                        >
                          🖊️ Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(post._id, post.title)}
                          className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                          title="Delete blog post"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">
                    Career
                  </span>
                  Career Development
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mr-2">
                    Technology
                  </span>
                  Technology Trends
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 mr-2">
                    Networking
                  </span>
                  Professional Networking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
