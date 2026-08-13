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
  const [approvedEmployers, setApprovedEmployers] = useState([]);
  const [approvedFilter, setApprovedFilter] = useState('all'); // 'all', 'good', 'bad'
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

      const appEmpRes = await api.get('/admin/employers/approved');
      setApprovedEmployers(appEmpRes.data);

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
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      
      {/* HEADER NAVBAR */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl font-extrabold text-[#06402B]">
            WorkOra Admin Panel
          </span>
          <span className="text-[10px] bg-red-950/40 border border-red-900/50 text-red-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Superuser Mode
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-[#06402B]">{currentUser?.name}</div>
            <div className="text-[10px] text-gray-500">{currentUser?.email}</div>
          </div>
          <button 
            onClick={handleLogout}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg transition"
          >
            Log Out
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-[#06402B] border-r border-[#053020] flex flex-col shrink-0">
          <div className="p-4">
            <div className="text-[10px] font-semibold text-green-200 uppercase tracking-widest">Admin Control Area</div>
          </div>
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'overview' ? 'bg-white text-[#06402B] shadow-md' : 'text-gray-300 hover:bg-[#0a5c3f] hover:text-white'
              }`}
            >
              📊 Overview Stats
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'verification' ? 'bg-white text-[#06402B] shadow-md' : 'text-gray-300 hover:bg-[#0a5c3f] hover:text-white'
              }`}
            >
              💼 Employer Verifications
              {stats.pendingEmployers > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{stats.pendingEmployers}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('approved_companies')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'approved_companies' ? 'bg-white text-[#06402B] shadow-md' : 'text-gray-300 hover:bg-[#0a5c3f] hover:text-white'
              }`}
            >
              ✅ Approved Companies
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'students' ? 'bg-white text-[#06402B] shadow-md' : 'text-gray-300 hover:bg-[#0a5c3f] hover:text-white'
              }`}
            >
              🎓 Student Management
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'jobs' ? 'bg-white text-[#06402B] shadow-md' : 'text-gray-300 hover:bg-[#0a5c3f] hover:text-white'
              }`}
            >
              🔨 Job Moderation
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2.5 ${
                activeTab === 'reports' ? 'bg-white text-[#06402B] shadow-md' : 'text-gray-300 hover:bg-[#0a5c3f] hover:text-white'
              }`}
            >
              ⚠ Rule-Breaking Reports
              {stats.openReports > 0 && (
                <span className="ml-auto bg-yellow-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{stats.openReports}</span>
              )}
            </button>
          </nav>
        </aside>

        {/* WORKSPACE WORK AREA */}
        <main className="flex-grow p-6 overflow-y-auto space-y-6">
          
          {actionFeedback && (
            <div className={`p-4 rounded-lg border text-sm text-center font-medium ${
              actionFeedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-300' : 'bg-red-50 border-red-200 text-red-300'
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
                    <h2 className="text-xl font-bold text-[#06402B]">Platform Overview</h2>
                    <p className="text-xs text-gray-500">Total volume and actions waiting for review.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg">
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Pending Approvals</div>
                      <div className="text-3xl font-black text-[#06402B] mt-2">{stats.pendingEmployers}</div>
                      <p className="text-[10px] text-gray-500 mt-1">Employers waiting to post shifts</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg">
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Active Job Posts</div>
                      <div className="text-3xl font-black text-[#06402B] mt-2">{stats.totalJobs}</div>
                      <p className="text-[10px] text-gray-500 mt-1">Total open freelance shifts</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg">
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Registered Students</div>
                      <div className="text-3xl font-black text-[#06402B] mt-2">{stats.totalStudents}</div>
                      <p className="text-[10px] text-gray-500 mt-1">Active student applicant pool</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-lg">
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Pending Reports</div>
                      <div className="text-3xl font-black text-yellow-500 mt-2">{stats.openReports}</div>
                      <p className="text-[10px] text-gray-500 mt-1">Issues requiring moderator action</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                    <h3 className="text-sm font-bold text-[#06402B] mb-4">Quick Admin Guidelines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <strong className="text-[#06402B] block mb-1">Verify Employers</strong>
                        Check credentials for matching company details before changing status from pending.
                      </div>
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <strong className="text-[#06402B] block mb-1">Review Reports</strong>
                        Verify student/employer disputes. Deleting fake reviews raises platform Trust Scores.
                      </div>
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <strong className="text-[#06402B] block mb-1">Moderate Posts</strong>
                        Check job descriptions for minimum wage compliance and genuine shifts.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: APPROVED COMPANIES */}
              {activeTab === 'approved_companies' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-[#06402B]">Approved Companies</h3>
                      <p className="text-xs text-gray-500">Manage approved companies and monitor their reviews.</p>
                    </div>
                    <select
                      value={approvedFilter}
                      onChange={(e) => setApprovedFilter(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-[#06402B] text-xs rounded-lg px-3 py-2 outline-none"
                    >
                      <option value="all">All Companies</option>
                      <option value="good">Good Reviews (Avg ≥ 3)</option>
                      <option value="bad">Bad Reviews (Avg &lt; 3)</option>
                    </select>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                          <th className="pb-3 font-semibold">User Details</th>
                          <th className="pb-3 font-semibold">Company Name</th>
                          <th className="pb-3 font-semibold">Avg Rating</th>
                          <th className="pb-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {approvedEmployers.filter(emp => {
                          const reviews = emp.user?.receivedReviews || [];
                          const avg = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length) : 0;
                          
                          if (approvedFilter === 'bad') return reviews.length > 0 && avg < 3;
                          if (approvedFilter === 'good') return avg >= 3 || reviews.length === 0;
                          return true;
                        }).length === 0 ? (
                          <tr>
                            <td colSpan="4" className="py-6 text-center text-gray-500">No approved companies match this filter.</td>
                          </tr>
                        ) : (
                          approvedEmployers.filter(emp => {
                            const reviews = emp.user?.receivedReviews || [];
                            const avg = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length) : 0;
                            
                            if (approvedFilter === 'bad') return reviews.length > 0 && avg < 3;
                            if (approvedFilter === 'good') return avg >= 3 || reviews.length === 0;
                            return true;
                          }).map((emp) => {
                            const reviews = emp.user?.receivedReviews || [];
                            const avg = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1) : 'No reviews';

                            return (
                              <tr key={emp.id} className="text-gray-700">
                                <td className="py-4">
                                  <div className="font-bold text-[#06402B]">{emp.user?.name}</div>
                                  <div className="text-[10px] text-gray-500">{emp.user?.email}</div>
                                </td>
                                <td className="py-4">{emp.companyName || 'Individual'}</td>
                                <td className="py-4">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                    avg === 'No reviews' ? 'bg-gray-100 text-gray-500' : 
                                    parseFloat(avg) < 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                  }`}>
                                    {avg !== 'No reviews' ? `⭐ ${avg}` : avg}
                                  </span>
                                  <div className="text-[9px] text-gray-400 mt-1">{reviews.length} total review(s)</div>
                                </td>
                                <td className="py-4 text-right">
                                  <button
                                    onClick={() => {
                                      if(window.confirm('Are you sure you want to revoke approval for this company?')) {
                                        handleVerifyEmployer(emp.userId, 'rejected');
                                      }
                                    }}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] px-3 py-1.5 rounded transition cursor-pointer"
                                  >
                                    Revoke Approval
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: EMPLOYER VERIFICATIONS */}
              {activeTab === 'verification' && (
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#06402B]">Pending Employer Accounts</h3>
                    <p className="text-xs text-gray-500">Review documents or verify details to grant posting credentials.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
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
                            <tr key={emp.id} className="text-gray-700">
                              <td className="py-4">
                                <div className="font-bold text-[#06402B]">{emp.user?.name}</div>
                                <div className="text-[10px] text-gray-500">{emp.user?.email}</div>
                              </td>
                              <td className="py-4">{emp.companyName || 'Individual / Contractor'}</td>
                              <td className="py-4">{emp.registrationNumber || 'N/A'}</td>
                              <td className="py-4">{new Date(emp.submittedAt || Date.now()).toLocaleDateString()}</td>
                              <td className="py-4 text-right space-x-2">
                                <button
                                  onClick={() => handleVerifyEmployer(emp.userId, 'approved')}
                                  className="bg-green-600 hover:bg-green-500 text-[#06402B] text-[10px] px-3 py-1.5 rounded transition cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleVerifyEmployer(emp.userId, 'rejected')}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] px-3 py-1.5 rounded transition cursor-pointer"
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
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#06402B]">Student User Management</h3>
                    <p className="text-xs text-gray-500">View student application/shift logs or delete accounts breaking platform guidelines.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
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
                            <tr key={stu.id} className="text-gray-700">
                              <td className="py-4">
                                <div className="font-bold text-[#06402B]">{stu.name}</div>
                              </td>
                              <td className="py-4">{stu.email}</td>
                              <td className="py-4">{stu.phone || 'N/A'}</td>
                              <td className="py-4 text-right space-x-2">
                                <button
                                  onClick={() => handleViewStudentHistory(stu.id)}
                                  className="bg-[#06402B]/10 hover:bg-[#06402B]/20 text-[#06402B] border border-blue-900/40 text-[10px] px-3 py-1.5 rounded transition cursor-pointer"
                                >
                                  View Job History
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(stu.id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] px-3 py-1.5 rounded transition cursor-pointer"
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
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#06402B]">Active Freelance Shifts</h3>
                    <p className="text-xs text-gray-500">View job listings and moderate/delete rule-breaking posts.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
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
                            <tr key={job.id} className="text-gray-700">
                              <td className="py-4">
                                <div className="font-bold text-[#06402B]">{job.title}</div>
                              </td>
                              <td className="py-4">${job.payAmount}/Hour</td>
                              <td className="py-4 max-w-[200px] truncate">{job.locationName || 'Unmapped'}</td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  job.status === 'open' ? 'bg-green-950 border border-green-900 text-green-300' : 'bg-white text-gray-500'
                                }`}>
                                  {job.status}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10px] px-3 py-1.5 rounded transition cursor-pointer"
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
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-[#06402B]">Rule-Breaking Reports</h3>
                    <p className="text-xs text-gray-500">Examine misconduct files sent by students and employers and take resolution actions.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
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
                            <tr key={rep.id} className="text-gray-700">
                              <td className="py-4">
                                <div className="font-bold text-[#06402B]">{rep.reporter?.name}</div>
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
                                      className="bg-yellow-600 hover:bg-yellow-500 text-[#06402B] text-[10px] px-2.5 py-1.5 rounded transition cursor-pointer"
                                    >
                                      Review
                                    </button>
                                    <button
                                      onClick={() => handleUpdateReportStatus(rep.id, 'resolved')}
                                      className="bg-green-600 hover:bg-green-500 text-[#06402B] text-[10px] px-2.5 py-1.5 rounded transition cursor-pointer"
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
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50/40 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-[#06402B]">Student Activity Logs</h3>
                <p className="text-[10px] text-gray-500">Shift application history for <span className="text-[#06402B]">{selectedStudentHistory.student.name}</span></p>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentHistory(null);
                  setIsHistoryModalOpen(false);
                }}
                className="text-gray-500 hover:text-[#06402B] text-lg font-bold select-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-gray-200 pb-4">
                <div>
                  <span className="text-gray-500 block">Verification Email</span>
                  <span className="font-semibold text-[#06402B]">{selectedStudentHistory.student.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Registration Date</span>
                  <span className="font-semibold text-[#06402B]">
                    {new Date(selectedStudentHistory.student.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#06402B] uppercase tracking-wider">Submitted Applications</h4>
                
                {selectedStudentHistory.applications.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No job shifts applied for yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedStudentHistory.applications.map((app) => (
                      <div key={app.id} className="bg-gray-50/50 border border-gray-200 p-3 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-[#06402B]">{app.job?.title}</div>
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
            <div className="p-4 border-t border-gray-200 bg-[#111726]/30 text-right">
              <button
                onClick={() => {
                  setSelectedStudentHistory(null);
                  setIsHistoryModalOpen(false);
                }}
                className="bg-white hover:bg-gray-700 text-[#06402B] text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
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
