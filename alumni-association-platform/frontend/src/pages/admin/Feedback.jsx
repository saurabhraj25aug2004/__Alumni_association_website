import React, { useEffect, useState } from 'react';
import { feedbackAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import useAuthStore from '../../store/authStore';

const Feedback = () => {
  const { token } = useAuthStore();
  const [feedbacks, setFeedbacks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    loadFeedbacks();
    loadSummary();
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    if (token) {
      socketService.connect(token);
      const refresh = () => {
        loadFeedbacks();
        loadSummary();
      };
      socketService.onEntityCreated('feedback', refresh);
      socketService.onEntityUpdated('feedback', refresh);
      socketService.onEntityDeleted('feedback', refresh);
      return () => {
        socketService.removeListener('feedback:created');
        socketService.removeListener('feedback:updated');
        socketService.removeListener('feedback:deleted');
      };
    }
  }, [token]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      const res = await feedbackAPI.getAllFeedback(params);
      setFeedbacks(res.data?.feedback || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load feedback');
      console.error('Load feedback error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const res = await feedbackAPI.getFeedbackSummary();
      setSummary(res.data);
    } catch (err) {
      console.error('Load summary error:', err);
    }
  };

  const updateStatus = async (feedbackId, newStatus) => {
    try {
      setLoading(true);
      await feedbackAPI.updateFeedbackStatus(feedbackId, newStatus);
      alert(`Feedback status updated to ${newStatus}`);
      await loadFeedbacks();
      await loadSummary();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      return;
    }
    try {
      setLoading(true);
      await feedbackAPI.deleteFeedback(id);
      alert('Feedback deleted successfully');
      setFeedbacks(prev => prev.filter(f => f._id !== id));
      await loadSummary();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete feedback');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800';
      case 'addressed':
        return 'bg-indigo-100 text-indigo-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600 mt-2">Review and manage user feedback</p>
        </div>

        {/* Summary Statistics */}
        {summary && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{summary.total || 0}</div>
                <div className="text-sm text-gray-600">Total Feedback</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{summary.new || 0}</div>
                <div className="text-sm text-gray-600">New</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{summary.inProgress || 0}</div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{summary.resolved || 0}</div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="pending">Pending (Legacy)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="technical">Technical</option>
            <option value="content">Content</option>
            <option value="user-experience">User Experience</option>
            <option value="support">Support</option>
            <option value="suggestion">Suggestion</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        {/* Feedback List */}
        <div className="space-y-4">
          {loading && feedbacks.length === 0 ? (
            <div className="text-gray-500 bg-white rounded-lg shadow p-8 text-center">Loading...</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-gray-500 bg-white rounded-lg shadow p-8 text-center">
              No feedback found
              {(statusFilter !== 'all' || categoryFilter !== 'all') && (
                <p className="text-sm mt-2">Try adjusting your filters</p>
              )}
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {feedback.category?.replace('-', ' ') || 'Feedback'}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(feedback.status || 'New')}`}>
                        {feedback.status || 'New'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                      {feedback.comments || feedback.message || 'No message'}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>From: {feedback.user?.name || 'Unknown User'}</span>
                      <span>Email: {feedback.user?.email || '-'}</span>
                      <span>Date: {formatDate(feedback.createdAt)}</span>
                      {feedback.rating && (
                        <span>Rating: {feedback.rating}/5 ⭐</span>
                      )}
                    </div>
                    {feedback.adminResponse?.response && (
                      <div className="mt-3 pt-3 border-t border-gray-200 bg-blue-50 p-3 rounded">
                        <p className="text-sm font-medium text-gray-700 mb-1">Admin Response:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {feedback.adminResponse.response}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end items-center space-x-2 pt-4 border-t border-gray-200">
                  <select
                    value={feedback.status || 'New'}
                    onChange={(e) => updateStatus(feedback._id, e.target.value)}
                    disabled={loading}
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <button
                    onClick={() => deleteFeedback(feedback._id)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-900 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
