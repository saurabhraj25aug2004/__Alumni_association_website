import React, { useEffect, useState } from 'react';
import { mentorshipAPI } from '../../utils/api';

const Mentorship = () => {
  const [mentors, setMentors] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mentorsRes, relRes] = await Promise.all([
        mentorshipAPI.getAvailableMentors(),
        mentorshipAPI.getMentorshipRelationships().catch(() => ({ data: [] }))
      ]);
      setMentors(mentorsRes.data?.mentors || mentorsRes.data || []);
      setRelationships(relRes.data?.relationships || relRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mentorship data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const requestMentorship = async (mentorId) => {
    try {
      await mentorshipAPI.sendMentorshipRequest(mentorId, 'I would like to request mentorship');
      alert('Mentorship request sent');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mentorship</h1>
          <p className="text-gray-600 mt-2">Connect with alumni mentors and grow your career</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Mentors */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Mentors</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading mentors...</div>
              ) : mentors.length === 0 ? (
                <div className="text-gray-500">No mentors available</div>
              ) : (
                mentors.map((mentor) => (
                  <div key={mentor._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                        <p className="text-gray-600">{mentor.position} at {mentor.company}</p>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Available
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(mentor.expertise || []).map((skill) => (
                        <span key={skill} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <button onClick={() => requestMentorship(mentor._id)} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Request Mentorship
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Mentorships */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Mentorships</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : relationships.length === 0 ? (
                <div className="text-gray-500">No mentorships yet</div>
              ) : (
                relationships.map((r) => (
                  <div key={r._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{r.program || 'Mentorship'}</h3>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">Mentor: {r.mentor?.name}</p>
                    <div className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">Sessions Completed:</span> {r.sessionsCompleted || 0}
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

export default Mentorship;
