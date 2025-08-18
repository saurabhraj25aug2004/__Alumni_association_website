import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AlumniDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // State for dashboard data
  const [stats, setStats] = useState({
    profileViews: 0,
    mentorshipRequests: 0,
    blogPosts: 0,
    jobApplications: 0
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls with realistic data
      const mockStats = {
        profileViews: Math.floor(Math.random() * 50) + 10,
        mentorshipRequests: Math.floor(Math.random() * 10) + 1,
        blogPosts: Math.floor(Math.random() * 15) + 3,
        jobApplications: Math.floor(Math.random() * 8) + 1
      };
      
      const mockActivities = [
        {
          id: 1,
          type: 'profile_update',
          message: 'Updated profile information',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          icon: '👤'
        },
        {
          id: 2,
          type: 'job_application',
          message: 'Applied for Senior Developer position at TechCorp',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          icon: '💼'
        },
        {
          id: 3,
          type: 'blog_post',
          message: 'Published new blog post: "Career Tips for Recent Graduates"',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          icon: '📝'
        },
        {
          id: 4,
          type: 'mentorship',
          message: 'New mentorship request from Sarah Johnson',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          icon: '🤝'
        }
      ];

      const mockNotifications = [
        {
          id: 1,
          type: 'mentorship',
          message: 'New mentorship request from Alex Chen',
          read: false,
          timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        },
        {
          id: 2,
          type: 'job',
          message: 'Your application for Software Engineer at Google has been reviewed',
          read: false,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        }
      ];

      setStats(mockStats);
      setRecentActivities(mockActivities);
      setNotifications(mockNotifications);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleUpdateProfile = () => {
    navigate('/alumni/profile');
  };

  const handleBrowseJobs = () => {
    navigate('/alumni/jobs');
  };

  const handleWriteBlog = () => {
    navigate('/alumni/blogs');
  };

  const handleViewMentorship = () => {
    navigate('/alumni/mentorship');
  };

  const handleViewWorkshops = () => {
    navigate('/alumni/workshops');
  };

  // Format timestamp
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'Alumni'}! 👋
        </h1>
        <p className="text-gray-600 text-lg">Here's what's happening in your network today.</p>
      </div>

      {/* Notifications Banner */}
      {notifications.filter(n => !n.read).length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-blue-600 mr-2">🔔</span>
              <span className="text-blue-800 font-medium">
                You have {notifications.filter(n => !n.read).length} new notifications
              </span>
            </div>
            <button 
              onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Profile Views</span>
              <span className="font-semibold text-blue-600">{stats.profileViews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mentorship Requests</span>
              <span className="font-semibold text-green-600">{stats.mentorshipRequests}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Blog Posts</span>
              <span className="font-semibold text-purple-600">{stats.blogPosts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Job Applications</span>
              <span className="font-semibold text-orange-600">{stats.jobApplications}</span>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="text-sm text-gray-600 border-l-2 border-blue-200 pl-3">
                <div className="flex items-start">
                  <span className="mr-2 text-lg">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.message}</p>
                    <p className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={handleUpdateProfile}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              <span className="mr-2">👤</span>
              Update Profile
            </button>
            <button 
              onClick={handleBrowseJobs}
              className="btn btn-success w-full flex items-center justify-center"
            >
              <span className="mr-2">💼</span>
              Browse Jobs
            </button>
            <button 
              onClick={handleWriteBlog}
              className="btn w-full flex items-center justify-center"
              style={{backgroundColor: '#8b5cf6', color: 'white'}}
            >
              <span className="mr-2">📝</span>
              Write Blog
            </button>
            <button 
              onClick={handleViewMentorship}
              className="btn btn-secondary w-full flex items-center justify-center"
            >
              <span className="mr-2">🤝</span>
              View Mentorship
            </button>
            <button 
              onClick={handleViewWorkshops}
              className="btn w-full flex items-center justify-center"
              style={{backgroundColor: '#f59e0b', color: 'white'}}
            >
              <span className="mr-2">🎓</span>
              Browse Workshops
            </button>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="mt-8">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Notifications</h2>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg border ${
                    notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-blue-800'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full ml-2"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDashboard;



