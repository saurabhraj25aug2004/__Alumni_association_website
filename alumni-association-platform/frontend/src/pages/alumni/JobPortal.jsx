import React from 'react';

const JobPortal = () => {
  const jobListings = [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120k - $150k',
      postedBy: 'John Smith (Alumni)',
      postedDate: '2024-11-15',
      description: 'Looking for experienced software engineers to join our growing team.'
    },
    {
      id: 2,
      title: 'Product Manager',
      company: 'Innovation Labs',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$100k - $130k',
      postedBy: 'Sarah Johnson (Alumni)',
      postedDate: '2024-11-12',
      description: 'Join our product team to help build amazing user experiences.'
    }
  ];

  const myApplications = [
    {
      id: 1,
      jobTitle: 'Frontend Developer',
      company: 'WebTech Corp',
      status: 'Under Review',
      appliedDate: '2024-11-10'
    },
    {
      id: 2,
      jobTitle: 'Data Scientist',
      company: 'Analytics Pro',
      status: 'Interview Scheduled',
      appliedDate: '2024-11-08'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Portal</h1>
          <p className="text-gray-600 mt-2">Find opportunities and post job listings</p>
        </div>

        <div className="mb-6">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Post a Job
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Listings */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Positions</h2>
            <div className="space-y-4">
              {jobListings.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-gray-600">{job.company}</p>
                    </div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {job.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Location:</span> {job.location}
                    </div>
                    <div>
                      <span className="font-medium">Salary:</span> {job.salary}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{job.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Posted by {job.postedBy} on {job.postedDate}
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Applications */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Applications</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {myApplications.map((application) => (
                  <div key={application.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h3 className="font-semibold text-gray-900">{application.jobTitle}</h3>
                    <p className="text-sm text-gray-600">{application.company}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        application.status === 'Interview Scheduled' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {application.status}
                      </span>
                      <span className="text-xs text-gray-500">{application.appliedDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPortal;
