import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

// Import subviews
import Overview from './views/Overview';
import ProfileSettings from './views/ProfileSettings';
import AppliedJobs from './views/AppliedJobs';
import Messages from './views/Messages';

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  // Data States
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab State: 'dashboard' | 'profile' | 'jobs' | 'messages'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Availability Schedule state (Default initialized for Mon-Sun)
  const defaultDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [availability, setAvailability] = useState(
    defaultDays.map(day => ({
      dayOfWeek: day,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: false
    }))
  );

  useEffect(() => {
    // Check local storage for initial check
    const userString = localStorage.getItem('user');
    if (!userString) {
      navigate('/login');
      return;
    }
    const loggedUser = JSON.parse(userString);
    if (loggedUser.role !== 'student') {
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, appsRes, availabilityRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/applications/my-applications'),
        api.get('/availabilities/my-availability')
      ]);
      
      setUser(userRes.data);
      setProfile(userRes.data.profile);
      setApplications(appsRes.data);

      // Merge DB availability into state
      const dbAvail = availabilityRes.data;
      if (dbAvail && dbAvail.length > 0) {
        setAvailability(prev => prev.map(defaultDay => {
          const matched = dbAvail.find(item => item.dayOfWeek === defaultDay.dayOfWeek);
          if (matched) {
            return {
              ...defaultDay,
              startTime: matched.startTime ? matched.startTime.substring(0, 5) : '09:00',
              endTime: matched.endTime ? matched.endTime.substring(0, 5) : '17:00',
              isAvailable: matched.isAvailable
            };
          }
          return defaultDay;
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile, updatedAvailability) => {
    setProfile(updatedProfile);
    
    // Re-merge saved availability in state
    if (updatedAvailability && updatedAvailability.length > 0) {
      setAvailability(prev => prev.map(defaultDay => {
        const matched = updatedAvailability.find(item => item.dayOfWeek === defaultDay.dayOfWeek);
        if (matched) {
          return {
            ...defaultDay,
            startTime: matched.startTime ? matched.startTime.substring(0, 5) : '09:00',
            endTime: matched.endTime ? matched.endTime.substring(0, 5) : '17:00',
            isAvailable: matched.isAvailable
          };
        }
        return defaultDay;
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get initials for profile picture
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0e131f]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-xl shadow-lg text-center animate-fade-in">
          <h3 className="font-bold text-lg mb-2">Access Restrict</h3>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const sidebarButtonClass = (tabName) => {
    return `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
      activeTab === tabName
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;
  };

  return (
    <div className="flex h-screen bg-[#0b0e17] text-gray-200 overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#111726] border-r border-gray-800 flex flex-col h-full shrink-0 select-none">
        
        {/* Brand Logo header */}
        <div className="h-16 px-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">W</div>
          <span className="text-lg font-bold text-white tracking-wider">WorkOra Student</span>
        </div>

        {/* Sidebar Nav content */}
        <div className="flex-grow overflow-y-auto px-4 py-6 space-y-6">
          
          {/* MAIN MENU */}
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Main</div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={sidebarButtonClass('dashboard')}
              >
                <span className="text-base">📊</span>
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={sidebarButtonClass('jobs')}
              >
                <span className="text-base">💼</span>
                Registered Jobs
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={sidebarButtonClass('messages')}
              >
                <span className="text-base">💬</span>
                Messages
              </button>
            </nav>
          </div>

          {/* TOOLS */}
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Tools</div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={sidebarButtonClass('profile')}
              >
                <span className="text-base">👤</span> Profile Settings
              </button>
            </nav>
          </div>

        </div>

        {/* BOTTOM USER PROFILE CARD */}
        <div className="p-4 border-t border-gray-800 bg-[#0d121e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-inner">
              {getInitials(user?.name)}
            </div>
            <div>
              <div className="text-xs font-bold text-white truncate max-w-[120px]">{user?.name}</div>
              <div className="text-[10px] text-gray-500 capitalize">Student</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400 transition"
          >
            ❌
          </button>
        </div>

      </aside>

      {/* RIGHT WORKSPACE */}
      <main className="flex-grow flex flex-col h-full overflow-hidden">
        
        {/* TOP STATUS BAR */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#111726]/40 shrink-0">
          
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            Good night, {user?.name.split(' ')[0]} 👋
          </h2>

          {/* Top center mock search */}
          <div className="hidden md:flex items-center w-80 relative">
            <span className="absolute left-3 text-gray-500 text-xs">🔍</span>
            <input 
              type="text" 
              placeholder="Search active applications, stats..." 
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-600"
              disabled
            />
          </div>

          {/* Top Right Wallet Widget */}
          <div className="flex items-center space-x-6">
            <div className="bg-[#121824] border border-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
              <span className="text-gray-400 font-medium">LKR Wallet:</span>
              <strong className="text-green-400">Rs 0.00</strong>
              <span className="text-[9px] text-gray-500 uppercase font-bold px-1.5 py-0.5 rounded bg-green-950/40 text-green-300">Active</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-400 text-sm">
              <button title="Notifications" className="hover:text-white">🔔</button>
              <button title="Messages" className="hover:text-white">✉</button>
            </div>
          </div>

        </header>

        {/* MAIN BODY CONTAINER */}
        <div className="flex-grow overflow-y-auto p-8 bg-[#0b0e17]">
          
          {activeTab === 'dashboard' && (
            <Overview 
              profile={profile} 
              applications={applications} 
              availability={availability} 
              onNavigateToTab={(tab) => setActiveTab(tab)} 
            />
          )}

          {activeTab === 'profile' && (
            <ProfileSettings 
              user={user}
              bio={profile?.bio || ''}
              skills={profile?.skills || ''}
              availability={availability}
              onUpdate={handleProfileUpdate}
            />
          )}

          {activeTab === 'jobs' && (
            <AppliedJobs 
              applications={applications} 
            />
          )}

          {activeTab === 'messages' && (
            <Messages />
          )}

        </div>

      </main>

    </div>
  );
};

export default StudentDashboard;
