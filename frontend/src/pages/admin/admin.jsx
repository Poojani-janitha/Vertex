import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Dashboard Stats
  const [stats, setStats] = useState({
    pendingEmployers: 0,
    openReports: 0,
    totalJobs: 0,
    totalStudents: 0
  });

  // Section States
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  // Selected Student Details for History View
  const [selectedStudentHistory, setSelectedStudentHistory] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Authenticate user is admin on mount
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
    setCurrentUser(user);
    loadDashboardData();
  }, []);

  const showFeedback = (text, type = 'success') => {
    setActionFeedback({ text, type });
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Pending Employers
      const empRes = await api.get('/admin/employers/pending');
      setPendingEmployers(empRes.data);

      // 2. Fetch Reports
      const repRes = await api.get('/admin/reports');
      setReports(repRes.data);

      // 3. Fetch Jobs (Using general jobs board list to moderate)
      const jobRes = await api.get('/jobs');
      setJobs(jobRes.data);

      // 4. Fetch Students
      const stuRes = await api.get('/admin/students');
      setStudents(stuRes.data);

      // 5. Update Quick Stats
      setStats({
        pendingEmployers: empRes.data.length,
        openReports: repRes.data.filter(r => r.status === 'open').length,
        totalJobs: jobRes.data.length,
        totalStudents: stuRes.data.length
      });
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Action: Verify Employer (Approve/Reject)
  const handleVerifyEmployer = async (userId, status) => {
    try {
      await api.patch(`/admin/employers/${userId}/verify`, { status });
      showFeedback(`Employer account verification set to ${status.toUpperCase()} successfully.`);
      loadDashboardData();
    } catch (err) {
      showFeedback(err.response?.data?.message || 'Failed to update verification status.', 'error');
    }
  };

  // Action: Delete Job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      showFeedback('Job post deleted successfully from platform.');
      loadDashboardData();
    } catch (err) {
      showFeedback('Failed to delete job post.', 'error');
    }
  };

  // Action: Update Report Status
  const handleUpdateReportStatus = async (reportId, status) => {
    try {
      await api.patch(`/admin/reports/${reportId}`, { status });
      showFeedback(`Report status updated to ${status.toUpperCase()} successfully.`);
      loadDashboardData();
    } catch (err) {
      showFeedback('Failed to update report status.', 'error');
    }
  };

  // Action: Delete Student
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student account? All application records will be deleted.')) return;
    try {
      await api.delete(`/admin/students/${studentId}`);
      showFeedback('Student account deleted successfully.');
      loadDashboardData();
    } catch (err) {
      showFeedback('Failed to delete student account.', 'error');
    }
  };

  // Action: View Student History
  const handleViewStudentHistory = async (studentId) => {
    try {
      const response = await api.get(`/admin/students/${studentId}/history`);
      setSelectedStudentHistory(response.data);
      setIsHistoryModalOpen(true);
    } catch (err) {
      showFeedback('Failed to load student job history.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0e131f] text-gray-100 flex flex-col font-sans">
      
      {/* HEADER NAVBAR */}
      <header className="bg-[#121824] border-b border-gray-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Vertex Admin Panel
          </span>
          <span className="text-[10px] bg-red-950/40 border border-red-900/50 text-red-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Superuser Mode
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-white">{currentUser?.name}</div>
            <div className="text-[10px] text-gray-500">{currentUser?.email}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800/40 px-3 py-1.5 rounded-lg transition"
          >
            Log Out
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-[#111726]/40 border-r border-gray-800 flex flex-col shrink-0">
          <div className="p-4">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Admin Control Area</div>
          </div>
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-850 hover:text-white'
              }`}
            >
              📊 Overview Stats
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'verification' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-850 hover:text-white'
              }`}
            >
              💼 Employer Verifications
              {stats.pendingEmployers > 0 && (
                <span className="ml-auto bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">{stats.pendingEmployers}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'students' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-850 hover:text-white'
              }`}
            >
              🎓 Student Management
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'jobs' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-850 hover:text-white'
              }`}
            >
              🔨 Job Moderation
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'reports' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-850 hover:text-white'
              }`}
            >
              ⚠ Rule-Breaking Reports
              {stats.openReports > 0 && (
                <span className="ml-auto bg-yellow-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">{stats.openReports}</span>
              )}
            </button>
          </nav>
        </aside>

        {/* WORKSPACE WORK AREA */}
        <main className="flex-grow p-6 overflow-y-auto space-y-6">
          
          {actionFeedback && (
            <div className={`p-4 rounded-lg border text-sm text-center font-medium ${
              actionFeedback.type === 'success' ? 'bg-green-950/40 border-green-500/50 text-green-300' : 'bg-red-950/40 border-red-500/50 text-red-300'
            }`}>
              {actionFeedback.text}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Platform Overview</h2>
                    <p className="text-xs text-gray-400">Total volume and actions waiting for review.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#121824] border border-gray-800 rounded-xl p-5 shadow-lg">
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Pending Approvals</div>
                      <div className="text-3xl font-black text-white mt-2">{stats.pendingEmployers}</div>
                      <p className="text-[10px] text-gray-400 mt-1">Employers waiting to post shifts</p>
                    </div>
                    <div className="bg-[#121824] border border-gray-800 rounded-xl p-5 shadow-lg">
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Active Job Posts</div>
                      <div className="text-3xl font-black text-white mt-2">{stats.totalJobs}</div>
                      <p className="text-[10px] text-gray-400 mt-1">Total open freelance shifts</p>
                    </div>
                    <div className="bg-[#121824] border border-gray-800 rounded-xl p-5 shadow-lg">
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Registered Students</div>
                      <div className="text-3xl font-black text-white mt-2">{stats.totalStudents}</div>
                      <p className="text-[10px] text-gray-400 mt-1">Active student applicant pool</p>
                    </div>
                    <div className="bg-[#121824] border border-gray-800 rounded-xl p-5 shadow-lg">
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Pending Reports</div>
                      <div className="text-3xl font-black text-yellow-500 mt-2">{stats.openReports}</div>
                      <p className="text-[10px] text-gray-400 mt-1">Issues requiring moderator action</p>
                    </div>
                  </div>

                  <div className="bg-[#121824] border border-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-sm font-bold text-white mb-4">Quick Admin Guidelines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 rounded-lg bg-gray-900 border border-gray-850">
                        <strong className="text-blue-400 block mb-1">Verify Employers</strong>
                        Check credentials for matching company details before changing status from pending.
                      </div>
                      <div className="p-4 rounded-lg bg-gray-900 border border-gray-850">
                        <strong className="text-blue-400 block mb-1">Review Reports</strong>
                        Verify student/employer disputes. Deleting fake reviews raises platform Trust Scores.
                      </div>
                      <div className="p-4 rounded-lg bg-gray-900 border border-gray-850">
                        <strong className="text-blue-400 block mb-1">Moderate Posts</strong>
                        Check job descriptions for minimum wage compliance and genuine shifts.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EMPLOYER VERIFICATIONS */}
              {activeTab === 'verification' && (
                <div className="bg-[#121824] border border-gray-800 rounded-xl p-6 shadow-lg space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">Pending Employer Accounts</h3>
                    <p className="text-xs text-gray-400">Review documents or verify details to grant posting credentials.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                          <th className="pb-3 font-semibold">User Details</th>
                          <th className="pb-3 font-semibold">Company Name</th>
                          <th className="pb-3 font-semibold">Reg. Number</th>
                          <th className="pb-3 font-semibold">Submitted On</th>
                          <th className="pb-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-850">
                        {pendingEmployers.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-6 text-center text-gray-500">No pending employer accounts waiting.</td>
                          </tr>
                        ) : (
                          pendingEmployers.map((emp) => (
                            <tr key={emp.id} className="text-gray-300">
                              <td className="py-4">
                                <div className="font-bold text-white">{emp.user?.name}</div>
                                <div className="text-[10px] text-gray-500">{emp.user?.email}</div>
                              </td>
                              <td className="py-4">{emp.companyName || 'Individual / Contractor'}</td>
                              <td className="py-4">{emp.registrationNumber || 'N/A'}</td>
                              <td className="py-4">{new Date(emp.submittedAt || Date.now()).toLocaleDateString()}</td>
                              <td className="py-4 text-right space-x-2">
                                <button
                                  onClick={() => handleVerifyEmployer(emp.userId, 'approved')}
                                  className="bg-green-600 hover:bg-green-500 text-white text-[10px] px-3 py-1.5 rounded transition cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleVerifyEmployer(emp.userId, 'rejected')}
                                  className="bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-[10px] px-3 py-1.5 rounded transition cursor-pointer"
                                >
                                  Reject
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: STUDENT MANAGEMENT */}
              {activeTab === 'students' && (
                <div className="bg-[#121824] border border-gray-800 rounded-xl p-6 shadow-lg space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">Student User Management</h3>
                    <p className="text-xs text-gray-400">View student application/shift logs or delete accounts breaking platform guidelines.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                          <th className="pb-3 font-semibold">Student Name</th>
                          <th className="pb-3 font-semibold">University Email</th>
                          <th className="pb-3 font-semibold">Contact No.</th>
                          <th className="pb-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-850">
                        {students.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="py-6 text-center text-gray-500">No students registered yet.</td>
                          </tr>
                        ) : (
                          students.map((stu) => (
                            <tr key={stu.id} className="text-gray-300">
                              <td className="py-4">
                                <div className="font-bold text-white">{stu.name}</div>
                              </td>
                              <td className="py-4">{stu.email}</td>
                              <td className="py-4">{stu.phone || 'N/A'}</td>
                              <td className="py-4 text-right space-x-2">
                                <button
                                  onClick={() => handleViewStudentHistory(stu.id)}
                                  className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-900/40 text-[10px] px-3 py-1.5 rounded transition cursor-pointer"
                                >
                                  View Job History
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(stu.id)}
                                  className="bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-[10px] px-3 py-1.5 rounded transition cursor-pointer"
                                >
                                  Remove Account
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: JOB MODERATION */}
              {activeTab === 'jobs' && (
                <div className="bg-[#121824] border border-gray-800 rounded-xl p-6 shadow-lg space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">Active Freelance Shifts</h3>
                    <p className="text-xs text-gray-400">View job listings and moderate/delete rule-breaking posts.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                          <th className="pb-3 font-semibold">Job Title</th>
                          <th className="pb-3 font-semibold">Pay / Wage</th>
                          <th className="pb-3 font-semibold">Location</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-850">
                        {jobs.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-6 text-center text-gray-500">No active job listings found.</td>
                          </tr>
                        ) : (
                          jobs.map((job) => (
                            <tr key={job.id} className="text-gray-300">
                              <td className="py-4">
                                <div className="font-bold text-white">{job.title}</div>
                              </td>
                              <td className="py-4">${job.payAmount}/Hour</td>
                              <td className="py-4 max-w-[200px] truncate">{job.locationName || 'Unmapped'}</td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  job.status === 'open' ? 'bg-green-950 border border-green-900 text-green-300' : 'bg-gray-800 text-gray-400'
                                }`}>
                                  {job.status}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-[10px] px-3 py-1.5 rounded transition cursor-pointer"
                                >
                                  Delete Post
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: RULE-BREAKING REPORTS */}
              {activeTab === 'reports' && (
                <div className="bg-[#121824] border border-gray-800 rounded-xl p-6 shadow-lg space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">Rule-Breaking Reports</h3>
                    <p className="text-xs text-gray-400">Examine misconduct files sent by students and employers and take resolution actions.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                          <th className="pb-3 font-semibold">Reported By</th>
                          <th className="pb-3 font-semibold">Violation Reason</th>
                          <th className="pb-3 font-semibold">Filed Date</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-850">
                        {reports.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-6 text-center text-gray-500">No misconduct reports filed yet.</td>
                          </tr>
                        ) : (
                          reports.map((rep) => (
                            <tr key={rep.id} className="text-gray-300">
                              <td className="py-4">
                                <div className="font-bold text-white">{rep.reporter?.name}</div>
                                <div className="text-[10px] text-gray-500">{rep.reporter?.email}</div>
                              </td>
                              <td className="py-4 max-w-[250px] break-words">{rep.reason}</td>
                              <td className="py-4">{new Date(rep.createdAt || Date.now()).toLocaleDateString()}</td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  rep.status === 'open' 
                                    ? 'bg-yellow-950 border border-yellow-900 text-yellow-300' 
                                    : 'bg-green-950 border border-green-900 text-green-300'
                                }`}>
                                  {rep.status}
                                </span>
                              </td>
                              <td className="py-4 text-right space-x-2">
                                {rep.status === 'open' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateReportStatus(rep.id, 'reviewed')}
                                      className="bg-yellow-600 hover:bg-yellow-500 text-white text-[10px] px-2.5 py-1.5 rounded transition cursor-pointer"
                                    >
                                      Review
                                    </button>
                                    <button
                                      onClick={() => handleUpdateReportStatus(rep.id, 'resolved')}
                                      className="bg-green-600 hover:bg-green-500 text-white text-[10px] px-2.5 py-1.5 rounded transition cursor-pointer"
                                    >
                                      Resolve
                                    </button>
                                  </>
                                )}
                                {rep.status !== 'open' && (
                                  <span className="text-gray-500 text-[10px]">Handled</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* STUDENT HISTORY MODAL WINDOW */}
      {isHistoryModalOpen && selectedStudentHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#121824] border border-gray-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/40 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-white">Student Activity Logs</h3>
                <p className="text-[10px] text-gray-400">Shift application history for <span className="text-blue-400">{selectedStudentHistory.student.name}</span></p>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentHistory(null);
                  setIsHistoryModalOpen(false);
                }}
                className="text-gray-400 hover:text-white text-lg font-bold select-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-gray-800 pb-4">
                <div>
                  <span className="text-gray-500 block">Verification Email</span>
                  <span className="font-semibold text-white">{selectedStudentHistory.student.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Registration Date</span>
                  <span className="font-semibold text-white">
                    {new Date(selectedStudentHistory.student.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Submitted Applications</h4>
                
                {selectedStudentHistory.applications.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No job shifts applied for yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStudentHistory.applications.map((app) => (
                      <div key={app.id} className="bg-gray-900/50 border border-gray-850 p-3 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{app.job?.title}</div>
                          <div className="text-[10px] text-gray-500">
                            {app.job?.locationName || 'Unmapped Location'} • ${app.job?.payAmount}/Hour
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          app.status === 'accepted' ? 'bg-green-950 border border-green-900 text-green-300' :
                          app.status === 'rejected' ? 'bg-red-950 border border-red-900 text-red-300' :
                          'bg-yellow-950 border border-yellow-900 text-yellow-300'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 bg-[#111726]/30 text-right">
              <button
                onClick={() => {
                  setSelectedStudentHistory(null);
                  setIsHistoryModalOpen(false);
                }}
                className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
              >
                Close Logs
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
