import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-[#06402B]">
          Connecting Students to <br className="hidden md:block"/>
          <span className="text-green-600">Real Opportunities</span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          WorkOra is the ultimate platform for university students to find flexible jobs, build their profiles, and get paid fairly by trusted employers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Link to="/jobs" className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white bg-[#06402B] hover:bg-[#0a5c3f] shadow-lg shadow-green-900/10 transition transform hover:-translate-y-1">
            Browse Jobs
          </Link>
          <button className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-gray-600 bg-white hover:bg-gray-50 hover:text-[#06402B] border border-gray-200 transition transform hover:-translate-y-1">
            Create Profile
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 backdrop-blur-sm">
            <div className="text-[#06402B] text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Matching</h3>
            <p className="text-gray-500 text-sm">We match you with jobs that perfectly fit your skills and availability.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 backdrop-blur-sm">
            <div className="text-green-700 text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">1-Click Apply</h3>
            <p className="text-gray-500 text-sm">Apply instantly to multiple opportunities once your profile is set up.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 backdrop-blur-sm">
            <div className="text-yellow-400 text-3xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Trusted Network</h3>
            <p className="text-gray-500 text-sm">Review employers and see their trust scores before you commit.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
