import React, { useEffect, useState } from 'react';
import { mentorshipAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import useAuthStore from '../../store/authStore';

const Mentorship = () => {
  const { token, user } = useAuthStore();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, title: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxMentees: 10
  });

  useEffect(() => {
    loadPrograms();
  }, []);

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
      const response = await mentorshipAPI.getAllPrograms();
      setPrograms(response.data?.programs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load mentorship programs');
      console.error('Load programs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (editingProgram) {
        await mentorshipAPI.updateProgram(editingProgram._id, formData);
        alert('Mentorship program updated successfully!');
      } else {
        await mentorshipAPI.createProgram(formData);
        alert('Mentorship program created successfully!');
      }

      setShowForm(false);
      setEditingProgram(null);
      resetForm();
      await loadPrograms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save program');
      setError(err.response?.data?.message || 'Failed to save program');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      description: program.description,
      maxMentees: program.maxMentees || 10
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      setLoading(true);
      await mentorshipAPI.deleteProgram(deleteConfirm.id);
      alert('Mentorship program deleted successfully!');
      setDeleteConfirm({ show: false, id: null, title: '' });
      await loadPrograms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete program');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (programId, requestId, status) => {
    try {
      setLoading(true);
      await mentorshipAPI.respondToRequest(programId, requestId, status);
      alert(`Request ${status} successfully!`);
      await loadPrograms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      maxMentees: 10
    });
    setEditingProgram(null);
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mentorship</h1>
            <p className="text-gray-600 mt-2">Connect with students and share your expertise</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Program
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {editingProgram ? 'Edit Mentorship Program' : 'Create New Mentorship Program'}
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
                        placeholder="e.g., Software Engineering Mentorship"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your mentorship program, areas of expertise, and what mentees can expect..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximum Mentees
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={formData.maxMentees}
                        onChange={(e) => setFormData({ ...formData, maxMentees: parseInt(e.target.value) || 10 })}
                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
                      {loading ? 'Saving...' : editingProgram ? 'Update' : 'Create'}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Mentorship Programs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Mentorship Programs</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : programs.length === 0 ? (
                <div className="text-gray-500">No programs yet</div>
              ) : (
                programs.map((program) => (
                  <div key={program._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{program.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(program)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ show: true, id: program._id, title: program.title })}
                          className="text-red-600 hover:text-red-900 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Mentees: {program.mentees?.length || 0}/{program.maxMentees || 10}</span>
                        <span>Pending Requests: {program.requests?.filter(r => r.status === 'pending').length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mentee Requests */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mentee Requests</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="text-gray-500">Loading requests...</div>
              ) : programs.length === 0 || programs.every(p => !p.requests || p.requests.filter(r => r.status === 'pending').length === 0) ? (
                <div className="text-gray-500">No pending requests</div>
              ) : (
                programs.map((program) =>
                  (program.requests || [])
                    .filter(r => r.status === 'pending')
                    .map((request) => (
                      <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{request.name}</h3>
                            <p className="text-sm text-gray-600">{request.email}</p>
                            <p className="text-xs text-gray-500 mt-1">Program: {program.title}</p>
                          </div>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </div>
                        {request.message && (
                          <p className="text-sm text-gray-700 mb-3 p-2 bg-gray-50 rounded">
                            "{request.message}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mb-3">
                          Requested: {formatDate(request.requestedAt)}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRespondToRequest(program._id, request._id, 'accepted')}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRespondToRequest(program._id, request._id, 'rejected')}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                )
              )}
            </div>
          </div>
        </div>

        {/* Current Mentees Section */}
        {programs.some(p => p.mentees && p.mentees.length > 0) && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Mentees</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((program) =>
                (program.mentees || []).map((mentee, idx) => (
                  <div key={`${program._id}-${idx}`} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900">{mentee.name}</h4>
                    <p className="text-sm text-gray-600">{mentee.email}</p>
                    <p className="text-xs text-gray-500 mt-1">Program: {program.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Joined: {formatDate(mentee.joinedAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentorship;
