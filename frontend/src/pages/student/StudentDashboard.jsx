import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

// Import subviews
import Overview from './views/Overview';
import ProfileSettings from './views/ProfileSettings';
import AppliedJobs from './views/AppliedJobs';
import Messages from './views/Messages';
import RelatedJobs from './views/RelatedJobs';
import Reviews from './views/Reviews';

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  // Data States
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [reviewedJobIds, setReviewedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab State: 'dashboard' | 'profile' | 'jobs' | 'messages'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Emergency State
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState(null);
  const [triggeringEmergency, setTriggeringEmergency] = useState(false);

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
    if (!user) return;
    try {
      const response = await api.get('/messages');
      // Filter for messages involving this student user
      const myMsgs = response.data.filter(
        m => m.senderId === user.id || m.receiverId === user.id
      );
      setDbMessages(myMsgs);
    } catch (err) {
      console.error('Failed to retrieve student messages:', err);
    }
  };

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
      const [userRes, appsRes, availabilityRes, reviewsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/applications/my-applications'),
        api.get('/availabilities/my-availability'),
        api.get('/reviews')
      ]);
      
      setUser(userRes.data);
      setProfile(userRes.data.profile);
      setApplications(appsRes.data);

      // Filter reviews by this student to know which jobs they already reviewed
      const myReviews = reviewsRes.data.filter(r => r.fromUser === userRes.data.id);
      const dbReviewed = myReviews.map(r => r.jobId);
      setReviewedJobIds(dbReviewed);

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

  // Poll messages periodically
  useEffect(() => {
    if (user) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 8000);
      return () => clearInterval(interval);
    }
  }, [user]);

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

  const handleTriggerEmergency = async () => {
    setTriggeringEmergency(true);
    setEmergencyStatus(null);
    try {
      await api.post('/emergencies');
      setEmergencyStatus({ type: 'success', text: 'Emergency alert sent to Admin!' });
      setTimeout(() => {
        setShowEmergencyModal(false);
        setEmergencyStatus(null);
      }, 3000);
    } catch (err) {
      setEmergencyStatus({ type: 'error', text: err.response?.data?.message || 'Failed to send emergency alert.' });
    } finally {
      setTriggeringEmergency(false);
    }
  };

  const handleSendChatReply = async (e, thread) => {
    e.preventDefault();
    if (!chatReplyText.trim()) return;

    setSendingChat(true);
    try {
      await api.post('/messages', {
        jobId: thread.jobId,
        senderId: user.id,
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

  // Direct messaging grouping - safeguarded against user === null
  const groupedThreads = {};
  if (user) {
    dbMessages.forEach((msg) => {
      const otherUser = msg.senderId === user.id ? msg.receiver : msg.sender;
      const otherUserId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
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
  const receivedMessagesCount = user 
    ? dbMessages.filter(m => m.receiverId === user.id).length 
    : 0;

  const sidebarButtonClass = (tabName) => {
    return `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
      activeTab === tabName
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;
  };

  return (
    <div className="flex h-screen bg-[#0b0e17] text-gray-200 overflow-hidden font-sans relative">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#111726] border-r border-gray-800 flex flex-col h-full shrink-0 select-none">
        
        {/* Brand Logo header */}
        <Link to="/" className="h-16 px-6 border-b border-gray-800 flex items-center gap-3 hover:bg-gray-850 transition-colors cursor-pointer select-none">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg shrink-0">W</div>
          <span className="text-lg font-bold text-white tracking-wider truncate">WorkOra Student</span>
        </Link>

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
                My Jobs
              </button>
              <button
                onClick={() => setActiveTab('related-jobs')}
                className={sidebarButtonClass('related-jobs')}
              >
                <span className="text-base">🔍</span>
                Related Jobs
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={sidebarButtonClass('messages')}
              >
                <span className="text-base">💬</span>
                Messages
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={sidebarButtonClass('reviews')}
              >
                <span className="text-base">⭐</span>
                Reviews
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

          {/* EMERGENCY ALERT */}
          <div className="mt-8 px-2">
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="w-full flex justify-center items-center gap-2 bg-red-900/40 hover:bg-red-600 text-red-200 hover:text-white border border-red-800/50 hover:border-red-500 transition-colors py-3 rounded-xl shadow-lg shadow-red-900/20 font-bold text-sm tracking-wide"
            >
              🚨 EMERGENCY
            </button>
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
              reviewedJobIds={reviewedJobIds}
              user={user}
              onReviewSubmitted={fetchDashboardData}
            />
          )}

          {activeTab === 'related-jobs' && (
            <RelatedJobs 
              user={user}
              profile={profile}
              applications={applications}
              onApplicationSubmitted={fetchDashboardData}
            />
          )}

          {activeTab === 'messages' && (
            <Messages />
          )}

          {activeTab === 'reviews' && (
            <Reviews user={user} />
          )}

        </div>

      </main>

      {/* FLOATING DIRECT MESSAGE OVERLAY SYSTEM */}
      {user && (
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
                            const isMe = msg.senderId === user.id;
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

      {/* EMERGENCY MODAL */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1a0f14] border border-red-900/50 rounded-2xl max-w-sm w-full shadow-2xl shadow-red-900/20 overflow-hidden transform transition-all scale-100">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-800">
                <span className="text-3xl">🚨</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Trigger Emergency?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This will immediately alert the administration with your details and location. Only use in true emergencies.
              </p>
              
              {emergencyStatus && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${emergencyStatus.type === 'success' ? 'bg-green-900/40 text-green-400 border border-green-800' : 'bg-red-900/40 text-red-400 border border-red-800'}`}>
                  {emergencyStatus.text}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  disabled={triggeringEmergency}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTriggerEmergency}
                  disabled={triggeringEmergency}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition shadow-lg shadow-red-600/30 disabled:opacity-50 flex items-center justify-center"
                >
                  {triggeringEmergency ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Confirm Alert'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
