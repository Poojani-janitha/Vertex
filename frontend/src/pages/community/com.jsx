import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

// Import separated views
import Overview from './views/Overview';
import PostJob from './views/PostJob';
import MyJobs from './views/MyJobs';
import Messages from './views/Messages';
import ProfileSettings from './views/ProfileSettings';
import Reviews from './views/Reviews';
import ScanQR from './views/ScanQR';

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

  // Active Job Details state (to view applicants)
  const [selectedJob, setSelectedJob] = useState(null);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };



  // View Applicants list
  const handleViewApplicants = (job) => {
    setSelectedJob(job);
    setActiveTab('applicants');
  };

  // Floating report submission handler
  const handleFileReport = async (e) => {
    e.preventDefault();
    setReportSuccess(null);
    try {
      await api.post('/reports', {
        fromUser: user.id,
        targetId: 0,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0e131f]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06402B]"></div>
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
            className="mt-4 bg-red-600 hover:bg-red-500 text-[#06402B] font-semibold py-2 px-6 rounded-lg transition"
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
        <div className="bg-gray-100 rounded-2xl border border-gray-200 shadow-2xl p-8 text-center space-y-6">
          <div className="text-yellow-400 text-5xl animate-pulse">⏳</div>
          <h2 className="text-3xl font-extrabold text-[#06402B]">Pending Admin Approval</h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            Your verification status is currently <span className="text-yellow-400 font-bold uppercase">{verification?.verificationStatus || 'pending'}</span>.
            An administrator needs to approve your credentials before you can post jobs, manage applicants, or view student details.
          </p>

          <div className="bg-gray-100/50 p-6 rounded-xl border border-gray-200 max-w-md mx-auto text-left space-y-2">
            <h3 className="font-bold text-gray-600 border-b border-gray-200 pb-2 mb-2">Registration Overview</h3>
            <div className="text-sm text-gray-500"><span className="font-semibold text-gray-600">Name:</span> {user.name}</div>
            <div className="text-sm text-gray-500"><span className="font-semibold text-gray-600">Email:</span> {user.email}</div>
            <div className="text-sm text-gray-500"><span className="font-semibold text-gray-600">Account Type:</span> {verification?.accountType}</div>
            {verification?.accountType === 'company' ? (
              <>
                <div className="text-sm text-gray-500"><span className="font-semibold text-gray-600">Company:</span> {verification.companyName}</div>
                <div className="text-sm text-gray-500"><span className="font-semibold text-gray-600">Reg No:</span> {verification.companyRegNo}</div>
              </>
            ) : (
              <div className="text-sm text-gray-500"><span className="font-semibold text-gray-600">ID/NIC:</span> {verification?.individualIdNo}</div>
            )}
          </div>

          <div className="pt-4 flex gap-4 justify-center">
            <button
              onClick={fetchData}
              className="bg-[#06402B] hover:bg-[#0a5c3f] text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Refresh Status
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 text-[#06402B] font-semibold py-2 px-6 rounded-lg transition"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get initials for profile picture
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'PJ';
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-700 overflow-hidden font-sans">

      {/* LEFT SIDEBAR (Matching Developers Stack exactly) */}
      <aside className="w-64 bg-[#06402B] border-r border-[#053020] flex flex-col h-full shrink-0 select-none">

        {/* Brand Logo header */}
        <div className="h-16 px-6 border-b border-[#053020] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#06402B] flex items-center justify-center font-bold text-[#06402B] text-lg">W</div>
          <span className="text-lg font-bold text-white tracking-wider">WorkOra Comm</span>
        </div>

        {/* Sidebar Nav content */}
        <div className="flex-grow overflow-y-auto px-4 py-6 space-y-6">

          {/* MAIN MENU */}
          <div>
            <div className="text-[10px] font-bold text-green-200 uppercase tracking-widest px-3 mb-2">Main</div>
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'my-jobs', label: 'My Job Posts', icon: '💼' },
                { id: 'post-job', label: 'Post a Job', icon: '➕' },
                { id: 'scan-qr', label: 'Scan Check-In', icon: '📷' },
                { id: 'messages', label: 'Messages', icon: '💬' },
                { id: 'reviews', label: 'Reviews Feed', icon: '⭐' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedJob(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${activeTab === tab.id ? 'bg-white text-[#06402B] shadow-md' : 'text-gray-300 hover:bg-[#0a5c3f] hover:text-white'}`}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>



          {/* TOOLS */}
          <div>
            <div className="text-[10px] font-bold text-green-200 uppercase tracking-widest px-3 mb-2">Tools</div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'settings' ? 'bg-white text-[#06402B] shadow-md' : 'text-gray-300 hover:bg-[#0a5c3f] hover:text-white'}`}
              >
                <span className="text-base">⚙</span> Profile Settings
              </button>
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/20 transition"
              >
                <span className="text-base">🚨</span> Report Misconduct
              </button>
            </nav>
          </div>

        </div>

        {/* BOTTOM USER PROFILE CARD */}
        <div className="p-4 border-t border-[#053020] bg-[#042A1D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0a5c3f] text-[#06402B] flex items-center justify-center font-bold text-sm shadow-inner">
              {getInitials(user.name)}
            </div>
            <div>
              <div className="text-xs font-bold text-[#06402B] truncate max-w-[120px]">{user.name}</div>
              <div className="text-[10px] text-gray-500 capitalize">{verification.accountType}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-400 transition"
          >
            ❌
          </button>
        </div>

      </aside>

      {/* RIGHT WORKSPACE (Renders top bar and page views) */}
      <main className="flex-grow flex flex-col h-full overflow-hidden">

        {/* TOP STATUS BAR (Matching Developers Stack) */}
        <header className="h-16 border-b border-[#053020] flex items-center justify-between px-8 bg-white shrink-0">

          {/* Top Welcome Title */}
          <h2 className="text-sm font-bold text-[#06402B] flex items-center gap-2">
            Good night, {user.name.split(' ')[0]} 👋
          </h2>

          {/* Top center mock search */}
          <div className="hidden md:flex items-center w-80 relative">
            <span className="absolute left-3 text-gray-500 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search active applicants, jobs, transcripts..."
              className="w-full bg-gray-100 border border-gray-200 text-[#06402B] rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-600"
              disabled
            />
          </div>

          {/* Top Right Stats Widget */}
          <div className="flex items-center space-x-6">

            {/* Mock Nav controls */}
            <div className="flex items-center space-x-3 text-gray-500 text-sm">
              <button title="Notifications" className="hover:text-[#06402B]">🔔</button>
              <button title="Messages" className="hover:text-[#06402B]">✉</button>
            </div>
          </div>

        </header>

        {/* MAIN BODY CONTAINER */}
        <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-gray-50">

          {/* DYNAMIC VIEW ROUTER */}
          {activeTab === 'dashboard' && (
            <Overview
              jobs={jobs}
              onNavigateToTab={(tab) => {
                setActiveTab(tab);
                setSelectedJob(null);
              }}
              onViewApplicants={handleViewApplicants}
            />
          )}

          {activeTab === 'my-jobs' && (
            <MyJobs
              jobs={jobs}
              onViewApplicants={handleViewApplicants}
            />
          )}

          {activeTab === 'post-job' && (
            <PostJob
              onJobCreated={() => {
                setActiveTab('my-jobs');
                fetchData();
              }}
            />
          )}

          {activeTab === 'applicants' && selectedJob && (
            <JobApplicants
              job={selectedJob}
              onBack={() => {
                setActiveTab('my-jobs');
                setSelectedJob(null);
              }}
            />
          )}

          {activeTab === 'messages' && <Messages />}

          {activeTab === 'reviews' && <Reviews user={user} />}
          {activeTab === 'scan-qr' && <ScanQR onClose={() => setActiveTab('dashboard')} />}

          {activeTab === 'settings' && (
            <ProfileSettings user={user} verification={verification} />
          )}

        </div>

      </main>

      {/* Floating safety / report modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-white/80">
              <h3 className="text-lg font-bold text-[#06402B] flex items-center gap-2">
                <span>🚨</span> File Report Against Student
              </h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportSuccess(null);
                }}
                className="text-gray-500 hover:text-[#06402B]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFileReport} className="p-6 space-y-4">
              {reportSuccess && (
                <div className={`p-3 rounded-lg text-xs text-center border ${reportSuccess.includes('success')
                    ? 'bg-green-950/40 border-green-800 text-green-300'
                    : 'bg-red-950/40 border-red-800 text-red-300'
                  }`}>
                  {reportSuccess}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Student Email</label>
                <input
                  type="email"
                  required
                  placeholder="student@university.edu"
                  className="w-full bg-gray-100 border border-gray-850 text-[#06402B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                  value={reportEmail}
                  onChange={(e) => setReportEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Student Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full bg-gray-100 border border-gray-850 text-[#06402B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wider">Inquiry Details</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Detail the issue (e.g. no-show, fake check-in attempt)..."
                  className="w-full bg-gray-100 border border-gray-850 text-[#06402B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-500 text-[#06402B] text-xs font-semibold py-2 px-4 rounded-lg transition"
                >
                  Submit Inquiry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportSuccess(null);
                  }}
                  className="bg-gray-850 hover:bg-gray-100 text-[#06402B] text-xs font-semibold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityDashboard;
