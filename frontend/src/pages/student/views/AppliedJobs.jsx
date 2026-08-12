import React, { useState } from 'react';

const AppliedJobs = ({ applications }) => {
  const [filter, setFilter] = useState('all');

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getFilterBtnClass = (statusType) => {
    return `px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
      filter === statusType
        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
        : 'bg-[#111726] border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
    }`;
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Header and Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">My Jobs</h2>
          <p className="text-gray-400 text-sm">Track your submitted job applications and verify recruiter decisions.</p>
        </div>
        
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={getFilterBtnClass('all')}>
            All ({applications.length})
          </button>
          <button onClick={() => setFilter('pending')} className={getFilterBtnClass('pending')}>
            Pending ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button onClick={() => setFilter('accepted')} className={getFilterBtnClass('accepted')}>
            Approved ({applications.filter(a => a.status === 'accepted').length})
          </button>
          <button onClick={() => setFilter('rejected')} className={getFilterBtnClass('rejected')}>
            Rejected ({applications.filter(a => a.status === 'rejected').length})
          </button>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed">
          <div className="text-gray-600 text-5xl mb-4">💼</div>
          <h3 className="text-lg font-medium text-gray-300">No applications found</h3>
          <p className="text-gray-550 text-xs mt-2">
            {filter === 'all' 
              ? 'Browse the Jobs Board to apply for student listings.' 
              : `You do not have any applications marked as ${filter}.`
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#111726] border border-gray-800 rounded-xl">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-450 uppercase bg-gray-900/40 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Pay Amount</th>
                <th className="px-6 py-4">Date Applied</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">{app.job?.title || 'Unknown Job'}</td>
                  <td className="px-6 py-4 text-green-400 font-semibold">${app.job?.payAmount || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                      app.status === 'accepted' ? 'bg-green-950/40 text-green-400 border-green-800' :
                      app.status === 'rejected' ? 'bg-red-950/40 text-red-400 border-red-800' :
                      'bg-yellow-950/40 text-yellow-450 border-yellow-800'
                    }`}>
                      {app.status === 'accepted' ? 'approved' : (app.status || 'pending')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;
