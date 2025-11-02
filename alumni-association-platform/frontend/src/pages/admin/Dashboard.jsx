import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { adminAPI, adminMentorshipAPI, feedbackAPI } from '../../utils/api';
import socketService from '../../utils/socket';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [mentorshipStats, setMentorshipStats] = useState(null);
  const [feedbackSummary, setFeedbackSummary] = useState(null);

  useEffect(() => {
    fetchDashboardData();

    // Connect socket for real-time updates
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);

      const refreshBlogCount = async () => {
        try {
          const res = await adminAPI.getAnalytics();
          const blogCount = res.data?.contentStats?.blogs ?? 0;
          setAnalytics(prev => ({ ...(prev || {}), totalBlogs: blogCount }));
        } catch (e) {
          // ignore transient errors
        }
      };

      // Initialize with backend count
      refreshBlogCount();

      const onCreated = () => refreshBlogCount();
      const onDeleted = () => refreshBlogCount();

      if (socketService.socket) {
        socketService.socket.on('blogs:created', onCreated);
        socketService.socket.on('blogs:deleted', onDeleted);
      }

      return () => {
        if (socketService.socket) {
          socketService.socket.off('blogs:created', onCreated);
          socketService.socket.off('blogs:deleted', onDeleted);
        }
      };
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsRes, usersRes, mentorshipRes, feedbackRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getAllUsers(),
        adminMentorshipAPI.getAllPrograms().catch(() => ({ data: { stats: null } })),
        feedbackAPI.getFeedbackSummary().catch(() => ({ data: null }))
      ]);

      const analyticsData = analyticsRes.data || {};
      const usersData = usersRes.data?.users || usersRes.data || [];

      setAnalytics({
        totalUsers: analyticsData?.userStats?.total ?? analyticsData.totalUsers ?? 0,
        totalJobs: analyticsData?.contentStats?.jobs ?? analyticsData.totalJobs ?? 0,
        totalWorkshops: analyticsData?.contentStats?.workshops ?? analyticsData.totalWorkshops ?? 0,
        totalBlogs: analyticsData?.contentStats?.blogs ?? analyticsData.totalBlogs ?? 0,
        newUsersThisMonth: analyticsData?.monthlyRegistrations?.at?.(-1)?.count ?? analyticsData.newUsersThisMonth ?? 0,
        activeUsers: analyticsData.activeUsers ?? 0,
        pendingApprovals: analyticsData?.userStats?.pendingApprovals ?? 0,
        systemHealth: analyticsData.systemHealth || 'Good'
      });

      setUsers(Array.isArray(usersData) ? usersData : []);
      
      // Set mentorship stats
      if (mentorshipRes.data?.stats) {
        setMentorshipStats(mentorshipRes.data.stats);
      }
      
      // Set feedback summary
      if (feedbackRes.data) {
        setFeedbackSummary(feedbackRes.data);
      }

      const activity = [];
      if (Array.isArray(analyticsData?.recentActivity?.users)) {
        analyticsData.recentActivity.users.forEach((u, idx) => activity.push({ id: `u-${idx}`, type: 'user_registration', message: `New user: ${u.name}`, timestamp: new Date(u.createdAt || Date.now()), icon: '👤' }));
      }
      if (Array.isArray(analyticsData?.recentActivity?.jobs)) {
        analyticsData.recentActivity.jobs.forEach((j, idx) => activity.push({ id: `j-${idx}`, type: 'job_posted', message: `New job: ${j.title}`, timestamp: new Date(j.createdAt || Date.now()), icon: '💼' }));
      }
      if (Array.isArray(analyticsData?.recentActivity?.workshops)) {
        analyticsData.recentActivity.workshops.forEach((w, idx) => activity.push({ id: `w-${idx}`, type: 'workshop_created', message: `New workshop: ${w.topic || w.title}`, timestamp: new Date(w.createdAt || Date.now()), icon: '🎓' }));
      }
      setRecentActivities(activity.slice(0, 10));

      setSystemAlerts([]);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleManageUsers = () => {
    navigate('/admin/users');
  };

  const handleViewAnnouncements = () => {
    navigate('/admin/announcements');
  };

  const handleViewFeedback = () => {
    navigate('/admin/feedback');
  };

  const handleApproveUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId, true);
      setUsers(prev => prev.map(u => (u._id === userId ? { ...u, isApproved: true } : u)));
    } catch (err) {
      alert('Failed to approve user');
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId, false);
      setUsers(prev => prev.map(u => (u._id === userId ? { ...u, isApproved: false } : u)));
    } catch (err) {
      alert('Failed to set pending');
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Loading administrative data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'Admin'}! 👨‍💼
          </h1>
          <p className="text-gray-600 text-lg">Manage the alumni association platform and monitor system activity.</p>
        </div>

        {/* System Alerts */}
        {systemAlerts.length > 0 && (
          <div className="mb-6 space-y-3">
            {systemAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-lg border ${
                  alert.type === 'warning' 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800' 
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2">
                      {alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                    <span className="font-medium">{alert.message}</span>
                  </div>
                  <span className="text-sm opacity-75">{formatTimeAgo(alert.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Analytics Cards */}
        {analytics && typeof analytics === 'object' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalUsers || 0}</p>
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalJobs || 0}</p>
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Workshops</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalWorkshops || 0}</p>
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                  <p className="text-2xl font-semibold text-gray-900">{analytics.totalBlogs || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Users (Month)</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.newUsersThisMonth || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.activeUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.pendingApprovals || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-teal-100 text-teal-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.systemHealth || 'Good'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mentorship Statistics */}
        {mentorshipStats && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mentorship Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Mentors</p>
                    <p className="text-2xl font-semibold text-gray-900">{mentorshipStats.totalMentors || 0}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Mentees</p>
                    <p className="text-2xl font-semibold text-gray-900">{mentorshipStats.totalMentees || 0}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-semibold text-gray-900">{mentorshipStats.pendingRequests || 0}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Programs</p>
                    <p className="text-2xl font-semibold text-gray-900">{mentorshipStats.totalPrograms || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Statistics */}
        {feedbackSummary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                    <p className="text-2xl font-semibold text-gray-900">{feedbackSummary.total || 0}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">New</p>
                    <p className="text-2xl font-semibold text-gray-900">{feedbackSummary.new || 0}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-semibold text-gray-900">{feedbackSummary.inProgress || 0}</p>
                  </div>
                </div>
              </div>

              <div className="card p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Resolved</p>
                    <p className="text-2xl font-semibold text-gray-900">{feedbackSummary.resolved || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Cards Fallback */}
        {(!analytics || typeof analytics !== 'object') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">-</p>
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-semibold text-gray-900">-</p>
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Workshops</p>
                  <p className="text-2xl font-semibold text-gray-900">-</p>
                </div>
              </div>
            </div>

            <div className="card p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                  <p className="text-2xl font-semibold text-gray-900">-</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(users) && users.length > 0 ? (
                  users.slice(0, 10).map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.profileImage?.url || 'https://via.placeholder.com/40'}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'alumni' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
