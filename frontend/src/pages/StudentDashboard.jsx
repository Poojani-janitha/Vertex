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

  // Student Direct Messaging States
  const [dbMessages, setDbMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeThreadKey, setActiveThreadKey] = useState(null);
  const [chatReplyText, setChatReplyText] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  const fetchMessages = async () => {
    if (!profile) return;
    try {
      const response = await api.get('/messages');
      // Filter for messages involving this student user
      const myMsgs = response.data.filter(
        m => m.senderId === profile.id || m.receiverId === profile.id
      );
      setDbMessages(myMsgs);
    } catch (err) {
      console.error('Failed to retrieve student messages:', err);
    }
  };

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

  // Poll messages periodically
  useEffect(() => {
    if (profile) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 8000);
      return () => clearInterval(interval);
    }
  }, [profile]);

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

  const handleSendChatReply = async (e, thread) => {
    e.preventDefault();
    if (!chatReplyText.trim()) return;

    setSendingChat(true);
    try {
      await api.post('/messages', {
        jobId: thread.jobId,
        senderId: profile.id,
        receiverId: thread.otherUserId,
        message: chatReplyText,
        sentAt: new Date()
      });
      setChatReplyText('');
      fetchMessages();
    } catch (err) {
      console.error('Failed to transmit message response:', err);
    } finally {
      setSendingChat(false);
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

  // Direct messaging grouping - safeguarded against profile === null
  const groupedThreads = {};
  if (profile) {
    dbMessages.forEach((msg) => {
      const otherUser = msg.senderId === profile.id ? msg.receiver : msg.sender;
      const otherUserId = msg.senderId === profile.id ? msg.receiverId : msg.senderId;
      const jobId = msg.jobId;
      if (!otherUser) return;

      const key = `${otherUserId}-${jobId}`;
      if (!groupedThreads[key]) {
        groupedThreads[key] = {
          key,
          otherUserId,
          otherUserName: otherUser.name,
          jobId,
          jobTitle: msg.job?.title || 'General Inquiry',
          messages: []
        };
      }
      groupedThreads[key].messages.push(msg);
    });
  }

  const threadsList = Object.values(groupedThreads).map(thread => {
    thread.messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
    const latest = thread.messages[thread.messages.length - 1];
    thread.latestText = latest ? latest.message : '';
    thread.latestTime = latest ? new Date(latest.sentAt) : new Date(0);
    return thread;
  });

  threadsList.sort((a, b) => b.latestTime - a.latestTime);

  // Unread messages count (total messages received by this student) - safeguarded
  const receivedMessagesCount = profile 
    ? dbMessages.filter(m => m.receiverId === profile.id).length 
    : 0;

  const sidebarButtonClass = (tabName) => {
    return `w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-3 ${
      activeTab === tabName
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[70vh] relative">
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
      <div className="flex-grow bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-xl">
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

      {/* FLOATING DIRECT MESSAGE OVERLAY SYSTEM */}
      {profile && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {isChatOpen && (
            <div className="bg-[#121824] border border-gray-800 w-80 sm:w-96 h-[480px] rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-fade-in text-xs">
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-800 bg-[#111726] flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white">Student Message Box</h4>
                  <p className="text-[9px] text-gray-500">Chats with employer representatives</p>
                </div>
                <button 
                  onClick={() => {
                    setIsChatOpen(false);
                    setActiveThreadKey(null);
                  }} 
                  className="text-gray-400 hover:text-white font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0">
                {activeThreadKey ? (
                  // Inside Thread view
                  (() => {
                    const thread = threadsList.find(t => t.key === activeThreadKey);
                    if (!thread) return null;
                    return (
                      <div className="flex flex-col h-full min-h-0">
                        <button 
                          type="button"
                          onClick={() => setActiveThreadKey(null)}
                          className="text-blue-400 hover:text-blue-300 font-bold mb-3 flex items-center gap-1 text-[10px] cursor-pointer"
                        >
                          ← Back to inbox
                        </button>
                        <div className="bg-gray-900 border border-gray-850 p-2.5 rounded-lg mb-3 shrink-0">
                          <div className="font-bold text-white text-xs">{thread.otherUserName}</div>
                          <div className="text-[10px] text-blue-400 font-semibold">{thread.jobTitle}</div>
                        </div>

                        {/* Chat Bubbles */}
                        <div className="flex-grow overflow-y-auto space-y-3 mb-3 pr-1 min-h-0 flex flex-col">
                          {thread.messages.map(msg => {
                            const isMe = msg.senderId === profile.id;
                            return (
                              <div 
                                key={msg.id}
                                className={`max-w-[75%] rounded-xl px-3 py-2 text-[11px] leading-relaxed shadow-sm ${
                                  isMe 
                                    ? 'bg-blue-600 text-white self-end rounded-tr-none' 
                                    : 'bg-gray-800 text-gray-200 self-start rounded-tl-none border border-gray-700/50'
                                }`}
                              >
                                <p className="break-words">{msg.message}</p>
                                <div className={`text-[7px] text-right mt-1 ${isMe ? 'text-blue-200' : 'text-gray-500'}`}>
                                  {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Send reply form */}
                        <form onSubmit={(e) => handleSendChatReply(e, thread)} className="flex gap-2 border-t border-gray-800 pt-3 shrink-0">
                          <input
                            type="text"
                            required
                            placeholder="Type reply to employer..."
                            className="flex-grow bg-gray-900 border border-gray-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                            value={chatReplyText}
                            onChange={(e) => setChatReplyText(e.target.value)}
                          />
                          <button
                            type="submit"
                            disabled={sendingChat || !chatReplyText.trim()}
                            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold px-3 py-1.5 rounded-lg transition text-[10px]"
                          >
                            {sendingChat ? '...' : 'Send'}
                          </button>
                        </form>
                      </div>
                    );
                  })()
                ) : (
                  // Thread Inbox list view
                  <div className="space-y-2 flex-grow overflow-y-auto">
                    {threadsList.length === 0 ? (
                      <div className="text-center text-gray-500 py-16 px-4">
                        No message history found. Notification threads open automatically when an employer updates application status.
                      </div>
                    ) : (
                      threadsList.map(thread => (
                        <button
                          key={thread.key}
                          onClick={() => setActiveThreadKey(thread.key)}
                          className="w-full text-left p-3 rounded-lg bg-gray-900 border border-gray-850 hover:bg-gray-800/50 transition flex flex-col gap-1 cursor-pointer"
                        >
                          <div className="flex justify-between items-baseline w-full">
                            <span className="font-bold text-white truncate max-w-[150px]">{thread.otherUserName}</span>
                            <span className="text-[8px] text-gray-500">
                              {thread.latestTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-[10px] text-blue-400 font-semibold truncate max-w-[200px]">{thread.jobTitle}</div>
                          <p className="text-[10px] text-gray-400 truncate w-full italic mt-1">{thread.latestText}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FLOATING BLUE CHAT ENVELOPE BUTTON */}
          <button
            type="button"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-4 shadow-2xl relative flex items-center justify-center transition-transform hover:scale-105 cursor-pointer z-50 focus:outline-none"
          >
            <span className="text-xl">💬</span>
            {receivedMessagesCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-800">
                {receivedMessagesCount}
              </span>
            )}
          </button>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
