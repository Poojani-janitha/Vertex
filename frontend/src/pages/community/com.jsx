import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map click hook to update coordinates
const LocationSelector = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
};

const CommunityDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [verification, setVerification] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Floating report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportEmail, setReportEmail] = useState('');
  const [reportName, setReportName] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(null);

  // QR Modal states
  const [selectedJobForQR, setSelectedJobForQR] = useState(null);
  const [qrType, setQrType] = useState('check-in');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [qrCountdown, setQrCountdown] = useState(600); // 10 minutes

  // Active Job Details state (to view applicants)
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Fetch Employer and Jobs data
  const fetchData = async () => {
    try {
      const meResponse = await api.get('/auth/me');
      setUser(meResponse.data);
      
      const verificationData = meResponse.data.employerVerification || null;
      setVerification(verificationData);

      // If approved, load their jobs
      if (verificationData && verificationData.verificationStatus === 'approved') {
        const jobsResponse = await api.get('/jobs/my-jobs');
        setJobs(jobsResponse.data);
      }
    } catch (err) {
      console.error('Fetch dashboard error:', err);
      setError('Failed to load profile. Please make sure you are logged in as an employer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Timer for QR code expiration
  useEffect(() => {
    let timer;
    if (qrCodeData && qrCountdown > 0) {
      timer = setInterval(() => {
        setQrCountdown((prev) => prev - 1);
      }, 1000);
    } else if (qrCountdown === 0) {
      setQrCodeData(null);
    }
    return () => clearInterval(timer);
  }, [qrCodeData, qrCountdown]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !user || user.role !== 'employer') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-xl shadow-lg text-center">
          <h3 className="font-bold text-lg mb-2">Access Restrict</h3>
          <p>{error || 'This dashboard is reserved for verified Community (Employer) members only.'}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Render pending verification approval screen
  if (!verification || verification.verificationStatus !== 'approved') {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl p-8 text-center space-y-6">
          <div className="text-yellow-400 text-5xl animate-pulse">⏳</div>
          <h2 className="text-3xl font-extrabold text-white">Pending Admin Approval</h2>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
            Your verification status is currently <span className="text-yellow-400 font-bold uppercase">{verification?.verificationStatus || 'pending'}</span>. 
            An administrator needs to approve your credentials before you can post jobs, manage applicants, or view student details.
          </p>

          <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 max-w-md mx-auto text-left space-y-2">
            <h3 className="font-bold text-gray-300 border-b border-gray-700 pb-2 mb-2">Registration Overview</h3>
            <div className="text-sm text-gray-400"><span className="font-semibold text-gray-300">Name:</span> {user.name}</div>
            <div className="text-sm text-gray-400"><span className="font-semibold text-gray-300">Email:</span> {user.email}</div>
            <div className="text-sm text-gray-400"><span className="font-semibold text-gray-300">Account Type:</span> {verification?.accountType}</div>
            {verification?.accountType === 'company' ? (
              <>
                <div className="text-sm text-gray-400"><span className="font-semibold text-gray-300">Company:</span> {verification.companyName}</div>
                <div className="text-sm text-gray-400"><span className="font-semibold text-gray-300">Reg No:</span> {verification.companyRegNo}</div>
              </>
            ) : (
              <div className="text-sm text-gray-400"><span className="font-semibold text-gray-300">ID/NIC:</span> {verification?.individualIdNo}</div>
            )}
          </div>

          <div className="pt-4">
            <button 
              onClick={fetchData}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Floating report submission handler
  const handleFileReport = async (e) => {
    e.preventDefault();
    setReportSuccess(null);
    try {
      await api.post('/reports', {
        fromUser: user.id,
        targetId: 0, // Mock target ID representing general enquiry or new student flag
        targetType: 'user',
        reason: `Student Name: ${reportName}, Email: ${reportEmail}. Enquiry details: ${reportReason}`
      });
      setReportSuccess('Report submitted successfully! The administration team will investigate.');
      setReportEmail('');
      setReportName('');
      setReportReason('');
    } catch (err) {
      setReportSuccess('Failed to submit report. Please try again later.');
    }
  };

  // Generate QR Code trigger
  const handleGenerateQR = async (job, type) => {
    try {
      setSelectedJobForQR(job);
      setQrType(type);
      const response = await api.post(`/jobs/${job.id}/generate-qr`, { type });
      setQrCodeData(response.data.qrCode);
      setQrCountdown(600); // Reset to 10 mins
    } catch (err) {
      console.error(err);
    }
  };

  // View Applicants list
  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    setSelectedApplicant(null);
    setActiveTab('applicants');
    try {
      const response = await api.get(`/jobs/my-jobs/${job.id}/applicants`);
      setApplicants(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Accept/Reject Applicant handler
  const handleUpdateStatus = async (appId, status) => {
    try {
      await api.patch(`/jobs/applications/${appId}`, { status });
      // Refresh applicants list
      if (selectedJob) {
        const response = await api.get(`/jobs/my-jobs/${selectedJob.id}/applicants`);
        setApplicants(response.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 h-fit space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-white">{user.name}</h2>
            <p className="text-sm text-blue-400 capitalize">{verification.accountType} Employer</p>
          </div>
          
          <nav className="flex flex-col space-y-2">
            {[
              { id: 'dashboard', label: '📊 Overview' },
              { id: 'post-job', label: '➕ Post a Job' },
              { id: 'my-jobs', label: '💼 My Job Posts' },
              { id: 'messages', label: '💬 Messages' },
              { id: 'reviews', label: '⭐ Reviews' },
              { id: 'profile-settings', label: '⚙ Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedJob(null);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Trust Score Card */}
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-bold">Employer Trust Score</div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-green-400">92/100</span>
              <span className="text-xs text-gray-500">Very Reliable</span>
            </div>
            <div className="mt-2 text-xs text-gray-400 space-y-1">
              <div>⭐ Rating: 4.8/5</div>
              <div>✓ QR Check-ins: 98%</div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                  <div className="text-gray-400 text-sm font-semibold">Active Postings</div>
                  <div className="text-3xl font-extrabold text-white mt-2">{jobs.filter(j => j.status === 'open').length}</div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                  <div className="text-gray-400 text-sm font-semibold">Total Applicants</div>
                  <div className="text-3xl font-extrabold text-white mt-2">
                    {jobs.reduce((sum, j) => sum + Number(j.dataValues?.applicationsCount || j.applicationsCount || 0), 0)}
                  </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                  <div className="text-gray-400 text-sm font-semibold">Verification</div>
                  <div className="text-3xl font-extrabold text-green-400 mt-2 capitalize">{verification.verificationStatus}</div>
                </div>
              </div>

              {/* Active Jobs Widget */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Active Jobs & Quick Actions</h3>
                <div className="divide-y divide-gray-700">
                  {jobs.length === 0 ? (
                    <p className="text-gray-400 text-sm py-4">No jobs created yet. Click "Post a Job" to start.</p>
                  ) : (
                    jobs.map((job) => (
                      <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-white text-base">{job.title}</h4>
                          <p className="text-sm text-gray-400">Pay: ${job.payAmount}/hr | Location: {job.locationName}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => handleViewApplicants(job)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition"
                          >
                            View Applicants ({job.applicationsCount || 0})
                          </button>
                          <button 
                            onClick={() => handleGenerateQR(job, 'check-in')}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition"
                          >
                            QR Check-In
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: POST A JOB WITH LEAFLET MAP */}
          {activeTab === 'post-job' && (
            <PostJobView onJobCreated={() => {
              setActiveTab('my-jobs');
              fetchData();
            }} />
          )}

          {/* TAB 3: MY JOBS POSTS */}
          {activeTab === 'my-jobs' && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Manage Job Postings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-gray-900/50 rounded-xl border border-gray-700 p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-lg">{job.title}</h4>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        job.status === 'open' ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}>{job.status}</span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2">{job.description}</p>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div>💰 Pay Amount: ${job.payAmount}</div>
                      <div>📍 Location: {job.locationName}</div>
                    </div>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleViewApplicants(job)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Applicants ({job.applicationsCount || 0})
                      </button>
                      <button 
                        onClick={() => handleGenerateQR(job, 'check-in')}
                        className="bg-green-600 hover:bg-green-500 text-white text-xs font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Check-in QR
                      </button>
                      <button 
                        onClick={() => handleGenerateQR(job, 'check-out')}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Check-out QR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: APPLICANTS VIEW (SUB-ROUTED) */}
          {activeTab === 'applicants' && selectedJob && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Applicants for: {selectedJob.title}</h3>
                  <p className="text-sm text-gray-400">Review student details and select accept or reject.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('my-jobs')}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition"
                >
                  Back to List
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 border-r border-gray-700 pr-4 space-y-2">
                  <h4 className="font-bold text-gray-300 text-sm uppercase tracking-wider mb-2">Applicants list</h4>
                  {applicants.length === 0 ? (
                    <p className="text-gray-400 text-xs">No applications yet.</p>
                  ) : (
                    applicants.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => setSelectedApplicant(app)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          selectedApplicant?.id === app.id
                            ? 'bg-blue-600/30 border-blue-500'
                            : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className="font-semibold text-white text-sm">{app.student.name}</div>
                        <div className="text-xs text-gray-400 flex justify-between mt-1">
                          <span>Phone: {app.student.phone || 'N/A'}</span>
                          <span className={`capitalize ${
                            app.status === 'accepted' ? 'text-green-400' : app.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                          }`}>{app.status}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="md:col-span-2 space-y-6">
                  {selectedApplicant ? (
                    <div className="space-y-4 bg-gray-900/30 border border-gray-700/50 p-6 rounded-xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-white">{selectedApplicant.student.name}</h4>
                          <p className="text-sm text-gray-400">{selectedApplicant.student.email}</p>
                        </div>
                        <span className="bg-yellow-900/30 text-yellow-400 border border-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                          Trust: 96% Match
                        </span>
                      </div>

                      <div className="text-sm text-gray-300 space-y-2 pt-2 border-t border-gray-800">
                        <div><span className="font-semibold text-gray-400">Phone:</span> {selectedApplicant.student.phone || 'Not provided'}</div>
                        <div><span className="font-semibold text-gray-400">Applied on:</span> {new Date(selectedApplicant.appliedAt || selectedApplicant.createdAt).toLocaleDateString()}</div>
                      </div>

                      <div className="flex gap-4 pt-4 border-t border-gray-800">
                        <button
                          onClick={() => handleUpdateStatus(selectedApplicant.id, 'accepted')}
                          disabled={selectedApplicant.status === 'accepted'}
                          className={`flex-1 font-semibold py-2 px-4 rounded-lg text-sm text-white transition ${
                            selectedApplicant.status === 'accepted' ? 'bg-green-700/50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
                          }`}
                        >
                          Accept Application
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedApplicant.id, 'rejected')}
                          disabled={selectedApplicant.status === 'rejected'}
                          className={`flex-1 font-semibold py-2 px-4 rounded-lg text-sm text-white transition ${
                            selectedApplicant.status === 'rejected' ? 'bg-red-700/50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'
                          }`}
                        >
                          Reject Application
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      Select an applicant from the list to view profile and accept/reject them.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center text-gray-400">
              <h3 className="text-lg font-bold text-white mb-2">Direct Message Inbox</h3>
              <p className="text-sm">Direct messaging threads with your active applicants. Pick a student from the directory to start a thread.</p>
            </div>
          )}

          {/* TAB 6: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center text-gray-400">
              <h3 className="text-lg font-bold text-white mb-2">Employer Reviews</h3>
              <p className="text-sm">Read the ratings and feedback left by student workers who check-out from your completed jobs.</p>
            </div>
          )}

          {/* TAB 7: PROFILE SETTINGS */}
          {activeTab === 'profile-settings' && (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center text-gray-400">
              <h3 className="text-lg font-bold text-white mb-2">Employer Settings</h3>
              <p className="text-sm">Manage company verification credentials, individual ID submissions, and email notification parameters.</p>
            </div>
          )}

        </div>
      </div>

      {/* Floating safety / report query button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setShowReportModal(true)}
          className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-full shadow-2xl transition duration-300 transform hover:scale-105 flex items-center space-x-2"
        >
          <span>🚨</span> <span>Report Misconduct</span>
        </button>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🚨</span> File Report Against Student
              </h3>
              <button 
                onClick={() => {
                  setShowReportModal(false);
                  setReportSuccess(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleFileReport} className="p-6 space-y-4">
              {reportSuccess && (
                <div className={`p-3 rounded-lg text-sm text-center border ${
                  reportSuccess.includes('success') 
                    ? 'bg-green-950/40 border-green-800 text-green-300' 
                    : 'bg-red-950/40 border-red-800 text-red-300'
                }`}>
                  {reportSuccess}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase">Student Email</label>
                <input 
                  type="email" 
                  required 
                  placeholder="student@university.edu" 
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                  value={reportEmail}
                  onChange={(e) => setReportEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase">Student Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="John Doe" 
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 uppercase">Inquiry Reason</label>
                <textarea 
                  required 
                  rows="3" 
                  placeholder="Detail the issue (e.g. no-show, fake check-in attempt)..." 
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
                >
                  Submit Inquiry
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowReportModal(false);
                    setReportSuccess(null);
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Generation Modal */}
      {selectedJobForQR && qrCodeData && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-sm w-full p-6 text-center space-y-6 shadow-2xl">
            <div>
              <h3 className="text-xl font-bold text-white">QR {qrType === 'check-in' ? 'Check-In' : 'Check-Out'}</h3>
              <p className="text-xs text-gray-400 mt-1">{selectedJobForQR.title}</p>
            </div>

            <div className="bg-white p-4 rounded-xl inline-block shadow-md">
              <img src={qrCodeData} alt="Proof of Work QR Code" className="w-48 h-48 mx-auto" />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-semibold text-gray-300">
                Code expires in: <span className="text-yellow-400">{Math.floor(qrCountdown / 60)}:{(qrCountdown % 60).toString().padStart(2, '0')}</span>
              </div>
              <p className="text-xs text-gray-500">Student must scan this code using their phone camera.</p>
            </div>

            <button 
              onClick={() => setSelectedJobForQR(null)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Close code
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

// Sub-Component for Job Posting Form with Leaflet
const PostJobView = ({ onJobCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsNeeded, setSkillsNeeded] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [locationName, setLocationName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [position, setPosition] = useState([6.9271, 79.8612]); // Default center coordinates (e.g. Colombo, Sri Lanka)
  
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api.post('/jobs', {
        title,
        description,
        skillsNeeded,
        payAmount: parseFloat(payAmount),
        locationName,
        latitude: position[0],
        longitude: position[1],
        startTime,
        endTime
      });
      onJobCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please check verification status and inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">Create a New Job Post</h3>
        <p className="text-sm text-gray-400">Fill in details and pin location coordinates on the free Leaflet map.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Job Title</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Event Coordinator Assistant" 
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Pay Amount ($/Hour)</label>
            <input 
              type="number" 
              required 
              step="0.01"
              placeholder="15.00" 
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
          <textarea 
            rows="3" 
            placeholder="Write details about the shift tasks, requirements, dress code..." 
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Required Skills (Comma separated)</label>
            <input 
              type="text" 
              placeholder="Communication, Teamwork" 
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={skillsNeeded}
              onChange={(e) => setSkillsNeeded(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Location Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. University Hall A" 
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Start Date & Time</label>
            <input 
              type="datetime-local" 
              required
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">End Date & Time</label>
            <input 
              type="datetime-local" 
              required
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Leaflet map selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Pin Location Coordinates on Map</label>
          <div className="h-64 rounded-lg overflow-hidden border border-gray-700 relative z-0">
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationSelector position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Coordinates: {position[0].toFixed(5)}, {position[1].toFixed(5)}</div>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition"
        >
          {submitting ? 'Creating job...' : 'Post Job opportunity'}
        </button>
      </form>
    </div>
  );
};

export default CommunityDashboard;
