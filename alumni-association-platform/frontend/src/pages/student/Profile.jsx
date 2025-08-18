import React from 'react';

const Profile = () => {
  const profile = {
    name: 'Alice Johnson',
    email: 'alice.johnson@student.edu',
    studentId: 'STU2024001',
    year: '3rd Year',
    major: 'Computer Science',
    minor: 'Mathematics',
    gpa: '3.8',
    expectedGraduation: '2025',
    bio: 'Passionate about software development and machine learning. Looking forward to connecting with alumni for mentorship opportunities.',
    skills: ['Python', 'Java', 'React', 'Machine Learning', 'Data Structures'],
    interests: ['Web Development', 'AI/ML', 'Cybersecurity', 'Open Source']
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your student profile and information</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Profile Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <div className="h-24 w-24 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-gray-600">{profile.year} • {profile.major}</p>
                <p className="text-gray-500">Student ID: {profile.studentId}</p>
                <div className="mt-4 flex space-x-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Edit Profile
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    View Public Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student ID</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.studentId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.year}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Major</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.major}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Minor</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.minor}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GPA</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.gpa}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expected Graduation</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.expectedGraduation}</p>
                  </div>
                </div>
              </div>

              {/* Bio and Skills */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bio</h3>
                <p className="text-sm text-gray-700 mb-6">{profile.bio}</p>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Skills</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas of Interest</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {interest}
                    </span>
                  ))}
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
