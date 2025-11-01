import React, { useEffect, useState } from 'react';
import { jobAPI } from '../../utils/api';
import socketService from '../../utils/socket';
import useAuthStore from '../../store/authStore';

const JobPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    socketService.connect(token);
    const refresh = () => loadData();
    socketService.onEntityCreated('jobs', refresh);
    socketService.onEntityUpdated('jobs', refresh);
    socketService.onEntityDeleted('jobs', refresh);
    return () => {
      socketService.removeListener('jobs:created');
      socketService.removeListener('jobs:updated');
      socketService.removeListener('jobs:deleted');
    };
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [jobsRes, appsRes] = await Promise.all([
        jobAPI.getAllJobs(),
        jobAPI.getMyApplications().catch(() => ({ data: [] }))
      ]);
      setJobs(jobsRes.data?.jobs || jobsRes.data || []);
      setMyApplications(appsRes.data?.applications || appsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      await jobAPI.applyForJob(jobId);
      await loadData();
      alert('Applied successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Portal</h1>
          <p className="text-gray-600 mt-2">Find internship and job opportunities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Listings */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Positions</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-gray-500">Loading jobs...</div>
              ) : jobs.length === 0 ? (
                <div className="text-gray-500">No jobs found</div>
              ) : (
                jobs.map((job) => (
                  <div key={job._id} className="bg-white rounded-lg shadow p-6">
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
                        <span className="font-medium">Salary:</span> {job.salary?.min && job.salary?.max ? `${job.salary.min} - ${job.salary.max} ${job.salary.currency || ''}` : '-'}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{job.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Posted by {job.postedBy?.name || 'Unknown'} on {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                      <button onClick={() => handleApply(job._id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Applications */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Applications</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-gray-500">Loading applications...</div>
                ) : myApplications.length === 0 ? (
                  <div className="text-gray-500">No applications yet</div>
                ) : (
                  myApplications.map((application) => (
                    <div key={application._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <h3 className="font-semibold text-gray-900">{application.job?.title}</h3>
                      <p className="text-sm text-gray-600">{application.job?.company}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          application.status === 'interview' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {application.status}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPortal;
