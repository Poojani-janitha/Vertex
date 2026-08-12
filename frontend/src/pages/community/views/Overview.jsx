import React from 'react';

const Overview = ({ jobs, onNavigateToTab, onGenerateQR, onViewApplicants }) => {
  const activeJobs = jobs.filter(j => j.status === 'open');
  const totalApplicants = jobs.reduce((sum, j) => sum + Number(j.applicationsCount || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-[#121824] border border-gray-800 p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Active Postings</div>
          <div className="text-3xl font-extrabold text-white mt-2">{activeJobs.length}</div>
          <div className="text-xs text-green-400 mt-2">+1 this week</div>
        </div>
        <div className="bg-[#121824] border border-gray-800 p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Applicants</div>
          <div className="text-3xl font-extrabold text-white mt-2">{totalApplicants}</div>
          <div className="text-xs text-blue-400 mt-2">All-time active</div>
        </div>
        <div className="bg-[#121824] border border-gray-800 p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Verified Hours</div>
          <div className="text-3xl font-extrabold text-white mt-2">51.9h</div>
          <div className="text-xs text-green-400 mt-2">On track with goal</div>
        </div>
        <div className="bg-[#121824] border border-gray-800 p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Wallet Balance</div>
          <div className="text-3xl font-extrabold text-green-400 mt-2">Rs 335</div>
          <div className="text-xs text-gray-500 mt-2">LKR - Active</div>
        </div>
      </div>

      {/* Tech Industry Stats Section */}
      <div className="bg-[#121824] border border-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Tech Industry Stats</h3>
            <p className="text-xs text-gray-400">Sri Lanka & global IT market insights</p>
          </div>
          <button className="text-xs text-blue-400 hover:underline">View all &rarr;</button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs border-b border-gray-800 pb-3">
          {['Overview', 'Salary', 'Skills', 'Companies', 'Education', 'Outlook'].map((item, idx) => (
            <span key={item} className={`px-3 py-1.5 rounded-lg cursor-pointer ${idx === 0 ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-800 text-gray-400'}`}>{item}</span>
          ))}
        </div>
        <div className="py-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex-1 space-y-4">
            <h4 className="font-semibold text-sm text-gray-300">Wallet Activity</h4>
            <div className="h-24 bg-gray-900/40 border border-gray-800/80 rounded-lg flex items-center justify-center text-xs text-gray-500">
              📊 Wallet Activity graph visualization (Rs 335 Top-ups)
            </div>
          </div>
          <div className="w-full sm:w-64 space-y-4">
            <h4 className="font-semibold text-sm text-gray-300">Time Breakdown</h4>
            <div className="h-24 bg-gray-900/40 border border-gray-800/80 rounded-lg flex items-center justify-center text-xs text-gray-500">
              🍩 Hour-by-hour circle breakdown
            </div>
          </div>
        </div>
      </div>

      {/* Active Jobs Widget */}
      <div className="bg-[#121824] border border-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-base font-bold text-white mb-4">Active Postings & Fast QR Code Generators</h3>
        <div className="divide-y divide-gray-800">
          {jobs.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">No jobs created yet. Click "Post a Job" to start.</p>
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
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition"
                  >
                    Applicants ({job.applicationsCount || 0})
                  </button>
                  <button 
                    onClick={() => onGenerateQR(job, 'check-in')}
                    className="bg-green-600 hover:bg-green-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition"
                  >
                    Check-In QR
                  </button>
                  <button 
                    onClick={() => onGenerateQR(job, 'check-out')}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition"
                  >
                    Check-Out QR
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
