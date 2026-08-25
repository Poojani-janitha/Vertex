const Overview = ({ jobs, wallet, onNavigateToTab, onViewApplicants }) => {
  const activeJobs = jobs.filter(j => j.status === 'open');
  const filledJobs = jobs.filter(j => j.status === 'filled');
  const totalApplicants = jobs.reduce((sum, j) => sum + Number(j.applicationsCount || 0), 0);
  const escrowBalance = parseFloat(wallet?.balance || 0);

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#06402B] tracking-tight">Business Overview</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Monitor active shifts, review incoming student applications, and manage shift attendance.
          </p>
        </div>
        <button
          onClick={() => onNavigateToTab('post-job')}
          className="bg-[#06402B] hover:bg-[#0a5c3f] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-md shadow-emerald-950/15 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>➕</span> Post New Shift
        </button>
      </div>

      {/* 1. Dynamic Metrics Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Active Open Shifts */}
        <div className="bg-white border border-gray-200/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Active Open Shifts</span>
            <span className="text-emerald-700 text-base">💼</span>
          </div>
          <div className="text-3xl font-extrabold text-[#06402B] mt-3">{activeJobs.length}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Currently accepting applications
          </div>
        </div>

        {/* Total Applicants */}
        <div className="bg-white border border-gray-200/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Applicants</span>
            <span className="text-blue-600 text-base">👥</span>
          </div>
          <div className="text-3xl font-extrabold text-[#06402B] mt-3">{totalApplicants}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-2">
            Candidates across all shifts
          </div>
        </div>

        {/* Filled / Completed Shifts */}
        <div className="bg-white border border-gray-200/80 p-6 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Filled Shifts</span>
            <span className="text-purple-600 text-base">✅</span>
          </div>
          <div className="text-3xl font-extrabold text-[#06402B] mt-3">{filledJobs.length}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-2">
            Ready for QR attendance
          </div>
        </div>

        {/* Available Escrow Balance */}
        <div className="bg-gradient-to-br from-[#06402B] to-[#0a5c3f] p-6 rounded-3xl shadow-xl shadow-emerald-950/20 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex justify-between items-center">
            <span className="text-emerald-200 text-xs font-bold uppercase tracking-wider">Escrow Wallet</span>
            <span className="text-white text-base">💳</span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight mt-3">
            LKR {escrowBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <button
            onClick={() => onNavigateToTab('wallet')}
            className="text-[11px] text-emerald-200 font-bold hover:text-white transition mt-2 text-left underline"
          >
            Manage / Top Up Funds →
          </button>
        </div>
      </div>

      {/* 2. Quick Action Hub */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6">
        <h3 className="text-xs font-bold text-[#06402B] uppercase tracking-wider mb-4">Quick Action Shortcuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigateToTab('post-job')}
            className="bg-white hover:bg-emerald-100/50 border border-emerald-200 text-[#06402B] p-4 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-2 shadow-sm cursor-pointer text-center"
          >
            <span className="text-2xl">➕</span>
            Post New Shift
          </button>

          <button
            onClick={() => onNavigateToTab('scan-qr')}
            className="bg-white hover:bg-emerald-100/50 border border-emerald-200 text-[#06402B] p-4 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-2 shadow-sm cursor-pointer text-center"
          >
            <span className="text-2xl">📷</span>
            Scan QR Check-In
          </button>

          <button
            onClick={() => onNavigateToTab('my-jobs')}
            className="bg-white hover:bg-emerald-100/50 border border-emerald-200 text-[#06402B] p-4 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-2 shadow-sm cursor-pointer text-center"
          >
            <span className="text-2xl">💼</span>
            Manage Postings
          </button>

          <button
            onClick={() => onNavigateToTab('wallet')}
            className="bg-white hover:bg-emerald-100/50 border border-emerald-200 text-[#06402B] p-4 rounded-2xl text-xs font-bold transition flex flex-col items-center gap-2 shadow-sm cursor-pointer text-center"
          >
            <span className="text-2xl">💸</span>
            Deposit Escrow
          </button>
        </div>
      </div>

      {/* 3. Active Job Postings List */}
      <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-[#06402B]">Recent Shift Postings</h3>
            <p className="text-xs text-gray-500">Overview of active postings and candidate applications.</p>
          </div>
          <button
            onClick={() => onNavigateToTab('my-jobs')}
            className="text-xs font-bold text-[#06402B] hover:underline"
          >
            View All ({jobs.length}) →
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 space-y-3">
              <div className="text-4xl">💼</div>
              <p className="text-xs">No jobs created yet. Click "Post New Shift" to hire student talent.</p>
            </div>
          ) : (
            jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-gray-50/50 px-2 rounded-2xl transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#06402B] text-sm">{job.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      job.status === 'open' ? 'bg-green-100 text-green-800' :
                      job.status === 'filled' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-emerald-800">💰 LKR {parseFloat(job.payAmount || 0).toFixed(2)}</span>
                    <span>📍 {job.locationName || 'Location not specified'}</span>
                    <span>👥 Needs: {job.requiredEmployees || 1} staff</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => onViewApplicants(job)}
                    className="bg-[#06402B] hover:bg-[#0a5c3f] text-white text-xs font-bold py-2 px-4 rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    Review Applicants ({job.applicationsCount || 0}) →
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
