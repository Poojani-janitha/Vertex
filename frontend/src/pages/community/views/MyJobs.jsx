import React from 'react';

const MyJobs = ({ jobs, onGenerateQR, onViewApplicants }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg animate-fade-in">
      <h3 className="text-lg font-bold text-[#06402B] mb-4">Manage Job Postings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-sm col-span-2">No jobs created yet. Navigate to "Post a Job" to start.</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-gray-100/50 rounded-xl border border-gray-200 p-6 space-y-4 hover:border-[#06402B]/30 transition">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-[#06402B] text-base">{job.title}</h4>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                  job.status === 'open' ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}>{job.status || 'open'}</span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{job.description}</p>
              <div className="text-xs text-gray-600 space-y-1">
                <div>💰 Pay Amount: LKR {job.payAmount}</div>
                <div>📍 Location: {job.locationName}</div>
              </div>
              <div className="pt-2 flex flex-wrap gap-2">
                <button 
                  onClick={() => onViewApplicants(job)}
                  className="bg-[#06402B] hover:bg-[#0a5c3f] text-white text-xs font-semibold py-2 px-4 rounded-lg transition"
                >
                  Applicants ({job.applicationsCount || 0})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyJobs;
