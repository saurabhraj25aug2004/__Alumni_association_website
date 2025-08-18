import React from 'react';

const Blogs = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'My Journey from Student to Software Engineer',
      author: 'John Doe',
      authorRole: 'Alumni',
      date: '2024-11-15',
      readTime: '5 min read',
      excerpt: 'Sharing my experience transitioning from a computer science student to a full-stack software engineer.',
      category: 'Career',
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      title: 'The Future of Web Development in 2024',
      author: 'Sarah Johnson',
      authorRole: 'Alumni',
      date: '2024-11-12',
      readTime: '8 min read',
      excerpt: 'Exploring the latest trends and technologies that are shaping the future of web development.',
      category: 'Technology',
      likes: 31,
      comments: 12
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blogs</h1>
          <p className="text-gray-600 mt-2">Read insights and stories from alumni</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Blog Posts */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Posts</h2>
            <div className="space-y-6">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      post.category === 'Career' ? 'bg-blue-100 text-blue-800' :
                      post.category === 'Technology' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {post.category}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{post.author} ({post.authorRole})</span>
                      <span className="mx-2">•</span>
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        {post.likes}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        {post.comments}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="text-blue-600 hover:text-blue-900 font-medium">
                      Read More →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Categories</h2>
            <div className="bg-white rounded-lg shadow p-6">
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
