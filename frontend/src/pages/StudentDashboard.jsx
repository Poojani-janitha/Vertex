import { useState, useEffect } from 'react';
import api from '../api/axios';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab State: 'overview' | 'profile' | 'jobs'
  const [activeTab, setActiveTab] = useState('overview');

  // Profile Form states
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

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
    const fetchData = async () => {
      try {
        const [profileRes, appsRes, availabilityRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/applications/my-applications'),
          api.get('/availabilities/my-availability')
        ]);
        
        setProfile(profileRes.data);
        setApplications(appsRes.data);
        
        // Pre-fill profile form
        setBio(profileRes.data.profile?.bio || '');
        setSkills(profileRes.data.profile?.skills || '');

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
        setError('Failed to load dashboard data. Make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAvailabilityChange = (dayIndex, field, value) => {
    setAvailability(prev => prev.map((item, idx) => {
      if (idx === dayIndex) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleUpdateProfileAndAvailability = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateMessage(null);
    try {
      // 1. Save profile details (bio & skills)
      const profilePromise = api.put('/profiles/my-profile', {
        bio,
        skills
      });

      // 2. Save availability list (format times if checked)
      const formattedAvailability = availability.map(item => ({
        dayOfWeek: item.dayOfWeek,
        startTime: item.isAvailable ? item.startTime : null,
        endTime: item.isAvailable ? item.endTime : null,
        isAvailable: item.isAvailable
      }));
      const availabilityPromise = api.put('/availabilities/my-availability', formattedAvailability);

      const [profileRes, availabilityRes] = await Promise.all([profilePromise, availabilityPromise]);

      // Update local profile state
      setProfile({
        ...profile,
        profile: profileRes.data
      });

      // Re-merge saved availability in state
      const dbAvail = availabilityRes.data;
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

      setUpdateMessage({ type: 'success', text: 'Profile and availability updated successfully!' });
    } catch (err) {
      setUpdateMessage({ type: 'error', text: 'Failed to update schedule/profile. Please try again.' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  const sidebarButtonClass = (tabName) => {
    return `w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 ${
      activeTab === tabName
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[70vh]">
      {/* Sidebar Panel */}
      <div className="w-full md:w-64 bg-gray-800 rounded-2xl border border-gray-700 p-4 space-y-2 h-fit animate-fade-in">
        <div className="px-4 py-3 border-b border-gray-700 mb-4">
          <div className="font-bold text-white text-lg">{profile?.name}</div>
          <div className="text-xs text-gray-500">Student Account</div>
        </div>

        <button 
          onClick={() => setActiveTab('overview')} 
          className={sidebarButtonClass('overview')}
        >
          <span>📊</span>
          <span>Dashboard Overview</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')} 
          className={sidebarButtonClass('profile')}
        >
          <span>👤</span>
          <span>Edit Profile</span>
        </button>

        <button 
          onClick={() => setActiveTab('jobs')} 
          className={sidebarButtonClass('jobs')}
        >
          <span>💼</span>
          <span>Registered Jobs</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 p-8 rounded-xl border border-gray-700/50">
              <h1 className="text-3xl font-extrabold text-white mb-2">Welcome back, {profile?.name}!</h1>
              <p className="text-gray-300">
                You have applied to <strong className="text-blue-400">{applications.length}</strong> jobs. Keep your profile and free slots updated to stand out to employers!
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-750">
                <div className="text-gray-400 text-sm mb-1">Total Applications</div>
                <div className="text-4xl font-extrabold text-white">{applications.length}</div>
              </div>
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-750">
                <div className="text-gray-400 text-sm mb-1">Approved Jobs</div>
                <div className="text-4xl font-extrabold text-green-400">
                  {applications.filter(a => a.status === 'accepted').length}
                </div>
              </div>
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-750">
                <div className="text-gray-400 text-sm mb-1">Available Days</div>
                <div className="text-4xl font-extrabold text-blue-400">
                  {availability.filter(a => a.isAvailable).length} / 7
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-750">
              <h3 className="text-lg font-bold text-white mb-3">💡 Quick Student Tips</h3>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-2">
                <li>Make sure your bio lists your current university course and graduation year.</li>
                <li>Add comma-separated skills in the Profile tab to match automatically with recruiters.</li>
                <li>Set your free time slots accurately in the Profile tab so employers can verify your schedule.</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold text-white mb-2">Edit Your Profile</h2>
            <p className="text-gray-400 mb-8">Update your professional details and weekly availability schedule.</p>
            
            <form onSubmit={handleUpdateProfileAndAvailability} className="space-y-6">
              {updateMessage && (
                <div className={`p-4 rounded-lg text-sm border ${
                  updateMessage.type === 'success' ? 'bg-green-900/30 text-green-300 border-green-800' : 'bg-red-900/30 text-red-300 border-red-800'
                }`}>
                  {updateMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input 
                    type="text" 
                    disabled 
                    value={profile?.email || ''} 
                    className="w-full bg-gray-900 text-gray-500 border border-gray-700 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    disabled 
                    value={profile?.phone || 'Not provided'} 
                    className="w-full bg-gray-900 text-gray-500 border border-gray-700 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Professional Bio</label>
                <textarea 
                  rows="5"
                  placeholder="Tell employers about yourself, what you study, and your career goals..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-semibold">Your Skills</label>
                <input 
                  type="text" 
                  placeholder="React, Tailwind CSS, Python, SQL (comma-separated)"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
                />
                <span className="text-xs text-gray-500 mt-2 block">Employers use these keywords to search for applicants.</span>
              </div>

              {/* Availability Schedule Section */}
              <div className="pt-6 border-t border-gray-700">
                <h3 className="text-xl font-bold text-white mb-2">Weekly Availability Schedule</h3>
                <p className="text-sm text-gray-400 mb-6">Select the days and specific times you are available for work.</p>
                
                <div className="space-y-3">
                  {availability.map((item, idx) => (
                    <div key={item.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-900/30 p-4 rounded-xl border border-gray-700/50 gap-4 transition-all duration-200">
                      <label className="flex items-center space-x-3 cursor-pointer sm:w-28">
                        <input 
                          type="checkbox"
                          checked={item.isAvailable}
                          onChange={(e) => handleAvailabilityChange(idx, 'isAvailable', e.target.checked)}
                          className="form-checkbox text-blue-500 rounded focus:ring-blue-500 bg-gray-800 border-gray-700 h-5 w-5 cursor-pointer"
                        />
                        <span className={`font-semibold ${item.isAvailable ? 'text-white' : 'text-gray-500'}`}>{item.dayOfWeek}</span>
                      </label>

                      <div className="flex items-center gap-2 flex-grow sm:justify-end">
                        <input 
                          type="time"
                          disabled={!item.isAvailable}
                          value={item.startTime}
                          onChange={(e) => handleAvailabilityChange(idx, 'startTime', e.target.value)}
                          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-20 disabled:cursor-not-allowed"
                        />
                        <span className="text-gray-500 text-sm">to</span>
                        <input 
                          type="time"
                          disabled={!item.isAvailable}
                          value={item.endTime}
                          onChange={(e) => handleAvailabilityChange(idx, 'endTime', e.target.value)}
                          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-20 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition transform hover:-translate-y-0.5 shadow-lg shadow-blue-500/20"
              >
                {updating ? 'Saving Changes...' : 'Save Profile & Schedule'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Registered Jobs</h2>
            <p className="text-gray-400 mb-8">Track applications and status updates for your registered jobs.</p>
            
            {applications.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-700 border-dashed">
                <div className="text-gray-600 text-5xl mb-4">💼</div>
                <h3 className="text-xl font-medium text-gray-300">No registered jobs</h3>
                <p className="text-gray-500 mt-2">Go to the Jobs Board to apply for positions.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4">Job Title</th>
                      <th className="px-6 py-4">Pay</th>
                      <th className="px-6 py-4">Applied Date</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">{app.job?.title || 'Unknown Job'}</td>
                        <td className="px-6 py-4 text-green-400 font-medium">${app.job?.payAmount || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-400">
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                            app.status === 'accepted' ? 'bg-green-900/50 text-green-400 border-green-800' :
                            app.status === 'rejected' ? 'bg-red-900/50 text-red-400 border-red-800' :
                            'bg-yellow-900/50 text-yellow-400 border-yellow-800'
                          }`}>
                            {app.status || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
