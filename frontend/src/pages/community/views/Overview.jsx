import React from 'react';

const Overview = ({ jobs, onNavigateToTab, onViewApplicants }) => {
  const activeJobs = jobs.filter(j => j.status === 'open');
  const totalApplicants = jobs.reduce((sum, j) => sum + Number(j.applicationsCount || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Metrics Row (3 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Postings</div>
          <div className="text-3xl font-extrabold text-[#06402B] mt-2">{activeJobs.length}</div>
          <div className="text-xs text-green-400 mt-2">Open recruitment shifts</div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Applicants</div>
          <div className="text-3xl font-extrabold text-[#06402B] mt-2">{totalApplicants}</div>
          <div className="text-xs text-blue-600 mt-2">All-time candidates</div>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Verified Hours</div>
          <div className="text-3xl font-extrabold text-[#06402B] mt-2">51.9h</div>
          <div className="text-xs text-green-400 mt-2">Approved student work hours</div>
        </div>
      </div>

      {/* Active Jobs Widget */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
        <h3 className="text-base font-bold text-[#06402B] mb-4">Your Active Job Postings</h3>
        <div className="divide-y divide-gray-200">
          {jobs.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No jobs created yet. Click "Post a Job" in the sidebar to start.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-bold text-[#06402B] text-sm">{job.title}</h4>
                  <p className="text-xs text-gray-500">Pay: LKR {job.payAmount}/hr | Location: {job.locationName}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onViewApplicants(job)}
                    className="bg-[#06402B] hover:bg-[#0a5c3f] text-white text-xs font-semibold py-1.5 px-4 rounded-lg transition cursor-pointer"
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
