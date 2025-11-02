import React, { useEffect, useState } from 'react';
import { announcementAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import useAuthStore from '../../store/authStore';

const Announcements = () => {
  const { token } = useAuthStore();
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft',
    priority: 'medium',
    targetAudience: ['all'],
    expiresAt: '',
    isPinned: false
  });

  useEffect(() => {
    loadAnnouncements();
    loadStats();
  }, []);

  useEffect(() => {
    if (token) {
      socketService.connect(token);
      const refresh = () => {
        loadAnnouncements();
        loadStats();
      };
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
      // Don't pass status filter, or pass 'all' - backend will handle it for admin
      const response = await announcementAPI.getAllAnnouncements();
      setAnnouncements(response.data.announcements || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load announcements');
      console.error('Error loading announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await announcementAPI.getAnnouncementStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        targetAudience: Array.isArray(formData.targetAudience) 
          ? formData.targetAudience 
          : [formData.targetAudience],
        expiresAt: formData.expiresAt || null
      };

      if (editingAnnouncement) {
        await announcementAPI.updateAnnouncement(editingAnnouncement._id, submitData);
      } else {
        await announcementAPI.createAnnouncement(submitData);
      }

      setShowForm(false);
      setEditingAnnouncement(null);
      resetForm();
      // Refetch announcements immediately after creation/update
      await loadAnnouncements();
      await loadStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      status: announcement.status,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience || ['all'],
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().split('T')[0] : '',
      isPinned: announcement.isPinned || false
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      setLoading(true);
      await announcementAPI.deleteAnnouncement(deleteConfirm.id);
      setDeleteConfirm({ show: false, id: null, title: '' });
      await loadAnnouncements();
      await loadStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      status: 'draft',
      priority: 'medium',
      targetAudience: ['all'],
      expiresAt: '',
      isPinned: false
    });
    setEditingAnnouncement(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-600 mt-2">Manage and create announcements for the community</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Announcement
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total || 0}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.published || 0}</div>
                <div className="text-sm text-gray-600">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.drafts || 0}</div>
                <div className="text-sm text-gray-600">Drafts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.archived || 0}</div>
                <div className="text-sm text-gray-600">Archived</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.pinned || 0}</div>
                <div className="text-sm text-gray-600">Pinned</div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content *
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Audience
                      </label>
                      <select
                        multiple
                        value={formData.targetAudience}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData({ ...formData, targetAudience: selected.length > 0 ? selected : ['all'] });
                        }}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All</option>
                        <option value="alumni">Alumni</option>
                        <option value="students">Students</option>
                        <option value="admin">Admin</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expires At (Optional)
                        </label>
                        <input
                          type="date"
                          value={formData.expiresAt}
                          onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isPinned"
                          checked={formData.isPinned}
                          onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-700">
                          Pin to top
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : editingAnnouncement ? 'Update' : 'Create'}
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
                  Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>? 
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm({ show: false, id: null, title: '' })}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Announcements List */}
        {loading && !showForm ? (
          <div className="text-center text-gray-600 py-8">Loading announcements...</div>
        ) : (
          <div className="space-y-6">
            {announcements.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <p className="text-lg">No announcements found</p>
                <p className="mt-2 text-sm">Create your first announcement to get started</p>
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
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              📌 Pinned
                            </span>
                          )}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(announcement.priority)}`}>
                            {announcement.priority?.toUpperCase() || 'MEDIUM'}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(announcement.status)}`}>
                            {announcement.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{announcement.content}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{announcement.author?.name || 'Admin'}</span>
                        <span>•</span>
                        <span>{new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString()}</span>
                        {announcement.expiresAt && (
                          <>
                            <span>•</span>
                            <span className="text-orange-600">
                              Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>Target: {announcement.targetAudience?.join(', ') || 'all'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{announcement.views || 0} views</span>
                        <button
                          onClick={() => handleEdit(announcement)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ show: true, id: announcement._id, title: announcement.title })}
                          className="text-red-600 hover:text-red-900 text-sm font-medium px-3 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
