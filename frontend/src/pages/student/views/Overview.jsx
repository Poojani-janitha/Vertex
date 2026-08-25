import React from 'react';

const Overview = ({ profile, applications = [], availability = [], wallet, onNavigateToTab }) => {
  const pendingApps = applications.filter(a => a.status === 'pending');
  const acceptedApps = applications.filter(a => a.status === 'accepted');
  const balance = parseFloat(wallet?.balance || 0);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Platform Banner */}
      <div className="bg-gradient-to-r from-emerald-50/90 to-green-50/60 border border-emerald-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="bg-[#06402B] text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md mt-0.5 select-none shadow-sm">
            CAMPUS NEWS
          </span>
          <div>
            <h4 className="font-bold text-[#06402B] text-sm">
              New flexible student shifts and gigs available across university partner campuses!
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">Explore verified hourly shifts and earn directly to your digital wallet.</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigateToTab('related-jobs')}
          className="bg-[#06402B] hover:bg-[#0a5c3f] text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition whitespace-nowrap self-start sm:self-center shadow-sm cursor-pointer"
        >
          Browse Open Shifts →
        </button>
      </div>

      {/* Stats Cards Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-2 shadow-sm hover:shadow-md transition">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Applications</div>
          <div className="text-3xl font-extrabold text-[#06402B]">
            {pendingApps.length}
          </div>
          <div className="text-xs text-amber-600 font-semibold">Awaiting employer review</div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-2 shadow-sm hover:shadow-md transition">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Approved Shifts</div>
          <div className="text-3xl font-extrabold text-emerald-700">
            {acceptedApps.length}
          </div>
          <div className="text-xs text-emerald-600 font-semibold">Ready for QR check-in</div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl space-y-2 shadow-sm hover:shadow-md transition">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Applications</div>
          <div className="text-3xl font-extrabold text-[#06402B]">
            {applications.length}
          </div>
          <div className="text-xs text-blue-600 font-semibold">All-time shift records</div>
        </div>

        <div className="bg-gradient-to-br from-[#06402B] to-[#0a5c3f] text-white p-6 rounded-2xl space-y-2 shadow-lg shadow-emerald-950/20 relative overflow-hidden">
          <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Digital Wallet</div>
          <div className="text-2xl font-extrabold tracking-tight">
            LKR {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <button
            onClick={() => onNavigateToTab('wallet')}
            className="text-[11px] text-emerald-200 font-bold hover:text-white transition underline block cursor-pointer"
          >
            Manage / Request Payout →
          </button>
        </div>

      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigateToTab('related-jobs')}
          className="bg-white hover:bg-emerald-50/60 border border-gray-200 p-5 rounded-2xl text-left transition flex items-center gap-4 shadow-sm cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition">
            🔍
          </div>
          <div>
            <div className="font-bold text-sm text-[#06402B]">Explore Open Shifts</div>
            <div className="text-[11px] text-gray-500">Find gigs matching your skills & schedule</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateToTab('jobs')}
          className="bg-white hover:bg-emerald-50/60 border border-gray-200 p-5 rounded-2xl text-left transition flex items-center gap-4 shadow-sm cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition">
            📷
          </div>
          <div>
            <div className="font-bold text-sm text-[#06402B]">Attendance & QR Pass</div>
            <div className="text-[11px] text-gray-500">Access check-in pass for approved shifts</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateToTab('wallet')}
          className="bg-white hover:bg-emerald-50/60 border border-gray-200 p-5 rounded-2xl text-left transition flex items-center gap-4 shadow-sm cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-lg font-bold group-hover:scale-105 transition">
            💳
          </div>
          <div>
            <div className="font-bold text-sm text-[#06402B]">Wallet & Bank Payouts</div>
            <div className="text-[11px] text-gray-500">Withdraw earnings to your local bank</div>
          </div>
        </button>
      </div>

      {/* Quick Tips */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-[#06402B] mb-3">💡 Quick Student Tips</h3>
        <ul className="list-disc list-inside text-gray-500 text-xs space-y-2 leading-relaxed">
          <li>Upload your PDF CV in <strong>Profile Settings</strong> so employers can instantly evaluate your qualifications.</li>
          <li>Set your availability times precisely to prevent scheduling conflicts with your academic lectures.</li>
          <li>Upon shift completion, present your QR attendance pass to the employer to receive immediate automated wallet credit.</li>
        </ul>
      </div>

    </div>
  );
};

export default Overview;
