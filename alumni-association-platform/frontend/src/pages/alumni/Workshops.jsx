import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workshopAPI } from '../../utils/api';
import useAuthStore from '../../store/authStore';

const Workshops = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [workshops, setWorkshops] = useState([]);
  const [myWorkshops, setMyWorkshops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [listRes, mineRes] = await Promise.all([
        workshopAPI.getAllWorkshops(),
        workshopAPI.getMyWorkshops().catch(() => ({ data: [] }))
      ]);
      setWorkshops(listRes.data?.workshops || listRes.data || []);
      setMyWorkshops(mineRes.data?.workshops || mineRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workshops');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (workshopId) => {
    navigate(`/workshops/${workshopId}/edit`);
  };

  const handleDelete = async (workshopId) => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this workshop?');
    if (!confirmed) return;

    try {
      await workshopAPI.deleteWorkshop(workshopId);
      
      // Remove the deleted workshop from both lists
      setWorkshops(prev => prev.filter(workshop => workshop._id !== workshopId));
      setMyWorkshops(prev => prev.filter(workshop => workshop._id !== workshopId));
      
      console.log('Workshop deleted successfully');
    } catch (err) {
      console.error('Delete workshop error:', err);
      alert(err.response?.data?.message || 'Failed to delete workshop');
    }
  };

  // Check if the current user owns the workshop
  const isWorkshopOwner = (workshop) => {
    return user && workshop.host?._id === user._id || workshop.host === user?._id;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workshops</h1>
          <p className="text-gray-600 mt-2">Learn from experts and share your knowledge</p>
        </div>

        <div className="mb-6 flex gap-3">
          <button onClick={() => navigate('/alumni/workshops/new')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Host a Workshop
          </button>
          <button onClick={loadData} className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Workshops */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Workshops</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading workshops...</div>
              ) : workshops.length === 0 ? (
                <div className="text-gray-500">No workshops found</div>
              ) : (
                workshops.map((workshop) => (
                  <div key={workshop._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{workshop.topic || workshop.title}</h3>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {(workshop.attendees?.length || 0)}/{workshop.capacity || 0}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{workshop.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Instructor:</span> {workshop.host?.name || '—'}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(workshop.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {workshop.time || '—'}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {
                          workshop.location?.type === 'online' ? (workshop.location?.onlineLink || 'Online')
                          : workshop.location?.type === 'in-person' ? (workshop.location?.address || 'In-person')
                          : workshop.location?.type === 'hybrid' ? (workshop.location?.address || 'Hybrid')
                          : '—'
                        }
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(Math.min(workshop.attendees?.length || 0, workshop.capacity || 1) / (workshop.capacity || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Edit and Delete buttons - always visible for testing */}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(workshop._id)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(workshop._id)}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Workshops */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Workshops</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : myWorkshops.length === 0 ? (
                <div className="text-gray-500">No hosted workshops</div>
              ) : (
                myWorkshops.map((workshop) => (
                  <div key={workshop._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{workshop.topic || workshop.title}</h3>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {new Date(workshop.date) > new Date() ? 'Scheduled' : 'Completed'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Date:</span> {new Date(workshop.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Participants:</span> {workshop.attendees?.length || 0}
                      </div>
                    </div>
                    {/* Edit and Delete buttons */}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(workshop._id)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(workshop._id)}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
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
      </div>
    </div>
  );
};

export default Workshops;
