import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { announcementAPI } from '../utils/api';
import socketService from '../utils/socket';
import useAuthStore from '../store/authStore';

const Announcements = () => {
  const navigate = useNavigate();
  const { token, user, isAdmin } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterPriority, setFilterPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAnnouncements();
  }, [filterPriority, searchTerm]);

  useEffect(() => {
    if (token) {
      socketService.connect(token);
      const refresh = () => loadAnnouncements();
      socketService.onEntityCreated('announcements', refresh);
      socketService.onEntityUpdated('announcements', refresh);
      socketService.onEntityDeleted('announcements', refresh);
      return () => {
        socketService.removeListener('announcements:created');
        socketService.removeListener('announcements:updated');
        socketService.removeListener('announcements:deleted');
      };
    }
  }, [token]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        status: isAdmin() ? undefined : 'published', // Only published for non-admins
        priority: filterPriority || undefined,
        search: searchTerm || undefined
      };
      const response = await announcementAPI.getAllAnnouncements(params);
      setAnnouncements(response.data.announcements || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load announcements');
      console.error('Load announcements error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not published';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 pt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-gray-600">Loading announcements...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-2">Stay updated with the latest news and updates from the alumni association</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {isAdmin() && (
            <button
              onClick={() => navigate('/admin/announcements')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Manage Announcements
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        {/* Announcements List */}
        <div className="space-y-6">
          {announcements.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <p className="text-lg">No announcements found</p>
              {searchTerm && (
                <p className="mt-2 text-sm">Try adjusting your search or filters</p>
              )}
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement._id}
                className={`bg-white rounded-lg shadow overflow-hidden ${
                  announcement.isPinned ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.isPinned && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            📌 Pinned
                          </span>
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority?.toUpperCase() || 'MEDIUM'}
                        </span>
                        {isAdmin() && (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(announcement.status)}`}>
                            {announcement.status}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        {announcement.title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {announcement.content}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <img
                          className="h-6 w-6 rounded-full"
                          src={announcement.author?.profileImage?.url || 'https://via.placeholder.com/24'}
                          alt={announcement.author?.name || 'Author'}
                        />
                        <span>{announcement.author?.name || 'Admin'}</span>
                      </div>
                      <span>•</span>
                      <span>{formatDate(announcement.publishedAt || announcement.createdAt)}</span>
                      {announcement.expiresAt && (
                        <>
                          <span>•</span>
                          <span className="text-orange-600">
                            Expires: {formatDate(announcement.expiresAt)}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {announcement.views || 0} views
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;




