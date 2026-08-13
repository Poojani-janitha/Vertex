import { useState, useEffect } from 'react';
import api from '../api/axios';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState(null);
  const [trustScore, setTrustScore] = useState(null);

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

  useEffect(() => {
    if (selectedJob) {
      const fetchTrustScore = async () => {
        try {
          const response = await api.get(`/users/${selectedJob.employerId}/trust-score`);
          setTrustScore(response.data);
        } catch (err) {
          console.error('Failed to fetch trust score:', err);
        }
      };
      fetchTrustScore();
    } else {
      setTrustScore(null);
    }
  }, [selectedJob]);

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setApplyMessage(null);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    setApplyMessage(null);
  };

  const handleApply = async () => {
    setIsApplying(true);
    setApplyMessage(null);
    try {
      // Fetch logged-in user details dynamically
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user) {
        setApplyMessage({ type: 'error', text: 'You must be logged in to apply for jobs.' });
        setIsApplying(false);
        return;
      }

      await api.post('/applications', {
        jobId: selectedJob.id,
        studentId: user.id, 
        status: 'pending'
      });
      setApplyMessage({ type: 'success', text: 'Successfully applied! The employer will review your application.' });
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to apply. Please try again.';
      setApplyMessage({ type: 'error', text: errMsg });
    } finally {
      setIsApplying(false);
    }
  };

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
        <p className="text-sm mt-2">Make sure your backend is running properly.</p>
      </div>
    );
  }

  // Derive filtered jobs
  const filteredJobs = jobs.filter((job) => {
    const titleMatch = job.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const skillsMatch = job.skillsNeeded?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || skillsMatch;
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Available Jobs</h1>
        <p className="text-gray-400">Discover opportunities that match your skills.</p>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-800 p-4 rounded-xl mb-8 flex flex-col sm:flex-row gap-4 border border-gray-700 shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search jobs by title or required skills..."
            className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <select
            className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="filled">Filled</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
          <div className="text-gray-500 text-5xl mb-4">
            {jobs.length === 0 ? '💼' : '🔍'}
          </div>
          <h3 className="text-xl font-medium text-gray-300">
            {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your filters'}
          </h3>
          <p className="text-gray-500 mt-2">
            {jobs.length === 0 ? 'Check back later.' : 'Try adjusting your search terms or status filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 group">
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{job.title}</h3>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    job.status === 'open' || !job.status ? 'bg-green-900/50 text-green-400 border-green-800' :
                    job.status === 'filled' ? 'bg-blue-900/50 text-blue-400 border-blue-800' :
                    'bg-gray-700 text-gray-300 border-gray-600'
                  }`}>
                    {job.status || 'Open'}
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">
                  {job.description || 'No description provided.'}
                </p>
                
                <div className="space-y-2 mb-6">
                  {job.payAmount && (
                    <div className="flex items-center text-sm text-gray-300">
                      <span className="mr-2">💰</span> Rs {job.payAmount}
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
                
                <button 
                  onClick={() => handleViewDetails(job)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-auto"
                >
                  View Details & Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-white">{selectedJob.title}</h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-gray-200 leading-relaxed">
                    {selectedJob.description || 'No description provided for this job.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                    <div className="text-gray-400 text-sm mb-1">Pay Amount</div>
                    <div className="text-xl font-semibold text-green-400">Rs {selectedJob.payAmount || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                    <div className="text-gray-400 text-sm mb-1">Location</div>
                    <div className="text-lg font-medium text-white">{selectedJob.locationName || 'Remote / Unspecified'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-450 bg-gray-900/30 p-4 rounded-xl border border-gray-800">
                  <div>📅 Start Time: <span className="text-white font-medium">{selectedJob.startTime ? new Date(selectedJob.startTime).toLocaleString() : 'N/A'}</span></div>
                  <div>📅 End Time: <span className="text-white font-medium">{selectedJob.endTime ? new Date(selectedJob.endTime).toLocaleString() : 'N/A'}</span></div>
                </div>

                {(() => {
                  const lat = parseFloat(selectedJob.latitude);
                  const lng = parseFloat(selectedJob.longitude);
                  if (!isNaN(lat) && !isNaN(lng)) {
                    return (
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Job Location Map</h4>
                        <div className="h-60 rounded-xl overflow-hidden border border-gray-750">
                          <MapContainer center={[lat, lng]} zoom={14} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                            />
                            <Marker position={[lat, lng]} />
                          </MapContainer>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Trust Score Breakdown Widget */}
                {trustScore && (
                  <div className="bg-[#121824] p-5 rounded-xl border border-gray-700 space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-700/60 pb-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employer Trust Score</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-green-400">{trustScore.score}/100</span>
                        <span className="text-[9px] text-gray-500 uppercase font-bold px-1.5 py-0.5 rounded bg-green-950/40 text-green-300">Verified</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-300">
                      <div className="flex justify-between p-2 rounded bg-gray-900/40">
                        <span>⭐ Rating (40%):</span>
                        <strong className="text-white">{trustScore.breakdown.rating}/40 ({trustScore.metrics.avgRating}★)</strong>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-gray-900/40">
                        <span>⏱️ Worked Hours (30%):</span>
                        <strong className="text-white">{trustScore.breakdown.hours}/30 ({trustScore.metrics.verifiedHours}h)</strong>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-gray-900/40">
                        <span>💬 Reply Rate (20%):</span>
                        <strong className="text-white">{trustScore.breakdown.reply}/20 (95%)</strong>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-gray-900/40">
                        <span>💼 Completed Jobs (10%):</span>
                        <strong className="text-white">{trustScore.breakdown.completed}/10 ({trustScore.metrics.completedJobs})</strong>
                      </div>
                    </div>
                  </div>
                )}

                {selectedJob.skillsNeeded && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skillsNeeded.split(',').map((skill, index) => (
                        <span key={index} className="bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-800/50">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {applyMessage && (
                  <div className={`p-4 rounded-lg border ${
                    applyMessage.type === 'success' 
                      ? 'bg-green-900/30 border-green-800 text-green-300' 
                      : 'bg-red-900/30 border-red-800 text-red-300'
                  }`}>
                    {applyMessage.text}
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={handleApply}
                  disabled={isApplying || applyMessage?.type === 'success'}
                  className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-all transform ${
                    applyMessage?.type === 'success'
                      ? 'bg-green-600/50 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/25 text-white'
                  }`}
                >
                  {isApplying ? 'Applying...' : applyMessage?.type === 'success' ? 'Applied' : 'Apply Now'}
                </button>
                <button 
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
