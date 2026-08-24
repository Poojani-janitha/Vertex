import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SkeletonCard } from '../components/SkeletonLoader';

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Haversine formula to compute distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

const Jobs = () => {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [maxDistance, setMaxDistance] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('detecting');

  // Modal states
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState(null);
  const [trustScore, setTrustScore] = useState(null);

  // Get user geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationStatus('ready');
        },
        () => {
          // Default to Colombo center if permission denied or unavailable
          setUserLocation({ lat: 6.9271, lng: 79.8612 });
          setLocationStatus('default');
        }
      );
    } else {
      setUserLocation({ lat: 6.9271, lng: 79.8612 });
      setLocationStatus('default');
    }
  }, []);

  // Update search term when URL param changes
  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery !== null) {
      setSearchTerm(urlQuery);
    }
  }, [searchParams]);

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
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user) {
        setApplyMessage({ type: 'error', text: 'You must be logged in to apply for jobs.' });
        setIsApplying(false);
        return;
      }

      if (user.role !== 'student') {
        setApplyMessage({ type: 'error', text: 'Only student accounts can apply for job postings.' });
        setIsApplying(false);
        return;
      }

      await api.post('/applications', {
        jobId: selectedJob.id
      });
      setApplyMessage({ type: 'success', text: 'Successfully applied! The employer will review your application.' });
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to apply. Please try again.';
      setApplyMessage({ type: 'error', text: errMsg });
    } finally {
      setIsApplying(false);
    }
  };

  // Derive filtered jobs with distance
  const filteredJobs = jobs
    .map((job) => {
      const dist = userLocation && job.latitude && job.longitude
        ? calculateDistance(userLocation.lat, userLocation.lng, parseFloat(job.latitude), parseFloat(job.longitude))
        : null;
      return { ...job, distanceKm: dist };
    })
    .filter((job) => {
      const titleMatch = job.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const skillsMatch = job.skillsNeeded?.toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = job.locationName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = titleMatch || skillsMatch || locationMatch;
      
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;

      let matchesDistance = true;
      if (maxDistance !== 'all' && job.distanceKm !== null) {
        matchesDistance = job.distanceKm <= parseFloat(maxDistance);
      }
      
      return matchesSearch && matchesStatus && matchesDistance;
    });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#06402B] tracking-tight">Available Shifts & Jobs</h1>
          <p className="text-gray-500 text-sm">Discover verified opportunities matched to your skills and free hours.</p>
        </div>
        {userLocation && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start md:self-auto">
            <span>📍 GPS Location Active</span>
          </div>
        )}
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-2xl flex flex-col md:flex-row gap-4 border border-gray-200 shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="text-gray-400 text-sm">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search by title, location or required skills..."
            className="w-full bg-gray-50 text-[#06402B] border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#06402B] focus:ring-1 focus:ring-[#06402B]/30 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Distance Filter */}
        <div className="md:w-44">
          <select
            className="w-full bg-gray-50 text-[#06402B] border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#06402B] cursor-pointer"
            value={maxDistance}
            onChange={(e) => setMaxDistance(e.target.value)}
          >
            <option value="all">📍 All Distances</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="md:w-40">
          <select
            className="w-full bg-gray-50 text-[#06402B] border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#06402B] cursor-pointer"
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
          <h3 className="font-bold">Error Loading Jobs</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 border-dashed space-y-3">
          <div className="text-gray-400 text-5xl">
            {jobs.length === 0 ? '💼' : '🔍'}
          </div>
          <h3 className="text-xl font-bold text-gray-700">
            {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your filters'}
          </h3>
          <p className="text-gray-500 text-xs max-w-sm mx-auto">
            {jobs.length === 0 ? 'Check back later for newly posted shifts.' : 'Try clearing your search terms or increasing the distance radius.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-white rounded-3xl border border-gray-200/80 p-6 flex flex-col justify-between hover:shadow-lg hover:border-emerald-300 transition-all duration-300 transform hover:-translate-y-1 relative"
            >
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="text-lg font-bold text-[#06402B] leading-tight line-clamp-1">{job.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    job.status === 'open' ? 'bg-green-100 text-green-800' :
                    job.status === 'filled' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
                
                <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">
                  {job.description || 'No description provided.'}
                </p>
                
                <div className="space-y-2 mb-6 text-xs">
                  {job.payAmount && (
                    <div className="flex items-center font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl">
                      <span className="mr-2">💰</span> LKR {parseFloat(job.payAmount).toFixed(2)} / shift
                    </div>
                  )}
                  {job.locationName && (
                    <div className="flex items-center text-gray-600 justify-between">
                      <div className="flex items-center truncate">
                        <span className="mr-2">📍</span> {job.locationName}
                      </div>
                      {job.distanceKm !== null && (
                        <span className="text-[10px] bg-gray-100 font-bold text-gray-700 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
                          {job.distanceKm} km
                        </span>
                      )}
                    </div>
                  )}
                  {job.skillsNeeded && (
                    <div className="flex items-center text-gray-500 text-[11px] truncate">
                      <span className="mr-2">🔧</span> {job.skillsNeeded}
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => handleViewDetails(job)}
                className="w-full bg-[#06402B] hover:bg-[#0a5c3f] text-white font-bold text-xs py-3 px-4 rounded-xl transition shadow-md shadow-emerald-950/10 cursor-pointer"
              >
                View Details & Apply →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#06402B]">{selectedJob.title}</h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-[#06402B] transition-colors p-1 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
                    {selectedJob.description || 'No description provided for this job.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-gray-500 text-xs mb-1">Pay Amount</div>
                    <div className="text-xl font-bold text-emerald-800">LKR {selectedJob.payAmount || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-gray-500 text-xs mb-1">Location</div>
                    <div className="text-base font-semibold text-[#06402B]">{selectedJob.locationName || 'Remote / Unspecified'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div>📅 Start Time: <span className="text-[#06402B] font-semibold">{selectedJob.startTime ? new Date(selectedJob.startTime).toLocaleString() : 'N/A'}</span></div>
                  <div>📅 End Time: <span className="text-[#06402B] font-semibold">{selectedJob.endTime ? new Date(selectedJob.endTime).toLocaleString() : 'N/A'}</span></div>
                </div>

                {(() => {
                  const lat = parseFloat(selectedJob.latitude);
                  const lng = parseFloat(selectedJob.longitude);
                  if (!isNaN(lat) && !isNaN(lng)) {
                    return (
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Job Location Map</h4>
                        <div className="h-60 rounded-xl overflow-hidden border border-gray-200">
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
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Employer Trust Score</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-emerald-800">{trustScore.score}/100</span>
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Verified</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-600">
                      <div className="flex justify-between p-2.5 rounded-lg bg-white border border-gray-200">
                        <span>⭐ Rating (40%):</span>
                        <strong className="text-[#06402B]">{trustScore.breakdown.rating}/40 ({trustScore.metrics.avgRating}★)</strong>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg bg-white border border-gray-200">
                        <span>⏱️ Worked Hours (30%):</span>
                        <strong className="text-[#06402B]">{trustScore.breakdown.hours}/30 ({trustScore.metrics.verifiedHours}h)</strong>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg bg-white border border-gray-200">
                        <span>💬 Reply Rate (20%):</span>
                        <strong className="text-[#06402B]">{trustScore.breakdown.reply}/20 ({trustScore.metrics.replyRate || 0}%)</strong>
                      </div>
                      <div className="flex justify-between p-2.5 rounded-lg bg-white border border-gray-200">
                        <span>💼 Completed Jobs (10%):</span>
                        <strong className="text-[#06402B]">{trustScore.breakdown.completed}/10 ({trustScore.metrics.completedJobs})</strong>
                      </div>
                    </div>
                  </div>
                )}

                {selectedJob.skillsNeeded && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skillsNeeded.split(',').map((skill, index) => (
                        <span key={index} className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {applyMessage && (
                  <div className={`p-4 rounded-xl border text-sm font-medium ${
                    applyMessage.type === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    {applyMessage.text}
                  </div>
                )}
              </div>

              <div className="mt-8 flex gap-4">
                <button 
                  onClick={handleApply}
                  disabled={isApplying || applyMessage?.type === 'success'}
                  className={`flex-1 font-bold py-3 px-6 rounded-xl transition-all transform text-sm ${
                    applyMessage?.type === 'success'
                      ? 'bg-emerald-600 text-white opacity-80 cursor-not-allowed'
                      : 'bg-[#06402B] hover:bg-[#0a5c3f] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/20 text-white cursor-pointer'
                  }`}
                >
                  {isApplying ? 'Applying...' : applyMessage?.type === 'success' ? 'Applied' : 'Apply Now'}
                </button>
                <button 
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors border border-gray-200 text-sm cursor-pointer"
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
