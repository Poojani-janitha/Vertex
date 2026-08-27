import React from 'react';

const MyJobs = ({ jobs, onViewApplicants }) => {
  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-[#06402B]">Manage Job Postings</h3>
          <p className="text-xs text-gray-500">Track published shift openings, employee quotas, and candidate applications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.length === 0 ? (
          <div className="col-span-2 bg-white border border-gray-200 border-dashed rounded-3xl p-12 text-center text-gray-400 space-y-3">
            <div className="text-5xl">💼</div>
            <p className="text-sm font-semibold text-gray-600">No shift postings created yet.</p>
            <p className="text-xs text-gray-400">Click "Post a Job" in the sidebar menu to hire university student talent.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-white rounded-3xl border border-gray-200/90 p-6 space-y-4 hover:border-emerald-700/50 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-extrabold text-[#06402B] text-base tracking-tight">{job.title}</h4>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                    job.status === 'open' ? 'bg-green-100 text-green-800 border-green-200' :
                    job.status === 'filled' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                    'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {job.status || 'open'}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {job.description || 'No detailed shift description provided.'}
                </p>
                
                <div className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-bold">💰 Pay Amount:</span> 
                    <span className="font-extrabold text-[#06402B]">LKR {parseFloat(job.payAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-semibold">📍 Location:</span> 
                    <span className="truncate max-w-[240px] text-gray-700">{job.locationName || 'Venue not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <span>👥 Required Staff: <strong>{job.requiredEmployees || 1} student(s)</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-medium">
                  {new Date(job.createdAt || Date.now()).toLocaleDateString()}
                </span>
                <button 
                  onClick={() => onViewApplicants(job)}
                  className="bg-[#06402B] hover:bg-[#0a5c3f] text-white text-xs font-bold py-2 px-4 rounded-xl transition shadow-md shadow-emerald-950/10 cursor-pointer"
                >
                  Review Applicants ({job.applicationsCount || 0}) →
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
