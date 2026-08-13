import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

const Messages = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Initialize current user
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // Fetch and group messages into threads
  const fetchMessagesAndGroup = async () => {
    if (!currentUser) return;
    try {
      const response = await api.get('/messages');
      const allMessages = response.data;

      // Filter messages involving the current logged-in user
      const myMessages = allMessages.filter(
        (m) => m.senderId === currentUser.id || m.receiverId === currentUser.id
      );

      // Group messages by Participant (Other User) + Job
      const groupedThreads = {};

      myMessages.forEach((msg) => {
        const otherUser = msg.senderId === currentUser.id ? msg.receiver : msg.sender;
        const otherUserId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
        const jobId = msg.jobId;

        if (!otherUser) return; // safeguard if user was deleted

        const threadKey = `${otherUserId}-${jobId}`;

        if (!groupedThreads[threadKey]) {
          groupedThreads[threadKey] = {
            id: threadKey,
            participantId: otherUserId,
            participantName: otherUser.name,
            participantEmail: otherUser.email,
            jobId: jobId,
            jobTitle: msg.job?.title || 'General Enquiry',
            messages: []
          };
        }
        groupedThreads[threadKey].messages.push(msg);
      });

      // Convert to array and sort by the latest message in each thread
      const threadList = Object.values(groupedThreads).map(thread => {
        // Sort individual thread messages chronologically
        thread.messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
        
        // Find latest message for sorting thread order
        const latestMsg = thread.messages[thread.messages.length - 1];
        thread.latestSentAt = latestMsg ? new Date(latestMsg.sentAt) : new Date(0);
        thread.latestText = latestMsg ? latestMsg.message : '';
        return thread;
      });

      threadList.sort((a, b) => b.latestSentAt - a.latestSentAt);

      setThreads(threadList);
      
      // Keep active thread selection or set default to first thread
      if (threadList.length > 0 && !activeThreadId) {
        setActiveThreadId(threadList[0].id);
      }
    } catch (err) {
      console.error('Failed to retrieve messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMessagesAndGroup();
    }
  }, [currentUser]);

  // Periodic polling for new messages every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser) {
        fetchMessagesAndGroup();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [currentUser, activeThreadId]);

  // Get active thread details
  const activeThread = threads.find((t) => t.id === activeThreadId);

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    setSending(true);
    try {
      const response = await api.post('/messages', {
        jobId: activeThread.jobId,
        senderId: currentUser.id,
        receiverId: activeThread.participantId,
        message: replyText,
        sentAt: new Date()
      });

      setReplyText('');
      // Trigger instant reload
      await fetchMessagesAndGroup();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06402B]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg h-[600px] flex flex-col md:flex-row animate-fade-in">
      
      {/* Threads List Sidebar */}
      <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-[#06402B] text-sm">Direct Message Threads</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Approval replies and active inquiries</p>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-850">
          {threads.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">
              No messages found. Messages are automatically started when you accept/reject candidate applications.
            </div>
          ) : (
            threads.map((thread) => {
              const isSelected = activeThreadId === thread.id;
              return (
                <button
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full text-left p-4 transition flex flex-col ${
                    isSelected ? 'bg-[#06402B]/10' : 'hover:bg-gray-100/30'
                  }`}
                >
                  <div className="flex justify-between items-baseline w-full">
                    <span className="font-bold text-xs text-[#06402B] truncate max-w-[150px]">{thread.participantName}</span>
                    <span className="text-[9px] text-gray-500">
                      {new Date(thread.latestSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold truncate max-w-[200px] mt-0.5">{thread.jobTitle}</div>
                  <p className="text-[11px] text-gray-500 truncate w-full mt-2 italic">
                    {thread.latestText}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Message window */}
      <div className="flex-grow flex flex-col bg-gray-50/20">
        {activeThread ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-gray-200 bg-white/20 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-[#06402B]">{activeThread.participantName}</h4>
                <p className="text-[10px] text-gray-500">Subject: <span className="text-blue-600 font-semibold">{activeThread.jobTitle}</span></p>
              </div>
              <span className="text-[9px] bg-blue-950/40 border border-blue-900/50 text-blue-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Candidate Chat
              </span>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
              {activeThread.messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`max-w-[70%] rounded-xl px-4 py-2.5 text-xs shadow-md ${
                      isMe
                        ? 'bg-[#06402B] text-white self-end rounded-tr-none'
                        : 'bg-gray-100 text-gray-700 self-start rounded-tl-none border border-gray-200/50'
                    }`}
                  >
                    <p className="leading-relaxed break-words">{msg.message}</p>
                    <div className={`text-[8px] mt-1 text-right select-none ${
                      isMe ? 'text-blue-200' : 'text-gray-450'
                    }`}>
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Reply Box */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white/30 flex gap-2 shrink-0">
              <input
                type="text"
                required
                placeholder="Type your response to the candidate..."
                className="flex-grow bg-gray-100 border border-gray-850 text-[#06402B] rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-[#06402B]"
                value={replyText}
                onChange={(e) => setReverseState(e)} // helper target state hook
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="bg-[#06402B] hover:bg-[#0a5c3f] disabled:bg-blue-800 text-[#06402B] text-xs font-semibold px-5 py-2 rounded-lg transition"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-xs text-gray-500 p-6 text-center">
            Select a candidate message thread from the sidebar to view communication records.
          </div>
        )}
      </div>

    </div>
  );
};

export default Messages;
