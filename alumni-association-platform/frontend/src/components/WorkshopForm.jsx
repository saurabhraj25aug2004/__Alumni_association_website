import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workshopAPI } from '../utils/api';
import ImageUpload from './ImageUpload';

const WorkshopForm = ({ isEditing = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    maxAttendees: '',
    category: 'career',
    isOnline: false,
    meetingLink: '',
    requirements: '',
    materials: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workshop, setWorkshop] = useState(null);

  useEffect(() => {
    if (isEditing && id) {
      fetchWorkshop();
    }
  }, [isEditing, id]);

  const fetchWorkshop = async () => {
    try {
      setLoading(true);
      const response = await workshopAPI.getWorkshopById(id);
      const workshopData = response.data;
      setWorkshop(workshopData);
      
      // Format date and time for input fields
      const workshopDate = new Date(workshopData.date);
      const dateStr = workshopDate.toISOString().split('T')[0];
      const timeStr = workshopDate.toTimeString().slice(0, 5);
      
      setFormData({
        title: workshopData.topic || workshopData.title || '',
        description: workshopData.description || '',
        date: dateStr,
        time: timeStr,
        // Convert duration from minutes to hours
        duration: workshopData.duration ? (workshopData.duration / 60).toString() : '',
        location: workshopData.location?.address || workshopData.location || '',
        maxAttendees: workshopData.capacity || workshopData.maxAttendees || '',
        category: workshopData.category || 'career',
        isOnline: workshopData.location?.type === 'online' || false,
        meetingLink: workshopData.location?.onlineLink || workshopData.meetingLink || '',
        requirements: workshopData.requirements || '',
        materials: workshopData.materials || '',
      });
    } catch (err) {
      setError('Failed to load workshop data');
      console.error('Workshop fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }
    
    if (!formData.date) {
      setError('Date is required');
      return;
    }
    
    if (!formData.time) {
      setError('Time is required');
      return;
    }
    
    if (!formData.duration) {
      setError('Duration is required');
      return;
    }
    
    if (!formData.maxAttendees || parseInt(formData.maxAttendees) < 1) {
      setError('Maximum attendees must be at least 1');
      return;
    }
    
    if (formData.isOnline && !formData.meetingLink.trim()) {
      setError('Meeting link is required for online workshops');
      return;
    }
    
    if (!formData.isOnline && !formData.location.trim()) {
      setError('Location is required for in-person workshops');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare form data
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('date', formData.date);
      submitData.append('time', formData.time);
      submitData.append('duration', formData.duration);
      submitData.append('location', formData.location);
      submitData.append('maxAttendees', formData.maxAttendees);
      submitData.append('category', formData.category);
      submitData.append('isOnline', formData.isOnline);
      submitData.append('meetingLink', formData.meetingLink);
      submitData.append('requirements', formData.requirements);
      // Note: materials field removed - backend expects JSON array format
      // If needed, send as: JSON.stringify([{title, url, type}])
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      let response;
      if (isEditing) {
        response = await workshopAPI.updateWorkshop(id, submitData);
        console.log('Workshop updated successfully:', response.data);
      } else {
        response = await workshopAPI.createWorkshop(submitData);
        console.log('Workshop created successfully:', response.data);
      }

      navigate('/alumni/workshops');
    } catch (err) {
      // Better error handling
      console.error('Workshop save error:', err);
      if (err.response?.data?.errors) {
        // Handle validation errors array
        setError(err.response.data.message + ': ' + err.response.data.errors.join(', '));
      } else {
        setError(err.response?.data?.message || 'Failed to save workshop. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (fileOrNull) => {
    setImageFile(fileOrNull);
  };

  if (loading && isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workshop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {isEditing ? 'Edit Workshop' : 'Create New Workshop'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter workshop title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe the workshop content and objectives"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.time}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  min="0.5"
                  step="0.5"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="2"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter workshop location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {/* Online Workshop */}
            <div className="flex items-center">
              <input
                id="isOnline"
                name="isOnline"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.isOnline}
                onChange={handleChange}
              />
              <label htmlFor="isOnline" className="ml-2 block text-sm text-gray-900">
                This is an online workshop
              </label>
            </div>

            {/* Meeting Link (for online workshops) */}
            {formData.isOnline && (
              <div>
                <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700">
                  Meeting Link
                </label>
                <input
                  type="url"
                  id="meetingLink"
                  name="meetingLink"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://meet.google.com/..."
                  value={formData.meetingLink}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Max Attendees */}
            <div>
              <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700">
                Maximum Attendees
              </label>
              <input
                type="number"
                id="maxAttendees"
                name="maxAttendees"
                min="1"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="20"
                value={formData.maxAttendees}
                onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="career">Career Development</option>
                <option value="technology">Technology</option>
                <option value="leadership">Leadership</option>
                <option value="networking">Networking</option>
                <option value="skills">Skills Development</option>
                <option value="industry">Industry Insights</option>
              </select>
            </div>

            {/* Requirements */}
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                Prerequisites/Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Any prerequisites or requirements for attendees"
                value={formData.requirements}
                onChange={handleChange}
              />
            </div>

            {/* Materials */}
            <div>
              <label htmlFor="materials" className="block text-sm font-medium text-gray-700">
                Materials/Resources
              </label>
              <textarea
                id="materials"
                name="materials"
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Materials or resources attendees should bring"
                value={formData.materials}
                onChange={handleChange}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workshop Image
              </label>
              <ImageUpload onImageUpload={handleImageUpload} currentImage={workshop?.imageUrl?.url} maxSize={5} />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  isEditing ? 'Update Workshop' : 'Create Workshop'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkshopForm;

