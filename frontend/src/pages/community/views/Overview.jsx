import React from 'react';

const Overview = ({ jobs, onNavigateToTab, onViewApplicants }) => {
  const activeJobs = jobs.filter(j => j.status === 'open');
  const totalApplicants = jobs.reduce((sum, j) => sum + Number(j.applicationsCount || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Metrics Row (3 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#121824] border border-gray-800 p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Active Postings</div>
          <div className="text-3xl font-extrabold text-white mt-2">{activeJobs.length}</div>
          <div className="text-xs text-green-400 mt-2">Open recruitment shifts</div>
        </div>
        <div className="bg-[#121824] border border-gray-800 p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Applicants</div>
          <div className="text-3xl font-extrabold text-white mt-2">{totalApplicants}</div>
          <div className="text-xs text-blue-400 mt-2">All-time candidates</div>
        </div>
        <div className="bg-[#121824] border border-gray-800 p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Verified Hours</div>
          <div className="text-3xl font-extrabold text-white mt-2">51.9h</div>
          <div className="text-xs text-green-400 mt-2">Approved student work hours</div>
        </div>
      </div>

      {/* Active Jobs Widget */}
      <div className="bg-[#121824] border border-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-base font-bold text-white mb-4">Your Active Job Postings</h3>
        <div className="divide-y divide-gray-800">
          {jobs.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">No jobs created yet. Click "Post a Job" in the sidebar to start.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm">{job.title}</h4>
                  <p className="text-xs text-gray-400">Pay: ${job.payAmount}/hr | Location: {job.locationName}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onViewApplicants(job)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 px-4 rounded-lg transition cursor-pointer"
                  >
                    Applicants ({job.applicationsCount || 0})
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default Overview;
