import React, { useEffect, useState } from 'react';
import { mentorshipAPI } from '../../utils/api';

const Mentorship = () => {
  const [requests, setRequests] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqRes, relRes] = await Promise.all([
        mentorshipAPI.getMentorshipRequests(),
        mentorshipAPI.getMentorshipRelationships().catch(() => ({ data: [] }))
      ]);
      setRequests(reqRes.data?.requests || reqRes.data || []);
      setRelationships(relRes.data?.relationships || relRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mentorship data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const respond = async (requestId, response) => {
    try {
      await mentorshipAPI.respondToMentorshipRequest(requestId, response);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mentorship</h1>
          <p className="text-gray-600 mt-2">Connect with students and share your expertise</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Mentorship Relationships */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Mentorship Programs</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : relationships.length === 0 ? (
                <div className="text-gray-500">No programs yet</div>
              ) : (
                relationships.map((program) => (
                  <div key={program._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{program.title || program.program || 'Mentorship'}</h3>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Mentees: {program.mentees?.length || 0}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mentee Requests */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mentee Requests</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="text-gray-500">No pending requests</div>
              ) : (
                requests.map((req) => (
                  <div key={req._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{req.student?.name}</h3>
                        <p className="text-sm text-gray-600">{req.student?.major || ''}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${req.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{req.status}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{req.message}</p>
                    {req.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button onClick={() => respond(req._id, 'accept')} className="text-green-600 hover:text-green-900 text-sm font-medium">Accept</button>
                        <button onClick={() => respond(req._id, 'decline')} className="text-red-600 hover:text-red-900 text-sm font-medium">Decline</button>
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

export default Mentorship;
