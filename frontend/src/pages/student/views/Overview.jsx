import React from 'react';

const Overview = ({ profile, applications, availability, onNavigateToTab }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* News Banner */}
      <div className="bg-gradient-to-r from-emerald-50/80 to-green-50/50 border border-emerald-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="bg-[#06402B] text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md mt-0.5 select-none shadow-sm">COMMUNITY NEWS</span>
          <div>
            <h4 className="font-bold text-[#06402B] text-sm">Startup founders urge U.S. government not to shut off Chinese open weight AI</h4>
            <p className="text-xs text-gray-500 mt-0.5">via politico.com 1/5</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigateToTab('jobs')}
          className="bg-[#06402B] hover:bg-[#0a5c3f] text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition whitespace-nowrap self-start sm:self-center shadow-sm cursor-pointer"
        >
          Browse Postings
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-2 shadow-sm">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Applications</div>
          <div className="text-3xl font-extrabold text-[#06402B]">
            {applications.filter(a => a.status === 'pending').length}
          </div>
          <div className="text-xs text-amber-600 font-semibold">Awaiting review</div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-2 shadow-sm">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Approved Jobs</div>
          <div className="text-3xl font-extrabold text-emerald-700">
            {applications.filter(a => a.status === 'accepted').length}
          </div>
          <div className="text-xs text-emerald-600 font-semibold">Ready to start</div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-2 shadow-sm">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verified Hours</div>
          <div className="text-3xl font-extrabold text-[#06402B]">12.5h</div>
          <div className="text-xs text-gray-500">On track with goal</div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-2 shadow-sm">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Wallet Balance</div>
          <div className="text-3xl font-extrabold text-emerald-700">LKR 0.00</div>
          <div className="text-xs text-gray-500">LKR - Active</div>
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
