import React, { useEffect, useState } from 'react';
import { workshopAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import useAuthStore from '../../store/authStore';

const Workshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    socketService.connect(token);
    const refresh = () => loadData();
    socketService.onEntityCreated('workshops', refresh);
    socketService.onEntityUpdated('workshops', refresh);
    socketService.onEntityDeleted('workshops', refresh);
    return () => {
      socketService.removeListener('workshops:created');
      socketService.removeListener('workshops:updated');
      socketService.removeListener('workshops:deleted');
    };
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [listRes, myRes] = await Promise.all([
        workshopAPI.getAllWorkshops(),
        workshopAPI.getMyRegistrations().catch(() => ({ data: [] }))
      ]);
      setWorkshops(listRes.data?.workshops || listRes.data || []);
      setMyRegistrations(myRes.data?.registrations || myRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workshops');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (workshopId) => {
    try {
      await workshopAPI.registerForWorkshop(workshopId);
      await loadData();
      alert('Registered successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register');
    }
  };

  const handleCancel = async (workshopId) => {
    try {
      await workshopAPI.cancelWorkshopRegistration(workshopId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workshops</h1>
          <p className="text-gray-600 mt-2">Learn from alumni experts</p>
        </div>

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
                      <button onClick={() => handleRegister(workshop._id)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        Register
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Registrations */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Registrations</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : myRegistrations.length === 0 ? (
                <div className="text-gray-500">No registrations</div>
              ) : (
                myRegistrations.map((registration) => (
                  <div key={registration._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{registration.workshop?.topic || registration.workshop?.title}</h3>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Registered
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">Instructor: {registration.workshop?.host?.name}</p>
                    <div className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">Date:</span> {new Date(registration.workshop?.date).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                        View Details
                      </button>
                      <button onClick={() => handleCancel(registration.workshop?._id)} className="text-red-600 hover:text-red-900 text-sm font-medium">
                        Cancel Registration
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
