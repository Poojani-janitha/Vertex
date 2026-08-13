import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Tab State: 'employers' | 'reports' | 'moderation'
  const [activeTab, setActiveTab] = useState('employers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data States
  const [pendingEmployers, setPendingEmployers] = useState([]);
  const [reports, setReports] = useState([]);
  const [emergencies, setEmergencies] = useState([]);

  // Form States for Moderation
  const [jobIdToDelete, setJobIdToDelete] = useState('');
  const [reviewIdToDelete, setReviewIdToDelete] = useState('');
  const [modMessage, setModMessage] = useState(null);

  // Status updates loading states
  const [processingId, setProcessingId] = useState(null);

  // Play beep sound 3 times
  const playBeeps = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const oscillator = context.createOscillator();
          const gainNode = context.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          oscillator.type = 'sine';
          oscillator.frequency.value = 800;
          gainNode.gain.setValueAtTime(0.5, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
          oscillator.start(context.currentTime);
          oscillator.stop(context.currentTime + 0.3);
        }, i * 600);
      }
    } catch (err) {
      console.log('Audio playback failed', err);
    }
  };

  useEffect(() => {
    let beepInterval;
    if (emergencies.length > 0) {
      playBeeps(); // Initial beep
      beepInterval = setInterval(() => {
        playBeeps();
      }, 60000); // Repeat every 1 minute
    }
    return () => {
      if (beepInterval) clearInterval(beepInterval);
    };
  }, [emergencies.length]);

  useEffect(() => {
    // Basic frontend check: redirect if not admin
    const userString = localStorage.getItem('user');
    if (!userString) {
      navigate('/login');
      return;
    }
    const loggedUser = JSON.parse(userString);
    if (loggedUser.role !== 'admin') {
      navigate('/');
      return;
    }
    setUser(loggedUser);

    fetchAdminData();

    // Poll for emergencies every 15 seconds
    const interval = setInterval(() => {
      fetchEmergencies();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const fetchEmergencies = async () => {
    try {
      const res = await api.get('/admin/emergencies');
      setEmergencies(res.data);
    } catch (err) {
      console.error('Failed to fetch emergencies', err);
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [employersRes, reportsRes, emergenciesRes] = await Promise.all([
        api.get('/admin/employers/pending'),
        api.get('/admin/reports'),
        api.get('/admin/emergencies')
      ]);
      setPendingEmployers(employersRes.data);
      setReports(reportsRes.data);
      setEmergencies(emergenciesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administration data.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmployer = async (userId, status) => {
    setProcessingId(userId);
    setModMessage(null);
    try {
      await api.patch(`/admin/employers/${userId}/verify`, { status });
      // Remove from UI list
      setPendingEmployers(prev => prev.filter(emp => emp.userId !== userId));
      setModMessage({ type: 'success', text: `Employer successfully ${status}!` });
    } catch (err) {
      setModMessage({ type: 'error', text: err.response?.data?.message || 'Failed to verify employer.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolveReport = async (reportId, status) => {
    setProcessingId(reportId);
    setModMessage(null);
    try {
      await api.patch(`/admin/reports/${reportId}`, { status });
      // Refresh reports list
      const reportsRes = await api.get('/admin/reports');
      setReports(reportsRes.data);
      setModMessage({ type: 'success', text: 'Report status updated successfully!' });
    } catch (err) {
      setModMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update report status.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteJob = async (e) => {
    e.preventDefault();
    if (!jobIdToDelete) return;
    setModMessage(null);
    try {
      await api.delete(`/admin/jobs/${jobIdToDelete}`);
      setModMessage({ type: 'success', text: `Job ID ${jobIdToDelete} deleted successfully!` });
      setJobIdToDelete('');
    } catch (err) {
      setModMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete job post. Double check the ID.' });
    }
  };

  const handleDeleteReview = async (e) => {
    e.preventDefault();
    if (!reviewIdToDelete) return;
    setModMessage(null);
    try {
      await api.delete(`/admin/reviews/${reviewIdToDelete}`);
      setModMessage({ type: 'success', text: `Review ID ${reviewIdToDelete} deleted successfully!` });
      setReviewIdToDelete('');
    } catch (err) {
      setModMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete review. Double check the ID.' });
    }
  };

  const handleResolveEmergency = async (id) => {
    try {
      await api.patch(`/admin/emergencies/${id}/resolve`);
      setEmergencies(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to resolve emergency', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
        <h3 className="font-bold">Access Denied</h3>
        <p>{error}</p>
      </div>
    );
  }

  const sidebarButtonClass = (tabName) => {
    return `w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 ${
      activeTab === tabName
        ? 'bg-[#06402B] text-white shadow-lg shadow-[#06402B]/25'
        : 'text-gray-500 hover:bg-gray-50 hover:text-[#06402B]'
    }`;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {emergencies.length > 0 && (
        <div className="bg-red-600 px-6 py-4 rounded-2xl border-2 border-red-800 shadow-[0_0_30px_rgba(220,38,38,0.4)] animate-pulse">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <span className="text-3xl animate-bounce">🚨</span> EMERGENCY ALERT
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencies.map(em => (
              <div key={em.id} className="bg-red-900/60 p-4 rounded-xl flex items-center justify-between border border-red-500/50">
                <div>
                  <div className="font-bold text-white text-lg">Student: {em.student?.name}</div>
                  <div className="text-red-200 font-semibold mt-1">Contact: {em.student?.phone || em.student?.email}</div>
                  <div className="text-xs text-red-300 mt-2">Time: {new Date(em.createdAt).toLocaleString()}</div>
                </div>
                <button 
                  onClick={() => handleResolveEmergency(em.id)}
                  className="bg-white text-red-700 hover:bg-gray-200 font-bold px-4 py-3 rounded-lg transition shadow-lg shrink-0 ml-4"
                >
                  Mark Resolved
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 min-h-[70vh]">
        {/* Sidebar Panel */}
        <div className="w-full md:w-64 bg-white rounded-2xl border border-gray-100 p-4 space-y-2 h-fit shadow-[0_15px_40px_rgba(6,64,43,0.08)]">
        <div className="px-4 py-3 border-b border-gray-100 mb-4">
          <div className="font-bold text-[#06402B] text-lg">{user?.name}</div>
          <div className="text-xs text-red-500 uppercase font-bold">Administrator</div>
        </div>

        <button 
          onClick={() => setActiveTab('employers')} 
          className={sidebarButtonClass('employers')}
        >
          <span>🏢</span>
          <span>Pending Employers</span>
        </button>

        <button 
          onClick={() => setActiveTab('reports')} 
          className={sidebarButtonClass('reports')}
        >
          <span>🚨</span>
          <span>Student Reports</span>
        </button>

        <button 
          onClick={() => setActiveTab('moderation')} 
          className={sidebarButtonClass('moderation')}
        >
          <span>🛡️</span>
          <span>Content Moderation</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-8 shadow-[0_15px_40px_rgba(6,64,43,0.08)]">
        
        {modMessage && (
          <div className={`p-4 rounded-lg text-sm border mb-6 ${
            modMessage.type === 'success' ? 'bg-green-900/30 text-green-300 border-green-800' : 'bg-red-900/30 text-red-300 border-red-800'
          }`}>
            {modMessage.text}
          </div>
        )}

        {activeTab === 'employers' && (
          <div>
            <h2 className="text-3xl font-extrabold text-[#06402B] mb-2">Pending Employer Registrations</h2>
            <p className="text-gray-500 mb-8">Review details and verify new employers before they can list jobs.</p>

            {pendingEmployers.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                <div className="text-gray-650 text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-medium text-[#06402B]">All caught up!</h3>
                <p className="text-gray-500 mt-2">No employers currently waiting for verification.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingEmployers.map((emp) => (
                  <div key={emp.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-[#06402B]">
                          {emp.accountType === 'company' ? emp.companyName : emp.user?.name}
                        </h3>
                        <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-200 uppercase">
                          {emp.accountType}
                        </span>
                      </div>
                      
                      <div className="text-gray-500 text-sm">
                        Registered by: <strong className="text-gray-800">{emp.user?.name}</strong> ({emp.user?.email})
                      </div>

                      {emp.accountType === 'company' && (
                        <div className="text-gray-500 text-sm">
                          Company Reg No: <code className="text-[#06402B] bg-gray-100 px-1.5 py-0.5 rounded">{emp.companyRegNo}</code>
                        </div>
                      )}
                      
                      {emp.individualIdNo && (
                        <div className="text-gray-500 text-sm">
                          ID Number: <code className="text-[#06402B] bg-gray-100 px-1.5 py-0.5 rounded">{emp.individualIdNo}</code>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        disabled={processingId === emp.userId}
                        onClick={() => handleVerifyEmployer(emp.userId, 'approved')}
                        className="bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Approve
                      </button>
                      <button
                        disabled={processingId === emp.userId}
                        onClick={() => handleVerifyEmployer(emp.userId, 'rejected')}
                        className="bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 className="text-3xl font-extrabold text-[#06402B] mb-2">Student Reports Queue</h2>
            <p className="text-gray-500 mb-8">Review reports submitted by students on jobs or other users.</p>

            {reports.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                <div className="text-gray-650 text-5xl mb-4">🛡️</div>
                <h3 className="text-xl font-medium text-[#06402B]">Clean slate</h3>
                <p className="text-gray-500 mt-2">No reports currently submitted.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Reporter</th>
                      <th className="px-6 py-4">Target Type</th>
                      <th className="px-6 py-4">Target ID</th>
                      <th className="px-6 py-4">Reason</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                        <td className="px-6 py-4 font-semibold text-[#06402B]">
                          {report.reporter?.name || `User ID: ${report.fromUser}`}
                        </td>
                        <td className="px-6 py-4 capitalize">{report.targetType}</td>
                        <td className="px-6 py-4">
                          <code className="bg-gray-100 px-2 py-0.5 rounded text-[#06402B]">{report.targetId}</code>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate">{report.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase border ${
                            report.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                            report.status === 'reviewed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {report.status !== 'resolved' && (
                            <button
                              disabled={processingId === report.id}
                              onClick={() => handleResolveReport(report.id, 'resolved')}
                              className="text-xs bg-[#06402B] hover:bg-[#0a5c3f] text-white py-1 px-2.5 rounded transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="space-y-8 max-w-xl">
            <div>
              <h2 className="text-3xl font-extrabold text-[#06402B] mb-2">Content Moderation</h2>
              <p className="text-gray-500">Quickly remove content that violates guidelines using target IDs.</p>
            </div>

            {/* Delete Job */}
            <form onSubmit={handleDeleteJob} className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
              <h3 className="text-lg font-bold text-[#06402B]">Remove Job Post</h3>
              <p className="text-xs text-gray-500">Entering a valid Job ID will permanently remove the post and all its applications.</p>
              <div className="flex gap-4">
                <input 
                  type="number"
                  placeholder="Job ID (e.g. 5)"
                  required
                  value={jobIdToDelete}
                  onChange={(e) => setJobIdToDelete(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:border-[#06402B] focus:ring-1 focus:ring-[#06402B]"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
                >
                  Delete Job
                </button>
              </div>
            </form>

            {/* Delete Review */}
            <form onSubmit={handleDeleteReview} className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
              <h3 className="text-lg font-bold text-[#06402B]">Remove Bad Review</h3>
              <p className="text-xs text-gray-500">Entering a valid Review ID will permanently delete the rating and comments.</p>
              <div className="flex gap-4">
                <input 
                  type="number"
                  placeholder="Review ID (e.g. 12)"
                  required
                  value={reviewIdToDelete}
                  onChange={(e) => setReviewIdToDelete(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:border-[#06402B] focus:ring-1 focus:ring-[#06402B]"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
                >
                  Delete Review
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
