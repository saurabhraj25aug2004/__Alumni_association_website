import React, { useEffect, useState } from 'react';
import { mentorshipAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import useAuthStore from '../../store/authStore';

const Mentorship = () => {
  const { token } = useAuthStore();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    loadPrograms();
  }, [searchTerm]);

  useEffect(() => {
    if (token) {
      socketService.connect(token);
      const refresh = () => loadPrograms();
      socketService.onEntityCreated('mentorship-programs', refresh);
      socketService.onEntityUpdated('mentorship-programs', refresh);
      socketService.onEntityDeleted('mentorship-programs', refresh);
      return () => {
        socketService.removeListener('mentorship-programs:created');
        socketService.removeListener('mentorship-programs:updated');
        socketService.removeListener('mentorship-programs:deleted');
      };
    }
  }, [token]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await mentorshipAPI.getAllPrograms(params);
      setPrograms(response.data?.programs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mentorship programs');
      console.error('Load programs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = (program) => {
    setSelectedProgram(program);
    setRequestMessage('');
    setShowRequestModal(true);
  };

  const submitRequest = async () => {
    if (!selectedProgram) return;
    
    try {
      setLoading(true);
      await mentorshipAPI.requestMentorship(selectedProgram._id, requestMessage || 'I would like to request mentorship');
      alert('Mentorship request sent successfully!');
      setShowRequestModal(false);
      setSelectedProgram(null);
      setRequestMessage('');
      await loadPrograms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const hasRequested = (program) => {
    if (!program.requests) return false;
    const userId = useAuthStore.getState().user?._id || useAuthStore.getState().user?.id;
    return program.requests.some(r => 
      r.mentee?._id === userId || 
      (typeof r.mentee === 'object' && r.mentee?._id === userId) ||
      r.email === useAuthStore.getState().user?.email
    );
  };

  const isMentee = (program) => {
    if (!program.mentees) return false;
    const userId = useAuthStore.getState().user?._id || useAuthStore.getState().user?.id;
    return program.mentees.some(m => 
      m.mentee?._id === userId ||
      (typeof m.mentee === 'object' && m.mentee?._id === userId) ||
      m.email === useAuthStore.getState().user?.email
    );
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mentorship</h1>
          <p className="text-gray-600 mt-2">Connect with alumni mentors and grow your career</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search mentorship programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        {/* Available Mentorships */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Mentorships</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center text-gray-500">Loading programs...</div>
            ) : programs.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 bg-white rounded-lg shadow p-8">
                <p className="text-lg">No mentorship programs available</p>
                {searchTerm && (
                  <p className="mt-2 text-sm">Try adjusting your search</p>
                )}
              </div>
            ) : (
              programs.map((program) => {
                const alreadyRequested = hasRequested(program);
                const alreadyMentee = isMentee(program);
                const isFull = (program.mentees?.length || 0) >= (program.maxMentees || 10);

                return (
                  <div key={program._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{program.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">by {program.mentorName || 'Alumni'}</p>
                      </div>
                      {alreadyMentee && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Member
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3">{program.description}</p>
                    <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                      <span>Mentees: {program.mentees?.length || 0}/{program.maxMentees || 10}</span>
                      <span>Created: {formatDate(program.createdAt)}</span>
                    </div>
                    <button
                      onClick={() => handleRequestMentorship(program)}
                      disabled={alreadyRequested || alreadyMentee || isFull || loading}
                      className={`w-full py-2 px-4 rounded-lg transition-colors text-sm font-medium ${
                        alreadyMentee
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : alreadyRequested
                          ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                          : isFull
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {alreadyMentee
                        ? 'Already a Mentee'
                        : alreadyRequested
                        ? 'Request Pending'
                        : isFull
                        ? 'Program Full'
                        : 'Request Mentorship'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Request Modal */}
        {showRequestModal && selectedProgram && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Request Mentorship
                </h2>
                <p className="text-gray-600 mb-4">
                  Request to join <strong>"{selectedProgram.title}"</strong> by {selectedProgram.mentorName}
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Tell your mentor why you'd like their mentorship..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setSelectedProgram(null);
                      setRequestMessage('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitRequest}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentorship;
