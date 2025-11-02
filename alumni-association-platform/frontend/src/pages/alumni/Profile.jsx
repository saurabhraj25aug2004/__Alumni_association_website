import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authAPI } from '../../utils/api';

const Profile = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    graduationYear: '',
    major: '',
    location: '',
    bio: '',
    phone: '',
    socialLinks: { linkedin: '', github: '', twitter: '', website: '' },
    profileImage: null
  });

  const [editForm, setEditForm] = useState({ ...profile });

  // Load profile data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfileData();
  }, [isAuthenticated, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getMe();
      const u = res.data || user;
      if (u) {
        setProfile({
          name: u.name || '',
          email: u.email || '',
          graduationYear: u.graduationYear || '',
          major: u.major || '',
          location: u.location || '',
          bio: u.bio || '',
          phone: u.phone || '',
          socialLinks: u.socialLinks || { linkedin: '', github: '', twitter: '', website: '' },
          profileImage: u.profileImage?.url || null
        });
        setEditForm({
          name: u.name || '',
          email: u.email || '',
          graduationYear: u.graduationYear || '',
          major: u.major || '',
          location: u.location || '',
          bio: u.bio || '',
          phone: u.phone || '',
          socialLinks: u.socialLinks || { linkedin: '', github: '', twitter: '', website: '' },
          profileImage: u.profileImage?.url || null
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };


  // Handle social links change
  const handleSocialLinkChange = (platform, value) => {
    setEditForm(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  // Handle profile image upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }
    
    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditForm(prev => ({ ...prev, profileImageFile: file, profileImage: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const formData = new FormData();
      formData.append('name', editForm.name || '');
      formData.append('email', editForm.email || '');
      if (editForm.graduationYear) formData.append('graduationYear', editForm.graduationYear);
      if (editForm.major) formData.append('major', editForm.major);
      if (editForm.location) formData.append('location', editForm.location);
      if (editForm.bio) formData.append('bio', editForm.bio);
      if (editForm.phone) formData.append('phone', editForm.phone);
      
      // Append social links
      if (editForm.socialLinks) {
        formData.append('socialLinks[linkedin]', editForm.socialLinks.linkedin || '');
        formData.append('socialLinks[github]', editForm.socialLinks.github || '');
        formData.append('socialLinks[twitter]', editForm.socialLinks.twitter || '');
        formData.append('socialLinks[website]', editForm.socialLinks.website || '');
      }

      // Append profile image file if a new file was selected
      if (editForm.profileImageFile) {
        formData.append('image', editForm.profileImageFile);
      }

      const res = await authAPI.updateProfile(formData);
      const updated = res.data?.user || editForm;
      setProfile({
        ...updated,
        profileImage: updated.profileImage?.url || updated.profileImage || null,
        socialLinks: updated.socialLinks || { linkedin: '', github: '', twitter: '', website: '' }
      });
      setEditForm({
        ...updated,
        profileImage: updated.profileImage?.url || updated.profileImage || null,
        socialLinks: updated.socialLinks || { linkedin: '', github: '', twitter: '', website: '' }
      });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save profile changes' });
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditForm({ ...profile });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your alumni profile and information</p>
        </div>

        {/* Success/Error Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {/* Profile Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                {editForm.profileImage ? (
                  <img 
                    src={editForm.profileImage} 
                    alt="Profile" 
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                {isEditing && (
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-sm text-gray-600"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{profile.name || 'Alumni Member'}</h2>
                <p className="text-gray-600">{profile.major || 'Major not specified'}</p>
                {profile.graduationYear && (
                  <p className="text-gray-500">Class of {profile.graduationYear}</p>
                )}
                {profile.location && (
                  <p className="text-gray-500">{profile.location}</p>
                )}
                <div className="mt-4 flex space-x-4">
                  {!isEditing ? (
                    <>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit Profile
                      </button>
                      {user?.id && (
                        <button 
                          onClick={() => navigate(`/alumni/public/${user.id}`)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          View Public Profile
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.graduationYear}
                        onChange={(e) => handleInputChange('graduationYear', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.graduationYear}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Major</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.major}
                        onChange={(e) => handleInputChange('major', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.major}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="City, State/Country"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile.location || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio and Skills */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-sm text-gray-700 mb-6">{profile.bio}</p>
                )}

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.socialLinks.linkedin || ''}
                        onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      profile.socialLinks?.linkedin ? (
                        <a 
                          href={profile.socialLinks.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {profile.socialLinks.linkedin}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-gray-500">Not provided</p>
                      )
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GitHub</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.socialLinks.github || ''}
                        onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                        placeholder="https://github.com/username"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      profile.socialLinks?.github ? (
                        <a 
                          href={profile.socialLinks.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {profile.socialLinks.github}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-gray-500">Not provided</p>
                      )
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Twitter</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.socialLinks.twitter || ''}
                        onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                        placeholder="https://twitter.com/username"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      profile.socialLinks?.twitter ? (
                        <a 
                          href={profile.socialLinks.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {profile.socialLinks.twitter}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-gray-500">Not provided</p>
                      )
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editForm.socialLinks.website || ''}
                        onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      profile.socialLinks?.website ? (
                        <a 
                          href={profile.socialLinks.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {profile.socialLinks.website}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-gray-500">Not provided</p>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
