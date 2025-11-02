import React, { useEffect, useState } from 'react';
import { feedbackAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import useAuthStore from '../../store/authStore';

const Feedback = () => {
  const { token } = useAuthStore();
  const categories = [
    { key: 'general', title: 'General Feedback' },
    { key: 'technical', title: 'Technical Issues' },
    { key: 'content', title: 'Content Feedback' },
    { key: 'user-experience', title: 'User Experience' },
    { key: 'support', title: 'Support Request' },
    { key: 'suggestion', title: 'Suggestion' },
  ];

  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: 'general', message: '' });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (token) {
      socketService.connect(token);
      const refresh = () => loadData();
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

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await feedbackAPI.getMyFeedback();
      setMyFeedback(res.data?.feedback || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load feedback');
      console.error('Load feedback error:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) {
      alert('Please enter a message');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await feedbackAPI.submitFeedback({
        category: form.category,
        message: form.message,
        eventType: 'platform',
        rating: 3 // Default rating
      });
      alert('Feedback submitted successfully!');
      setForm({ category: 'general', message: '' });
      await loadData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to submit feedback';
      alert(errorMsg);
      setError(errorMsg);
    } finally {
      setSubmitting(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
          <p className="text-gray-600 mt-2">Share your thoughts and suggestions</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Feedback */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Submit Feedback</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={submitFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {categories.map(c => (
                      <option key={c.key} value={c.key}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={6}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Share your feedback, suggestions, or report issues..."
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !form.message.trim()}
                    className="bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* My Feedback */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Feedback</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="text-gray-500 bg-white rounded-lg shadow p-8 text-center">Loading...</div>
              ) : myFeedback.length === 0 ? (
                <div className="text-gray-500 bg-white rounded-lg shadow p-8 text-center">
                  <p>No feedback submitted yet</p>
                  <p className="text-sm mt-2">Your submitted feedback will appear here</p>
                </div>
              ) : (
                myFeedback.map((feedback) => (
                  <div key={feedback._id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">
                          {feedback.category?.replace('-', ' ') || 'Feedback'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(feedback.createdAt)}
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(feedback.status || 'New')}`}>
                        {feedback.status || 'New'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                      {feedback.comments || feedback.message}
                    </p>
                    {feedback.adminResponse?.response && (
                      <div className="mt-3 pt-3 border-t border-gray-200 bg-blue-50 p-3 rounded">
                        <p className="text-sm font-medium text-gray-700 mb-1">Admin Response:</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {feedback.adminResponse.response}
                        </p>
                        {feedback.adminResponse.respondedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDate(feedback.adminResponse.respondedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
