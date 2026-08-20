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
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6 shadow-lg animate-fade-in">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#06402B]">Applicants for: {job.title}</h3>
          <p className="text-xs text-gray-500">Review student details and select accept or reject.</p>
        </div>
        <button 
          onClick={onBack}
          className="bg-gray-100 hover:bg-gray-700 text-[#06402B] text-xs font-semibold py-1.5 px-3 rounded-lg border border-gray-200 transition"
        >
          &larr; Back to Posts
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6 text-xs text-gray-500">Loading applicants...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar applicant names list */}
          <div className="md:col-span-1 border-r border-gray-200 pr-4 space-y-2">
            <h4 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-2">Applicants list</h4>
            {applicants.length === 0 ? (
              <p className="text-gray-500 text-xs">No applications yet.</p>
            ) : (
              applicants.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApplicant(app)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedApplicant?.id === app.id
                      ? 'bg-[#06402B]/20 border-[#06402B]/50'
                      : 'bg-gray-100/40 border-gray-200 hover:border-gray-200'
                  }`}
                >
                  <div className="font-semibold text-[#06402B] text-sm">{app.student?.name || 'Student'}</div>
                  <div className="text-xs text-gray-500 flex justify-between mt-1">
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
              <div className="space-y-4 bg-gray-100/30 border border-gray-200 p-6 rounded-xl animate-fade-in">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-[#06402B]">{selectedApplicant.student?.name}</h4>
                    <p className="text-xs text-gray-500">{selectedApplicant.student?.email}</p>
                  </div>
                  <span className="bg-yellow-900/30 text-yellow-400 border border-yellow-800/50 px-3 py-1 rounded-full text-xs font-semibold">
                    Trust: 95% Match
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-2 pt-4 pb-2 border-t border-gray-200">
                  <div><span className="font-semibold text-gray-500">Phone:</span> {selectedApplicant.student?.phone || 'Not provided'}</div>
                  
                  {selectedApplicant.student?.profile && (
                    <>
                      {selectedApplicant.student.profile.university && (
                        <div><span className="font-semibold text-gray-500">University:</span> {selectedApplicant.student.profile.university}</div>
                      )}
                      {selectedApplicant.student.profile.degree && (
                        <div><span className="font-semibold text-gray-500">Degree:</span> {selectedApplicant.student.profile.degree}</div>
                      )}
                      {selectedApplicant.student.profile.bio && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200 mt-2">
                          <span className="font-semibold text-gray-500 block mb-1">About Me:</span> 
                          <span className="leading-relaxed">{selectedApplicant.student.profile.bio}</span>
                        </div>
                      )}
                      {selectedApplicant.student.profile.portfolioUrl && (
                        <div className="mt-2"><span className="font-semibold text-gray-500">Portfolio:</span> <a href={selectedApplicant.student.profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedApplicant.student.profile.portfolioUrl}</a></div>
                      )}
                    </>
                  )}

                  <div className="pt-2"><span className="font-semibold text-gray-500">Applied on:</span> {new Date(selectedApplicant.appliedAt || selectedApplicant.createdAt).toLocaleDateString()}</div>
                  <div><span className="font-semibold text-gray-500">Status:</span> <span className="capitalize font-semibold text-[#06402B]">{selectedApplicant.status}</span></div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'accepted')}
                    disabled={selectedApplicant.status === 'accepted'}
                    className={`flex-1 font-semibold py-2 px-4 rounded-lg text-xs text-[#06402B] transition ${
                      selectedApplicant.status === 'accepted' ? 'bg-green-700/50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
                    }`}
                  >
                    Accept Application
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'rejected')}
                    disabled={selectedApplicant.status === 'rejected'}
                    className={`flex-1 font-semibold py-2 px-4 rounded-lg text-xs text-[#06402B] transition ${
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
