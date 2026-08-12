import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

const JobApplicants = ({ job, onBack }) => {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchApplicants = async () => {
    try {
      const response = await api.get(`/jobs/my-jobs/${job.id}/applicants`);
      setApplicants(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [job.id]);

  const handleUpdateStatus = async (appId, status) => {
    try {
      await api.patch(`/jobs/applications/${appId}`, { status });
      fetchApplicants();
      if (selectedApplicant && selectedApplicant.id === appId) {
        setSelectedApplicant(prev => ({ ...prev, status }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#121824] border border-gray-800 rounded-xl p-6 space-y-6 shadow-lg animate-fade-in">
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Applicants for: {job.title}</h3>
          <p className="text-xs text-gray-400">Review student details and select accept or reject.</p>
        </div>
        <button 
          onClick={onBack}
          className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg border border-gray-700 transition"
        >
          &larr; Back to Posts
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6 text-xs text-gray-450">Loading applicants...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar applicant names list */}
          <div className="md:col-span-1 border-r border-gray-800 pr-4 space-y-2">
            <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2">Applicants list</h4>
            {applicants.length === 0 ? (
              <p className="text-gray-500 text-xs">No applications yet.</p>
            ) : (
              applicants.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApplicant(app)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedApplicant?.id === app.id
                      ? 'bg-blue-600/20 border-blue-500/50'
                      : 'bg-gray-900/40 border-gray-800 hover:border-gray-750'
                  }`}
                >
                  <div className="font-semibold text-white text-sm">{app.student?.name || 'Student'}</div>
                  <div className="text-xs text-gray-400 flex justify-between mt-1">
                    <span>Phone: {app.student?.phone || 'N/A'}</span>
                    <span className={`capitalize font-semibold ${
                      app.status === 'accepted' ? 'text-green-400' : app.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                    }`}>{app.status}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Details screen */}
          <div className="md:col-span-2 space-y-6">
            {selectedApplicant ? (
              <div className="space-y-4 bg-gray-900/30 border border-gray-800 p-6 rounded-xl animate-fade-in">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-white">{selectedApplicant.student?.name}</h4>
                    <p className="text-xs text-gray-400">{selectedApplicant.student?.email}</p>
                  </div>
                  <span className="bg-yellow-900/30 text-yellow-400 border border-yellow-800/50 px-3 py-1 rounded-full text-xs font-semibold">
                    Trust: 95% Match
                  </span>
                </div>

                <div className="text-xs text-gray-300 space-y-2 pt-2 border-t border-gray-800">
                  <div><span className="font-semibold text-gray-400">Phone:</span> {selectedApplicant.student?.phone || 'Not provided'}</div>
                  <div><span className="font-semibold text-gray-400">Applied on:</span> {new Date(selectedApplicant.appliedAt || selectedApplicant.createdAt).toLocaleDateString()}</div>
                  <div><span className="font-semibold text-gray-400">Status:</span> <span className="capitalize font-semibold text-white">{selectedApplicant.status}</span></div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'accepted')}
                    disabled={selectedApplicant.status === 'accepted'}
                    className={`flex-1 font-semibold py-2 px-4 rounded-lg text-xs text-white transition ${
                      selectedApplicant.status === 'accepted' ? 'bg-green-700/50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
                    }`}
                  >
                    Accept Application
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'rejected')}
                    disabled={selectedApplicant.status === 'rejected'}
                    className={`flex-1 font-semibold py-2 px-4 rounded-lg text-xs text-white transition ${
                      selectedApplicant.status === 'rejected' ? 'bg-red-700/50 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'
                    }`}
                  >
                    Reject Application
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 text-xs">
                Select an applicant from the list to view profile details and update status.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicants;
