import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  const categories = [
    { title: 'Cafes & Hospitality', icon: '☕', shifts: '34 Active Shifts', color: 'from-amber-500/10 to-orange-500/10', border: 'hover:border-amber-400' },
    { title: 'Event Staffing', icon: '🎪', shifts: '28 Active Shifts', color: 'from-purple-500/10 to-indigo-500/10', border: 'hover:border-purple-400' },
    { title: 'Tutoring & Academic', icon: '📚', shifts: '19 Active Shifts', color: 'from-blue-500/10 to-cyan-500/10', border: 'hover:border-blue-400' },
    { title: 'Retail & Showrooms', icon: '🛍️', shifts: '25 Active Shifts', color: 'from-emerald-500/10 to-teal-500/10', border: 'hover:border-emerald-400' },
    { title: 'Tech & IT Support', icon: '💻', shifts: '14 Active Shifts', color: 'from-indigo-500/10 to-blue-500/10', border: 'hover:border-indigo-400' },
    { title: 'Delivery & Logistics', icon: '🛵', shifts: '42 Active Shifts', color: 'from-rose-500/10 to-pink-500/10', border: 'hover:border-rose-400' }
  ];

  const steps = [
    {
      num: '01',
      title: 'Create Your Profile & Set Hours',
      desc: 'Sign up with your university email, select your free days/hours on the calendar, and get matched to shifts.',
      icon: '🎯'
    },
    {
      num: '02',
      title: 'Scan QR at Check-In & Check-Out',
      desc: 'Show up at the venue, present your dynamic QR code to the employer at start and finish of your shift.',
      icon: '📱'
    },
    {
      num: '03',
      title: 'Instant LKR Wallet Earnings',
      desc: 'Worked hours are calculated instantly. Earnings land in your LKR digital wallet for easy bank withdrawal.',
      icon: '💸'
    }
  ];

  const stats = [
    { value: '1,500+', label: 'Verified Students' },
    { value: '350+', label: 'Trusted Employers' },
    { value: 'LKR 4.2M+', label: 'Paid Out to Students' },
    { value: '4.9 ★', label: 'Student Satisfaction' }
  ];

  return (
    <div className="space-y-24 py-6 font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 to-teal-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center space-y-8 px-4">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-sm animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-ping"></span>
            <span className="text-xs font-bold text-[#06402B] uppercase tracking-wider">
              🚀 Sri Lanka's #1 Student Shift Network
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#06402B] leading-[1.1]">
            Work Shifts on Your Time. <br />
            <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
              Get Paid Instantly.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            WorkOra connects university students with verified part-time shifts and hourly gigs. QR attendance tracking, guaranteed escrow payments, and zero hassle.
          </p>

          {/* Search Shortcut Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-2">
            <div className="flex items-center bg-white p-2 rounded-2xl border-2 border-emerald-700/20 shadow-xl shadow-emerald-950/5 focus-within:border-[#06402B] focus-within:ring-2 focus-within:ring-emerald-700/10 transition">
              <span className="pl-3 pr-2 text-gray-400 text-base">🔍</span>
              <input
                type="text"
                placeholder="Search barista, event usher, tutor, cashier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#06402B] hover:bg-[#0a5c3f] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition shadow-md cursor-pointer whitespace-nowrap"
              >
                Search Shifts
              </button>
            </div>
          </form>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-gray-500">
            <span className="font-semibold text-[#06402B]">Popular:</span>
            {['Barista', 'Event Host', 'Math Tutor', 'Sales Assistant', 'Delivery'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/jobs?search=${encodeURIComponent(tag)}`)}
                className="bg-gray-100/80 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-gray-200/60 px-3 py-1 rounded-lg transition cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Action CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-[#06402B] hover:bg-[#0a5c3f] shadow-lg shadow-emerald-950/20 transition transform hover:-translate-y-0.5 text-center"
            >
              Browse All Shifts →
            </Link>
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-gray-700 bg-white hover:bg-gray-50 hover:text-[#06402B] border border-gray-200 shadow-sm transition transform hover:-translate-y-0.5 text-center"
            >
              Join as Student
            </Link>
          </div>
        </div>
      </section>

      {/* 2. LIVE PLATFORM METRICS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-br from-[#06402B] to-[#0a5c3f] rounded-3xl p-8 sm:p-12 text-white shadow-2xl shadow-emerald-950/25 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            {stats.map((stat, idx) => (
              <div key={idx} className={idx > 1 ? 'pt-6 md:pt-0' : ''}>
                <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">{stat.value}</div>
                <div className="text-xs sm:text-sm font-medium text-emerald-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. POPULAR SHIFT CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#06402B]">Explore Flexible Work Sectors</h2>
          <p className="text-sm text-gray-500">Pick shifts that match your college schedule and academic background.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/jobs?search=${encodeURIComponent(cat.title.split(' ')[0])}`)}
              className={`p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group ${cat.border}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl p-3 rounded-2xl bg-gray-50 group-hover:scale-110 transition">{cat.icon}</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  {cat.shifts}
                </span>
              </div>
              <h3 className="font-bold text-base text-gray-900 group-hover:text-[#06402B] transition">{cat.title}</h3>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 group-hover:text-emerald-700 transition">
                View open openings <span className="text-sm">→</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS STEPPER */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#06402B] pt-2">How WorkOra Works for Students</h2>
          <p className="text-sm text-gray-500">From finding an opening to having cash in your bank account.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white border border-gray-200/80 rounded-3xl p-8 shadow-sm space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{step.icon}</span>
                <span className="text-2xl font-black text-gray-200 font-mono">{step.num}</span>
              </div>
              <h3 className="text-lg font-bold text-[#06402B]">{step.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. TRUST & SAFETY HIGHLIGHTS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gray-100/80 border border-gray-200/90 rounded-3xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm">
              🛡️
            </div>
            <h4 className="font-bold text-base text-[#06402B]">100% Verified Employers</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Every company registration number and ID is reviewed and verified by our compliance team before jobs are published.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm">
              💳
            </div>
            <h4 className="font-bold text-base text-[#06402B]">Guaranteed In-App Wallet</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Employer funds are secured prior to shift start. As soon as you scan out, your earnings are credited automatically.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm">
              🚨
            </div>
            <h4 className="font-bold text-base text-[#06402B]">Emergency SOS Protection</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Students have 1-click Emergency SOS broadcasting with GPS coordinates directly to platform supervisors during active shifts.
            </p>
          </div>
        </div>
      </section>

      {/* 6. DUAL CALL TO ACTION */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student CTA */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 sm:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-1 rounded-md">
                For Students
              </span>
              <h3 className="text-2xl font-extrabold text-[#06402B]">Ready to earn during your free days?</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Build your verified work resume, earn competitive hourly rates in LKR, and fit work around your lecture timetable.
              </p>
            </div>
            <div>
              <Link
                to="/signup"
                className="inline-block bg-[#06402B] hover:bg-[#0a5c3f] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-md"
              >
                Sign Up as Student →
              </Link>
            </div>
          </div>

          {/* Employer CTA */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 space-y-6 flex flex-col justify-between shadow-sm">
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-md">
                For Businesses & Cafes
              </span>
              <h3 className="text-2xl font-extrabold text-gray-900">Need reliable shift staff today?</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Post short-notice shifts, review top undergraduate profiles, and manage check-ins with automated QR scan validation.
              </p>
            </div>
            <div>
              <Link
                to="/signup"
                className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-md"
              >
                Post Shifts as Employer →
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
