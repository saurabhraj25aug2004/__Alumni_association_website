import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI } from '../../utils/api';
<<<<<<< HEAD

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [myBlogs, setMyBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [allRes, myRes] = await Promise.all([
          blogAPI.getAllBlogs({ page: 1, limit: 12 }),
          blogAPI.getMyBlogs()
        ]);
        const list = (allRes.data.blogs || []).slice().sort((a, b) => {
          const da = new Date(a.publishedAt || a.createdAt).getTime();
          const db = new Date(b.publishedAt || b.createdAt).getTime();
          return db - da;
        });
        setBlogs(list);
        setMyBlogs(myRes.data.blogs || []);
      } catch (e) {
        setError('Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
=======
import socketService from '../../utils/socket';
import useAuthStore from '../../store/authStore';

const Blogs = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
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
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [postsRes, myRes] = await Promise.all([
        blogAPI.getAllBlogs(),
        blogAPI.getMyBlogs().catch(() => ({ data: [] })),
      ]);
      setPosts(postsRes.data?.blogs || postsRes.data || []);
      setMyPosts(myRes.data?.blogs || myRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };
>>>>>>> 03b7d11 (workshop page debug done)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blogs</h1>
          <p className="text-gray-600 mt-2">Share your insights and read stories from the community</p>
        </div>

<<<<<<< HEAD
        <div className="mb-6">
          <button onClick={() => navigate('/blogs/new')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
=======
        <div className="mb-6 flex gap-3">
          <button onClick={() => navigate('/alumni/blogs/new')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
>>>>>>> 03b7d11 (workshop page debug done)
            Write a Blog Post
          </button>
          <button onClick={loadData} className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">Refresh</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Blog Posts */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Posts</h2>
            <div className="space-y-6">
              {loading ? (
<<<<<<< HEAD
                <div className="text-gray-600">Loading...</div>
              ) : error ? (
                <div className="text-red-600">{error}</div>
              ) : blogs.length === 0 ? (
                <div className="text-gray-600">No blogs found.</div>
              ) : blogs.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="md:flex">
                    <div className="md:flex-shrink-0">
                      <img 
                        className="h-48 w-full object-cover md:w-48" 
                        src={post.imageUrl?.url || 'https://via.placeholder.com/300x200'} 
                        alt={post.title}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800`}>
                          {post.category}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">{post.readTime || `${post.estimatedReadTime} min read`}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{post.author?.name}</span>
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
                      <div className="mt-4">
                        <button onClick={() => navigate(`/blogs/${post._id}`)} className="text-blue-600 hover:text-blue-900 font-medium">
                          Read More →
                        </button>
=======
                <div className="text-gray-500">Loading blogs...</div>
              ) : posts.length === 0 ? (
                <div className="text-gray-500">No blog posts found</div>
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
                          className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                        >
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{post.author?.name || 'Unknown'}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
                        <div className="mt-4">
                          <button 
                            onClick={() => navigate(`/blogs/${post._id}`)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Read More →
                          </button>
                        </div>
>>>>>>> 03b7d11 (workshop page debug done)
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
              <div className="space-y-4">
<<<<<<< HEAD
                {myBlogs.map((post) => (
                  <div key={post.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{post.title}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-2">
                        <span>{post.views} views</span>
                        <span>{post.likes?.length || 0} likes</span>
                      </div>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <button onClick={() => navigate(`/blogs/${post._id}/edit`)} className="text-blue-600 hover:text-blue-900 text-xs font-medium">
                        Edit
                      </button>
                      <button onClick={async () => {
                        if (!confirm('Delete this post?')) return;
                        try {
                          await blogAPI.deleteBlog(post._id);
                          setMyBlogs(prev => prev.filter(b => b._id !== post._id));
                        } catch (e) {
                          alert('Failed to delete');
                        }
                      }} className="text-red-600 hover:text-red-900 text-xs font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
=======
                {loading ? (
                  <div className="text-gray-500">Loading...</div>
                ) : myPosts.length === 0 ? (
                  <div className="text-gray-500">No posts yet</div>
                ) : (
                  myPosts.map((post) => (
                    <div key={post._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 
                          onClick={() => navigate(`/blogs/${post._id}`)}
                          className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-blue-600"
                        >
                          {post.title}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          post.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-2">
                          <span>{post.views || 0} views</span>
                          <span>{post.likes?.length || 0} likes</span>
                        </div>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <button onClick={() => navigate(`/blogs/${post._id}/edit`)} className="text-blue-600 hover:text-blue-900 text-xs font-medium">
                          Edit
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this blog post?')) {
                              try {
                                await blogAPI.deleteBlog(post._id);
                                loadData(); // Refresh the list
                              } catch (err) {
                                alert('Failed to delete blog post');
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-900 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
>>>>>>> 03b7d11 (workshop page debug done)
              </div>
            </div>

            {/* Categories */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">
                    Career
                  </span>
                  Career Development
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mr-2">
                    Technology
                  </span>
                  Technology Trends
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
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
