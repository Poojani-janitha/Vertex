import { useState, useEffect } from 'react';
import api from '../api/axios';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs');
        setJobs(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
        <h3 className="font-bold">Error Loading Jobs</h3>
        <p>{error}</p>
        <p className="text-sm mt-2">Make sure your backend is running on port 5000 (and not conflicting with AirPlay).</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Available Jobs</h1>
          <p className="text-gray-400">Discover opportunities that match your skills.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium text-sm transition shadow-lg shadow-blue-500/20">
          Post a Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
          <div className="text-gray-500 text-5xl mb-4">💼</div>
          <h3 className="text-xl font-medium text-gray-300">No jobs posted yet</h3>
          <p className="text-gray-500 mt-2">Check back later or post a new job.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{job.title}</h3>
                  <span className="bg-green-900/50 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-800">
                    {job.status || 'Open'}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">
                  {job.description || 'No description provided.'}
                </p>
                
                <div className="space-y-2 mb-6">
                  {job.payAmount && (
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="mr-2">💰</span> ${job.payAmount}
                    </div>
                  )}
                  {job.locationName && (
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="mr-2">📍</span> {job.locationName}
                    </div>
                  )}
                  {job.skillsNeeded && (
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="mr-2">🔧</span> {job.skillsNeeded}
                    </div>
                  )}
                </div>
                
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
