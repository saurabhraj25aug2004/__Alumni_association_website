import React, { useEffect, useState } from 'react';
import { feedbackAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import useAuthStore from '../../store/authStore';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await feedbackAPI.getAllFeedback();
      setFeedbacks(res.data?.feedback || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const { token } = useAuthStore();

  useEffect(() => { load(); }, []);

  useEffect(() => {
    socketService.connect(token);
    const refresh = () => load();
    socketService.onEntityCreated('feedback', refresh);
    socketService.onEntityUpdated('feedback', refresh);
    socketService.onEntityDeleted('feedback', refresh);
    return () => {
      socketService.removeListener('feedback:created');
      socketService.removeListener('feedback:updated');
      socketService.removeListener('feedback:deleted');
    };
  }, [token]);

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

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const markResolved = async (id) => {
    try {
      await feedbackAPI.updateFeedbackStatus(id, 'resolved');
      await load();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteFeedback = async (id) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await feedbackAPI.deleteFeedback(id);
      setFeedbacks(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600 mt-2">Review and manage user feedback</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        <div className="grid gap-6">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-gray-500">No feedback yet</div>
          ) : feedbacks.map((feedback) => (
            <div key={feedback._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{feedback.subject || 'Feedback'}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(feedback.status || 'New')}`}>
                      {feedback.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{feedback.message}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>From: {feedback.user?.name || 'User'}</span>
                    <span>Email: {feedback.user?.email || '-'}</span>
                    <span>Date: {new Date(feedback.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="flex items-center space-x-1">
                    {renderStars(feedback.rating || 0)}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                  Reply
                </button>
                <button onClick={() => markResolved(feedback._id)} className="text-green-600 hover:text-green-900 text-sm font-medium">
                  Mark Resolved
                </button>
                <button onClick={() => deleteFeedback(feedback._id)} className="text-red-600 hover:text-red-900 text-sm font-medium">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">25</div>
              <div className="text-sm text-gray-600">Total Feedback</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">8</div>
              <div className="text-sm text-gray-600">New</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">5</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
