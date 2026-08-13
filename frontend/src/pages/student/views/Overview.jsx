import React from 'react';

const Overview = ({ profile, applications, availability, onNavigateToTab }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* News Banner */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/10 border border-blue-900/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="bg-blue-600 text-white text-[9px] font-extrabold uppercase px-2 py-1 rounded mt-0.5 select-none">COMMUNITY NEWS</span>
          <div>
            <h4 className="font-bold text-white text-sm">Startup founders urge U.S. government not to shut off Chinese open weight AI</h4>
            <p className="text-xs text-gray-400">via politico.com 1/5</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigateToTab('jobs')}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-4 rounded-lg transition whitespace-nowrap self-start sm:self-center"
        >
          Browse Postings
        </button>
      </div>

      {/* Stats Cards Grid (Matching Template Styles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-[#111726] border border-gray-800 p-6 rounded-xl space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Applications</div>
          <div className="text-3xl font-extrabold text-white">
            {applications.filter(a => a.status === 'pending').length}
          </div>
          <div className="text-[10px] text-yellow-400 font-semibold">Awaiting review</div>
        </div>

        <div className="bg-[#111726] border border-gray-800 p-6 rounded-xl space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Approved Jobs</div>
          <div className="text-3xl font-extrabold text-green-450">
            {applications.filter(a => a.status === 'accepted').length}
          </div>
          <div className="text-[10px] text-green-400 font-semibold">Ready to start</div>
        </div>

        <div className="bg-[#111726] border border-gray-800 p-6 rounded-xl space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verified Hours</div>
          <div className="text-3xl font-extrabold text-white">12.5h</div>
          <div className="text-[10px] text-gray-400">On track with goal</div>
        </div>

        <div className="bg-[#111726] border border-gray-800 p-6 rounded-xl space-y-2">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Wallet Balance</div>
          <div className="text-3xl font-extrabold text-green-400">Rs 0.00</div>
          <div className="text-[10px] text-gray-550">LKR - Active</div>
        </div>

      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Wallet Activity Graph Placeholder */}
        <div className="lg:col-span-2 bg-[#111726] border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-6">Wallet Activity</h3>
          <div className="h-64 flex flex-col justify-center items-center bg-[#0b0e17]/50 border border-gray-800/80 rounded-xl">
            <span className="text-2xl mb-2">📊</span>
            <span className="text-xs text-gray-400">Wallet Activity graph visualization (Rs 0.00 Top-ups)</span>
          </div>
        </div>

        {/* Time Breakdown Graph Placeholder */}
        <div className="lg:col-span-1 bg-[#111726] border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-6">Time Breakdown</h3>
          <div className="h-64 flex flex-col justify-center items-center bg-[#0b0e17]/50 border border-gray-800/80 rounded-xl">
            <span className="text-2xl mb-2">🍩</span>
            <span className="text-xs text-gray-400">Hour-by-hour circle breakdown</span>
          </div>
        </div>

      </div>

      {/* Quick Tips */}
      <div className="bg-[#111726]/40 p-6 rounded-xl border border-gray-800">
        <h3 className="text-sm font-bold text-white mb-3">💡 Quick Student Tips</h3>
        <ul className="list-disc list-inside text-gray-400 text-xs space-y-2 leading-relaxed">
          <li>Make sure your bio lists your current course, university, and graduation year.</li>
          <li>Set your availability times precisely so employers don't receive scheduling conflicts.</li>
          <li>Browse the Jobs Board to register for open student jobs in one click.</li>
        </ul>
      </div>

    </div>
  );
};

export default Overview;
