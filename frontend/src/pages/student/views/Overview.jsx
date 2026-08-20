import React from 'react';

const Overview = ({ profile, applications, availability, onNavigateToTab }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* News Banner */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/10 border border-blue-900/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="bg-[#06402B] text-white text-[9px] font-extrabold uppercase px-2 py-1 rounded mt-0.5 select-none">COMMUNITY NEWS</span>
          <div>
            <h4 className="font-bold text-[#06402B] text-sm">Startup founders urge U.S. government not to shut off Chinese open weight AI</h4>
            <p className="text-xs text-gray-500">via politico.com 1/5</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigateToTab('jobs')}
          className="bg-[#06402B] hover:bg-[#0a5c3f] text-white text-xs font-semibold py-2 px-4 rounded-lg transition whitespace-nowrap self-start sm:self-center"
        >
          Browse Postings
        </button>
      </div>

      {/* Stats Cards Grid (Matching Template Styles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white border border-gray-200 p-6 rounded-xl space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Applications</div>
          <div className="text-3xl font-extrabold text-[#06402B]">
            {applications.filter(a => a.status === 'pending').length}
          </div>
          <div className="text-[10px] text-yellow-400 font-semibold">Awaiting review</div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Approved Jobs</div>
          <div className="text-3xl font-extrabold text-green-450">
            {applications.filter(a => a.status === 'accepted').length}
          </div>
          <div className="text-[10px] text-green-400 font-semibold">Ready to start</div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verified Hours</div>
          <div className="text-3xl font-extrabold text-[#06402B]">12.5h</div>
          <div className="text-[10px] text-gray-500">On track with goal</div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Wallet Balance</div>
          <div className="text-3xl font-extrabold text-green-400">LKR 0.00</div>
          <div className="text-[10px] text-gray-500">LKR - Active</div>
        </div>

      </div>



      {/* Quick Tips */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-sm font-bold text-[#06402B] mb-3">💡 Quick Student Tips</h3>
        <ul className="list-disc list-inside text-gray-500 text-xs space-y-2 leading-relaxed">
          <li>Make sure your bio lists your current course, university, and graduation year.</li>
          <li>Set your availability times precisely so employers don't receive scheduling conflicts.</li>
          <li>Browse the Jobs Board to register for open student jobs in one click.</li>
        </ul>
      </div>

    </div>
  );
};

export default Overview;
