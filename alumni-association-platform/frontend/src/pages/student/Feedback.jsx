import React, { useEffect, useState } from 'react';
import { feedbackAPI } from '../../utils/api';

const Feedback = () => {
  const categories = [
    { key: 'general', title: 'General Feedback' },
    { key: 'mentorship', title: 'Mentorship Program' },
    { key: 'workshops', title: 'Workshops & Events' },
    { key: 'jobs', title: 'Job Portal' },
  ];

  const [myFeedback, setMyFeedback] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: 'general', message: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await feedbackAPI.getMyFeedback();
      setMyFeedback(res.data?.feedback || res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const submitFeedback = async () => {
    if (!form.message.trim()) return;
    try {
      setSubmitting(true);
      await feedbackAPI.submitFeedback({ category: form.category, message: form.message });
      setForm({ category: 'general', message: '' });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border-gray-300 rounded-md">
                  {categories.map(c => <option key={c.key} value={c.key}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="w-full border-gray-300 rounded-md" placeholder="Share your feedback..."/>
              </div>
              <div className="flex justify-end">
                <button disabled={submitting || !form.message.trim()} onClick={submitFeedback} className="bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>

          {/* My Feedback */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Feedback</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : myFeedback.length === 0 ? (
                <div className="text-gray-500">No feedback yet</div>
              ) : (
                myFeedback.map((feedback) => (
                  <div key={feedback._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{feedback.category}</h3>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {feedback.status || 'Submitted'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{feedback.message}</p>
                    <div className="text-sm text-gray-500">
                      Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                    </div>
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
