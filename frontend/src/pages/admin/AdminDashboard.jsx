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

  // Form States for Moderation
  const [jobIdToDelete, setJobIdToDelete] = useState('');
  const [reviewIdToDelete, setReviewIdToDelete] = useState('');
  const [modMessage, setModMessage] = useState(null);

  // Status updates loading states
  const [processingId, setProcessingId] = useState(null);

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
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [employersRes, reportsRes] = await Promise.all([
        api.get('/admin/employers/pending'),
        api.get('/admin/reports')
      ]);
      setPendingEmployers(employersRes.data);
      setReports(reportsRes.data);
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
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[70vh]">
      {/* Sidebar Panel */}
      <div className="w-full md:w-64 bg-gray-800 rounded-2xl border border-gray-700 p-4 space-y-2 h-fit">
        <div className="px-4 py-3 border-b border-gray-700 mb-4">
          <div className="font-bold text-white text-lg">{user?.name}</div>
          <div className="text-xs text-red-400 uppercase font-semibold">Administrator</div>
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
      <div className="flex-1 bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl">
        
        {modMessage && (
          <div className={`p-4 rounded-lg text-sm border mb-6 ${
            modMessage.type === 'success' ? 'bg-green-900/30 text-green-300 border-green-800' : 'bg-red-900/30 text-red-300 border-red-800'
          }`}>
            {modMessage.text}
          </div>
        )}

        {activeTab === 'employers' && (
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Pending Employer Registrations</h2>
            <p className="text-gray-400 mb-8">Review details and verify new employers before they can list jobs.</p>

            {pendingEmployers.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-700 border-dashed">
                <div className="text-gray-650 text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-medium text-gray-300">All caught up!</h3>
                <p className="text-gray-500 mt-2">No employers currently waiting for verification.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingEmployers.map((emp) => (
                  <div key={emp.id} className="bg-gray-900/40 p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">
                          {emp.accountType === 'company' ? emp.companyName : emp.user?.name}
                        </h3>
                        <span className="bg-blue-900/50 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-800 uppercase">
                          {emp.accountType}
                        </span>
                      </div>
                      
                      <div className="text-gray-400 text-sm">
                        Registered by: <strong className="text-gray-200">{emp.user?.name}</strong> ({emp.user?.email})
                      </div>

                      {emp.accountType === 'company' && (
                        <div className="text-gray-400 text-sm">
                          Company Reg No: <code className="text-gray-200 bg-gray-800 px-1.5 py-0.5 rounded">{emp.companyRegNo}</code>
                        </div>
                      )}
                      
                      {emp.individualIdNo && (
                        <div className="text-gray-400 text-sm">
                          ID Number: <code className="text-gray-200 bg-gray-800 px-1.5 py-0.5 rounded">{emp.individualIdNo}</code>
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
            <h2 className="text-3xl font-extrabold text-white mb-2">Student Reports Queue</h2>
            <p className="text-gray-400 mb-8">Review reports submitted by students on jobs or other users.</p>

            {reports.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-700 border-dashed">
                <div className="text-gray-650 text-5xl mb-4">🛡️</div>
                <h3 className="text-xl font-medium text-gray-300">Clean slate</h3>
                <p className="text-gray-500 mt-2">No reports currently submitted.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4">Reporter</th>
                      <th className="px-6 py-4">Target Type</th>
                      <th className="px-6 py-4">Target ID</th>
                      <th className="px-6 py-4">Reason</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-750/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">
                          {report.reporter?.name || `User ID: ${report.fromUser}`}
                        </td>
                        <td className="px-6 py-4 capitalize">{report.targetType}</td>
                        <td className="px-6 py-4">
                          <code className="bg-gray-900 px-2 py-0.5 rounded text-white">{report.targetId}</code>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate">{report.reason}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase border ${
                            report.status === 'resolved' ? 'bg-green-900/30 text-green-400 border-green-800' :
                            report.status === 'reviewed' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                            'bg-yellow-900/30 text-yellow-400 border-yellow-800'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {report.status !== 'resolved' && (
                            <button
                              disabled={processingId === report.id}
                              onClick={() => handleResolveReport(report.id, 'resolved')}
                              className="text-xs bg-blue-600 hover:bg-blue-500 text-white py-1 px-2.5 rounded transition-colors"
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
              <h2 className="text-3xl font-extrabold text-white mb-2">Content Moderation</h2>
              <p className="text-gray-400">Quickly remove content that violates guidelines using target IDs.</p>
            </div>

            {/* Delete Job */}
            <form onSubmit={handleDeleteJob} className="bg-gray-900/30 p-6 rounded-xl border border-gray-700 space-y-4">
              <h3 className="text-lg font-bold text-white">Remove Job Post</h3>
              <p className="text-xs text-gray-500">Entering a valid Job ID will permanently remove the post and all its applications.</p>
              <div className="flex gap-4">
                <input 
                  type="number"
                  placeholder="Job ID (e.g. 5)"
                  required
                  value={jobIdToDelete}
                  onChange={(e) => setJobIdToDelete(e.target.value)}
                  className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
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
            <form onSubmit={handleDeleteReview} className="bg-gray-900/30 p-6 rounded-xl border border-gray-700 space-y-4">
              <h3 className="text-lg font-bold text-white">Remove Bad Review</h3>
              <p className="text-xs text-gray-500">Entering a valid Review ID will permanently delete the rating and comments.</p>
              <div className="flex gap-4">
                <input 
                  type="number"
                  placeholder="Review ID (e.g. 12)"
                  required
                  value={reviewIdToDelete}
                  onChange={(e) => setReviewIdToDelete(e.target.value)}
                  className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
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
  );
};

export default AdminDashboard;
